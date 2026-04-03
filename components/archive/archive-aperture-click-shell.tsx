"use client"

import { useLayoutEffect, useRef, useState } from "react"
import gsap from "gsap"

import { MarginObjectShell } from "@/components/site/margin-object-shell"
import { ArchiveCameraAperture } from "@/components/objects/archive-camera-aperture"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export function ArchiveApertureClickShell({
  startId,
  endId,
  className = "",
}: {
  startId: string
  endId: string
  className?: string
}) {
  const reduced = usePrefersReducedMotion()
  const [open, setOpen] = useState(false)
  const [revealed, setRevealed] = useState(false)
  const [overrideProgress, setOverrideProgress] = useState<number | null>(0.02)
  const proxyRef = useRef({ p: 0.02 })
  const tlRef = useRef<gsap.core.Timeline | null>(null)

  useLayoutEffect(() => {
    // Reset to closed state when mounting.
    setOverrideProgress(0.02)
    proxyRef.current.p = 0.02
    setOpen(false)
    setRevealed(false)
  }, [])

  function play() {
    if (reduced) {
      setOverrideProgress(1)
      window.setTimeout(() => setOverrideProgress(0.02), 260)
      return
    }

    tlRef.current?.kill()

    const proxy = proxyRef.current
    proxy.p = overrideProgress ?? 0.02
    setOverrideProgress(proxy.p)

    const tl = gsap.timeline({
      onUpdate: () => {
        setOverrideProgress(proxy.p)
      },
    })
    tlRef.current = tl

    // Open then close, keeping the motion restrained.
    tl.to(proxy, {
      p: 0.92,
      duration: 0.55,
      ease: "power2.out",
    })
    tl.to(proxy, {
      p: 0.02,
      duration: 0.7,
      ease: "power2.inOut",
    })
  }

  return (
    <div className={`flex items-start justify-end gap-4 ${className}`.trim()}>
      {!open ? (
        <button
          type="button"
          onClick={() => {
            setOpen(true)
            setRevealed(false)
            // Defer by a frame so MarginObjectShell mounts with initial closed progress.
            window.requestAnimationFrame(() => {
              setRevealed(true)
              play()
            })
          }}
          className="text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60 transition-colors"
        >
          one more object
        </button>
      ) : (
        <>
          <p className="pt-[2px] text-[11px] tracking-[0.12em] uppercase text-muted-foreground/60">
            one more object
          </p>
          <MarginObjectShell
            startId={startId}
            endId={endId}
            className={`transition-opacity duration-700 ${
              revealed ? "opacity-100" : "opacity-0"
            } max-w-[min(200px,22vw)] lg:max-w-[min(240px,26vw)]`}
            interactive
            onClick={play}
            progressOverride={overrideProgress}
          >
            <ArchiveCameraAperture />
          </MarginObjectShell>
        </>
      )}
    </div>
  )
}

