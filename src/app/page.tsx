import { CtaSection } from "@/components/marketing/cta-section"
import { FeaturesSection } from "@/components/marketing/features-section"
import { HeroSection } from "@/components/marketing/hero-section"
import { PreviewSection } from "@/components/marketing/preview-section"
import { SiteFooter } from "@/components/marketing/site-footer"
import { SiteHeader } from "@/components/marketing/site-header"

export default function Home() {
  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:rounded-md focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:font-medium focus:text-foreground focus:ring-2 focus:ring-ring"
      >
        跳到主要内容
      </a>
      <SiteHeader />
      <main id="main-content" className="flex-1">
        <HeroSection />
        <PreviewSection />
        <FeaturesSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </>
  )
}
