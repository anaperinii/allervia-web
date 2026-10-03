import { useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import {
  faBell,
  faCalendarDays,
  faChartColumn,
  faChevronDown,
  faCircleInfo,
  faCircleQuestion,
  faCreditCard,
  faFlask,
  faGear,
  faShield,
  faSliders,
  faTableColumns,
  faUser,
  faUsers,
  faRightFromBracket,
  faSyringe,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import allerviaMark from '@/assets/allervia-mark-light.png'
import { Button, Modal } from '@/shared/components'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
import { cn } from '@/shared/lib/cn'
import { CircleButton, SHOWCASE } from '@/shared/components/showcase'
import { useSidebarStore } from '@/shared/layout/useSidebarStore'
import { useQuery } from '@tanstack/react-query'
import { listNotifications } from '@/shared/api/notifications.api'
import { hasPermission, useUserStore, type Permission } from '@/shared/stores/useUserStore'

const RAIL_ACTIVE_BACKGROUND =
  'linear-gradient(to right, rgba(37,126,140,0.46) 0%, rgba(37,126,140,0.20) 18%, rgba(37,126,140,0.08) 45%, rgba(37,126,140,0.04) 100%)'
const RAIL_ACTIVE_INK = '#10454F'
const RAIL_ACTIVE_MARKER = '#0C343C'
const RAIL_ACTIVE_SOLID = 'linear-gradient(150deg, #257E8C, #12333a)'
const RAIL_ACTIVE_SOLID_SHADOW = '0 6px 16px rgba(16,60,68,0.28)'

const PAGE_BACKGROUND = '#F7FAFA'

const SIDEBAR_BACKGROUND = `linear-gradient(to top,
  #BCD6D8 0%,
  #CFE0E1 26%,
  #DDE5E5 52%,
  #E6EAEA 80%,
  #E6EAEA 100%)`
const SIDEBAR_HOVER = 'rgba(37,126,140,0.10)'
const SIDEBAR_TREE_LINE = 'rgba(18,51,58,0.28)'
const SIDEBAR_SUBITEM_ACTIVE = 'rgba(37,126,140,0.16)'
const LOGOUT_INK = '#B83A30'
const LOGOUT_BACKGROUND = 'rgba(184,58,48,0.10)'
const LOGOUT_BORDER = 'rgba(184,58,48,0.42)'

interface RailItem {
  icon: IconDefinition
  path: string
  label: string
  match?: string[]
}

function greeting(hour: number) {
  if (hour < 12) return 'Bom dia'
  if (hour < 18) return 'Boa tarde'
  return 'Boa noite'
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
  { icon: faFlask, path: '/protocols', label: 'Protocolos', requires: 'adjust_protocol' },
  { icon: faSliders, path: '/advanced-settings', label: 'Avançado', requires: 'advanced_settings' },
  { icon: faUsers, path: '/teams', label: 'Equipes', requires: 'manage_team' },
  { icon: faCreditCard, path: '/plans', label: 'Planos', requires: 'manage_team' },
  { icon: faCircleQuestion, path: '/help', label: 'Ajuda' },
  { icon: faCircleInfo, path: '/about', label: 'Sobre' },
]

function RailLink({
  item,
  active,
  badge,
  collapsed,
  compact = false,
  subtle = false,
}: {
  item: RailItem
  active: boolean
  badge?: number
  collapsed: boolean
  compact?: boolean
  subtle?: boolean
}) {
  const size = compact ? 'h-7.5' : 'h-9'
  const solidActive = collapsed && !subtle
  const activeBackground = subtle
    ? SIDEBAR_SUBITEM_ACTIVE
    : solidActive
      ? RAIL_ACTIVE_SOLID
      : RAIL_ACTIVE_BACKGROUND
  const activeColor = subtle ? SHOWCASE.accent : solidActive ? SHOWCASE.white : RAIL_ACTIVE_INK
  const idleColor = subtle && collapsed ? SHOWCASE.muted : SHOWCASE.inkSoft
  const [tip, setTip] = useState<{ top: number; left: number } | null>(null)
  return (
    <Link
      to={item.path}
      aria-label={item.label}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group relative flex shrink-0 items-center no-underline transition-colors duration-200',
        size,
        collapsed
          ? cn('justify-center rounded-lg', compact ? 'w-7.5' : 'w-9')
          : 'w-full gap-2.5 rounded-lg px-2.5',
      )}
      style={{
        background: active ? activeBackground : 'transparent',
        backgroundClip: 'padding-box',
        color: active ? activeColor : idleColor,
        border: 'none',
        boxShadow: active && solidActive ? RAIL_ACTIVE_SOLID_SHADOW : undefined,
      }}
      onMouseEnter={(e) => {
        if (!active) e.currentTarget.style.background = SIDEBAR_HOVER
        if (collapsed) {
          const rect = e.currentTarget.getBoundingClientRect()
          setTip({ top: rect.top + rect.height / 2, left: rect.right + 12 })
        }
      }}
      onMouseLeave={(e) => {
        if (!active) e.currentTarget.style.background = 'transparent'
        setTip(null)
      }}
    >
      {active && !subtle && !collapsed && (
        <span
          aria-hidden="true"
          className="absolute -left-0.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full"
          style={{ background: RAIL_ACTIVE_MARKER }}
        />
      )}
      <FontAwesomeIcon icon={item.icon} className="shrink-0" style={{ fontSize: compact ? 12 : 14 }} />
      {!collapsed && (
        <span
          className={cn(
            'truncate font-normal whitespace-nowrap',
            compact ? 'text-[0.74rem]' : 'text-[0.85rem]',
          )}
        >
          {item.label}
        </span>
      )}
      {badge !== undefined && badge > 0 && (
        <span
          aria-hidden="true"
          className={cn(
            'flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[0.55rem] font-bold',
            collapsed ? 'absolute -top-0.5 -right-0.5' : 'ml-auto',
          )}
          style={{ background: SHOWCASE.danger, color: '#FFFFFF' }}
        >
          {badge > 9 ? '9+' : badge}
        </span>
      )}
      {collapsed &&
        tip &&
        createPortal(
          <span
            className="pointer-events-none fixed z-100 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[0.7rem] font-medium"
            style={{ top: tip.top, left: tip.left, background: SHOWCASE.ink, color: '#eef3f4' }}
          >
            {item.label}
          </span>,
          document.body,
        )}
    </Link>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const unreadQuery = useQuery({
    queryKey: ['notifications', 'unread-badge'],
    queryFn: ({ signal }) =>
      listNotifications({ page: 1, pageSize: 1, unreadOnly: true }, signal),
    refetchInterval: 60_000,
    retry: false,
  })
  const unreadCount = unreadQuery.data?.unread ?? 0
  const userName = useUserStore((s) => s.current?.name ?? '')
  const [showLogout, setShowLogout] = useState(false)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const collapsed = useSidebarStore((s) => s.isCollapsed)
  const toggleSidebar = useSidebarStore((s) => s.toggle)

  const capabilities = useUserStore((s) => s.capabilities)
  const visibleSettingsLinks = SETTINGS_LINKS.filter(
    (link) => !link.requires || hasPermission(capabilities, link.requires),
  )
  const settingsActive = visibleSettingsLinks.some((link) => path === link.path)

  const isActive = (item: RailItem) =>
    path === item.path || path.startsWith(item.path + '/') || (item.match?.some((m) => path.startsWith(m)) ?? false)

  const pageScroll = path === '/dashboard'


  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: SIDEBAR_BACKGROUND }}
    >
      <aside
        className={cn(
          'relative z-50 flex h-screen shrink-0 flex-col py-5 transition-[width] duration-300 ease-out',
          collapsed ? 'w-18 items-center px-3' : 'w-60 px-4',
        )}
      >
        <div className={cn('flex items-center', collapsed ? 'flex-col gap-3' : 'justify-between gap-2')}>
          <Link to="/immunotherapies" aria-label="Allervia" className="flex items-center gap-1.5 no-underline">
            <img src={allerviaMark} alt="" className="h-7 w-7 shrink-0 object-contain" />
            {!collapsed && (
              <AllerviaWordmark className="text-lg font-extrabold" style={{ color: SHOWCASE.ink }} />
            )}
          </Link>
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={collapsed ? 'Expandir menu' : 'Recolher menu'}
            title={collapsed ? 'Expandir menu' : 'Recolher menu'}
            className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-lg transition-colors duration-200"
            style={{ background: 'transparent', border: 'none', color: SHOWCASE.inkSoft }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = SIDEBAR_HOVER
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent'
            }}
          >
            <FontAwesomeIcon icon={faTableColumns} style={{ fontSize: 15 }} />
          </button>
        </div>

        <nav
          className={cn(
            'mt-6 flex min-h-0 flex-1 flex-col gap-1',
            collapsed ? 'items-center overflow-visible' : 'w-full overflow-visible',
          )}
        >
          {RAIL.map((item) => (
            <span key={item.path} data-rail-item="" className={cn('block', collapsed ? '' : 'w-full')}>
              <RailLink
                item={item}
                active={isActive(item)}
                collapsed={collapsed}
                badge={item.path === '/notifications' ? unreadCount : undefined}
              />
            </span>
          ))}

          <button
            type="button"
            onClick={() => setSettingsOpen((open) => !open)}
            aria-label="Configurações"
            aria-expanded={settingsOpen}
            title="Configurações"
            className={cn(
              'group relative mt-1 flex h-9 shrink-0 cursor-pointer items-center transition-colors duration-200',
              collapsed ? 'w-9 justify-center rounded-lg' : 'w-full gap-2.5 rounded-lg px-2.5',
            )}
            style={{
              background: settingsActive
                ? collapsed
                  ? RAIL_ACTIVE_SOLID
                  : RAIL_ACTIVE_BACKGROUND
                : 'transparent',
              backgroundClip: 'padding-box',
              color: settingsActive
                ? collapsed
                  ? SHOWCASE.white
                  : RAIL_ACTIVE_INK
                : SHOWCASE.inkSoft,
              border: 'none',
              boxShadow: settingsActive && collapsed ? RAIL_ACTIVE_SOLID_SHADOW : undefined,
            }}
            onMouseEnter={(e) => {
              if (!settingsActive) e.currentTarget.style.background = SIDEBAR_HOVER
            }}
            onMouseLeave={(e) => {
              if (!settingsActive) e.currentTarget.style.background = 'transparent'
            }}
          >
            {settingsActive && !collapsed && (
              <span
                aria-hidden="true"
                className="absolute -left-0.5 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full"
                style={{ background: RAIL_ACTIVE_MARKER }}
              />
            )}
            <FontAwesomeIcon icon={faGear} className="shrink-0" style={{ fontSize: 14 }} />
            {!collapsed && (
              <>
                <span className="truncate text-[0.85rem] font-normal whitespace-nowrap">Configurações</span>
                <FontAwesomeIcon
                  icon={faChevronDown}
                  className="ml-auto shrink-0 transition-transform duration-300"
                  style={{ fontSize: 10, transform: settingsOpen ? 'rotate(180deg)' : undefined }}
                />
              </>
            )}
            {collapsed && (
              <span
                className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md px-2 py-1 text-[0.7rem] font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-50"
                style={{ background: SHOWCASE.ink, color: '#eef3f4' }}
              >
                Configurações
              </span>
            )}
          </button>

          {!collapsed ? (
            <div
              className={cn(
                'flex flex-col gap-1 overflow-hidden transition-all duration-300 ease-out',
                settingsOpen ? 'mt-1 max-h-120 opacity-100' : 'max-h-0 opacity-0',
              )}
            >
              <div className="relative ml-4 flex flex-col gap-1 pl-3">
                <span
                  aria-hidden="true"
                  className="absolute left-0 top-0 bottom-0 w-px"
                  style={{ background: SIDEBAR_TREE_LINE }}
                />
                {visibleSettingsLinks.map((link) => {
                  const current = path === link.path
                  return (
                    <span key={link.path} className="relative block w-full">
                      {current && (
                        <span
                          aria-hidden="true"
                          className="absolute -left-3 top-0.5 bottom-0.5 w-0.5 rounded-full"
                          style={{ background: SHOWCASE.accent }}
                        />
                      )}
                      <RailLink
                        item={link}
                        active={current}
                        collapsed={false}
                        compact
                        subtle
                      />
                    </span>
                  )
                })}
              </div>
            </div>
          ) : (
            settingsOpen && (
              <div className="mt-1 flex flex-col items-center">
                <span
                  aria-hidden="true"
                  className="h-3 w-px shrink-0"
                  style={{
                    background: SIDEBAR_TREE_LINE,
                    animation: 'sidebar-slide-down 0.2s ease-out both',
                  }}
                />
                <div className="no-scrollbar mt-1 flex max-h-56 flex-col items-center gap-1 overflow-y-auto">
                  {visibleSettingsLinks.map((link, index) => (
                    <span
                      key={link.path}
                      className="block shrink-0"
                      style={{
                        animation: 'sidebar-slide-down 0.26s ease-out both',
                        animationDelay: `${60 + index * 35}ms`,
                      }}
                    >
                      <RailLink
                        item={link}
                        active={path === link.path}
                        collapsed
                        subtle
                      />
                    </span>
                  ))}
                </div>
              </div>
            )
          )}
        </nav>

        <div
          className={cn(
            'mt-4 flex shrink-0 items-center gap-2 pt-4',
            collapsed ? 'justify-center' : 'w-full justify-between',
          )}
          style={{ borderTop: `1px solid ${SIDEBAR_TREE_LINE}` }}
        >
          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="text-[0.7rem] font-normal leading-tight" style={{ color: SHOWCASE.inkSoft }}>
                {greeting(new Date().getHours())}
              </span>
              <span className="truncate text-[0.8rem] font-semibold leading-tight" style={{ color: SHOWCASE.ink }}>
                {userName}
              </span>
            </span>
          )}

          <span data-rail-item="" className="block shrink-0">
            <CircleButton
              icon={faRightFromBracket}
              size={36}
              iconSize={13}
              onClick={() => setShowLogout(true)}
              aria-label="Sair"
              title="Sair"
              idleBackground={LOGOUT_BACKGROUND}
              idleColor={LOGOUT_INK}
              idleBorderColor={LOGOUT_BORDER}
            />
          </span>
        </div>
      </aside>

      <div
        data-app-scroll={pageScroll ? '' : undefined}
        className={cn(
          'min-w-0 flex-1 rounded-l-2xl',
          pageScroll ? 'overflow-y-auto' : 'flex h-full flex-col overflow-hidden px-8 py-6',
        )}
        style={{ background: PAGE_BACKGROUND, borderLeft: `1px solid ${SHOWCASE.line}` }}
      >
        <main
          className={cn(
            'flex min-w-0 flex-col',
            pageScroll ? 'min-h-full px-8 py-6' : 'flex-1 min-h-0 overflow-y-auto',
          )}
        >
          {children}
        </main>
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
