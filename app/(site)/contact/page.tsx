import type { Metadata } from "next"
import Link from "next/link"
import { ContactRomanColumn } from "@/components/objects/contact-roman-column"
import { MarginObjectShell } from "@/components/site/margin-object-shell"
import { PageShell } from "@/components/site/page-shell"
import { siteConfig } from "@/config/site"

export const metadata: Metadata = {
  title: "Contact",
  description: `Email and LinkedIn — ${siteConfig.title}`,
}

const START = "contact-margin-object-start"
const END = "contact-margin-object-end"

export default function ContactPage() {
  return (
    <PageShell
      chapter="V"
      label="Contact"
      title="Get in touch"
      intro="If any part of this stays with you, you can reach out."
      contentClassName="max-w-none"
    >
      <div
        id={START}
        className="h-px w-px -mt-px opacity-0 pointer-events-none"
        aria-hidden
      />

      <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-x-10 xl:gap-x-12">
        <div className="lg:col-span-7 max-w-2xl space-y-8 text-[15px] leading-[1.75] text-muted-foreground/80 min-w-0">
          <div className="space-y-8 border-t border-border/30 pt-9 md:pt-10">
            <div>
              <p className="site-aside-label mb-2">Email</p>
              <Link href={`mailto:${siteConfig.email}`} className="site-link text-[15px]">
                {siteConfig.email}
              </Link>
            </div>
            <div>
              <p className="site-aside-label mb-2">LinkedIn</p>
              <Link
                href={siteConfig.linkedin}
                className="site-link text-[15px]"
                target="_blank"
                rel="noopener noreferrer"
              >
                linkedin.com/in/zixuan-chen-adrian
              </Link>
            </div>
          </div>
        </div>

        <div className="relative z-[2] hidden min-w-0 overflow-visible lg:flex lg:col-span-2 flex-col items-end self-start pb-10 pl-1 pr-1 lg:sticky lg:top-[min(10vh,96px)]">
          <MarginObjectShell startId={START} endId={END} className="mt-2 lg:mt-6">
            <ContactRomanColumn />
          </MarginObjectShell>
        </div>

        <div className="hidden lg:block lg:col-span-3" aria-hidden />
      </div>

      <div
        id={END}
        className="h-px w-px -mt-px opacity-0 pointer-events-none"
        aria-hidden
      />
    </PageShell>
  )
}
