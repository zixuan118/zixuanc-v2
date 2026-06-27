import { parseCsvText } from "@/lib/data-studio/csv"
import type { IntakeFormat, IntakeResult, ParsedCsv } from "@/lib/data-studio/types"

const PREVIEW_ROWS = 5

function ext(name: string): string {
  const i = name.lastIndexOf(".")
  return i >= 0 ? name.slice(i + 1).toLowerCase() : ""
}

export function detectDelimiter(line: string): string {
  const candidates = ["\t", ",", ";", "|"]
  let best = ","
  let bestCount = -1
  for (const d of candidates) {
    const c = line.split(d).length - 1
    if (c > bestCount) {
      bestCount = c
      best = d
    }
  }
  return best
}

function parseDelimitedText(text: string, delimiter: string): ParsedCsv {
  const normalized = text.replace(/\r\n/g, "\n").replace(/\r/g, "\n")
  const lines = normalized.split("\n").filter((l) => l.trim().length > 0)
  if (lines.length === 0) return { headers: [], rows: [] }

  if (delimiter === "\t") {
    const headers = lines[0].split("\t").map((h, i) => h.trim() || `column_${i + 1}`)
    const rows = lines.slice(1).map((line) => {
      const vals = line.split("\t")
      const row: Record<string, string> = {}
      headers.forEach((h, idx) => {
        row[h] = (vals[idx] ?? "").trim()
      })
      return row
    })
    return { headers, rows }
  }

  const asCsv = lines.join("\n")
  return parseCsvText(asCsv)
}

function buildMeta(
  parsed: ParsedCsv,
  fileName: string,
  format: IntakeFormat,
  delimiter: string | null,
  sheetName: string | null,
  warnings: string[],
): IntakeResult {
  return {
    parsed,
    meta: {
      fileName,
      format,
      delimiter,
      sheetName,
      warnings,
      rowCount: parsed.rows.length,
      columnCount: parsed.headers.length,
      previewHeaders: parsed.headers,
      previewRows: parsed.rows.slice(0, PREVIEW_ROWS),
    },
  }
}

export async function intakeFile(file: File): Promise<IntakeResult> {
  const extension = ext(file.name)
  const warnings: string[] = []

  if (extension === "xlsx" || extension === "xls") {
    const buf = await file.arrayBuffer()
    const XLSX = await import("xlsx")
    const wb = XLSX.read(buf, { type: "array" })
    const sheetName = wb.SheetNames[0]
    if (!sheetName) {
      return buildMeta({ headers: [], rows: [] }, file.name, "xlsx", null, null, [
        "No sheets found in workbook.",
      ])
    }
    if (wb.SheetNames.length > 1) {
      warnings.push(`Using first sheet only: "${sheetName}".`)
    }
    const sheet = wb.Sheets[sheetName]
    const json = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      defval: "",
      raw: false,
    })
    const headers =
      json.length > 0
        ? Object.keys(json[0])
        : (XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 })[0] as
            | string[]
            | undefined)?.map(String) ?? []
    const rows = json.map((row) => {
      const out: Record<string, string> = {}
      for (const h of headers) {
        out[h] = String(row[h] ?? "").trim()
      }
      return out
    })
    return buildMeta({ headers, rows }, file.name, "xlsx", null, sheetName, warnings)
  }

  const text = await file.text()
  if (!text.trim()) {
    return buildMeta({ headers: [], rows: [] }, file.name, "txt", null, null, [
      "File is empty.",
    ])
  }

  const firstLine = text.split(/\r?\n/).find((l) => l.trim()) ?? ""
  let format: IntakeFormat = "csv"
  let delimiter: string | null = ","

  if (extension === "tsv" || extension === "tab") {
    format = "tsv"
    delimiter = "\t"
  } else if (extension === "txt") {
    format = "txt"
    delimiter = detectDelimiter(firstLine)
    if (delimiter !== ",") {
      warnings.push(`TXT parsed with detected delimiter "${delimiter === "\t" ? "tab" : delimiter}".`)
    }
  } else {
    delimiter = detectDelimiter(firstLine)
    if (delimiter === "\t") format = "tsv"
  }

  const parsed =
    delimiter === "\t"
      ? parseDelimitedText(text, "\t")
      : delimiter === ","
        ? parseCsvText(text)
        : parseDelimitedText(text, delimiter)

  if (parsed.headers.length === 0) {
    warnings.push("No columns detected.")
  }
  if (parsed.rows.length === 0 && parsed.headers.length > 0) {
    warnings.push("Headers found but no data rows.")
  }

  return buildMeta(parsed, file.name, format, delimiter, null, warnings)
}

export function intakeFromSampleCsv(
  fileName: string,
  csvText: string,
): IntakeResult {
  const parsed = parseCsvText(csvText)
  return buildMeta(parsed, fileName, "csv", ",", null, [])
}
