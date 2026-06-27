"use client"

import type { CleaningExample, CleaningSummary, ColumnProfile } from "@/lib/data-studio/types"
import styles from "@/components/data-studio/data-studio.module.css"

const OP_LABELS: Record<CleaningExample["operation"], string> = {
  "category-normalization": "Category normalization",
  "invalid-numeric": "Invalid numeric conversion",
  "empty-sentinel": "Empty sentinel normalization",
  trim: "Whitespace trim",
  "duplicate-removal": "Duplicate removal",
}

function metricCardClass(tone: string) {
  if (tone === "sage") return styles.dsCardSage
  if (tone === "amber") return styles.dsCardAmber
  if (tone === "terracotta") return styles.dsCardTerracotta
  return styles.dsCardPlain
}

function buildInvalidNumericRows(
  cleaning: CleaningSummary,
  columnProfiles?: ColumnProfile[],
): CleaningExample[] {
  const fromExamples = cleaning.examples.filter(
    (ex) => ex.operation === "invalid-numeric",
  )
  if (fromExamples.length > 0) return fromExamples

  if (!columnProfiles) return []

  return columnProfiles
    .filter(
      (p) =>
        p.invalidNumericValuesConverted > 0 ||
        p.invalidNumericCountBeforeCleaning > 0,
    )
    .flatMap((p) => {
      const examples = p.invalidNumericExamples.length
        ? p.invalidNumericExamples
        : ["(unknown)"]
      return examples.map((rawValue) => ({
        column: p.name,
        rawValue,
        cleanedValue: "",
        count: p.invalidNumericValuesConverted || p.invalidNumericCountBeforeCleaning,
        operation: "invalid-numeric" as const,
      }))
    })
}

export function CleaningReceipt({
  cleaning,
  columnProfiles,
}: {
  cleaning: CleaningSummary
  columnProfiles?: ColumnProfile[]
}) {
  const changed =
    cleaning.duplicateRowsRemoved > 0 ||
    cleaning.categoryValuesNormalized > 0 ||
    cleaning.invalidNumericValuesConverted > 0 ||
    cleaning.emptySentinelsNormalized > 0

  const invalidNumericRows = buildInvalidNumericRows(cleaning, columnProfiles)

  const grouped = cleaning.examples.reduce(
    (acc, ex) => {
      const key = ex.operation
      if (!acc[key]) acc[key] = []
      acc[key].push(ex)
      return acc
    },
    {} as Record<string, CleaningExample[]>,
  )

  if (invalidNumericRows.length > 0) {
    grouped["invalid-numeric"] = invalidNumericRows
  }

  const opOrder: CleaningExample["operation"][] = [
    "category-normalization",
    "invalid-numeric",
    "empty-sentinel",
    "trim",
    "duplicate-removal",
  ]

  return (
    <section>
      <p className={styles.dsSubsectionLabel}>Cleaning receipt</p>
      <p className={`${styles.dsBody} mb-2`}>
        The file was cleaned before analysis. The original file remains unchanged.
      </p>
      <p className={`${styles.dsHint} mb-4`}>
        These deterministic changes run in the browser before audit and analysis.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {[
          { label: "Rows before", value: cleaning.rawRowCount, tone: "plain" },
          { label: "Rows after", value: cleaning.cleanedRowCount, tone: "sage" },
          {
            label: "Duplicates removed",
            value: cleaning.duplicateRowsRemoved,
            tone: cleaning.duplicateRowsRemoved ? "amber" : "plain",
          },
          {
            label: "Categories normalized",
            value: cleaning.categoryValuesNormalized,
            tone: cleaning.categoryValuesNormalized ? "sage" : "plain",
          },
          {
            label: "Invalid numerics to missing",
            value: cleaning.invalidNumericValuesConverted,
            tone: cleaning.invalidNumericValuesConverted ? "terracotta" : "plain",
          },
          {
            label: "Sentinels normalized",
            value: cleaning.emptySentinelsNormalized,
            tone: cleaning.emptySentinelsNormalized ? "amber" : "plain",
          },
        ].map((m) => (
          <div
            key={m.label}
            className={`${styles.dsCard} ${metricCardClass(m.tone)}`}
          >
            <p className={styles.dsLabel}>{m.label}</p>
            <p className={`${styles.dsMetricValue} mt-1`}>
              {m.value.toLocaleString()}
            </p>
          </div>
        ))}
      </div>

      {!changed ? (
        <p className={`${styles.dsHint} mt-4`}>
          No structural cleaning changes were required beyond trimming.
        </p>
      ) : null}

      {cleaning.warnings.length > 0 ? (
        <div className={`${styles.dsBody} mt-4 space-y-1.5`}>
          {cleaning.warnings.map((w, i) => (
            <div key={i} className={styles.dsWarning}>
              {w}
            </div>
          ))}
        </div>
      ) : null}

      {Object.keys(grouped).length > 0 ? (
        <div className="mt-6 space-y-6">
          {opOrder.map((op) => {
            const rows = grouped[op]
            if (!rows || rows.length === 0) return null
            return (
              <div key={op}>
                <p className={styles.dsLabel}>{OP_LABELS[op] ?? op}</p>
                <div className={styles.dsTableWrap}>
                  <table className={styles.dsTable}>
                    <thead>
                      <tr>
                        <th>Column</th>
                        <th>Before</th>
                        <th>After</th>
                        <th>Count</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((ex, i) => (
                        <tr key={i}>
                          <td>{ex.column}</td>
                          <td>{ex.rawValue || "∅"}</td>
                          <td>{ex.cleanedValue ? ex.cleanedValue : "missing"}</td>
                          <td className="num">{ex.count}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}
