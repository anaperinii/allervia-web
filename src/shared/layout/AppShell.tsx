import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  faArrowLeft,
  faBell,
  faCalendarDays,
  faChartColumn,
  faCircleInfo,
  faCircleQuestion,
  faCreditCard,
  faDesktop,
  faGear,
  faShield,
  faSliders,
  faUser,
  faUsers,
  faRightFromBracket,
  faSyringe,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import allerviaMark from '@/assets/allervia-mark-light.png'
import userAvatar from '@/assets/user-avatar.jpg'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
import { Button, Modal } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { CircleButton, SHOWCASE } from '@/shared/components/showcase'
import { useNotificationsStore } from '@/features/notification/stores/useNotificationsStore'
import { useHasPermission, useUserStore, type Permission } from '@/shared/stores/useUserStore'

const DARK_INK = '#DCE1E5'
const RAIL_ACTIVE_BACKGROUND = 'linear-gradient(150deg, #257E8C, #12333a)'
const RAIL_ACTIVE_SHADOW = '0 6px 16px rgba(16,60,68,0.28)'

interface RailItem {
  icon: IconDefinition
  path: string
  label: string
  match?: string[]
}

const RAIL: RailItem[] = [
  { icon: faSyringe, path: '/immunotherapies', label: 'Imunoterapias', match: ['/add-immunotherapy', '/patient'] },
  { icon: faCalendarDays, path: '/appointments', label: 'Agendamentos' },
  { icon: faChartColumn, path: '/dashboard', label: 'Painel de Métricas', match: ['/export-report'] },
  { icon: faBell, path: '/notifications', label: 'Notificações' },
]

interface SettingsLink {
  icon: IconDefinition
  path: string
  label: string
  requires?: Permission
}

const SETTINGS_LINKS: SettingsLink[] = [
  { icon: faUser, path: '/profile', label: 'Perfil' },
  { icon: faShield, path: '/security', label: 'Segurança' },
  { icon: faSliders, path: '/advanced-settings', label: 'Avançado', requires: 'advanced_settings' },
  { icon: faDesktop, path: '/personalization', label: 'Aparência' },
  { icon: faUsers, path: '/teams', label: 'Equipes', requires: 'manage_team' },
  { icon: faCreditCard, path: '/plans', label: 'Planos', requires: 'manage_team' },
  { icon: faCircleQuestion, path: '/help', label: 'Ajuda' },
  { icon: faCircleInfo, path: '/about', label: 'Sobre' },
]

function greeting(hour: number) {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
}

