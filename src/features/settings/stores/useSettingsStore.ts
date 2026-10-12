import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

interface SettingsState {
  eventColors: EventColor[]
  setEventColor: (id: string, color: string) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      eventColors: DEFAULT_EVENT_COLORS,
      setEventColor: (id, color) =>
        set((state) => ({
          eventColors: state.eventColors.map((item) =>
            item.id === id && HEX_COLOR.test(color)
              ? { ...item, color }
              : item,
          ),
        })),
    }),
    {
      name: 'allervia-settings',
      version: 1,
      merge: (persisted, current) => {
        const stored = (persisted as Partial<SettingsState> | undefined)
          ?.eventColors
        if (!Array.isArray(stored)) return current
        return {
          ...current,
          eventColors: DEFAULT_EVENT_COLORS.map((item) => {
            const saved = stored.find((entry) => entry?.id === item.id)
            return saved && HEX_COLOR.test(saved.color)
              ? { ...item, color: saved.color }
              : item
          }),
        }
      },
    },
  ),
)
