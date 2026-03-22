"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])

  return (
    <section className="min-h-screen flex flex-col px-6 lg:px-8 pt-20 pb-10">
      <div className="mx-auto max-w-6xl w-full flex-1 flex flex-col">
        {/* Revision marker - subtle authorship detail */}
        <div className={`flex justify-between items-start mb-8 transition-all duration-700 ease-out ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-3">
            <span className="text-[9px] font-mono text-muted-foreground/40 tracking-wider">
              rev. 24.3
            </span>
            <span className="w-px h-3 bg-border/50" />
            <span className="text-[9px] text-muted-foreground/40 tracking-wide font-serif italic">
              San Francisco
            </span>
          </div>
          <div className="text-right">
            <span className="text-[9px] tracking-[0.2em] uppercase text-muted-foreground/40">
              Open to projects
            </span>
          </div>
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-12 gap-4">
            {/* Side annotation */}
            <div className="hidden lg:flex col-span-2 flex-col justify-center">
              <div className={`transition-all duration-1000 delay-300 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
                <div className="border-l border-border/40 pl-4 py-2">
                  <span className="text-[10px] text-muted-foreground/50 block leading-relaxed">
                    This site collects<br />
                    work, writing, and<br />
                    images over time.
                  </span>
                </div>
              </div>
            </div>

            {/* Main headline area */}
            <div className="col-span-12 lg:col-span-10">
              <div className={`transition-all duration-1000 ease-out ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
                {/* Name as quiet header */}
                <div className="mb-8">
                  <span className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground/60">
                    Zixuan Chen
                  </span>
                </div>
                
                {/* Main statement - precise, quiet tension */}
                <h1 className="font-serif text-[2.25rem] sm:text-5xl md:text-6xl lg:text-[4.5rem] font-light leading-[1.1] tracking-[-0.015em] text-foreground max-w-4xl">
                  <span className="block">I design software</span>
                  <span className="block mt-2">
                    that knows when{" "}
                    <em className="font-normal text-muted-foreground/70">to be quiet.</em>
                  </span>
                </h1>
              </div>

              {/* Personal description */}
              <div className={`mt-12 md:mt-16 grid grid-cols-1 md:grid-cols-12 gap-8 transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="md:col-span-7 md:col-start-1">
                  <div className="space-y-4 text-[14px] md:text-[15px] text-muted-foreground leading-[1.7]">
                    <p>
                      Most of my work involves interfaces—products where the challenge 
                      is knowing what to leave out. I think a lot about tools that 
                      recede, that let you forget you&apos;re using them.
                    </p>
                    <p className="text-muted-foreground/70">
                      Outside of product work, I write occasionally, take photographs 
                      of nothing in particular, and spend time with things that reward 
                      patience. This is where those interests collect.
                    </p>
                  </div>
                </div>
                
                {/* Side metadata - more authored labels */}
                <div className="md:col-span-4 md:col-start-9">
                  <div className="border-l border-border/40 pl-4">
                    <div className="space-y-5 text-[11px]">
                      <div>
                        <span className="text-muted-foreground/40 tracking-wider uppercase block mb-1.5">
                          At the moment
                        </span>
                        <span className="text-foreground/70 leading-relaxed block">
                          Independent work,<br />
                          a few ongoing projects
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/40 tracking-wider uppercase block mb-1.5">
                          How I spend time
                        </span>
                        <span className="text-foreground/70 leading-relaxed block">
                          Product design, some code,<br />
                          occasional writing
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground/40 tracking-wider uppercase block mb-1.5">
                          Previously
                        </span>
                        <span className="text-foreground/70 leading-relaxed block font-serif italic">
                          Various things
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom navigation */}
        <div className={`mt-auto pt-10 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="border-t border-border/40 pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <nav className="flex items-center gap-10">
                <Link 
                  href="#work" 
                  className="group flex items-baseline gap-2.5"
                >
                  <span className="text-[10px] font-mono text-muted-foreground/30">I</span>
                  <span className="text-[11px] tracking-[0.15em] uppercase text-foreground/80 group-hover:text-foreground transition-colors">
                    Work
                  </span>
                </Link>
                <Link 
                  href="#notes" 
                  className="group flex items-baseline gap-2.5"
                >
                  <span className="text-[10px] font-mono text-muted-foreground/30">II</span>
                  <span className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground/70 group-hover:text-foreground transition-colors">
                    Notes
                  </span>
                </Link>
                <Link 
                  href="#archive" 
                  className="group flex items-baseline gap-2.5"
                >
                  <span className="text-[10px] font-mono text-muted-foreground/30">III</span>
                  <span className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground/70 group-hover:text-foreground transition-colors">
                    Archive
                  </span>
                </Link>
              </nav>
              
              {/* Quiet timestamp */}
              <div className="flex items-center gap-2 text-[10px] text-muted-foreground/40">
                <span className="font-mono">2019—present</span>
                <span className="w-1 h-1 rounded-full bg-foreground/20" />
                <span className="font-serif italic">work in progress</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
