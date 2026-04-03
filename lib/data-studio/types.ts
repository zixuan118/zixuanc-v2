export type Primitive = string | number | null

export type ParsedCsv = {
  headers: string[]
  rows: Record<string, string>[]
}

export type ColumnKind = "numeric" | "categorical" | "date-like" | "mostly-empty"

export type ColumnProfile = {
  name: string
  kind: ColumnKind
  missingRate: number
  uniqueCount: number
  normalizedUniqueCount: number
}

export type NumericSummary = {
  column: string
  count: number
  min: number
  max: number
  mean: number
  median: number
  stddev: number
  outlierCount: number
}

export type CategoricalObservation = {
  column: string
  rawUnique: number
  normalizedUnique: number
  driftLikely: boolean
  highCardinalityLikely: boolean
}

export type DatasetProfileData = {
  rowCount: number
  columnCount: number
  numericColumns: string[]
  categoricalColumns: string[]
  dateLikeColumns: string[]
  mostlyEmptyColumns: string[]
}

export type StructuralFinding = {
  label: string
  detail: string
}

export type ComparisonChoice = {
  groupingColumn: string
  metricColumn: string
  reason: string
  groupedAverages: Array<{ group: string; value: number; count: number }>
  confidence: ConfidenceBreakdown
  verdict: ComparisonVerdict
  dominantDriver: DominantDriver | null
}

export type ComparisonVerdict = "valid" | "weak" | "invalid"

export type DominantDriver = {
  primaryDriver: string
  strength: number
  note: string
}

export type DecisionDriver = {
  text: string
  impact: number
  scope: number
  risk: number
  specificity: number
  decisionRelevance: number
  alignment: "supports" | "weakens" | "blocks"
  affects: Array<"verdict" | "confidence" | "tension" | "comparison">
  total: number
}

export type ConfidenceBreakdown = {
  semantic: number
  structure: number
  stability: number
  overall: "low" | "medium" | "high"
}

export type HistogramBin = {
  start: number
  end: number
  count: number
}

export type AnalysisResult = {
  profile: DatasetProfileData
  columnProfiles: ColumnProfile[]
  duplicateRowCount: number
  missingnessByColumn: Array<{ column: string; missingRate: number }>
  numericSummaries: NumericSummary[]
  categoricalObservations: CategoricalObservation[]
  structuralFindings: StructuralFinding[]
  comparison: ComparisonChoice | null
  noComparisonReason: string | null
  decisionDrivers: DecisionDriver[]
  tension: "low" | "medium" | "high" | null
  histogram: { column: string; bins: HistogramBin[] } | null
  interpretationParagraphs: string[]
  highlights: string[]
}

