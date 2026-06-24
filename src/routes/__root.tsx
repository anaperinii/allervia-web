import { createRootRoute, Link, Outlet, useLocation, useNavigate } from '@tanstack/react-router'
import { Header } from '@/shared/layout/header'
import { Sidebar } from '@/shared/layout/sidebar'
import { useState, useEffect } from 'react'
import { User } from 'lucide-react'
import { ToastViewport } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { useUserStore } from '@/shared/stores/useUserStore'
import imunecareLogo from '@/assets/imunecare-logo.png'

const publicRoutes = ['/', '/login', '/register', '/trial', '/forgot-password']
const authRoutes = ['/login', '/register', '/forgot-password']
const noHeaderRoutes = ['/trial']

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
      <img src={imunecareLogo} alt="ImuneCare" className="h-10 w-10 rounded-full object-contain" />
    </Link>
  )
}

function FloatingProfile() {
  const navigate = useNavigate()
  const current = useUserStore((s) => s.current)
  return (
    <button
      type="button"
      aria-label="Meu perfil"
      onClick={() => navigate({ to: '/profile' })}
      className="group fixed bottom-5 left-5 z-30 flex h-14 w-14 items-center justify-center"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200/70 bg-white text-slate-500 shadow-[0_2px_8px_rgba(15,23,42,0.06)] transition-all duration-200 group-hover:bg-slate-50 group-hover:text-slate-700">
        <User size={18} strokeWidth={2} />
      </span>
      <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-[0.7rem] font-medium text-white opacity-0 shadow-md transition-opacity duration-200 group-hover:opacity-100">
        {current.name}
      </span>
    </button>
  )
}

function RootComponent() {
  const location = useLocation()
  const isPublicRoute = publicRoutes.includes(location.pathname)
  const isAuthRoute = authRoutes.includes(location.pathname)
  const hideHeader = noHeaderRoutes.includes(location.pathname)
  const hasHero = location.pathname === '/'

  if (isPublicRoute) {
    return (
      <div className="min-h-screen">
        {!hideHeader && <Header isAuthPage={isAuthRoute} hasHero={hasHero} />}
        {isAuthRoute ? (
          <Outlet />
        ) : (
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        )}
        <ToastViewport />
      </div>
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
