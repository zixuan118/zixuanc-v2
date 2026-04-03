"use client"

import { useEffect, useRef, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

function easeSoft(t: number) {
  return 1 - Math.pow(1 - t, 2.08)
}

/**
 * Scroll-mapped 0–1 progress between two DOM ids (inclusive range).
 * Stable mid-to-late state when prefers-reduced-motion.
 */
export function usePageObjectProgress(startId: string, endId: string) {
  const reduced = usePrefersReducedMotion()
  const [progress, setProgress] = useState(reduced ? 0.88 : 0)
  const rafRef = useRef(0)

  useEffect(() => {
    if (reduced) {
      setProgress(0.88)
      return
    }

    const tick = () => {
      const a = document.getElementById(startId)
      const b = document.getElementById(endId)
      if (!a || !b) {
        setProgress(0)
        return
      }
      const top = a.getBoundingClientRect().top + window.scrollY
      const br = b.getBoundingClientRect()
      const bottom = br.top + window.scrollY + br.height
      const vh = window.innerHeight
      const trigger = top - vh * 1.08
      const finish = bottom + vh * 0.45
      const span = Math.max(280, finish - trigger)
      setProgress(easeSoft(clamp((window.scrollY - trigger) / span, 0, 1)))
    }

    const onScroll = () => {
      cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(tick)
    }

    tick()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      cancelAnimationFrame(rafRef.current)
    }
  }, [reduced, startId, endId])

  return { progress, reduced }
}
