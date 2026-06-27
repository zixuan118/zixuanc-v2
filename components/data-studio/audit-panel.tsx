"use client"

import type { AnalysisResult } from "@/lib/data-studio/types"
import { getColumnDisplayLabel } from "@/lib/data-studio/columns"
import styles from "@/components/data-studio/data-studio.module.css"

function fmtPct(x: number) {
  return `${(x * 100).toFixed(0)}%`
}

function dotColor(kind: AnalysisResult["columnProfiles"][0]["kind"]) {
  if (kind === "numeric") return "var(--ds-accent-slate)"
  if (kind === "date-like") return "var(--ds-accent-slate)"
  if (kind === "mostly-empty") return "var(--ds-accent-amber)"
  return "var(--ds-accent-sage)"
}

export function AuditPanel({ result }: { result: AnalysisResult }) {
  const { profile, audit, duplicateRowCount, missingnessByColumn, columnProfiles } =
    result

  return (
    <section>
      <p className={styles.dsSubsectionLabel}>Data audit</p>
      <p className={`${styles.dsBody} mb-4`}>
        Deterministic checks on cleaned data: shape, gaps, invalid numerics, and
        fields that would distort comparison.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Rows (cleaned)", value: profile.rowCount.toLocaleString(), tone: "plain" as const },
          { label: "Columns", value: profile.columnCount, tone: "plain" as const },
          { label: "Numeric", value: profile.numericColumns.length, tone: "plain" as const },
          { label: "Categorical", value: profile.categoricalColumns.length, tone: "plain" as const },
          { label: "Mostly empty", value: profile.mostlyEmptyColumns.length, tone: profile.mostlyEmptyColumns.length ? "amber" as const : "plain" as const },
          { label: "Fully empty", value: profile.emptyColumns.length, tone: "plain" as const },
          { label: "Duplicates removed", value: duplicateRowCount, tone: duplicateRowCount ? "amber" as const : "plain" as const },
          { label: "High missing", value: audit.highMissingColumns.length, tone: audit.highMissingColumns.length ? "amber" as const : "plain" as const },
        ].map((m) => (
          <div
            key={m.label}
            className={`${styles.dsCard} ${
              m.tone === "amber" ? styles.dsCardAmber : styles.dsCardPlain
            }`}
          >
            <p className={styles.dsLabel}>{m.label}</p>
            <p className={`${styles.dsMetricValue} mt-1`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className={styles.dsLabel}>Column types</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {columnProfiles.map((p) => (
            <span key={p.name} className={styles.dsBadge}>
              <span
                className={styles.dsBadgeDot}
                style={{ background: dotColor(p.kind) }}
              />
              <span>{p.name}</span>
              <span className="text-[10px] uppercase tracking-[0.06em] opacity-70">
                {getColumnDisplayLabel(p, profile.rowCount)}
              </span>
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6">
        <p className={styles.dsLabel}>Missingness</p>
        <div className="space-y-2.5 mt-2">
          {missingnessByColumn.slice(0, 8).map((m) => (
            <div key={m.column}>
              <div className="flex items-center justify-between text-[12px] mb-1">
                <span>{m.column}</span>
                <span className="tabular-nums">{fmtPct(m.missingRate)}</span>
              </div>
              <div className={styles.dsBarTrack}>
                <div
                  className={styles.dsBarAmber}
                  style={{ width: `${Math.min(100, m.missingRate * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {result.structuralFindings.length > 0 ? (
        <div className="mt-6 space-y-3">
          <p className={styles.dsLabel}>Structural warnings</p>
          {result.structuralFindings.map((f) => (
            <div key={f.label} className={styles.dsWarning}>
              <span className="text-[var(--ds-text-primary)]">{f.label}.</span>{" "}
              {f.detail}
            </div>
          ))}
        </div>
      ) : (
        <p className={`${styles.dsHint} mt-6`}>
          No major structural issues surfaced after cleaning.
        </p>
      )}
    </section>
  )
}
