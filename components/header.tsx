"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState, useEffect } from "react"
import { headerNav, mobileNav } from "@/config/site"

export function Header() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${scrolled ? 'bg-background/90 backdrop-blur-md' : 'bg-transparent'}`}>
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 lg:h-16">
          <Link 
            href="/" 
            className="group flex items-baseline gap-2 rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <span className="font-serif text-lg md:text-xl tracking-tight text-foreground">
              Zixuan
            </span>
            <span className="font-serif text-lg md:text-xl tracking-tight text-foreground/40 group-hover:text-foreground/70 transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)]">
              Chen
            </span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8" aria-label="Primary">
            {headerNav.map((item) => {
              const active = pathname === item.href
              return (
              <Link
                key={item.href}
                href={item.href}
                className={`group/nav flex items-baseline gap-1.5 text-[11px] tracking-[0.1em] uppercase rounded-sm outline-none transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] focus-visible:ring-2 focus-visible:ring-ring/35 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  active
                    ? "text-foreground/90"
                    : "text-muted-foreground/70 hover:text-foreground"
                }`}
              >
                <span className={`text-[9px] font-mono transition-colors duration-[var(--site-duration-fast)] ease-[var(--site-ease-soft)] ${
                  active ? "text-muted-foreground/45" : "text-muted-foreground/30 group-hover/nav:text-muted-foreground/42"
                }`}>
                  {item.chapter}
                </span>
                <span>{item.label}</span>
              </Link>
            )
            })}
          </nav>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={`block h-px bg-current transition-all duration-300 origin-center ${isMenuOpen ? 'rotate-45 translate-y-1.5' : ''}`} />
              <span className={`block h-px bg-current transition-all duration-300 ${isMenuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-px bg-current transition-all duration-300 origin-center ${isMenuOpen ? '-rotate-45 -translate-y-1.5' : ''}`} />
            </div>
          </button>
        </div>
      </div>

      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-background/95 backdrop-blur-md ${isMenuOpen ? 'max-h-80' : 'max-h-0'}`}>
        <nav className="px-6 py-6 flex flex-col gap-5">
          {mobileNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className="text-lg font-serif text-foreground/80 hover:text-foreground transition-colors duration-300"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
