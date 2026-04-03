"use client"

import Link from "next/link"
import { ChapterLabel } from "@/components/site/chapter-label"
import { SectionRule } from "@/components/home/section-rule"
import { useHomeInteraction, useHomeSection } from "@/components/home/home-interaction"
import { getFeaturedProject } from "@/content/work"
import { routes } from "@/config/site"

const PREVIEW_BODY = "whitespace-pre-line text-[14px] text-muted-foreground/65 leading-[1.74] transition-colors duration-[var(--site-duration-fast)] group-hover/row:text-muted-foreground/76 group-hover:text-muted-foreground/76"

export function FeaturedProject() {
  const project = getFeaturedProject()
  const { ref: sectionRef, isActive } = useHomeSection("work")
  const { reducedMotion } = useHomeInteraction()

  return (
    <section
      ref={sectionRef}
      id="work"
      className={`site-section-continued home-section ${
        isActive || reducedMotion ? "home-section--active" : ""
      }`}
    >
      <div
        id="home-margin-object-start"
        className="h-px w-px -mt-px opacity-0 pointer-events-none"
        aria-hidden
      />
      <div className="site-container">
        <div className="group/row">
          <div className="home-masthead home-masthead--soft-chapter mb-10 md:mb-12">
            <ChapterLabel chapter="I" label="Work" />
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10">
              <div className="md:col-span-7">
                <h2 className="site-section-title transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:text-foreground">
                  Work
                </h2>
              </div>
              <div className="md:col-span-4 md:col-start-9">
                <p className="site-description max-w-[32ch] md:max-w-none transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:text-muted-foreground/68 whitespace-pre-line">
                  {`Small products and analytical tools,
built for use rather than display.`}
                </p>
              </div>
            </div>
          </div>

          <Link
            href={routes.work}
            className="group relative block site-focus-ring"
          >
            <SectionRule groupInteractive emphasize={isActive} />
            <div className="relative pt-9 md:pt-11">
              <div className="lg:col-span-12">
                <h3 className="font-serif text-[1.6rem] md:text-[1.85rem] font-light text-foreground mb-10 md:mb-12 leading-snug transition-[color] duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:text-foreground group-hover:text-foreground max-w-3xl">
                  {project.title}
                </h3>
                <div className="space-y-5 text-[14px] text-muted-foreground/82 leading-[1.72] max-w-3xl transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:text-muted-foreground/88 group-hover:text-muted-foreground/88">
                  <p className="whitespace-pre-line">{project.framing}</p>
                  {project.body.map((para, i) => (
                    <p key={i} className={PREVIEW_BODY}>
                      {para}
                    </p>
                  ))}
                </div>
                <div className="site-cta-rule border-border/30 transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/row:border-border/44">
                  <span className="text-[11px] tracking-[0.12em] uppercase site-cta-text inline-flex items-center gap-2">
                    Continue to Work
                    <span className="text-[10px] font-mono text-muted-foreground/40 transition-colors duration-[var(--site-duration-fast)] group-hover:text-muted-foreground/65">
                      →
                    </span>
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </section>
  )
}
