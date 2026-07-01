import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { AutomationGlyph } from '@/features/landing-page/components/AutomationGlyph'
import { AUTOMATION_FEATURES } from '@/features/landing-page/constants/automation-features'

export function AutomationSection() {
  return (
    <section
      id="automation"
      className="py-24 px-[5%] relative overflow-hidden"
      style={{ background: 'var(--ll-bg)' }}
    >
      <Reveal
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:p-16 mx-0"
        style={{
          background: 'var(--ll-surface-grad)',
          border: '1px solid var(--ll-accent-border-soft)',
          boxShadow: 'var(--ll-shadow-card)',
        }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute"
          style={{
            top: '50%',
            left: '50%',
            width: '60vmax',
            height: '60vmax',
            background: 'radial-gradient(circle, var(--ll-halo-accent), transparent 60%)',
            transform: 'translate(-50%, -50%)',
            animation: 'av-drift-2 24s ease-in-out infinite',
          }}
        />

        <div className="relative z-10">
          <div className="mb-12">
            <SectionHeader
              eyebrow="Automação Clínica"
              title="Cálculo automático e fluxos sem retrabalho"
              description="Do cadastro ao relatório em segundos. Defina o protocolo e o Allervia gerencia a progressão de doses, alertas e agendamentos com base em regras clínicas validadas."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {AUTOMATION_FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className="group rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'var(--ll-surface-grad)',
                  border: '1px solid var(--ll-border)',
                  boxShadow: 'var(--ll-shadow-card-soft)',
                }}
              >
                <div className="mb-5 transition-transform duration-300 group-hover:scale-[1.04]">
                  <AutomationGlyph kind={feature.kind} size={88} delay={index * 140} />
                </div>
                <h4 className="text-base font-semibold mb-2" style={{ color: 'var(--ll-ink)' }}>
                  {feature.title}
                </h4>
                <p className="text-[0.875rem] leading-[1.7]" style={{ color: 'var(--ll-ink-muted)' }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  )
}
