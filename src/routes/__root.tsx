import { createRootRoute, Outlet, useLocation } from '@tanstack/react-router'
import { Header } from '@/shared/layout/header'
import { Sidebar } from '@/shared/layout/sidebar'
import { useState, useEffect } from 'react'
import { ToastViewport } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { LandingThemeProvider, useLandingTheme } from '@/features/landing-page/theme-context'

const publicRoutes = ['/', '/login', '/register', '/trial', '/forgot-password']
const authRoutes = ['/login', '/register', '/forgot-password']
const noHeaderRoutes: string[] = []
const heroRoutes = ['/', '/trial', '/login', '/register', '/forgot-password']

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
  const hideNav = pathname === '/trial'
  const forceDark = isAuthRoute || pathname === '/trial'
  const effectiveTheme = forceDark ? 'dark' : theme
  return (
    <div data-landing-theme={effectiveTheme} className="min-h-screen">
      {!hideHeader && (
        <Header
          isAuthPage={isAuthRoute}
          hasHero={hasHero}
          hideNav={hideNav}
          hideThemeSwitch={forceDark}
        />
      )}
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
    <div
      className="flex h-screen overflow-hidden"
      style={{
        background:
          'linear-gradient(180deg, #4d7e85 0%, #234e58 100%)',
      }}
    >
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div
          className="flex-1 flex flex-col overflow-hidden relative rounded-l-2xl"
          style={{
            background: '#E4E9EA',
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
