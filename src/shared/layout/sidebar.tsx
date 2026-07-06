import { Link, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import {
  Home,
  Syringe,
  CalendarDays,
  BarChart3,
  Bell,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { AllerviaLogo } from '@/features/landing-page/components/AllerviaLogo'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'
import { useSidebarStore } from '@/shared/layout/useSidebarStore'
import { SidebarProfile } from '@/shared/layout/SidebarProfile'

interface SidebarItem {
  icon: LucideIcon
  label: string
  path: string
  matchPaths?: string[]
}

const ITEMS: SidebarItem[] = [
  { icon: Home, label: 'Início', path: '/home' },
  { icon: Syringe, label: 'Imunoterapias', path: '/immunotherapies', matchPaths: ['/add-immunotherapy'] },
  { icon: CalendarDays, label: 'Agendamentos', path: '/appointments' },
  { icon: BarChart3, label: 'Dashboard', path: '/dashboard', matchPaths: ['/export-report'] },
  { icon: Bell, label: 'Notificações', path: '/notifications' },
  {
    icon: Settings,
    label: 'Configurações',
    path: '/settings',
    matchPaths: ['/security', '/teams', '/help', '/advanced-settings', '/personalization', '/about', '/plans', '/profile'],
  },
]

interface SidebarLinkProps {
  item: SidebarItem
  isActive: boolean
  isCollapsed: boolean
}

function SidebarLink({ item, isActive, isCollapsed }: SidebarLinkProps) {
  const Icon = item.icon
  return (
    <Link
      to={item.path}
      aria-label={item.label}
      className={cn(
        'group relative flex items-center rounded-xl transition-all duration-200 no-underline',
        isCollapsed ? 'h-10 w-10 justify-center mx-auto' : 'h-10 gap-3 px-3',
      )}
      style={{
        background: isActive
          ? 'linear-gradient(90deg, rgba(255,255,255,0.16) 0%, rgba(255,255,255,0.05) 55%, rgba(255,255,255,0) 100%)'
          : 'transparent',
        color: isActive ? '#DCE1E5' : 'rgba(220,225,229,0.65)',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
          e.currentTarget.style.color = '#DCE1E5'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'rgba(220,225,229,0.65)'
        }
      }}
    >
      <Icon size={18} strokeWidth={1.8} className="shrink-0" />
      {!isCollapsed && <span className="text-[0.8rem] font-medium whitespace-nowrap">{item.label}</span>}
      {isCollapsed && (
        <span
          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md px-2 py-1 text-[0.7rem] font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-50"
          style={{
            background: 'rgba(8,25,29,0.95)',
            color: '#DCE1E5',
            border: '1px solid rgba(220,225,229,0.12)',
          }}
        >
          {item.label}
        </span>
      )}
    </Link>
  )
}

export function Sidebar() {
  const location = useLocation()
  const isCollapsed = useSidebarStore((s) => s.isCollapsed)
  const toggle = useSidebarStore((s) => s.toggle)
  const { selectedPatient, setSelectedPatient } = usePatientStore()

  useEffect(() => {
    if (selectedPatient && !location.pathname.startsWith('/patient')) {
      setSelectedPatient(null)
    }
  }, [location.pathname, selectedPatient, setSelectedPatient])

  return (
    <aside
      className={cn(
        'relative z-10 m-2 flex flex-col shrink-0 rounded-xl transition-[width] duration-300 ease-out',
        isCollapsed ? 'w-16' : 'w-52',
      )}
      style={{
        background:
          'linear-gradient(180deg, #0e353d 0%, #08191d 100%)',
        boxShadow: '0 6px 24px rgba(0,0,0,0.28)',
      }}
    >
      <Link
        to="/home"
        className={cn(
          'flex items-center no-underline transition-all duration-300',
          isCollapsed ? 'justify-center h-17 px-0' : 'gap-2.5 h-17 px-5',
        )}
      >
        <AllerviaLogo size={28} color="#B4D6D8" className="opacity-90 drop-shadow-[0_0_9px_rgba(155,193,196,0.4)]" />
        {!isCollapsed && (
          <span
            className="text-base font-semibold tracking-[2px]"
            style={{ color: '#DCE1E5' }}
          >
            ALLERVIA
          </span>
        )}
      </Link>

      <nav className="flex-1 flex flex-col gap-1 mt-2 px-3 overflow-visible min-h-0">
        {ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.matchPaths?.includes(location.pathname) ?? false)
          return (
            <SidebarLink
              key={item.path}
              item={item}
              isActive={isActive}
              isCollapsed={isCollapsed}
            />
          )
        })}
      </nav>

      <div
        className="relative p-3 pb-5"
        style={{ borderTop: '1px solid rgba(220,225,229,0.06)' }}
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle, rgba(220,225,229,0.4) 1.1px, transparent 1.6px)',
            backgroundSize: '14px 14px',
            backgroundPosition: 'center bottom',
            WebkitMaskImage:
              'radial-gradient(130% 110% at 50% 100%, #000 0%, rgba(0,0,0,0.4) 35%, transparent 72%)',
            maskImage:
              'radial-gradient(130% 110% at 50% 100%, #000 0%, rgba(0,0,0,0.4) 35%, transparent 72%)',
          }}
        />
        <div className="relative">
          <SidebarProfile isCollapsed={isCollapsed} />
        </div>
      </div>

      <button
        type="button"
        onClick={toggle}
        aria-label={isCollapsed ? 'Expandir menu' : 'Colapsar menu'}
        className="absolute top-20 right-0 translate-x-[55%] flex h-7 w-7 items-center justify-center rounded-full overflow-hidden transition-all duration-200 z-30 cursor-pointer hover:scale-110"
        style={{
          background:
            'radial-gradient(circle at 20% 22%, rgba(255,255,255,0.28) 0%, transparent 40%), radial-gradient(circle at 80% 18%, rgba(255,255,255,0.16) 0%, transparent 45%), radial-gradient(circle at 78% 82%, rgba(255,255,255,0.22) 0%, transparent 45%), radial-gradient(circle at 22% 80%, rgba(255,255,255,0.14) 0%, transparent 42%), rgba(255,255,255,0.03)',
          color: '#EDF2F3',
          border: '1px solid rgba(255,255,255,0.22)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow:
            'inset 0 0 14px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.20)',
        }}
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
      </button>
    </aside>
  )
}
