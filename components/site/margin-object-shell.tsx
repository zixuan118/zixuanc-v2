"use client"

import type { ReactNode } from "react"
import { createContext, useContext } from "react"
import { usePageObjectProgress } from "@/hooks/use-page-object-progress"

export type MarginObjectContextValue = {
  progress: number
  reduced: boolean
}

const MarginObjectContext = createContext<MarginObjectContextValue | null>(
  null
)

export function useMarginObject(): MarginObjectContextValue {
  const v = useContext(MarginObjectContext)
  if (!v) {
    throw new Error("useMarginObject must be used inside MarginObjectShell")
  }
  return v
}

type MarginObjectShellProps = {
  startId: string
  endId: string
  children: ReactNode
  /** Extra classes on the inner wrapper (e.g. sticky alignment) */
  className?: string
  /**
   * If set, overrides scroll progress in the provided context.
   * Used for interactive margin objects that should not follow scroll.
   */
  progressOverride?: number | null
  /**
   * Enable pointer events and allow click/interaction.
   * Default behavior stays pointer-events-none for existing pages.
   */
  interactive?: boolean
  /** Optional click handler (only meaningful when interactive is true). */
  onClick?: () => void
}

/**
 * Provides scroll progress to margin SVG objects. No card chrome — object only.
 * Desktop: parent should use `hidden lg:flex` if mobile is omitted.
 */
export function MarginObjectShell({
  startId,
  endId,
  children,
  className = "",
  progressOverride = null,
  interactive = false,
  onClick,
}: MarginObjectShellProps) {
  const { progress, reduced } = usePageObjectProgress(startId, endId)
  return (
    <MarginObjectContext.Provider
      value={{ progress: progressOverride ?? progress, reduced }}
    >
      <div
        className={`${interactive ? "pointer-events-auto" : "pointer-events-none"} relative z-[2] w-full max-w-[min(360px,38vw)] shrink-0 select-none lg:max-w-[min(400px,40vw)] ${className}`.trim()}
        aria-hidden={!interactive}
        onClick={interactive ? onClick : undefined}
      >
        {children}
      </div>
    </MarginObjectContext.Provider>
  )
}
