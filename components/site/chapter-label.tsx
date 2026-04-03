type ChapterLabelProps = {
  chapter: string
  label: string
  className?: string
}

/** Roman chapter marker + small caps — shared by homepage sections and inner pages. */
export function ChapterLabel({ chapter, label, className = "" }: ChapterLabelProps) {
  return (
    <div className={`site-chapter-row ${className}`}>
      <span className="site-chapter">{chapter}</span>
      <span className="site-label">{label}</span>
    </div>
  )
}
