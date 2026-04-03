import type { Metadata } from "next"
import { AboutTypewriterKeyframes } from "@/components/site/about-typewriter-keyframes"
import { SectionHeading } from "@/components/site/section-heading"
import { SitePage } from "@/components/site/site-page"
import { ABOUT_ESSAY_GROUPS } from "@/content/about-essay"

export const metadata: Metadata = {
  title: "About",
  description:
    "Not a summary. A quiet self-portrait, not a definition.",
}

const BODY =
  "font-serif text-[clamp(16px,1.08vw,19px)] leading-[1.75] text-foreground/[0.86] tracking-[-0.008em] whitespace-pre-line"

export default function AboutPage() {
  return (
    <SitePage>
      <SectionHeading
        className="about-page-masthead"
        chapter="IV"
        label="About"
        title="About"
        description="Not a summary."
      />

      <div
        id="about-margin-visual-start"
        className="h-px w-px -mt-px opacity-0 pointer-events-none"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-12">
        <div className="lg:col-span-7 min-w-0">
          <article className="pt-12 md:pt-16 border-t border-border/32 max-w-[640px]">
            <div>
              {ABOUT_ESSAY_GROUPS.map((group, gi) => (
                <div
                  key={gi}
                  className={`${group.innerSpacing} ${group.gapAfter ?? ""}`.trim()}
                >
                  {group.paragraphs.map((text, pi) => (
                    <p key={pi} className={BODY}>
                      {text}
                    </p>
                  ))}
                </div>
              ))}
            </div>
          </article>

          <div
            id="about-margin-visual-end"
            className="h-px w-px -mt-px opacity-0 pointer-events-none"
            aria-hidden
          />
        </div>

        <div className="relative z-[2] hidden min-w-0 overflow-visible lg:flex lg:col-span-3 flex-col items-center self-start pb-10 pl-1 pr-1 lg:sticky lg:top-[min(10vh,96px)]">
          <AboutTypewriterKeyframes />
        </div>

        <div className="hidden lg:block lg:col-span-2" aria-hidden />
      </div>
    </SitePage>
  )
}
