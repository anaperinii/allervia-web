import {
  Shield,
  Settings,
  Monitor,
  Info,
  Users,
  CreditCard,
  HelpCircle,
  ArrowRight,
  User,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { useUserStore, ROLE_PERMISSIONS, type Permission } from '@/shared/stores/useUserStore'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'

// single dark teal for the right-side gradient of each card
const CARD_TEAL = '29,103,114'

interface SettingsOption {
  icon: LucideIcon
  label: string
  description: string
  route?: string
  requires?: Permission
}

const settingsOptions: SettingsOption[] = [
  { icon: User, label: 'Seu Perfil', description: 'Seus dados, cargo e preferências', route: '/profile' },
  { icon: Shield, label: 'Segurança e Privacidade', description: 'Autenticação, sessões e políticas de acesso', route: '/security' },
  { icon: Settings, label: 'Configurações Avançadas', description: 'Parâmetros técnicos e integrações', route: '/advanced-settings', requires: 'advanced_settings' },
  { icon: Monitor, label: 'Personalização e Acessibilidade', description: 'Temas, idioma, contraste e tamanho de fonte', route: '/personalization' },
  { icon: Info, label: 'Sobre o Sistema', description: 'Versão, licença e informações técnicas', route: '/about' },
  { icon: Users, label: 'Gerenciar Equipes e Convites', description: 'Membros, permissões e convites pendentes', route: '/teams', requires: 'manage_team' },
  { icon: CreditCard, label: 'Planos e Serviços', description: 'Assinatura, faturamento e limites', route: '/plans', requires: 'manage_team' },
  { icon: HelpCircle, label: 'Ajuda', description: 'Central de ajuda, documentação e suporte', route: '/help' },
]

export function SettingsPage() {
  const current = useUserStore((s) => s.current)
  const permissions = ROLE_PERMISSIONS[current.role]
  const visibleOptions = settingsOptions.filter((o) => !o.requires || permissions.includes(o.requires))

  return (
    <SettingsLayout>
      <div className="grid grid-cols-1 gap-3">
        {visibleOptions.map((option) => {
          const Icon = option.icon
          return (
            <Link
              key={option.label}
              to={option.route!}
              className="group relative flex h-full flex-row items-center gap-5 overflow-hidden rounded-2xl border border-(--border-custom) pl-6 pr-4 py-4 transition-all duration-300 hover:-translate-y-1"
              style={{
                background: '#ffffff',
                boxShadow: '0 8px 24px -14px rgba(16,60,68,0.18)',
              }}
            >
              <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `rgb(${CARD_TEAL})` }} />
              <Icon size={18} strokeWidth={2.2} className="shrink-0 text-brand transition-transform duration-300 group-hover:scale-105" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800">{option.label}</div>
                <div className="mt-0.5 text-[0.78rem] text-slate-500 truncate">{option.description}</div>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
              />
            </Link>
          )
        })}
      </div>
    </SettingsLayout>
  )
}
