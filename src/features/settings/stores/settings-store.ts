import { create } from 'zustand'

interface SettingsState {
  googleCalendarConnected: boolean
  setGoogleCalendarConnected: (connected: boolean) => void
}

export const useSettingsStore = create<SettingsState>((set) => ({
  googleCalendarConnected: false,
  setGoogleCalendarConnected: (connected) => set({ googleCalendarConnected: connected }),
}))
