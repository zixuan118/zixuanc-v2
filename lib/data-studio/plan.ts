import type {
  AnalysisCandidate,
  ColumnProfile,
  ComparisonChoice,
  DataAuditSummary,
  NumericSummary,
  CategoricalObservation,
} from "@/lib/data-studio/types"
import { buildSelectedComparisonCopy } from "@/lib/data-studio/copy"
import { formatColumnList } from "@/lib/data-studio/values"

const HIGH_MISSING_THRESHOLD = 0.3
const MOSTLY_EMPTY_THRESHOLD = 0.8

export function buildAuditSummary(input: {
  columnProfiles: ColumnProfile[]
  missingnessByColumn: Array<{ column: string; missingRate: number }>
  categoricalObservations: CategoricalObservation[]
  numericSummaries: NumericSummary[]
}): DataAuditSummary {
  const constantColumns = input.columnProfiles
    .filter((p) => p.missingRate < 1 && p.uniqueCount <= 1)
    .map((p) => p.name)

  const emptyColumns = input.columnProfiles
    .filter((p) => p.missingRate >= 1)
    .map((p) => p.name)

  const mostlyEmptyColumns = input.columnProfiles
    .filter(
      (p) => p.missingRate >= MOSTLY_EMPTY_THRESHOLD && p.missingRate < 1,
    )
    .map((p) => p.name)

  const highMissingColumns = input.missingnessByColumn
    .filter(
      (m) =>
        m.missingRate >= HIGH_MISSING_THRESHOLD && m.missingRate < 1,
    )
    .map((m) => m.column)

  const invalidNumericSummary = input.columnProfiles
    .filter((p) => p.invalidNumericCountBeforeCleaning > 0)
    .map((p) => ({
      column: p.name,
      count: p.invalidNumericCountBeforeCleaning,
      examples: p.invalidNumericExamples,
    }))

  return {
    constantColumns,
    highMissingColumns,
    emptyColumns,
    mostlyEmptyColumns,
    dateLikeColumns: input.columnProfiles
      .filter((p) => p.kind === "date-like")
      .map((p) => p.name),
    highCardinalityColumns: input.categoricalObservations
      .filter((c) => c.highCardinalityLikely)
      .map((c) => c.column),
    driftColumns: input.categoricalObservations
      .filter((c) => c.driftLikely)
      .map((c) => c.column),
    outlierSummary: input.numericSummaries
      .filter((n) => n.outlierCount > 0)
      .map((n) => ({ column: n.column, count: n.outlierCount })),
    invalidNumericSummary,
  }
}

export function buildStructuralFindings(input: {
  cleaningDuplicateRows: number
  audit: DataAuditSummary
  invalidNumericSummary: DataAuditSummary["invalidNumericSummary"]
}): Array<{ label: string; detail: string }> {
  const findings: Array<{ label: string; detail: string }> = []

  if (input.cleaningDuplicateRows > 0) {
    findings.push({
      label: "Duplicate rows removed",
      detail: `${input.cleaningDuplicateRows} exact duplicate row${input.cleaningDuplicateRows === 1 ? " was" : "s were"} removed during cleaning before analysis.`,
    })
  }

  if (input.audit.highMissingColumns.length > 0) {
    findings.push({
      label: "High missingness",
      detail: `${input.audit.highMissingColumns.length} columns exceed ${HIGH_MISSING_THRESHOLD * 100}% missing: ${formatColumnList(input.audit.highMissingColumns)}.`,
    })
  }

  if (input.audit.mostlyEmptyColumns.length > 0) {
    findings.push({
      label: "Mostly empty columns",
      detail: `${input.audit.mostlyEmptyColumns.length} columns are mostly empty (≥${MOSTLY_EMPTY_THRESHOLD * 100}% missing): ${formatColumnList(input.audit.mostlyEmptyColumns)}.`,
    })
  }

  if (input.audit.driftColumns.length > 0) {
    findings.push({
      label: "Category formatting drift",
      detail: `${input.audit.driftColumns.length} categorical columns show casing, spacing, or naming drift: ${formatColumnList(input.audit.driftColumns)}.`,
    })
  }

  if (input.audit.highCardinalityColumns.length > 0) {
    findings.push({
      label: "Identifier-like fields",
      detail: `${input.audit.highCardinalityColumns.length} fields behave like identifiers: ${formatColumnList(input.audit.highCardinalityColumns)}.`,
    })
  }

  if (input.audit.outlierSummary.length > 0) {
    const cols = input.audit.outlierSummary.map(
      (n) => `${n.column} (${n.count})`,
    )
    findings.push({
      label: "Outlier concentration",
      detail: `Outliers detected in ${formatColumnList(cols)}.`,
    })
  }

  for (const inv of input.invalidNumericSummary) {
    findings.push({
      label: `Invalid numeric: ${inv.column}`,
      detail: `${inv.column} contains ${inv.count} non-numeric value${inv.count === 1 ? "" : "s"} converted to missing${inv.examples.length ? ` (e.g. ${inv.examples.map((e) => `"${e}"`).join(", ")})` : ""}.`,
    })
  }

  return findings
}

