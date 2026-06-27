"use client"

import { useLayoutEffect, useState } from "react"
import { HeroWeatherNote } from "@/components/home/hero-weather-note"
import { MarginObjectShell } from "@/components/site/margin-object-shell"
import { useHomeSection } from "@/components/home/home-interaction"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

const HOME_MARGIN_START = "home-margin-object-start"
const HOME_MARGIN_END = "home-margin-object-end"

export function HeroSection() {
  const { ref: sectionRef, isActive } = useHomeSection("hero")
  const reducedMotion = usePrefersReducedMotion()
  const [isVisible, setIsVisible] = useState(false)

  useLayoutEffect(() => {
    if (reducedMotion) {
      setIsVisible(true)
      return
    }
    const id = requestAnimationFrame(() => setIsVisible(true))
    return () => cancelAnimationFrame(id)
  }, [reducedMotion])

  const heroSettled = isVisible

  return (
    <section
      ref={sectionRef}
      id="hero"
      className={`home-section min-h-screen flex flex-col px-6 lg:px-8 pt-24 pb-16 md:pt-28 md:pb-20 ${
        isActive || reducedMotion ? "home-section--active" : ""
      }`}
    >
      <div className="mx-auto max-w-6xl w-full flex-1 flex flex-col">
        <div className="flex-1 flex flex-col justify-center min-h-[52vh]">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-x-12 lg:gap-y-14 items-start">
            <div className="lg:col-span-8 min-w-0">
              <div
                className={`transition-all ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  heroSettled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
                }`}
                style={{
                  transitionDuration: reducedMotion ? "0ms" : "480ms",
                }}
              >
                <h1 className="font-serif text-[2.05rem] sm:text-[2.55rem] md:text-[2.85rem] lg:text-[3.35rem] font-light tracking-[-0.016em] text-foreground max-w-[min(100%,40rem)] whitespace-pre-line leading-[1.075] sm:leading-[1.068]">
                  {`I work between analysis,
interfaces, and language.

What stays with me
is usually quieter than that.`}
                </h1>
              </div>

              <div
                className={`mt-12 md:mt-14 max-w-xl transition-all ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  heroSettled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1.5"
                }`}
                style={{
                  transitionDuration: reducedMotion ? "0ms" : "560ms",
                  transitionDelay: reducedMotion ? "0ms" : "45ms",
                }}
              >
                <p className="text-[13px] md:text-[14px] text-muted-foreground/62 leading-[1.72] tracking-[-0.01em] whitespace-pre-line">
                  {`Financial analysis, product systems, selected images, and notes.
A personal file, built slowly.`}
                </p>
              </div>
            </div>

            <div className="lg:col-span-3 lg:col-start-10 flex flex-col items-end gap-10 lg:gap-12 w-full lg:w-auto lg:sticky lg:top-[min(10vh,96px)]">
              <div
                className={`w-full max-w-[16rem] lg:max-w-none flex justify-start lg:justify-end mt-4 md:mt-[1.125rem] lg:mt-5 mr-6 md:mr-10 lg:mr-12 transition-opacity ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  heroSettled ? "opacity-100" : "opacity-0"
                }`}
                style={{
                  transitionDuration: reducedMotion ? "0ms" : "400ms",
                  transitionDelay: reducedMotion ? "0ms" : "40ms",
                }}
              >
                <MarginObjectShell
                  startId={HOME_MARGIN_START}
                  endId={HOME_MARGIN_END}
                  className="!w-max !max-w-[min(11rem,52vw)] shrink-0"
                >
                  <HeroWeatherNote />
                </MarginObjectShell>
              </div>

              <div
                className={`w-full max-w-[16rem] lg:max-w-none border-l-[1.5px] pl-[1.125rem] transition-all ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
                  isActive ? "border-foreground/16" : "border-foreground/9"
                } ${heroSettled ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"}`}
                style={{
                  transitionDuration: reducedMotion ? "0ms" : "400ms",
                  transitionDelay: reducedMotion ? "0ms" : "52ms",
                }}
              >
                <div className="space-y-11 text-[11px] leading-[1.62] opacity-[0.78] tracking-[0.014em]">
                  <div>
                    <p className="font-mono text-[8px] tracking-[0.27em] uppercase text-muted-foreground/28 mb-2.5">
                      Based in
                    </p>
                    <p className="text-muted-foreground/58">Boston</p>
                  </div>
                  <div>
                    <p className="font-mono text-[8px] tracking-[0.27em] uppercase text-muted-foreground/28 mb-3">
                      Working across
                    </p>
                    <div className="flex flex-col gap-1.5 text-muted-foreground/64">
                      <span>Analysis</span>
                      <span>Product systems</span>
                      <span>Writing</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
