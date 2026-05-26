import { HeroSection } from '@/features/landing-page/components/sections/hero-section'
import { FeaturesGrid } from '@/features/landing-page/components/sections/features-grid'
import { SplitSection } from '@/features/landing-page/components/sections/split-section'
import { AutomationSection } from '@/features/landing-page/components/sections/automation-section'
import { TestimonialsSection } from '@/features/landing-page/components/sections/testimonials-section'
import { TabsSection } from '@/features/landing-page/components/sections/tabs-section'
import { PricingSection } from '@/features/landing-page/components/sections/pricing-section'
import { CtaSection } from '@/features/landing-page/components/sections/cta-section'
import { Footer } from '@/features/landing-page/components/sections/footer'

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
