import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { MarketingCTA } from './MarketingCta'
import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { PLANS, MAX_PLAN_FEATURES, type PlanId } from '@/shared/constants/plans'

const HIGHLIGHTED_PLAN: PlanId = 'professional'
const CTA_LABELS: Record<PlanId, string> = {
  starter: 'Começar agora',
  professional: 'Começar agora',
  enterprise: 'Falar com vendas',
}

export function PricingSection() {
  return (
    <section
      id="pricing"
      className="relative overflow-hidden py-28 px-[5%]"
      style={{ background: 'var(--ll-bg)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '30%',
          right: '0%',
          width: '50vmax',
          height: '50vmax',
          background: 'radial-gradient(circle, var(--ll-halo-accent), transparent 60%)',
          transform: 'translate(50%, -50%)',
          animation: 'av-drift-1 28s ease-in-out infinite',
        }}
      />

      <Reveal className="mb-16 relative">
        <SectionHeader
          eyebrow="Preços"
          title="Planos para cada fase da sua clínica"
          description="Comece gratuitamente e escale conforme sua demanda cresce. Sem surpresas."
          align="center"
        />
      </Reveal>

      <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const highlighted = plan.id === HIGHLIGHTED_PLAN
          return (
            <Reveal
              key={plan.id}
              className={cn(
                'rounded-3xl overflow-hidden flex flex-col transition-all',
                highlighted && 'scale-[1.02]',
              )}
              style={{
                background: 'var(--ll-surface-grad)',
                border: highlighted
                  ? '1.5px solid var(--ll-accent-border)'
                  : '1px solid var(--ll-border)',
                boxShadow: highlighted
                  ? '0 24px 60px -20px var(--ll-halo-accent-strong), var(--ll-shadow-card)'
                  : 'var(--ll-shadow-card)',
              }}
            >
              {highlighted && (
                <div
                  className="text-center py-2 text-[0.7rem] font-semibold uppercase tracking-[2px]"
                  style={{
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), var(--ll-accent)',
                    color: 'var(--ll-accent-ink)',
                  }}
                >
                  Mais popular
                </div>
              )}
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl shrink-0 border"
                    style={{
                      background: 'var(--ll-accent-bg-soft)',
                      borderColor: 'var(--ll-accent-border-soft)',
                    }}
                  >
                    <Icon size={20} style={{ color: 'var(--ll-accent-strong)' }} />
                  </div>
                  <div>
                    <div className="text-base font-semibold" style={{ color: 'var(--ll-ink)' }}>
                      {plan.name}
                    </div>
                    <div className="text-[0.7rem]" style={{ color: 'var(--ll-ink-muted)' }}>
                      {plan.description}
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-light tracking-tight" style={{ color: 'var(--ll-ink)' }}>
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="text-sm ml-1" style={{ color: 'var(--ll-ink-muted)' }}>
                      {plan.period}
                    </span>
                  )}
                </div>

                <div className="space-y-3 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <div
                        className="flex h-5 w-5 items-center justify-center rounded-full shrink-0 mt-px"
                        style={{ background: 'var(--ll-accent-bg-soft)' }}
                      >
                        <Check size={11} style={{ color: 'var(--ll-accent-strong)' }} />
                      </div>
                      <span className="text-[0.85rem] leading-[1.5]" style={{ color: 'var(--ll-ink-muted)' }}>
                        {feature}
                      </span>
                    </div>
                  ))}
                  {Array.from({ length: MAX_PLAN_FEATURES - plan.features.length }).map((_, index) => (
                    <div key={`spacer-${index}`} className="h-6.5" />
                  ))}
                </div>

                <div className="mt-7">
                  <MarketingCTA to="/trial" shape="block" variant={highlighted ? 'filled' : 'outline'}>
                    {CTA_LABELS[plan.id]}
                  </MarketingCTA>
                </div>
              </div>
            </Reveal>
          )
        })}
      </div>

      <Reveal className="text-center mt-12 text-sm" style={{ color: 'var(--ll-ink-muted)' }}>
        Todos os planos incluem criptografia end-to-end e conformidade com a LGPD.
      </Reveal>
    </section>
  )
}
