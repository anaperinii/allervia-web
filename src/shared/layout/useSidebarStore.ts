import { create } from 'zustand'

interface SidebarState {
  isCollapsed: boolean
  toggle: () => void
  expand: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: false,
  toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  expand: () => set({ isCollapsed: false }),
}))
