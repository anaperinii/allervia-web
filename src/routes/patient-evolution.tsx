import { createFileRoute } from '@tanstack/react-router'
import { PatientEvolutionPage } from '@/features/patient/patient-evolution-page'

type SearchParams = {
  therapy?: string
}

export const Route = createFileRoute('/patient-evolution')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    therapy: typeof search.therapy === 'string' ? search.therapy : undefined,
  }),
  component: PatientEvolutionPage,
})
