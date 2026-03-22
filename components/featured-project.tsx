"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowUpRight } from "lucide-react"

export function FeaturedProject() {
  return (
    <section id="work" className="py-20 md:py-28 px-6 lg:px-8 scroll-mt-16">
      <div className="mx-auto max-w-6xl">
        {/* Section label - chapter opening style */}
        <div className="mb-14 md:mb-20">
          <div className="flex items-baseline gap-4 mb-6">
            <span className="text-[10px] font-mono text-muted-foreground/40">I</span>
            <span className="text-[10px] tracking-[0.25em] uppercase text-muted-foreground/50">
              Work
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-6">
              <h2 className="font-serif text-2xl md:text-3xl font-light text-foreground leading-snug">
                Selected projects from the past few years
              </h2>
            </div>
            <div className="md:col-span-5 md:col-start-8">
              <p className="text-[13px] text-muted-foreground/60 leading-[1.7]">
                A mix of product work and personal projects. What connects them 
                is an interest in interfaces that feel considered—software where 
                the decisions are invisible until you look for them.
              </p>
            </div>
          </div>
        </div>
        
        {/* Featured case study - editorial presentation */}
        <Link href="/work/canvas" className="group block">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Image */}
            <div className="lg:col-span-7">
              <div className="relative aspect-[4/3] h-auto min-h-[200px] w-full bg-muted overflow-hidden">
                <Image
                  src="/images/featured-project.jpg"
                  alt="Canvas - Interface for visual note-taking"
                  fill
                  sizes="(max-width: 1024px) 100vw, 58vw"
                  priority
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.02]"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-500" />
              </div>
              {/* Caption under image */}
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-[10px] text-muted-foreground/50 font-serif italic">
                  Canvas workspace, current version
                </span>
                <span className="text-[9px] text-muted-foreground/40 font-mono">
                  fig. 01
                </span>
              </div>
            </div>
            
            {/* Text content - case study intro style */}
            <div className="lg:col-span-5 flex flex-col justify-center">
              <div className="lg:pl-2">
                {/* Metadata row */}
                <div className="flex items-center gap-3 mb-6 text-[10px] text-muted-foreground/50">
                  <span className="font-mono">2023–ongoing</span>
                  <span className="w-px h-3 bg-border/40" />
                  <span className="tracking-wider uppercase">Personal project</span>
                </div>
                
                {/* Title */}
                <h3 className="font-serif text-2xl md:text-[1.75rem] font-light text-foreground mb-5 flex items-start gap-3">
                  <span>Canvas</span>
                  <ArrowUpRight className="w-4 h-4 mt-1 text-muted-foreground/40 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </h3>
                
                {/* Description - slightly longer, more specific */}
                <div className="space-y-4 text-[14px] text-muted-foreground leading-[1.7]">
                  <p>
                    A note-taking tool built around spatial thinking. Notes exist 
                    as objects you can arrange, connect, and forget about until you 
                    need them.
                  </p>
                  <p className="text-muted-foreground/60">
                    I started this because existing tools made me feel like I was 
                    always organizing instead of thinking. Canvas tries to stay 
                    out of the way.
                  </p>
                </div>
                
                {/* Scope tags */}
                <div className="mt-8 pt-5 border-t border-border/30">
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground/50">
                    <span>Design</span>
                    <span className="text-muted-foreground/30">/</span>
                    <span>React</span>
                    <span className="text-muted-foreground/30">/</span>
                    <span>TypeScript</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Link>
        
        {/* Divider with context */}
        <div className="my-16 md:my-20 flex items-center gap-4">
          <div className="flex-1 h-px bg-border/30" />
          <span className="text-[10px] text-muted-foreground/40 font-serif italic">
            also of interest
          </span>
          <div className="flex-1 h-px bg-border/30" />
        </div>
        
        {/* Secondary projects - condensed editorial list */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
          {/* Project 2 */}
          <Link href="/work/tempo" className="group">
            <div className="flex gap-5">
              <div className="relative w-24 md:w-28 h-24 md:h-28 bg-muted overflow-hidden shrink-0">
                <Image
                  src="/images/archive-1.jpg"
                  alt="Tempo - Time tracking for small teams"
                  fill
                  sizes="112px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-[10px] text-muted-foreground/40 font-mono mb-2">2022–23</span>
                <h4 className="font-serif text-lg font-light text-foreground group-hover:text-foreground/70 transition-colors mb-2 truncate">
                  Tempo
                </h4>
                <p className="text-[12px] text-muted-foreground/60 leading-relaxed line-clamp-2">
                  Time tracking that tries not to interrupt. Built with a small team.
                </p>
              </div>
            </div>
          </Link>
          
          {/* Project 3 */}
          <Link href="/work/reader" className="group">
            <div className="flex gap-5">
              <div className="relative w-24 md:w-28 h-24 md:h-28 bg-muted overflow-hidden shrink-0">
                <Image
                  src="/images/archive-2.jpg"
                  alt="Reader - Reading list and highlights"
                  fill
                  sizes="112px"
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                />
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <span className="text-[10px] text-muted-foreground/40 font-mono mb-2">2021</span>
                <h4 className="font-serif text-lg font-light text-foreground group-hover:text-foreground/70 transition-colors mb-2 truncate">
                  Reader
                </h4>
                <p className="text-[12px] text-muted-foreground/60 leading-relaxed line-clamp-2">
                  A place to save articles and keep highlights. Still use it every day.
                </p>
              </div>
            </div>
          </Link>
        </div>
        
        {/* View all link */}
        <div className="mt-14 flex justify-end">
          <Link 
            href="/work" 
            className="text-[11px] tracking-[0.15em] uppercase text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-2 group"
          >
            <span>All projects</span>
            <span className="text-[10px] font-mono text-muted-foreground/40">(7)</span>
            <ArrowUpRight className="w-3 h-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </section>
  )
}
