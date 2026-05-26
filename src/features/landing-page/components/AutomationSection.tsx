import { Blob } from './Blob'
import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { AUTOMATION_FEATURES } from '@/features/landing-page/constants/automation-features'

export function AutomationSection() {
  return (
    <section id="automation" className="py-24 px-[5%] relative overflow-hidden">
      <Blob className="top-1/2 -left-40 -translate-y-1/2 w-100 h-100 bg-linear-to-br from-cyan-200/20 to-teal-300/15" />
      <Blob className="top-1/2 -right-40 -translate-y-1/2 w-100 h-100 bg-linear-to-br from-teal-200/20 to-cyan-200/20" />

      <Reveal className="border-2 border-[#7FFFD4]/70 rounded-4xl p-8 sm:p-12 lg:p-16 mx-0 relative shadow-[0_8px_32px_rgba(20,184,166,0.08)]">
        <div className="relative z-10">
          <div className="mb-10">
            <SectionHeader
              eyebrow="Automação Clínica"
              title="Cálculo automático e fluxos sem retrabalho"
              description="Do cadastro ao relatório em segundos. Defina o protocolo e o ImuneCare gerencia a progressão de doses, alertas e agendamentos com base em regras clínicas validadas."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {AUTOMATION_FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-(--card) border-[1.5px] border-(--border-custom) rounded-(--radius) p-7 transition-all duration-250 cursor-default hover:border-teal-300 hover:shadow-[0_8px_32px_rgba(20,184,166,0.1)] hover:-translate-y-0.75"
                >
                  <div className="w-12 h-12 rounded-xl bg-[linear-gradient(135deg,var(--color-teal-50),var(--color-teal-100))] border border-teal-200 flex items-center justify-center mb-4">
                    <Icon size={22} className="text-teal-600" />
                  </div>
                  <h4 className="text-base font-bold mb-2">{feature.title}</h4>
                  <p className="text-[0.875rem] text-(--text-muted) leading-[1.6]">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
