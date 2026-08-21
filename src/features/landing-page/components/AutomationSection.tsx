import { Reveal } from './Reveal'
import { useLandingTheme } from '@/features/landing-page/theme-context'
import glowDark from '@/assets/automation-glow-dark.png'
import glowLight from '@/assets/automation-glow-light.png'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowsRotate, faBrain, faDiagramProject, faHeartPulse } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

const FEATURES: { icon: IconDefinition; title: string; description: string }[] = [
  { icon: faHeartPulse, title: 'Rastreamento de Desempenho', description: 'Monitore adesão, intervalos e resultados sem precisar revisar registros manualmente.' },
  { icon: faArrowsRotate, title: 'Sincronização em Tempo Real', description: 'Dados do paciente, fases do protocolo e status de aplicações sempre atualizados.' },
  { icon: faBrain, title: 'Automação Inteligente', description: 'Cálculo automático de doses e progressão de protocolo baseado em regras clínicas validadas.' },
  { icon: faDiagramProject, title: 'Gestão de Protocolos', description: 'Organize e visualize protocolos de indução e manutenção como um blueprint clínico executável.' },
]

const BADGE_TONES_DARK = ['#7fb0b6', '#6C9EA5', '#4d7e85', '#2b6169']
const BADGE_TONES_LIGHT = ['#6fa4ab', '#588a91', '#257E8C', '#1d6772']

const MASK = 'linear-gradient(to left, #000 6%, transparent 84%), linear-gradient(to bottom, #000 40%, transparent 74%)'

export function AutomationSection() {
  const { theme } = useLandingTheme()
  const dark = theme === 'dark'
  const t = dark
    ? {
        cardBg: 'radial-gradient(120% 130% at 12% 10%, #16323a 0%, #0e2427 48%, #0a1b1e 100%)',
        cardBorder: 'rgba(216,234,232,0.12)',
        glow: glowDark,
        glowOpacity: 0.8,
        glowBlend: 'screen' as const,
        badgeColor: '#9dc3c2',
        badgeBorder: 'rgba(157,195,194,0.4)',
        title: '#e9f2f1',
        desc: '#93b0b2',
        featBg: 'rgba(220,235,233,0.045)',
        featBorder: 'rgba(216,234,232,0.11)',
        featTitle: '#e4efee',
        featDesc: '#88a5a7',
      }
    : {
        cardBg: 'radial-gradient(120% 130% at 12% 10%, #ffffff 0%, #f7fafa 52%, #eef3f4 100%)',
        cardBorder: 'rgba(16,113,129,0.14)',
        glow: glowLight,
        glowOpacity: 0.5,
        glowBlend: 'normal' as const,
        badgeColor: '#257E8C',
        badgeBorder: 'rgba(37,126,140,0.32)',
        title: '#12333a',
        desc: '#5b7c81',
        featBg: '#ffffff',
        featBorder: 'rgba(16,113,129,0.1)',
        featTitle: '#12333a',
        featDesc: '#66878c',
      }

  return (
    <section id="automation" className="py-24 px-[5%] relative overflow-hidden" style={{ background: 'var(--ll-bg)' }}>
      <Reveal
        className="relative overflow-hidden rounded-3xl p-8 sm:p-12 lg:px-15 lg:py-14"
        style={{ background: t.cardBg, border: `1px solid ${t.cardBorder}` }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-0 right-0 h-full"
          style={{
            width: '560px',
            backgroundImage: `url('${t.glow}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center top',
            mixBlendMode: t.glowBlend,
            opacity: t.glowOpacity,
            WebkitMaskImage: MASK,
            WebkitMaskComposite: 'source-in',
            maskImage: MASK,
            maskComposite: 'intersect',
          }}
        />

        <div className="relative max-w-150">
          <span
            className="inline-flex items-center gap-2.5 whitespace-nowrap text-[11.5px] font-semibold uppercase"
            style={{ letterSpacing: '0.16em', color: t.badgeColor }}
          >
            <span style={{ opacity: 0.45 }}>[</span>
            Automação clínica
            <span style={{ opacity: 0.45 }}>]</span>
          </span>
          <h2
            className="mt-6 text-3xl sm:text-4xl lg:text-[44px] font-medium text-balance"
            style={{ lineHeight: 1.1, letterSpacing: '-0.03em', color: t.title }}
          >
            Cálculo automático e fluxos sem retrabalho
          </h2>
          <p className="mt-4.5 text-[15.5px] max-w-130" style={{ lineHeight: 1.7, color: t.desc }}>
            Do cadastro ao relatório em segundos. Defina o protocolo e o Allervia gerencia a progressão de doses, alertas e
            agendamentos com base em regras clínicas validadas.
          </p>
        </div>

        <div className="relative mt-11.5 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4.5">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="rounded-2xl p-6.5 transition-transform duration-300 hover:-translate-y-1"
              style={{ background: t.featBg, border: `1px solid ${t.featBorder}` }}
            >
              <span
                aria-hidden="true"
                className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-full"
                style={{
                  background: (dark ? BADGE_TONES_DARK : BADGE_TONES_LIGHT)[i],
                  color: '#ffffff',
                }}
              >
                <FontAwesomeIcon icon={feature.icon} style={{ fontSize: 16 }} />
              </span>
              <h3 className="text-[15.5px] font-semibold mb-2.25" style={{ color: t.featTitle }}>
                {feature.title}
              </h3>
              <p className="text-[13.5px]" style={{ lineHeight: 1.6, color: t.featDesc }}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  )
}
