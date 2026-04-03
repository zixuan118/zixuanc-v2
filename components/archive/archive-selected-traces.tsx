"use client"

import { useLayoutEffect, useRef } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

gsap.registerPlugin(ScrollTrigger)

type TraceSpec = {
  file: string
  roleKey: string
  itemClassName: string
  imgClassName: string
  rowClassName: string
  motionVariant: "anchor" | "medium" | "small"
  motionOverride?: {
    yFrom?: number
    scaleFrom?: number
    duration?: number
    scrub?: number
  }
  mtPx: number
  mbPx?: number
}

const TRACES: TraceSpec[] = [
  {
    file: "IMG_0944.JPG",
    roleKey: "IMG_0944_JPG",
    itemClassName: "archive-item--img-0944",
    imgClassName: "w-[84vw] lg:w-[44vw] max-w-[720px]",
    rowClassName:
      "flex justify-center lg:justify-start translate-x-[-2px] lg:translate-x-[-12px]",
    motionVariant: "anchor",
    mtPx: 140,
  },
  {
    file: "L1000231.JPG",
    roleKey: "L1000231_JPG",
    itemClassName: "archive-item--l1000231",
    imgClassName: "w-[56vw] lg:w-[21vw] max-w-[340px]",
    rowClassName:
      "flex justify-center lg:justify-end translate-x-[0px] lg:translate-x-[18px]",
    motionVariant: "small",
    motionOverride: { yFrom: 2, duration: 0.78, scrub: 0.02, scaleFrom: 1 },
    mtPx: 140,
  },
  {
    file: "L1000237.JPG",
    roleKey: "L1000237_JPG",
    itemClassName: "archive-item--l1000237",
    imgClassName: "w-[90vw] lg:w-[56vw] max-w-[860px]",
    rowClassName:
      "flex justify-center translate-x-[-12px] lg:translate-x-[10px]",
    motionVariant: "anchor",
    motionOverride: { yFrom: 14, scaleFrom: 0.99, duration: 1.07, scrub: 0.04 },
    mtPx: 205,
  },
  {
    file: "L1000687.JPG",
    roleKey: "L1000687_JPG",
    itemClassName: "archive-item--l1000687",
    imgClassName: "w-[74vw] lg:w-[36vw] max-w-[640px]",
    rowClassName: "flex justify-center lg:justify-end translate-x-[-2px] lg:translate-x-[14px]",
    motionVariant: "medium",
    mtPx: 220,
  },
  {
    file: "R0000062.JPG",
    roleKey: "R0000062_JPG",
    itemClassName: "archive-item--r0000062",
    imgClassName: "w-[56vw] lg:w-[22vw] max-w-[380px]",
    rowClassName:
      "flex justify-center lg:justify-start translate-x-[-4px] lg:translate-x-[-6px]",
    motionVariant: "small",
    motionOverride: { yFrom: 2, duration: 0.78, scrub: 0.02, scaleFrom: 1 },
    mtPx: 140,
  },
  {
    file: "bosBZ5709009381-R1-004-0A.jpeg",
    roleKey: "bosBZ5709009381_R1_004_0A_jpeg",
    itemClassName: "archive-item--bosbz5709009381-r1-004-0a",
    imgClassName: "w-[76vw] lg:w-[37vw] max-w-[660px]",
    rowClassName:
      "flex justify-center lg:justify-end translate-x-[-4px] lg:translate-x-[8px]",
    motionVariant: "medium",
    mtPx: 220,
  },
  {
    file: "bosBZ5709009381-R1-024-10A.jpeg",
    roleKey: "bosBZ5709009381_R1_024_10A_jpeg",
    itemClassName: "archive-item--bosbz5709009381-r1-024-10a",
    imgClassName: "w-[64vw] lg:w-[27vw] max-w-[500px]",
    rowClassName:
      "flex justify-center lg:justify-start translate-x-[-10px] lg:translate-x-[-16px]",
    motionVariant: "small",
    mtPx: 150,
  },
  {
    file: "bosBZ5709009382-R1-031-14.jpeg",
    roleKey: "bosBZ5709009382_R1_031_14_jpeg",
    itemClassName: "archive-item--bosbz5709009382-r1-031-14",
    imgClassName: "w-[72vw] lg:w-[31vw] max-w-[560px]",
    rowClassName: "flex justify-center lg:justify-end translate-x-[-2px] lg:translate-x-[6px]",
    motionVariant: "medium",
    mtPx: 180,
  },
  {
    file: "R0000302 copy.JPG",
    roleKey: "R0000302_copy_JPG",
    itemClassName: "archive-item--r0000302-copy",
    imgClassName: "w-[86vw] lg:w-[46vw] max-w-[780px]",
    rowClassName:
      "flex justify-center lg:justify-end translate-x-[2px] lg:translate-x-[10px]",
    motionVariant: "anchor",
    motionOverride: { yFrom: 14, scaleFrom: 0.99, duration: 1.18, scrub: 0.05 },
    mtPx: 290,
  },
  {
    file: "Y01351003336-R1-070-33A.jpeg",
    roleKey: "Y01351003336_R1_070_33A_jpeg",
    itemClassName: "archive-item--y01351003336-r1-070-33a",
    imgClassName: "w-[68vw] lg:w-[28vw] max-w-[520px]",
    rowClassName:
      "flex justify-center lg:justify-start translate-x-[-10px] lg:translate-x-[-14px]",
    motionVariant: "medium",
    motionOverride: { yFrom: 12, duration: 0.88, scrub: 0.04, scaleFrom: 1 },
    mtPx: 220,
  },
  {
    file: "000042420003.jpeg",
    roleKey: "000042420003_jpeg",
    itemClassName: "archive-item--000042420003",
    imgClassName:
      "w-[78vw] lg:w-[40vw] max-w-[720px] saturate-[0.84] hue-rotate-[-12deg] brightness-[1.02] contrast-[0.98]",
    rowClassName: "flex justify-center lg:justify-end translate-x-[0px] lg:translate-x-[22px]",
    motionVariant: "anchor",
    mtPx: 170,
    motionOverride: { yFrom: 12, scaleFrom: 0.99, duration: 1.0, scrub: 0.04 },
    mbPx: 380,
  },
]

