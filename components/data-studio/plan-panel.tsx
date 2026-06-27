"use client"

import {
  buildSelectedComparisonCopy,
  readinessLabel,
} from "@/lib/data-studio/copy"
import type { AnalysisCandidate, AnalysisResult } from "@/lib/data-studio/types"
import styles from "@/components/data-studio/data-studio.module.css"

function statusLabel(status: AnalysisCandidate["status"]) {
  if (status === "possible") return "Possible"
  return "Rejected"
}

function cardClass(status: AnalysisCandidate["status"]) {
  if (status === "rejected") return styles.dsCardTerracotta
  return styles.dsCardPlain
}

export function PlanPanel({ result }: { result: AnalysisResult }) {
  const selectedCopy = result.comparison
    ? buildSelectedComparisonCopy(result.comparison, result.numericSummaries)
    : null

  const otherCandidates = result.analysisPlan.filter(
    (c) => c.status !== "selected",
  )

  const groups: AnalysisCandidate["status"][] = ["possible", "rejected"]

  const byStatus = (s: AnalysisCandidate["status"]) =>
    otherCandidates.filter((c) => c.status === s)

  return (
    <section>
      <p className={styles.dsSubsectionLabel}>Analysis plan</p>
      <p className={`${styles.dsBody} mb-4`}>
        What the cleaned table can support, and what it cannot, before any chart
        is drawn.
      </p>

      {result.comparison && selectedCopy ? (
        <div
          className={`${styles.dsCard} ${
            result.comparison.readiness === "stable"
              ? styles.dsCardSage
              : result.comparison.readiness === "not-recommended"
                ? styles.dsCardTerracotta
                : styles.dsCardAmber
          } mb-5`}
        >
          <p className={styles.dsLabel}>Selected comparison</p>
          <p className={`${styles.dsBody} mt-1.5`}>
            {result.comparison.groupingColumn} × {result.comparison.metricColumn}
            {". "}
            Readiness: {readinessLabel(result.comparison.readiness).toLowerCase()}.
          </p>
          <p className={`${styles.dsBody} mt-2 text-[13px]`}>{selectedCopy.reason}</p>
          {selectedCopy.caution ? (
            <p className={`${styles.dsHint} mt-1.5`}>{selectedCopy.caution}</p>
          ) : null}
        </div>
      ) : (
        <div className={`${styles.dsCard} ${styles.dsCardTerracotta} mb-5`}>
          <p className={styles.dsLabel}>No comparison selected</p>
          <p className={`${styles.dsBody} mt-1.5 whitespace-pre-line`}>
            {result.noComparisonReason ??
              "No grouping and metric pairing passed structural checks."}
          </p>
        </div>
      )}

      {groups.map((status) => {
        const items = byStatus(status)
        if (items.length === 0) return null
        return (
          <div key={status} className="mt-5">
            <p className={styles.dsLabel}>{statusLabel(status)}</p>
            <div className="space-y-3 mt-2.5">
              {items.map((c) => (
                <div key={c.id} className={`${styles.dsCard} ${cardClass(c.status)}`}>
                  <p className={`${styles.dsTitle} text-[13px]`}>{c.label}</p>
                  <p className={`${styles.dsBody} mt-1.5 text-[13px]`}>{c.reason}</p>
                  {c.caution ? (
                    <p className={`${styles.dsHint} mt-1.5`}>{c.caution}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </section>
  )
}
