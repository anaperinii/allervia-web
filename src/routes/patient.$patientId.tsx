import { createFileRoute } from '@tanstack/react-router'
import { PatientChartPage } from '@/features/patient/patient-chart-page'
import { RequireCapability } from '@/shared/auth/RequireCapability'

type SearchParams = {
  therapy?: string
  doseId?: string
}

export const Route = createFileRoute('/patient/$patientId')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
    doseId: typeof search.doseId === 'string' ? search.doseId : undefined,
  }),
  component: () => (
    <RequireCapability capability="view_clinical">
      <PatientChartPage />
    </RequireCapability>
  ),
})
