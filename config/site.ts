/**
 * Single source of truth for routes, labels, and contact.
 */

export const siteConfig = {
  title: "Zixuan Chen",
  /** Shown in the browser tab (default + `Page · …` template). */
  browserTitle: "Zixuan - 子炫",
  description:
    "Zixuan Chen is a Boston-based financial analyst and product-minded builder working across software, data, and writing with an eye for clarity, user intent, and quiet detail.",
  email: "adrian.zixuan.chen@gmail.com",
  location: "Boston",
  linkedin: "https://www.linkedin.com/in/zixuan-chen-adrian/",
} as const

export type SiteNavItem = {
  chapter: string
  label: string
  href: string
}

export const routes = {
  home: "/",
  work: "/work",
  notes: "/notes",
  archive: "/archive",
  about: "/about",
  contact: "/contact",
} as const

export const headerNav: SiteNavItem[] = [
  { chapter: "I", label: "Work", href: routes.work },
  { chapter: "II", label: "Notes", href: routes.notes },
  { chapter: "III", label: "Archive", href: routes.archive },
  { chapter: "IV", label: "About", href: routes.about },
]

export const mobileNav: SiteNavItem[] = [
  { chapter: "I", label: "Work", href: routes.work },
  { chapter: "IV", label: "About", href: routes.about },
  { chapter: "II", label: "Notes", href: routes.notes },
  { chapter: "III", label: "Archive", href: routes.archive },
  { chapter: "V", label: "Contact", href: routes.contact },
]

export const footerIndexNav: SiteNavItem[] = [
  { chapter: "I", label: "Work", href: routes.work },
  { chapter: "II", label: "Notes", href: routes.notes },
  { chapter: "III", label: "Archive", href: routes.archive },
  { chapter: "IV", label: "About", href: routes.about },
  { chapter: "V", label: "Contact", href: routes.contact },
]
