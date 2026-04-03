import type { Metadata } from "next"
import { NotesCuratedList } from "@/components/notes/notes-curated-list"
import { NotesWhiskeyGlass } from "@/components/objects/notes-whiskey-glass"
import { MarginObjectShell } from "@/components/site/margin-object-shell"
import { SectionHeading } from "@/components/site/section-heading"
import { SitePage } from "@/components/site/site-page"
import { NOTES_FRAGMENTS } from "@/content/notes-fragments"

export const metadata: Metadata = {
  title: "Notes",
  description:
    "Selected fragments across time—quiet, personal, not a feed.",
}

const START = "notes-margin-object-start"
const END = "notes-margin-object-end"

export default function NotesPage() {
  return (
    <SitePage>
      <SectionHeading
        className="notes-page-masthead"
        chapter="II"
        label="Notes"
        title="Notes"
        description="Selected fragments, across time."
      />

      <div
        id={START}
        className="h-px w-px -mt-px opacity-0 pointer-events-none"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-12">
        <div className="lg:col-span-7 min-w-0">
          <div className="pt-12 md:pt-16 border-t border-border/32 max-w-[640px]">
            <NotesCuratedList notes={NOTES_FRAGMENTS} />
          </div>
        </div>

        <div className="relative z-[2] hidden min-w-0 overflow-visible lg:flex lg:col-span-3 flex-col items-end self-start pb-10 pl-1 pr-1 lg:sticky lg:top-[min(10vh,96px)]">
          <MarginObjectShell
            startId={START}
            endId={END}
            className="mt-2 lg:mt-6 max-w-[min(1280px,92vw)] lg:max-w-[min(1460px,96vw)] -translate-x-4 md:-translate-x-6 lg:-translate-x-[38px]"
          >
            <NotesWhiskeyGlass />
          </MarginObjectShell>
        </div>

        <div className="hidden lg:block lg:col-span-2" aria-hidden />
      </div>

      <div
        id={END}
        className="h-px w-px -mt-px opacity-0 pointer-events-none"
        aria-hidden
      />
    </SitePage>
  )
}
