"use client"

import { useEffect, useMemo, useState } from "react"
import { parseCsvText } from "@/lib/data-studio/csv"
import { analyzeDataset, computeTension } from "@/lib/data-studio/analyze"
import { sampleDatasetCsv } from "@/lib/data-studio/sample"
import { AnalysisStages } from "@/components/data-studio/analysis-stages"
import { OutputBlocks } from "@/components/data-studio/output-blocks"
import { UploadPanel } from "@/components/data-studio/upload-panel"
import type { AnalysisResult } from "@/lib/data-studio/types"
import type {
  SecondReadingRequest,
  SecondReadingResponse,
} from "@/lib/data-studio/second-reading"

const SECOND_READING_CACHE_KEY = "data-studio-second-reading-cache-v1"
const SECOND_READING_CACHE_TTL_MS = 5 * 60 * 1000

function payloadKey(payload: SecondReadingRequest): string {
  return JSON.stringify(payload)
}

export function DataInterpretationStudio() {
  const [filename, setFilename] = useState<string | null>(null)
  const [csvText, setCsvText] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null)
  const [stage, setStage] = useState(0)
  const [secondReading, setSecondReading] = useState<SecondReadingResponse | null>(
    null
  )
  const [secondReadingLoading, setSecondReadingLoading] = useState(false)
  const [secondReadingError, setSecondReadingError] = useState<string | null>(null)

  const hasData = csvText !== null

  const framing = useMemo(
    () =>
      "Most data tools move directly to charts. This one pauses first. It asks whether the table is coherent enough to compare, and whether any difference it shows would be meaningful rather than convenient.",
    []
  )

  useEffect(() => {
    if (!hasData) {
      setAnalysis(null)
      setStage(0)
      setSecondReading(null)
      setSecondReadingError(null)
      setSecondReadingLoading(false)
      return
    }
    const parsed = parseCsvText(csvText)
    setAnalysis(analyzeDataset(parsed))
    setStage(0)
    const timers = [220, 520, 860, 1220, 1620].map((ms, i) =>
      window.setTimeout(() => setStage(i), ms)
    )
    return () => timers.forEach((t) => window.clearTimeout(t))
  }, [csvText, hasData])

  async function handleFile(file: File) {
    const text = await file.text()
    setFilename(file.name)
    setCsvText(text)
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
    }

    const key = payloadKey(payload)
    if (typeof window !== "undefined") {
      try {
        const raw = window.localStorage.getItem(SECOND_READING_CACHE_KEY)
        if (raw) {
          const cache = JSON.parse(raw) as {
            key: string
            at: number
            data: SecondReadingResponse
          }
          if (
            cache &&
            cache.key === key &&
            Date.now() - cache.at < SECOND_READING_CACHE_TTL_MS
          ) {
            setSecondReadingError(null)
            setSecondReading(cache.data)
            const tension =
              analysis.comparison && cache.data
                ? computeTension(
                    analysis.comparison,
                    analysis.numericSummaries,
                    analysis.comparison.confidence,
                    cache.data
                  )
                : null
            setAnalysis((prev) =>
              prev
                ? {
                    ...prev,
                    tension,
                  }
                : prev
            )
            return
          }
        }
      } catch {
        // ignore cache parse/storage errors
      }
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
        | { ok: false; message?: string }
      if (!res.ok || !json || json.ok !== true) {
        throw new Error("Second reading failed")
      }
      setSecondReading(json.data)
      const tension =
        analysis.comparison && json.data
          ? computeTension(
              analysis.comparison,
              analysis.numericSummaries,
              analysis.comparison.confidence,
              json.data
            )
          : null
      setAnalysis((prev) => (prev ? { ...prev, tension } : prev))
      if (typeof window !== "undefined") {
        try {
          window.localStorage.setItem(
            SECOND_READING_CACHE_KEY,
            JSON.stringify({ key, at: Date.now(), data: json.data })
          )
        } catch {
          // ignore cache write errors
        }
      }
    } catch {
      setSecondReadingError("A second reading is unavailable right now.")
      setAnalysis((prev) => (prev ? { ...prev, tension: null } : prev))
    } finally {
      setSecondReadingLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <header className="border-t border-border/35 pt-10 md:pt-12">
        <p className="site-subsection-label mb-3">Live demo</p>
        <h2 className="font-serif text-[1.5rem] md:text-[1.72rem] font-light leading-tight tracking-tight text-foreground">
          A small system for reading messy data
        </h2>
        <p className="mt-3 text-[13.5px] leading-[1.72] text-muted-foreground/66 max-w-2xl">
          Upload a file. The system checks structure before it allows comparison.
        </p>
      </header>

      <section className="mt-9">
        <p className="text-[13px] leading-[1.76] text-muted-foreground/68 max-w-2xl">
          {framing}
        </p>
      </section>

      <UploadPanel
        filename={filename}
        onSelectFile={handleFile}
        onUseSample={() => {
          setFilename("sample-business-table.csv")
          setCsvText(sampleDatasetCsv)
        }}
      />

      <AnalysisStages currentStage={stage} visible={hasData} />

      {analysis ? (
        <OutputBlocks
          result={analysis}
          visibleStage={stage}
          secondReadingSlot={
            <section className="mt-9 border-t border-border/28 pt-8">
              <p className="site-subsection-label mb-3">Second pass</p>
              <button
                type="button"
                onClick={requestSecondReading}
                disabled={secondReadingLoading}
                className="inline-flex items-center rounded-sm border border-border/40 px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase text-muted-foreground/72 transition-colors hover:text-foreground hover:border-border/58 disabled:opacity-55"
              >
                Request a second reading
              </button>

              {secondReadingLoading ? (
                <p className="mt-4 text-[12px] text-muted-foreground/58">
                  Preparing a closer pass...
                </p>
              ) : null}

              {secondReadingError ? (
                <p className="mt-4 text-[12px] text-muted-foreground/58">
                  {secondReadingError}
                </p>
              ) : null}

              {secondReading ? (
                <div className="mt-6 space-y-8">
                  <div>
                    <p className="site-subsection-label mb-2">Second reading</p>
                    <div className="space-y-2.5 text-[13px] leading-[1.76] text-muted-foreground/72">
                      {secondReading.refinedReading.map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="site-subsection-label mb-2">
                      What deserves caution
                    </p>
                    <ul className="space-y-2 text-[13px] leading-[1.72] text-muted-foreground/72">
                      {secondReading.cautions.map((line, i) => (
                        <li key={i}>- {line}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <p className="site-subsection-label mb-2">
                      Questions worth checking next
                    </p>
                    <ul className="space-y-2 text-[13px] leading-[1.72] text-muted-foreground/72">
                      {secondReading.nextQuestions.map((line, i) => (
                        <li key={i}>- {line}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : null}
            </section>
          }
        />
      ) : null}

      <section className="mt-12 border-t border-border/26 pt-8">
        <p className="text-[12.5px] leading-[1.72] text-muted-foreground/60 max-w-2xl">
          The point is not to generate insight automatically. It is to show what
          happens when a system decides whether a comparison deserves to be made
          before presenting it cleanly.
        </p>
      </section>
    </div>
  )
}

