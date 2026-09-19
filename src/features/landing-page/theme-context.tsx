import { useEffect, useState, type ReactNode } from 'react'
import { LandingThemeContext, STORAGE_KEY, readInitialTheme, type LandingTheme } from './useLandingTheme'

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
