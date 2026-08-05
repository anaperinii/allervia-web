import { useId } from 'react'
import { Reveal } from './Reveal'
import { useLandingTheme } from '@/features/landing-page/theme-context'
import glowDark from '@/assets/automation-glow-dark.png'
import glowLight from '@/assets/automation-glow-light.png'

type IconKind = 'track' | 'sync' | 'auto' | 'proto'

interface IconShape {
  lines: [number, number, number, number, number][]
  nodes: [number, number, number][]
}

const ICON_DATA: Record<IconKind, IconShape> = {
  track: {
    lines: [[19, 27, 33, 13, 3.2], [19, 27, 36, 31, 3], [19, 27, 10, 14, 2.8], [19, 27, 24, 40, 2.6], [33, 13, 42, 21, 2.2], [36, 31, 42, 21, 2.2]],
    nodes: [[19, 27, 7.4], [33, 13, 5], [36, 31, 4.4], [10, 14, 4], [24, 40, 3.4], [42, 21, 2.8]],
  },
  sync: {
    lines: [[13, 15, 35, 15, 3.2], [13, 33, 35, 33, 3.2], [13, 15, 13, 33, 3.2], [35, 15, 35, 33, 3.2]],
    nodes: [[13, 15, 6.2], [35, 15, 6.2], [13, 33, 6.2], [35, 33, 6.2]],
  },
  auto: {
    lines: [[24, 24, 24, 9, 2.8], [24, 24, 38, 20, 3], [24, 24, 33, 38, 2.8], [24, 24, 11, 31, 3.1]],
    nodes: [[24, 24, 8.2], [24, 9, 4.2], [38, 20, 4.6], [33, 38, 4.2], [11, 31, 4.8]],
  },
  proto: {
    lines: [[11, 24, 25, 14, 3.2], [11, 24, 25, 34, 3.2], [25, 14, 39, 9, 2.4], [25, 14, 39, 24, 2.6], [25, 34, 39, 24, 2.6], [25, 34, 39, 39, 2.4]],
    nodes: [[11, 24, 5.8], [25, 14, 5.2], [25, 34, 5.2], [39, 9, 3.6], [39, 24, 4.4], [39, 39, 3.6]],
  },
}

function SphereIcon({ kind, dark, index }: { kind: IconKind; dark: boolean; index: number }) {
  const id = useId()
  const c = dark
    ? { g0: '#dff2f2', g1: '#6fadb6', g2: '#1c5f6b', line: '#4d95a0', ring: '#a9d8db', hi: '#dff2f2' }
    : { g0: '#ffffff', g1: '#8dc0c7', g2: '#1d6b78', line: '#7db3bc', ring: '#4f95a1', hi: '#ffffff' }
  const { lines, nodes } = ICON_DATA[kind]
  return (
    <span
      aria-hidden="true"
      style={{
        display: 'block',
        marginBottom: 12,
        opacity: 0.68,
        animation: `float-subtle ${6.4 + (index % 2) * 1.2}s ease-in-out ${index * 0.55}s infinite`,
      }}
    >
      <svg
        viewBox="0 0 48 48"
        style={{ width: 54, height: 54, display: 'block', transform: index === 1 ? 'rotate(10deg)' : undefined }}
      >
      <defs>
        <radialGradient id={id} cx="32%" cy="27%" r="84%">
          <stop offset="0%" stopColor={c.g0} stopOpacity="0.92" />
          <stop offset="55%" stopColor={c.g1} stopOpacity="0.7" />
          <stop offset="100%" stopColor={c.g2} stopOpacity="0.88" />
        </radialGradient>
      </defs>
      {lines.map(([x1, y1, x2, y2, w], i) => (
        <line key={`l-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={c.line} strokeWidth={w} strokeLinecap="round" opacity="0.5" />
      ))}
      {nodes.map(([cx, cy, r], i) => (
        <g key={`n-${i}`}>
          <circle cx={cx} cy={cy} r={r} fill={`url(#${id})`} />
          <circle cx={cx} cy={cy} r={r} fill="none" stroke={c.ring} strokeWidth="0.45" opacity="0.3" />
          <ellipse
            cx={cx - 0.3 * r}
            cy={cy - 0.38 * r}
            rx={0.3 * r}
            ry={0.2 * r}
            fill={c.hi}
            opacity="0.5"
            transform={`rotate(-32 ${cx} ${cy})`}
          />
        </g>
      ))}
      </svg>
    </span>
  )
}

const FEATURES: { kind: IconKind; title: string; description: string }[] = [
  { kind: 'track', title: 'Rastreamento de Desempenho', description: 'Monitore adesão, intervalos e resultados sem precisar revisar registros manualmente.' },
  { kind: 'sync', title: 'Sincronização em Tempo Real', description: 'Dados do paciente, fases do protocolo e status de aplicações sempre atualizados.' },
  { kind: 'auto', title: 'Automação Inteligente', description: 'Cálculo automático de doses e progressão de protocolo baseado em regras clínicas validadas.' },
  { kind: 'proto', title: 'Gestão de Protocolos', description: 'Organize e visualize protocolos de indução e manutenção como um blueprint clínico executável.' },
]

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
              <SphereIcon kind={feature.kind} dark={dark} index={i} />
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
