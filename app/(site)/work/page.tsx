import type { Metadata } from "next"
import Link from "next/link"
import { WorkCaliper } from "@/components/objects/work-caliper"
import { SectionHeading } from "@/components/site/section-heading"
import { MarginObjectShell } from "@/components/site/margin-object-shell"
import { SitePage } from "@/components/site/site-page"
import { WorkFeatured } from "@/components/work/work-featured"
import { WorkIndexList } from "@/components/work/work-index-list"

export const metadata: Metadata = {
  title: "Work",
  description:
    "A narrow selection of systems built for structure, coordination, and evaluation. Specific by design; not exhaustive.",
}

const START = "work-margin-object-start"
const END = "work-margin-object-end"

export default function WorkPage() {
  return (
    <SitePage>
      <SectionHeading
        chapter="I"
        label="Work"
        title="Selected work"
        description={
          <>
            A narrow selection of systems built for structure, coordination, and
            evaluation.
            <br />
            <br />
            The page stays specific by design. It is not meant to be exhaustive.
          </>
        }
      />

      <div
        id={START}
        className="h-px w-px -mt-px opacity-0 pointer-events-none"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-12">
        <div className="lg:col-span-7 min-w-0">
          <WorkFeatured />
          <section className="mt-16 md:mt-20 border-t border-border/30 pt-9 md:pt-11 max-w-3xl">
            <p className="site-subsection-label mb-3">Live instrument</p>
            <h2 className="font-serif text-[1.28rem] md:text-[1.45rem] font-light leading-tight tracking-tight text-foreground">
              Data interpretation studio
            </h2>
            <p className="mt-3 text-[13px] leading-[1.74] text-muted-foreground/66 max-w-2xl">
              A restrained prototype for reading messy tables. It checks structure
              first, then offers a small number of comparisons worth attention.
            </p>
            <div className="mt-5">
              <Link href="/work/data-interpretation-studio" className="site-link text-[12.5px]">
                Open live demo
              </Link>
            </div>
          </section>
          <WorkIndexList />
        </div>

        <div className="relative z-[2] hidden min-w-0 overflow-visible lg:flex lg:col-span-2 flex-col items-end self-start pb-10 pl-1 pr-1 lg:sticky lg:top-[min(10vh,96px)]">
          <MarginObjectShell
            startId={START}
            endId={END}
            className="mt-2 lg:mt-6 !max-w-[min(440px,44vw)] lg:!max-w-[min(490px,46vw)] translate-x-1.5 md:translate-x-2 lg:translate-x-2.5"
          >
            <WorkCaliper />
          </MarginObjectShell>
        </div>

        <div className="hidden lg:block lg:col-span-3" aria-hidden />
      </div>

      <div
        id={END}
        className="h-px w-px -mt-px opacity-0 pointer-events-none"
        aria-hidden
      />
    </SitePage>
  )
}
