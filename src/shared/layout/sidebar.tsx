import { Link, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import {
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
import allerviaMark from '@/assets/allervia-mark-light.png'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
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
        background: isActive ? 'rgba(18,51,58,0.82)' : 'transparent',
        color: isActive ? '#ffffff' : 'rgba(18,51,58,0.6)',
        boxShadow: isActive ? '0 2px 10px rgba(16,60,68,0.16)' : 'none',
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'rgba(37,126,140,0.07)'
          e.currentTarget.style.color = '#12333a'
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.background = 'transparent'
          e.currentTarget.style.color = 'rgba(18,51,58,0.6)'
        }
      }}
    >
      <Icon size={16} strokeWidth={1.8} className="shrink-0" />
      {!isCollapsed && <span className="text-[0.8rem] font-medium whitespace-nowrap">{item.label}</span>}
      {isCollapsed && (
        <span
          className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md px-2 py-1 text-[0.7rem] font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-50"
          style={{
            background: '#12333a',
            color: '#eef3f4',
            border: '1px solid rgba(16,113,129,0.2)',
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
        'relative z-10 h-full flex flex-col shrink-0 transition-[width] duration-300 ease-out',
        isCollapsed ? 'w-16' : 'w-52',
      )}
      style={{
        background:
          'radial-gradient(120% 90% at 22% 92%, rgba(155,193,196,0.55) 0%, rgba(155,193,196,0.28) 38%, rgba(205,220,222,0.96) 78%, #dfe7e8 100%)',
      }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[68%]"
        style={{
          backdropFilter: 'blur(14px)',
          WebkitBackdropFilter: 'blur(14px)',
          background:
            'linear-gradient(to top, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.22) 55%, rgba(255,255,255,0) 100%)',
          maskImage: 'linear-gradient(to top, #000 0%, #000 45%, transparent 100%)',
          WebkitMaskImage: 'linear-gradient(to top, #000 0%, #000 45%, transparent 100%)',
        }}
      />

      <Link
        to="/immunotherapies"
        className={cn(
          'relative flex items-center no-underline transition-all duration-300',
          isCollapsed ? 'justify-center h-14 px-0' : 'h-14 pl-5 pr-5',
        )}
      >
        <img src={allerviaMark} alt="Allervia" className="h-8 w-8 shrink-0 object-contain" />
        {!isCollapsed && (
          <AllerviaWordmark className="absolute left-1/2 -translate-x-[62%] text-lg" style={{ color: '#12333a' }} />
        )}
      </Link>

      <div
        aria-hidden="true"
        className="relative mx-3 h-px"
        style={{ background: 'rgba(16,113,129,0.12)' }}
      />

      <nav className="relative flex-1 flex flex-col gap-1 mt-3 px-3 overflow-visible min-h-0">
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
        style={{ borderTop: '1px solid rgba(16,113,129,0.12)' }}
      >
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
          background: '#ffffff',
          color: '#12333a',
          border: '1px solid rgba(16,113,129,0.18)',
          boxShadow: '0 4px 12px rgba(16,60,68,0.16)',
        }}
      >
        {isCollapsed ? <ChevronRight size={14} strokeWidth={2.5} /> : <ChevronLeft size={14} strokeWidth={2.5} />}
      </button>
    </aside>
  )
}
