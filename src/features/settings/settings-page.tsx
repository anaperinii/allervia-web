import { Link } from '@tanstack/react-router'
import { hasPermission, useUserStore, type Permission } from '@/shared/stores/useUserStore'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faCircleInfo, faCircleQuestion, faCreditCard, faFlask, faGear, faShield, faUser, faUsers } from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'

const CARD_TEAL = '29,103,114'

interface SettingsOption {
  icon: IconDefinition
  label: string
  description: string
  route?: string
  requires?: Permission
}

interface SettingsSection {
  title: string
  description?: string
  options: SettingsOption[]
}

const settingsSections: SettingsSection[] = [
  {
    title: 'Conta',
    options: [
      { icon: faUser, label: 'Seu Perfil', description: 'Seus dados, cargo e preferências', route: '/profile' },
      { icon: faShield, label: 'Segurança e Privacidade', description: 'Autenticação, sessões e políticas de acesso', route: '/security' },
    ],
  },
  {
    title: 'Clínico',
    description: 'Definições que governam prescrições e recomendações de dose',
    options: [
      { icon: faFlask, label: 'Protocolos de Imunoterapia', description: 'Catálogo, versões, publicação e automação', route: '/protocols', requires: 'adjust_protocol' },
    ],
  },
  {
    title: 'Organização',
    options: [
      { icon: faUsers, label: 'Gerenciar Equipes e Convites', description: 'Membros, permissões e convites pendentes', route: '/teams', requires: 'manage_team' },
      { icon: faCreditCard, label: 'Planos e Serviços', description: 'Assinatura, faturamento e limites', route: '/plans', requires: 'manage_team' },
    ],
  },
  {
    title: 'Sistema',
    options: [
      { icon: faGear, label: 'Configurações Avançadas', description: 'Parâmetros técnicos e integrações', route: '/advanced-settings', requires: 'advanced_settings' },
      { icon: faCircleInfo, label: 'Sobre o Sistema', description: 'Versão, licença e informações técnicas', route: '/about' },
      { icon: faCircleQuestion, label: 'Ajuda', description: 'Central de ajuda, documentação e suporte', route: '/help' },
    ],
  },
]

export function SettingsPage() {
  const capabilities = useUserStore((s) => s.capabilities)
  const visibleSections = settingsSections
    .map((section) => ({
      ...section,
      options: section.options.filter(
        (o) => !o.requires || hasPermission(capabilities, o.requires),
      ),
    }))
    .filter((section) => section.options.length > 0)

  return (
    <SettingsLayout>
      <div className="flex flex-col gap-5">
        {visibleSections.map((section) => (
          <section key={section.title} className="flex flex-col gap-2">
            <div className="px-1">
              <h2 className="text-[0.7rem] font-bold uppercase tracking-wide text-slate-500">
                {section.title}
              </h2>
              {section.description && (
                <p className="mt-0.5 text-[0.65rem] text-slate-400">
                  {section.description}
                </p>
              )}
            </div>
            <div className="grid grid-cols-1 gap-2">
              {section.options.map((option) => {
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
          </section>
        ))}
      </div>
    </SettingsLayout>
  )
}
