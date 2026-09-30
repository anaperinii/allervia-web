import { create } from 'zustand'

export type Language = 'pt-BR' | 'en' | 'es'

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

  googleCalendarConnected: boolean
  autoSync: boolean

  twoFaEnabled: boolean

  emailNotifications: boolean
  pushNotifications: boolean

  sessionTimeout: string
  language: Language

  reminderWhatsapp: boolean
  reminderHours: '2' | '6' | '12' | '24' | '48'
  eventColors: EventColor[]

  autoBackup: boolean

  setGoogleCalendarConnected: (value: boolean) => void
  setAutoSync: (value: boolean) => void
  setTwoFaEnabled: (value: boolean) => void
  setEmailNotifications: (value: boolean) => void
  setPushNotifications: (value: boolean) => void
  setSessionTimeout: (value: SettingsState['sessionTimeout']) => void
  setLanguage: (value: Language) => void
  setReminderWhatsapp: (value: boolean) => void
  setReminderHours: (value: SettingsState['reminderHours']) => void
  setEventColors: (value: EventColor[]) => void
  setAutoBackup: (value: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  googleCalendarConnected: false,
  autoSync: true,
  twoFaEnabled: false,
  emailNotifications: true,
  pushNotifications: false,
  sessionTimeout: '30',
  language: 'pt-BR',
  reminderWhatsapp: true,
  reminderHours: '24',
  eventColors: DEFAULT_EVENT_COLORS,
  autoBackup: true,

  setGoogleCalendarConnected: (value) => set({ googleCalendarConnected: value }),
  setAutoSync: (value) => set({ autoSync: value }),
  setTwoFaEnabled: (value) => set({ twoFaEnabled: value }),
  setEmailNotifications: (value) => set({ emailNotifications: value }),
  setPushNotifications: (value) => set({ pushNotifications: value }),
  setSessionTimeout: (value) => set({ sessionTimeout: value }),
  setLanguage: (value) => set({ language: value }),
  setReminderWhatsapp: (value) => set({ reminderWhatsapp: value }),
  setReminderHours: (value) => set({ reminderHours: value }),
  setEventColors: (value) => set({ eventColors: value }),
  setAutoBackup: (value) => set({ autoBackup: value }),
}))
