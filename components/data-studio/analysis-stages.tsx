"use client"

import { STUDIO_FLOW } from "@/lib/data-studio/copy"

type AnalysisStagesProps = {
  currentStage: number
  visible: boolean
}

const stageLabels = [
  "File intake",
  "Clean & audit",
  "Analysis plan",
  "Visual board",
  "Second reading",
]

export function AnalysisStages({ currentStage, visible }: AnalysisStagesProps) {
  if (!visible) return null
  return (
    <section className="mt-10 border-t border-border/25 pt-7">
      <p className="site-subsection-label mb-2">Workflow</p>
      <p className="text-[11px] tracking-[0.06em] text-muted-foreground/55 mb-4">
        {STUDIO_FLOW}
      </p>
      <div className="space-y-2.5">
        {stageLabels.map((label, idx) => {
          const active = idx <= currentStage
          return (
            <div
              key={label}
              className={`flex items-center gap-3 transition-opacity duration-500 ${
                active ? "opacity-100" : "opacity-35"
              }`}
            >
              <span
                className={`inline-block h-[1px] w-8 ${
                  active ? "bg-border/70" : "bg-border/30"
                }`}
              />
              <span className="text-[12px] tracking-[0.08em] uppercase text-muted-foreground/65">
                {label}
              </span>
            </div>
          )
        })}
      </div>
    </section>
  )
}
