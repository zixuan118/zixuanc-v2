import type {
  CleaningExample,
  CleaningSummary,
  ColumnKind,
  ParsedCsv,
} from "@/lib/data-studio/types"
import {
  cleaningExamplePriority,
  isEligibleForCategoryNormalization,
  isFreeTextColumnName,
  isIdentifierColumnName,
} from "@/lib/data-studio/columns"
import {
  isEmptySentinel,
  isMissing,
  looksLikeIsoDate,
  normalizeCategoryDisplay,
  normalizeCategoryKey,
  parseDateLike,
  parseNumeric,
} from "@/lib/data-studio/values"

const MAX_EXAMPLES = 12

function inferRawColumnKind(values: string[]): ColumnKind {
  const n = Math.max(values.length, 1)
  const nonMissing = values.filter((v) => !isMissing(v))
  const nonMissingRate = nonMissing.length / n
  if (nonMissingRate < 0.2) return "mostly-empty"

  const parseable =
    nonMissing.filter((v) => parseNumeric(v) !== null).length /
    Math.max(nonMissing.length, 1)
  if (parseable >= 0.82) return "numeric"

  const dateRate =
    nonMissing.filter((v) => parseDateLike(v) !== null || looksLikeIsoDate(v))
      .length / Math.max(nonMissing.length, 1)
  if (dateRate >= 0.75) return "date-like"

  return "categorical"
}

function countRawDuplicates(rows: Record<string, string>[], headers: string[]) {
  const seen = new Set<string>()
  let dup = 0
  for (const row of rows) {
    const key = headers.map((h) => (row[h] ?? "").trim()).join("||")
    if (seen.has(key)) dup += 1
    seen.add(key)
  }
  return dup
}

function columnStats(values: string[]) {
  const nonMissing = values.filter((v) => !isMissing(v))
  const unique = new Set(nonMissing.map((v) => v.trim())).size
  return { nonMissingCount: nonMissing.length, uniqueCount: unique }
}

function buildCanonicalCategoryMaps(
  rows: Record<string, string>[],
  headers: string[],
  columnKinds: Map<string, ColumnKind>,
  rowCount: number,
): Map<string, Map<string, string>> {
  const columnMaps = new Map<string, Map<string, string>>()

  for (const header of headers) {
    const rawValues = rows.map((r) => r[header] ?? "")
    const kind = columnKinds.get(header) ?? "categorical"
    const { uniqueCount } = columnStats(rawValues)
    if (
      !isEligibleForCategoryNormalization({
        columnName: header,
        kind,
        uniqueCount,
        rowCount,
      })
    )
      continue

    const freq = new Map<string, Map<string, number>>()
    for (const raw of rawValues) {
      if (isMissing(raw)) continue
      const key = normalizeCategoryKey(raw)
      const display = normalizeCategoryDisplay(raw)
      if (!freq.has(key)) freq.set(key, new Map())
      const inner = freq.get(key)!
      inner.set(display, (inner.get(display) ?? 0) + 1)
    }

    const canonical = new Map<string, string>()
    for (const [key, displays] of freq) {
      let best = key
      let bestCount = -1
      for (const [display, count] of displays) {
        if (count > bestCount) {
          bestCount = count
          best = display
        }
      }
      canonical.set(key, best)
    }
    columnMaps.set(header, canonical)
  }

  return columnMaps
}

function sortExamples(examples: CleaningExample[]): CleaningExample[] {
  return [...examples]
    .sort((a, b) => {
      const pa = cleaningExamplePriority(a.column, a.operation)
      const pb = cleaningExamplePriority(b.column, b.operation)
      if (pb !== pa) return pb - pa
      return a.column.localeCompare(b.column)
    })
    .slice(0, MAX_EXAMPLES)
}

function bumpExample(
  examples: CleaningExample[],
  counts: Map<string, number>,
  example: CleaningExample,
) {
  const sig = `${example.column}::${example.rawValue}::${example.cleanedValue}::${example.operation}`
  const c = (counts.get(sig) ?? 0) + 1
  counts.set(sig, c)
  const existing = examples.find(
    (e) =>
      e.column === example.column &&
      e.rawValue === example.rawValue &&
      e.cleanedValue === example.cleanedValue &&
      e.operation === example.operation,
  )
  if (existing) {
    existing.count = c
    return
  }
  examples.push({ ...example, count: 1 })
}

