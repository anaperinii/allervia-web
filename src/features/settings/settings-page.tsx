import { Link } from '@tanstack/react-router'
import { useUserStore, ROLE_PERMISSIONS, type Permission } from '@/shared/stores/useUserStore'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCircleInfo, faCircleQuestion, faCreditCard, faDesktop, faGear, faShield, faUser, faUsers } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

// single dark teal for the right-side gradient of each card
const CARD_TEAL = '29,103,114'

interface SettingsOption {
  icon: IconDefinition
  label: string
  description: string
  route?: string
  requires?: Permission
}

const settingsOptions: SettingsOption[] = [
  { icon: faUser, label: 'Seu Perfil', description: 'Seus dados, cargo e preferências', route: '/profile' },
  { icon: faShield, label: 'Segurança e Privacidade', description: 'Autenticação, sessões e políticas de acesso', route: '/security' },
  { icon: faGear, label: 'Configurações Avançadas', description: 'Parâmetros técnicos e integrações', route: '/advanced-settings', requires: 'advanced_settings' },
  { icon: faDesktop, label: 'Personalização e Acessibilidade', description: 'Temas, idioma, contraste e tamanho de fonte', route: '/personalization' },
  { icon: faCircleInfo, label: 'Sobre o Sistema', description: 'Versão, licença e informações técnicas', route: '/about' },
  { icon: faUsers, label: 'Gerenciar Equipes e Convites', description: 'Membros, permissões e convites pendentes', route: '/teams', requires: 'manage_team' },
  { icon: faCreditCard, label: 'Planos e Serviços', description: 'Assinatura, faturamento e limites', route: '/plans', requires: 'manage_team' },
  { icon: faCircleQuestion, label: 'Ajuda', description: 'Central de ajuda, documentação e suporte', route: '/help' },
]

export function SettingsPage() {
  const current = useUserStore((s) => s.current)
  const permissions = ROLE_PERMISSIONS[current.role]
  const visibleOptions = settingsOptions.filter((o) => !o.requires || permissions.includes(o.requires))

  return (
    <SettingsLayout>
      <div className="grid grid-cols-1 gap-2">
        {visibleOptions.map((option) => {
          const Icon = option.icon
          return (
            <Link
              key={option.label}
              to={option.route!}
              className="group relative flex h-full flex-row items-center gap-4 overflow-hidden rounded-xl border border-(--border-custom) pl-5 pr-4 py-2.5 transition-all duration-300 hover:-translate-y-0.5"
              style={{
                background: '#ffffff',
                boxShadow: '0 6px 18px -14px rgba(16,60,68,0.18)',
              }}
            >
              <span aria-hidden="true" className="absolute left-0 top-0 bottom-0 w-1" style={{ background: `rgb(${CARD_TEAL})` }} />
              <FontAwesomeIcon icon={Icon} className="shrink-0 text-brand transition-transform duration-300 group-hover:scale-105" style={{ fontSize: 15 }} />
              <div className="min-w-0 flex-1">
                <div className="text-[0.82rem] font-semibold text-slate-800">{option.label}</div>
                <div className="text-[0.7rem] text-slate-500 truncate">{option.description}</div>
              </div>
              <FontAwesomeIcon
                icon={faArrowRight}
                className="shrink-0 text-slate-300 transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-brand"
                style={{ fontSize: 14 }}
              />
            </Link>
          )
        })}
      </div>
    </SettingsLayout>
  )
}
