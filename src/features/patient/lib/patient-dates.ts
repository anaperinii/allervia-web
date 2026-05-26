import { comparePtDateAsc } from '@/shared/lib/dates'
import type { Application } from '@/features/patient/stores/usePatientStore'
import { isMaintenanceApplication } from './patient-phases'

export function derivePatientDates(applications: Application[], patientId: string): {
  inductionStart: string | null
  maintenanceStart: string | null 
} {
  const ofPatient = applications
    .filter((a) => a.patientId === patientId)
    .sort((a, b) => comparePtDateAsc(a.date, b.date))
  const inductionStart = ofPatient[0]?.date ?? null
  const firstMaintenance = ofPatient.find((a) => a.status === 'completed' && isMaintenanceApplication(a))
  return { inductionStart, maintenanceStart: firstMaintenance?.date ?? null }
}
