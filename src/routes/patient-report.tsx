import { createFileRoute } from '@tanstack/react-router'
import { PatientReportPage } from '@/features/patient/patient-report-page'

type SearchParams = {
  patientId?: string
  therapy?: string
}

export const Route = createFileRoute('/patient-report')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    patientId:
      typeof search.patientId === 'string' ? search.patientId : undefined,
    therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
  }),
  component: PatientReportPage,
})
