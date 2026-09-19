import { createContext, useContext } from 'react'

export type LandingTheme = 'dark' | 'light'

interface LandingThemeContextValue {
  theme: LandingTheme
  toggle: () => void
  setTheme: (theme: LandingTheme) => void
}

export const STORAGE_KEY = 'allervia.landing.theme'

export const LandingThemeContext = createContext<LandingThemeContextValue | null>(null)

export function readInitialTheme(): LandingTheme {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return 'dark'
}

export function useLandingTheme() {
  const ctx = useContext(LandingThemeContext)
  if (!ctx) throw new Error('useLandingTheme must be used within LandingThemeProvider')
  return ctx
}
