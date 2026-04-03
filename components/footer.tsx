"use client"

import Link from "next/link"
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react"
import { footerIndexNav, siteConfig } from "@/config/site"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export function Footer() {
  const year = new Date().getFullYear()
  const reducedMotion = usePrefersReducedMotion()
  const footerRef = useRef<HTMLElement>(null)
  const [entered, setEntered] = useState(false)

  useLayoutEffect(() => {
    if (reducedMotion) {
      setEntered(true)
      return
    }
    const el = footerRef.current
    if (!el) return
    if (el.getBoundingClientRect().top < window.innerHeight + 100) {
      setEntered(true)
    }
  }, [reducedMotion])

  useEffect(() => {
    if (reducedMotion || entered) return
    const el = footerRef.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setEntered(true)
            io.disconnect()
            break
          }
        }
      },
      { rootMargin: "0px 0px 10% 0px", threshold: 0.02 }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [reducedMotion, entered])

  return (
    <footer
      ref={footerRef}
      id="site-footer"
      className={`relative mt-24 md:mt-[8.5rem] lg:mt-40 border-t border-border/22 pt-14 md:pt-20 pb-14 md:pb-20 px-6 lg:px-8 transition-[opacity,transform] ease-[cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${
        entered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1"
      }`}
      style={{
        transitionDuration: reducedMotion ? "0ms" : "680ms",
      }}
    >
      <div className="mx-auto max-w-6xl opacity-[0.76]">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 md:gap-x-12 lg:gap-x-14 md:gap-y-8">
          <div className="md:col-span-7 md:pr-4">
            <Link
              href="/"
              className="inline-block rounded-sm outline-none transition-opacity duration-200 ease-[var(--site-ease-soft)] hover:opacity-85 focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              <span className="font-serif text-[1.0625rem] md:text-[1.125rem] text-foreground/70 tracking-[-0.01em]">
                {siteConfig.title}
              </span>
            </Link>

            <p className="mt-5 text-[13px] md:text-[14px] text-muted-foreground/52 leading-[1.52]">
              Boston
            </p>

            <div className="mt-5 flex flex-col gap-1">
              <a
                href={`mailto:${siteConfig.email}`}
                className="text-[12px] text-muted-foreground/58 hover:text-muted-foreground/78 w-fit rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background underline-offset-[3px] decoration-border/35 hover:decoration-border/55 underline transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)]"
              >
                {siteConfig.email}
              </a>
              <a
                href={siteConfig.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[12px] text-muted-foreground/58 hover:text-muted-foreground/78 w-fit rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background underline-offset-[3px] decoration-border/35 hover:decoration-border/55 underline transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)]"
              >
                LinkedIn ↗
              </a>
            </div>

            <p className="mt-10 text-[11px] text-muted-foreground/42 leading-[1.65] max-w-md">
              All text and images by Zixuan Chen, {year}
            </p>
          </div>

          <div className="md:col-span-5 md:text-right md:pt-3 lg:pt-4">
            <span className="text-[8.5px] tracking-[0.32em] uppercase text-muted-foreground/34 block mb-3.5 md:ml-auto md:w-fit">
              Index
            </span>
            <nav
              className="flex flex-col gap-[0.45rem] md:items-end"
              aria-label="Site index"
            >
              {footerIndexNav.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="group/idx flex items-baseline gap-[0.65rem] text-[11.5px] leading-[1.42] text-muted-foreground/50 hover:text-muted-foreground/72 w-fit md:ml-auto rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30 focus-visible:ring-offset-2 focus-visible:ring-offset-background transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)]"
                >
                  <span className="text-[9.5px] font-mono text-muted-foreground/32 tabular-nums w-[1.35rem] shrink-0 md:w-[1.5rem] md:text-right transition-colors duration-[var(--site-duration-fast)] group-hover/idx:text-muted-foreground/44">
                    {link.chapter}
                  </span>
                  <span>{link.label}</span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
