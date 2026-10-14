import { createFileRoute } from '@tanstack/react-router'
import { PatientCompletionPage } from '@/features/patient/patient-completion-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

type SearchParams = {
  patientId?: string
  therapy?: string
}

export const Route = createFileRoute('/patient-completion')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    patientId:
      typeof search.patientId === 'string' ? search.patientId : undefined,
    therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
  }),


  component: () => (
    <RequireCapability capability="inactivate_immunotherapy">
      <PatientCompletionPage />
    </RequireCapability>
  ),
})
