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
  /** After cleaning */
  parseableRateAfterCleaning: number
  parseableRateBeforeCleaning: number
  invalidNumericCountBeforeCleaning: number
  invalidNumericValuesConverted: number
  invalidNumericExamples: string[]
  cleanedValueCount: number
  rawNonEmptyCount: number
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
  emptyColumns: string[]
}

export type StructuralFinding = {
  label: string
  detail: string
}

export type ComparisonReadiness =
  | "stable"
  | "usable-with-caution"
  | "exploratory"
  | "not-recommended"

export type ComparisonChoice = {
  groupingColumn: string
  metricColumn: string
  reason: string
  groupedAverages: Array<{ group: string; value: number; count: number }>
  confidence: ConfidenceBreakdown
  verdict: ComparisonVerdict
  readiness: ComparisonReadiness
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
  cleaning: CleaningSummary
  cleanedParsed: ParsedCsv
  audit: DataAuditSummary
  analysisPlan: AnalysisCandidate[]
  visualBoard: VisualBlock[]
  relationshipCandidates: DeterministicRelationshipCandidate[]
}

export type IntakeFormat = "csv" | "tsv" | "txt" | "xlsx"

export type IntakeMeta = {
  fileName: string
  format: IntakeFormat
  delimiter: string | null
  sheetName: string | null
  warnings: string[]
  rowCount: number
  columnCount: number
  previewHeaders: string[]
  previewRows: Record<string, string>[]
}

export type IntakeResult = {
  parsed: ParsedCsv
  meta: IntakeMeta
}

export type DataAuditSummary = {
  constantColumns: string[]
  highMissingColumns: string[]
  emptyColumns: string[]
  mostlyEmptyColumns: string[]
  dateLikeColumns: string[]
  highCardinalityColumns: string[]
  driftColumns: string[]
  outlierSummary: Array<{ column: string; count: number }>
  invalidNumericSummary: Array<{
    column: string
    count: number
    examples: string[]
  }>
}

export type CleaningOperation =
  | "duplicate-removal"
  | "trim"
  | "empty-sentinel"
  | "category-normalization"
  | "invalid-numeric"

export type CleaningExample = {
  column: string
  rawValue: string
  cleanedValue: string
  count: number
  operation: CleaningOperation
}

export type CleaningSummary = {
  rawRowCount: number
  cleanedRowCount: number
  rawDuplicateRowCount: number
  duplicateRowsRemoved: number
  remainingDuplicateRowCount: number
  cellsTrimmed: number
  emptySentinelsNormalized: number
  categoryValuesNormalized: number
  invalidNumericValuesConverted: number
  columnsChanged: string[]
  examples: CleaningExample[]
  warnings: string[]
}

export type RelationshipCandidateType =
  | "correlation"
  | "group-difference"
  | "trend"
  | "funnel"
  | "quality-risk"
  | "possible-confounder"

export type DeterministicRelationshipCandidate = {
  id: string
  title: string
  variables: string[]
  relationshipType: RelationshipCandidateType
  computedEvidence: string[]
  cautions: string[]
  groupCount?: number
  correlation?: number
  sampleSize: number
}

export type RelationshipSuggestionStatus =
  | "worth-reviewing"
  | "weak"
  | "do-not-claim"

export type RelationshipSuggestion = {
  title: string
  variables: string[]
  relationshipType: RelationshipCandidateType
  status: RelationshipSuggestionStatus
  plainEnglishReason: string
  supportingComputedEvidence: string[]
  cautions: string[]
  shouldVisualize: boolean
}

export type RelationshipSuggestionsResponse = {
  relationshipSuggestions: RelationshipSuggestion[]
  notSafeToClaim: string[]
  recommendedNextChecks: string[]
}

export type AnalysisCandidateType =
  | "group-comparison"
  | "correlation"
  | "time-trend"
  | "categorical-breakdown"
  | "distribution"
  | "rejected"

export type AnalysisCandidateStatus = "selected" | "possible" | "rejected"

export type AnalysisCandidate = {
  id: string
  label: string
  type: AnalysisCandidateType
  columns: string[]
  status: AnalysisCandidateStatus
  readiness?: ComparisonReadiness
  reason: string
  caution?: string
}

export type CategoricalTopValue = {
  value: string
  count: number
}

export type VisualAccent = "sage" | "amber" | "terracotta" | "slate" | "ink"

export type VisualBlock =
  | {
      id: string
      title: string
      description: string
      caution?: string
      accent?: VisualAccent
      kind: "missingness-bars"
      rows: Array<{ label: string; value: number }>
    }
  | {
      id: string
      title: string
      description: string
      caution?: string
      accent?: VisualAccent
      kind: "numeric-table"
      rows: NumericSummary[]
      totalNumericCount?: number
    }
  | {
      id: string
      title: string
      description: string
      caution?: string
      accent?: VisualAccent
      kind: "categorical-table"
      column: string
      rows: CategoricalTopValue[]
    }
  | {
      id: string
      title: string
      description: string
      caution?: string
      accent?: VisualAccent
      kind: "histogram"
      column: string
      bins: HistogramBin[]
    }
  | {
      id: string
      title: string
      description: string
      caution?: string
      accent?: VisualAccent
      kind: "grouped-bars"
      rows: Array<{ label: string; value: number }>
    }
  | {
      id: string
      title: string
      description: string
      caution?: string
      accent?: VisualAccent
      kind: "scatter"
      xColumn: string
      yColumn: string
      points: Array<{ x: number; y: number }>
    }
  | {
      id: string
      title: string
      description: string
      caution?: string
      accent?: "sage" | "amber" | "terracotta" | "slate" | "ink"
      kind: "trend"
      dateColumn: string
      metricColumn: string
      statistic: "mean" | "median"
      points: Array<{ label: string; value: number; count: number }>
    }
  | {
      id: string
      title: string
      description: string
      caution?: string
      accent?: VisualAccent
      kind: "correlation-matrix"
      columns: string[]
      matrix: number[][]
    }

