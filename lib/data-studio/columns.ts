import type { ColumnProfile } from "@/lib/data-studio/types"
import { normalizeCategoryKey } from "@/lib/data-studio/values"

/** Identifier-like column names — unsafe for grouping or category charts. */
export function isIdentifierColumnName(name: string): boolean {
  const n = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ")
  const tokens = n.split(" ").filter(Boolean)
  if (tokens.some((t) => ["id", "uuid", "guid", "key"].includes(t))) return true
  if (n.includes("record id") || n === "record id") return true
  if (n.includes("row id") || n.includes("order id") || n.includes("customer id"))
    return true
  if (
    n.includes("source export") ||
    n.includes("export name") ||
    n.includes("file name") ||
    n.includes("filename")
  )
    return true
  if (n.includes("postal") || tokens.includes("zip")) return true
  if (tokens.includes("code") && !n.includes("postal")) return true
  return false
}

export function isHighCardinalityIdentifier(
  profile: ColumnProfile,
  rowCount: number,
): boolean {
  if (profile.kind === "mostly-empty") return false
  const ratio = profile.uniqueCount / Math.max(rowCount, 1)
  if (isIdentifierColumnName(profile.name)) return true
  if (ratio >= 0.55 && profile.uniqueCount > 8) return true
  if (profile.name.toLowerCase().includes("property_name") && ratio > 0.35)
    return true
  return false
}

export function isVisualizableCategory(
  profile: ColumnProfile,
  rowCount: number,
): boolean {
  if (profile.kind !== "categorical") return false
  if (isIdentifierColumnName(profile.name)) return false
  if (isHighCardinalityIdentifier(profile, rowCount)) return false
  if (profile.missingRate >= 0.9) return false
  return profile.uniqueCount >= 2 && profile.uniqueCount <= 24
}

const PREFERRED_CATEGORY_ORDER = [
  "neighborhood",
  "unit_type",
  "unit type",
  "tenant_segment",
  "tenant segment",
  "lead_channel",
  "lead channel",
  "segment",
  "region",
  "channel",
  "category",
]

export function pickBestCategoryColumn(
  profiles: ColumnProfile[],
  rowCount: number,
): string | null {
  const eligible = profiles.filter((p) => isVisualizableCategory(p, rowCount))
  if (eligible.length === 0) return null
  const score = (name: string) => {
    const n = name.toLowerCase()
    const idx = PREFERRED_CATEGORY_ORDER.findIndex((p) => n.includes(p))
    return idx >= 0 ? 100 - idx : 0
  }
  eligible.sort((a, b) => score(b.name) - score(a.name) || a.name.localeCompare(b.name))
  return eligible[0]?.name ?? null
}

export function getGroupingSemanticScore(name: string): number {
  const n = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ")
  const tokens = n.split(" ").filter(Boolean)
  const has = (list: string[]) => list.some((t) => tokens.includes(t) || n.includes(t))

  if (isIdentifierColumnName(name)) return -1.5
  if (has(["record", "export", "source", "file"])) return -1.2

  if (has(["neighborhood", "neighbourhood"])) return 1.0
  if (has(["unit", "type"]) && n.includes("unit")) return 0.95
  if (has(["tenant", "segment"])) return 0.9
  if (has(["lead", "channel"])) return 0.88
  if (has(["region", "segment", "channel", "category", "market"])) return 0.75

  if (has(["manager", "property"])) return 0.35
  if (has(["month", "week", "date", "period"])) return 0.2

  return 0.15
}

export function getMetricSemanticScore(name: string): number {
  const n = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ")
  const tokens = n.split(" ").filter(Boolean)
  const has = (list: string[]) => list.some((t) => tokens.includes(t) || n.includes(t))

  if (isIdentifierColumnName(name)) return -1.0
  if (has(["id", "code", "zip", "key"])) return -1.0

  if (has(["asking", "rent"]) || n === "asking rent") return 0.95
  if (has(["signed", "rent"])) return 0.92
  if (n.includes("rent")) return 0.88
  if (has(["revenue", "sales", "profit"])) return 0.9
  if (has(["leads"])) return 0.85
  if (has(["applications", "application"])) return 0.84
  if (has(["orders", "order"])) return 0.8
  if (has(["margin"])) return 0.65
  if (has(["concession"])) return 0.55
  if (has(["cost", "price"])) return 0.6
  if (has(["quantity", "units", "count"])) return 0.5
  if (has(["amount", "total", "value"])) return 0.35

  return 0.1
}

