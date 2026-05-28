import type { AccessLog } from '@/shared/audit/audit-store'
import type { Application, Patient } from '@/features/patient/stores/patient-store'

export type ReportFileFormat = 'pdf' | 'excel' | 'csv'
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
  realizedApps: Application[]
  reactionsCount: number
  generatedAt: string
  anonymized: boolean
}

export interface LgpdExportData {
  patient: Patient
  applications: Application[]
  accessLogs: AccessLog[]
  exportedAt: string
  justification: string
  exportedBy: string
}
