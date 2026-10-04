import { create } from 'zustand'

interface SidebarState {
  isCollapsed: boolean
  toggle: () => void
  expand: () => void
}

export const useSidebarStore = create<SidebarState>((set) => ({
  isCollapsed: true,
  toggle: () => set((s) => ({ isCollapsed: !s.isCollapsed })),
  expand: () => set({ isCollapsed: false }),
}))
