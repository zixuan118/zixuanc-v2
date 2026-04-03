"use client"

import { useId, useState } from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"
import type { BosTechnicalNote } from "@/content/bos-technical-notes"

const triggerButtonClass =
  "group/notes flex items-center gap-1.5 text-left text-[11px] tracking-[0.14em] uppercase text-muted-foreground/62 outline-none transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] hover:text-foreground/86 focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-sm underline-offset-[5px] decoration-border/15 hover:decoration-border/40 hover:underline active:text-foreground/90"

type BosTechnicalNotesProps = {
  notes: BosTechnicalNote[]
}

export function BosTechnicalNotes({ notes }: BosTechnicalNotesProps) {
  const [open, setOpen] = useState(false)
  const reduced = usePrefersReducedMotion()
  const panelId = useId()
  const toggle = () => setOpen((o) => !o)

  const appendixBlock = (
    <div className="space-y-7 md:space-y-8">
      {notes.map((note) => (
        <div key={note.label}>
          <p className="mb-2 font-mono text-[9px] tracking-[0.2em] uppercase text-muted-foreground/36">
            {note.label}
          </p>
          <p className="max-w-xl text-[12.5px] leading-[1.72] text-muted-foreground/58">
            {note.text}
          </p>
        </div>
      ))}
    </div>
  )

  if (reduced) {
    return (
      <div className="max-w-3xl">
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={toggle}
          className={triggerButtonClass}
        >
          <span>Technical notes</span>
          <span
            className={`inline-block text-[10px] font-mono text-muted-foreground/48 transition-transform duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] motion-reduce:transition-none ${
              open ? "-rotate-12 translate-y-px" : ""
            }`}
            aria-hidden
          >
            ↗
          </span>
        </button>
        {open ? (
          <div
            id={panelId}
            className="mt-7 pt-7 border-t border-border/28 max-w-3xl"
            role="region"
            aria-label="Technical notes"
          >
            {appendixBlock}
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={toggle}
        className={triggerButtonClass}
      >
        <span>Technical notes</span>
        <span
          className={`inline-block text-[10px] font-mono text-muted-foreground/48 transition-transform duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] motion-reduce:transition-none ${
            open ? "-rotate-12 translate-y-px" : "group-hover/notes:translate-x-px group-hover/notes:-translate-y-px"
          }`}
          aria-hidden
        >
          ↗
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-[var(--site-duration)] ease-[var(--site-ease-out)] motion-reduce:transition-none ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <div
            id={panelId}
            role="region"
            aria-label="Technical notes"
            className={`mt-7 pt-7 border-t border-border/28 max-w-3xl transition-opacity duration-[var(--site-duration)] ease-out motion-reduce:transition-none ${
              open ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
            aria-hidden={!open}
          >
            {appendixBlock}
          </div>
        </div>
      </div>
    </div>
  )
}
