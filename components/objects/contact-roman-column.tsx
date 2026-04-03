"use client"

import { useMarginObject } from "@/components/site/margin-object-shell"
import styles from "./contact-roman-column.module.css"

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function smoothstep(t: number, a: number, b: number) {
  if (t <= a) return 0
  if (t >= b) return 1
  const x = (t - a) / (b - a)
  return x * x * (3 - 2 * x)
}

export function ContactRomanColumn() {
  const { progress, reduced } = useMarginObject()
  const p = clamp(reduced ? 0.9 : progress, 0, 1)
  const u = smoothstep(p, 0.12, 0.92)

  const y = 10 - u * 10
  const r = -0.8 + u * 0.6
  const s = 0.985 + u * 0.015

  return (
    <div className={styles.root} aria-hidden>
      <img
        className={styles.img}
        src="/images/roman%20column.png"
        alt=""
        draggable={false}
        decoding="async"
        style={{
          transform: `translate3d(0, ${y.toFixed(2)}px, 0) rotate(${r.toFixed(3)}deg) scale(${s.toFixed(4)})`,
        }}
      />
    </div>
  )
}

