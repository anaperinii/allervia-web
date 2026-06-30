import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { FEATURES } from '@/features/landing-page/constants/features'

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="relative overflow-x-clip py-28 px-[5%]"
      style={{ background: 'var(--ll-bg)', color: 'var(--ll-ink)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(var(--ll-dot) 0.5px, transparent 0.5px)',
          backgroundSize: '3px 3px',
          opacity: 0.18,
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '40%',
          left: '0%',
          width: '50vmax',
          height: '50vmax',
          background: 'radial-gradient(circle, var(--ll-halo-accent), transparent 60%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-3 26s ease-in-out infinite',
        }}
      />

      <Reveal className="relative mb-16">
        <SectionHeader
          eyebrow="Funcionalidades"
          title="Projetado para especialistas em imunoterapia alérgica"
          description="Cada detalhe foi pensado para facilitar o dia a dia do alergista — do cadastro do paciente ao acompanhamento longitudinal do protocolo."
        />
      </Reveal>

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {FEATURES.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Reveal
              key={feature.title}
              delay={50 * (index + 1)}
              className={`group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 ${
                feature.large ? 'sm:col-span-2' : ''
              }`}
              style={{
                background: 'var(--ll-surface-grad)',
                border: '1px solid var(--ll-border)',
                boxShadow: 'var(--ll-shadow-card)',
              }}
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 46%, rgba(255,255,255,0) 56%), var(--ll-accent-bg-soft)',
                  borderColor: 'var(--ll-accent-border-soft)',
                }}
              >
                <Icon size={22} style={{ color: 'var(--ll-accent-strong)' }} />
              </div>
              <h3 className="mb-2 text-base font-semibold" style={{ color: 'var(--ll-ink)' }}>
                {feature.title}
              </h3>
              <p className="text-[0.875rem] leading-[1.7]" style={{ color: 'var(--ll-ink-muted)' }}>
                {feature.description}
              </p>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
