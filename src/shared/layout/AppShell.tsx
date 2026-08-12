import { useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from '@tanstack/react-router'
import { Syringe, CalendarDays, BarChart3, Bell, Settings, LogOut, User } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import allerviaMark from '@/assets/allervia-mark-light.png'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
import { useNotificationsStore } from '@/features/notification/stores/useNotificationsStore'
import { useUserStore } from '@/shared/stores/useUserStore'
import { Button, Modal } from '@/shared/components'

interface RailItem {
  icon: LucideIcon
  path: string
  label: string
  match?: string[]
}

const RAIL: RailItem[] = [
  { icon: Syringe, path: '/immunotherapies', label: 'Imunoterapias Alérgicas', match: ['/add-immunotherapy', '/patient'] },
  { icon: CalendarDays, path: '/appointments', label: 'Agendamentos' },
  { icon: BarChart3, path: '/dashboard', label: 'Painel de Métricas', match: ['/export-report'] },
  { icon: Bell, path: '/notifications', label: 'Notificações' },
  {
    icon: Settings,
    path: '/settings',
    label: 'Configurações',
    match: ['/security', '/teams', '/help', '/advanced-settings', '/personalization', '/about', '/plans', '/profile'],
  },
]

export function AppShell({ children }: { children: ReactNode }) {
  const location = useLocation()
  const navigate = useNavigate()
  const path = location.pathname
  const hasUnread = useNotificationsStore((s) => s.notifications.some((n) => !n.read))
  const userName = useUserStore((s) => s.current.name)
  const userInstitution = useUserStore((s) => s.current.institution)
  const [showLogout, setShowLogout] = useState(false)

  const isActive = (r: RailItem) =>
    path === r.path || path.startsWith(r.path + '/') || (r.match?.some((m) => path.startsWith(m)) ?? false)

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden" style={{ background: '#eef1f2' }}>
      {/* teal glows top (system palette) */}
      <div aria-hidden="true" className="pointer-events-none absolute" style={{ top: -160, left: 100, width: 900, height: 420, background: 'radial-gradient(closest-side, rgba(108,158,165,0.42), rgba(108,158,165,0))', filter: 'blur(50px)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute" style={{ top: -120, left: 520, width: 700, height: 380, background: 'radial-gradient(closest-side, rgba(155,193,196,0.40), rgba(155,193,196,0))', filter: 'blur(55px)' }} />
      <div aria-hidden="true" className="pointer-events-none absolute" style={{ top: -60, left: 40, width: 520, height: 300, background: 'radial-gradient(closest-side, rgba(37,126,140,0.28), rgba(37,126,140,0))', filter: 'blur(60px)' }} />

      {/* header chrome */}
      <div className="relative z-10 flex items-center justify-between px-6 pt-5 mb-5">
        <Link to="/immunotherapies" className="flex items-center gap-4 no-underline">
          <div className="flex w-14 shrink-0 justify-center">
            <img src={allerviaMark} alt="Allervia" className="h-8 w-8 object-contain" />
          </div>
          <AllerviaWordmark className="text-lg" style={{ color: '#12333a' }} />
        </Link>
        <Link to="/profile" aria-label="Perfil" className="flex items-center gap-3 no-underline group">
          <div className="flex flex-col items-end leading-tight">
            <span className="text-[0.82rem] font-bold" style={{ color: '#12333a' }}>{userName}</span>
            <span className="text-[0.68rem] font-medium" style={{ color: '#8b93a9' }}>{userInstitution}</span>
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full transition-transform duration-200 group-hover:scale-105"
            style={{ background: 'linear-gradient(140deg,#9BC1C4,#4d7e85)', boxShadow: '0 4px 12px rgba(16,50,60,0.16)' }}
          >
            <User size={17} strokeWidth={2} style={{ color: '#ffffff' }} />
          </div>
        </Link>
      </div>

      {/* body: rail + page content */}
      <div className="relative z-10 flex flex-1 min-h-0 gap-4 px-6 pb-4">
        {/* rail */}
        <div className="relative z-50 flex shrink-0 flex-col items-center justify-between w-14 pb-1">
          <div className="flex flex-col gap-3">
            {RAIL.map((r) => {
              const Ic = r.icon
              const active = isActive(r)
              return (
                <Link
                  key={r.path}
                  to={r.path}
                  aria-label={r.label}
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-200 hover:scale-105 no-underline"
                  style={
                    active
                      ? { background: 'linear-gradient(150deg,#257E8C,#12333a)', boxShadow: '0 6px 16px rgba(16,60,68,0.30)' }
                      : { background: 'rgba(255,255,255,0.6)', boxShadow: '0 4px 12px rgba(16,50,60,0.08)' }
                  }
                >
                  <Ic size={18} strokeWidth={1.9} style={{ color: active ? '#ffffff' : '#7d879f' }} />
                  {r.path === '/notifications' && hasUnread && (
                    <span
                      aria-hidden="true"
                      className="absolute top-0.5 right-1 h-2 w-2 rounded-full"
                      style={{ background: '#e0453c', boxShadow: '0 0 0 2px #eef1f2' }}
                    />
                  )}
                  <span
                    className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md px-2 py-1 text-[0.7rem] font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-50"
                    style={{ background: '#12333a', color: '#eef3f4', boxShadow: '0 4px 12px rgba(16,50,60,0.2)' }}
                  >
                    {r.label}
                  </span>
                </Link>
              )
            })}
          </div>
          <button
            type="button"
            onClick={() => setShowLogout(true)}
            aria-label="Sair"
            className="group relative flex h-11 w-11 items-center justify-center rounded-full cursor-pointer transition-transform duration-200 hover:scale-105"
            style={{ background: 'rgba(255,255,255,0.6)', boxShadow: '0 4px 12px rgba(16,50,60,0.08)' }}
          >
            <LogOut size={18} strokeWidth={1.9} style={{ color: '#7d879f' }} />
            <span
              className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md px-2 py-1 text-[0.7rem] font-medium opacity-0 transition-opacity duration-200 group-hover:opacity-100 z-50"
              style={{ background: '#12333a', color: '#eef3f4', boxShadow: '0 4px 12px rgba(16,50,60,0.2)' }}
            >
              Sair
            </span>
          </button>
        </div>

        {/* content */}
        <div className="relative flex flex-1 min-h-0">{children}</div>
      </div>

      <Modal
        open={showLogout}
        onClose={() => setShowLogout(false)}
        size="sm"
        title="Encerrar sessão"
        icon={<LogOut size={16} />}
        tone="danger"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowLogout(false)}>Cancelar</Button>
            <Button tone="danger" variant="solid" onClick={() => { setShowLogout(false); navigate({ to: '/login' }) }}>Encerrar sessão</Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">
          Você será desconectado do Allervia e redirecionado para a tela de login. Continuar?
        </p>
      </Modal>
    </div>
  )
}
