import { create } from 'zustand'

interface SchedulingUiState {
  showCalendarPanel: boolean
  setShowCalendarPanel: (open: boolean) => void
  toggleCalendarPanel: () => void
}

export const useSchedulingUiStore = create<SchedulingUiState>((set) => ({
  showCalendarPanel: false,
  setShowCalendarPanel: (open) => set({ showCalendarPanel: open }),
  toggleCalendarPanel: () => set((state) => ({ showCalendarPanel: !state.showCalendarPanel })),
}))
