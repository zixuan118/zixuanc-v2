"use client"

import { useEffect, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import { loadBostonHeroWeather } from "@/lib/weather/boston-weather"
import { tonalWeatherSecondLine } from "@/lib/weather/weather-tonal-phrase"
import type { HeroWeatherSnapshot } from "@/lib/weather/types"

/**
 * Marginal weather — ambient text only; fetch/cache in lib/weather.
 */
export function HeroWeatherNote() {
  const reduced = usePrefersReducedMotion()
  const [snap, setSnap] = useState<HeroWeatherSnapshot | null>(null)
  const [revealed, setRevealed] = useState(false)

  useEffect(() => {
    let cancelled = false
    loadBostonHeroWeather().then((s) => {
      if (!cancelled) setSnap(s)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (reduced) {
      setRevealed(true)
      return
    }
    const id = requestAnimationFrame(() => setRevealed(true))
    return () => cancelAnimationFrame(id)
  }, [reduced])

  const settled = snap !== null
  const showFallback = snap?.ok === false

  const fadeMs = reduced ? 0 : 1280
  const fadeClass = revealed ? "opacity-100" : "opacity-0"

  return (
    <div
      className={`w-full text-left ${!reduced ? "weather-note-drift" : ""} transition-opacity ease-[cubic-bezier(0.25,0.1,0.25,1)] motion-reduce:transition-none ${fadeClass}`}
      style={{ transitionDuration: reduced ? "0ms" : `${fadeMs}ms` }}
    >
      {!settled ? (
        <p className="font-serif font-light text-[14px] md:text-[15px] leading-[1.3] text-foreground/[0.48] tracking-[-0.02em]">
          …
        </p>
      ) : showFallback ? (
        <p className="font-serif font-light text-[12px] md:text-[13px] leading-[1.35] text-foreground/[0.57] tracking-[-0.038em]">
          weather unavailable
        </p>
      ) : (
        <>
          <p className="font-serif font-light text-[15px] md:text-[16px] leading-[1.28] text-foreground/[0.78] tracking-[-0.02em]">
            {snap.tempF}°
          </p>
          <p className="font-serif font-light text-[12px] md:text-[13px] leading-[1.32] text-foreground/[0.57] tracking-[-0.045em] mt-[0.22em] -ml-[11px] md:-ml-2 lg:-ml-2.5">
            {tonalWeatherSecondLine(snap.skyPhrase, snap.windPhrase)}
          </p>
        </>
      )}
    </div>
  )
}
