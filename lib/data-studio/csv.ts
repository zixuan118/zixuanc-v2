import type { ParsedCsv } from "@/lib/data-studio/types"

function splitCsvLine(line: string): string[] {
  const out: string[] = []
  let cur = ""
  let inQuotes = false

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]
    const nxt = line[i + 1]
    if (ch === '"' && inQuotes && nxt === '"') {
      cur += '"'
      i += 1
      continue
    }
    if (ch === '"') {
      inQuotes = !inQuotes
      continue
    }
    if (ch === "," && !inQuotes) {
      out.push(cur)
      cur = ""
      continue
    }
    cur += ch
  }
  out.push(cur)
  return out.map((v) => v.trim())
}

export function parseCsvText(text: string): ParsedCsv {
  const lines = text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .filter((line) => line.trim().length > 0)

  if (lines.length === 0) return { headers: [], rows: [] }

  const rawHeaders = splitCsvLine(lines[0]).map((h, i) =>
    h.length > 0 ? h : `column_${i + 1}`
  )
  const headers: string[] = []
  const used = new Map<string, number>()
  for (const h of rawHeaders) {
    const key = h.trim()
    const n = used.get(key) ?? 0
    used.set(key, n + 1)
    headers.push(n === 0 ? key : `${key}_${n + 1}`)
  }

  const rows: Record<string, string>[] = lines.slice(1).map((line) => {
    const vals = splitCsvLine(line)
    const row: Record<string, string> = {}
    headers.forEach((h, idx) => {
      row[h] = vals[idx] ?? ""
    })
    return row
  })

  return { headers, rows }
}

