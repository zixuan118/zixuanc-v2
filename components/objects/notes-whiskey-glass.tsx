"use client"

import { useEffect, useRef } from "react"
import { useMarginObject } from "@/components/site/margin-object-shell"
import styles from "./notes-whiskey-glass.module.css"

const GLASS_SRC = "/images/glass.png" as const
const ICE_SRC = "/images/ice.png" as const
const GLASS_DIMS = { w: 1536, h: 1024 } as const
const ICE_DIMS = { w: 1536, h: 1024 } as const

// Tunable constants (manual art direction)
// Initial "resting in liquid" pose: slightly off-center and not perfectly upright.
const ICE_SCALE = 0.968
const ICE_BASE_X_PX = 2.0
const ICE_BASE_Y_PX = -1.4
const ICE_BASE_ROT_DEG = -2.1

// Extremely subtle idle drift (not obviously cyclic to the eye).
const ICE_IDLE_Y_PX = 1.25
const ICE_IDLE_X_PX = 0.55
const ICE_IDLE_ROT_DEG = 0.75
const ICE_IDLE_OPACITY_SWING = 0.018

// Keep scroll coupling minimal; main feeling comes from subtle drift, not directional travel.
const ICE_SCROLL_X_PX = 0.45
const ICE_SCROLL_Y_PX = -1.1
const ICE_SCROLL_ROT_DEG = 0.2

const GLASS_SCROLL_Y_PX = -0.6

function clamp(n: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, n))
}

