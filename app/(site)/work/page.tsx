import type { Metadata } from "next"
import { WorkCaliper } from "@/components/objects/work-caliper"
import { WorkDataStudioSection } from "@/components/work/work-data-studio-section"
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
          <WorkDataStudioSection />
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
