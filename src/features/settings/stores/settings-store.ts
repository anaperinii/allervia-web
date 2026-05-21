import { create } from 'zustand'

export type Theme = 'light' | 'dark' | 'auto'
export type Density = 'compact' | 'comfortable' | 'spacious'
export type Language = 'pt-BR' | 'en' | 'es'
export type Timezone = 'America/Sao_Paulo' | 'America/Manaus' | 'America/Noronha'

export interface EventColor {
  id: string
  label: string
  color: string
}

const DEFAULT_EVENT_COLORS: EventColor[] = [
  { id: 'subcutaneous', label: 'Subcutânea', color: '#14B8A6' },
  { id: 'sublingual', label: 'Sublingual', color: '#8B5CF6' },
  { id: 'missed', label: 'Ausente', color: '#EF4444' },
]

interface SettingsState {
  // Integrations
  googleCalendarConnected: boolean
  autoSync: boolean

  // Security
  twoFaEnabled: boolean

  // Notifications
  emailNotifications: boolean
  pushNotifications: boolean

  // System
  timezone: Timezone
  sessionTimeout: '15' | '30' | '60' | '120'
  language: Language

  // Scheduling
  reminderWhatsapp: boolean
  reminderHours: '2' | '6' | '12' | '24' | '48'
  eventColors: EventColor[]

  // Backup
  autoBackup: boolean

  // Personalization
  theme: Theme
  density: Density
  fontSize: number

  // Accessibility
  highContrast: boolean
  reducedMotion: boolean
  largeText: boolean
  focusIndicators: boolean

  // Setters
  setGoogleCalendarConnected: (value: boolean) => void
  setAutoSync: (value: boolean) => void
  setTwoFaEnabled: (value: boolean) => void
  setEmailNotifications: (value: boolean) => void
  setPushNotifications: (value: boolean) => void
  setTimezone: (value: Timezone) => void
  setSessionTimeout: (value: SettingsState['sessionTimeout']) => void
  setLanguage: (value: Language) => void
  setReminderWhatsapp: (value: boolean) => void
  setReminderHours: (value: SettingsState['reminderHours']) => void
  setEventColors: (value: EventColor[]) => void
  setAutoBackup: (value: boolean) => void
  setTheme: (value: Theme) => void
  setDensity: (value: Density) => void
  setFontSize: (value: number) => void
  setHighContrast: (value: boolean) => void
  setReducedMotion: (value: boolean) => void
  setLargeText: (value: boolean) => void
  setFocusIndicators: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  googleCalendarConnected: false,
  autoSync: true,
  twoFaEnabled: false,
  emailNotifications: true,
  pushNotifications: false,
  timezone: 'America/Sao_Paulo',
  sessionTimeout: '30',
  language: 'pt-BR',
  reminderWhatsapp: true,
  reminderHours: '24',
  eventColors: DEFAULT_EVENT_COLORS,
  autoBackup: true,
  theme: 'light',
  density: 'comfortable',
  fontSize: 14,
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  focusIndicators: true,

  setGoogleCalendarConnected: (value) => set({ googleCalendarConnected: value }),
  setAutoSync: (value) => set({ autoSync: value }),
  setTwoFaEnabled: (value) => set({ twoFaEnabled: value }),
  setEmailNotifications: (value) => set({ emailNotifications: value }),
  setPushNotifications: (value) => set({ pushNotifications: value }),
  setTimezone: (value) => set({ timezone: value }),
  setSessionTimeout: (value) => set({ sessionTimeout: value }),
  setLanguage: (value) => set({ language: value }),
  setReminderWhatsapp: (value) => set({ reminderWhatsapp: value }),
  setReminderHours: (value) => set({ reminderHours: value }),
  setEventColors: (value) => set({ eventColors: value }),
  setAutoBackup: (value) => set({ autoBackup: value }),
  setTheme: (value) => set({ theme: value }),
  setDensity: (value) => set({ density: value }),
  setFontSize: (value) => set({ fontSize: value }),
  setHighContrast: (value) => set({ highContrast: value }),
  setReducedMotion: (value) => set({ reducedMotion: value }),
  setLargeText: (value) => set({ largeText: value }),
  setFocusIndicators: (value) => set({ focusIndicators: value }),
}))
