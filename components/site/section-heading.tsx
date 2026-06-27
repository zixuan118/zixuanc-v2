import type { ReactNode } from "react"

import { ChapterLabel } from "@/components/site/chapter-label"

/**
 * Split masthead for index pages (Work, Archive, Notes): chapter, title, optional right-column description.
 * Aligns with PageShell typography and bottom rule.
 */

type SectionHeadingProps = {
  chapter: string
  label: string
  title: string
  description?: ReactNode
  className?: string
  /** Use false for in-page subheads (rare); index pages use h1 + page title scale. */
  pageHeader?: boolean
}

export function SectionHeading({
  chapter,
  label,
  title,
  description,
  className = "",
  pageHeader = true,
}: SectionHeadingProps) {
  return (
    <div className={`site-split-masthead ${className}`.trim()}>
      <ChapterLabel chapter={chapter} label={label} />
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
        <div className="md:col-span-6">
          {pageHeader ? (
            <h1 className="site-page-title">{title}</h1>
          ) : (
            <h2 className="site-section-title">{title}</h2>
          )}
        </div>
        {description ? (
          <div className="md:col-span-5 md:col-start-8">
            <p className="site-description">{description}</p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
