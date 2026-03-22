"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

export function VisualFragment() {
  return (
    <section id="archive" className="py-20 md:py-28 px-6 lg:px-8 bg-secondary/30 scroll-mt-16">
      <div className="mx-auto max-w-6xl">
        {/* Section header - chapter opening */}
        <div className="mb-14 md:mb-20">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-[10px] font-mono text-muted-foreground/40">III</span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/50">
              Archive
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-5">
              <h2 className="font-serif text-2xl md:text-3xl font-light text-foreground leading-snug">
                Images, mostly light
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-7">
              <p className="text-[13px] text-muted-foreground/60 leading-[1.7]">
                Photographs taken over the past five years. Most are mornings—
                light through windows, empty spaces, the interval between things. 
                A practice rather than a project.
              </p>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Image arrangement */}
          <div className="lg:col-span-8">
            <div className="grid grid-cols-12 gap-3">
              {/* Main image */}
              <div className="col-span-7">
                <div className="relative aspect-[3/4] min-h-[280px] bg-muted overflow-hidden">
                  <Image
                    src="/images/archive-1.jpg"
                    alt="Morning light through blinds"
                    fill
                    sizes="(max-width: 1024px) 58vw, 38vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="text-[10px] text-muted-foreground/50 font-serif italic">
                    March, early
                  </span>
                  <span className="text-[9px] text-muted-foreground/40 font-mono">
                    2024
                  </span>
                </div>
              </div>
              
              {/* Secondary images stacked */}
              <div className="col-span-5 flex flex-col gap-3 pt-12">
                <div>
                  <div className="relative aspect-square min-h-[120px] bg-muted overflow-hidden">
                    <Image
                      src="/images/archive-2.jpg"
                      alt="Staircase in soft light"
                      fill
                      sizes="(max-width: 1024px) 42vw, 27vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground/50 font-serif italic">
                      Stairwell, afternoon
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 font-mono">
                      2023
                    </span>
                  </div>
                </div>
                
                <div className="mt-2">
                  <div className="relative aspect-[4/3] min-h-[100px] bg-muted overflow-hidden">
                    <Image
                      src="/images/featured-project.jpg"
                      alt="Interior with window"
                      fill
                      sizes="(max-width: 1024px) 42vw, 27vw"
                      className="object-cover"
                    />
                  </div>
                  <div className="mt-2 flex items-baseline justify-between">
                    <span className="text-[10px] text-muted-foreground/50 font-serif italic">
                      Interior, waiting
                    </span>
                    <span className="text-[9px] text-muted-foreground/40 font-mono">
                      2023
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Context sidebar */}
          <div className="lg:col-span-4">
            <div className="lg:sticky lg:top-24 lg:pl-6 lg:border-l lg:border-border/30">
              <div className="space-y-4 text-[13px] text-muted-foreground/60 leading-[1.7]">
                <p>
                  I started photographing in 2019 as a way to pay attention. 
                  The camera became an excuse to wake up early and notice 
                  how light moves through a room.
                </p>
                <p>
                  These aren&apos;t trying to be art. They&apos;re more like notes—
                  a record of mornings that seemed worth remembering.
                </p>
              </div>
              
              {/* Archive details */}
              <div className="mt-8 pt-5 border-t border-border/30">
                <div className="flex flex-col gap-3 text-[10px]">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/40 uppercase tracking-wider">Images</span>
                    <span className="text-foreground/60 font-mono">247</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/40 uppercase tracking-wider">Period</span>
                    <span className="text-foreground/60 font-mono">2019–24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/40 uppercase tracking-wider">Last added</span>
                    <span className="text-foreground/60 font-mono">Mar 2024</span>
                  </div>
                </div>
              </div>
              
              {/* Archive link */}
              <div className="mt-6">
                <Link 
                  href="/archive"
                  className="text-[11px] tracking-[0.15em] uppercase text-foreground/70 hover:text-foreground transition-colors flex items-center gap-2 group"
                >
                  <span>View archive</span>
                  <ArrowUpRight className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