export function cleanDataset(raw: ParsedCsv): {
  cleaned: ParsedCsv
  cleaning: CleaningSummary
} {
  const headers = raw.headers.map((h) => h.trim())
  const rawRowCount = raw.rows.length
  const warnings: string[] = []

  let cellsTrimmed = 0
  let emptySentinelsNormalized = 0
  let categoryValuesNormalized = 0
  let invalidNumericValuesConverted = 0

  const trimmedRows: Record<string, string>[] = raw.rows.map((row) => {
    const out: Record<string, string> = {}
    for (let i = 0; i < headers.length; i++) {
      const h = headers[i]
      const rawHeader = raw.headers[i]
      const before = row[rawHeader] ?? row[h] ?? ""
      const after = before.trim()
      if (before !== after) cellsTrimmed += 1
      out[h] = after
    }
    return out
  })

  const rawDuplicateRowCount = countRawDuplicates(trimmedRows, headers)

  const columnKinds = new Map<string, ColumnKind>()
  for (const h of headers) {
    columnKinds.set(
      h,
      inferRawColumnKind(trimmedRows.map((r) => r[h] ?? "")),
    )
  }

  const categoryMaps = buildCanonicalCategoryMaps(
    trimmedRows,
    headers,
    columnKinds,
    rawRowCount,
  )
  const examples: CleaningExample[] = []
  const exampleCounts = new Map<string, number>()
  const columnsChanged = new Set<string>()

  const normalizedRows: Record<string, string>[] = trimmedRows.map((row) => {
    const out: Record<string, string> = {}
    for (const h of headers) {
      let v = row[h] ?? ""
      const kind = columnKinds.get(h) ?? "categorical"

      if (isEmptySentinel(v) && v.trim() !== "") {
        emptySentinelsNormalized += 1
        bumpExample(
          examples,
          exampleCounts,
          {
            column: h,
            rawValue: v,
            cleanedValue: "",
            count: 1,
            operation: "empty-sentinel",
          },
        )
        columnsChanged.add(h)
        v = ""
      }

      if (isMissing(v)) {
        out[h] = ""
        continue
      }

      if (kind === "date-like" || kind === "numeric") {
        if (kind === "numeric") {
          const values = trimmedRows
            .map((r) => r[h] ?? "")
            .filter((x) => !isMissing(x))
          const parseable = values.filter((x) => parseNumeric(x) !== null).length
          const rate = parseable / Math.max(values.length, 1)
          if (parseNumeric(v) === null && rate >= 0.82) {
            invalidNumericValuesConverted += 1
            bumpExample(
              examples,
              exampleCounts,
              {
                column: h,
                rawValue: v,
                cleanedValue: "",
                count: 1,
                operation: "invalid-numeric",
              },
            )
            columnsChanged.add(h)
            out[h] = ""
            continue
          }
        }
        out[h] = v
        continue
      }

      // Identifier / free-text / ineligible: trim + sentinels only
      if (
        isIdentifierColumnName(h) ||
        isFreeTextColumnName(h) ||
        !categoryMaps.has(h)
      ) {
        out[h] = v
        continue
      }

      const canonMap = categoryMaps.get(h)!
      const key = normalizeCategoryKey(v)
      const cleaned = canonMap.get(key) ?? v
      if (cleaned !== v) {
        categoryValuesNormalized += 1
        bumpExample(
          examples,
          exampleCounts,
          {
            column: h,
            rawValue: v,
            cleanedValue: cleaned,
            count: 1,
            operation: "category-normalization",
          },
        )
        columnsChanged.add(h)
      }
      out[h] = cleaned
    }
    return out
  })

  if (emptySentinelsNormalized > 0) {
    warnings.push(
      `${emptySentinelsNormalized} sentinel values (NA, null, -, etc.) were converted to missing.`,
    )
  }

  const seen = new Set<string>()
  const dedupedRows: Record<string, string>[] = []
  let duplicateRowsRemoved = 0
  for (const row of normalizedRows) {
    const key = headers.map((h) => row[h] ?? "").join("||")
    if (seen.has(key)) {
      duplicateRowsRemoved += 1
      continue
    }
    seen.add(key)
    dedupedRows.push(row)
  }

  const remainingDuplicateRowCount = countRawDuplicates(dedupedRows, headers)

  if (duplicateRowsRemoved > 0) {
    warnings.push(
      `${duplicateRowsRemoved} exact duplicate row${duplicateRowsRemoved === 1 ? "" : "s"} removed before analysis.`,
    )
  }

  const sortedExamples = sortExamples(examples)

  const cleaning: CleaningSummary = {
    rawRowCount,
    cleanedRowCount: dedupedRows.length,
    rawDuplicateRowCount,
    duplicateRowsRemoved,
    remainingDuplicateRowCount,
    cellsTrimmed,
    emptySentinelsNormalized,
    categoryValuesNormalized,
    invalidNumericValuesConverted,
    columnsChanged: [...columnsChanged],
    examples: sortedExamples,
    warnings,
  }

  return {
    cleaned: { headers, rows: dedupedRows },
    cleaning,
  }
}
