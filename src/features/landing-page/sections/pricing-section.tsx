import { Check } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Blob, MarketingCTA, Reveal } from '@/shared/components'
import { SectionHeader } from '@/features/landing-page/components/section-header'
import { PLANS, MAX_PLAN_FEATURES, type PlanId } from '@/shared/data/plans'

const HIGHLIGHTED_PLAN: PlanId = 'professional'
const CTA_LABELS: Record<PlanId, string> = {
  starter: 'Começar grátis',
  professional: 'Começar agora',
  enterprise: 'Falar com vendas',
}

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-[5%] relative overflow-hidden">
      <Blob className="-top-32 -left-20 w-100 h-100 bg-linear-to-br from-teal-200/20 to-cyan-200/20" />
      <Blob className="-top-28 -right-20 w-95 h-95 bg-cyan-200/20" />
      <Blob className="top-1/3 left-1/2 -translate-x-1/2 w-125 h-87.5 bg-teal-100/25" />
      <Blob className="-bottom-32 -left-16 w-95 h-95 bg-cyan-100/25" />
      <Blob className="-bottom-28 -right-24 w-105 h-105 bg-teal-200/20" />

      <Reveal className="mb-14 relative">
        <SectionHeader
          eyebrow="Preços"
          title="Planos para cada fase da sua clínica"
          description="Comece gratuitamente e escale conforme sua demanda cresce. Sem surpresas."
        />
      </Reveal>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {PLANS.map((plan) => {
          const Icon = plan.icon
          const highlighted = plan.id === HIGHLIGHTED_PLAN
          return (
            <Reveal
              key={plan.id}
              className={cn(
                'rounded-2xl overflow-hidden flex flex-col transition-all',
                highlighted
                  ? 'border-2 border-brand shadow-[0_8px_32px_rgba(24,193,203,0.15)] scale-[1.02]'
                  : 'border border-(--border-custom)',
              )}
            >
              {highlighted && (
                <div className="bg-linear-to-r from-brand to-teal-400 text-center py-2 text-[0.7rem] font-bold text-white uppercase tracking-wider">
                  Mais popular
                </div>
              )}
              <div className="p-7 flex flex-col flex-1">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand/10 shrink-0">
                    <Icon size={20} className="text-brand" />
                  </div>
                  <div>
                    <div className="text-base font-bold text-(--text)">{plan.name}</div>
                    <div className="text-[0.7rem] text-(--text-muted)">{plan.description}</div>
                  </div>
                </div>

                <div className="mb-6">
                  <span className="text-3xl font-extrabold text-(--text)">{plan.price}</span>
                  {plan.period && <span className="text-sm text-(--text-muted)">{plan.period}</span>}
                </div>

                <div className="space-y-2.5 flex-1">
                  {plan.features.map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-brand/10 shrink-0 mt-px">
                        <Check size={11} className="text-brand" />
                      </div>
                      <span className="text-[0.85rem] text-(--text-muted) leading-[1.4]">{feature}</span>
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

      <Reveal className="text-center mt-10 text-sm text-(--text-muted)">
        Todos os planos incluem criptografia end-to-end e conformidade com a LGPD.
      </Reveal>
    </section>
  )
}
