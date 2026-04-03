import { getOtherProjects } from "@/content/work"

export function WorkIndexList() {
  const others = getOtherProjects()
  if (others.length === 0) return null

  return (
    <section className="mt-24 md:mt-32" aria-labelledby="work-index-heading">
      <div className="border-t border-border/40 pt-11 md:pt-14">
        <div className="flex flex-col md:flex-row md:items-baseline md:justify-between gap-4 mb-9 md:mb-11">
          <h2
            id="work-index-heading"
            className="font-serif text-xl md:text-2xl font-light text-foreground tracking-tight"
          >
            More work
          </h2>
          <p className="site-description max-w-md md:text-right">
            Further entries from the same body of work. Shorter treatment here,
            but not secondary in importance.
          </p>
        </div>

        <ul className="border-t border-border/40">
          {others.map((entry, index) => (
            <li
              key={entry.id}
              className="group/work-row border-t border-border/35 py-8 md:py-9 first:border-t-0 transition-[border-color] duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] hover:border-border/48 focus-within:border-border/48 motion-reduce:transition-none"
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 md:gap-6 items-start">
                <span className="md:col-span-1 text-[10px] font-mono text-muted-foreground/40 tabular-nums pt-1 transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/work-row:text-muted-foreground/48">
                  {String(index + 2).padStart(2, "0")}
                </span>
                <div className="md:col-span-5">
                  <span className="font-serif text-[1.05rem] md:text-xl font-light text-foreground block transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/work-row:text-foreground">
                    {entry.title}
                  </span>
                  <p className="mt-2 text-[10px] text-muted-foreground/50 font-serif italic leading-relaxed max-w-lg transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/work-row:text-muted-foreground/56">
                    {entry.subtitle}
                  </p>
                  <div className="mt-4 space-y-3 text-[13px] text-muted-foreground/62 leading-[1.75] max-w-xl transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/work-row:text-muted-foreground/70">
                    <p>{entry.lede}</p>
                    {entry.body.map((para, i) => (
                      <p key={i}>{para}</p>
                    ))}
                  </div>
                </div>
                <div className="md:col-span-4 md:col-start-9 md:text-right flex flex-col md:items-end gap-1.5 pt-1">
                  {entry.timeframe ? (
                    <span className="text-[10px] font-mono text-muted-foreground/45">
                      {entry.timeframe}
                    </span>
                  ) : null}
                  {entry.kind ? (
                    <span className="text-[10px] tracking-[0.04em] text-muted-foreground/38 transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/work-row:text-muted-foreground/46">
                      {entry.kind}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