export function buildAnalysisPlan(input: {
  rowCount: number
  columnProfiles: ColumnProfile[]
  numericSummaries: NumericSummary[]
  categoricalObservations: CategoricalObservation[]
  comparison: ComparisonChoice | null
  noComparisonReason: string | null
}): AnalysisCandidate[] {
  const plan: AnalysisCandidate[] = []
  let id = 0
  const nextId = () => `plan-${++id}`

  const numericCols = input.columnProfiles.filter((p) => p.kind === "numeric")
  const catCols = input.columnProfiles.filter(
    (p) => p.kind === "categorical" && p.uniqueCount >= 2 && p.uniqueCount <= 16,
  )
  const dateCols = input.columnProfiles.filter((p) => p.kind === "date-like")

  if (input.comparison) {
    const c = input.comparison
    const { reason, caution } = buildSelectedComparisonCopy(
      c,
      input.numericSummaries,
    )
    plan.push({
      id: nextId(),
      label: `Group comparison: ${c.groupingColumn} × ${c.metricColumn}`,
      type: "group-comparison",
      columns: [c.groupingColumn, c.metricColumn],
      status: "selected",
      readiness: c.readiness,
      reason,
      caution,
    })
  } else {
    plan.push({
      id: nextId(),
      label: "Group comparison",
      type: "rejected",
      columns: [],
      status: "rejected",
      reason:
        input.noComparisonReason ??
        "No grouping and metric pairing passed structural checks.",
    })
  }

  if (numericCols.length >= 2 && input.rowCount >= 8) {
    const rentCols = numericCols.filter((p) =>
      p.name.toLowerCase().includes("rent"),
    )
    const a = rentCols[0]?.name ?? numericCols[0].name
    const b =
      rentCols[1]?.name ??
      numericCols.find((p) => p.name !== a)?.name ??
      numericCols[1].name
    plan.push({
      id: nextId(),
      label: `Correlation: ${a} × ${b}`,
      type: "correlation",
      columns: [a, b],
      status: "possible",
      reason: "Two numeric fields allow a pairwise correlation read.",
      caution:
        input.rowCount < 20
          ? "Small sample size may make correlation less stable."
          : "Correlation is descriptive only; no significance test is applied.",
    })
  }

  if (dateCols.length > 0 && numericCols.length > 0) {
    const metric =
      numericCols.find((p) => p.name.toLowerCase().includes("asking")) ??
      numericCols[0]
    plan.push({
      id: nextId(),
      label: `Time trend: ${dateCols[0].name} × ${metric.name}`,
      type: "time-trend",
      columns: [dateCols[0].name, metric.name],
      status: "possible",
      reason: "Date-like field paired with a numeric metric for ordered change.",
      caution:
        input.rowCount < 12
          ? "Small sample size may make the trend less stable."
          : "Descriptive trend only; not adjusted for unit mix or property mix.",
    })
  }

  const goodCats = catCols.filter(
    (p) =>
      !p.name.toLowerCase().includes("record") &&
      !p.name.toLowerCase().includes("export"),
  )
  if (goodCats.length >= 2) {
    plan.push({
      id: nextId(),
      label: `Category breakdown: ${goodCats[0].name} × ${goodCats[1].name}`,
      type: "categorical-breakdown",
      columns: [goodCats[0].name, goodCats[1].name],
      status: "possible",
      reason: "Two categorical fields support a compact frequency read.",
    })
  }

  if (numericCols.length > 0) {
    const metric =
      numericCols.find((p) => p.name.toLowerCase().includes("asking")) ??
      numericCols[0]
    plan.push({
      id: nextId(),
      label: `Distribution: ${metric.name}`,
      type: "distribution",
      columns: [metric.name],
      status: "possible",
      reason: "Numeric spread helps judge whether averages are stable.",
    })
  }

  for (const p of input.columnProfiles) {
    if (p.missingRate >= 0.8 && p.missingRate < 1) {
      plan.push({
        id: nextId(),
        label: p.name,
        type: "rejected",
        columns: [p.name],
        status: "rejected",
        reason: `Column is mostly empty (${(p.missingRate * 100).toFixed(0)}% missing) and is excluded from comparison routes.`,
      })
    }
  }

  for (const c of input.categoricalObservations.filter(
    (x) => x.highCardinalityLikely,
  )) {
    if (
      plan.some(
        (p) => p.columns.includes(c.column) && p.type === "group-comparison",
      )
    )
      continue
    plan.push({
      id: nextId(),
      label: c.column,
      type: "rejected",
      columns: [c.column],
      status: "rejected",
      reason: "High-cardinality field behaves like an identifier, not a group.",
    })
  }

  if (input.rowCount < 8) {
    plan.push({
      id: nextId(),
      label: "Sample size",
      type: "rejected",
      columns: [],
      status: "rejected",
      reason: `Only ${input.rowCount} rows. Comparisons may be unreliable at this sample size.`,
    })
  }

  return plan
}
