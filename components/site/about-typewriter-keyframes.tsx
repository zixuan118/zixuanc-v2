"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import styles from "./about-typewriter-keyframes.module.css"

gsap.registerPlugin(ScrollTrigger)

const PAPER_SRC = "/images/paper.png" as const
const TW_SRC = "/images/typewriter.png" as const
/**
 * Intrinsic dimensions of paper.png (layout hint for the browser; does not set on-screen size).
 * On-screen size is controlled in CSS: about-typewriter-keyframes.module.css → .paper { width }.
 */
const PAPER_DIMS = { w: 1024, h: 1024 } as const
const TW_DIMS = { w: 1536, h: 1024 } as const

/**
 * GSAP transform on the paper <img> only (adds to CSS position).
 *
 * PAPER_FROM — scroll progress ≈ 0 (start of the scrub range):
 *   - x: positive → move RIGHT, negative → LEFT
 *   - y: positive → move DOWN, negative → UP
 *
 * PAPER_TO — scroll progress ≈ 1 (end of the scrub range):
 *   - same axis rules as above
 *
 * The visible “reveal” over the scroll is (PAPER_TO − PAPER_FROM) in x and y.
 */
const PAPER_FROM = { x: 0, y: 0 }
const PAPER_TO = { x: 12, y: -28 }

export function AboutTypewriterKeyframes() {
  const reduced = usePrefersReducedMotion()
  const stageRef = useRef<HTMLDivElement>(null)
  const paperRef = useRef<HTMLImageElement>(null)

  useLayoutEffect(() => {
    const stage = stageRef.current
    const paper = paperRef.current
    if (!stage || !paper) return

    if (reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(paper, PAPER_FROM)
      return
    }

    const ctx = gsap.context(() => {
      gsap.set(paper, PAPER_FROM)
      ScrollTrigger.create({
        trigger: "#about-margin-visual-start",
        endTrigger: "#about-margin-visual-end",
        start: "top 55%",
        end: "bottom 40%",
        scrub: true,
        markers: false,
        invalidateOnRefresh: true,
        animation: gsap.fromTo(paper, PAPER_FROM, { ...PAPER_TO, ease: "none" }),
      })
    }, stage)

    return () => ctx.revert()
  }, [reduced])

  return (
    <div className={styles.figure} aria-hidden>
      <div ref={stageRef} className={styles.stage}>
        <img
          ref={paperRef}
          className={styles.paper}
          src={PAPER_SRC}
          alt=""
          draggable={false}
          decoding="async"
          width={PAPER_DIMS.w}
          height={PAPER_DIMS.h}
        />
        <img
          className={styles.typewriter}
          src={TW_SRC}
          alt=""
          draggable={false}
          decoding="async"
          width={TW_DIMS.w}
          height={TW_DIMS.h}
        />
      </div>
    </div>
  )
}
