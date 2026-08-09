import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { Header } from '@/shared/layout/header'
import { Sidebar } from '@/shared/layout/sidebar'
import { useState, useEffect } from 'react'
import { ToastViewport } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { LandingThemeProvider, useLandingTheme } from '@/features/landing-page/theme-context'

const publicRoutes = ['/', '/login', '/register', '/trial', '/forgot-password']
const authRoutes = ['/login', '/register', '/forgot-password', '/trial']
const noHeaderRoutes: string[] = ['/login', '/register', '/forgot-password', '/trial']
const heroRoutes = ['/', '/trial', '/login', '/register', '/forgot-password']
const noTransitionRoutes = ['/forgot-password', '/register']

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

interface PublicShellProps {
  hideHeader: boolean
  isAuthRoute: boolean
  hasHero: boolean
  pathname: string
}

function PublicShell({ hideHeader, isAuthRoute, hasHero, pathname }: PublicShellProps) {
  const { theme } = useLandingTheme()
  const skipTransition = noTransitionRoutes.includes(pathname)
  return (
    <div data-landing-theme={theme} className="min-h-screen" style={{ background: 'var(--ll-bg)' }}>
      {!hideHeader && <Header isAuthPage={isAuthRoute} hasHero={hasHero} />}
      {skipTransition ? (
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
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background: '#dfe7e8',
      }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex-1 flex flex-col overflow-hidden relative rounded-l-2xl"
          style={{
            background: '#f4f8f8',
            boxShadow:
              '-8px 0 20px -10px rgba(16,60,68,0.18), inset 1px 0 0 rgba(255,255,255,0.7)',
          }}
        >
          <PageTransition key={location.pathname}>
            <Outlet />
          </PageTransition>
        </div>
      </div>
      <ToastViewport />
    </div>
  )
}

export const Route = createRootRoute({
  component: RootComponent,
})
