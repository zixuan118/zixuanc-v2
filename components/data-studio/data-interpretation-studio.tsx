"use client"

import { useEffect, useMemo, useState } from "react"
import { analyzeDataset, computeTension } from "@/lib/data-studio/analyze"
import {
  downloadCleanedCsv,
  downloadCleanedXlsx,
  downloadCleaningLogJson,
  downloadProfileJson,
} from "@/lib/data-studio/export"
import { intakeFile, intakeFromSampleCsv } from "@/lib/data-studio/intake"
import { sampleDatasetCsv } from "@/lib/data-studio/sample"
import { AnalysisStages } from "@/components/data-studio/analysis-stages"
import { IntakePanel } from "@/components/data-studio/intake-panel"
import { OutputBlocks } from "@/components/data-studio/output-blocks"
import { RelationshipPanel } from "@/components/data-studio/relationship-panel"
import type { AnalysisResult, IntakeResult } from "@/lib/data-studio/types"
import type { RelationshipSuggestionsResponse } from "@/lib/data-studio/types"
import type {
  RelationshipDiscoveryRequest,
  SecondReadingRequest,
  SecondReadingResponse,
} from "@/lib/data-studio/second-reading"
import { STUDIO_FACTS_BOUNDARY, STUDIO_FLOW } from "@/lib/data-studio/copy"
import styles from "@/components/data-studio/data-studio.module.css"

const SECOND_READING_CACHE_KEY = "data-studio-second-reading-cache-v3"
const RELATIONSHIP_CACHE_KEY = "data-studio-relationship-cache-v1"
const CACHE_TTL_MS = 5 * 60 * 1000

function payloadKey(payload: unknown): string {
  return JSON.stringify(payload)
}

