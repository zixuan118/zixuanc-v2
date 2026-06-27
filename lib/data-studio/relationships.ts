import type {
  AnalysisResult,
  DeterministicRelationshipCandidate,
  ParsedCsv,
} from "@/lib/data-studio/types"
import {
  getGroupingSemanticScore,
  getMetricSemanticScore,
  getPairConfoundPenalty,
  isIdentifierColumnName,
  normalizeCategoryForGrouping,
} from "@/lib/data-studio/columns"
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

export function buildRelationshipCandidates(
  parsed: ParsedCsv,
  analysis: AnalysisResult,
): DeterministicRelationshipCandidate[] {
  const out: DeterministicRelationshipCandidate[] = []
  let id = 0
  const nid = () => `rel-${++id}`
  const { profile, columnProfiles, numericSummaries, comparison } = analysis
  const rowCount = profile.rowCount

  const numericNames = profile.numericColumns
  for (let i = 0; i < numericNames.length; i++) {
    for (let j = i + 1; j < numericNames.length; j++) {
      const a = numericNames[i]
      const b = numericNames[j]
      const xs: number[] = []
      const ys: number[] = []
      for (const row of parsed.rows) {
        const x = parseNumeric(row[a] ?? "")
        const y = parseNumeric(row[b] ?? "")
        if (x === null || y === null) continue
        xs.push(x)
        ys.push(y)
      }
      if (xs.length < 6) continue
      const r = pearson(xs, ys)
      const isRentPair =
        a.toLowerCase().includes("rent") && b.toLowerCase().includes("rent")
      out.push({
        id: nid(),
        title: `${a} × ${b}`,
        variables: [a, b],
        relationshipType: "correlation",
        correlation: Number(r.toFixed(3)),
        sampleSize: xs.length,
        computedEvidence: [
          `Pearson r = ${r.toFixed(3)} over ${xs.length} paired rows.`,
        ],
        cautions: isRentPair
          ? [
              "Signed and asking rent move together but concessions and mix may separate them.",
            ]
          : ["Correlation is descriptive only; not adjusted for mix or seasonality."],
      })
    }
  }

  const catCols = columnProfiles.filter(
    (p) =>
      p.kind === "categorical" &&
      !isIdentifierColumnName(p.name) &&
      p.uniqueCount >= 2 &&
      p.uniqueCount <= 16,
  )
  const metrics = numericSummaries.filter((n) => n.count >= 6)

  for (const cat of catCols) {
    for (const metric of metrics) {
      const groups = new Map<string, number[]>()
      for (const row of parsed.rows) {
        const g = row[cat.name]
        const m = parseNumeric(row[metric.column] ?? "")
        if (isMissing(g) || m === null) continue
        const key = normalizeCategoryForGrouping(g)
        const arr = groups.get(key) ?? []
        arr.push(m)
        groups.set(key, arr)
      }
      if (groups.size < 2) continue
      const groupStats = [...groups.entries()].map(([g, vals]) => ({
        group: g,
        mean: mean(vals),
        count: vals.length,
      }))
      groupStats.sort((a, b) => b.mean - a.mean)
      const confound = getPairConfoundPenalty(cat.name, metric.column)
      const gSem = getGroupingSemanticScore(cat.name)
      const mSem = getMetricSemanticScore(metric.column)
      out.push({
        id: nid(),
        title: `${cat.name} × ${metric.column}`,
        variables: [cat.name, metric.column],
        relationshipType:
          confound >= 0.5 ? "possible-confounder" : "group-difference",
        groupCount: groups.size,
        sampleSize: rowCount,
        computedEvidence: [
          `${groups.size} groups; top mean ${groupStats[0]?.group}: ${groupStats[0]?.mean.toFixed(1)} (n=${groupStats[0]?.count}).`,
          `Semantic grouping score ${gSem.toFixed(2)}, metric score ${mSem.toFixed(2)}.`,
        ],
        cautions:
          confound >= 0.5
            ? [
                "Pairing may be confounded by territory, unit mix, or tenant mix.",
              ]
            : [
                "Group means are unadjusted; small groups may distort rank order.",
              ],
      })
    }
  }

  const dateCol = profile.dateLikeColumns[0]
  const rentMetric =
    numericNames.find((n) => n.toLowerCase().includes("asking")) ??
    numericNames[0]
  if (dateCol && rentMetric) {
    const buckets = new Map<string, number[]>()
    for (const row of parsed.rows) {
      const d = (row[dateCol] ?? "").trim()
      const v = parseNumeric(row[rentMetric] ?? "")
      if (!d || v === null) continue
      const arr = buckets.get(d) ?? []
      arr.push(v)
      buckets.set(d, arr)
    }
    if (buckets.size >= 3) {
      out.push({
        id: nid(),
        title: `${dateCol} × ${rentMetric}`,
        variables: [dateCol, rentMetric],
        relationshipType: "trend",
        groupCount: buckets.size,
        sampleSize: rowCount,
        computedEvidence: [
          `${buckets.size} distinct periods aggregated; mean ${rentMetric} computed per period.`,
        ],
        cautions: [
          "Descriptive trend only; not adjusted for unit mix or property mix.",
        ],
      })
    }
  }

  const leadChannel = catCols.find((c) =>
    c.name.toLowerCase().includes("channel"),
  )
  const leads = metrics.find((m) => m.column.toLowerCase().includes("lead"))
  const apps = metrics.find((m) =>
    m.column.toLowerCase().includes("application"),
  )
  if (leadChannel && leads) {
    out.push({
      id: nid(),
      title: `${leadChannel.name} × ${leads.column}`,
      variables: [leadChannel.name, leads.column],
      relationshipType: "funnel",
      sampleSize: rowCount,
      computedEvidence: [
        `Funnel-style read: channel totals against ${leads.column}.`,
      ],
      cautions: [
        "Channel totals describe flow, not proof of channel quality or ROI.",
      ],
    })
  }
  if (leadChannel && apps) {
    out.push({
      id: nid(),
      title: `${leadChannel.name} × ${apps.column}`,
      variables: [leadChannel.name, apps.column],
      relationshipType: "funnel",
      sampleSize: rowCount,
      computedEvidence: [
        `Funnel-style read: channel totals against ${apps.column}.`,
      ],
      cautions: ["Application counts may reflect mix, not conversion quality."],
    })
  }

  if (comparison) {
    const confound = getPairConfoundPenalty(
      comparison.groupingColumn,
      comparison.metricColumn,
    )
    if (confound >= 0.4) {
      out.push({
        id: nid(),
        title: `Selected: ${comparison.groupingColumn} × ${comparison.metricColumn}`,
        variables: [comparison.groupingColumn, comparison.metricColumn],
        relationshipType: "possible-confounder",
        sampleSize: rowCount,
        computedEvidence: [
          `Selected comparison confidence: ${comparison.confidence.overall}.`,
        ],
        cautions: [
          "Do not treat this as performance attribution without controlling for mix.",
        ],
      })
    }
  }

  for (const p of columnProfiles.filter(
    (c) => c.invalidNumericCountBeforeCleaning > 0,
  )) {
    out.push({
      id: nid(),
      title: `${p.name} data quality`,
      variables: [p.name],
      relationshipType: "quality-risk",
      sampleSize: rowCount,
      computedEvidence: [
        `${p.invalidNumericCountBeforeCleaning} non-numeric value(s) converted to missing; examples: ${p.invalidNumericExamples.slice(0, 2).map((e) => `"${e}"`).join(", ")}.`,
      ],
      cautions: ["Invalid values were converted to missing in cleaned export."],
    })
  }

  return out.slice(0, 14)
}
