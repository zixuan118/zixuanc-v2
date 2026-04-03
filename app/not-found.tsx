import type { Metadata } from "next"
import Link from "next/link"

import { Footer } from "@/components/footer"
import { Header } from "@/components/header"
import { SitePage } from "@/components/site/site-page"
import { routes } from "@/config/site"

export const metadata: Metadata = {
  title: "Not found",
  description:
    "This page is not in the current index. The link may be outdated or the entry may have moved.",
  robots: { index: false, follow: true },
}

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-background">
        <SitePage>
          <div className="grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-12">
            <div className="lg:col-span-7 min-w-0">
              <div className="pt-12 md:pt-16 border-t border-border/32 max-w-[640px]">
                <p className="font-mono text-[10px] text-muted-foreground/40 tracking-[0.12em] mb-5">
                  404 / Missing page
                </p>
                <h1 className="font-serif text-3xl md:text-4xl font-light text-foreground tracking-tight leading-snug max-w-3xl mb-8">
                  This page is not in the current index.
                </h1>
                <p className="text-[15px] leading-[1.75] text-muted-foreground/70 max-w-2xl mb-11 tracking-[-0.01em]">
                  The link may be outdated, the entry may have moved, or this part
                  of the site has not been filed here.
                </p>
                <nav
                  className="flex flex-col gap-3.5 sm:flex-row sm:gap-10 text-[13px]"
                  aria-label="Leave this page"
                >
                  <Link href={routes.home} className="site-link site-focus-ring w-fit">
                    Back to index
                  </Link>
                  <Link href={routes.work} className="site-link site-focus-ring w-fit">
                    Browse work
                  </Link>
                </nav>
              </div>
            </div>

            <div
              className="relative z-[1] hidden min-w-0 lg:flex lg:col-span-3 flex-col items-end self-start pt-14 md:pt-18 pb-10"
              aria-hidden
            >
              {/* Margin placeholder: unfilled index slot — not illustration */}
              <div className="w-[min(4.75rem,11vw)] aspect-[5/12] shrink-0 border border-border/[0.07] bg-foreground/[0.018] rounded-none opacity-70" />
            </div>

            <div className="hidden lg:block lg:col-span-2" aria-hidden />
          </div>
        </SitePage>
      </main>
      <Footer />
    </>
  )
}
