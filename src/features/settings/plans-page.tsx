import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { PLANS, MAX_PLAN_FEATURES } from '@/shared/constants/plans'
import { CONTACT_SUPPORT_EMAIL } from '@/shared/constants/contact'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

export function PlansPage() {
  return (
    <SettingsLayout subtitle="Planos e Serviços">
      <div className="max-w-4xl mx-auto space-y-6">
        <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white">
          <div className="px-4 py-3 border-b border-(--border-custom) bg-[#F7F9F9]">
            <h2 className="text-xs font-bold text-(--text)">Faturamento</h2>
          </div>
          <div className="p-4 flex items-start gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 shrink-0">
              <FontAwesomeIcon icon={faCircleInfo} className="text-gray-400" style={{ fontSize: 14 }} />
            </div>
            <div>
              <div className="text-xs font-semibold text-(--text)">Faturamento indisponível</div>
              <p className="text-[0.65rem] text-(--text-muted) leading-relaxed mt-0.5">
                A cobrança pela plataforma ainda não está disponível: não há método de
                pagamento, faturas ou assinatura gerenciados por aqui. Dúvidas sobre
                contratação podem ser tratadas pelo e-mail{' '}
                <a
                  href={`mailto:${CONTACT_SUPPORT_EMAIL}`}
                  className="font-semibold text-brand-dark underline underline-offset-2"
                >
                  {CONTACT_SUPPORT_EMAIL}
                </a>
                .
              </p>
            </div>
          </div>
        </section>

        <section>
          <div className="text-center mb-4">
            <h2 className="text-sm font-bold text-(--text)">Comparar planos</h2>
            <p className="text-[0.65rem] text-(--text-muted) mt-0.5">Comparação informativa — a contratação ainda não é feita pela plataforma</p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {PLANS.map((plan) => {
              const Icon = plan.icon
              return (
                <div
                  key={plan.id}
                  className="border border-(--border-custom) rounded-xl overflow-hidden flex flex-col bg-white"
                >
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

                    {plan.price === 'Sob consulta' && (
                      <div className="mt-5">
                        <a
                          href={`mailto:${CONTACT_SUPPORT_EMAIL}?subject=${encodeURIComponent(`Interesse no plano ${plan.name}`)}`}
                          className="w-full h-9 rounded-lg bg-[#12333a] text-xs font-semibold text-white flex items-center justify-center transition-colors hover:bg-[#0c2429]"
                        >
                          Falar com vendas
                        </a>
                      </div>
                    )}
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
