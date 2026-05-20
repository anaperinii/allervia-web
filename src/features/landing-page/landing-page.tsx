import { HeroSection } from '@/features/landing-page/sections/hero-section'
import { FeaturesGrid } from '@/features/landing-page/sections/features-grid'
import { SplitSection } from '@/features/landing-page/sections/split-section'
import { AutomationSection } from '@/features/landing-page/sections/automation-section'
import { TestimonialsSection } from '@/features/landing-page/sections/testimonials-section'
import { TabsSection } from '@/features/landing-page/sections/tabs-section'
import { PricingSection } from '@/features/landing-page/sections/pricing-section'
import { CtaSection } from '@/features/landing-page/sections/cta-section'
import { Footer } from '@/features/landing-page/sections/footer'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-linear-to-b from-teal-50/30 via-white via-50% to-teal-50/40">
      <HeroSection />
      <FeaturesGrid />
      <SplitSection />
      <AutomationSection />
      <PricingSection />
      <TestimonialsSection />
      <TabsSection />
      <CtaSection />
      <Footer />
    </div>
  )
}
