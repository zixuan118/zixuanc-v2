"use client"

import Link from "next/link"
import { ChapterLabel } from "@/components/site/chapter-label"
import { SectionRule } from "@/components/home/section-rule"
import { useHomeInteraction, useHomeSection } from "@/components/home/home-interaction"
import { routes } from "@/config/site"

export function VisualFragment() {
  const { ref: sectionRef, isActive } = useHomeSection("archive")
  const { reducedMotion } = useHomeInteraction()

  return (
    <section
      ref={sectionRef}
      id="archive"
      className={`site-section site-section--before-footer bg-secondary/25 border-t transition-colors duration-300 ease-[var(--site-ease-soft)] home-section ${
        isActive ? "border-border/45" : "border-border/30"
      } ${isActive || reducedMotion ? "home-section--active" : ""}`}
    >
      <div className="site-container">
        <div className="group/row">
          <div className="home-masthead mb-11 md:mb-[3.25rem]">
            <ChapterLabel chapter="III" label="Archive" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
              <div className="md:col-span-6">
                <h2 className="site-section-title transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:text-foreground">
                  Selected images
                </h2>
              </div>
              <div className="md:col-span-5 md:col-start-8">
                <p className="site-description max-w-[34ch] md:max-w-none transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:text-muted-foreground/68 whitespace-pre-line">
                  {`Selected images, kept over time.
Only the frames that stayed.`}
                </p>
              </div>
            </div>
          </div>

          <Link
            href={routes.archive}
            className="group block site-focus-ring"
          >
            <SectionRule groupInteractive emphasize={isActive} />
            <div className="relative pt-10 md:pt-12">
              <div className="max-w-2xl max-md:ml-auto max-md:text-right md:text-left">
                <p className="site-kicker mb-4 transition-colors duration-[var(--site-duration-fast)] group-hover/row:text-muted-foreground/55 group-hover:text-muted-foreground/55">
                  From the archive
                </p>
                <p className="text-[14px] md:text-[15px] text-muted-foreground/68 leading-[1.76] whitespace-pre-line transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:text-muted-foreground/78 group-hover:text-muted-foreground/78">
                  {`Film photographs, kept quietly.
Mostly 35mm.
Mostly ordinary light.

A file, not a wall.`}
                </p>
                <div className="site-cta-rule border-border/30 transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:border-border/44">
                  <span className="text-[11px] tracking-[0.12em] uppercase site-cta-text">
                    Archive ↗
                  </span>
                </div>
              </div>
            </div>
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
