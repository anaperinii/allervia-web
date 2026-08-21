import { useLandingTheme } from '@/features/landing-page/theme-context'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMoon, faSun } from '@fortawesome/free-solid-svg-icons'

interface ThemeSwitchProps {
  overHero?: boolean
  scheme?: 'auto' | 'dark'
}

export function ThemeSwitch({ overHero = false, scheme = 'auto' }: ThemeSwitchProps) {
  const { theme, toggle } = useLandingTheme()
  const isDark = theme === 'dark'
  const pinnedDark = scheme === 'dark'

  const border = overHero
    ? '1.5px solid rgba(255,255,255,0.25)'
    : pinnedDark
      ? '1.5px solid rgba(220,225,229,0.22)'
      : '1.5px solid var(--ll-border-strong)'
  const inkOn = overHero ? '#ffffff' : pinnedDark ? '#DCE1E5' : 'var(--ll-ink)'
  const inkOff = overHero
    ? 'rgba(255,255,255,0.45)'
    : pinnedDark
      ? '#4d7e85'
      : 'var(--ll-ink-tertiary)'
  const slotOn = overHero
    ? 'rgba(255,255,255,0.14)'
    : isDark || pinnedDark
      ? 'rgba(220,225,229,0.12)'
      : 'rgba(14,46,52,0.08)'

  return (
    <button
      type="button"
      onClick={toggle}
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? 'Mudar para modo claro' : 'Mudar para modo escuro'}
      className="inline-flex h-[38px] shrink-0 items-center gap-1.5 rounded-lg px-2 cursor-pointer"
      style={{
        background: 'transparent',
        border,
        transition: 'border-color 0.5s ease',
      }}
    >
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-md transition-colors duration-200"
        style={{
          background: isDark ? 'transparent' : slotOn,
          color: isDark ? inkOff : inkOn,
        }}
      >
        <FontAwesomeIcon icon={faSun} style={{ fontSize: 14 }} />
      </span>
      <span
        aria-hidden="true"
        className="inline-flex items-center justify-center w-[22px] h-[22px] rounded-md transition-colors duration-200"
        style={{
          background: isDark ? slotOn : 'transparent',
          color: isDark ? inkOn : inkOff,
        }}
      >
        <FontAwesomeIcon icon={faMoon} style={{ fontSize: 14 }} />
      </span>
    </button>
  )
}
