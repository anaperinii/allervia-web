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

const ICON_BOX_SHADOW = '0 2px 6px rgba(20,184,166,0.18), inset 0 1px 0 rgba(255,255,255,0.9)'

const GLASS_CARD_SHADOW = [
  '0 10px 32px rgba(15,23,42,0.08)',
  '0 2px 8px rgba(15,23,42,0.04)',
  'inset 0 1.5px 0 rgba(255,255,255,0.95)',
  'inset 0 -1.5px 3px rgba(15,23,42,0.04)',
  'inset 0 0 0 1px rgba(255,255,255,0.55)',
].join(', ')

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
      <div className="grid grid-cols-3 gap-4">
        {visibleOptions.map((option) => {
          const Icon = option.icon
          return (
            <Link
              key={option.label}
              to={option.route!}
              className="group relative flex h-full flex-row items-center gap-3 overflow-hidden rounded-2xl bg-white/25 px-4 py-7 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/40"
              style={{
                boxShadow: GLASS_CARD_SHADOW,
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
              }}
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/80 text-brand transition-transform duration-300 group-hover:scale-105"
                style={{ boxShadow: ICON_BOX_SHADOW }}
              >
                <Icon size={20} strokeWidth={2.2} />
              </div>
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
