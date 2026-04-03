import type { AnalysisResult } from "@/lib/data-studio/types"

export type SecondReadingRequest = Pick<
  AnalysisResult,
  | "profile"
  | "structuralFindings"
  | "missingnessByColumn"
  | "categoricalObservations"
  | "numericSummaries"
  | "comparison"
  | "noComparisonReason"
  | "decisionDrivers"
  | "highlights"
  | "interpretationParagraphs"
>

export type SecondReadingResponse = {
  refinedReading: string[]
  cautions: string[]
  nextQuestions: string[]
}

