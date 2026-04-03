"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"

import type { NotesFragment, NotesWeight } from "@/content/notes-fragments"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

gsap.registerPlugin(ScrollTrigger)

/**
 * Curated vertical rhythm — pauses A/B/C + anchor spacing (not uniform).
 * Pause A: before Jun 23 image · Pause B: around Mar 8 · Pause C: before final anchor.
 */
const NOTE_LEAD: Partial<Record<string, string>> = {
  "2021-06-23": "pt-24 md:pt-36 lg:pt-44",
  "2021-11-06": "pt-8 md:pt-12",
  "2023-03-08": "pt-16 md:pt-24",
  "2026-03-13": "pt-36 md:pt-52 lg:pt-64",
}

const NOTE_TAIL: Record<string, string> = {
  "2017-10-18": "pb-[3rem] md:pb-[4rem]",
  "2019-01-28": "pb-[3rem] md:pb-[4rem]",
  "2019-08-23": "pb-32 md:pb-40 lg:pb-44",
  "2021-06-23": "pb-32 md:pb-38",
  "2021-11-06": "pb-36 md:pb-44 lg:pb-48",
  "2021-12-14": "pb-28 md:pb-34",
  "2022-01-10": "pb-28 md:pb-34",
  "2022-12-26": "pb-30 md:pb-36",
  "2023-03-08": "pb-24 md:pb-32",
  "2023-06-13": "pb-[3.25rem] md:pb-28",
  "2023-12-25": "pb-28 md:pb-40 lg:pb-48",
  "2026-03-13": "pb-48 md:pb-72 lg:pb-[5.5rem]",
}

function enBodyClass(weight: NotesWeight, id: string) {
  if (id === "2026-03-13" && weight === "anchor") {
    return "font-serif text-[clamp(19px,1.18vw,21px)] leading-[1.93] text-foreground/[0.9] tracking-[-0.01em] font-normal"
  }
  if (weight === "whisper") {
    return "font-serif text-[clamp(17px,1.09vw,20px)] leading-[1.76] text-foreground/[0.78] tracking-[-0.012em] font-normal"
  }
  if (weight === "anchor") {
    return "font-serif text-[clamp(19px,1.18vw,21px)] leading-[1.82] text-foreground/[0.89] tracking-[-0.01em] font-normal"
  }
  return "font-serif text-[clamp(18px,1.15vw,20.5px)] leading-[1.78] text-foreground/[0.86] tracking-[-0.01em] font-normal"
}

type CnTone =
  | "default"
  | "expand-collapsed"
  | "finale-collapsed"
  | "expanded-follow"

function cnClass(_weight: NotesWeight, tone: CnTone = "default") {
  const opacity =
    tone === "expand-collapsed"
      ? "text-muted-foreground/[0.54]"
      : tone === "finale-collapsed"
        ? "text-muted-foreground/[0.52]"
        : tone === "expanded-follow"
          ? "text-muted-foreground/[0.46]"
          : "text-muted-foreground/[0.5]"
  return `text-[12.5px] leading-[1.86] ${opacity} whitespace-pre-line pl-[0.75rem] ml-px border-l border-border/[0.08] max-w-[min(40ch,100%)]`
}

function expandedEnClass(parentWeight: NotesWeight) {
  if (parentWeight === "anchor") {
    return "font-serif text-[clamp(18px,1.11vw,21px)] leading-[1.82] text-foreground/[0.85] tracking-[-0.01em]"
  }
  return "font-serif text-[clamp(17.5px,1.08vw,20.5px)] leading-[1.78] text-foreground/[0.81] tracking-[-0.01em]"
}

