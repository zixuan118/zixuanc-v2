import type { Metadata } from "next"
import Link from "next/link"
import { PageShell } from "@/components/site/page-shell"
import { DataInterpretationStudio } from "@/components/data-studio/data-interpretation-studio"

export const metadata: Metadata = {
  title: "Data Interpretation Studio",
  description:
    "A restrained prototype for reading tables: structure first, comparison second.",
}

export default function DataInterpretationStudioPage() {
  return (
    <PageShell
      chapter="I"
      label="Work"
      title="Data interpretation studio"
      intro="A restrained live instrument for reading structured tables with judgment."
      contentClassName="max-w-none"
    >
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-12">
        <div className="lg:col-span-8 min-w-0">
          <DataInterpretationStudio />
        </div>
        <aside className="lg:col-span-4 min-w-0">
          <div className="lg:sticky lg:top-[min(11vh,104px)] border-t border-border/30 pt-9 max-w-sm">
            <p className="site-subsection-label mb-3">Notes</p>
            <p className="text-[12.5px] leading-[1.74] text-muted-foreground/62">
              This is intentionally selective. It does not attempt to surface every
              possible chart. It surfaces what appears comparable.
            </p>
            <div className="mt-6 border-t border-border/20 pt-5">
              <p className="text-[10px] tracking-[0.11em] uppercase text-muted-foreground/44 mb-2">
                Route
              </p>
              <p className="text-[12px] text-muted-foreground/62 font-mono">
                /work/data-interpretation-studio
              </p>
            </div>
            <div className="mt-6">
              <Link href="/work" className="site-link text-[12px]">
                Back to Work
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </PageShell>
  )
}

