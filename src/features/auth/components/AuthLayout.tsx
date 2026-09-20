import { AUTH_FIELD_CLASSES, AUTH_THEMES, authThemeVars } from '@/features/auth/constants/auth-theme'
import { ThemeSwitch } from '@/features/landing-page/components/ThemeSwitch'
import { useLandingTheme } from '@/features/landing-page/useLandingTheme'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
import { cn } from '@/shared/lib/cn'
import { Link } from '@tanstack/react-router'
import { type ReactNode } from 'react'

const EYEBROW = 'Protocolo, dose e evolução'
const ART_TEXT = 'Gestão longitudinal e integrada de protocolos imunoterápicos alérgicos.'

interface AuthLayoutProps {
  children: ReactNode
  animate?: boolean
}

export function AuthLayout({ children, animate = true }: AuthLayoutProps) {
  const { theme } = useLandingTheme()
  const t = theme === 'dark' ? AUTH_THEMES.dark : AUTH_THEMES.light

  const vars = authThemeVars(t)

  const formPanel = (
      <div
        className="flex flex-col min-h-screen px-6 py-10 sm:px-14 lg:px-20 transition-colors duration-300"
        style={{ background: 'var(--card)' }}
      >
        <div className={cn(animate && 'auth-brand', 'flex items-center justify-between gap-5')}>
          <Link
            to="/"
            aria-label="Voltar para a página inicial"
            className="flex items-center gap-3 no-underline"
          >
            <img src={t.mark} alt="" className="h-7 w-auto object-contain" />
            <AllerviaWordmark className="text-xl" style={{ color: 'var(--ink)' }} />
          </Link>

          <ThemeSwitch />
        </div>

        <div className="flex-1 flex flex-col justify-center py-10">
          <div className={cn(animate && 'auth-body', 'w-full max-w-md mx-auto', AUTH_FIELD_CLASSES)}>
            {children}
          </div>
        </div>
      </div>
  )

  const artPanel = (
      <div
        className={cn(
          animate && 'auth-art',
          'relative hidden lg:flex flex-col justify-end overflow-hidden p-11 transition-[background-image] duration-300',
          'lg:sticky lg:top-0 lg:h-screen self-start',
        )}
        style={{ backgroundImage: `url(${t.art})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none"
          style={{ background: t.scrim }}
        />
        <div className={cn(animate && 'auth-art-copy', 'relative')}>
          <span
            className="inline-block font-semibold uppercase whitespace-nowrap rounded-full"
            style={{
              fontSize: 'clamp(0.68rem, 0.7vw, 0.78rem)',
              letterSpacing: '0.16em',
              color: '#eaf5f4',
              background: 'rgba(12,45,52,0.34)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              padding: '0.5em 1.2em',
            }}
          >
            {EYEBROW}
          </span>
          <p
            className="mt-4 font-medium leading-[1.28] tracking-[-0.02em] max-w-[32ch] text-balance"
            style={{
              fontSize: 'clamp(1.5rem, 2.1vw, 2.25rem)',
              color: '#ffffff',
              textShadow: '0 2px 16px rgba(8,30,34,0.45)',
            }}
          >
            {ART_TEXT}
          </p>
        </div>
      </div>
  )

  return (
    <div
      data-auth-shell=""
      className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-2 transition-colors duration-300"
      style={{ ...vars, background: t.shell }}
    >
      {formPanel}
      {artPanel}
    </div>
  )
}
