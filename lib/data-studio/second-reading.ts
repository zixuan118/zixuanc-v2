import type { AnalysisResult } from "@/lib/data-studio/types"
import type { RelationshipSuggestionsResponse } from "@/lib/data-studio/types"

export type RelationshipDiscoveryRequest = {
  profile: AnalysisResult["profile"]
  audit: AnalysisResult["audit"]
  cleaning: AnalysisResult["cleaning"]
  columnProfiles: AnalysisResult["columnProfiles"]
  numericSummaries: AnalysisResult["numericSummaries"]
  comparison: AnalysisResult["comparison"]
  analysisPlan: AnalysisResult["analysisPlan"]
  relationshipCandidates: AnalysisResult["relationshipCandidates"]
  visualBoardSummary: Array<{
    title: string
    description: string
    caution?: string
  }>
}

export type {
  RelationshipSuggestion,
  RelationshipSuggestionsResponse,
} from "@/lib/data-studio/types"

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
  | "audit"
  | "analysisPlan"
  | "cleaning"
  | "relationshipCandidates"
> & {
  visualBoardSummary: Array<{
    title: string
    description: string
    caution?: string
  }>
  relationshipSuggestions?: RelationshipSuggestionsResponse | null
}

export type ConfidenceLanguage = "low" | "medium" | "high"

export type SecondReadingResponse = {
  whatTheTableShows: string[]
  hypothesesOnly: string[]
  notSafeToClaim: string[]
  refinedReading: string[]
  keyFindings: string[]
  cautions: string[]
  nextQuestions: string[]
  nonTechnicalSummary: string
  confidenceLanguage: ConfidenceLanguage
}
