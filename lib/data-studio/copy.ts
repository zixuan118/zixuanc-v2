import type {
  ComparisonChoice,
  ComparisonReadiness,
  NumericSummary,
} from "@/lib/data-studio/types"

export function readinessLabel(readiness: ComparisonReadiness): string {
  if (readiness === "stable") return "Stable"
  if (readiness === "usable-with-caution") return "Usable with caution"
  if (readiness === "exploratory") return "Exploratory"
  return "Not recommended"
}

export function readinessSummary(readiness: ComparisonReadiness): string {
  if (readiness === "stable")
    return "This comparison looks stable based on the cleaned data."
  if (readiness === "usable-with-caution")
    return "This comparison is useful, but should be read with caution."
  if (readiness === "exploratory")
    return "This comparison is exploratory. Outliers and small groups make the result less stable."
  return "This comparison is not recommended."
}

export const STUDIO_FLOW =
  "Upload → Clean → Audit → Plan → Visualize → Explain → Export"

export const STUDIO_FACTS_BOUNDARY =
  "Algorithms compute the facts. The optional second reading explains those computed results and does not recalculate the table."

export function dedupeSentences(text: string): string {
  if (!text.trim()) return ""
  const parts = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  const seen = new Set<string>()
  const out: string[] = []
  for (const p of parts) {
    const key = p.toLowerCase().replace(/\s+/g, " ")
    if (seen.has(key)) continue
    seen.add(key)
    const ends = p.endsWith(".") || p.endsWith("!") || p.endsWith("?")
    out.push(ends ? p : `${p}.`)
  }
  return out.join(" ")
}

const READINESS_OPENERS = [
  "this comparison is useful, but should be read with caution.",
  "this comparison looks stable based on the cleaned data.",
  "this comparison is exploratory. outliers and small groups make the result less stable.",
  "this comparison is not recommended.",
]

function isReadinessSentence(s: string): boolean {
  const lower = s.toLowerCase().trim()
  return READINESS_OPENERS.some((o) => lower.startsWith(o.replace(/\.$/, "")))
}

function stripReadinessSentences(text: string): string {
  return dedupeSentences(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => !isReadinessSentence(s))
    .join(" ")
}

export function buildSelectedComparisonCopy(
  comparison: ComparisonChoice,
  numericSummaries: NumericSummary[],
): { reason: string; caution?: string } {
  const summary = readinessSummary(comparison.readiness)
  const metric = numericSummaries.find((n) => n.column === comparison.metricColumn)
  const counts = comparison.groupedAverages.map((g) => g.count).filter((c) => c > 0)
  const minCount = counts.length > 0 ? Math.min(...counts) : 0
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0
  const imbalanced = minCount > 0 && maxCount / minCount > 2

  const detailParts: string[] = []
  if (metric && metric.outlierCount > 0) {
    detailParts.push(`Outliers in ${comparison.metricColumn} reduce confidence`)
  }
  if (minCount > 0 && (minCount <= 6 || (imbalanced && minCount <= 12))) {
    detailParts.push(`smaller ${comparison.groupingColumn} groups may be less stable`)
  }

  const driverSentences = stripReadinessSentences(comparison.reason)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((s) => {
      const lower = s.toLowerCase()
      if (lower.includes("has enough groups to support")) return false
      if (lower.includes("retains enough semantic strength")) return false
      if (lower.includes("has clear enough meaning")) return false
      if (
        lower.includes("outliers in") &&
        !lower.includes(comparison.metricColumn.toLowerCase())
      )
        return false
      return true
    })

  const parts: string[] = [summary]
  if (detailParts.length > 0) {
    parts.push(`${detailParts.join(", and ")}.`)
  } else if (driverSentences.length > 0) {
    parts.push(driverSentences.slice(0, 2).join(" "))
  }

  let caution: string | undefined
  if (
    comparison.readiness === "usable-with-caution" ||
    comparison.readiness === "exploratory"
  ) {
    caution = "This is a descriptive pattern, not a causal claim."
  }

  return { reason: dedupeSentences(parts.join(" ")), caution }
}
