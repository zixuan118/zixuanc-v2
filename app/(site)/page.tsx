import { FeaturedProject } from "@/components/featured-project"
import { HomeInteractionProvider } from "@/components/home/home-interaction"
import { HeroSection } from "@/components/hero-section"
import { VisualFragment } from "@/components/visual-fragment"
import { WritingSection } from "@/components/writing-section"

export default function HomePage() {
  return (
    <HomeInteractionProvider>
      <HeroSection />
      <FeaturedProject />
      <VisualFragment />
      <WritingSection />
    </HomeInteractionProvider>
  )
}
