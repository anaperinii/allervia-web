import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type Modality = 'subcutaneous' | 'sublingual'

interface DashboardState {
  modality: Modality
  setModality: (modality: Modality) => void
  
  typeFilter: string
  setTypeFilter: (filter: string) => void
  
  archivedCharts: string[]
  toggleArchiveChart: (id: string) => void
  
  showArchived: boolean
  setShowArchived: (show: boolean) => void
}

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set) => ({
      modality: 'subcutaneous',
      setModality: (modality) => set({ modality }),
      
      typeFilter: 'all',
      setTypeFilter: (typeFilter) => set({ typeFilter }),
      
      archivedCharts: [],
      toggleArchiveChart: (id) => set((state) => ({
        archivedCharts: state.archivedCharts.includes(id)
          ? state.archivedCharts.filter((chartId) => chartId !== id)
          : [...state.archivedCharts, id],
      })),
      
      showArchived: false,
      setShowArchived: (show) => set({ showArchived: show }),
    }),
    {
      name: 'dashboard-store',
      version: 1,
    },
  ),
)
