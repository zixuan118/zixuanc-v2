import type { Metadata } from "next"
import type { ReactNode } from "react"
import { ArchiveSelectedTraces } from "@/components/archive/archive-selected-traces"
import { ArchiveApertureClickShell } from "@/components/archive/archive-aperture-click-shell"
import { SectionHeading } from "@/components/site/section-heading"
import { SitePage } from "@/components/site/site-page"

export const metadata: Metadata = {
  title: "Archive",
  description:
    "Selected film photographs and visual notes—added gradually, without placeholder imagery.",
}

const START = "archive-margin-object-start"
const END = "archive-margin-object-end"

function SectionRule({ className = "" }: { className?: string }) {
  return (
    <div
      className={`border-t border-border/28 ${className}`.trim()}
      aria-hidden
    />
  )
}

function ArchivePlaceholderSection({
  label,
  className = "",
  bodyClassName = "",
  children,
}: {
  label: string
  className?: string
  bodyClassName?: string
  children: ReactNode
}) {
  return (
    <section className={className}>
      <div className="mb-4 md:mb-5">
        <p className="site-subsection-label">{label}</p>
      </div>
      <div className={`site-subsection-body ${bodyClassName}`.trim()}>{children}</div>
    </section>
  )
}

export default function ArchivePage() {
  return (
    <SitePage>
      <SectionHeading
        chapter="III"
        label="Archive"
        title="Selected"
        description={
          <>
            Selected over time, not all at once.
            <br />
            Some stay. Most do not.
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
          <div className="pt-12 md:pt-16 border-t border-border/40 max-w-2xl">
            <ArchiveSelectedTraces />
          </div>
        </div>

        <div className="relative z-[2] hidden min-w-0 overflow-visible lg:flex lg:col-span-2 flex-col items-end self-start pb-10 pl-1 pr-1" aria-hidden />

        <div className="hidden lg:block lg:col-span-3" aria-hidden />
      </div>

      <div className="hidden lg:flex justify-end pt-72 pb-24">
        <ArchiveApertureClickShell startId={START} endId={END} className="mt-0" />
      </div>

      <div
        id={END}
        className="h-px w-px -mt-px opacity-0 pointer-events-none"
        aria-hidden
      />
    </SitePage>
  )
}
