import type { ReactNode } from "react"
import { ChapterLabel } from "@/components/site/chapter-label"

/**
 * Standard inner page frame: chapter marker, label, title, optional intro, then body.
 * Matches the editorial rhythm of the homepage sections without changing the hero.
 */

type PageShellProps = {
  chapter: string
  /** Small caps line, e.g. "About" */
  label: string
  title: string
  intro?: string
  children?: ReactNode
  /** Override default prose column (e.g. wide layouts for complex pages) */
  contentClassName?: string
  /** Optional classes on the page title (e.g. spacing on About) */
  titleClassName?: string
}

const defaultContentClass = "site-prose-flow"

export function PageShell({
  chapter,
  label,
  title,
  intro,
  children,
  contentClassName,
  titleClassName,
}: PageShellProps) {
  return (
    <div className="site-page">
      <div className="site-inner">
        <header className="site-masthead">
          <ChapterLabel chapter={chapter} label={label} />
          <h1 className={`site-page-title ${titleClassName ?? ""}`.trim()}>
            {title}
          </h1>
          {intro ? <p className="site-intro">{intro}</p> : null}
        </header>

        {children ? (
          <div className={contentClassName ?? defaultContentClass}>{children}</div>
        ) : null}
      </div>
    </div>
  )
}
