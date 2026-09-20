import type { Page } from '@/shared/api/contracts/team'

export type AdministrationRoute = 'SUBCUTANEOUS' | 'SUBLINGUAL'
export type TherapyStatus = 'IN_PROGRESS' | 'SUSPENDED' | 'COMPLETED'
export type DoseStatus =
  | 'SCHEDULED'
  | 'ADMINISTERED_ON_SCHEDULE'
  | 'ADMINISTERED_OFF_SCHEDULE'
  | 'ENTERED_IN_ERROR'

export interface ResponsiblePhysician {
  id: string
  fullName: string
  councilNumber?: string | null
  councilUf?: string | null
}

export interface TherapySummary {
  id: string
  immunoType: string
  administrationRoute: AdministrationRoute
  extract: string
  status: TherapyStatus
  revision: number
  inductionStartDate: string
  maintenanceStartDate: string | null
  prescription: { versionId: string; revision: number } | null
  nextDose: { id: string; scheduledAt: string; status: DoseStatus } | null
  createdAt: string
}

export interface PatientListItem {
  id: string
  fullName: string
  cpfMasked: string | null
  birthDate: string
  phoneNumber: string
  weightInKg: number
  isActive: boolean
  responsiblePhysician: ResponsiblePhysician
  therapyCount: number
  therapyStatuses: TherapyStatus[]
  createdAt: string
}

export interface PatientDetail extends PatientListItem {
  /** Documento completo; presente apenas para quem pode editar o cadastro. */
  cpf?: string | null
  therapies: TherapySummary[]
  updatedAt: string
}

export interface ImmunotherapyListItem {
  id: string
  immunoType: string
  administrationRoute: AdministrationRoute
  extract: string
  status: TherapyStatus
  revision: number
  inductionStartDate: string
  maintenanceStartDate: string | null
  patient: { id: string; fullName: string; isActive: boolean }
  responsiblePhysician: { id: string; fullName: string }
  prescription: { versionId: string; revision: number } | null
  nextDose: { id: string; scheduledAt: string; status: DoseStatus } | null
  createdAt: string
}

export interface ImmunotherapyDetail extends ImmunotherapyListItem {
  isArchived: boolean
  prescription:
    | { versionId: string; revision: number; resolved?: unknown }
    | null
  doseCount: number
  updatedAt: string
}

export type PatientPage = Page<PatientListItem>
export type ImmunotherapyPage = Page<ImmunotherapyListItem>
