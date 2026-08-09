import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { FEATURES } from '@/features/landing-page/constants/features'
import { useLandingTheme } from '@/features/landing-page/theme-context'
import featuresArt from '@/assets/features-art.jpg'

const CARD_SPANS = [
  'lg:col-span-2',
  '',
  'lg:col-span-2',
  '',
  '',
  '',
  'lg:col-span-2',
]

const ART_SCRIM = {
  dark: 'linear-gradient(180deg, rgba(8,25,29,0.22) 0%, rgba(8,25,29,0.45) 100%)',
  light: 'linear-gradient(180deg, rgba(255,255,255,0.52) 0%, rgba(255,255,255,0.30) 55%, rgba(108,158,165,0.14) 100%)',
}

const ART_TINT = {
  dark: '#0d3b42',
  light: '#7fb2b6',
}

export function FeaturesGrid() {
  const { theme } = useLandingTheme()
  const darkTheme = theme === 'dark'

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

      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:auto-rows-[13rem]">
        <Reveal
          className="relative hidden lg:block overflow-hidden rounded-2xl lg:col-start-3 lg:row-start-2 lg:row-span-2"
          style={{ border: '1px solid var(--ll-border)', boxShadow: 'var(--ll-shadow-card)' }}
          >
          <img
            src={featuresArt}
            alt=""
            loading="lazy"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            style={{
              filter: darkTheme
                ? 'invert(1) hue-rotate(180deg) brightness(0.92)'
                : 'saturate(0.8) brightness(1.06) contrast(0.96)',
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background: darkTheme ? ART_TINT.dark : ART_TINT.light,
              mixBlendMode: 'color',
              opacity: darkTheme ? 0.9 : 0.4,
            }}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: darkTheme ? ART_SCRIM.dark : ART_SCRIM.light }}
          />
        </Reveal>

        {FEATURES.map((feature, index) => {
          const Icon = feature.icon
          return (
            <Reveal
              key={feature.title}
              delay={50 * (index + 1)}
              className={`group relative overflow-hidden rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1 ${CARD_SPANS[index] ?? ''}`}
              style={{
                background: 'var(--ll-surface-grad)',
                border: '1px solid var(--ll-border)',
                boxShadow: 'var(--ll-shadow-card)',
              }}
            >
              <div
                className="mb-5 flex h-12 w-12 items-center justify-center rounded-full border"
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
