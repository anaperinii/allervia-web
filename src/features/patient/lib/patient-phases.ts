import { META_DOSE } from '@/features/immunotherapy/constants/scit-protocol'
import type { Application } from '@/features/patient/stores/usePatientStore'

export type ApplicationPhase = 'induction' | 'maintenance'

export function isMaintenanceApplication(app: Application): boolean {
  return app.dose === META_DOSE
}

export function getApplicationPhase(app: Application): ApplicationPhase {
  return isMaintenanceApplication(app) ? 'maintenance' : 'induction'
}
