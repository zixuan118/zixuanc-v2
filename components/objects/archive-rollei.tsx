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
 * Rollei 35 Classic — ~3/4 side-front; lens as focal plane; iris opens with scroll.
 */
export function ArchiveRollei() {
  const { progress, reduced } = useMarginObject()
  const uid = useId()
  const p = reduced ? 0.88 : progress
  const u = smoothstep(p, 0.12, 0.94)

  const open = u
  const bladeA = 0.52 * (1 - open) + 0.06
  const cx = 118
  const cy = 132
  const gl = `ar-glass-${uid}`
  const gb = `ar-body-${uid}`
  const gr = `ar-ring-${uid}`

  return (
    <div className="will-change-transform">
      <svg
        viewBox="0 0 300 250"
        className="h-auto w-full max-h-[min(320px,40vh)] opacity-[0.93]"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id={gl} cx="38%" cy="42%" r="0.75">
            <stop offset="0%" stopColor={OT.highlight} stopOpacity="0.35" />
            <stop offset="55%" stopColor={OT.glass} stopOpacity="0.25" />
            <stop offset="100%" stopColor={OT.graphite} stopOpacity="0.55" />
          </radialGradient>
          <linearGradient id={gb} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor={OT.paper} stopOpacity="0.55" />
            <stop offset="40%" stopColor={OT.faint} stopOpacity="0.45" />
            <stop offset="100%" stopColor={OT.shadow} stopOpacity="0.42" />
          </linearGradient>
          <linearGradient id={gr} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={OT.metalDeep} stopOpacity="0.5" />
            <stop offset="50%" stopColor={OT.metal} stopOpacity="0.4" />
            <stop offset="100%" stopColor={OT.ash} stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <g transform="rotate(-6 150 125)">
          {/* body — compact brick, receding to right */}
          <path
            d="M 148 48 L 262 62 L 268 178 L 154 168 Z"
            fill={`url(#${gb})`}
            stroke={OT.line}
            strokeWidth="0.55"
            strokeOpacity="0.42"
          />
          {/* top deck / cold shoe strip */}
          <path
            d="M 168 50 L 248 60 L 246 74 L 166 64 Z"
            fill={OT.graphite}
            fillOpacity="0.32"
            stroke={OT.line}
            strokeWidth="0.4"
            strokeOpacity="0.3"
          />
          {/* rangefinder / bright line window */}
          <rect
            x="198"
            y="58"
            width="36"
            height="9"
            rx="1"
            fill={OT.highlight}
            fillOpacity="0.18"
            stroke={OT.line}
            strokeWidth="0.35"
            strokeOpacity="0.28"
          />
          {/* rewind crank */}
          <circle
            cx="248"
            cy="78"
            r="11"
            fill="none"
            stroke={OT.line}
            strokeWidth="0.5"
            strokeOpacity="0.38"
          />
          <path
            d="M 248 68 L 248 88 M 238 78 L 258 78"
            stroke={OT.line}
            strokeWidth="0.35"
            strokeOpacity="0.35"
          />
          {/* side ridge */}
          <path
            d="M 154 168 L 268 178 L 266 184 L 152 174 Z"
            fill={OT.graphite}
            fillOpacity="0.15"
          />

          {/* lens barrel — stepped */}
          <ellipse
            cx="108"
            cy={cy}
            rx="46"
            ry="42"
            fill={OT.faint}
            fillOpacity="0.4"
            stroke={OT.line}
            strokeWidth="0.55"
            strokeOpacity="0.45"
          />
          <ellipse
            cx={cx}
            cy={cy}
            rx="38"
            ry="35"
            fill={OT.shadow}
            fillOpacity="0.25"
            stroke={OT.line}
            strokeWidth="0.45"
            strokeOpacity="0.35"
          />
          <circle
            cx={cx}
            cy={cy}
            r="32"
            fill={`url(#${gr})`}
            stroke={OT.metalDeep}
            strokeWidth="0.5"
            strokeOpacity="0.45"
          />

          {/* front glass */}
          <circle
            cx={cx}
            cy={cy}
            r="26"
            fill={`url(#${gl})`}
            stroke={OT.line}
            strokeWidth="0.4"
            strokeOpacity="0.35"
          />

          {/* iris blades — mechanical, fade as opening progresses */}
          {[0, 60, 120, 180, 240, 300].map((deg) => (
            <path
              key={deg}
              d={`M ${cx} ${cy} L ${cx} ${cy - 24} L ${cx + 9} ${cy - 14} Z`}
              fill={OT.graphite}
              fillOpacity={bladeA}
              transform={`rotate(${deg} ${cx} ${cy})`}
            />
          ))}

          {/* open aperture tone — center brightens */}
          <circle
            cx={cx}
            cy={cy}
            r={6 + open * 17}
            fill={OT.highlight}
            opacity={0.05 + open * 0.38}
          />
          <circle
            cx={cx}
            cy={cy}
            r={4 + open * 12}
            fill="none"
            stroke={OT.line}
            strokeWidth="0.4"
            strokeOpacity={0.08 + open * 0.35}
          />

          {/* lens lip catch light */}
          <path
            d={`M ${cx - 26} ${cy - 8} Q ${cx - 10} ${cy - 22} ${cx + 4} ${cy - 10}`}
            stroke={OT.highlight}
            strokeWidth="0.45"
            strokeOpacity={0.12 + open * 0.28}
            fill="none"
          />
        </g>
      </svg>
    </div>
  )
}
