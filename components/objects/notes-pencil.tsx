"use client"

import { useId } from "react"
import { useMarginObject } from "@/components/site/margin-object-shell"
import { OT } from "@/components/objects/object-tokens"

function smoothstep(t: number, a: number, b: number) {
  if (t <= a) return 0
  if (t >= b) return 1
  const x = (t - a) / (b - a)
  return x * x * (3 - 2 * x)
}

/**
 * Vertical pencil — lacquer hex shaft, metal ferrule, wood cone, graphite.
 * Length shortens by geometry (not uniform scale): shaft + cone yield to a longer exposed tip.
 */
export function NotesPencil() {
  const { progress, reduced } = useMarginObject()
  const uid = useId()
  const p = reduced ? 0.88 : progress
  const u = smoothstep(p, 0.08, 0.94)

  const cx = 110
  const bodyBot = 212 - u * 18
  const ferruleTop = bodyBot
  const ferruleBot = bodyBot + 15
  const coneH = 26 - u * 11
  const graphiteH = 32 + u * 14
  const tipY = ferruleBot + coneH + graphiteH

  const coneTop = ferruleBot
  const coneBot = coneTop + coneH
  const half = 11.5

  const shaving = smoothstep(p, 0.55, 1)

  const gl = `np-lacquer-${uid}`
  const gw = `np-wood-${uid}`
  const gg = `np-graphite-${uid}`

  return (
    <div className="will-change-transform">
      <svg
        viewBox="0 0 220 340"
        className="h-auto w-full max-h-[min(360px,44vh)] opacity-[0.92]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gl} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={OT.lacquerDeep} stopOpacity="0.55" />
            <stop offset="35%" stopColor={OT.lacquer} stopOpacity="0.5" />
            <stop offset="100%" stopColor={OT.shadow} stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id={gw} x1="0" y1="1" x2="0" y2="0">
            <stop offset="0%" stopColor={OT.woodDeep} stopOpacity="0.55" />
            <stop offset="55%" stopColor={OT.wood} stopOpacity="0.5" />
            <stop offset="100%" stopColor={OT.faint} stopOpacity="0.4" />
          </linearGradient>
          <linearGradient id={gg} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OT.graphiteTip} stopOpacity="0.92" />
            <stop offset="100%" stopColor={OT.graphite} stopOpacity="0.65" />
          </linearGradient>
        </defs>

        {/* subtle ground */}
        <ellipse
          cx={cx}
          cy={tipY + 14}
          rx="48"
          ry="5"
          fill={OT.shadow}
          opacity="0.12"
        />

        {/* eraser + crimp */}
        <rect
          x={cx - 9}
          y="58"
          width="18"
          height="22"
          rx="3"
          fill={OT.faint}
          stroke={OT.line}
          strokeWidth="0.45"
          strokeOpacity="0.35"
        />
        <path
          d={`M ${cx - 10} 80 L ${cx + 10} 80`}
          stroke={OT.line}
          strokeWidth="0.5"
          strokeOpacity="0.28"
        />

        {/* lacquer shaft — hex feel via facets */}
        <path
          d={`M ${cx - half} 82 L ${cx + half} 82 L ${cx + half + 1.2} ${bodyBot} L ${cx - half - 1.2} ${bodyBot} Z`}
          fill={`url(#${gl})`}
          stroke={OT.line}
          strokeWidth="0.5"
          strokeOpacity="0.38"
        />
        <path
          d={`M ${cx - half} 82 L ${cx - half - 2.5} ${(82 + bodyBot) / 2}`}
          stroke={OT.highlight}
          strokeWidth="0.35"
          strokeOpacity="0.22"
        />
        <path
          d={`M ${cx + half} 82 L ${cx + half + 2.5} ${(82 + bodyBot) / 2}`}
          stroke={OT.graphiteSoft}
          strokeWidth="0.35"
          strokeOpacity="0.18"
        />
        <path
          d={`M ${cx - 6} ${95 + u * 3} L ${cx + 5} ${112 + u * 2}`}
          stroke={OT.line}
          strokeWidth="0.28"
          strokeOpacity="0.14"
        />

        {/* ferrule */}
        <path
          d={`M ${cx - half - 0.5} ${ferruleTop} L ${cx + half + 0.5} ${ferruleTop} L ${cx + half} ${ferruleBot} L ${cx - half} ${ferruleBot} Z`}
          fill={OT.metal}
          fillOpacity="0.48"
          stroke={OT.metalDeep}
          strokeWidth="0.45"
          strokeOpacity="0.45"
        />
        {[0, 1, 2].map((i) => (
          <line
            key={i}
            x1={cx - half + 2 + i * 6.5}
            y1={ferruleTop + 3}
            x2={cx - half + 2 + i * 6.5}
            y2={ferruleBot - 2}
            stroke={OT.graphiteSoft}
            strokeWidth="0.35"
            strokeOpacity="0.22"
          />
        ))}

        {/* wood cone */}
        <path
          d={`M ${cx - half} ${coneTop} L ${cx + half} ${coneTop} L ${cx + 4} ${coneBot} L ${cx - 4} ${coneBot} Z`}
          fill={`url(#${gw})`}
          stroke={OT.woodDeep}
          strokeWidth="0.42"
          strokeOpacity="0.4"
        />
        <path
          d={`M ${cx - 5} ${coneTop + coneH * 0.35} Q ${cx} ${coneTop + coneH * 0.5} ${cx + 5} ${coneTop + coneH * 0.38}`}
          stroke={OT.line}
          strokeWidth="0.3"
          strokeOpacity="0.2"
          fill="none"
        />

        {/* graphite + faceted tip */}
        <path
          d={`M ${cx - 4} ${coneBot} L ${cx + 4} ${coneBot} L ${cx} ${tipY} Z`}
          fill={`url(#${gg})`}
          stroke={OT.graphiteSoft}
          strokeWidth="0.4"
          strokeOpacity="0.5"
        />
        <path
          d={`M ${cx} ${tipY} L ${cx} ${tipY - graphiteH * 0.35}`}
          stroke={OT.highlight}
          strokeWidth="0.35"
          strokeOpacity={0.12 + u * 0.18}
        />

        {/* shavings — late, low contrast */}
        <g opacity={0.04 + shaving * 0.14}>
          <path
            d={`M ${cx + 18} ${coneBot + 4} Q ${cx + 32} ${coneBot - 2} ${cx + 38} ${coneBot + 8}`}
            stroke={OT.woodDeep}
            strokeWidth="0.55"
            fill="none"
          />
          <path
            d={`M ${cx - 22} ${coneBot + 6} Q ${cx - 34} ${coneBot} ${cx - 40} ${coneBot + 10}`}
            stroke={OT.line}
            strokeWidth="0.45"
            fill="none"
          />
          <ellipse
            cx={cx + 26}
            cy={coneBot + 10}
            rx="5"
            ry="2.5"
            fill={OT.wood}
            opacity="0.35"
            transform={`rotate(-18 ${cx + 26} ${coneBot + 10})`}
          />
        </g>
      </svg>
    </div>
  )
}
