import { createFileRoute, redirect } from '@tanstack/react-router'
import { PatientCompletionPage } from '@/features/patient/patient-completion-page'
import { hasPermission, useUserStore } from '@/shared/stores/useUserStore'

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
  beforeLoad: () => {
    const { capabilities } = useUserStore.getState()
    if (!hasPermission(capabilities, 'inactivate_immunotherapy')) {
      throw redirect({ to: '/immunotherapies' })
    }
  },
  component: PatientCompletionPage,
})