export function NotesWhiskeyGlass() {
  const { progress, reduced } = useMarginObject()
  const glassRef = useRef<HTMLImageElement>(null)
  const liquidRef = useRef<HTMLDivElement>(null)
  const iceRef = useRef<HTMLImageElement>(null)
  const progressRef = useRef(progress)
  const lastScrollYRef = useRef(0)
  const lastTsRef = useRef(0)
  const jitterEnergyRef = useRef(0)
  const driftXRef = useRef(0)
  const driftYRef = useRef(0)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const glass = glassRef.current
    const liquid = liquidRef.current
    const ice = iceRef.current
    if (!glass || !ice || !liquid) return

    let raf = 0
    const t0 = performance.now()
    lastScrollYRef.current = window.scrollY
    lastTsRef.current = t0
    jitterEnergyRef.current = 0
    driftXRef.current = 0
    driftYRef.current = 0

    const renderStatic = () => {
      const p = clamp(progressRef.current, 0, 1)
      const settle = clamp((p - 0.68) / 0.32, 0, 1)
      const damp = 1 - settle * 0.85
      const glassY = reduced ? 0 : GLASS_SCROLL_Y_PX * p
      const x =
        ICE_BASE_X_PX +
        (reduced ? 0 : ICE_SCROLL_X_PX * p * (0.55 + 0.45 * damp))
      const y =
        ICE_BASE_Y_PX +
        (reduced ? 0 : ICE_SCROLL_Y_PX * p * (0.55 + 0.45 * damp))
      const rot =
        ICE_BASE_ROT_DEG +
        (reduced ? 0 : ICE_SCROLL_ROT_DEG * p * (0.55 + 0.45 * damp))
      const alpha = 0.87 + (reduced ? 0 : ICE_IDLE_OPACITY_SWING * 0.2)
      const liquidX = x * 0.14
      const liquidY = y * 0.2
      const liquidTilt = rot * -0.35

      glass.style.transform = `translate3d(0, ${glassY.toFixed(2)}px, 0)`
      liquid.style.transform = `translate3d(${liquidX.toFixed(2)}px, ${liquidY.toFixed(2)}px, 0) rotate(${liquidTilt.toFixed(2)}deg)`
      ice.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${ICE_SCALE})`
      ice.style.opacity = alpha.toFixed(3)
    }

    if (reduced) {
      renderStatic()
      return
    }

    const loop = (now: number) => {
      const p = clamp(progressRef.current, 0, 1)
      const settle = clamp((p - 0.68) / 0.32, 0, 1)
      const damp = 1 - settle * 0.85
      const t = (now - t0) / 1000
      const dtMs = Math.max(16, now - lastTsRef.current)
      const scrollY = window.scrollY
      const scrollVel = (scrollY - lastScrollYRef.current) / dtMs // px/ms
      const speed = Math.abs(scrollVel)
      lastScrollYRef.current = scrollY
      lastTsRef.current = now

      // nearly-static glass: tiny scroll-only float
      const glassY = GLASS_SCROLL_Y_PX * p
      glass.style.transform = `translate3d(0, ${glassY.toFixed(2)}px, 0)`

      // ice: subtle idle drift + gentle scroll-linked drift
      const idleY =
        Math.sin(t * 0.26 + 0.6) * ICE_IDLE_Y_PX +
        Math.sin(t * 0.1 + 1.2) * 0.24
      const idleX =
        Math.sin(t * 0.19 + 0.9) * ICE_IDLE_X_PX +
        Math.sin(t * 0.06 + 0.2) * 0.18
      const idleRot =
        Math.sin(t * 0.17 + 0.8) * ICE_IDLE_ROT_DEG +
        Math.sin(t * 0.05 + 1.7) * 0.32
      const alphaPulse = Math.sin(t * 0.12 + 0.4) * ICE_IDLE_OPACITY_SWING

      // Fast scroll injects a short-lived micro tremor.
      const kick =
        clamp((speed - 0.28) / 1.9, 0, 1) * (1 - settle * 0.65)
      jitterEnergyRef.current = clamp(
        jitterEnergyRef.current * 0.88 + kick * 0.16,
        0,
        1
      )

      // Non-directional tiny random walk (mostly horizontal), bounded inside the glass.
      driftXRef.current = clamp(
        driftXRef.current + (Math.random() - 0.5) * 0.32 * jitterEnergyRef.current,
        -1.5,
        1.5
      )
      driftYRef.current = clamp(
        driftYRef.current + (Math.random() - 0.5) * 0.15 * jitterEnergyRef.current,
        -0.75,
        0.75
      )

      // Very small high-frequency shake only when energy exists.
      const tremorX = Math.sin(t * 8.2 + 0.7) * 0.33 * jitterEnergyRef.current
      const tremorRot = Math.sin(t * 7.4 + 1.1) * 0.2 * jitterEnergyRef.current

      const scrollBlend = 0.52 + 0.48 * damp
      const x =
        ICE_BASE_X_PX +
        ICE_SCROLL_X_PX * p * scrollBlend +
        idleX +
        driftXRef.current * damp +
        tremorX * damp
      const y =
        ICE_BASE_Y_PX +
        ICE_SCROLL_Y_PX * p * scrollBlend +
        idleY +
        driftYRef.current * damp
      const rot =
        ICE_BASE_ROT_DEG +
        ICE_SCROLL_ROT_DEG * p * scrollBlend +
        idleRot +
        tremorRot * damp
      const alpha = 0.87 + alphaPulse
      const liquidX =
        x * 0.14 +
        Math.sin(t * 0.31 + 0.5) * 0.45 * damp
      const liquidY =
        y * 0.2 +
        (Math.sin(t * 0.25 + 1.1) * 0.8 +
          Math.sin(t * 6.1 + 0.9) * 0.45 * jitterEnergyRef.current) *
          damp
      const liquidTilt =
        rot * -0.35 +
        (Math.sin(t * 0.29 + 1.7) * 0.6 +
          Math.sin(t * 5.4 + 0.4) * 0.38 * jitterEnergyRef.current) *
          damp

      ice.style.transform = `translate3d(${x.toFixed(2)}px, ${y.toFixed(2)}px, 0) rotate(${rot.toFixed(2)}deg) scale(${ICE_SCALE})`
      ice.style.opacity = alpha.toFixed(3)
      liquid.style.transform = `translate3d(${liquidX.toFixed(2)}px, ${liquidY.toFixed(2)}px, 0) rotate(${liquidTilt.toFixed(2)}deg)`

      raf = requestAnimationFrame(loop)
    }

    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [reduced])

  return (
    <div className={styles.root}>
      <div className={styles.stage}>
        <img
          ref={glassRef}
          className={`${styles.glass} ${styles.paperLikeSoftness}`}
          src={GLASS_SRC}
          alt=""
          draggable={false}
          decoding="async"
          width={GLASS_DIMS.w}
          height={GLASS_DIMS.h}
        />
        <div ref={liquidRef} className={styles.liquid} />
        <img
          ref={iceRef}
          className={`${styles.ice} ${styles.paperLikeSoftness}`}
          src={ICE_SRC}
          alt=""
          draggable={false}
          decoding="async"
          width={ICE_DIMS.w}
          height={ICE_DIMS.h}
        />
      </div>
    </div>
  )
}
