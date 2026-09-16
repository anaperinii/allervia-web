import { type CSSProperties, type ReactNode } from 'react'
import { Link } from '@tanstack/react-router'
import markForDark from '@/assets/allervia-mark-dark.png' // white mark, for dark surfaces
import markForLight from '@/assets/allervia-mark-light.png' // dark mark, for light surfaces
import loginArt from '@/assets/login-art.jpg'
import loginArtDark from '@/assets/login-art-dark.jpg'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
import { cn } from '@/shared/lib/cn'
import { ThemeSwitch } from '@/features/landing-page/components/ThemeSwitch'
import { useLandingTheme } from '@/features/landing-page/theme-context'

export const AUTH_THEMES = {
  light: {
    shell: '#e8ecee',
    card: '#ffffff',
    ink: '#12333a',
    inkSoft: '#5b7c81',
    inkFaint: '#8aa4a8',
    field: '#f4f7f8',
    fieldSolid: '#f4f7f8',
    fieldBd: 'rgba(16,113,129,0.16)',
    bd: 'rgba(16,113,129,0.12)',
    btn: '#12333a',
    btnInk: '#ffffff',
    accent: '#257E8C',
    accentAlt: '#3e5566',
    glass: 'rgba(12,45,52,0.06)',
    glassBd: 'rgba(12,45,52,0.20)',
    glassInk: '#12333a',
    ok: '#059669',
    okInk: '#047857',
    okBg: 'rgba(5,150,105,0.14)',
    err: '#c0392b',
    art: loginArt,
    scrim: 'linear-gradient(180deg, rgba(255,255,255,0) 34%, rgba(12,45,52,0.42) 100%)',
    mark: markForLight,
  },
  dark: {
    shell: '#070d0e',
    card: 'radial-gradient(120% 130% at 12% 8%, #16323a 0%, #0e2427 52%, #0a1b1e 100%)',
    ink: '#e9f2f1',
    inkSoft: '#93b0b2',
    inkFaint: '#6f8b8c',
    field: 'rgba(220,235,233,0.05)',
    fieldSolid: '#15292d',
    fieldBd: 'rgba(216,234,232,0.14)',
    bd: 'rgba(216,234,232,0.12)',
    btn: '#6C9EA5',
    btnInk: '#ffffff',
    accent: '#8fc2c6',
    accentAlt: '#b6c7d2',
    glass: 'rgba(220,235,233,0.06)',
    glassBd: 'rgba(216,234,232,0.24)',
    glassInk: '#e9f2f1',
    ok: '#34d399',
    okInk: '#a7f3d0',
    okBg: 'rgba(16,185,129,0.22)',
    err: '#ff9b9b',
    art: loginArtDark,
    scrim: 'linear-gradient(180deg, rgba(7,20,22,0.12) 30%, rgba(6,18,21,0.72) 100%)',
    mark: markForDark,
  },
}

const EYEBROW = 'Protocolo, dose e evolução'
const ART_TEXT = 'Gestão longitudinal e integrada de protocolos imunoterápicos alérgicos.'

interface AuthLayoutProps {
  children: ReactNode
  animate?: boolean
}

type AuthTheme = typeof AUTH_THEMES.dark

export function authThemeVars(t: AuthTheme): CSSProperties {
  return {
    '--card': t.card,
    '--ink': t.ink,
    '--ink-soft': t.inkSoft,
    '--ink-faint': t.inkFaint,
    '--field': t.field,
    '--field-solid': t.fieldSolid,
    '--field-bd': t.fieldBd,
    '--bd': t.bd,
    '--btn': t.btn,
    '--btn-ink': t.btnInk,
    '--accent': t.accent,
    '--accent-alt': t.accentAlt,
    '--glass': t.glass,
    '--glass-bd': t.glassBd,
    '--glass-ink': t.glassInk,
    '--ok': t.ok,
    '--ok-ink': t.okInk,
    '--ok-bg': t.okBg,
    '--err': t.err,
  } as CSSProperties
}

export const AUTH_FIELD_CLASSES = `
  [&_input]:bg-[var(--field)]! [&_input]:border! [&_input]:border-[color:var(--field-bd)]! [&_input]:text-[color:var(--ink)]! [&_input]:rounded-xl!
  [&_input::placeholder]:text-[color:var(--ink-faint)]!
  [&_input:not([data-code-digit])]:h-9! [&_input:not([data-code-digit])]:text-[13.5px]!
  [&_select]:bg-[var(--field-solid)]! [&_select]:border! [&_select]:border-[color:var(--field-bd)]! [&_select]:text-[color:var(--ink)]! [&_select]:rounded-xl! [&_select]:h-9! [&_select]:text-[13.5px]!
  [&_select_option]:bg-[var(--field-solid)]! [&_select_option]:text-[color:var(--ink)]!
  [&_textarea]:bg-[var(--field)]! [&_textarea]:border! [&_textarea]:border-[color:var(--field-bd)]! [&_textarea]:text-[color:var(--ink)]! [&_textarea]:rounded-xl!
  [&_label]:text-[color:var(--ink)]! [&_label]:text-[11.5px]!
`

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
