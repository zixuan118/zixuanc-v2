import type { Metadata } from "next"
import Link from "next/link"
import { PageShell } from "@/components/site/page-shell"
import { STUDIO_FACTS_BOUNDARY, STUDIO_FLOW } from "@/lib/data-studio/copy"
import { DataInterpretationStudio } from "@/components/data-studio/data-interpretation-studio"

export const metadata: Metadata = {
  title: "Data Interpretation Studio",
  description:
    "Browser-based data readiness: audit messy tables, plan comparisons, visualize with judgment, explain in plain English.",
}

export default function DataInterpretationStudioPage() {
  return (
    <PageShell
      chapter="I"
      label="Work"
      title="Data Interpretation Studio"
      intro={`${STUDIO_FLOW}. Algorithms compute the facts first. The optional second reading explains those results.`}
      contentClassName="max-w-none"
    >
      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-12">
        <div className="lg:col-span-8 min-w-0">
          <DataInterpretationStudio />
        </div>
        <aside className="lg:col-span-4 min-w-0">
          <div className="lg:sticky lg:top-[min(11vh,104px)] border-t border-border/30 pt-9 max-w-sm">
            <p className="site-subsection-label mb-3">Notes</p>
            <p className="text-[13px] leading-[1.74] text-muted-foreground/72">
              {STUDIO_FLOW}. {STUDIO_FACTS_BOUNDARY}
            </p>
            <div className="mt-6 border-t border-border/20 pt-5">
              <p className="text-[10px] tracking-[0.11em] uppercase text-muted-foreground/52 mb-2">
                Route
              </p>
              <p className="text-[12.5px] text-muted-foreground/72 font-mono">
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

