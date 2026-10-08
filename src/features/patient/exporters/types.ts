import type { ClinicalHistoryEntry } from '@/shared/api/contracts/clinical'
import type { Application, Patient } from '@/features/patient/stores/usePatientStore'

export type ReportFileFormat = 'pdf' | 'csv'
export type LgpdFileFormat = 'json' | 'csv'

export type ReportSectionId =
  | 'personal'
  | 'immunotherapy'
  | 'applications'
  | 'reactions'
  | 'progress'
  | 'adjustments'
  | 'inactivations'

export interface ReportData {
  patient: Patient
  sections: ReportSectionId[]
  realizedApplications: Application[]
  reactionsCount: number
  generatedAt: string
  anonymized: boolean
}

export interface LgpdExportData {
  patient: Patient
  applications: Application[]
  accessLogs: ClinicalHistoryEntry[]
  exportedAt: string
  justification: string
  exportedBy: string
}
