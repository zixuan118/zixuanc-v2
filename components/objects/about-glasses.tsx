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
 * Reading glasses — angled rest, graphite frame mass, temple opens, lens reflection + trace.
 */
export function AboutGlasses() {
  const { progress, reduced } = useMarginObject()
  const uid = useId()
  const p = reduced ? 0.88 : progress
  const settle = smoothstep(p, 0.1, 0.92)
  const sweep = smoothstep(p, 0.2, 0.95)

  const lensTone = 0.22 + settle * 0.38
  const traceOp = 0.04 + settle * 0.22

  const gl = `ag-lens-${uid}`
  const gr = `ag-reflect-${uid}`

  return (
    <div className="will-change-transform">
      <svg
        viewBox="0 0 300 220"
        className="h-auto w-full max-h-[min(320px,38vh)] opacity-[0.94]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={gl} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OT.glass} stopOpacity={0.12 + lensTone * 0.15} />
            <stop offset="100%" stopColor={OT.faint} stopOpacity={0.08 + lensTone * 0.12} />
          </linearGradient>
          <linearGradient
            id={gr}
            gradientUnits="userSpaceOnUse"
            x1={52 + sweep * 36}
            y1="58"
            x2={160 + sweep * 28}
            y2="150"
          >
            <stop offset="0%" stopColor={OT.highlight} stopOpacity="0" />
            <stop offset="42%" stopColor={OT.highlight} stopOpacity="0.55" />
            <stop offset="100%" stopColor={OT.highlight} stopOpacity="0" />
          </linearGradient>
        </defs>

        <g transform="translate(8 6) rotate(-7 150 110)">
          {/* left temple — opens from folded */}
          <g transform={`rotate(${-5 - (1 - settle) * 12} 62 108)`}>
            <path
              d="M 62 108 Q 28 112 12 124"
              fill="none"
              stroke={OT.graphite}
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeOpacity="0.62"
            />
            <circle cx="62" cy="108" r="3.2" fill={OT.metal} fillOpacity="0.35" />
          </g>

          {/* left rim — slight asymmetry */}
          <rect
            x="72"
            y="72"
            width="76"
            height="64"
            rx="20"
            ry="26"
            fill="none"
            stroke={OT.graphite}
            strokeWidth="2.35"
            strokeOpacity="0.68"
          />

          {/* right rim */}
          <rect
            x="158"
            y="74"
            width="74"
            height="62"
            rx="19"
            ry="25"
            fill="none"
            stroke={OT.graphite}
            strokeWidth="2.35"
            strokeOpacity="0.66"
          />

          {/* keyhole bridge */}
          <path
            d="M 148 100 Q 154 96 160 100 Q 154 104 148 100"
            fill={OT.graphite}
            fillOpacity="0.45"
            stroke={OT.graphite}
            strokeWidth="1.2"
            strokeOpacity="0.55"
          />

          {/* lenses */}
          <rect
            x="76"
            y="78"
            width="68"
            height="52"
            rx="16"
            ry="22"
            fill={`url(#${gl})`}
            stroke={OT.line}
            strokeWidth="0.5"
            strokeOpacity="0.28"
          />
          <rect
            x="162"
            y="80"
            width="66"
            height="50"
            rx="15"
            ry="21"
            fill={`url(#${gl})`}
            stroke={OT.line}
            strokeWidth="0.5"
            strokeOpacity="0.26"
          />

          {/* reflection sweep — left lens */}
          <rect
            x="76"
            y="78"
            width="68"
            height="52"
            rx="16"
            ry="22"
            fill={`url(#${gr})`}
            opacity={0.35 + sweep * 0.25}
          />

          {/* blurred line — attention */}
          <text
            x="88"
            y="112"
            fontSize="8.5"
            fontFamily="ui-serif, Georgia, serif"
            fill={OT.graphiteSoft}
            opacity={traceOp}
            transform="rotate(-4 120 108)"
          >
            seeing
          </text>

          {/* nose pads */}
          <ellipse
            cx="150"
            cy="118"
            rx="3"
            ry="4"
            fill={OT.metal}
            fillOpacity="0.35"
          />

          {/* right temple */}
          <g transform={`rotate(${5 + (1 - settle) * 11} 238 108)`}>
            <path
              d="M 238 108 Q 272 112 288 122"
              fill="none"
              stroke={OT.graphite}
              strokeWidth="2.1"
              strokeLinecap="round"
              strokeOpacity="0.6"
            />
            <circle cx="238" cy="108" r="3.2" fill={OT.metal} fillOpacity="0.35" />
          </g>
        </g>
      </svg>
    </div>
  )
}
