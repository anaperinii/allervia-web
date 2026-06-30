import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { FEATURES } from '@/features/landing-page/constants/features'

export function FeaturesGrid() {
  return (
    <section
      id="features"
      className="relative overflow-x-clip py-28 px-[5%]"
      style={{ background: '#08191d', color: '#DCE1E5' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(rgba(220,225,229,0.04) 0.5px, transparent 0.5px)',
          backgroundSize: '3px 3px',
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
          background: 'radial-gradient(circle, rgba(108,158,165,0.10), transparent 60%)',
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
                background:
                  'linear-gradient(160deg, rgba(220,225,229,0.07), rgba(220,225,229,0.018))',
                border: '1px solid rgba(220,225,229,0.13)',
                boxShadow: '0 30px 80px -30px rgba(0,0,0,0.7)',
              }}
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border"
                style={{
                  background:
                    'linear-gradient(180deg, rgba(255,255,255,0.18), rgba(255,255,255,0.04) 46%, rgba(255,255,255,0) 56%), rgba(108,158,165,0.18)',
                  borderColor: 'rgba(108,158,165,0.30)',
                }}
              >
                <Icon size={22} style={{ color: '#9BC1C4' }} />
              </div>
              <h3 className="mb-2 text-base font-semibold" style={{ color: '#DCE1E5' }}>
                {feature.title}
              </h3>
              <p className="text-[0.875rem] leading-[1.7]" style={{ color: '#7FA6AC' }}>
                {feature.description}
              </p>
            </Reveal>
          )
        })}
      </div>
    </section>
  )
}
