import { createFileRoute, redirect } from '@tanstack/react-router'
import { PatientCompletionPage } from '@/features/patient/patient-completion-page'
import { hasPermission, useUserStore } from '@/shared/stores/useUserStore'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'

type SearchParams = {
  patientId?: string
}

export const Route = createFileRoute('/patient-completion')({
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    patientId: search.patientId as string | undefined,
  }),
  beforeLoad: ({ search }) => {
    // A capacidade vem do servidor; a rota apenas evita abrir uma tela que o
    // comando seria recusado de qualquer forma.
    const { capabilities } = useUserStore.getState()
    if (!hasPermission(capabilities, 'inactivate_immunotherapy')) {
      throw redirect({ to: '/immunotherapies' })
    }
    const { selectedPatient } = usePatientStore.getState()
    const targetId = search.patientId
    const patient = selectedPatient && (!targetId || selectedPatient.id === targetId)
      ? selectedPatient
      : (() => {
          if (!targetId) return null
          const imm = useImmunotherapiesStore.getState().immunotherapies.find((i) => i.id === targetId)
          return imm ? buildPatientFromImmunotherapy(imm) : null
        })()
    if (patient && (patient.status === 'inactive' || patient.currentInterval !== 28)) {
      throw redirect({ to: '/patient/$patientId', params: { patientId: patient.id } })
    }
  },
  component: PatientCompletionPage,
})