function imgSrc(file: string) {
  return `/images/${encodeURIComponent(file)}`
}

export function ArchiveSelectedTraces() {
  const reduced = usePrefersReducedMotion()
  const wrapRef = useRef<HTMLDivElement | null>(null)
  const imageRefs = useRef<Array<HTMLImageElement | null>>([])

  useLayoutEffect(() => {
    const wrap = wrapRef.current
    if (!wrap) return

    const imgs = imageRefs.current
    if (!imgs || imgs.length === 0) return

    // Reduced motion: keep the archive visible, without scroll animation.
    if (reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (let i = 0; i < TRACES.length; i++) {
        const el = imgs[i]
        if (!el) continue
        gsap.set(el, { opacity: 1, y: 0, scale: 1 })
      }
      return
    }

    const ctx = gsap.context(() => {
      for (let i = 0; i < TRACES.length; i++) {
        const el = imgs[i]
        if (!el) continue

        const trace = TRACES[i]
        const variant = trace?.motionVariant ?? "medium"

        const base =
          variant === "anchor"
            ? { yFrom: 18, scaleFrom: 0.985, duration: 1.05, scrub: 0.05 }
            : variant === "small"
              ? { yFrom: 6, scaleFrom: 1, duration: 0.78, scrub: 0.02 }
              : { yFrom: 14, scaleFrom: 1, duration: 0.9, scrub: 0.03 }

        const config = {
          yFrom: trace?.motionOverride?.yFrom ?? base.yFrom,
          scaleFrom: trace?.motionOverride?.scaleFrom ?? base.scaleFrom,
          duration: trace?.motionOverride?.duration ?? base.duration,
          scrub: trace?.motionOverride?.scrub ?? base.scrub,
        }

        gsap.set(el, { opacity: 0, y: config.yFrom, scale: config.scaleFrom })
        gsap.fromTo(
          el,
          { opacity: 0, y: config.yFrom, scale: config.scaleFrom },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            ease: variant === "small" ? "power1.out" : "power2.out",
            duration: config.duration,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              end: "top 64%",
              scrub: config.scrub,
              markers: false,
              invalidateOnRefresh: true,
            },
          }
        )
      }
    }, wrap)

    return () => ctx.revert()
  }, [reduced])

  return (
    <div ref={wrapRef}>
      {TRACES.map((t, i) => (
        <figure
          key={t.file}
          className={`${t.itemClassName} w-full overflow-visible`}
          data-image={t.file}
          data-role={t.roleKey}
          style={{ marginTop: t.mtPx, marginBottom: t.mbPx ?? 0 }}
        >
          <div className={t.rowClassName}>
            <img
              ref={(el) => {
                imageRefs.current[i] = el
              }}
              src={imgSrc(t.file)}
              alt=""
              draggable={false}
              decoding="async"
              className={`block h-auto transform-gpu ${t.imgClassName}`}
              loading="lazy"
            />
          </div>
        </figure>
      ))}
    </div>
  )
}

