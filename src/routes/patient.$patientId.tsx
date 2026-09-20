import { createFileRoute } from '@tanstack/react-router'
import { PatientChartPage } from '@/features/patient/patient-chart-page'

type SearchParams = {
  /** Tratamento selecionado; ausente, o prontuário abre o mais recente. */
  therapy?: string
}

export const Route = createFileRoute('/patient/$patientId')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
  }),
  component: PatientChartPage,
})
