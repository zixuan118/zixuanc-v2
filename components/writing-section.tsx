"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"

const notes = [
  {
    title: "On tools that wait",
    date: "Mar 2024",
    href: "/notes/tools-that-wait",
    excerpt: "Why the best tools feel patient—thoughts on designing software that doesn't need your attention to feel useful.",
    wordCount: "1,400"
  },
  {
    title: "Photographing the same window",
    date: "Jan 2024",
    href: "/notes/same-window",
    excerpt: "A year of the same frame. What changes when you stop looking for new subjects.",
    wordCount: "900"
  },
  {
    title: "Notes on Ways of Seeing",
    date: "Nov 2023",
    href: "/notes/ways-of-seeing",
    excerpt: "Marginalia from a slow re-read of Berger. On images, reproduction, and what we bring to looking.",
    wordCount: "2,100"
  }
]

export function WritingSection() {
  return (
    <section id="notes" className="py-20 md:py-28 px-6 lg:px-8 scroll-mt-16">
      <div className="mx-auto max-w-6xl">
        {/* Section header - chapter opening */}
        <div className="mb-14 md:mb-20">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-[10px] font-mono text-muted-foreground/40">II</span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/50">
              Notes
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5">
              <h2 className="font-serif text-2xl md:text-3xl font-light text-foreground leading-snug">
                Writing as a way of thinking
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-7">
              <p className="text-[13px] text-muted-foreground/60 leading-[1.7]">
                Essays, observations, and reading notes. I write to figure out 
                what I think about something—usually tools, images, or how things 
                work. Updated when I have something worth saying.
              </p>
            </div>
          </div>
        </div>
        
        {/* Notes list - editorial style */}
        <div className="border-t border-border/40">
          {notes.map((note, index) => (
            <Link
              key={note.href}
              href={note.href}
              className="group block py-8 md:py-10 border-b border-border/30"
            >
              <div className="grid grid-cols-12 gap-4 md:gap-6 items-baseline">
                {/* Index */}
                <div className="col-span-2 md:col-span-1">
                  <span className="text-[10px] font-mono text-muted-foreground/30">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                
                {/* Title and excerpt */}
                <div className="col-span-10 md:col-span-7">
                  <h3 className="font-serif text-lg md:text-xl font-light text-foreground group-hover:text-foreground/70 transition-colors duration-300 leading-snug mb-2">
                    {note.title}
                  </h3>
                  <p className="text-[13px] text-muted-foreground/55 leading-[1.7]">
                    {note.excerpt}
                  </p>
                </div>
                
                {/* Metadata */}
                <div className="hidden md:flex col-span-4 items-baseline justify-end gap-4">
                  <span className="text-[10px] text-muted-foreground/40 font-mono">
                    {note.date}
                  </span>
                  <span className="text-[10px] text-muted-foreground/30 font-serif italic">
                    {note.wordCount} words
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        {/* Footer link */}
        <div className="mt-10 flex items-center justify-between">
          <span className="text-[10px] text-muted-foreground/40 font-serif italic">
            12 entries total
          </span>
          <Link 
            href="/notes"
            className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-2 group"
          >
            <span>All notes</span>
            <ArrowUpRight className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
