"use client"

import { useEffect, useRef, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
type SectionRuleProps = {
  /** When true, line deepens slightly with parent .group:hover */
  groupInteractive?: boolean
  /** Section is scroll-active: baseline line reads slightly clearer */
  emphasize?: boolean
  className?: string
}

export function SectionRule({
  groupInteractive,
  emphasize,
  className = "",
}: SectionRuleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(false)
  const reduced = usePrefersReducedMotion()

  useEffect(() => {
    if (reduced) {
      setVisible(true)
      return
    }
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e?.isIntersecting) setVisible(true)
      },
      { threshold: 0.06, rootMargin: "32px 0px 0px 0px" }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reduced])

  return (
    <div
      ref={ref}
      className={`pointer-events-none absolute left-0 right-0 top-0 ${className}`}
      aria-hidden
    >
      <div
        className={`home-section__rule-line h-px w-full origin-left transition-[opacity,background-color] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
          emphasize ? "bg-border/50" : "bg-border/44"
        } ${
          groupInteractive
            ? "group-hover:bg-border/58 group-focus-within:bg-border/55"
            : ""
        } ${visible || reduced ? "opacity-100" : "opacity-0"}`}
        style={{
          transitionDuration: reduced ? "0ms" : "520ms",
        }}
      />
    </div>
  )
}
