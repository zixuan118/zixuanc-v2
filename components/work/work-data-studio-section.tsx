import Link from "next/link"
import { dataStudioTechnicalNotes } from "@/content/data-studio-technical-notes"
import { STUDIO_FLOW } from "@/lib/data-studio/copy"
import { WorkTechnicalNotes } from "@/components/work/work-technical-notes"

export function WorkDataStudioSection() {
  return (
    <section className="mt-16 md:mt-20 border-t border-border/30 pt-9 md:pt-11 max-w-3xl">
      <p className="site-subsection-label mb-3">Live instrument</p>
      <h2 className="font-serif text-[1.28rem] md:text-[1.45rem] font-light leading-tight tracking-tight text-foreground">
        Data Interpretation Studio
      </h2>
      <p className="mt-3 text-[13px] leading-[1.74] text-muted-foreground/66 max-w-2xl">
        A browser-based workflow for messy business tables: clean and audit the file,
        plan defensible comparisons, visualize with restraint, and optionally request
        a plain-language second reading. Algorithms compute the facts first; the
        explanation layer does not replace statistics.
      </p>
      <p className="mt-3 text-[12px] leading-[1.68] text-muted-foreground/52 max-w-2xl font-mono tracking-[0.02em]">
        {STUDIO_FLOW}
      </p>
      <ul className="mt-4 space-y-1.5 text-[12.5px] leading-[1.68] text-muted-foreground/58 max-w-2xl">
        <li>
          Deterministic cleaning with a downloadable receipt; the original file stays
          unchanged.
        </li>
        <li>
          Profiles missingness, types, duplicates, drift, and outliers entirely in
          the browser.
        </li>
        <li>
          Selects one primary comparison with an explicit readiness label before
          drawing charts.
        </li>
        <li>
          Exports cleaned CSV or XLSX, profile JSON, and cleaning log JSON.
        </li>
      </ul>
      <div className="mt-4 flex flex-wrap gap-2">
        {[
          "File intake",
          "Cleaning",
          "Data audit",
          "Analysis plan",
          "Visual board",
          "Second reading",
          "Export",
        ].map((tag) => (
          <span
            key={tag}
            className="inline-block rounded-sm border border-border/28 px-2 py-0.5 text-[10px] tracking-[0.08em] uppercase text-muted-foreground/50"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5">
        <Link
          href="/work/data-interpretation-studio"
          className="site-link text-[12.5px]"
        >
          Open live demo
        </Link>
      </div>
      <div className="mt-12 md:mt-14 border-t border-border/28 pt-9 md:pt-11">
        <WorkTechnicalNotes
          notes={dataStudioTechnicalNotes}
          triggerLabel="Implementation and features"
          regionLabel="Data Interpretation Studio implementation and features"
        />
      </div>
    </section>
  )
}
