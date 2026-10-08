import { create } from 'zustand'

export interface Immunotherapy {
  id: string
  name: string
  phone: string
  type: string
  doseConcentration: string
  cycleInterval: {
    number: number
    days: number
  }
  modality: 'subcutaneous' | 'sublingual'
  status: 'active' | 'inactive' | 'completed'
  responsibleDoctor: string
}

interface ImmunotherapiesState {
  immunotherapies: Immunotherapy[]
  addImmunotherapy: (imm: Immunotherapy) => void
}

export const useImmunotherapiesStore = create<ImmunotherapiesState>((set) => ({
  immunotherapies: [],
  addImmunotherapy: (imm) =>
    set((state) => ({ immunotherapies: [imm, ...state.immunotherapies] })),
}))

export function useImmunotherapyLookup() {
  const immunotherapies = useImmunotherapiesStore((state) => state.immunotherapies)
  const findById = (id?: string) =>
    id ? immunotherapies.find((immunotherapy) => immunotherapy.id === id) : undefined
  return {
    getName: (id?: string) =>
      findById(id)?.name.split(' ').slice(0, 2).join(' ') || '',
    getFullName: (id?: string) => findById(id)?.name || '',
    getPhone: (id?: string) => findById(id)?.phone ?? '',
  }
}
