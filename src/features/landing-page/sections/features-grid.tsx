import { Blob, Reveal } from '@/shared/components'
import { SectionHeader } from '@/features/landing-page/components/section-header'
import { FEATURES } from '@/features/landing-page/data/features'

export function FeaturesGrid() {
  return (
    <section id="features" className="py-24 px-[5%] relative overflow-hidden">
      <Blob className="-top-40 -left-40 w-112.5 h-112.5 bg-linear-to-br from-cyan-200/20 to-teal-300/20" />
      <Blob className="-top-32 -right-20 w-95 h-95 bg-linear-to-br from-teal-200/25 to-cyan-100/15" />
      <Blob className="-bottom-32 -left-24 w-105 h-105 bg-linear-to-br from-teal-200/20 to-cyan-200/15" />
      <Blob className="-bottom-28 -right-20 w-90 h-90 bg-cyan-200/20" />

      <Reveal className="relative mb-12">
        <SectionHeader
          eyebrow="Funcionalidades"
          title="Projetado para especialistas em imunoterapia alérgica"
          description="Cada detalhe foi pensado para facilitar o dia a dia do alergista — do cadastro do paciente ao acompanhamento longitudinal do protocolo."
        />
      </Reveal>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Reveal
              key={feature.title}
              delay={50 * (index + 1)}
              className={`bg-(--card) border-[1.5px] border-(--border-custom) rounded-(--radius) p-7 transition-all duration-250 cursor-default hover:border-teal-300 hover:shadow-[0_8px_32px_rgba(20,184,166,0.1)] hover:-translate-y-0.75 ${
                feature.large ? 'sm:col-span-2' : ''
              }`}
            >
              <div className="w-12 h-12 rounded-xl bg-[linear-gradient(135deg,var(--color-teal-50),var(--color-teal-100))] border border-teal-200 flex items-center justify-center mb-4">
                <Icon size={22} className="text-teal-600" />
              </div>
              <h3 className="text-base font-bold mb-2">{feature.title}</h3>
              <p className="text-[0.875rem] text-(--text-muted) leading-[1.6]">{feature.description}</p>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
