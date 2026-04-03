import type {
  AnalysisResult,
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

function isMissing(v: string): boolean {
  const x = v.trim().toLowerCase()
  return x === "" || x === "na" || x === "n/a" || x === "null" || x === "-"
}

function normalizeCategory(v: string): string {
  return v.trim().replace(/\s+/g, " ").toLowerCase()
}

function parseNumeric(v: string): number | null {
  const s = v.trim().replace(/[$,%\s]/g, "")
  if (s === "") return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

function parseDateLike(v: string): number | null {
  const t = Date.parse(v.trim())
  return Number.isFinite(t) ? t : null
}

function inferColumnKind(values: string[]): ColumnKind {
  const n = Math.max(values.length, 1)
  const nonMissing = values.filter((v) => !isMissing(v))
  const nonMissingRate = nonMissing.length / n
  if (nonMissingRate < 0.2) return "mostly-empty"

  const numericRate =
    nonMissing.filter((v) => parseNumeric(v) !== null).length /
    Math.max(nonMissing.length, 1)
  if (numericRate >= 0.82) return "numeric"

  const dateRate =
    nonMissing.filter((v) => parseDateLike(v) !== null).length /
    Math.max(nonMissing.length, 1)
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

  function isIdentifierName(name: string) {
    const n = name.trim().toLowerCase()
    const tokens = n
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)

    // Treat likely identifiers as unsafe grouping fields.
    return (
      n.includes("postal") ||
      n.includes("order id") ||
      n.includes("customer id") ||
      n.includes("row id") ||
      tokens.includes("id") ||
      tokens.includes("code") ||
      tokens.includes("zip") ||
      tokens.includes("number")
    )
  }

  function uniqueRatioOf(p: ColumnProfile) {
    return p.uniqueCount / totalCount
  }

  // Step 1 — groupingCandidates
  function isValidGrouping(p: ColumnProfile) {
    if (p.kind === "numeric") return false
    if (isIdentifierName(p.name)) return false
    if (p.uniqueCount < 2 || p.uniqueCount > 12) return false
    if (uniqueRatioOf(p) >= 0.3) return false
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
    .sort((a, b) => a.name.localeCompare(b.name))

  // Step 2 — metricCandidates (must be an array)
  function getSemanticScore(name: string): number {
    const n = name.trim().toLowerCase()
    const tokens = n
      .replace(/[^a-z0-9]+/g, " ")
      .trim()
      .split(" ")
      .filter(Boolean)

    const hasAnyToken = (list: string[]) =>
      list.some((t) => tokens.includes(t))

    // Strong negative: identifiers and key-like fields.
    if (hasAnyToken(["id", "code", "zip", "number", "key"])) return -1.0
    if (n.includes("postal")) return -0.9

    // Strong positive signals.
    if (n.includes("sales") || n.includes("revenue") || n.includes("profit")) {
      return 0.9
    }

    // Medium positives.
    if (
      n.includes("cost") ||
      n.includes("price") ||
      n.includes("margin")
    ) {
      return 0.6
    }
    if (n.includes("quantity")) return 0.6

    // Neutral / weak positive.
    if (
      n.includes("amount") ||
      n.includes("total") ||
      n.includes("value") ||
      n.includes("units") ||
      n.includes("count")
    ) {
      return 0.25
    }

    // Unknown / neutral.
    return 0
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
      groups.add(normalizeCategory(gRaw))
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

  const agg = new Map<string, { sum: number; count: number }>()
  for (const row of rows) {
    const gRaw = row[best.grouping.name]
    const mRaw = row[best.metric.column]
    if (isMissing(gRaw) || isMissing(mRaw)) continue
    const mVal = parseNumeric(mRaw)
    if (mVal === null) continue
    const g = normalizeCategory(gRaw)
    const cur = agg.get(g) ?? { sum: 0, count: 0 }
    cur.sum += mVal
    cur.count += 1
    agg.set(g, cur)
  }

  const groupedAverages = [...agg.entries()]
    .map(([group, v]) => ({ group, value: v.sum / v.count, count: v.count }))
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
        const g = normalizeCategory(gRaw)
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

  const confidence: ConfidenceBreakdown = { semantic, structure, stability, overall }

  const verdictLine =
    verdict === "valid"
      ? "The comparison is defensible."
      : "The comparison is usable, but not primary."
  const driverLine = hasCompetingDriver
    ? `A stronger explanatory split appears elsewhere (${dominant.primaryDriver}).`
    : "No stronger competing driver clearly dominates this lens."
  const confidenceLine =
    overall === "high"
      ? "Confidence remains high because semantic meaning and structure both hold without major distortion."
      : overall === "medium"
        ? "Confidence remains moderate because the lens is readable but constrained by structure."
        : "Confidence remains low because structural support is narrow."
  const reason = `This pairing is accepted as a judgment rather than a default chart. ${best.grouping.name} is structurally readable for ${best.metric.column}, and the metric carries ${semantic >= 0.7 ? "strong" : semantic >= 0.3 ? "usable" : "limited"} semantic meaning. ${verdictLine} ${driverLine} Confidence is ${overall}. ${confidenceLine}`

  // Step 7 — return result
  return {
    comparison: {
      groupingColumn: best.grouping.name,
      metricColumn: best.metric.column,
      reason,
      groupedAverages,
      confidence,
      verdict,
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
  if (confidence.overall === "medium" || structuralInstability || textReinforcement) {
    return "medium"
  }

  return "low"
}

export function analyzeDataset(parsed: ParsedCsv): AnalysisResult {
  const { headers, rows } = parsed
  const rowCount = rows.length
  const columnCount = headers.length

  const duplicateSet = new Set<string>()
  let duplicateRowCount = 0
  for (const row of rows) {
    const key = headers.map((h) => (row[h] ?? "").trim()).join("||")
    if (duplicateSet.has(key)) duplicateRowCount += 1
    duplicateSet.add(key)
  }

  const columnProfiles: ColumnProfile[] = headers.map((name) => {
    const values = rows.map((r) => r[name] ?? "")
    const miss = values.filter(isMissing).length
    const uniq = new Set(values.filter((v) => !isMissing(v))).size
    const normUniq = new Set(
      values.filter((v) => !isMissing(v)).map(normalizeCategory)
    ).size
    return {
      name,
      kind: inferColumnKind(values),
      missingRate: miss / Math.max(values.length, 1),
      uniqueCount: uniq,
      normalizedUniqueCount: normUniq,
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
      const highCardinalityLikely =
        nonMissing > 20 && p.uniqueCount / Math.max(nonMissing, 1) > 0.6
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

  const structuralFindings = []
  if (duplicateRowCount > 0) {
    structuralFindings.push({
      label: "Duplicate rows",
      detail: `${duplicateRowCount} rows repeat exactly and may inflate aggregate comparisons.`,
    })
  }
  const highMissing = missingnessByColumn.filter((m) => m.missingRate >= 0.15)
  if (highMissing.length > 0) {
    structuralFindings.push({
      label: "Missingness concentration",
      detail: `${highMissing
        .slice(0, 3)
        .map((m) => `${m.column} (${(m.missingRate * 100).toFixed(0)}%)`)
        .join(", ")} show the largest data gaps.`,
    })
  }
  const driftCols = categoricalObservations.filter((c) => c.driftLikely)
  if (driftCols.length > 0) {
    structuralFindings.push({
      label: "Category formatting drift",
      detail: `${driftCols
        .slice(0, 2)
        .map((c) => c.column)
        .join(", ")} likely contain casing or spacing inconsistencies.`,
    })
  }
  const hiCardCols = categoricalObservations.filter((c) => c.highCardinalityLikely)
  if (hiCardCols.length > 0) {
    structuralFindings.push({
      label: "Suspicious high cardinality",
      detail: `${hiCardCols
        .slice(0, 2)
        .map((c) => c.column)
        .join(", ")} may behave more like identifiers than comparison groups.`,
    })
  }
  const outlierCols = numericSummaries.filter((n) => n.outlierCount > 0)
  if (outlierCols.length > 0) {
    structuralFindings.push({
      label: "Outlier concentration",
      detail: `${outlierCols
        .slice(0, 2)
        .map((n) => `${n.column} (${n.outlierCount})`)
        .join(", ")} include values that carry disproportionate weight.`,
    })
  }

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
      .filter((p) => p.kind === "mostly-empty")
      .map((p) => p.name),
  }

  function generateDecisionDrivers(input: {
    outlierCols: NumericSummary[]
    driftCols: CategoricalObservation[]
    duplicateCount: number
    dominantDriver: ComparisonChoice["dominantDriver"] | null
    comparison: ComparisonChoice | null
  }): DecisionDriver[] {
    const candidates: Omit<DecisionDriver, "total">[] = []
    const selectedLabel = input.comparison
      ? `${input.comparison.groupingColumn} × ${input.comparison.metricColumn}`
      : "current lens"

    if (input.comparison && input.comparison.confidence.semantic >= 0.7) {
      candidates.push({
        text: "The selected metric retains enough semantic strength to keep the current comparison usable.",
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
        text: `${input.comparison.groupingColumn} preserves enough structural coherence to avoid rejection of ${selectedLabel}.`,
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
      const top = input.outlierCols.slice().sort((a, b) => b.outlierCount - a.outlierCount)[0]
      const rate = top.count > 0 ? top.outlierCount / top.count : 0
      const isSelectedMetric =
        !!input.comparison && input.comparison.metricColumn === top.column
      candidates.push({
        text: input.comparison
          ? `Outliers in ${top.column} reduce confidence in ${selectedLabel} and distort comparison reliability.`
          : `Outliers in ${top.column} reduce reliability and bias any defensible grouping-metric decision.`,
        impact: rate > 0.2 ? 3 : 2,
        scope: isSelectedMetric ? 3 : 1,
        risk: 3,
        specificity: 2,
        decisionRelevance: isSelectedMetric ? 3 : 1,
        alignment: rate > 0.35 ? "blocks" : "weakens",
        affects: rate > 0.35 ? ["comparison", "verdict", "confidence"] : ["confidence", "tension"],
      })
    }

    if (input.duplicateCount > 0) {
      const duplicateRate = input.duplicateCount / Math.max(rowCount, 1)
      candidates.push({
        text: input.comparison
          ? `${input.duplicateCount} duplicate rows slightly inflate aggregates, weakening summary reliability for ${selectedLabel}.`
          : `${input.duplicateCount} duplicate rows inflate repeated patterns and weaken reliability for a comparison decision.`,
        impact: duplicateRate >= 0.1 ? 3 : 2,
        scope: duplicateRate >= 0.1 ? 2 : 1,
        risk: duplicateRate >= 0.08 ? 3 : 2,
        specificity: 2,
        decisionRelevance: duplicateRate >= 0.08 ? 2 : 1,
        alignment: "weakens",
        affects: ["confidence"],
      })
    }

    if (input.driftCols.length > 0) {
      candidates.push({
        text: input.comparison
          ? `Category drift in ${input.driftCols[0].column} biases grouping boundaries and limits confidence in ${selectedLabel}.`
          : `Category drift in ${input.driftCols[0].column} biases grouping boundaries and blocks a defensible comparison.`,
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
        text: `A stronger alternative grouping (${input.dominantDriver.primaryDriver}) limits the interpretive weight of ${selectedLabel} and reduces confidence.`,
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
        text: "No grouping establishes a stable explanatory structure, so comparison is withheld.",
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

  const rankedDrivers = generateDecisionDrivers({
    outlierCols,
    driftCols,
    duplicateCount: duplicateRowCount,
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
      "No comparison is accepted.\n\nThe current structure does not support a defensible grouping–metric relationship.\n\nPresenting a comparison here would introduce more distortion than insight."
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

    const confidenceCause =
      comparison.confidence.overall === "high"
        ? "Confidence remains high because structural and semantic support outweigh identified distortion."
        : comparison.confidence.overall === "medium"
          ? "Confidence is reduced because the current lens remains exposed to structural instability."
          : "Confidence is low because the current lens remains materially weakened."

    const driverSummary =
      topDrivers.length > 0
        ? topDrivers.map((d) => d.text).join(" ")
        : "No strong decision driver was retained."
    comparison.reason = `${driverSummary} ${confidenceCause}`
  }

  const interpretationParagraphs: string[] = []
  if (!comparison) {
    interpretationParagraphs.push("No comparison is accepted.")
    interpretationParagraphs.push(
      "The current structure does not support a defensible grouping–metric relationship."
    )
  } else if (
    comparison.confidence.overall === "low"
  ) {
    interpretationParagraphs.push(
      "This comparison is weak and should not be relied on."
    )
    interpretationParagraphs.push(
      "Confidence is low because structural distortion remains unresolved."
    )
    interpretationParagraphs.push(
      "The table invites comparison, but not yet confidence."
    )
  } else if (comparison.verdict === "weak") {
    interpretationParagraphs.push(
      "This comparison is usable, but materially constrained."
    )
    interpretationParagraphs.push(
      "The selected lens remains readable, though materially constrained."
    )
    interpretationParagraphs.push(
      "The table invites comparison, but not yet confidence."
    )
  } else {
    interpretationParagraphs.push(
      "This comparison remains defensible."
    )
    interpretationParagraphs.push(
      "The selected lens is structurally and semantically supportable."
    )
    interpretationParagraphs.push(
      "The table invites comparison, but not yet confidence."
    )
  }

  const highlights = topDrivers.map((d) => d.text)

  return {
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
  }
}

