import { User, Monitor, Server, Database, Radio } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Blob } from '@/features/landing-page/components/Blob'
import { Reveal } from '@/features/landing-page/components/Reveal'
import { DeckHeader } from '@/presentation/slides/DeckHeader'

interface Container {
  name: string
  icon: LucideIcon
  tech: string
  desc: string
  badge: string
  color: string
  bg: string
}

const USER: Container = {
  name: 'Usuário',
  icon: User,
  tech: 'Profissionais de saúde & administradores',
  desc: 'Operam a clínica via web',
  badge: 'Externo · Person',
  color: '#EC4899',
  bg: '#FCE7F3',
}

const FRONTEND: Container = {
  name: 'Frontend Web',
  icon: Monitor,
  tech: 'React 19 · TypeScript · Vite',
  desc: 'Prontuário, agenda e relatórios no browser',
  badge: 'Container · Web App',
  color: '#06B6D4',
  bg: '#CFFAFE',
}

const BACKEND: Container = {
  name: 'Backend API',
  icon: Server,
  tech: 'NestJS · Node.js · REST',
  desc: 'Regras de negócio, autenticação e RBAC',
  badge: 'Container · API Server',
  color: '#6366F1',
  bg: '#E0E7FF',
}

const DATABASE: Container = {
  name: 'Banco de Dados',
  icon: Database,
  tech: 'PostgreSQL',
  desc: 'Persistência das entidades clínicas',
  badge: 'Container · Database',
  color: '#10B981',
  bg: '#D1FAE5',
}

const EVENT_BUS: Container = {
  name: 'Event Bus',
  icon: Radio,
  tech: 'Apache Kafka · gRPC',
  desc: 'Eventos de domínio (assíncrono)',
  badge: 'Evolução Futura · Sub-System',
  color: '#F97316',
  bg: '#FED7AA',
}

function ContainerCard({ container }: { container: Container }) {
  const Icon = container.icon
  return (
    <div
      className="flex h-full flex-col gap-2 rounded-xl border-2 px-4 py-3.5"
      style={{
        background: container.bg,
        borderColor: container.color,
        boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
      }}
    >
      <div className="flex items-center gap-2">
        <Icon size={18} style={{ color: container.color }} className="shrink-0" />
        <span className="text-[0.92rem] font-bold leading-tight text-slate-800">{container.name}</span>
      </div>
      <div className="text-[0.62rem] font-medium uppercase tracking-wider text-slate-500">{container.tech}</div>
      <p className="text-[0.72rem] leading-snug text-slate-600">{container.desc}</p>
      <span
        className="mt-auto w-fit rounded-md border bg-white px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider"
        style={{ color: container.color, borderColor: `${container.color}66` }}
      >
        {container.badge}
      </span>
    </div>
  )
}

const EDGE = '#94A3B8'

function ArrowHorizontal({ label, dashed }: { label: string; dashed?: boolean }) {
  return (
    <div className="relative flex items-center justify-center" style={{ width: 92 }}>
      <svg width="92" height="34">
        <line
          x1="4"
          y1="17"
          x2="74"
          y2="17"
          stroke={EDGE}
          strokeWidth="1.5"
          strokeDasharray={dashed ? '5 4' : undefined}
        />
        <polygon points="74,11 86,17 74,23" fill={EDGE} />
      </svg>
      <span className="absolute left-1/2 -top-0.5 -translate-x-1/2 whitespace-nowrap rounded bg-white px-1.5 py-0.5 text-[0.58rem] font-semibold text-slate-500 ring-1 ring-slate-200">
        {label}
      </span>
    </div>
  )
}

export function ContainerArchitectureSlide() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-(--bg2) px-[5%] py-20">
      <Blob className="-top-24 -left-20 w-95 h-95 bg-cyan-100/30" />
      <Blob className="-bottom-28 -right-24 w-105 h-105 bg-teal-200/25" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <Reveal>
          <DeckHeader
            eyebrow="Diagrama de Containers · C4"
            title="ImuneCare no contexto do sistema completo"
            description="O frontend é apenas uma peça — convive com backend, banco, event bus e futuros serviços externos."
          />
        </Reveal>

        <Reveal delay={150}>
          <div className="mt-14 flex items-center gap-3">
            <div style={{ flex: '0 0 auto', width: 200 }}>
              <ContainerCard container={USER} />
            </div>

            <ArrowHorizontal label="HTTPS" />

            <div className="relative flex-1 rounded-2xl border-2 border-dashed border-slate-300 px-5 pb-6 pt-7">
              <span className="absolute -top-3 left-6 bg-(--bg2) px-3 text-[0.7rem] font-bold uppercase tracking-[2px] text-slate-500">
                Sistema ImuneCare
              </span>

              <div
                className="grid items-center gap-y-5"
                style={{
                  gridTemplateColumns: '1fr auto 1fr auto 1fr',
                  gridTemplateRows: 'repeat(2, minmax(130px, 1fr))',
                }}
              >
                <div style={{ gridColumn: 1, gridRow: '1 / 3' }}>
                  <ContainerCard container={FRONTEND} />
                </div>
                <div style={{ gridColumn: 2, gridRow: '1 / 3' }}>
                  <ArrowHorizontal label="REST · JSON / GraphQL" />
                </div>
                <div style={{ gridColumn: 3, gridRow: '1 / 3' }}>
                  <ContainerCard container={BACKEND} />
                </div>

                <div style={{ gridColumn: 4, gridRow: 1 }}>
                  <ArrowHorizontal label="SQL" />
                </div>
                <div style={{ gridColumn: 5, gridRow: 1 }}>
                  <ContainerCard container={DATABASE} />
                </div>

                <div style={{ gridColumn: 4, gridRow: 2 }}>
                  <ArrowHorizontal label="pub/sub · Kafka" dashed />
                </div>
                <div style={{ gridColumn: 5, gridRow: 2 }}>
                  <ContainerCard container={EVENT_BUS} />
                </div>
              </div>
            </div>
          </div>
        </Reveal>

        <Reveal delay={250}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[0.7rem] text-slate-400">
            <span className="flex items-center gap-2">
              <svg width="32" height="10">
                <line x1="0" y1="5" x2="30" y2="5" stroke={EDGE} strokeWidth="1.5" />
              </svg>
              Comunicação síncrona
            </span>
            <span className="flex items-center gap-2">
              <svg width="32" height="10">
                <line x1="0" y1="5" x2="30" y2="5" stroke={EDGE} strokeWidth="1.5" strokeDasharray="5 4" />
              </svg>
              Comunicação assíncrona
            </span>
            <span className="text-slate-300">·</span>
            <span>Protocolo Frontend ↔ Backend em avaliação (REST ou GraphQL)</span>
            <span className="text-slate-300">·</span>
            <span>Notação inspirada no C4 model</span>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
