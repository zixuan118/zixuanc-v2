import Link from "next/link"

const footerLinks = [
  { label: "Twitter", href: "https://twitter.com" },
  { label: "Are.na", href: "https://are.na" },
  { label: "GitHub", href: "https://github.com" },
  { label: "Read.cv", href: "https://read.cv" },
]

const siteIndex = [
  { label: "Work", href: "/work", chapter: "I" },
  { label: "Notes", href: "/notes", chapter: "II" },
  { label: "Archive", href: "/archive", chapter: "III" },
  { label: "About", href: "/about", chapter: "IV" },
]

export function Footer() {
  return (
    <footer className="py-16 md:py-24 px-6 lg:px-8 border-t border-border/40">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8">
          {/* Left column - Identity */}
          <div className="md:col-span-5">
            <Link href="/" className="group inline-block mb-6">
              <span className="font-serif text-xl text-foreground">
                Zixuan Chen
              </span>
            </Link>
            <p className="text-[13px] text-muted-foreground/70 max-w-xs leading-[1.7] mb-6">
              Thank you for visiting. This site is a working archive—
              updated as projects complete and thoughts clarify.
            </p>
            <div className="flex flex-col gap-2">
              <Link 
                href="mailto:hello@zixuan.co"
                className="text-[12px] text-foreground/80 hover:text-foreground transition-colors duration-300 w-fit"
              >
                hello@zixuan.co
              </Link>
              <span className="text-[11px] text-muted-foreground/50 font-serif italic">
                San Francisco, California
              </span>
            </div>
          </div>
          
          {/* Middle column - Index with chapters */}
          <div className="md:col-span-3">
            <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground/50 block mb-5">
              Site Index
            </span>
            <div className="flex flex-col gap-3">
              {siteIndex.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  className="group flex items-baseline gap-3 text-[12px] text-foreground/70 hover:text-foreground transition-colors duration-300 w-fit"
                >
                  <span className="text-[10px] font-mono text-muted-foreground/40 w-4">
                    {link.chapter}
                  </span>
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right column - Elsewhere */}
          <div className="md:col-span-4">
            <span className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground/50 block mb-5">
              Elsewhere
            </span>
            <div className="flex flex-wrap gap-x-5 gap-y-3">
              {footerLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[12px] text-foreground/70 hover:text-foreground transition-colors duration-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        
        {/* Colophon - technical metadata */}
        <div className="mt-16 md:mt-20 pt-6 border-t border-border/30">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground/40">
              <span className="font-mono">{new Date().getFullYear()}</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <span className="font-serif italic">All rights reserved</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground/40">
              <span>Set in Cormorant Garamond & Inter</span>
              <span className="w-1 h-1 rounded-full bg-muted-foreground/20" />
              <span className="font-mono">rev. 24.3</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
