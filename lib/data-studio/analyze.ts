import type {
  AnalysisResult,
  ComparisonReadiness,
  ConfidenceBreakdown,
  CategoricalObservation,
  ColumnKind,
  ColumnProfile,
  ComparisonChoice,
  DecisionDriver,
  ComparisonVerdict,
  HistogramBin,
  NumericSummary,
  ParsedCsv,
} from "@/lib/data-studio/types"
import type { SecondReadingResponse } from "@/lib/data-studio/second-reading"
import { cleanDataset } from "@/lib/data-studio/clean"
import {
  buildAnalysisPlan,
  buildAuditSummary,
  buildStructuralFindings,
} from "@/lib/data-studio/plan"
import { buildVisualBoard } from "@/lib/data-studio/visuals"
import { buildRelationshipCandidates } from "@/lib/data-studio/relationships"
import {
  getGroupingSemanticScore,
  getMetricSemanticScore,
  getPairConfoundPenalty,
  isHighCardinalityIdentifier,
  isIdentifierColumnName,
  normalizeCategoryForGrouping,
} from "@/lib/data-studio/columns"
import {
  isMissing,
  parseDateLike,
  parseNumeric,
  looksLikeIsoDate,
} from "@/lib/data-studio/values"

import { dedupeSentences, readinessSummary } from "@/lib/data-studio/copy"

function computeReadiness(
  verdict: ComparisonVerdict,
  confidence: ConfidenceBreakdown,
  groupingSemantic: number,
  outlierRate: number,
  minGroupCount: number,
): ComparisonReadiness {
  if (verdict === "invalid") return "not-recommended"
  if (verdict === "weak") {
    if (groupingSemantic >= 0.85 && confidence.overall !== "low")
      return "usable-with-caution"
    return confidence.overall === "low" ? "exploratory" : "usable-with-caution"
  }
  if (outlierRate > 0.08 || minGroupCount <= 4) return "usable-with-caution"
  if (
    verdict === "valid" &&
    confidence.overall === "high" &&
    groupingSemantic >= 0.7 &&
    outlierRate <= 0.05 &&
    minGroupCount > 4
  )
    return "stable"
  if (verdict === "valid" && confidence.overall === "high") return "usable-with-caution"
  if (confidence.overall === "low") return "exploratory"
  return "usable-with-caution"
}

function finalizeComparisonReadiness(
  comparison: ComparisonChoice,
  metricSummary: NumericSummary | undefined,
): ComparisonReadiness {
  const counts = comparison.groupedAverages
    .map((g) => g.count)
    .filter((c) => c > 0)
  const minGroupCount = counts.length > 0 ? Math.min(...counts) : 0
  const outlierRate =
    metricSummary && metricSummary.count > 0
      ? metricSummary.outlierCount / metricSummary.count
      : 0
  return computeReadiness(
    comparison.verdict,
    comparison.confidence,
    getGroupingSemanticScore(comparison.groupingColumn),
    outlierRate,
    minGroupCount,
  )
}

type PreCleanColumnStats = {
  parseableRateBeforeCleaning: number
  invalidNumericCountBeforeCleaning: number
  invalidNumericExamples: string[]
}

function computePreCleanStats(raw: ParsedCsv): Map<string, PreCleanColumnStats> {
  const headers = raw.headers.map((h) => h.trim())
  const out = new Map<string, PreCleanColumnStats>()
  for (let i = 0; i < headers.length; i++) {
    const h = headers[i]
    const rawKey = raw.headers[i]
    const values = raw.rows
      .map((r) => (r[rawKey] ?? r[h] ?? "").trim())
      .filter((v) => !isMissing(v))
    const parseableCount = values.filter((v) => parseNumeric(v) !== null).length
    const rate = parseableCount / Math.max(values.length, 1)
    const invalidExamples: string[] = []
    let invalidBefore = 0
    if (rate >= 0.5) {
      for (const v of values) {
        if (
          parseNumeric(v) === null &&
          !parseDateLike(v) &&
          !looksLikeIsoDate(v)
        ) {
          invalidBefore += 1
          if (invalidExamples.length < 3) invalidExamples.push(v)
        }
      }
    }
    out.set(h, {
      parseableRateBeforeCleaning: rate,
      invalidNumericCountBeforeCleaning: invalidBefore,
      invalidNumericExamples: invalidExamples,
    })
  }
  return out
}

function mean(values: number[]): number {
  if (values.length === 0) return 0
  return values.reduce((a, b) => a + b, 0) / values.length
}

function median(values: number[]): number {
  if (values.length === 0) return 0
  const sorted = [...values].sort((a, b) => a - b)
  const m = Math.floor(sorted.length / 2)
  return sorted.length % 2 === 0 ? (sorted[m - 1] + sorted[m]) / 2 : sorted[m]
}

function stddev(values: number[]): number {
  if (values.length < 2) return 0
  const m = mean(values)
  const variance =
    values.reduce((acc, v) => acc + (v - m) * (v - m), 0) / (values.length - 1)
  return Math.sqrt(variance)
}

