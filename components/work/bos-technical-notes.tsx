import { bosTechnicalNotes } from "@/content/bos-technical-notes"
import { WorkTechnicalNotes } from "@/components/work/work-technical-notes"

type BosTechnicalNotesProps = {
  notes?: typeof bosTechnicalNotes
}

export function BosTechnicalNotes({ notes = bosTechnicalNotes }: BosTechnicalNotesProps) {
  return <WorkTechnicalNotes notes={notes} />
}
