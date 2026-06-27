import type {
  AnalysisResult,
  CategoricalTopValue,
  ParsedCsv,
  VisualBlock,
} from "@/lib/data-studio/types"
import { pickBestCategoryColumn } from "@/lib/data-studio/columns"
import { isMissing, parseNumeric } from "@/lib/data-studio/values"

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length)
  if (n < 3) return 0
  const mx = xs.reduce((a, b) => a + b, 0) / n
  const my = ys.reduce((a, b) => a + b, 0) / n
  let num = 0
  let dx = 0
  let dy = 0
  for (let i = 0; i < n; i++) {
    const vx = xs[i] - mx
    const vy = ys[i] - my
    num += vx * vy
    dx += vx * vx
    dy += vy * vy
  }
  if (dx === 0 || dy === 0) return 0
  return num / Math.sqrt(dx * dy)
}

function topCategories(
  rows: Record<string, string>[],
  column: string,
  limit = 6,
): CategoricalTopValue[] {
  const counts = new Map<string, number>()
  for (const row of rows) {
    const v = row[column]
    if (isMissing(v)) continue
    const key = v.trim()
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([value, count]) => ({ value, count }))
}

function samplePairs(
  rows: Record<string, string>[],
  xCol: string,
  yCol: string,
  max = 120,
): Array<{ x: number; y: number }> {
  const out: Array<{ x: number; y: number }> = []
  for (const row of rows) {
    const x = parseNumeric(row[xCol] ?? "")
    const y = parseNumeric(row[yCol] ?? "")
    if (x === null || y === null) continue
    out.push({ x, y })
    if (out.length >= max) break
  }
  return out
}

function trendPointsAggregated(
  rows: Record<string, string>[],
  dateCol: string,
  metricCol: string,
): Array<{ label: string; value: number; count: number }> {
  const buckets = new Map<string, number[]>()
  for (const row of rows) {
    const d = (row[dateCol] ?? "").trim()
    const m = parseNumeric(row[metricCol] ?? "")
    if (!d || m === null) continue
    const arr = buckets.get(d) ?? []
    arr.push(m)
    buckets.set(d, arr)
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([date, vals]) => ({
      label: date.slice(0, 10),
      value: mean(vals),
      count: vals.length,
    }))
}

function pickRentMetric(numericNames: string[]): string | null {
  return (
    numericNames.find((n) => n.toLowerCase().includes("asking")) ??
    numericNames.find((n) => n.toLowerCase().includes("signed")) ??
    numericNames.find((n) => n.toLowerCase().includes("rent")) ??
    numericNames[0] ??
    null
  )
}