function imageBlockClass(
  emphasis: "quiet" | "present",
  afterExpand: boolean,
  stackedSecondary: boolean,
) {
  const bottom = "mb-10 md:mb-14"
  if (stackedSecondary) {
    const w =
      emphasis === "present"
        ? "max-w-[min(540px,94%)]"
        : "max-w-[min(400px,86%)]"
    return `mt-14 md:mt-20 ${w} ${bottom}`
  }
  if (afterExpand) {
    return `mt-24 md:mt-32 lg:mt-36 max-w-[min(400px,86%)] ${bottom}`
  }
  if (emphasis === "present") {
    return `mt-16 md:mt-24 max-w-[min(540px,94%)] ${bottom}`
  }
  return `mt-20 md:mt-28 lg:mt-32 max-w-[min(360px,82%)] ${bottom}`
}

function NoteImage({
  alt,
  emphasis,
  afterExpand,
  stackedSecondary = false,
  src,
  heicSrc,
}: {
  alt: string
  emphasis: "quiet" | "present"
  afterExpand: boolean
  stackedSecondary?: boolean
  src: string
  heicSrc?: string
}) {
  const block = imageBlockClass(emphasis, afterExpand, stackedSecondary)
  const imgTone =
    emphasis === "present"
      ? "opacity-[0.94] contrast-[0.96] saturate-[0.86]"
      : "opacity-[0.9] contrast-[0.95] saturate-[0.84]"

  const imgClass = `block h-auto w-full max-h-none rounded-[1px] object-contain align-middle ${imgTone}`

  return (
    <div className={`${block} select-none`}>
      {heicSrc ? (
        <picture className="block w-full">
          <source srcSet={heicSrc} type="image/heic" />
          {/* eslint-disable-next-line @next/next/no-img-element -- raster fallback + HEIC source */}
          <img
            src={src}
            alt={alt}
            className={imgClass}
            loading="lazy"
            decoding="async"
          />
        </picture>
      ) : (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element -- memory fragment, local assets */}
          <img
            src={src}
            alt={alt}
            className={imgClass}
            loading="lazy"
            decoding="async"
          />
        </>
      )}
    </div>
  )
}

function ExpandCue({
  expanded,
  onToggle,
}: {
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onToggle()
      }}
      aria-expanded={expanded}
      aria-label={expanded ? "Show less" : "Continue reading"}
      className={`notes-expand-ellipsis border-0 bg-transparent p-0 text-left font-serif text-[14px] font-normal leading-none tracking-[0.1em] text-foreground/[0.7] transition-[opacity] duration-[280ms] ease-[cubic-bezier(0.25,0.1,0.25,1)] [-webkit-tap-highlight-color:transparent] hover:opacity-[0.78] focus:outline-none focus-visible:opacity-[0.82] group-hover:opacity-[0.78] ${expanded ? "mt-10 md:mt-14 cursor-default" : "mt-5 md:mt-6 translate-y-[-1px] cursor-default"}`}
    >
      <span aria-hidden>…</span>
    </button>
  )
}

