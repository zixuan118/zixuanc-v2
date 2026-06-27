/** Shared deterministic value parsing and normalization. */

export const EMPTY_SENTINELS = new Set([
  "",
  "na",
  "n/a",
  "null",
  "none",
  "-",
  "--",
])

export function isEmptySentinel(v: string): boolean {
  return EMPTY_SENTINELS.has(v.trim().toLowerCase())
}

export function isMissing(v: string): boolean {
  return isEmptySentinel(v)
}

export function normalizeCategoryKey(v: string): string {
  return v.trim().replace(/\s+/g, " ").toLowerCase()
}

export function parseNumeric(v: string): number | null {
  const s = v.trim().replace(/[$,%\s]/g, "")
  if (s === "") return null
  const n = Number(s)
  return Number.isFinite(n) ? n : null
}

export function parseDateLike(v: string): number | null {
  const t = Date.parse(v.trim())
  return Number.isFinite(t) ? t : null
}

export function looksLikeIsoDate(v: string): boolean {
  const s = v.trim()
  return /^\d{4}-\d{2}-\d{2}/.test(s) || /^\d{1,2}\/\d{1,2}\/\d{2,4}/.test(s)
}

const KNOWN_ACRONYMS = new Set([
  "YGL",
  "URL",
  "ID",
  "API",
  "CSV",
  "TSV",
  "XLSX",
  "UUID",
  "GUID",
  "LSE",
  "SMB",
  "B2B",
  "B2C",
  "ROI",
  "CRM",
  "ERP",
  "SaaS",
  "SEM",
  "SEO",
])

/** Preserve brand / platform casing when title-casing categories. */
const KNOWN_BRANDS = new Set(["TikTok", "Xiaohongshu", "YGL"])

const CATEGORY_ALIASES: Record<string, string> = {
  "intl student": "International Student",
  "international student": "International Student",
  "apt website": "Apartment Website",
  "apartment website": "Apartment Website",
  "young professional": "Young Professional",
  "studio": "Studio",
  "1 bed": "1 Bed",
  "1bed": "1 Bed",
  "2 bed": "2 Bed",
  "2bed": "2 Bed",
  "3 bed": "3 Bed",
  "3bed": "3 Bed",
  "4 bed": "4 Bed",
  "4bed": "4 Bed",
  smb: "SMB",
  enterprise: "Enterprise",
  "mid market": "Mid-Market",
  "mid-market": "Mid-Market",
  "paid search": "Paid Search",
  direct: "Direct",
  partner: "Partner",
  email: "Email",
  referral: "Referral",
}

export function titleCaseToken(word: string): string {
  if (KNOWN_BRANDS.has(word)) return word
  const upper = word.toUpperCase()
  if (KNOWN_ACRONYMS.has(upper)) return upper
  if (/^\d+$/.test(word)) return word
  if (word.length <= 1) return word.toUpperCase()
  return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
}

export function titleCaseCategory(s: string): string {
  const trimmed = s.trim().replace(/\s+/g, " ")
  const aliasKey = trimmed.toLowerCase()
  if (CATEGORY_ALIASES[aliasKey]) return CATEGORY_ALIASES[aliasKey]
  if (trimmed.includes("-")) {
    return trimmed
      .split("-")
      .map((part) =>
        part
          .split(" ")
          .map(titleCaseToken)
          .join(" "),
      )
      .join("-")
  }
  return trimmed
    .split(" ")
    .map(titleCaseToken)
    .join(" ")
}

export function normalizeCategoryDisplay(raw: string): string {
  const trimmed = raw.trim().replace(/\s+/g, " ")
  const key = trimmed.toLowerCase()
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key]
  return titleCaseCategory(trimmed)
}

export function formatColumnList(columns: string[]): string {
  if (columns.length === 0) return ""
  if (columns.length <= 5) return columns.join(", ")
  return `${columns.slice(0, 5).join(", ")} (+${columns.length - 5} more)`
}
