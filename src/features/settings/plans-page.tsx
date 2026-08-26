import { cn } from '@/shared/lib/cn'
import { Button } from '@/shared/components'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { PLANS, MAX_PLAN_FEATURES, type PlanId } from '@/shared/constants/plans'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBuilding, faCalendar, faCheck, faCreditCard, faReceipt } from '@fortawesome/free-solid-svg-icons'

const CURRENT_PLAN_ID: PlanId = 'professional'

const billingSummary = [
  { icon: faCreditCard, label: 'Método de pagamento', value: 'Visa •••• 4242' },
  { icon: faCalendar, label: 'Próxima cobrança', value: '01/05/2026' },
  { icon: faReceipt, label: 'Último pagamento', value: '01/04/2026 — R$ 197,00' },
]

export function PlansPage() {
  return (
    <SettingsLayout subtitle="Planos e Serviços">
      <div className="max-w-4xl mx-auto space-y-6">
            <section className="border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Seu plano atual</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 shrink-0">
                      <FontAwesomeIcon icon={faBuilding} className="text-brand" style={{ fontSize: 18 }} />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-(--text)">Professional</div>
                      <div className="text-[0.65rem] text-(--text-muted)">Ativo desde Março 2024</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-extrabold text-(--text)">
                      R$ 197<span className="text-xs font-medium text-(--text-muted)">/mês</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {billingSummary.map((item) => {
                    const Icon = item.icon
                    return (
                      <div key={item.label} className="bg-gray-50 rounded-lg p-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <FontAwesomeIcon icon={Icon} className="text-(--text-muted)" style={{ fontSize: 11 }} />
                          <span className="text-[0.6rem] text-(--text-muted)">{item.label}</span>
                        </div>
                        <div className="text-xs font-medium text-(--text)">{item.value}</div>
                      </div>
                    )
                  })}
                </div>
                <div className="flex gap-2 mt-4">
                  <Button variant="outline" size="sm">Alterar método de pagamento</Button>
                  <Button variant="outline" size="sm">Ver faturas</Button>
                  <Button tone="danger" variant="outline" size="sm">Cancelar assinatura</Button>
                </div>
              </div>
            </section>

            <section>
              <div className="text-center mb-4">
                <h2 className="text-sm font-bold text-(--text)">Comparar planos</h2>
                <p className="text-[0.65rem] text-(--text-muted) mt-0.5">Escolha o plano ideal para sua clínica</p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {PLANS.map((plan) => {
                  const Icon = plan.icon
                  const isCurrent = plan.id === CURRENT_PLAN_ID
                  return (
                    <div
                      key={plan.id}
                      className={cn(
                        'border rounded-3xl overflow-hidden transition-all flex flex-col bg-[#F6F8F8]',
                        isCurrent ? 'border-brand shadow-[0_8px_24px_rgba(20,184,166,0.1)]' : 'border-(--border-custom) hover:border-gray-300',
                      )}
                    >
                      {isCurrent && (
                        <div className="bg-linear-to-r from-brand to-brand-dark text-center py-1.5 text-[0.6rem] font-bold text-white uppercase tracking-wider">
                          Plano atual
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-brand/10">
                            <FontAwesomeIcon icon={Icon} className="text-brand" style={{ fontSize: 16 }} />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-(--text)">{plan.name}</div>
                            <div className="text-[0.6rem] text-(--text-muted)">{plan.description}</div>
                          </div>
                        </div>

                        <div className="mb-4">
                          <span className="text-xl font-extrabold text-(--text)">{plan.price}</span>
                          {plan.period && <span className="text-xs text-(--text-muted)">{plan.period}</span>}
                        </div>

                        <div className="space-y-2 flex-1">
                          {plan.features.map((feature) => (
                            <div key={feature} className="flex items-center gap-2 text-xs text-(--text-muted)">
                              <FontAwesomeIcon icon={faCheck} className="text-brand shrink-0" style={{ fontSize: 12 }} />
                              {feature}
                            </div>
                          ))}
                          {Array.from({ length: MAX_PLAN_FEATURES - plan.features.length }).map((_, index) => (
                            <div key={`spacer-${index}`} className="h-5" />
                          ))}
                        </div>

                        <div className="mt-5">
                          {isCurrent ? (
                            <div className="w-full h-9 rounded-lg border border-brand text-xs font-semibold text-brand flex items-center justify-center">
                              Plano atual
                            </div>
                          ) : (
                            <Button tone="brand" variant="solid" fullWidth className="h-9">
                              {plan.price === 'Sob consulta' ? 'Falar com vendas' : 'Fazer upgrade'}
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
      </section>
      </div>
    </SettingsLayout>
  )
}
