"use client"

import type { ReactNode } from "react"
import type { AnalysisResult, HistogramBin } from "@/lib/data-studio/types"

function fmtPct(x: number) {
  return `${(x * 100).toFixed(0)}%`
}

function fmtNum(x: number) {
  if (Math.abs(x) >= 1000) return x.toLocaleString()
  return x.toFixed(2).replace(/\.00$/, "")
}

function SectionRule({ className = "" }: { className?: string }) {
  return <div className={`border-t border-border/28 ${className}`.trim()} aria-hidden />
}

function BarChart({
  rows,
}: {
  rows: Array<{ label: string; value: number }>
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="space-y-2.5 mt-4">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground/62 mb-1">
            <span className="uppercase tracking-[0.08em]">{r.label}</span>
            <span>{fmtNum(r.value)}</span>
          </div>
          <div className="h-1.5 bg-border/18">
            <div
              className="h-full bg-foreground/45"
              style={{ width: `${(r.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function Histogram({ bins }: { bins: HistogramBin[] }) {
  const max = Math.max(...bins.map((b) => b.count), 1)
  return (
    <div className="mt-4">
      <div className="h-28 flex items-end gap-[3px] border-b border-border/30 pb-1">
        {bins.map((b, i) => (
          <div
            key={`${b.start}-${i}`}
            className="flex-1 bg-foreground/45"
            style={{ height: `${(b.count / max) * 100}%` }}
            title={`${fmtNum(b.start)} - ${fmtNum(b.end)}: ${b.count}`}
          />
        ))}
      </div>
    </div>
  )
}

export function OutputBlocks({
  result,
  visibleStage,
  secondReadingSlot,
}: {
  result: AnalysisResult
  visibleStage: number
  secondReadingSlot?: ReactNode
}) {
  const show = (n: number) =>
    visibleStage >= n ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
  const missingRows = result.missingnessByColumn.slice(0, 6)
  const allMissingZero =
    missingRows.length > 0 && missingRows.every((m) => m.missingRate === 0)

  return (
    <div className="mt-10 max-w-3xl">
      <section className={`transition-all duration-500 ${show(1)}`}>
        <p className="site-subsection-label mb-3">Dataset profile</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-3 text-[13px] text-muted-foreground/72">
          <div>
            <p className="text-[10px] uppercase tracking-[0.11em] text-muted-foreground/48 mb-1">
              Rows
            </p>
            <p>{result.profile.rowCount.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.11em] text-muted-foreground/48 mb-1">
              Columns
            </p>
            <p>{result.profile.columnCount}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.11em] text-muted-foreground/48 mb-1">
              Numeric
            </p>
            <p>{result.profile.numericColumns.length}</p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.11em] text-muted-foreground/48 mb-1">
              Categorical
            </p>
            <p>{result.profile.categoricalColumns.length}</p>
          </div>
        </div>
      </section>

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(2)}`}>
        <p className="site-subsection-label mb-3">Structural observations</p>
        <p className="text-[13px] leading-[1.72] text-muted-foreground/68 mb-3">
          The table is not taken at face value. These conditions affect whether
          comparison is reliable.
        </p>
        <div className="space-y-3 text-[13px] leading-[1.72] text-muted-foreground/72">
          {result.structuralFindings.length === 0 ? (
            <p>No major structural issues stand out in the first pass.</p>
          ) : (
            result.structuralFindings.map((f) => (
              <p key={f.label}>
                <span className="text-foreground/82">{f.label}:</span> {f.detail}
              </p>
            ))
          )}
        </div>
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4 text-[12px] text-muted-foreground/62">
          {result.missingnessByColumn.slice(0, 6).map((m) => (
            <div key={m.column} className="flex items-center justify-between border-b border-border/20 pb-1">
              <span>{m.column}</span>
              <span>{fmtPct(m.missingRate)} missing</span>
            </div>
          ))}
        </div>
      </section>

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(3)}`}>
        <p className="site-subsection-label mb-3">
          {result.comparison ? "What the system chose to compare" : "NO COMPARISON SELECTED"}
        </p>
        {result.comparison ? (
          <p className="text-[13px] leading-[1.72] text-muted-foreground/68 mb-3">
            The system does not compare by default. It selects a pairing only
            when the structure can support it.
          </p>
        ) : null}
        {result.comparison ? (
          <div className="space-y-4">
            <p className="text-[12px] leading-[1.7] text-muted-foreground/64">
              {result.comparison.confidence.overall === "high"
                ? "This comparison remains defensible."
                : result.comparison.confidence.overall === "medium"
                  ? "This comparison is usable, but materially constrained."
                  : "This comparison is weak and should not be relied on."}
            </p>
            {result.comparison.dominantDriver ? (
              <p className="text-[12px] leading-[1.7] text-muted-foreground/64">
                A stronger explanatory structure appears under:{" "}
                {result.comparison.dominantDriver.primaryDriver}
              </p>
            ) : (
              <p className="text-[12px] leading-[1.7] text-muted-foreground/64">
                No alternative grouping clearly dominates this lens.
              </p>
            )}
            <p className="text-[13px] leading-[1.72] text-muted-foreground/72">
              {result.comparison.reason}
            </p>
            <BarChart
              rows={result.comparison.groupedAverages.map((g) => ({
                label: g.group,
                value: g.value,
              }))}
            />
          </div>
        ) : (
          <p className="text-[13px] leading-[1.72] text-muted-foreground/72">
            {result.noComparisonReason ??
              "No comparison is accepted. The available fields do not support a grouping–metric relationship that would hold under structural or semantic scrutiny. Presenting a comparison here would introduce more distortion than insight."}
          </p>
        )}
      </section>

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(4)}`}>
        <p className="site-subsection-label mb-3">Written reading</p>
        <div className="space-y-3.5 text-[13px] leading-[1.76] text-muted-foreground/72">
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
              <p className="site-subsection-label mb-2">READING TENSION</p>
              {result.tension === "high" ? (
                <p className="text-[13px] leading-[1.76] text-muted-foreground/72">
                  The first reading is confident, but the second reading
                  introduces reasons for caution. The difference does not
                  invalidate the comparison, but it narrows the conditions
                  under which it holds.
                </p>
              ) : result.tension === "medium" ? (
                <p className="text-[13px] leading-[1.76] text-muted-foreground/72">
                  The readings do not fully align. The comparison is usable,
                  though its stability depends on underlying structure.
                </p>
              ) : (
                <p className="text-[13px] leading-[1.76] text-muted-foreground/72">
                  The first and second readings are largely aligned. No
                  significant tension is observed in interpretation.
                </p>
              )}
            </section>
          ) : null}
        </div>
      ) : null}

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(4)}`}>
        <p className="site-subsection-label mb-3">Minimal visual summary</p>
        <p className="text-[13px] leading-[1.72] text-muted-foreground/68 mb-3">
          These visuals support the reading. They do not attempt to summarize the
          entire table.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/55">
              Missingness strip
            </p>
            {allMissingZero ? (
              <p className="mt-4 text-[12px] text-muted-foreground/55">
                No missing values were detected across the displayed fields.
              </p>
            ) : (
              <BarChart
                rows={missingRows.map((m) => ({
                  label: m.column,
                  value: m.missingRate * 100,
                }))}
              />
            )}
          </div>
          <div>
            <p className="text-[11px] uppercase tracking-[0.1em] text-muted-foreground/55">
              {result.histogram
                ? `${result.histogram.column} distribution`
                : "Distribution"}
            </p>
            {result.histogram ? (
              <Histogram bins={result.histogram.bins} />
            ) : (
              <p className="mt-4 text-[12px] text-muted-foreground/55">
                No numeric column has enough valid rows for a stable histogram.
              </p>
            )}
          </div>
        </div>
      </section>

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(4)}`}>
        <p className="site-subsection-label mb-3">Notable highlights</p>
        <ul className="space-y-2.5 text-[13px] leading-[1.7] text-muted-foreground/72">
          {result.highlights.slice(0, 3).map((h, i) => (
            <li key={i}>- {h}</li>
          ))}
        </ul>
      </section>

      <SectionRule className="mt-9 pt-8" />

      <section className={`transition-all duration-500 ${show(4)}`}>
        <p className="site-subsection-label mb-3">What this system refuses to do</p>
        <ul className="space-y-2.5 text-[13px] leading-[1.7] text-muted-foreground/72">
          <li>- It does not compare groups that are not yet coherent.</li>
          <li>
            - It does not treat averages as stable when dispersion remains high.
          </li>
          <li>
            - It does not produce charts before checking whether the table can
            support them.
          </li>
        </ul>
      </section>
    </div>
  )
}

