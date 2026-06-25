import { ArrowLeft, Building, Calendar, Check, CreditCard, Receipt } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button, IconButton } from '@/shared/components'
import { PLANS, MAX_PLAN_FEATURES, type PlanId } from '@/shared/constants/plans'

const CURRENT_PLAN_ID: PlanId = 'professional'

const billingSummary = [
  { icon: CreditCard, label: 'Método de pagamento', value: 'Visa •••• 4242' },
  { icon: Calendar, label: 'Próxima cobrança', value: '01/05/2026' },
  { icon: Receipt, label: 'Último pagamento', value: '01/04/2026 — R$ 197,00' },
]

export function PlansPage() {
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <IconButton aria-label="Voltar" to="/settings"><ArrowLeft size={16} /></IconButton>
          <h1 className="text-3xl font-bold text-(--text)">Planos e Serviços</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-4xl mx-auto space-y-6">
            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Seu plano atual</h2>
              </div>
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/10 shrink-0">
                      <Building size={18} className="text-brand" />
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
                          <Icon size={11} className="text-(--text-muted)" />
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
                        'border rounded-xl overflow-hidden transition-all flex flex-col',
                        isCurrent ? 'border-brand shadow-[0_8px_24px_rgba(20,184,166,0.1)]' : 'border-(--border-custom) hover:border-gray-300',
                      )}
                    >
                      {isCurrent && (
                        <div className="bg-linear-to-r from-brand to-teal-400 text-center py-1.5 text-[0.6rem] font-bold text-white uppercase tracking-wider">
                          Plano atual
                        </div>
                      )}
                      <div className="p-5 flex flex-col flex-1">
                        <div className="flex items-center gap-2.5 mb-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg shrink-0 bg-brand/10">
                            <Icon size={16} className="text-brand" />
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
                              <Check size={12} className="text-brand shrink-0" />
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
        </div>
      </div>
    </div>
  )
}
