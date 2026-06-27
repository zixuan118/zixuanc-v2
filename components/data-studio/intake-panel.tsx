"use client"

import { useRef } from "react"
import type { IntakeMeta } from "@/lib/data-studio/types"
import styles from "@/components/data-studio/data-studio.module.css"

type IntakePanelProps = {
  meta: IntakeMeta | null
  cleanedRowCount?: number
  onSelectFile: (file: File) => void
  onUseSample: () => void
  onDownloadCsv?: () => void
  onDownloadJson?: () => void
  onDownloadCleaningLog?: () => void
  onDownloadXlsx?: () => void
  exportReady?: boolean
}

function formatLabel(format: IntakeMeta["format"]) {
  if (format === "tsv") return "TSV"
  if (format === "xlsx") return "XLSX"
  return format.toUpperCase()
}

function formatDelimiter(d: string | null) {
  if (d === null) return "n/a"
  if (d === "\t") return "tab"
  return d
}

export function IntakePanel({
  meta,
  cleanedRowCount,
  onSelectFile,
  onUseSample,
  onDownloadCsv,
  onDownloadJson,
  onDownloadCleaningLog,
  onDownloadXlsx,
  exportReady = false,
}: IntakePanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="border-t border-[var(--ds-border-soft)] pt-9 md:pt-11">
      <p className={styles.dsSubsectionLabel}>File intake</p>
      <div
        className={`${styles.dsCard} px-5 py-5 md:px-6 md:py-6`}
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (file) onSelectFile(file)
        }}
      >
        <p className={styles.dsBody}>
          Upload CSV, TSV, TXT, or XLSX. Parsing and cleaning stay in the
          browser. The original file is never uploaded.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={`${styles.dsBtn} inline-flex items-center rounded-sm px-3.5 py-1.5 text-[11px] tracking-[0.1em] uppercase`}
          >
            Select file
          </button>
          <button
            type="button"
            onClick={onUseSample}
            className={`${styles.dsBtn} inline-flex items-center rounded-sm px-3.5 py-1.5 text-[11px] tracking-[0.1em] uppercase opacity-85`}
          >
            Use sample dataset
          </button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,.txt,.xlsx,.xls,text/csv,text/tab-separated-values,text/plain,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onSelectFile(file)
          }}
        />

        {meta ? (
          <div className="mt-6 border-t border-[var(--ds-border-soft)] pt-5">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-5 gap-y-3 text-[13px]">
              <div>
                <p className={styles.dsLabel}>File</p>
                <p className={`${styles.dsMetricValue} mt-1 truncate`}>
                  {meta.fileName}
                </p>
              </div>
              <div>
                <p className={styles.dsLabel}>Type</p>
                <p className={`${styles.dsMetricValue} mt-1`}>
                  {formatLabel(meta.format)}
                </p>
              </div>
              <div>
                <p className={styles.dsLabel}>Delimiter</p>
                <p className={`${styles.dsMetricValue} mt-1`}>
                  {formatDelimiter(meta.delimiter)}
                </p>
              </div>
              {meta.sheetName ? (
                <div>
                  <p className={styles.dsLabel}>Sheet</p>
                  <p className={`${styles.dsMetricValue} mt-1`}>{meta.sheetName}</p>
                </div>
              ) : null}
              <div>
                <p className={styles.dsLabel}>Rows (raw)</p>
                <p className={`${styles.dsMetricValue} mt-1`}>
                  {meta.rowCount.toLocaleString()}
                </p>
              </div>
              {cleanedRowCount !== undefined ? (
                <div>
                  <p className={styles.dsLabel}>Rows (cleaned)</p>
                  <p className={`${styles.dsMetricValue} mt-1`}>
                    {cleanedRowCount.toLocaleString()}
                  </p>
                </div>
              ) : null}
              <div>
                <p className={styles.dsLabel}>Columns</p>
                <p className={`${styles.dsMetricValue} mt-1`}>{meta.columnCount}</p>
              </div>
            </div>

            {meta.warnings.length > 0 ? (
              <ul className={`${styles.dsBody} mt-4 space-y-1.5 text-[13px] list-disc pl-5`}>
                {meta.warnings.map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
              </ul>
            ) : null}

            {meta.previewHeaders.length > 0 ? (
              <div className="mt-5">
                <p className={styles.dsLabel}>Raw preview</p>
                <p className={`${styles.dsHint} mt-1 mb-2`}>
                  Original file preview before cleaning.
                </p>
                <div className={styles.dsTableWrap}>
                <table className={styles.dsTable}>
                  <thead>
                    <tr>
                      {meta.previewHeaders.map((h) => (
                        <th key={h}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {meta.previewRows.map((row, ri) => (
                      <tr key={ri}>
                        {meta.previewHeaders.map((h) => (
                          <td key={h} className="max-w-[140px] truncate">
                            {row[h] ?? ""}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
              </div>
            ) : null}

            {exportReady ? (
              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={onDownloadCsv}
                  className={`${styles.dsBtn} rounded-sm px-3 py-1 text-[10px] tracking-[0.08em] uppercase`}
                >
                  Cleaned CSV
                </button>
                <button
                  type="button"
                  onClick={onDownloadXlsx}
                  className={`${styles.dsBtn} rounded-sm px-3 py-1 text-[10px] tracking-[0.08em] uppercase`}
                >
                  Cleaned XLSX
                </button>
                <button
                  type="button"
                  onClick={onDownloadJson}
                  className={`${styles.dsBtn} rounded-sm px-3 py-1 text-[10px] tracking-[0.08em] uppercase`}
                >
                  Profile JSON
                </button>
                <button
                  type="button"
                  onClick={onDownloadCleaningLog}
                  className={`${styles.dsBtn} rounded-sm px-3 py-1 text-[10px] tracking-[0.08em] uppercase`}
                >
                  Cleaning log JSON
                </button>
              </div>
            ) : null}
          </div>
        ) : (
          <p className={`${styles.dsHint} mt-4`}>No file selected</p>
        )}
      </div>
    </section>
  )
}
