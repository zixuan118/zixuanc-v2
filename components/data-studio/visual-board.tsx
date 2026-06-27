"use client"

import { buildVisualBoardSummary } from "@/lib/data-studio/visual-summary"
import type {
  HistogramBin,
  NumericSummary,
  VisualAccent,
  VisualBlock,
} from "@/lib/data-studio/types"
import styles from "@/components/data-studio/data-studio.module.css"

function fmtNum(x: number) {
  if (Math.abs(x) >= 1000) return x.toLocaleString()
  return x.toFixed(2).replace(/\.00$/, "")
}

function barClass(accent?: VisualAccent) {
  if (accent === "amber") return styles.dsBarAmber
  if (accent === "terracotta") return styles.dsBarTerracotta
  if (accent === "sage") return styles.dsBarSage
  return styles.dsBarSlate
}

function BarChart({
  rows,
  accent,
}: {
  rows: Array<{ label: string; value: number; sub?: string }>
  accent?: VisualAccent
}) {
  const max = Math.max(...rows.map((r) => r.value), 1)
  return (
    <div className="space-y-2.5 mt-3">
      {rows.map((r) => (
        <div key={r.label}>
          <div className="flex items-center justify-between text-[12px] mb-1 gap-2">
            <span className="truncate max-w-[58%] text-[var(--ds-text-secondary)]">
              {r.label}
            </span>
            <span className="text-[var(--ds-text-primary)] tabular-nums shrink-0">
              {fmtNum(r.value)}
              {r.sub ? (
                <span className="text-[var(--ds-text-muted)] ml-1">({r.sub})</span>
              ) : null}
            </span>
          </div>
          <div className={styles.dsBarTrack}>
            <div
              className={barClass(accent)}
              style={{ width: `${(r.value / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

function Histogram({ bins, accent }: { bins: HistogramBin[]; accent?: VisualBlock["accent"] }) {
  const max = Math.max(...bins.map((b) => b.count), 1)
  return (
    <div className="mt-3 h-24 flex items-end gap-[2px] border-b border-[var(--ds-border-soft)] pb-1">
      {bins.map((b, i) => (
        <div
          key={`${b.start}-${i}`}
          className={`flex-1 ${barClass(accent)}`}
          style={{ height: `${(b.count / max) * 100}%` }}
          title={`${fmtNum(b.start)}–${fmtNum(b.end)}: ${b.count}`}
        />
      ))}
    </div>
  )
}

function ScatterPlot({ points }: { points: Array<{ x: number; y: number }> }) {
  const xs = points.map((p) => p.x)
  const ys = points.map((p) => p.y)
  const minX = Math.min(...xs)
  const maxX = Math.max(...xs)
  const minY = Math.min(...ys)
  const maxY = Math.max(...ys)
  const pad = 8
  const w = 280
  const h = 130
  const sx = (x: number) =>
    pad + ((x - minX) / Math.max(maxX - minX, 1e-9)) * (w - pad * 2)
  const sy = (y: number) =>
    h - pad - ((y - minY) / Math.max(maxY - minY, 1e-9)) * (h - pad * 2)

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="mt-3 w-full max-w-[320px] h-auto">
      {points.map((p, i) => (
        <circle
          key={i}
          cx={sx(p.x)}
          cy={sy(p.y)}
          r={2.5}
          fill="var(--ds-accent-slate)"
          opacity={0.72}
        />
      ))}
    </svg>
  )
}

function matrixColumnLabel(name: string): string {
  if (name === "conversion_rate") return "conv_rate"
  if (name === "discount_rate") return "disc_rate"
  return name
}

function CorrelationMatrix({
  columns,
  matrix,
}: {
  columns: string[]
  matrix: number[][]
}) {
  return (
    <div className={styles.dsTableWrap}>
      <table className={styles.dsTable}>
        <thead>
          <tr>
            <th />
            {columns.map((c) => (
              <th key={c} className="text-right whitespace-nowrap">
                {matrixColumnLabel(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {columns.map((rowCol, i) => (
            <tr key={rowCol}>
              <td className="whitespace-nowrap">{matrixColumnLabel(rowCol)}</td>
              {columns.map((_, j) => (
                <td key={j} className="num">
                  {matrix[i][j].toFixed(2)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function NumericTable({
  rows,
  totalNumericCount,
}: {
  rows: NumericSummary[]
  totalNumericCount?: number
}) {
  const extra =
    totalNumericCount && totalNumericCount > rows.length
      ? totalNumericCount - rows.length
      : 0
  return (
    <>
      <div className={styles.dsTableWrap}>
        <table className={styles.dsTable}>
          <thead>
            <tr>
              <th>Column</th>
              <th className="text-right">Mean</th>
              <th className="text-right">Median</th>
              <th className="text-right">Outliers</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.column}>
                <td>{r.column}</td>
                <td className="num">{fmtNum(r.mean)}</td>
                <td className="num">{fmtNum(r.median)}</td>
                <td className="num">{r.outlierCount}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {extra > 0 ? (
        <p className={`${styles.dsHint} mt-2`}>+ {extra} more numeric fields</p>
      ) : null}
    </>
  )
}

function cardAccentClass(accent?: VisualAccent) {
  if (accent === "sage") return styles.dsCardSage
  if (accent === "amber") return styles.dsCardAmber
  if (accent === "terracotta") return styles.dsCardTerracotta
  return styles.dsCardPlain
}

function VisualBlockCard({
  block,
  wide,
}: {
  block: VisualBlock
  wide?: boolean
}) {
  return (
    <div
      className={`${styles.dsCard} ${cardAccentClass(block.accent)} ${wide ? styles.dsVisualWide : ""}`}
    >
      <p className={`${styles.dsTitle} text-[13px]`}>{block.title}</p>
      <p className={`${styles.dsHint} mt-1`}>{block.description}</p>
      {block.caution ? (
        <p className={`${styles.dsHint} mt-1.5 text-[12px] text-[var(--ds-accent-amber)]`}>
          {block.caution}
        </p>
      ) : null}

      {block.kind === "missingness-bars" ? (
        <BarChart rows={block.rows} accent="amber" />
      ) : null}
      {block.kind === "numeric-table" ? (
        <NumericTable
          rows={block.rows}
          totalNumericCount={block.totalNumericCount}
        />
      ) : null}
      {block.kind === "categorical-table" ? (
        <BarChart
          accent="sage"
          rows={block.rows.map((r) => ({
            label: r.value,
            value: r.count,
          }))}
        />
      ) : null}
      {block.kind === "histogram" ? (
        <Histogram bins={block.bins} accent={block.accent} />
      ) : null}
      {block.kind === "grouped-bars" ? (
        <BarChart rows={block.rows} accent="sage" />
      ) : null}
      {block.kind === "scatter" ? <ScatterPlot points={block.points} /> : null}
      {block.kind === "trend" ? (
        <BarChart
          accent="slate"
          rows={block.points.map((p) => ({
            label: p.label,
            value: p.value,
            sub: `n=${p.count}`,
          }))}
        />
      ) : null}
      {block.kind === "correlation-matrix" ? (
        <CorrelationMatrix columns={block.columns} matrix={block.matrix} />
      ) : null}
    </div>
  )
}

export function VisualBoard({ blocks }: { blocks: VisualBlock[] }) {
  if (blocks.length === 0) {
    return (
      <section>
        <p className={styles.dsSubsectionLabel}>Visual board</p>
        <p className={styles.dsBody}>
          No charts were selected for this table in the first pass.
        </p>
      </section>
    )
  }

  return (
    <section>
      <p className={styles.dsSubsectionLabel}>Visual board</p>
      <p className={`${styles.dsBody} mb-1`}>
        Charts chosen for structure, not completeness.
      </p>
      <p className={`${styles.dsHint} mb-4`}>{buildVisualBoardSummary(blocks)}</p>
      <div className={styles.dsVisualGrid}>
        {blocks.map((b) => (
          <VisualBlockCard
            key={b.id}
            block={b}
            wide={b.kind === "numeric-table" || b.kind === "correlation-matrix"}
          />
        ))}
      </div>
    </section>
  )
}
