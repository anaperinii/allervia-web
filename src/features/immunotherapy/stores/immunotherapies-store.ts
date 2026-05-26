import { create } from 'zustand'
import { persist } from 'zustand/middleware'

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
  status: 'active' | 'inactive'
  completed?: boolean
  responsibleDoctor: string
}

interface ImmunotherapiesState {
  immunotherapies: Immunotherapy[]
  addImmunotherapy: (imm: Immunotherapy) => void
}

const DEFAULT_IMMUNOTHERAPIES: Immunotherapy[] = [
  { id: '1', name: 'Bárbara Sofia Diniz', phone: '(62) 98412-3076', type: 'Gramíneas', doseConcentration: '1:10.000 - 0,1ml', cycleInterval: { number: 1, days: 7 }, modality: 'subcutaneous', status: 'active', completed: false, responsibleDoctor: 'Dra. Karina Martins' },
  { id: '2', name: 'Camilla Martins', phone: '(62) 99127-4581', type: 'Gramíneas', doseConcentration: '1:1.000 - 0,2ml', cycleInterval: { number: 1, days: 7 }, modality: 'subcutaneous', status: 'active', completed: false, responsibleDoctor: 'Dra. Karina Martins' },
  { id: '3', name: 'Ana Clara de Souza Martins', phone: '(62) 98765-2109', type: 'Cão e Gato', doseConcentration: '1:100 - 0,4ml', cycleInterval: { number: 1, days: 7 }, modality: 'sublingual', status: 'active', completed: false, responsibleDoctor: 'Dr. André Lima' },
  { id: '4', name: 'Valentina Bittencourt Farias', phone: '(62) 99304-8612', type: 'Cândida', doseConcentration: '1:10 - 0,8ml', cycleInterval: { number: 1, days: 7 }, modality: 'subcutaneous', status: 'active', completed: true, responsibleDoctor: 'Dr. André Lima' },
  { id: '5', name: 'Heitor Guimarães de Assis', phone: '(62) 98556-7423', type: 'Ácaros', doseConcentration: '1:10 - 0,5ml', cycleInterval: { number: 1, days: 14 }, modality: 'subcutaneous', status: 'active', completed: false, responsibleDoctor: 'Dra. Karina Martins' },
  { id: '6', name: 'Caroline Ferreira de Abreu', phone: '(62) 99557-1423', type: 'Herpes', doseConcentration: '1:10 - 0,5ml', cycleInterval: { number: 2, days: 21 }, modality: 'sublingual', status: 'active', completed: true, responsibleDoctor: 'Dr. André Lima' },
  { id: '7', name: 'Marta Gabriela de Sousa', phone: '(62) 98213-9054', type: 'Gramíneas', doseConcentração: '1:10 - 0,5ml', cycleInterval: { number: 3, days: 28 }, modality: 'subcutaneous', status: 'active', completed: false, responsibleDoctor: 'Dr. André Lima' },
  { id: '8', name: 'Patrício Gomes Cardoso', phone: '(62) 99876-3148', type: 'Cândida', doseConcentration: '1:1.000 - 0,1ml', cycleInterval: { number: 1, days: 7 }, modality: 'sublingual', status: 'active', completed: false, responsibleDoctor: 'Dr. André Lima' },
  { id: '9', name: 'Pedro Luccas Pereira', phone: '(62) 98432-5167', type: 'Gramíneas', doseConcentration: '1:100 - 0,2ml', cycleInterval: { number: 1, days: 7 }, modality: 'subcutaneous', status: 'active', completed: false, responsibleDoctor: 'Dra. Karina Martins' },
  { id: '10', name: 'Lucas Ferreira Lima', phone: '(62) 99654-2018', type: 'Ácaros', doseConcentration: '1:100 - 0,4ml', cycleInterval: { number: 1, days: 7 }, modality: 'subcutaneous', status: 'inactive', completed: false, responsibleDoctor: 'Dra. Karina Martins' },
  { id: '11', name: 'Juliana Mendes Costa', phone: '(62) 98708-3592', type: 'Gramíneas', doseConcentration: '1:10 - 0,5ml', cycleInterval: { number: 2, days: 14 }, modality: 'subcutaneous', status: 'inactive', completed: true, responsibleDoctor: 'Dra. Karina Martins' },
  { id: '12', name: 'Roberto Alves Neto', phone: '(62) 99245-7081', type: 'Cândida', doseConcentration: '1:1.000 - 0,2ml', cycleInterval: { number: 1, days: 7 }, modality: 'sublingual', status: 'inactive', completed: false, responsibleDoctor: 'Dr. André Lima' },
]

export const useImmunotherapiesStore = create<ImmunotherapiesState>()(
  persist(
    (set) => ({
      immunotherapies: DEFAULT_IMMUNOTHERAPIES,
      addImmunotherapy: (imm) => set((state) => ({ immunotherapies: [imm, ...state.immunotherapies] })),
    }),
    {
      name: 'immunotherapies-store',
      version: 1,
      migrate: (persistedState: any) => {
        if (!persistedState.immunotherapies || persistedState.immunotherapies.length === 0) {
          return { immunotherapies: DEFAULT_IMMUNOTHERAPIES }
        }
        return persistedState
      },
    },
  ),
)

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
