import { bosTechnicalNotes } from "@/content/bos-technical-notes"
import { BosTechnicalNotes } from "@/components/work/bos-technical-notes"
import { featuredProjectId, getFeaturedProject } from "@/content/work"

export function WorkFeatured() {
  const project = getFeaturedProject()
  const framing = project.detailFraming ?? project.framing
  const body = project.detailBody ?? project.body
  const isFlagship = project.id === featuredProjectId

  return (
    <section aria-labelledby="work-featured-heading" className="pt-14 md:pt-18">
      <div className="grid grid-cols-1 gap-10 lg:gap-12">
        <div className="group/work-featured">
          <p className={`site-kicker ${isFlagship ? "mb-7" : "mb-6"}`}>In this selection</p>
          {project.kind ? (
            <div
              className={`site-meta-row ${isFlagship ? "mb-7" : "mb-6"} transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/work-featured:text-muted-foreground/58`}
            >
              {project.timeframe ? (
                <>
                  <span className="font-mono">{project.timeframe}</span>
                  <span className="w-px h-3 bg-border/50 hidden sm:block" aria-hidden />
                </>
              ) : null}
              <span className="tracking-wider uppercase">{project.kind}</span>
            </div>
          ) : null}
          <h2
            id="work-featured-heading"
            className={`font-serif font-light text-foreground leading-snug tracking-tight transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/work-featured:text-foreground ${
              isFlagship
                ? "text-[1.72rem] md:text-[2rem] mb-3"
                : "text-[1.65rem] md:text-3xl mb-2"
            }`}
          >
            {project.title}
          </h2>
          <p
            className={`font-serif italic leading-relaxed max-w-3xl transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/work-featured:text-muted-foreground/55 ${
              isFlagship
                ? "text-[11px] text-muted-foreground/52 mb-9 md:mb-10"
                : "text-[10px] text-muted-foreground/45 mb-8"
            }`}
          >
            {project.subtitle}
          </p>
          {project.caption ? (
            <p className="text-[11px] text-muted-foreground/50 leading-relaxed max-w-3xl mb-10 border-l border-border/40 pl-5 py-1">
              {project.caption}
            </p>
          ) : null}
          {framing ? (
            <p className="whitespace-pre-line text-[15px] text-muted-foreground/70 leading-[1.8] mb-6 max-w-3xl transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/work-featured:text-muted-foreground/78">
              {framing}
            </p>
          ) : null}
          <div
            className={`max-w-3xl transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] group-hover/work-featured:text-muted-foreground/72 ${
              isFlagship
                ? "space-y-5 text-[14px] leading-[1.78] text-muted-foreground/66"
                : "space-y-5 text-[14px] leading-[1.78] text-muted-foreground/65"
            }`}
          >
            {body.map((paragraph, i) => (
              <p key={i} className="whitespace-pre-line">
                {paragraph}
              </p>
            ))}
          </div>
          {isFlagship ? (
            <div className="mt-16 md:mt-20 max-w-3xl border-t border-border/28 pt-11 md:pt-14">
              <BosTechnicalNotes notes={bosTechnicalNotes} />
            </div>
          ) : null}
        </div>
      </div>
    </section>
  )
}