export function buildVisualBoard(
  parsed: ParsedCsv,
  analysis: Pick<
    AnalysisResult,
    | "missingnessByColumn"
    | "numericSummaries"
    | "categoricalObservations"
    | "comparison"
    | "histogram"
    | "profile"
    | "columnProfiles"
  >,
): VisualBlock[] {
  const blocks: VisualBlock[] = []
  let id = 0
  const bid = () => `vis-${++id}`
  const rowCount = analysis.profile.rowCount

  const missingRows = analysis.missingnessByColumn.slice(0, 8)
  if (missingRows.length > 0) {
    blocks.push({
      id: bid(),
      title: "Missingness",
      description: "Share of empty or sentinel values per field.",
      accent: "amber",
      kind: "missingness-bars",
      rows: missingRows.map((m) => ({
        label: m.column,
        value: m.missingRate * 100,
      })),
    })
  }

  if (analysis.numericSummaries.length > 0) {
    const sorted = [...analysis.numericSummaries].sort((a, b) => {
      const score = (col: string) => {
        const n = col.toLowerCase()
        if (n.includes("asking") || n.includes("signed") || n.includes("rent"))
          return 3
        if (n.includes("lead") || n.includes("application")) return 2
        return 1
      }
      return score(b.column) - score(a.column)
    })
    blocks.push({
      id: bid(),
      title: "Numeric summary",
      description: "Deterministic counts and spread; invalid values excluded.",
      accent: "slate",
      kind: "numeric-table",
      rows: sorted.slice(0, 6),
      totalNumericCount: sorted.length,
    })
  }

  const catCol = pickBestCategoryColumn(analysis.columnProfiles, rowCount)
  if (catCol) {
    const tops = topCategories(parsed.rows, catCol)
    if (tops.length > 0) {
      blocks.push({
        id: bid(),
        title: `Categories: ${catCol}`,
        description: "Top values by row count after cleaning.",
        accent: "sage",
        kind: "categorical-table",
        column: catCol,
        rows: tops,
      })
    }
  }

  if (analysis.histogram && analysis.histogram.bins.length > 0) {
    blocks.push({
      id: bid(),
      title: `Distribution: ${analysis.histogram.column}`,
      description: "Histogram of the numeric field with the widest spread.",
      accent: "slate",
      kind: "histogram",
      column: analysis.histogram.column,
      bins: analysis.histogram.bins,
    })
  }

  if (analysis.comparison) {
    blocks.push({
      id: bid(),
      title: `Mean ${analysis.comparison.metricColumn} by ${analysis.comparison.groupingColumn}`,
      description: "Grouped means for the selected comparison.",
      accent: "sage",
      caution:
        analysis.comparison.readiness === "usable-with-caution" ||
        analysis.comparison.readiness === "exploratory"
          ? "This comparison is useful, but should be read with caution."
          : "Descriptive group means only. This does not prove cause and effect.",
      kind: "grouped-bars",
      rows: analysis.comparison.groupedAverages.map((g) => ({
        label: g.group,
        value: g.value,
      })),
    })
  }

  const numericNames = analysis.profile.numericColumns
  const rentA = numericNames.find((n) => n.toLowerCase().includes("asking"))
  const rentB = numericNames.find((n) => n.toLowerCase().includes("signed"))
  if (rentA && rentB) {
    const points = samplePairs(parsed.rows, rentA, rentB)
    if (points.length >= 6) {
      blocks.push({
        id: bid(),
        title: `Scatter: ${rentA} × ${rentB}`,
        description: "Pairwise rent relationship (sampled points).",
        accent: "slate",
        caution:
          "Strong correlation may reflect mix and concessions; not causal.",
        kind: "scatter",
        xColumn: rentA,
        yColumn: rentB,
        points,
      })
    }
  }

  const dateCol = analysis.profile.dateLikeColumns[0]
  const trendMetric = pickRentMetric(numericNames)
  if (dateCol && trendMetric) {
    const points = trendPointsAggregated(parsed.rows, dateCol, trendMetric)
    if (points.length >= 3) {
      blocks.push({
        id: bid(),
        title: `Mean ${trendMetric} by ${dateCol}`,
        description: "One aggregated value per period (mean of valid rows).",
        accent: "slate",
        caution:
          "Descriptive trend only; not adjusted for unit mix or property mix.",
        kind: "trend",
        dateColumn: dateCol,
        metricColumn: trendMetric,
        statistic: "mean",
        points,
      })
    }
  }

  if (numericNames.length >= 2) {
    const cols = numericNames.slice(0, 4)
    const matrix: number[][] = cols.map(() => cols.map(() => 0))
    const series = cols.map((col) =>
      parsed.rows
        .map((r) => parseNumeric(r[col] ?? ""))
        .filter((n): n is number => n !== null),
    )
    for (let i = 0; i < cols.length; i++) {
      for (let j = 0; j < cols.length; j++) {
        const len = Math.min(series[i].length, series[j].length)
        matrix[i][j] =
          i === j
            ? 1
            : pearson(series[i].slice(0, len), series[j].slice(0, len))
      }
    }
    blocks.push({
      id: bid(),
      title: "Correlation matrix",
      description: "Pearson correlation between numeric fields (computed locally).",
      accent: "ink",
      caution: "Descriptive only; not adjusted for sample size or structure.",
      kind: "correlation-matrix",
      columns: cols,
      matrix,
    })
  }

  return blocks.slice(0, 7)
}
