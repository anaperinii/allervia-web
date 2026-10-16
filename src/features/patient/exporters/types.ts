import type { ClinicalHistoryEntry, DoseRecord } from '@/shared/api/contracts/clinical'
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
  inductionStart?: string | null
  maintenanceStart?: string | null
  patient: Patient
  sections: ReportSectionId[]
  realizedApplications: Application[]
  reactionsCount: number | null
  generatedAt: string
  anonymized: boolean
}

export interface LgpdExportData {
  doses?: DoseRecord[]
  therapyId?: string
  patient: Patient
  applications: Application[]
  accessLogs: ClinicalHistoryEntry[]
  exportedAt: string
  justification: string
  exportedBy: string
}