function NoteBody({
  note,
  expanded,
  onToggleExpand,
}: {
  note: NotesFragment
  expanded: boolean
  onToggleExpand: () => void
}) {
  const hasExpand = Boolean(note.expandable)
  const showImageAfterExpand = note.image?.afterExpand === true
  const imageBeforeExpand =
    note.image && !showImageAfterExpand ? note.image : null
  const imageAfterExpand =
    note.image && showImageAfterExpand ? note.image : null

  const enBlock = (
    <div className={enBodyClass(note.weight, note.id)}>
      {note.enLines.map((line, i) => (
        <p key={i} className={i > 0 ? "mt-1" : ""}>
          {line}
        </p>
      ))}
    </div>
  )

  if (hasExpand) {
    const isFinale = note.id === "2026-03-13"

    const onCollapsedActivate = () => {
      if (!expanded) onToggleExpand()
    }

    const cnTone: CnTone =
      !expanded && !isFinale
        ? "expand-collapsed"
        : !expanded && isFinale
          ? "finale-collapsed"
          : "default"

    return (
      <>
        <div
          className={!expanded ? "max-w-full cursor-default" : undefined}
          onClick={!expanded ? onCollapsedActivate : undefined}
        >
          {enBlock}
          <div
            className={`relative mt-6 ${!expanded && !isFinale ? "notes-expand-cn-mask" : ""}`}
          >
            <p className={`notes-cn-layer ${cnClass(note.weight, cnTone)}`} lang="zh-Hans">
              {note.cn}
            </p>
          </div>
        </div>
        {expanded && note.expandable ? (
          <div className="notes-expand-panel pt-5 md:pt-7">
            <div className={expandedEnClass(note.weight)}>
              {note.expandable.enLines.map((line, i) => (
                <p key={i} className={i > 0 ? "mt-1" : ""}>
                  {line}
                </p>
              ))}
            </div>
            <p
              className={`notes-cn-layer mt-4 ${cnClass(note.weight, "expanded-follow")}`}
              lang="zh-Hans"
            >
              {note.expandable.cn}
            </p>

            {imageAfterExpand ? (
              <>
                <NoteImage
                  src={imageAfterExpand.src}
                  heicSrc={imageAfterExpand.heicSrc}
                  alt={imageAfterExpand.alt}
                  emphasis={imageAfterExpand.emphasis}
                  afterExpand
                />
                {imageAfterExpand.secondary ? (
                  <NoteImage
                    src={imageAfterExpand.secondary.src}
                    heicSrc={imageAfterExpand.secondary.heicSrc}
                    alt={imageAfterExpand.secondary.alt}
                    emphasis="quiet"
                    afterExpand={false}
                    stackedSecondary
                  />
                ) : null}
              </>
            ) : null}
          </div>
        ) : null}
        <ExpandCue expanded={expanded} onToggle={onToggleExpand} />
      </>
    )
  }

  return (
    <>
      {enBlock}
      <p className={`notes-cn-layer mt-6 ${cnClass(note.weight)}`} lang="zh-Hans">
        {note.cn}
      </p>
      {imageBeforeExpand ? (
        <NoteImage
          src={imageBeforeExpand.src}
          heicSrc={imageBeforeExpand.heicSrc}
          alt={imageBeforeExpand.alt}
          emphasis={imageBeforeExpand.emphasis}
          afterExpand={false}
        />
      ) : null}
    </>
  )
}

export function NotesCuratedList({ notes }: { notes: NotesFragment[] }) {
  const reduced = usePrefersReducedMotion()
  const articleRefs = useRef<Array<HTMLElement | null>>([])
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})

  useEffect(() => {
    ScrollTrigger.refresh()
  }, [expanded])

  useLayoutEffect(() => {
    const els = articleRefs.current.filter(Boolean) as HTMLElement[]
    if (els.length === 0) return

    if (reduced || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      for (const el of els) {
        gsap.set(el, { opacity: 1, y: 0 })
      }
      return
    }

    const ctx = gsap.context(() => {
      for (const el of els) {
        gsap.set(el, { opacity: 0, y: 16 })
        gsap.to(el, {
          opacity: 1,
          y: 0,
          duration: 0.58,
          ease: "power2.out",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true,
            invalidateOnRefresh: true,
          },
        })
      }
    })

    return () => ctx.revert()
  }, [reduced, notes.length])

  return (
    <div className="w-full">
      {notes.map((note, index) => {
        const lead = NOTE_LEAD[note.id] ?? ""
        const tail = NOTE_TAIL[note.id] ?? "pb-28 md:pb-32"
        return (
          <article
            key={note.id}
            ref={(el) => {
              articleRefs.current[index] = el
            }}
            className={`group scroll-mt-10 ${lead} ${tail}`.trim()}
          >
            <time
              dateTime={note.id}
              className="mb-6 md:mb-8 block font-mono text-[9.5px] md:text-[10px] tracking-[0.055em] text-muted-foreground/[0.34]"
            >
              {note.dateLabel}
            </time>

            <NoteBody
              note={note}
              expanded={Boolean(expanded[note.id])}
              onToggleExpand={() =>
                setExpanded((s) => ({ ...s, [note.id]: !s[note.id] }))
              }
            />
          </article>
        )
      })}
    </div>
  )
}