/** Penalty when a pairing is likely confounded or operational, not analytical. */
export function getPairConfoundPenalty(
  groupingColumn: string,
  metricColumn: string,
): number {
  const g = groupingColumn.toLowerCase()
  const m = metricColumn.toLowerCase()
  if (g.includes("manager") && m.includes("concession")) return 0.85
  if (g.includes("manager") && (m.includes("rent") || m.includes("signed")))
    return 0.45
  if (g.includes("property_name") || g.includes("property name")) return 0.7
  if (g.includes("record") || g.includes("export")) return 1.0
  return 0
}

export function normalizeCategoryForGrouping(v: string): string {
  return normalizeCategoryKey(v)
}

export function getColumnDisplayLabel(
  profile: ColumnProfile,
  rowCount: number,
): string {
  const n = profile.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_")
  if (n === "record_id") return "identifier"
  if (n === "source_export_name" || n.includes("source_export")) return "identifier"
  if (n === "notes" || isFreeTextColumnName(profile.name)) return "text"
  if (n.includes("property_name")) {
    return isHighCardinalityIdentifier(profile, rowCount)
      ? "identifier-like"
      : "high-cardinality category"
  }
  if (isIdentifierColumnName(profile.name)) return "identifier"

  const kindLabels: Record<ColumnProfile["kind"], string> = {
    numeric: "numeric",
    categorical: "category",
    "date-like": "date",
    "mostly-empty": "mostly empty",
  }
  let label = kindLabels[profile.kind]
  if (profile.kind === "numeric" && profile.invalidNumericCountBeforeCleaning > 0) {
    const ex = profile.invalidNumericExamples[0]
    label += ` · ${profile.invalidNumericCountBeforeCleaning} invalid converted to missing`
    if (ex) label += `: "${ex}"`
  }
  return label
}

export function isFreeTextColumnName(name: string): boolean {
  const n = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ")
  const tokens = n.split(" ").filter(Boolean)
  return tokens.some((t) =>
    ["notes", "note", "comment", "comments", "description", "remarks", "memo", "narrative"].includes(t),
  )
}

export function isUrlLike(v: string): boolean {
  const s = v.trim()
  return /^https?:\/\//i.test(s) || /^www\./i.test(s)
}

export function isEmailLike(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
}

export function looksLikeFilenameValue(v: string): boolean {
  return /\.(csv|tsv|xlsx|xls|txt|json|pdf)$/i.test(v.trim())
}

export function isEligibleForCategoryNormalization(input: {
  columnName: string
  kind: ColumnProfile["kind"]
  uniqueCount: number
  rowCount: number
}): boolean {
  const { columnName, kind, uniqueCount, rowCount } = input
  if (kind !== "categorical") return false
  if (isIdentifierColumnName(columnName)) return false
  if (isFreeTextColumnName(columnName)) return false
  const n = columnName.toLowerCase()
  if (
    n.includes("export") ||
    n.includes("source") ||
    n.includes("file") ||
    n.includes("filename")
  )
    return false
  if (uniqueCount > 24 || uniqueCount < 2) return false
  const ratio = uniqueCount / Math.max(rowCount, 1)
  if (ratio > 0.45) return false
  return true
}

/** Sort cleaning examples: useful category / numeric changes first. */
export function cleaningExamplePriority(column: string, operation: string): number {
  if (isIdentifierColumnName(column) || isFreeTextColumnName(column)) return -1000
  const n = column.toLowerCase()
  if (n.includes("export") || n.includes("source") || n.includes("file")) return -800
  if (n.includes("notes") || n.includes("comment")) return -700

  let score = 0
  if (operation === "category-normalization") score += 200
  if (operation === "invalid-numeric") score += 180
  if (operation === "empty-sentinel") score += 40

  const preferred = [
    "tenant_segment",
    "lead_channel",
    "unit_type",
    "neighborhood",
    "property_manager",
    "broker_fee",
  ]
  for (let i = 0; i < preferred.length; i++) {
    if (n.includes(preferred[i].replace("_", " ")) || n.includes(preferred[i]))
      score += 80 - i * 8
  }
  return score
}
