import {
  KeyRound,
  BarChart3,
  Syringe,
  Globe,
  Bell,
  HeartPulse,
  CalendarDays,
  Settings,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Blob } from '@/features/landing-page/components/Blob'
import { Reveal } from '@/features/landing-page/components/Reveal'
import { DeckHeader } from '@/presentation/slides/DeckHeader'

interface Domain {
  folder: string
  label: string
  icon: LucideIcon
  color: string
  bg: string
  responsibility: string
}

const DOMAINS: Domain[] = [
  { folder: 'landing-page', label: 'Site público', icon: Globe, color: '#EF4444', bg: '#FEE2E2', responsibility: 'Marketing, captação e apresentação do produto' },
  { folder: 'notification', label: 'Notificações', icon: Bell, color: '#F59E0B', bg: '#FEF3C7', responsibility: 'Central de alertas clínicos e de agenda' },
  { folder: 'immunotherapy', label: 'Imunoterapias', icon: Syringe, color: '#14B8A6', bg: '#CCFBF1', responsibility: 'Protocolo SCIT, doses e cadastro de tratamentos' },
  { folder: 'patient', label: 'Pacientes', icon: HeartPulse, color: '#06B6D4', bg: '#CFFAFE', responsibility: 'Prontuário, evolução, conclusão e relatórios' },
  { folder: 'dashboard', label: 'Painel', icon: BarChart3, color: '#3B82F6', bg: '#DBEAFE', responsibility: 'Métricas, gráficos e indicadores clínicos' },
  { folder: 'auth', label: 'Autenticação', icon: KeyRound, color: '#6366F1', bg: '#E0E7FF', responsibility: 'Login, cadastro e recuperação de senha' },
  { folder: 'scheduling', label: 'Agendamento', icon: CalendarDays, color: '#8B5CF6', bg: '#EDE9FE', responsibility: 'Agenda e calendário de aplicações' },
  { folder: 'settings', label: 'Configurações', icon: Settings, color: '#64748B', bg: '#F1F5F9', responsibility: 'Perfil, equipe, planos e preferências' },
]

function DomainCard({ domain }: { domain: Domain }) {
  const Icon = domain.icon
  return (
    <div
      className="flex h-full flex-col gap-2 rounded-xl border-2 px-4 py-3.5 transition-transform duration-300 hover:-translate-y-1"
      style={{
        background: domain.bg,
        borderColor: domain.color,
        boxShadow: '0 2px 8px rgba(15,23,42,0.06)',
      }}
    >
      <div className="flex items-center gap-2">
        <Icon size={18} style={{ color: domain.color }} className="shrink-0" />
        <span className="text-[0.92rem] font-bold leading-tight text-slate-800">{domain.label}</span>
      </div>
      <div className="font-mono text-[0.66rem] font-bold uppercase tracking-wider text-slate-500">
        {domain.folder}/
      </div>
      <p className="text-[0.72rem] leading-snug text-slate-600">{domain.responsibility}</p>
      <span
        className="mt-auto w-fit rounded-md border bg-white px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider"
        style={{ color: domain.color, borderColor: `${domain.color}66` }}
      >
        Domínio · Feature
      </span>
    </div>
  )
}

export function FolderArchitectureSlide() {
  return (
    <section className="relative flex min-h-screen items-center overflow-hidden bg-(--bg2) px-[5%] py-20">
      <Blob className="-top-24 -left-20 w-95 h-95 bg-cyan-100/30" />
      <Blob className="-bottom-28 -right-24 w-105 h-105 bg-teal-200/25" />

      <div className="relative z-10 mx-auto w-full max-w-6xl">
        <Reveal>
          <DeckHeader
            eyebrow="Organização feature-first"
            title="Oito domínios isolados, cada um com responsabilidade única"
            description="Cada feature é auto-contida — toda a UI, estado e regras de um domínio vivem juntos."
          />
        </Reveal>

        <div className="mt-12 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {DOMAINS.map((domain, i) => (
            <Reveal key={domain.folder} delay={i * 70} className="h-full">
              <DomainCard domain={domain} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