export function DataInterpretationStudio() {
  const [intake, setIntake] = useState<IntakeResult | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [stage, setStage] = useState(0)
  const [secondReading, setSecondReading] = useState<SecondReadingResponse | null>(
    null,
  )
  const [secondReadingLoading, setSecondReadingLoading] = useState(false)
  const [secondReadingError, setSecondReadingError] = useState<string | null>(null)
  const [relationships, setRelationships] =
    useState<RelationshipSuggestionsResponse | null>(null)
  const [relationshipLoading, setRelationshipLoading] = useState(false)
  const [relationshipError, setRelationshipError] = useState<string | null>(null)

  const hasData = intake !== null

  const framing = useMemo(() => `${STUDIO_FLOW}. ${STUDIO_FACTS_BOUNDARY}`, [])

  useEffect(() => {
    if (!intake) {
      setAnalysis(null)
      setStage(0)
      setSecondReading(null)
      setSecondReadingError(null)
      setSecondReadingLoading(false)
      setRelationships(null)
      setRelationshipError(null)
      setRelationshipLoading(false)
      return
    }
    setAnalysis(analyzeDataset(intake.parsed))
    setStage(0)
    setSecondReading(null)
    setRelationships(null)
    const timers = [220, 520, 860, 1220, 1620].map((ms, i) =>
      window.setTimeout(() => setStage(i), ms),
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [intake])

  async function handleFile(file: File) {
    setIntake(await intakeFile(file))
  }

  function handleSample() {
    setIntake(
      intakeFromSampleCsv("sample-business-table.csv", sampleDatasetCsv),
    )
  }

  function buildRelationshipPayload(
    a: AnalysisResult,
  ): RelationshipDiscoveryRequest {
    return {
      profile: a.profile,
      audit: a.audit,
      cleaning: a.cleaning,
      columnProfiles: a.columnProfiles,
      numericSummaries: a.numericSummaries,
      comparison: a.comparison,
      analysisPlan: a.analysisPlan,
      relationshipCandidates: a.relationshipCandidates,
      visualBoardSummary: a.visualBoard.map((b) => ({
        title: b.title,
        description: b.description,
        caution: b.caution,
      })),
    }
  }

  async function requestRelationships() {
    if (!analysis || relationshipLoading) return
    const payload = buildRelationshipPayload(analysis)
    const key = payloadKey(payload)

    try {
      const raw = window.localStorage.getItem(RELATIONSHIP_CACHE_KEY)
      if (raw) {
        const cache = JSON.parse(raw) as {
          key: string
          at: number
          data: RelationshipSuggestionsResponse
        }
        if (cache?.key === key && Date.now() - cache.at < CACHE_TTL_MS) {
          setRelationships(cache.data)
          setRelationshipError(null)
          return
        }
      }
    } catch {
      // ignore
    }

    setRelationshipLoading(true)
    setRelationshipError(null)
    try {
      const res = await fetch("/api/data-interpretation/relationships", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = (await res.json()) as
        | { ok: true; data: RelationshipSuggestionsResponse }
        | { ok: false }
      if (!res.ok || json.ok !== true) throw new Error("failed")
      setRelationships(json.data)
      window.localStorage.setItem(
        RELATIONSHIP_CACHE_KEY,
        JSON.stringify({ key, at: Date.now(), data: json.data }),
      )
    } catch {
      setRelationshipError("Relationship review is unavailable right now.")
    } finally {
      setRelationshipLoading(false)
    }
  }

  async function requestSecondReading() {
    if (!analysis || secondReadingLoading) return

    const payload: SecondReadingRequest = {
      profile: analysis.profile,
      structuralFindings: analysis.structuralFindings,
      missingnessByColumn: analysis.missingnessByColumn,
      categoricalObservations: analysis.categoricalObservations,
      numericSummaries: analysis.numericSummaries,
      comparison: analysis.comparison,
      noComparisonReason: analysis.noComparisonReason,
      decisionDrivers: analysis.decisionDrivers,
      highlights: analysis.highlights,
      interpretationParagraphs: analysis.interpretationParagraphs,
      audit: analysis.audit,
      analysisPlan: analysis.analysisPlan,
      cleaning: analysis.cleaning,
      relationshipCandidates: analysis.relationshipCandidates,
      visualBoardSummary: analysis.visualBoard.map((b) => ({
        title: b.title,
        description: b.description,
        caution: b.caution,
      })),
      relationshipSuggestions: relationships,
    }

    const key = payloadKey(payload)
    try {
      const raw = window.localStorage.getItem(SECOND_READING_CACHE_KEY)
      if (raw) {
        const cache = JSON.parse(raw) as {
          key: string
          at: number
          data: SecondReadingResponse
        }
        if (cache?.key === key && Date.now() - cache.at < CACHE_TTL_MS) {
          setSecondReading(cache.data)
          setSecondReadingError(null)
          applyTension(cache.data)
          return
        }
      }
    } catch {
      // ignore
    }

    setSecondReadingLoading(true)
    setSecondReadingError(null)
    setSecondReading(null)
    setAnalysis((prev) => (prev ? { ...prev, tension: null } : prev))

    try {
      const res = await fetch("/api/data-interpretation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const json = (await res.json()) as
        | { ok: true; data: SecondReadingResponse }
        | { ok: false }
      if (!res.ok || json.ok !== true) throw new Error("failed")
      setSecondReading(json.data)
      applyTension(json.data)
      window.localStorage.setItem(
        SECOND_READING_CACHE_KEY,
        JSON.stringify({ key, at: Date.now(), data: json.data }),
      )
    } catch {
      setSecondReadingError("Second reading is unavailable right now.")
    } finally {
      setSecondReadingLoading(false)
    }

    function applyTension(data: SecondReadingResponse) {
      const tension =
        analysis?.comparison && data
          ? computeTension(
              analysis.comparison,
              analysis.numericSummaries,
              analysis.comparison.confidence,
              data,
            )
          : null
      setAnalysis((prev) => (prev ? { ...prev, tension } : prev))
    }
  }

  return (
    <div className={`max-w-3xl ${styles.dataStudio}`}>
      <header className="border-t border-[var(--ds-border-soft)] pt-10 md:pt-12">
        <p className={styles.dsSubsectionLabel}>Live demo</p>
        <h2
          className={`font-serif text-[1.5rem] md:text-[1.72rem] font-light leading-tight tracking-tight ${styles.dsTitle}`}
        >
          Data readiness and insight studio
        </h2>
        <p className={`mt-3 max-w-2xl ${styles.dsLead}`}>
          Converts messy tables into audited, cleaned, downloadable data, then
          recommends cautious visuals and an optional second reading.
        </p>
      </header>

      <section className="mt-9">
        <p className={`max-w-2xl ${styles.dsBody}`}>{framing}</p>
      </section>

      <IntakePanel
        meta={intake?.meta ?? null}
        cleanedRowCount={analysis?.cleaning.cleanedRowCount}
        onSelectFile={handleFile}
        onUseSample={handleSample}
        exportReady={stage >= 4 && !!analysis && !!intake}
        onDownloadCsv={() => {
          if (analysis && intake)
            downloadCleanedCsv(analysis, intake.meta.fileName)
        }}
        onDownloadJson={() => {
          if (analysis && intake)
            downloadProfileJson(analysis, intake.meta, intake.meta.fileName)
        }}
        onDownloadCleaningLog={() => {
          if (analysis && intake)
            downloadCleaningLogJson(analysis, intake.meta.fileName)
        }}
        onDownloadXlsx={() => {
          if (analysis && intake)
            void downloadCleanedXlsx(analysis, intake.meta.fileName)
        }}
      />

      <AnalysisStages currentStage={stage} visible={hasData} />

      {analysis ? (
        <OutputBlocks
          result={analysis}
          visibleStage={stage}
          relationshipSlot={
            <RelationshipPanel
              suggestions={relationships}
              loading={relationshipLoading}
              error={relationshipError}
              onRequest={requestRelationships}
              disabled={stage < 2}
            />
          }
          secondReadingSlot={
            <section className="mt-9 border-t border-[var(--ds-border-soft)] pt-8">
              <p className={styles.dsSubsectionLabel}>Second reading</p>
              <p className={`${styles.dsHint} mb-4 max-w-2xl`}>
                The optional second reading does not recompute the table. It explains
                cleaning, audit, plan, visuals, and relationship suggestions in plain
                language.
              </p>
              <button
                type="button"
                onClick={requestSecondReading}
                disabled={secondReadingLoading}
                className={`${styles.dsBtn} inline-flex items-center rounded-sm px-3.5 py-1.5 text-[11px] tracking-[0.1em] uppercase disabled:opacity-55`}
              >
                Request second reading
              </button>

              {secondReadingLoading ? (
                <p className={`${styles.dsHint} mt-4`}>Preparing reading…</p>
              ) : null}
              {secondReadingError ? (
                <p className={`${styles.dsHint} mt-4`}>{secondReadingError}</p>
              ) : null}

              {secondReading ? (
                <div className="mt-6 space-y-8">
                  {secondReading.nonTechnicalSummary ? (
                    <div className={`${styles.dsCard} ${styles.dsCardSlate}`}>
                      <p className={styles.dsLabel}>Summary</p>
                      <p className={`${styles.dsBody} mt-2`}>
                        {secondReading.nonTechnicalSummary}
                      </p>
                      <p className={`${styles.dsHint} mt-2 uppercase tracking-[0.08em] text-[11px]`}>
                        Confidence: {secondReading.confidenceLanguage}
                      </p>
                    </div>
                  ) : null}

                  {secondReading.whatTheTableShows.length > 0 ? (
                    <div>
                      <p className={styles.dsLabel}>What the table shows</p>
                      <ul className={`${styles.dsBody} mt-2 space-y-2 list-disc pl-5`}>
                        {secondReading.whatTheTableShows.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div>
                    <p className={styles.dsLabel}>Reading</p>
                    <div className={`${styles.dsBody} mt-2 space-y-2.5`}>
                      {secondReading.refinedReading.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>

                  {secondReading.hypothesesOnly.length > 0 ? (
                    <div className={`${styles.dsCard} ${styles.dsCardAmber}`}>
                      <p className={styles.dsLabel}>Hypotheses only</p>
                      <ul className={`${styles.dsBody} mt-2 space-y-2 list-disc pl-5`}>
                        {secondReading.hypothesesOnly.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {secondReading.notSafeToClaim.length > 0 ? (
                    <div className={`${styles.dsCard} ${styles.dsCardTerracotta}`}>
                      <p className={styles.dsLabel}>Not safe to claim yet</p>
                      <ul className={`${styles.dsBody} mt-2 space-y-2 list-disc pl-5`}>
                        {secondReading.notSafeToClaim.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  {secondReading.keyFindings.length > 0 ? (
                    <div>
                      <p className={styles.dsLabel}>Key findings</p>
                      <ul className={`${styles.dsBody} mt-2 space-y-2 list-disc pl-5`}>
                        {secondReading.keyFindings.map((line, i) => (
                          <li key={i}>{line}</li>
                        ))}
                      </ul>
                    </div>
                  ) : null}

                  <div>
                    <p className={styles.dsLabel}>Cautions</p>
                    <ul className={`${styles.dsBody} mt-2 space-y-2 list-disc pl-5`}>
                      {secondReading.cautions.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <p className={styles.dsLabel}>Next checks</p>
                    <ul className={`${styles.dsBody} mt-2 space-y-2 list-disc pl-5`}>
                      {secondReading.nextQuestions.map((line, i) => (
                        <li key={i}>{line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </section>
          }
        />
      ) : null}

      <section className="mt-12 border-t border-[var(--ds-border-soft)] pt-8">
        <p className={`max-w-2xl ${styles.dsBody}`}>
          Cleaning, profiling, and chart selection run locally. The optional
          second reading explains computed results. It does not invent statistics
          from raw rows.
        </p>
      </section>
    </div>
  )
}