function q(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0
  const idx = (sorted.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  if (lo === hi) return sorted[lo]
  const t = idx - lo
  return sorted[lo] * (1 - t) + sorted[hi] * t
}

function inferColumnKind(
  values: string[],
  invalidNumericCount: number,
): ColumnKind {
  const n = Math.max(values.length, 1)
  const nonMissing = values.filter((v) => !isMissing(v))
  const nonMissingRate = nonMissing.length / n
  if (nonMissingRate < 0.2) return "mostly-empty"

  const parseable =
    nonMissing.filter((v) => parseNumeric(v) !== null).length /
    Math.max(nonMissing.length, 1)
  if (parseable >= 0.82 || (parseable >= 0.75 && invalidNumericCount > 0)) {
    return "numeric"
  }

  const dateRate =
    nonMissing.filter((v) => parseDateLike(v) !== null || looksLikeIsoDate(v))
      .length / Math.max(nonMissing.length, 1)
  if (dateRate >= 0.75) return "date-like"

  return "categorical"
}

function toHistogram(values: number[], bins = 12): HistogramBin[] {
  if (values.length === 0) return []
  const minV = Math.min(...values)
  const maxV = Math.max(...values)
  if (minV === maxV) {
    return [{ start: minV, end: maxV, count: values.length }]
  }
  const width = (maxV - minV) / bins
  const out: HistogramBin[] = Array.from({ length: bins }, (_, i) => ({
    start: minV + i * width,
    end: i === bins - 1 ? maxV : minV + (i + 1) * width,
    count: 0,
  }))
  for (const v of values) {
    const idx = Math.min(Math.floor((v - minV) / width), bins - 1)
    out[idx].count += 1
  }
  return out
}

function chooseComparison(
  rows: Record<string, string>[],
  profiles: ColumnProfile[],
  numericSummaries: NumericSummary[]
): { comparison: ComparisonChoice | null; noComparisonReason: string | null } {
  const totalCount = Math.max(rows.length, 1)
  const noComparisonText =
    "No comparison is accepted.\n\nThe available fields do not support a grouping–metric relationship that would hold under structural or semantic scrutiny.\n\nPresenting a comparison here would introduce more distortion than insight."

  const profileByName = new Map<string, ColumnProfile>(
    profiles.map((p) => [p.name, p])
  )
  const summaryByColumn = new Map<string, NumericSummary>(
    numericSummaries.map((n) => [n.column, n])
  )

  function isValidGrouping(p: ColumnProfile) {
    if (p.kind === "numeric" || p.kind === "mostly-empty") return false
    if (isIdentifierColumnName(p.name)) return false
    if (isHighCardinalityIdentifier(p, totalCount)) return false
    if (p.uniqueCount < 2 || p.uniqueCount > 12) return false
    if (uniqueRatioOf(p) >= 0.3) return false
    if (getGroupingSemanticScore(p.name) < 0) return false
    return true
  }

  function metricVarianceOk(n: NumericSummary) {
    const std = n.stddev
    if (!Number.isFinite(std)) return false
    if (std <= 1e-9) return false
    const meanAbs = Math.abs(n.mean)
    const rel = meanAbs > 1e-9 ? std / meanAbs : std
    // "Meaningful variance": not constant, and not merely numerical noise.
    return rel >= 0.01 || std >= 1e-6
  }

  const groupingCandidates = profiles
    .filter((p) => isValidGrouping(p))
    .sort(
      (a, b) =>
        getGroupingSemanticScore(b.name) - getGroupingSemanticScore(a.name) ||
        a.name.localeCompare(b.name),
    )

  function uniqueRatioOf(p: ColumnProfile) {
    return p.uniqueCount / totalCount
  }

  // Step 2 — metricCandidates
  function getSemanticScore(name: string): number {
    return getMetricSemanticScore(name)
  }

  type MetricCandidate = {
    metric: NumericSummary
    semanticScore: number
  }

  function semanticBand(score: number) {
    if (score >= 0.7) return "strong"
    if (score >= 0.3) return "usable"
    if (score > 0) return "weak"
    return "unsupported"
  }

  const metricCandidates: MetricCandidate[] = numericSummaries
    .map((metric) => ({
      metric,
      semanticScore: getSemanticScore(metric.column),
    }))
    .filter(({ metric, semanticScore }) => {
      const prof = profileByName.get(metric.column)
      if (!prof) return false
      if (prof.missingRate >= 0.35) return false
      if (semanticScore <= 0) return false
      return metricVarianceOk(metric)
    })
    .sort((a, b) => a.metric.column.localeCompare(b.metric.column))

  if (groupingCandidates.length === 0 || metricCandidates.length === 0) {
    return { comparison: null, noComparisonReason: noComparisonText }
  }

  function computeUsableGroupCount(groupingColumn: string, metricColumn: string) {
    const groups = new Set<string>()
    for (const row of rows) {
      const gRaw = row[groupingColumn]
      const mRaw = row[metricColumn]
      if (isMissing(gRaw) || isMissing(mRaw)) continue
      const m = parseNumeric(mRaw)
      if (m === null) continue
      groups.add(normalizeCategoryForGrouping(gRaw))
    }
    return groups.size
  }

  // Step 3 — pairScores
  type PairScore = {
    grouping: ColumnProfile
    metric: NumericSummary
    semanticScore: number
    score: number
    usableGroupCount: number
  }

  const pairScores: PairScore[] = []

  for (const g of groupingCandidates) {
    for (const mCand of metricCandidates) {
      const { metric: m, semanticScore } = mCand
      const usableGroupCount = computeUsableGroupCount(g.name, m.column)
      if (usableGroupCount < 2) continue

      // grouping readability: fewer groups within the allowed band is better.
      const groupPenalty = (g.uniqueCount - 2) / 10 // 0..1 when within 2..12
      const groupReadability = 1 - Math.max(0, Math.min(1, groupPenalty))

      const varianceScore = Math.log(1 + m.stddev)
      const groupMissingPenalty = g.missingRate * 0.7
      const metricMissingPenalty =
        (profileByName.get(m.column)?.missingRate ?? 0) * 0.7

      const outlierRate = m.count > 0 ? m.outlierCount / m.count : 1
      const outlierPenalty = Math.min(0.5, outlierRate * 0.6)
      const groupingSemantic = getGroupingSemanticScore(g.name)
      const confoundPenalty = getPairConfoundPenalty(g.name, m.column)
      const band = semanticBand(semanticScore)
      const semanticAdjustment =
        band === "strong" ? 0.95 : band === "usable" ? 0.35 : -0.9

      const score =
        groupReadability * 1.1 +
        varianceScore * 0.85 -
        groupMissingPenalty -
        metricMissingPenalty -
        outlierPenalty +
        semanticScore * 0.8 +
        groupingSemantic * 1.25 -
        confoundPenalty * 1.6 +
        semanticAdjustment

      pairScores.push({
        grouping: g,
        metric: m,
        semanticScore,
        score,
        usableGroupCount,
      })
    }
  }

  if (pairScores.length === 0) {
    return { comparison: null, noComparisonReason: noComparisonText }
  }

  pairScores.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score
    if (b.usableGroupCount !== a.usableGroupCount)
      return b.usableGroupCount - a.usableGroupCount
    return a.grouping.name.localeCompare(b.grouping.name)
  })

  // Step 4 — best selection
  const best = pairScores[0]

  function shouldCompare(pair: PairScore): { allow: boolean; reason: string } {
    const outlierRate =
      pair.metric.count > 0 ? pair.metric.outlierCount / pair.metric.count : 1

    // Gate rules (deterministic):
    if (pair.semanticScore <= 0) return { allow: false, reason: "semantic" }
    if (pair.usableGroupCount < 2) return { allow: false, reason: "group_count" }
    if (pair.usableGroupCount > 12)
      return { allow: false, reason: "group_count_band" }

    // Metric stddev too small means there is effectively no variance.
    if (!Number.isFinite(pair.metric.stddev) || pair.metric.stddev <= 1e-9) {
      return { allow: false, reason: "no_variance" }
    }

    if (outlierRate > 0.35) return { allow: false, reason: "outliers" }
    return { allow: true, reason: "ok" }
  }

  const gate = shouldCompare(best)
  if (!gate.allow) {
    return { comparison: null, noComparisonReason: noComparisonText }
  }

  const metricMissing =
    profileByName.get(best.metric.column)?.missingRate ?? 0
  const outlierRate =
    best.metric.count > 0 ? best.metric.outlierCount / best.metric.count : 0

  function clamp(x: number, lo: number, hi: number) {
    return Math.max(lo, Math.min(hi, x))
  }

  const agg = new Map<string, { sum: number; count: number; display: string }>()
  for (const row of rows) {
    const gRaw = row[best.grouping.name]
    const mRaw = row[best.metric.column]
    if (isMissing(gRaw) || isMissing(mRaw)) continue
    const mVal = parseNumeric(mRaw)
    if (mVal === null) continue
    const gKey = normalizeCategoryForGrouping(gRaw)
    const display = gRaw.trim()
    const cur = agg.get(gKey) ?? { sum: 0, count: 0, display }
    cur.sum += mVal
    cur.count += 1
    cur.display = display
    agg.set(gKey, cur)
  }

  const groupedAverages = [...agg.values()]
    .map((v) => ({
      group: v.display,
      value: v.sum / v.count,
      count: v.count,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 7)

  if (groupedAverages.length === 0) {
    return { comparison: null, noComparisonReason: noComparisonText }
  }

  function detectDominantDriver(
    selectedMetric: string,
    selectedGrouping: string
  ): {
    primaryDriver: string | null
    strength: number
    competesWithSelected: boolean
    note: string
  } {
    const metricSummary = summaryByColumn.get(selectedMetric)
    if (!metricSummary || metricSummary.stddev <= 1e-9) {
      return {
        primaryDriver: null,
        strength: 0,
        competesWithSelected: false,
        note: "No dominant alternative driver is detected.",
      }
    }

    const values: number[] = []
    for (const row of rows) {
      const raw = row[selectedMetric]
      if (isMissing(raw)) continue
      const n = parseNumeric(raw)
      if (n !== null) values.push(n)
    }
    if (values.length < 3) {
      return {
        primaryDriver: null,
        strength: 0,
        competesWithSelected: false,
        note: "No dominant alternative driver is detected.",
      }
    }

    const globalMean = mean(values)
    const totalVar = stddev(values) ** 2
    if (!Number.isFinite(totalVar) || totalVar <= 1e-9) {
      return {
        primaryDriver: null,
        strength: 0,
        competesWithSelected: false,
        note: "No dominant alternative driver is detected.",
      }
    }

    function groupingScore(grouping: string) {
      const groups = new Map<string, { sum: number; count: number }>()
      for (const row of rows) {
        const gRaw = row[grouping]
        const mRaw = row[selectedMetric]
        if (isMissing(gRaw) || isMissing(mRaw)) continue
        const mVal = parseNumeric(mRaw)
        if (mVal === null) continue
        const g = normalizeCategoryForGrouping(gRaw)
        const cur = groups.get(g) ?? { sum: 0, count: 0 }
        cur.sum += mVal
        cur.count += 1
        groups.set(g, cur)
      }

      const entries = [...groups.values()].filter((v) => v.count > 0)
      const groupCount = entries.length
      if (groupCount < 2 || groupCount > 12) return { score: 0, ratio: 0, groupCount: 0, imbalance: 1 }

      let between = 0
      const counts = entries.map((e) => e.count)
      const minCount = Math.min(...counts)
      const maxCount = Math.max(...counts)
      const imbalance = minCount > 0 ? maxCount / minCount : 1
      for (const v of entries) {
        const gMean = v.sum / v.count
        between += v.count * (gMean - globalMean) ** 2
      }
      const ratio = (between / Math.max(values.length, 1)) / totalVar
      const readable = groupCount >= 3 && groupCount <= 8 ? 1 : 0.65
      const tinyPenalty = imbalance > 4 ? 0.35 : imbalance > 2.5 ? 0.18 : 0
      const score = ratio * 1.2 + readable - tinyPenalty
      return { score, ratio, groupCount, imbalance }
    }

    const selected = groupingScore(selectedGrouping)
    let bestAlt: { column: string; score: number; ratio: number } | null = null

    for (const p of groupingCandidates) {
      if (p.name === selectedGrouping) continue
      const s = groupingScore(p.name)
      if (!bestAlt || s.score > bestAlt.score) {
        bestAlt = { column: p.name, score: s.score, ratio: s.ratio }
      }
    }

    if (!bestAlt) {
      return {
        primaryDriver: null,
        strength: 0,
        competesWithSelected: false,
        note: "No dominant alternative driver is detected.",
      }
    }

    const strength = Math.max(0, bestAlt.score - selected.score)
    const competesWithSelected =
      bestAlt.ratio > selected.ratio + 0.06 && strength > 0.08

    return {
      primaryDriver: competesWithSelected ? bestAlt.column : null,
      strength: Number(strength.toFixed(3)),
      competesWithSelected,
      note: competesWithSelected
        ? `Another grouping appears to explain ${selectedMetric} more strongly: ${bestAlt.column}.`
        : "No dominant alternative driver is detected.",
    }
  }

  const dominant = detectDominantDriver(best.metric.column, best.grouping.name)
  const hasCompetingDriver = dominant.competesWithSelected && !!dominant.primaryDriver

  const semantic = clamp(best.semanticScore, 0, 1)
  const counts = groupedAverages.map((g) => g.count).filter((c) => c > 0)
  const minCount = counts.length > 0 ? Math.min(...counts) : 0
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0
  const imbalance = minCount > 0 ? maxCount / minCount : 1
  const structureBase = best.usableGroupCount >= 3 && best.usableGroupCount <= 8 ? 1 : 0.55
  const structure = clamp(
    structureBase - (imbalance > 4 ? 0.35 : imbalance > 2.5 ? 0.2 : 0),
    0.1,
    1
  )
  const stability = metricMissing < 0.1 && outlierRate < 0.2 ? 1 : metricMissing < 0.2 && outlierRate < 0.3 ? 0.65 : 0.35

  const strongCompetingDriver = hasCompetingDriver && dominant.strength >= 0.2
  const moderateCompetingDriver = hasCompetingDriver && dominant.strength >= 0.1
  const driverPenalty = strongCompetingDriver ? 0.2 : moderateCompetingDriver ? 0.1 : 0
  let combinedScore = semantic * 0.4 + structure * 0.3 + stability * 0.3 - driverPenalty
  combinedScore = clamp(combinedScore, 0, 1)

  const weakSemantic = best.semanticScore > 0 && best.semanticScore < 0.5
  const weakOutlier = outlierRate >= 0.15 && outlierRate <= 0.35
  const weakGrouping = best.usableGroupCount === 2 || best.usableGroupCount > 8

  let verdict: ComparisonVerdict = "valid"
  if (
    best.semanticScore <= 0 ||
    outlierRate > 0.35 ||
    best.usableGroupCount < 2 ||
    best.usableGroupCount > 12 ||
    !metricVarianceOk(best.metric)
  ) {
    verdict = "invalid"
  } else if (weakSemantic || weakOutlier || weakGrouping || hasCompetingDriver) {
    verdict = "weak"
  }

  if (verdict === "invalid") {
    return { comparison: null, noComparisonReason: noComparisonText }
  }

  let overall: "low" | "medium" | "high" =
    combinedScore > 0.75 ? "high" : combinedScore > 0.45 ? "medium" : "low"
  if (verdict === "weak" && overall === "high") overall = "medium"
  if (hasCompetingDriver && overall === "high") overall = "medium"

  const readiness = computeReadiness(
    verdict,
    { semantic, structure, stability, overall },
    getGroupingSemanticScore(best.grouping.name),
    outlierRate,
    minCount,
  )

  const reason = `Readiness: ${readiness.replace(/-/g, " ")}. ${best.grouping.name} is compared against ${best.metric.column} using cleaned rows. ${verdict === "weak" ? "Outliers or small groups may affect the result." : "The pairing passed basic structure checks."}`

  const confidence: ConfidenceBreakdown = { semantic, structure, stability, overall }
  return {
    comparison: {
      groupingColumn: best.grouping.name,
      metricColumn: best.metric.column,
      reason,
      groupedAverages,
      confidence,
      verdict,
      readiness,
      dominantDriver: hasCompetingDriver && dominant.primaryDriver
        ? {
            primaryDriver: dominant.primaryDriver,
            strength: dominant.strength,
            note: dominant.note,
          }
        : null,
    },
    noComparisonReason: null,
  }
}

export function computeTension(
  comparison: ComparisonChoice,
  numericSummaries: NumericSummary[],
  confidence: ConfidenceBreakdown,
  second: SecondReadingResponse
): "low" | "medium" | "high" {
  const cautionsText = (second.cautions ?? []).join(" ").toLowerCase()
  const metric = numericSummaries.find(
    (n) => n.column === comparison.metricColumn
  )
  const outlierRate =
    metric && metric.count > 0 ? metric.outlierCount / metric.count : 0
  const varianceOverMean =
    metric && Math.abs(metric.mean) > 1e-9
      ? metric.stddev / Math.abs(metric.mean)
      : metric?.stddev ?? 0

  const counts = comparison.groupedAverages.map((g) => g.count).filter((c) => c > 0)
  const maxCount = counts.length > 0 ? Math.max(...counts) : 0
  const minCount = counts.length > 0 ? Math.min(...counts) : 0
  const imbalanceRatio = minCount > 0 ? maxCount / minCount : 1
  const groupCount = comparison.groupedAverages.length

  const outlierInstability = outlierRate > 0.1
  const spreadInstability = varianceOverMean > 1.2
  const imbalanceInstability = imbalanceRatio > 3.5 || groupCount < 3 || groupCount > 8
  const driverInstability = comparison.dominantDriver !== null
  const structuralInstability =
    outlierInstability || spreadInstability || imbalanceInstability || driverInstability

  // Optional text reinforcement: caution language can nudge, but never drive alone.
  const textSignals = [
    "outlier",
    "unstable",
    "skew",
    "not reliable",
    "dispersion",
    "overstated",
    "weaker",
    "stronger",
    "driver",
  ]
  const textReinforcement = textSignals.some((s) => cautionsText.includes(s))

  const firstPassStrong =
    comparison.verdict === "valid" &&
    confidence.overall === "high" &&
    confidence.semantic >= 0.7
  const firstPassWeak =
    comparison.verdict === "weak" || comparison.verdict === "invalid" || confidence.overall === "low"

  if (firstPassStrong && structuralInstability && textReinforcement) return "high"
  if (firstPassStrong && (outlierInstability || driverInstability)) return "high"

  if (firstPassWeak && !textReinforcement) return "low"

  if (firstPassStrong && textReinforcement && !structuralInstability) return "medium"
  if (firstPassWeak && textReinforcement) return "medium"

  return "low"
}

export function analyzeDataset(rawParsed: ParsedCsv): AnalysisResult {
  const preCleanStats = computePreCleanStats(rawParsed)
  const { cleaned, cleaning } = cleanDataset(rawParsed)
  const { headers, rows } = cleaned
  const rowCount = rows.length
  const columnCount = headers.length

  const duplicateRowCount = cleaning.duplicateRowsRemoved

  const columnProfiles: ColumnProfile[] = headers.map((name) => {
    const values = rows.map((r) => r[name] ?? "")
    const miss = values.filter(isMissing).length
    const nonMissing = values.filter((v) => !isMissing(v))
    const rawNonEmptyCount = nonMissing.length
    const parseableAfter =
      nonMissing.filter((v) => parseNumeric(v) !== null).length /
      Math.max(nonMissing.length, 1)
    const pre = preCleanStats.get(name) ?? {
      parseableRateBeforeCleaning: parseableAfter,
      invalidNumericCountBeforeCleaning: 0,
      invalidNumericExamples: [] as string[],
    }
    let postInvalid = 0
    if (pre.parseableRateBeforeCleaning >= 0.5) {
      for (const v of nonMissing) {
        if (parseNumeric(v) === null) postInvalid += 1
      }
    }
    const invalidConverted = Math.max(
      0,
      pre.invalidNumericCountBeforeCleaning - postInvalid,
    )
    const kind = inferColumnKind(
      values,
      pre.invalidNumericCountBeforeCleaning,
    )
    const uniq = new Set(nonMissing).size
    const normUniq = new Set(
      nonMissing.map(normalizeCategoryForGrouping),
    ).size
    const cleanedValueCount =
      kind === "numeric"
        ? nonMissing.filter((v) => parseNumeric(v) !== null).length
        : nonMissing.length
    return {
      name,
      kind,
      missingRate: miss / Math.max(values.length, 1),
      uniqueCount: uniq,
      normalizedUniqueCount: normUniq,
      parseableRateAfterCleaning: parseableAfter,
      parseableRateBeforeCleaning: pre.parseableRateBeforeCleaning,
      invalidNumericCountBeforeCleaning:
        kind === "numeric" ? pre.invalidNumericCountBeforeCleaning : 0,
      invalidNumericValuesConverted:
        kind === "numeric" ? invalidConverted : 0,
      invalidNumericExamples:
        kind === "numeric" ? pre.invalidNumericExamples : [],
      cleanedValueCount,
      rawNonEmptyCount,
    }
  })

  const numericSummaries: NumericSummary[] = columnProfiles
    .filter((p) => p.kind === "numeric")
    .map((p) => {
      const nums = rows
        .map((r) => parseNumeric(r[p.name] ?? ""))
        .filter((n): n is number => n !== null)
      const sorted = [...nums].sort((a, b) => a - b)
      const q1 = q(sorted, 0.25)
      const q3 = q(sorted, 0.75)
      const iqr = q3 - q1
      const lo = q1 - 1.5 * iqr
      const hi = q3 + 1.5 * iqr
      const outlierCount = nums.filter((v) => v < lo || v > hi).length
      return {
        column: p.name,
        count: nums.length,
        min: nums.length ? Math.min(...nums) : 0,
        max: nums.length ? Math.max(...nums) : 0,
        mean: mean(nums),
        median: median(nums),
        stddev: stddev(nums),
        outlierCount,
      }
    })

  const categoricalObservations: CategoricalObservation[] = columnProfiles
    .filter((p) => p.kind === "categorical")
    .map((p) => {
      const nonMissing = Math.round((1 - p.missingRate) * rowCount)
      const highCardinalityLikely = isHighCardinalityIdentifier(p, rowCount)
      const driftLikely = p.normalizedUniqueCount < p.uniqueCount
      return {
        column: p.name,
        rawUnique: p.uniqueCount,
        normalizedUnique: p.normalizedUniqueCount,
        driftLikely,
        highCardinalityLikely,
      }
    })

  const missingnessByColumn = columnProfiles
    .map((p) => ({ column: p.name, missingRate: p.missingRate }))
    .sort((a, b) => b.missingRate - a.missingRate)

  const audit = buildAuditSummary({
    columnProfiles,
    missingnessByColumn,
    categoricalObservations,
    numericSummaries,
  })

  const structuralFindings = buildStructuralFindings({
    cleaningDuplicateRows: cleaning.duplicateRowsRemoved,
    audit,
    invalidNumericSummary: audit.invalidNumericSummary,
  })

  const initialDecision = chooseComparison(
    rows,
    columnProfiles,
    numericSummaries
  )
  let comparison = initialDecision.comparison
  let noComparisonReason = initialDecision.noComparisonReason

  const histMetric =
    numericSummaries
      .slice()
      .sort((a, b) => b.stddev - a.stddev)
      .find((n) => n.count > 10) ?? null
  const histogram =
    histMetric === null
      ? null
      : {
          column: histMetric.column,
          bins: toHistogram(
            rows
              .map((r) => parseNumeric(r[histMetric.column] ?? ""))
              .filter((n): n is number => n !== null)
          ),
        }

  const profile = {
    rowCount,
    columnCount,
    numericColumns: columnProfiles
      .filter((p) => p.kind === "numeric")
      .map((p) => p.name),
    categoricalColumns: columnProfiles
      .filter((p) => p.kind === "categorical")
      .map((p) => p.name),
    dateLikeColumns: columnProfiles
      .filter((p) => p.kind === "date-like")
      .map((p) => p.name),
    mostlyEmptyColumns: columnProfiles
      .filter((p) => p.missingRate >= 0.8 && p.missingRate < 1)
      .map((p) => p.name),
    emptyColumns: columnProfiles
      .filter((p) => p.missingRate >= 1)
      .map((p) => p.name),
  }

  function generateDecisionDrivers(input: {
    outlierCols: NumericSummary[]
    driftCols: CategoricalObservation[]
    duplicatesRemoved: number
    remainingDuplicates: number
    dominantDriver: ComparisonChoice["dominantDriver"] | null
    comparison: ComparisonChoice | null
  }): DecisionDriver[] {
    const candidates: Omit<DecisionDriver, "total">[] = []
    const selectedLabel = input.comparison
      ? `${input.comparison.groupingColumn} × ${input.comparison.metricColumn}`
      : "selected comparison"

    if (input.comparison && input.comparison.confidence.semantic >= 0.7) {
      candidates.push({
        text: "The selected metric has clear enough meaning to keep this comparison usable.",
        impact: 2,
        scope: 2,
        risk: 2,
        specificity: 1,
        decisionRelevance: 2,
        alignment: "supports",
        affects: ["confidence", "comparison"],
      })
    }

    if (
      input.comparison &&
      input.comparison.groupedAverages.length >= 3 &&
      input.comparison.groupedAverages.length <= 8
    ) {
      candidates.push({
        text: `${input.comparison.groupingColumn} has enough groups to support ${selectedLabel}.`,
        impact: 2,
        scope: 2,
        risk: 2,
        specificity: 2,
        decisionRelevance: 2,
        alignment: "supports",
        affects: ["confidence", "verdict"],
      })
    }

    if (input.outlierCols.length > 0) {
      const selectedMetricCol = input.comparison?.metricColumn
      const relevantOutliers = selectedMetricCol
        ? input.outlierCols.filter((n) => n.column === selectedMetricCol)
        : input.outlierCols
      if (relevantOutliers.length > 0) {
        const top = relevantOutliers
          .slice()
          .sort((a, b) => b.outlierCount - a.outlierCount)[0]
        const rate = top.count > 0 ? top.outlierCount / top.count : 0
        candidates.push({
          text: input.comparison
            ? `Outliers in ${top.column} reduce confidence in ${selectedLabel}.`
            : `Outliers in ${top.column} reduce reliability for any grouping comparison.`,
          impact: rate > 0.2 ? 3 : 2,
          scope: 3,
          risk: 3,
          specificity: 2,
          decisionRelevance: 3,
          alignment: rate > 0.35 ? "blocks" : "weakens",
          affects:
            rate > 0.35
              ? ["comparison", "verdict", "confidence"]
              : ["confidence", "tension"],
        })
      }
    }

    if (input.duplicatesRemoved > 0 && input.remainingDuplicates === 0) {
      candidates.push({
        text: `${input.duplicatesRemoved} duplicate row${input.duplicatesRemoved === 1 ? " was" : "s were"} removed before analysis. Aggregates use cleaned rows only.`,
        impact: 1,
        scope: 1,
        risk: 1,
        specificity: 2,
        decisionRelevance: 1,
        alignment: "supports",
        affects: ["confidence"],
      })
    } else if (input.remainingDuplicates > 0) {
      candidates.push({
        text: `${input.remainingDuplicates} duplicate row${input.remainingDuplicates === 1 ? "" : "s"} remain after cleaning and may still affect aggregates.`,
        impact: 2,
        scope: 2,
        risk: 2,
        specificity: 2,
        decisionRelevance: 2,
        alignment: "weakens",
        affects: ["confidence"],
      })
    }

    if (input.driftCols.length > 0) {
      candidates.push({
        text: input.comparison
          ? `Category drift in ${input.driftCols[0].column} may affect grouping for ${selectedLabel}.`
          : `Category drift in ${input.driftCols[0].column} makes a defensible comparison harder.`,
        impact: 2,
        scope: 1,
        risk: 2,
        specificity: 2,
        decisionRelevance: input.comparison ? 2 : 3,
        alignment: input.comparison ? "weakens" : "blocks",
        affects: input.comparison ? ["confidence", "tension"] : ["comparison", "verdict"],
      })
    }

    if (input.dominantDriver?.primaryDriver) {
      candidates.push({
        text: `Another grouping (${input.dominantDriver.primaryDriver}) may explain ${selectedLabel} more strongly.`,
        impact: input.dominantDriver.strength >= 0.2 ? 3 : 2,
        scope: 2,
        risk: 3,
        specificity: 2,
        decisionRelevance: 3,
        alignment: "weakens",
        affects: ["confidence", "verdict", "tension"],
      })
    }

    if (!input.comparison) {
      candidates.push({
        text: "No grouping passed basic checks, so no comparison is shown.",
        impact: 3,
        scope: 3,
        risk: 3,
        specificity: 1,
        decisionRelevance: 3,
        alignment: "blocks",
        affects: ["comparison", "verdict", "confidence"],
      })
    }

    const drivers: DecisionDriver[] = candidates.map((c) => ({
      ...c,
      total:
        c.impact + c.scope + c.risk + c.specificity + c.decisionRelevance,
    }))

    const alignmentOrder = { blocks: 1, weakens: 2, supports: 3 } as const
    return drivers
      .filter((d) => d.total >= 7)
      .sort((a, b) => {
        const ao = alignmentOrder[a.alignment] - alignmentOrder[b.alignment]
        if (ao !== 0) return ao
        return b.total - a.total
      })
  }

  const outlierCols = numericSummaries.filter((n) => n.outlierCount > 0)
  const driftCols = categoricalObservations.filter((c) => c.driftLikely)

  const rankedDrivers = generateDecisionDrivers({
    outlierCols,
    driftCols,
    duplicatesRemoved: cleaning.duplicateRowsRemoved,
    remainingDuplicates: cleaning.remainingDuplicateRowCount,
    dominantDriver: comparison?.dominantDriver ?? null,
    comparison,
  })
  const topDrivers = rankedDrivers.slice(0, 2)

  const topBlocks = topDrivers.filter((d) => d.alignment === "blocks")
  const topWeakens = topDrivers.filter((d) => d.alignment === "weakens")
  const topSupports = topDrivers.filter((d) => d.alignment === "supports")
  const meaningfulWeakens = rankedDrivers.filter(
    (d) => d.alignment === "weakens" && d.total >= 9
  )

  if (comparison && topBlocks.length > 0 && topBlocks[0].total >= 9) {
    comparison = null
    noComparisonReason =
      "No comparison is accepted. The current structure does not support a defensible grouping and metric pairing."
  }

  if (comparison) {
    const weakenScore = topWeakens.reduce((s, d) => s + d.total, 0)
    const supportScore = topSupports.reduce((s, d) => s + d.total, 0)
    const hasMeaningfulWeakens = meaningfulWeakens.length > 0
    const hasSupportAndWeakens = topSupports.length > 0 && topWeakens.length > 0

    if (weakenScore > supportScore + 1 || hasMeaningfulWeakens) {
      comparison.verdict = "weak"
    }

    // Strict pessimism: meaningful weakening forbids "defensible" / high confidence.
    if (hasMeaningfulWeakens && comparison.confidence.overall === "high") {
      comparison.confidence.overall = "medium"
    }
    if (hasSupportAndWeakens) {
      comparison.verdict = "weak"
      if (comparison.confidence.overall === "high") {
        comparison.confidence.overall = "medium"
      }
    }
    if (weakenScore > supportScore + 6) {
      comparison.confidence.overall = "low"
      comparison.confidence.stability = Math.min(0.45, comparison.confidence.stability)
    } else if (weakenScore > supportScore + 4 && comparison.confidence.overall !== "low") {
      comparison.confidence.overall = "medium"
      comparison.confidence.stability = Math.min(0.6, comparison.confidence.stability)
    }

    // High confidence is only allowed when no meaningful weakening exists.
    if (hasMeaningfulWeakens && comparison.confidence.overall === "high") {
      comparison.confidence.overall = "medium"
    }

    const metricSummary = numericSummaries.find(
      (n) => n.column === comparison.metricColumn,
    )
    comparison.readiness = finalizeComparisonReadiness(comparison, metricSummary)
    comparison.reason =
      topDrivers.length > 0
        ? dedupeSentences(topDrivers.map((d) => d.text).join(" "))
        : ""
  }

  const interpretationParagraphs: string[] = []
  if (!comparison) {
    interpretationParagraphs.push("No comparison is accepted.")
    interpretationParagraphs.push(
      "The current structure does not support a defensible grouping and metric pairing.",
    )
  } else {
    interpretationParagraphs.push(readinessSummary(comparison.readiness))
    if (comparison.readiness === "exploratory") {
      interpretationParagraphs.push("Treat findings as descriptive.")
    }
    if (cleaning.duplicateRowsRemoved > 0) {
      interpretationParagraphs.push(
        `${cleaning.duplicateRowsRemoved} duplicate row${cleaning.duplicateRowsRemoved === 1 ? " was" : "s were"} removed before this comparison was computed.`,
      )
    }
  }

  const highlights = topDrivers.map((d) => d.text)

  const analysisPlan = buildAnalysisPlan({
    rowCount,
    columnProfiles,
    numericSummaries,
    categoricalObservations,
    comparison,
    noComparisonReason,
  })

  const partial = {
    profile,
    missingnessByColumn,
    numericSummaries,
    categoricalObservations,
    comparison,
    histogram,
    columnProfiles,
  }
  const visualBoard = buildVisualBoard(cleaned, partial)

  const partialResult = {
    profile,
    columnProfiles,
    duplicateRowCount,
    missingnessByColumn,
    numericSummaries,
    categoricalObservations,
    structuralFindings,
    comparison,
    noComparisonReason,
    decisionDrivers: topDrivers,
    tension: null,
    histogram,
    interpretationParagraphs: interpretationParagraphs.slice(0, 5),
    highlights,
    cleaning,
    cleanedParsed: cleaned,
    audit,
    analysisPlan,
    visualBoard,
    relationshipCandidates: [] as AnalysisResult["relationshipCandidates"],
  }

  partialResult.relationshipCandidates = buildRelationshipCandidates(
    cleaned,
    partialResult,
  )

  return partialResult
}

