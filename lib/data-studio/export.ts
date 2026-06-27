import type { AnalysisResult } from "@/lib/data-studio/types"
import { rowsToCsvText } from "@/lib/data-studio/csv"

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}

function baseName(fileName: string) {
  return fileName.replace(/\.[^.]+$/, "") || "dataset"
}

export function downloadCleanedCsv(analysis: AnalysisResult, fileName: string) {
  const text = rowsToCsvText(analysis.cleanedParsed)
  triggerDownload(
    new Blob([text], { type: "text/csv;charset=utf-8" }),
    `${baseName(fileName)}-cleaned.csv`,
  )
}

export function downloadProfileJson(
  analysis: AnalysisResult,
  intakeMeta: { fileName: string; format: string; delimiter: string | null },
  fileName: string,
) {
  const payload = {
    exportedAt: new Date().toISOString(),
    source: intakeMeta,
    profile: analysis.profile,
    cleaning: analysis.cleaning,
    audit: analysis.audit,
    duplicateRowCount: analysis.duplicateRowCount,
    missingnessByColumn: analysis.missingnessByColumn,
    columnProfiles: analysis.columnProfiles,
    numericSummaries: analysis.numericSummaries,
    categoricalObservations: analysis.categoricalObservations,
    structuralFindings: analysis.structuralFindings,
    analysisPlan: analysis.analysisPlan,
    comparison: analysis.comparison,
    noComparisonReason: analysis.noComparisonReason,
    relationshipCandidates: analysis.relationshipCandidates,
    highlights: analysis.highlights,
  }
  triggerDownload(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    `${baseName(fileName)}-profile.json`,
  )
}

export function downloadCleaningLogJson(analysis: AnalysisResult, fileName: string) {
  const payload = {
    exportedAt: new Date().toISOString(),
    cleaning: analysis.cleaning,
    note: "Original upload is not modified; this log describes deterministic cleaning applied in-browser.",
  }
  triggerDownload(
    new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }),
    `${baseName(fileName)}-cleaning-log.json`,
  )
}

export async function downloadCleanedXlsx(
  analysis: AnalysisResult,
  fileName: string,
) {
  const cleaned = analysis.cleanedParsed
  const XLSX = await import("xlsx")
  const sheet = XLSX.utils.json_to_sheet(
    cleaned.rows.map((r) => {
      const o: Record<string, string> = {}
      for (const h of cleaned.headers) o[h] = r[h] ?? ""
      return o
    }),
    { header: cleaned.headers },
  )
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, sheet, "cleaned")
  const buf = XLSX.write(wb, { bookType: "xlsx", type: "array" })
  triggerDownload(
    new Blob([buf], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    `${baseName(fileName)}-cleaned.xlsx`,
  )
}
