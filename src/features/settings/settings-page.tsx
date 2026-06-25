import {
  Shield,
  Settings,
  Monitor,
  Info,
  Users,
  CreditCard,
  HelpCircle,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useUserStore, ROLE_LABELS, ROLE_PERMISSIONS, type Permission } from '@/shared/stores/useUserStore'
import { Button } from '@/shared/components'
import { CardButton } from '@/features/settings/components/CardButton'

interface SettingsOption {
  icon: LucideIcon
  label: string
  description: string
  route?: string
  requires?: Permission
}

const settingsOptions: SettingsOption[] = [
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
  const initials = current.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')
  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="flex flex-1 gap-6 p-5 min-h-0 overflow-y-auto">
          {}
          <div className="w-56 shrink-0">
            <h1 className="text-3xl font-bold text-(--text) mb-4">Configurações</h1>

            <div className="border border-(--border-custom) rounded-xl p-4">
              <div className="flex justify-center mb-2.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-cyan-400">
                  <span className="text-lg font-bold text-white">{initials}</span>
                </div>
              </div>

              <div className="text-center mb-3">
                <div className="text-xs font-semibold text-(--text)">{current.name}</div>
                <div className="text-[0.65rem] text-(--text-muted)">{ROLE_LABELS[current.role]}</div>
              </div>

              <Button tone="brand" variant="solid" size="sm" fullWidth to="/profile">
                Seu Perfil
              </Button>
            </div>
          </div>

          {}
          <div className="flex-1 pt-4">
            <div className="space-y-1.5">
              {visibleOptions.map((option) => {
                const Icon = option.icon
                return (
                  <CardButton
                    key={option.label}
                    to={option.route!}
                    icon={<Icon size={17} />}
                    title={option.label}
                    description={option.description}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
