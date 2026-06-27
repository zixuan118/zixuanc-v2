"use client"

import type { RelationshipSuggestionsResponse } from "@/lib/data-studio/types"
import styles from "@/components/data-studio/data-studio.module.css"

function fixRelationshipCopy(text: string): string {
  return text.replace(/\ban useful\b/gi, "a useful")
}

function statusTone(
  status: RelationshipSuggestionsResponse["relationshipSuggestions"][0]["status"],
) {
  if (status === "worth-reviewing") return styles.dsCardSage
  if (status === "do-not-claim") return styles.dsCardTerracotta
  return styles.dsCardAmber
}

export function RelationshipPanel({
  suggestions,
  loading,
  error,
  onRequest,
  disabled,
}: {
  suggestions: RelationshipSuggestionsResponse | null
  loading: boolean
  error: string | null
  onRequest: () => void
  disabled?: boolean
}) {
  return (
    <section className={`mt-8 ${styles.dsCard} ${styles.dsCardPlain}`}>
      <p className={styles.dsSubsectionLabel}>Relationship review</p>
      <p className={`${styles.dsBody} mb-1 max-w-2xl`}>
        Optional review suggests relationships based on computed summaries and
        column names.
      </p>
      <p className={`${styles.dsHint} mb-4`}>
        These suggestions do not prove cause and effect. They flag what may be worth
        reviewing further.
      </p>
      <button
        type="button"
        onClick={onRequest}
        disabled={disabled || loading}
        className={`${styles.dsBtn} inline-flex items-center rounded-sm px-4 py-2 text-[11px] tracking-[0.1em] uppercase disabled:opacity-55`}
      >
        Review relationship candidates
      </button>

      {loading ? (
        <p className={`${styles.dsHint} mt-4`}>Reviewing computed candidates…</p>
      ) : null}
      {error ? <p className={`${styles.dsHint} mt-4`}>{error}</p> : null}

      {suggestions ? (
        <div className="mt-6 space-y-4">
          {suggestions.relationshipSuggestions.map((s, i) => (
            <div
              key={i}
              className={`${styles.dsCard} ${statusTone(s.status)}`}
            >
              <p className={`${styles.dsTitle} text-[13px]`}>{s.title}</p>
              <p className={`${styles.dsHint} mt-1`}>{fixRelationshipCopy(s.plainEnglishReason)}</p>
              {s.supportingComputedEvidence.length > 0 ? (
                <ul className={`${styles.dsBody} mt-2 space-y-1 text-[13px] list-disc pl-5`}>
                  {s.supportingComputedEvidence.map((e, j) => (
                    <li key={j}>{e}</li>
                  ))}
                </ul>
              ) : null}
              {s.cautions.length > 0 ? (
                <p className={`${styles.dsHint} mt-2 text-[12px]`}>
                  {s.cautions.join(" ")}
                </p>
              ) : null}
            </div>
          ))}

          {suggestions.notSafeToClaim.length > 0 ? (
            <div className={`${styles.dsCard} ${styles.dsCardTerracotta}`}>
              <p className={styles.dsLabel}>Not safe to claim</p>
              <ul className={`${styles.dsBody} mt-2 space-y-1.5 text-[13px] list-disc pl-5`}>
                {suggestions.notSafeToClaim.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}

          {suggestions.recommendedNextChecks.length > 0 ? (
            <div className={`${styles.dsCard} ${styles.dsCardPlain}`}>
              <p className={styles.dsLabel}>Recommended checks</p>
              <ul className={`${styles.dsBody} mt-2 space-y-1.5 text-[13px] list-disc pl-5`}>
                {suggestions.recommendedNextChecks.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
