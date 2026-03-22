import { Header } from "@/components/header"
import { HeroSection } from "@/components/hero-section"
import { FeaturedProject } from "@/components/featured-project"
import { WritingSection } from "@/components/writing-section"
import { VisualFragment } from "@/components/visual-fragment"
import { Footer } from "@/components/footer"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <FeaturedProject />
      <WritingSection />
      <VisualFragment />
      <Footer />
    </main>
  )
}
