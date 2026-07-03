import { createRootRoute, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { Header } from '@/shared/layout/header'
import { Sidebar } from '@/shared/layout/sidebar'
import { useState, useEffect, useRef } from 'react'
import { Check, LogOut, User, UserCog } from 'lucide-react'
import { ToastViewport } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { useUserStore, PROFILES, ROLE_LABELS } from '@/shared/stores/useUserStore'
import imunecareLogo from '@/assets/imunecare-logo.png'
import { LandingThemeProvider, useLandingTheme } from '@/features/landing-page/theme-context'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((part) => !['Dr.', 'Dra.', 'Dr', 'Dra'].includes(part))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

const publicRoutes = ['/', '/login', '/register', '/trial', '/forgot-password']
const authRoutes = ['/login', '/register', '/forgot-password']
const noHeaderRoutes: string[] = []
const heroRoutes = ['/', '/trial']

function PageTransition({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setVisible(true), 10)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className={cn("transition-opacity duration-300 ease-out flex-1 flex flex-col min-h-0", visible ? "opacity-100" : "opacity-0")}>
      {children}
    </div>
  )
}

function FloatingLogo() {
  return (
    <Link
      to="/home"
      aria-label="Início"
      className="fixed left-5 top-5 z-30 flex h-14 w-14 items-center justify-center"
    >
      <img src={imunecareLogo} alt="Allervia" className="h-10 w-10 rounded-full object-contain" />
    </Link>
  )
}

function FloatingProfile() {
  const navigate = useNavigate()
  const current = useUserStore((s) => s.current)
  const setProfile = useUserStore((s) => s.setProfile)
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleSelectProfile = (id: string) => {
    setProfile(id)
    setOpen(false)
  }

  const handleOpenProfilePage = () => {
    setOpen(false)
    navigate({ to: '/profile' })
  }

  const handleLogout = () => {
    setOpen(false)
    navigate({ to: '/login' })
  }

  return (
    <div ref={containerRef} className="fixed bottom-5 left-5 z-30">
      <button
        type="button"
        aria-label="Meu perfil"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="group flex h-14 w-14 items-center justify-center"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-all duration-200 group-hover:bg-slate-50 group-hover:text-slate-700">
          <User size={18} strokeWidth={2} />
        </span>
      </button>

      {open && (
        <div className="absolute bottom-0 left-full ml-3 w-64 rounded-xl border border-slate-200 bg-white shadow-[0_10px_40px_rgba(15,23,42,0.12)] overflow-hidden">
          <div className="px-3 py-2.5 border-b border-slate-100">
            <div className="text-[0.6rem] uppercase tracking-wider font-semibold text-slate-400">
              Trocar perfil
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {PROFILES.map((profile) => {
              const isActive = profile.id === current.id
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleSelectProfile(profile.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors',
                    isActive ? 'bg-teal-50' : 'hover:bg-slate-50',
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-teal-500 to-cyan-400 text-white text-[0.65rem] font-bold">
                    {getInitials(profile.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 truncate">{profile.name}</div>
                    <div className="text-[0.6rem] text-slate-500">{ROLE_LABELS[profile.role]}</div>
                  </div>
                  {isActive && <Check size={14} className="shrink-0 text-brand" />}
                </button>
              )
            })}
          </div>
          <div className="border-t border-slate-100">
            <button
              type="button"
              onClick={handleOpenProfilePage}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <UserCog size={14} className="text-slate-500" />
              <span className="text-xs font-medium">Meu perfil</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={14} />
              <span className="text-xs font-medium">Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

interface PublicShellProps {
  hideHeader: boolean
  isAuthRoute: boolean
  hasHero: boolean
  pathname: string
}

function PublicShell({ hideHeader, isAuthRoute, hasHero, pathname }: PublicShellProps) {
  const { theme } = useLandingTheme()
  const hideNav = pathname === '/trial'
  return (
    <div data-landing-theme={theme} className="min-h-screen">
      {!hideHeader && <Header isAuthPage={isAuthRoute} hasHero={hasHero} hideNav={hideNav} />}
      {isAuthRoute ? (
        <Outlet />
      ) : (
        <PageTransition key={pathname}>
          <Outlet />
        </PageTransition>
      )}
      <ToastViewport />
    </div>
  )
}

function RootComponent() {
  const location = useLocation()
  const isPublicRoute = publicRoutes.includes(location.pathname)
  const isAuthRoute = authRoutes.includes(location.pathname)
  const hideHeader = noHeaderRoutes.includes(location.pathname)
  const hasHero = heroRoutes.includes(location.pathname)

  if (isPublicRoute) {
    return (
      <LandingThemeProvider>
        <PublicShell
          hideHeader={hideHeader}
          isAuthRoute={isAuthRoute}
          hasHero={hasHero}
          pathname={location.pathname}
        />
      </LandingThemeProvider>
    )
  }

  return (
    <div className="relative h-screen overflow-hidden bg-slate-100">
      <FloatingLogo />
      <Sidebar />
      <FloatingProfile />
      <main className="flex h-full flex-col pl-24">
        <PageTransition key={location.pathname}>
          <Outlet />
        </PageTransition>
      </main>
      <ToastViewport />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
