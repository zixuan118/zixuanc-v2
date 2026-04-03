"use client"

import { useRef } from "react"

type UploadPanelProps = {
  filename: string | null
  onSelectFile: (file: File) => void
  onUseSample: () => void
}

export function UploadPanel({
  filename,
  onSelectFile,
  onUseSample,
}: UploadPanelProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className="border-t border-border/30 pt-9 md:pt-11">
      <p className="site-subsection-label mb-4">Input</p>
      <div
        className="rounded-sm border border-border/35 bg-background/50 px-5 py-5 md:px-6 md:py-6"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          const file = e.dataTransfer.files?.[0]
          if (file) onSelectFile(file)
        }}
      >
        <p className="text-[14px] leading-[1.7] text-muted-foreground/75">
          Upload a CSV file. The system reads structure first, then decides whether
          any comparison is justified.
        </p>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center rounded-sm border border-border/45 px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase text-muted-foreground/78 transition-colors hover:text-foreground hover:border-border/60"
          >
            Select CSV
          </button>
          <button
            type="button"
            onClick={onUseSample}
            className="inline-flex items-center rounded-sm border border-border/30 px-3.5 py-1.5 text-[11px] tracking-[0.12em] uppercase text-muted-foreground/62 transition-colors hover:text-muted-foreground/86 hover:border-border/50"
          >
            Use sample dataset
          </button>
          <span className="text-[12px] text-muted-foreground/58">
            {filename ? `Loaded: ${filename}` : "No file selected"}
          </span>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,text/csv"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) onSelectFile(file)
          }}
        />
      </div>
    </section>
  )
}

