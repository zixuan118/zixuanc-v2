"use client"

import { useMarginObject } from "@/components/site/margin-object-shell"
import { OT } from "@/components/objects/object-tokens"

function smoothstep(t: number, a: number, b: number) {
  if (t <= a) return 0
  if (t >= b) return 1
  const x = (t - a) / (b - a)
  return x * x * (3 - 2 * x)
}

/**
 * Small archival slip — almost still; optional hair of drift on scroll, no rotation read.
 */
export function HomeFileTabs() {
  const { progress, reduced } = useMarginObject()
  const p = reduced ? 0.92 : progress
  const driftX = reduced ? 0 : (p - 0.5) * 1.2
  const driftY = reduced ? 0 : (p - 0.5) * 1.8

  const open = smoothstep(p, 0.18, 0.9)
  const back2 = 0.18 + open * 0.11
  const back3 = 0.12 + open * 0.08
  const topLift = (1 - open) * 0.65

  return (
    <div
      className="will-change-transform origin-top lg:origin-top-right"
      style={{
        transform: reduced
          ? "scale(0.83)"
          : `translate3d(${driftX}px, ${driftY}px, 0) scale(0.83)`,
      }}
    >
      <svg
        viewBox="0 0 220 200"
        className="h-auto w-full max-h-[min(180px,23vh)] opacity-[0.74]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hft-card" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OT.paper} stopOpacity="0.28" />
            <stop offset="100%" stopColor={OT.faint} stopOpacity="0.09" />
          </linearGradient>
        </defs>

        <g style={{ opacity: back3 }}>
          <path
            d="M 48 118 L 188 124 L 184 178 L 44 172 Z"
            fill="url(#hft-card)"
            stroke={OT.line}
            strokeWidth="0.38"
            strokeOpacity="0.12"
          />
        </g>

        <g style={{ opacity: back2 }}>
          <path
            d="M 42 88 L 178 96 L 172 152 L 36 144 Z"
            fill="url(#hft-card)"
            stroke={OT.line}
            strokeWidth="0.4"
            strokeOpacity="0.19"
          />
          <path
            d="M 52 108 L 132 110"
            stroke={OT.line}
            strokeWidth="0.28"
            strokeOpacity="0.09"
            strokeDasharray="2 4"
          />
        </g>

        <g transform={`translate(0 ${topLift})`}>
          <path
            d="M 38 52 L 172 58 L 166 128 L 32 122 Z"
            fill="url(#hft-card)"
            stroke={OT.graphiteSoft}
            strokeWidth="0.44"
            strokeOpacity="0.24"
          />
          <path
            d="M 44 68 L 152 70"
            stroke={OT.line}
            strokeWidth="0.32"
            strokeOpacity="0.11"
          />
          <path
            d="M 44 78 L 118 80"
            stroke={OT.line}
            strokeWidth="0.26"
            strokeOpacity="0.08"
          />
          <rect
            x="48"
            y="90"
            width="68"
            height="0.32"
            fill={OT.line}
            opacity="0.06"
          />
        </g>
      </svg>
    </div>
  )
}
