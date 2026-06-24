import { Link, useLocation } from '@tanstack/react-router'
import { useEffect } from 'react'
import { Home, Syringe, CalendarDays, BarChart3, Bell, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'

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

function SidebarLink({ item, isActive }: { item: SidebarItem; isActive: boolean }) {
  const Icon = item.icon
  return (
    <Link
      to={item.path}
      className={cn(
        'group relative flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200',
        isActive
          ? 'bg-brand text-white shadow-[0_4px_12px_rgba(20,184,166,0.35)]'
          : 'text-slate-400 hover:bg-slate-100 hover:text-slate-700',
      )}
      aria-label={item.label}
    >
      <Icon size={18} strokeWidth={2} />
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[0.7rem] font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
        {item.label}
      </span>
    </Link>
  )
}

export function Sidebar() {
  const location = useLocation()
  const { selectedPatient, setSelectedPatient } = usePatientStore()

  useEffect(() => {
    if (selectedPatient && !location.pathname.startsWith('/patient')) {
      setSelectedPatient(null)
    }
  }, [location.pathname, selectedPatient, setSelectedPatient])

  return (
    <aside className="fixed left-5 top-1/2 z-30 -translate-y-1/2 flex w-14 flex-col items-center gap-1.5 rounded-full border border-slate-200/70 bg-white py-4 shadow-[0_8px_32px_rgba(15,23,42,0.06)]">
      <nav className="flex flex-col items-center gap-1.5">
        {ITEMS.map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.matchPaths?.includes(location.pathname) ?? false)
          return <SidebarLink key={item.path} item={item} isActive={isActive} />
        })}
      </nav>
    </aside>
  )
}
