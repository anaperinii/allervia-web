import { Moon, Sun } from 'lucide-react'
import { useLandingTheme } from '@/features/landing-page/theme-context'

interface ThemeSwitchProps {
  overHero?: boolean
}

export function ThemeSwitch({ overHero = false }: ThemeSwitchProps) {
  const { theme, toggle } = useLandingTheme()
  const isDark = theme === 'dark'

  const knobBg = overHero ? '#6C9EA5' : 'var(--ll-accent)'
  const knobInk = overHero ? '#06232a' : 'var(--ll-accent-ink)'
  const knobHalo = overHero ? 'rgba(108,158,165,0.30)' : 'var(--ll-halo-accent-strong)'
  const trackBg = overHero ? 'rgba(255,255,255,0.04)' : 'transparent'
  const trackBorder = overHero
    ? '1.5px solid rgba(255,255,255,0.25)'
    : '1.5px solid var(--ll-border-strong)'

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="relative inline-flex h-8 w-14 shrink-0 items-center rounded-lg cursor-pointer"
      style={{
        background: trackBg,
        border: trackBorder,
        transition: 'background 0.5s ease, border-color 0.5s ease',
      }}
    >
      <span
        aria-hidden="true"
        className="absolute top-1/2 -translate-y-1/2 flex h-6 w-6 items-center justify-center rounded-md ease-out"
        style={{
          left: isDark ? '3px' : 'calc(100% - 27px)',
          background: knobBg,
          color: knobInk,
          boxShadow: `0 4px 14px ${knobHalo}, inset 0 1px 0 rgba(255,255,255,0.35)`,
          transition: 'left 0.3s ease-out, background 0.5s ease, color 0.5s ease, box-shadow 0.5s ease',
        }}
      >
        {isDark ? <Moon size={12} /> : <Sun size={12} />}
      </span>
    </button>
  )
}
