"use client"

import type { ReactNode } from "react"
import type { AnalysisResult } from "@/lib/data-studio/types"
import { AuditPanel } from "@/components/data-studio/audit-panel"
import { CleaningReceipt } from "@/components/data-studio/cleaning-receipt"
import { PlanPanel } from "@/components/data-studio/plan-panel"
import { VisualBoard } from "@/components/data-studio/visual-board"
import styles from "@/components/data-studio/data-studio.module.css"

function SectionRule({ className = "" }: { className?: string }) {
  return (
    <div
      className={`border-t border-[var(--ds-border-soft)] ${className}`.trim()}
      aria-hidden
    />
  )
}

export function OutputBlocks({
  result,
  visibleStage,
  secondReadingSlot,
  relationshipSlot,
}: {
  result: AnalysisResult
  visibleStage: number
  secondReadingSlot?: ReactNode
  relationshipSlot?: ReactNode
}) {
  const show = (n: number) =>
    visibleStage >= n ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"

  return (
    <div className="mt-10 max-w-3xl">
      <section className={`transition-all duration-500 ${show(1)}`}>
        <CleaningReceipt
          cleaning={result.cleaning}
          columnProfiles={result.columnProfiles}
        />
      </section>

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(1)}`}>
        <AuditPanel result={result} />
      </section>

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(2)}`}>
        <PlanPanel result={result} />
        {relationshipSlot ? (
          <div className={`transition-all duration-500 ${show(2)}`}>
            {relationshipSlot}
          </div>
        ) : null}
      </section>

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(3)}`}>
        <VisualBoard blocks={result.visualBoard} />
      </section>

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(4)}`}>
        <p className={styles.dsSubsectionLabel}>First-pass reading</p>
        <p className={`${styles.dsHint} mb-3`}>
          Written from deterministic metrics only. This is not from the optional
          second reading.
        </p>
        <div className={`${styles.dsBody} space-y-3`}>
          {result.interpretationParagraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {secondReadingSlot ? (
        <div className={`transition-all duration-500 ${show(4)}`}>
          {secondReadingSlot}
          {result.tension !== null ? (
            <section className="mt-8">
              <p className={styles.dsSubsectionLabel}>Reading tension</p>
              <p className={styles.dsBody}>
                {result.tension === "high"
                  ? "The first-pass reading is more confident than the second reading suggests."
                  : result.tension === "medium"
                    ? "The two readings partly disagree. Check outliers and small groups before making decisions."
                    : "The two readings mostly align. Review outliers and small groups before making decisions."}
              </p>
            </section>
          ) : null}
        </div>
      ) : null}

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(4)}`}>
        <p className={styles.dsSubsectionLabel}>Notable highlights</p>
        <ul className={`${styles.dsBody} space-y-2 list-disc pl-5`}>
          {result.highlights.slice(0, 3).map((h, i) => (
            <li key={i}>{h}</li>
          ))}
        </ul>
      </section>
    </div>
  )
}
