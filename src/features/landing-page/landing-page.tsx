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
    <div className="min-h-screen" style={{ background: 'var(--ll-bg)', color: 'var(--ll-ink)' }}>
      <HeroSection />
      <FeaturesGrid />
      <SplitSection />
      <AutomationSection />
      <PricingSection />
      <TestimonialsSection />
      <TabsSection />
      <CtaSection />
      <Footer />

      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-x-0 bottom-0 z-50 h-16"
        style={{
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          maskImage: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.55) 45%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, #000 0%, rgba(0,0,0,0.55) 45%, transparent 100%)',
        }}
      />
    </div>
  )
}
