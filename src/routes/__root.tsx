import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { Header } from '@/layout/header'
import { Sidebar } from '@/layout/sidebar'
import { useState, useEffect, createContext, useContext } from 'react'
import { useSidebarStore } from '@/layout/stores/sidebar-store'
import { ToastViewport } from '@/shared/components'
import { cn } from '@/shared/lib/utils'

// ─── Contexto de ano atual ─────────────────────────────────────────────────────
// Permite que qualquer componente reaja à virada de ano sem recarregar a página.
// Os inputs com min/max dinâmicos consomem este contexto indiretamente via
// maxFutureDateStr() e minDateStr(), que usam new Date() e sempre retornam o
// valor correto — mas os componentes precisam re-renderizar para recalcular.

export const CurrentYearContext = createContext(new Date().getFullYear())

/** Hook utilitário: retorna o ano atual reativo. */
export function useCurrentYear() {
  return useContext(CurrentYearContext)
}

/** Calcula ms até meia-noite de 1° de janeiro do próximo ano. */
function msUntilNextYear(): number {
  const now = new Date()
  const nextYearStart = new Date(now.getFullYear() + 1, 0, 1, 0, 0, 0, 0)
  return nextYearStart.getTime() - now.getTime()
}

function CurrentYearProvider({ children }: { children: React.ReactNode }) {
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>

    function scheduleNextYearUpdate() {
      const ms = msUntilNextYear()
      timeout = setTimeout(() => {
        setYear(new Date().getFullYear())
        scheduleNextYearUpdate() // agenda a próxima virada
      }, ms)
    }

    scheduleNextYearUpdate()
    return () => clearTimeout(timeout)
  }, [])

  return (
    <CurrentYearContext.Provider value={year}>
      {children}
    </CurrentYearContext.Provider>
  )
}

// ──────────────────────────────────────────────────────────────────────────────

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

function RootComponent() {
  const { isCollapsed, toggle } = useSidebarStore()
  const location = useLocation()
  const isPublicRoute = publicRoutes.includes(location.pathname)
  const isAuthRoute = authRoutes.includes(location.pathname)
  const hideHeader = noHeaderRoutes.includes(location.pathname)
  const hasHero = location.pathname === '/'

  if (isPublicRoute) {
    return (
      <CurrentYearProvider>
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
      </CurrentYearProvider>
    )
  }

  return (
    <CurrentYearProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar
          isCollapsed={isCollapsed}
          onToggle={toggle}
        />
        <main className="flex-1 flex flex-col min-h-0 min-w-0 transition-all duration-300">
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </main>
        <ToastViewport />
      </div>
    </CurrentYearProvider>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
