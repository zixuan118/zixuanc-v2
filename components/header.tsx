"use client"

import Link from "next/link"
import { useState, useEffect } from "react"

export function Header() {
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
            className="group flex items-baseline gap-2"
          >
            <span className="font-serif text-lg md:text-xl tracking-tight text-foreground">
              Zixuan
            </span>
            <span className="font-serif text-lg md:text-xl tracking-tight text-foreground/40 group-hover:text-foreground/70 transition-colors duration-300">
              Chen
            </span>
          </Link>
          
          {/* Desktop navigation - subtle chapter markers */}
          <nav className="hidden md:flex items-center gap-8">
            <Link
              href="/work"
              className="group flex items-baseline gap-1.5 text-[11px] tracking-[0.1em] uppercase text-muted-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              <span className="text-[9px] font-mono text-muted-foreground/30">I</span>
              <span>Work</span>
            </Link>
            <Link
              href="/notes"
              className="group flex items-baseline gap-1.5 text-[11px] tracking-[0.1em] uppercase text-muted-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              <span className="text-[9px] font-mono text-muted-foreground/30">II</span>
              <span>Notes</span>
            </Link>
            <Link
              href="/archive"
              className="group flex items-baseline gap-1.5 text-[11px] tracking-[0.1em] uppercase text-muted-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              <span className="text-[9px] font-mono text-muted-foreground/30">III</span>
              <span>Archive</span>
            </Link>
            <Link
              href="/about"
              className="group flex items-baseline gap-1.5 text-[11px] tracking-[0.1em] uppercase text-muted-foreground/70 hover:text-foreground transition-colors duration-300"
            >
              <span className="text-[9px] font-mono text-muted-foreground/30">IV</span>
              <span>About</span>
            </Link>
          </nav>

          {/* Mobile Menu Button */}
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

      {/* Mobile Navigation */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 bg-background/95 backdrop-blur-md ${isMenuOpen ? 'max-h-80' : 'max-h-0'}`}>
        <nav className="px-6 py-6 flex flex-col gap-5">
          {[
            { label: "Work", href: "/work" },
            { label: "About", href: "/about" },
            { label: "Notes", href: "/notes" },
            { label: "Archive", href: "/archive" },
            { label: "Contact", href: "/contact" },
          ].map((item) => (
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