function RailLink({
  item,
  active,
  badge,
  dark = false,
}: {
  item: RailItem
  active: boolean
  badge?: number
  dark?: boolean
}) {
  return (
    <Link
      to={item.path}
      aria-label={item.label}
      className="group relative flex h-12 w-12 items-center justify-center rounded-full no-underline transition-all duration-300 hover:scale-105"
      style={{
        background: active ? RAIL_ACTIVE_BACKGROUND : dark ? 'rgba(220,225,229,0.10)' : SHOWCASE.white,
        color: active ? SHOWCASE.white : dark ? DARK_INK : SHOWCASE.inkSoft,
        border: active ? '1px solid transparent' : `1px solid ${dark ? 'rgba(220,225,229,0.20)' : SHOWCASE.line}`,
        boxShadow: active ? RAIL_ACTIVE_SHADOW : undefined,
      }}
    >
      <FontAwesomeIcon icon={item.icon} style={{ fontSize: 13 }} />
      {badge !== undefined && badge > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.55rem] font-bold"
          style={{ background: SHOWCASE.danger, color: '#FFFFFF' }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      <span
        className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md px-2 py-1 text-[0.7rem] font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-50"
        style={{ background: SHOWCASE.ink, color: '#eef3f4' }}
      >
        {item.label}
      </span>
    </Link>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const unreadCount = useNotificationsStore((s) => s.notifications.filter((n) => !n.read).length)
  const userName = useUserStore((s) => s.current.name)
  const [showLogout, setShowLogout] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)

  const canAdvancedSettings = useHasPermission('advanced_settings')
  const canManageTeam = useHasPermission('manage_team')
  const visibleSettingsLinks = SETTINGS_LINKS.filter((link) =>
    link.requires === 'advanced_settings' ? canAdvancedSettings : link.requires === 'manage_team' ? canManageTeam : true,
  )

  const isActive = (item: RailItem) =>
    path === item.path || path.startsWith(item.path + '/') || (item.match?.some((m) => path.startsWith(m)) ?? false)

  const pageScroll = path === '/dashboard'


  return (
    <div
      className="h-screen w-full overflow-hidden"
      style={{
        background: `linear-gradient(to bottom, #DFE5E5 0%, ${SHOWCASE.canvas} 42%), ${SHOWCASE.canvas}`,
      }}
    >
      <div
        data-app-scroll={pageScroll ? '' : undefined}
        className={cn(
          'w-full',
          pageScroll ? 'h-full overflow-y-auto' : 'flex h-full flex-col overflow-hidden px-8 py-6',
        )}
      >
        <div className={cn('flex items-center gap-4 shrink-0', pageScroll ? 'px-8 pt-6 pb-4' : 'mb-4')}>
          <div className="flex flex-1 items-center min-w-0 overflow-hidden">
            <Link to="/immunotherapies" className="ml-1.5 flex items-center no-underline shrink-0">
              {pageScroll ? (
                <span aria-hidden="true" className="h-9 w-9 shrink-0" />
              ) : (
                <img src={allerviaMark} alt="Allervia" className="h-9 w-9 object-contain" />
              )}
              <AllerviaWordmark className="ml-6 text-lg" style={{ color: SHOWCASE.ink }} />
            </Link>
          </div>

          {pageScroll && (
            <span className="fixed left-9.5 top-6 z-40 block h-9 w-9">
              <Link to="/immunotherapies" aria-label="Allervia" className="block no-underline">
                <img
                  src={allerviaMark}
                  alt="Allervia"
                  className="h-9 w-9 object-contain"
                />
              </Link>
            </span>
          )}

          <div className="flex shrink-0 items-center gap-3">
            <div
              className={cn(
                'flex items-center gap-2 rounded-full backdrop-blur-md transition-all duration-500 ease-out',
                settingsOpen ? 'pl-3 pr-1 py-0.5' : 'p-0',
              )}
              style={{
                background: settingsOpen ? 'rgba(255,255,255,0.45)' : 'transparent',
                border: settingsOpen ? '1px solid rgba(255,255,255,0.65)' : '1px solid transparent',
              }}
            >
              <div
                className={cn(
                  'group/settings flex items-center gap-1.5 overflow-hidden transition-all duration-500 ease-out',
                  settingsOpen ? 'max-w-5xl opacity-100 translate-x-0' : 'max-w-0 opacity-0 translate-x-8',
                )}
              >
                {visibleSettingsLinks.map((link) => {
                  const current = path === link.path
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      aria-current={current ? 'page' : undefined}
                      className="flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-[0.66rem] font-medium whitespace-nowrap no-underline transition-all duration-300 group-hover/settings:blur-[1.5px] group-hover/settings:opacity-55 hover:blur-none! hover:opacity-100!"
                      style={{
                        background: current ? SHOWCASE.ink : SHOWCASE.white,
                        border: current ? '1px solid transparent' : `1px solid ${SHOWCASE.line}`,
                        color: current ? SHOWCASE.onAccent : SHOWCASE.inkSoft,
                      }}
                    >
                      <FontAwesomeIcon icon={link.icon} style={{ fontSize: 10 }} />
                      {link.label}
                    </Link>
                  )
                })}
              </div>

              <CircleButton
                icon={faGear}
                size={40}
                iconSize={13}
                active={settingsOpen}
                activeBackground={RAIL_ACTIVE_BACKGROUND}
                activeShadow={RAIL_ACTIVE_SHADOW}
                iconRotateDeg={settingsOpen ? 180 : 0}
                aria-label="Configurações"
                aria-expanded={settingsOpen}
                onClick={() => setSettingsOpen((open) => !open)}
              />
            </div>
            <Link to="/profile" aria-label="Perfil" className="flex items-center no-underline">
              <img
                src={userAvatar}
                alt={userName}
                title={userName}
                className="relative z-10 h-10 w-10 rounded-full object-cover"
                style={{ border: `2px solid ${SHOWCASE.white}` }}
              />
              <span
                className="-ml-10 flex h-10 flex-col justify-center whitespace-nowrap rounded-full pl-12 pr-5 backdrop-blur-md"
                style={{
                  background: 'rgba(255,255,255,0.45)',
                  border: '1px solid rgba(255,255,255,0.65)',
                  color: SHOWCASE.ink,
                }}
              >
                <span className="text-[0.62rem] font-medium leading-tight" style={{ color: SHOWCASE.inkSoft }}>
                  {greeting(new Date().getHours())}
                </span>
                <span className="text-[0.72rem] font-semibold leading-tight">{userName}</span>
              </span>
            </Link>
          </div>
        </div>

        <div className={cn('flex gap-5', pageScroll ? 'px-8' : 'flex-1 min-h-0')}>
          {pageScroll && <div aria-hidden="true" className="w-12 shrink-0" />}
          <div
            className={cn(
              'flex w-12 shrink-0 flex-col items-center pt-6',
              pageScroll ? 'fixed left-8 top-20 z-52 h-[calc(100vh-6.5rem)]' : 'relative z-50',
            )}
          >
            <span data-rail-item="" className="block">
              <CircleButton
                icon={faArrowLeft}
                size={48}
                iconSize={13}
                onClick={() => window.history.back()}
                aria-label="Voltar"
                title="Voltar"
              />
            </span>

            <div className="mt-8 flex flex-col gap-1">
              {RAIL.map((item) => (
                <span key={item.path} data-rail-item="" className="block">
                  <RailLink
                    item={item}
                    active={isActive(item)}
                    badge={item.path === '/notifications' ? unreadCount : undefined}
                  />
                </span>
              ))}
            </div>

            <div className="mt-auto pt-8">
              <span data-rail-item="" className="block">
                <CircleButton
                  icon={faRightFromBracket}
                  size={48}
                  iconSize={13}
                  onClick={() => setShowLogout(true)}
                  aria-label="Sair"
                  title="Sair"
                />
              </span>
            </div>
          </div>

          <main
            className={cn(
              'flex min-w-0 flex-1 flex-col',
              pageScroll ? 'min-h-[calc(100vh-6.5rem)]' : 'overflow-y-auto',
            )}
          >
            {children}
          </main>
        </div>
      </div>

      <Modal
        open={showLogout}
        onClose={() => setShowLogout(false)}
        size="sm"
        title="Encerrar sessão"
        icon={<FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 16 }} />}
        tone="danger"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowLogout(false)}>
              Cancelar
            </Button>
            <Button
              tone="danger"
              variant="solid"
              onClick={() => {
                setShowLogout(false)
                navigate({ to: '/login' })
              }}
            >
              Encerrar sessão
            </Button>
          </>
        }
      >
        <p className="text-sm" style={{ color: SHOWCASE.inkSoft }}>
          Tem certeza que deseja encerrar a sessão?
        </p>
      </Modal>
    </div>
  )
}
