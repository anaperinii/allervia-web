import { HeroSection } from '@/features/landing-page/components/HeroSection'
import { FeaturesGrid } from '@/features/landing-page/components/FeaturesGrid'
import { SplitSection } from '@/features/landing-page/components/SplitSection'
import { AutomationSection } from '@/features/landing-page/components/AutomationSection'
import { TestimonialsSection } from '@/features/landing-page/components/TestimonialsSection'
import { TabsSection } from '@/features/landing-page/components/TabsSection'
import { PricingSection } from '@/features/landing-page/components/PricingSection'
import { CtaSection } from '@/features/landing-page/components/CtaSection'
import { Footer } from '@/features/landing-page/components/Footer'

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
