"use client"

import { useMarginObject } from "@/components/site/margin-object-shell"
import styles from "./work-caliper.module.css"

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function smoothstep(t: number, a: number, b: number) {
  if (t <= a) return 0
  if (t >= b) return 1
  const x = (t - a) / (b - a)
  return x * x * (3 - 2 * x)
}

/**
 * Image-based vernier caliper:
 * - body layer stays stable
 * - parts layer starts left-biased, then slides right as page scrolls down
 */
export function WorkCaliper() {
  const { progress, reduced } = useMarginObject()
  const p = clamp(reduced ? 0.9 : progress, 0, 1)
  const u = smoothstep(p, 0.08, 0.96)

  // Left-biased at top -> rightward at bottom (opening feel)
  const slideX = -28 + u * 78
  const settleY = 2 - u * 2
  const settleR = 0.6 - u * 0.8
  const partShadow = 0.08 + u * 0.08

  return (
    <div className={styles.root} aria-hidden>
      <div className={styles.stage}>
        <img
          className={styles.body}
          src="/images/vernier%20caliper%20body.png"
          alt=""
          draggable={false}
          decoding="async"
        />

        <img
          className={styles.parts}
          src="/images/vernier%20caliper%20parts.png"
          alt=""
          draggable={false}
          decoding="async"
          style={{
            transform: `translate3d(${slideX.toFixed(2)}px, ${settleY.toFixed(2)}px, 0) rotate(${settleR.toFixed(3)}deg)`,
            filter: `drop-shadow(0 8px 12px rgba(16,16,16,${partShadow.toFixed(3)}))`,
          }}
        />
      </div>
    </div>
  )
}
