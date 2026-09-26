import { AddImmunotherapyReviewStep } from '@/features/immunotherapy/components/add-steps/AddImmunotherapyReviewStep'
import { ImmunotherapyDataStep } from '@/features/immunotherapy/components/add-steps/ImmunotherapyDataStep'
import { PatientDataStep } from '@/features/immunotherapy/components/add-steps/PatientDataStep'
import {
  addImmunotherapySchema,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
  type AddImmunotherapyForm,
} from '@/features/immunotherapy/schemas/add-immunotherapy'
import {
  listPatients,
  registerImmunotherapy,
} from '@/shared/api/clinical.api'
import { listProtocols } from '@/shared/api/protocols.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { Button, CancelWizardModal, toast, WizardStepsBreadcrumb, type WizardStep } from '@/shared/components'
import { tomorrowStr } from '@/shared/lib/dates'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { PageHeader } from '@/shared/components/showcase'
import { faCircleCheck, faClipboardCheck, faSyringe, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const STEPS: WizardStep[] = [
  { label: 'Paciente', icon: faUser, description: 'Paciente novo ou já cadastrado, vinculado ao prescritor autenticado.' },
  { label: 'Prescrição', icon: faSyringe, description: 'Tipo, extrato, data de início e a versão publicada do protocolo com etapas, início e meta.' },
  { label: 'Revisão', icon: faClipboardCheck, description: 'Confira os valores exatos e o fuso. Salvar grava paciente, tratamento e primeira previsão em uma única transação.' },
]

function toStartInstant(dateStr: string): string {
  return new Date(`${dateStr}T08:00:00`).toISOString()
}

export function AddImmunotherapyPage() {
  const navigate = useNavigate()
  const canAdd = useHasPermission('add_immunotherapy')
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const queryClient = useQueryClient()

  useEffect(() => {
    if (!canAdd) navigate({ to: '/immunotherapies' })
  }, [canAdd, navigate])

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  const idempotencyKeyRef = useRef<string>(crypto.randomUUID())

  const form = useForm<AddImmunotherapyForm>({
    resolver: zodResolver(addImmunotherapySchema),
    mode: 'onBlur',
    defaultValues: {
      patientMode: 'new',
      name: '', cpf: '', phone: '', birthDate: '', weight: '', patientId: '',
      type: '', startDate: tomorrowStr(), extract: '',
      protocolVersionId: '', stepIds: [], startingStepId: '', targetStepId: '',
    },
  })
  const { handleSubmit, trigger, control } = form

  const values = useWatch({ control }) as AddImmunotherapyForm

  const protocolsQuery = useQuery({
    queryKey: queryKeys.protocols(organizationId),
    queryFn: ({ signal }) => listProtocols(signal),
    enabled: organizationId !== '',
  })
  const patientsQuery = useQuery({
    queryKey: queryKeys.patients(organizationId, { picker: true, search: undefined }),
    queryFn: ({ signal }) => listPatients({ pageSize: 50, isActive: true }, signal),
    enabled: organizationId !== '' && values.patientMode === 'existing',
  })

  const selectedProtocol = (protocolsQuery.data ?? []).find((protocol) =>
    protocol.versions.some((version) => version.id === values.protocolVersionId),
  )
  const selectedVersion = selectedProtocol?.versions.find(
    (version) => version.id === values.protocolVersionId,
  )
  const versionLabel = selectedProtocol && selectedVersion
    ? `${selectedProtocol.name} — v${selectedVersion.number}`
    : ''
  const existingPatientName =
    (patientsQuery.data?.items ?? []).find((patient) => patient.id === values.patientId)
      ?.fullName ?? null

  const registerMutation = useMutation({
    mutationFn: (data: AddImmunotherapyForm) =>
      registerImmunotherapy({
        idempotencyKey: idempotencyKeyRef.current,
        ...(data.patientMode === 'existing'
          ? { patientId: data.patientId }
          : {
              patient: {
                fullName: data.name.trim(),
                birthDate: data.birthDate,
                weightInKg: Number(data.weight.replace(',', '.')),
                phoneNumber: data.phone.replace(/\D/g, ''),
                ...(data.cpf.trim() ? { cpf: data.cpf } : {}),
                responsiblePhysicianId: account?.professional?.id ?? '',
              },
            }),
        immunoType: data.type.trim(),
        administrationRoute: 'SUBCUTANEOUS',
        extract: data.extract.trim(),
        inductionStartDate: toStartInstant(data.startDate),
        protocolVersionId: data.protocolVersionId,
        stepIds: data.stepIds,
        startingStepId: data.startingStepId,
        targetStepId: data.targetStepId,
      }),
    onSuccess: async (result) => {
      await queryClient.invalidateQueries({
        queryKey: ['clinical', organizationId],
      })
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Prescrição registrada!',
        description: (
          <>
            Tratamento e primeira previsão foram gravados.
            <Link
              to="/patient/$patientId"
              params={{ patientId: result.immunotherapy.patientId }}
              search={{ therapy: result.immunotherapy.id }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 mt-2 transition-colors"
            >
              Acessar prontuário do paciente &rarr;
            </Link>
          </>
        ),
        autoDismissMs: 8000,
      })
      navigate({ to: '/immunotherapies' })
    },
    onError: (error) => {
      setFailure(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível registrar a prescrição.',
      )
    },
  })

  const advanceStep = async () => {
    const fields = step === 1 ? STEP_1_FIELDS : STEP_2_FIELDS
    const isValid = await trigger([...fields])
    if (isValid) setStep((s) => (s + 1) as 1 | 2 | 3)
  }

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step < 3) {
      void advanceStep()
    } else {
      setFailure(null)
      void handleSubmit((data) => registerMutation.mutate(data))()
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <PageHeader
        breadcrumb={['Imunoterapias']}
        title="Adicionar Imunoterapia Alérgica"
      />

      <div className="mb-2">
        <WizardStepsBreadcrumb
          steps={STEPS}
          current={step - 1}
          ariaLabel="Etapas do cadastro"
          onSelect={(i) => setStep((i + 1) as 1 | 2 | 3)}
        />
      </div>

      <div className="wizard-fields flex flex-1 min-h-0 flex-col overflow-hidden">
        <form onSubmit={handleFormSubmit} noValidate className="flex flex-1 min-h-0 flex-col">
          <div
            className="flex flex-1 min-h-0 flex-col justify-start px-2 pt-1 pb-10 overflow-y-auto"
          >
            <div className="w-full">
              {step === 1 && <PatientDataStep form={form} />}
              {step === 2 && <ImmunotherapyDataStep form={form} />}
              {step === 3 && (
                <AddImmunotherapyReviewStep
                  form={values}
                  versionLabel={versionLabel}
                  steps={selectedVersion?.definition.steps ?? []}
                  existingPatientName={existingPatientName}
                  timeZone={account?.organization?.timeZone ?? ''}
                />
              )}
              {failure && (
                <p role="alert" className="mt-3 text-[0.75rem] text-red-700">
                  {failure}
                </p>
              )}
            </div>
          </div>

          <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2">
            <Button type="button" tone="danger" variant="outline" onClick={() => setShowCancelModal(true)}>
              Cancelar
            </Button>
            {step > 1 && (
              <Button type="button" tone="brand" variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
                Voltar
              </Button>
            )}
            <Button
              type="submit"
              tone="brand"
              variant="solid"
              disabled={registerMutation.isPending}
            >
              {step < 3 ? 'Continuar' : 'Salvar Prescrição'}
            </Button>
          </div>
        </form>
      </div>

      <CancelWizardModal
        open={showCancelModal}
        title="Cancelar cadastro?"
        description="Os dados preenchidos serão perdidos. Deseja realmente cancelar a prescrição da imunoterapia?"
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => navigate({ to: '/immunotherapies' })}
      />
    </div>
  )
}
