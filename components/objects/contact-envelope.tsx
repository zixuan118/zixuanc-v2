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
 * Envelope — flap opens slightly; card edge only.
 */
export function ContactEnvelope() {
  const { progress, reduced } = useMarginObject()
  const p = reduced ? 0.88 : progress
  const lift = smoothstep(p, 0.18, 0.9)
  const flapAngle = (1 - lift) * 11
  const cardPeek = 0.12 + lift * 0.38

  return (
    <div className="will-change-transform">
      <svg
        viewBox="0 0 240 200"
        className="h-auto w-full max-h-[min(220px,30vh)] opacity-[0.92]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="ce-paper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={OT.paper} stopOpacity="0.55" />
            <stop offset="100%" stopColor={OT.faint} stopOpacity="0.35" />
          </linearGradient>
        </defs>

        {/* back */}
        <path
          d="M 32 72 L 208 72 L 208 156 L 32 156 Z"
          fill="url(#ce-paper)"
          stroke={OT.line}
          strokeWidth="0.5"
          strokeOpacity="0.35"
        />

        {/* card edge */}
        <path
          d="M 52 88 L 188 88 L 188 96 L 52 96 Z"
          fill={OT.graphite}
          fillOpacity={0.06 + cardPeek * 0.18}
          stroke={OT.line}
          strokeWidth="0.35"
          strokeOpacity={0.12 + cardPeek * 0.25}
        />

        {/* inner V */}
        <path
          d="M 32 156 L 120 108 L 208 156 L 32 156 Z"
          fill={OT.faint}
          fillOpacity="0.25"
          stroke={OT.line}
          strokeWidth="0.4"
          strokeOpacity="0.22"
        />

        {/* flap — rotate around top edge of back */}
        <g transform={`rotate(${-flapAngle} 120 72)`}>
          <path
            d="M 32 72 L 120 28 L 208 72 L 32 72 Z"
            fill={OT.paper}
            fillOpacity="0.38"
            stroke={OT.line}
            strokeWidth="0.48"
            strokeOpacity="0.38"
          />
          <path
            d="M 48 72 L 120 40 L 192 72"
            stroke={OT.line}
            strokeWidth="0.35"
            strokeOpacity="0.2"
            fill="none"
          />
        </g>
      </svg>
    </div>
  )
}
