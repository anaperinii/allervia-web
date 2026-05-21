import { Blob, Reveal } from '@/shared/components'
import { SectionHeader } from '@/features/landing-page/components/section-header'
import { AUTOMATION_FEATURES } from '@/features/landing-page/constants/automation-features'

export function AutomationSection() {
  return (
    <section id="automation" className="py-24 px-[5%] relative overflow-hidden">
      <Blob className="-top-28 -left-16 w-95 h-95 bg-linear-to-br from-cyan-200/20 to-teal-300/15" />
      <Blob className="-top-32 -right-24 w-100 h-100 bg-teal-200/20" />
      <Blob className="-bottom-32 -left-20 w-100 h-100 bg-linear-to-br from-teal-200/20 to-cyan-200/20" />
      <Blob className="-bottom-28 -right-20 w-95 h-95 bg-cyan-200/20" />

      <Reveal className="bg-linear-to-br from-teal-800 via-teal-700 to-cyan-600 rounded-4xl p-8 sm:p-12 lg:p-16 mx-0 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_80%_at_80%_50%,rgba(255,255,255,0.05)_0%,transparent_60%)]" />

        <div className="relative z-10">
          <div className="mb-10">
            <SectionHeader
              eyebrow="Automação Clínica"
              title="Cálculo automático e fluxos sem retrabalho"
              description="Do cadastro ao relatório em segundos. Defina o protocolo e o ImuneCare gerencia a progressão de doses, alertas e agendamentos com base em regras clínicas validadas."
              tone="dark"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {AUTOMATION_FEATURES.map((feature) => {
              const Icon = feature.icon
              return (
                <div
                  key={feature.title}
                  className="bg-white/10 border border-white/15 rounded-2xl p-6 backdrop-blur-lg text-white transition-all duration-200 hover:bg-white/15 hover:-translate-y-0.75"
                >
                  <div className="mb-3">
                    <Icon size={28} className="text-white/90" />
                  </div>
                  <h4 className="text-[0.9rem] font-bold mb-1.5">{feature.title}</h4>
                  <p className="text-[0.8rem] opacity-75 leading-normal">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
