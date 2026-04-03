import type { ReactNode } from "react"

/** Standard inner page frame: horizontal padding, bottom rhythm, centered column, top offset below fixed header. */
export function SitePage({
  children,
  className = "",
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div className={`site-page ${className}`.trim()}>
      <div className="site-inner">{children}</div>
    </div>
  )
}
