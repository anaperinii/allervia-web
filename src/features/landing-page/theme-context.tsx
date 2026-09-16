import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

export type LandingTheme = 'dark' | 'light'

interface LandingThemeContextValue {
  theme: LandingTheme
  toggle: () => void
  setTheme: (theme: LandingTheme) => void
}

const STORAGE_KEY = 'allervia.landing.theme'

const LandingThemeContext = createContext<LandingThemeContextValue | null>(null)

function readInitialTheme(): LandingTheme {
  if (typeof window === 'undefined') return 'dark'
  const stored = window.localStorage.getItem(STORAGE_KEY)
  if (stored === 'dark' || stored === 'light') return stored
  return 'dark'
}

export function LandingThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<LandingTheme>(readInitialTheme)

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme)
  }, [theme])

  const toggle = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'))

  return (
    <LandingThemeContext.Provider value={{ theme, toggle, setTheme }}>
      {children}
    </LandingThemeContext.Provider>
  )
}

export function useLandingTheme() {
  const ctx = useContext(LandingThemeContext)
  if (!ctx) throw new Error('useLandingTheme must be used within LandingThemeProvider')
  return ctx
}
