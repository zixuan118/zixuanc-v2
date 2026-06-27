"use client"

import Link from "next/link"
import { ChapterLabel } from "@/components/site/chapter-label"
import { SectionRule } from "@/components/home/section-rule"
import { useHomeInteraction, useHomeSection } from "@/components/home/home-interaction"
import { routes } from "@/config/site"

export function WritingSection() {
  const { ref: sectionRef, isActive } = useHomeSection("notes")
  const { reducedMotion } = useHomeInteraction()

  return (
    <section
      ref={sectionRef}
      id="notes"
      className={`site-section site-section--before-footer bg-secondary/25 border-t transition-colors duration-300 ease-[var(--site-ease-soft)] home-section ${
        isActive ? "border-border/45" : "border-border/30"
      } ${isActive || reducedMotion ? "home-section--active" : ""}`}
    >
      <div className="site-container">
        <div className="group/row">
          <div className="home-masthead mb-11 md:mb-[3.25rem]">
            <ChapterLabel chapter="III" label="Notes" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
              <div className="md:col-span-6">
                <h2 className="site-section-title transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:text-foreground">
                  Notes & fragments
                </h2>
              </div>
              <div className="md:col-span-5 md:col-start-8">
                <p className="site-description max-w-[34ch] md:max-w-none transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:text-muted-foreground/68 whitespace-pre-line">
                  {`Selected fragments across time.
Observations, feelings, and what stayed.`}
                </p>
              </div>
            </div>
          </div>

          <Link
            href={routes.notes}
            className="group block site-focus-ring"
          >
            <SectionRule groupInteractive emphasize={isActive} />
            <article className="relative pt-10 md:pt-12">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10">
                <div className="lg:col-span-3 order-2 lg:order-1">
                  <p className="site-kicker transition-colors duration-[var(--site-duration-fast)] group-hover/row:text-muted-foreground/55 group-hover:text-muted-foreground/55">
                    Preview
                  </p>
                </div>

                <div className="lg:col-span-8 lg:col-start-5 order-1 lg:order-2">
                  <div
                    className="max-w-xl border-l border-border/45 pl-5 md:pl-7 py-0.5 transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:border-border/55 group-hover:border-border/55 max-md:ml-auto max-md:border-l-0 max-md:border-r max-md:pl-0 max-md:pr-5 md:border-r-0"
                  >
                    <p className="text-[14px] md:text-[15px] text-muted-foreground/72 leading-[1.76] font-light whitespace-pre-line transition-colors duration-[var(--site-duration-fast)] group-hover/row:text-muted-foreground/84 group-hover:text-muted-foreground/84 max-md:text-right md:text-left">
                      {`Some thoughts arrive clearly.
Some only make sense later.

Most are kept as they were.`}
                    </p>
                  </div>
                  <div className="mt-9 md:mt-10 border-t border-border/30 pt-6 transition-colors duration-[var(--site-duration-fast)] group-hover/row:border-border/42 group-hover:border-border/42">
                    <span className="text-[11px] tracking-[0.12em] uppercase site-cta-text">
                      Open Notes ↗
                    </span>
                  </div>
                </div>
              </div>
            </article>
          </Link>
        </div>
      </div>
      <div
        id="home-margin-object-end"
        className="h-px w-px -mt-px opacity-0 pointer-events-none"
        aria-hidden
      />
    </section>
  )
}
