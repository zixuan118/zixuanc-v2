"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion"

export type HomeSectionId = "hero" | "work" | "notes" | "archive" | "footer"

const SECTION_ORDER: HomeSectionId[] = [
  "hero",
  "work",
  "notes",
  "archive",
  "footer",
]

type HomeInteractionValue = {
  activeSection: HomeSectionId | null
  reducedMotion: boolean
  registerSection: (id: HomeSectionId, el: HTMLElement | null) => void
}

const HomeInteractionContext = createContext<HomeInteractionValue | null>(null)

export function HomeInteractionProvider({ children }: { children: ReactNode }) {
  const reducedMotion = usePrefersReducedMotion()
  const sectionsRef = useRef<Partial<Record<HomeSectionId, HTMLElement>>>({})
  const [, bump] = useReducer((n: number) => n + 1, 0)
  const [activeSection, setActiveSection] = useState<HomeSectionId | null>(null)

  const registerSection = useCallback(
    (id: HomeSectionId, el: HTMLElement | null) => {
      if (el) sectionsRef.current[id] = el
      else delete sectionsRef.current[id]
      bump()
    },
    []
  )

  useEffect(() => {
    const footer = document.getElementById("site-footer")
    if (footer) {
      footer.dataset.homeSection = "footer"
      sectionsRef.current.footer = footer
      bump()
    }
    return () => {
      delete sectionsRef.current.footer
    }
  }, [])

  useEffect(() => {
    if (reducedMotion) {
      setActiveSection(null)
      return
    }

    const ratiosRef = new Map<HomeSectionId, number>()

    const pickActive = () => {
      let best: HomeSectionId | null = null
      let max = 0
      for (const id of SECTION_ORDER) {
        const r = ratiosRef.get(id) ?? 0
        if (r > max) {
          max = r
          best = id
        }
      }
      if (best && max >= 0.18) setActiveSection(best)
      else setActiveSection(null)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const id = (e.target as HTMLElement).dataset
            .homeSection as HomeSectionId
          if (id && SECTION_ORDER.includes(id)) {
            ratiosRef.set(id, e.intersectionRatio)
          }
        }
        pickActive()
      },
      {
        threshold: [0, 0.08, 0.15, 0.22, 0.35, 0.5, 0.65, 0.85, 1],
        rootMargin: "-11% 0px -11% 0px",
      }
    )

    const observeAll = () => {
      observer.disconnect()
      for (const id of SECTION_ORDER) {
        const el = sectionsRef.current[id]
        if (el) observer.observe(el)
      }
    }

    observeAll()
    const t = requestAnimationFrame(observeAll)

    return () => {
      cancelAnimationFrame(t)
      observer.disconnect()
    }
  }, [reducedMotion, bump])

  const value = useMemo(
    () => ({
      activeSection: reducedMotion ? null : activeSection,
      reducedMotion,
      registerSection,
    }),
    [activeSection, reducedMotion, registerSection]
  )

  return (
    <HomeInteractionContext.Provider value={value}>
      {children}
    </HomeInteractionContext.Provider>
  )
}

export function useHomeInteraction(): HomeInteractionValue {
  const ctx = useContext(HomeInteractionContext)
  if (!ctx) {
    throw new Error(
      "useHomeInteraction must be used within HomeInteractionProvider"
    )
  }
  return ctx
}

export function useHomeSection(id: HomeSectionId): {
  ref: (el: HTMLElement | null) => void
  isActive: boolean
} {
  const ctx = useContext(HomeInteractionContext)
  const register = ctx?.registerSection

  const ref = useCallback(
    (el: HTMLElement | null) => {
      if (el) {
        el.dataset.homeSection = id
      }
      register?.(id, el)
    },
    [id, register]
  )

  const isActive = ctx ? ctx.activeSection === id : false

  return { ref, isActive }
}
