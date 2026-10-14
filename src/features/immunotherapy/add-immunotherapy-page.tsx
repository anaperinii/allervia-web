import { AddImmunotherapyReviewStep } from '@/features/immunotherapy/components/add-steps/AddImmunotherapyReviewStep'
import { ImmunotherapyDataStep } from '@/features/immunotherapy/components/add-steps/ImmunotherapyDataStep'
import { PatientDataStep } from '@/features/immunotherapy/components/add-steps/PatientDataStep'
import {
  addImmunotherapySchema,
  isMinorBirthDate,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
  type AddImmunotherapyForm,
} from '@/features/immunotherapy/schemas/add-immunotherapy'
import {
  getPatient,
  registerImmunotherapy,
} from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { RegistrationIntent } from '@/shared/api/registration-intent'
import { listProtocols } from '@/shared/api/protocols.api'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { Button, CancelWizardModal, toast, WizardStepsBreadcrumb, type WizardStep } from '@/shared/components'
import { toZonedOffsetIso, tomorrowStr } from '@/shared/lib/dates'
import { useUnsavedChangesBlocker } from '@/shared/hooks/useUnsavedChangesBlocker'
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
  { label: 'Paciente', icon: faUser, description: 'Busque pelo nome para reaproveitar um cadastro existente ou preencha os dados de um paciente novo, vinculado ao prescritor autenticado.' },
  { label: 'Prescrição', icon: faSyringe, description: 'Tipo, extrato, data de início e a versão publicada do protocolo com etapas, início e meta.' },
  { label: 'Revisão', icon: faClipboardCheck, description: 'Confira os valores exatos e o fuso. Salvar grava paciente, tratamento e primeira previsão em uma única transação.' },
]

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

  const idempotencyKeyRef = useRef(new RegistrationIntent())

  const form = useForm<AddImmunotherapyForm>({
    resolver: zodResolver(addImmunotherapySchema),
    mode: 'onBlur',
    defaultValues: {
      name: '', cpf: '', phone: '', birthDate: '', weight: '', patientId: '',
      guardianName: '', guardianCpf: '', guardianPhone: '',
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
  const selectedProtocol = (protocolsQuery.data ?? []).find((protocol) =>
    protocol.versions.some((version) => version.id === values.protocolVersionId),
  )
  const selectedVersion = selectedProtocol?.versions.find(
    (version) => version.id === values.protocolVersionId,
  )
  const versionLabel = selectedProtocol && selectedVersion
    ? `${selectedProtocol.name} — v${selectedVersion.number}`
    : ''

  const patientDetailQuery = useQuery({
    queryKey: queryKeys.patient(organizationId, values.patientId),
    queryFn: ({ signal }) => getPatient(values.patientId, signal),
    enabled: organizationId !== '' && values.patientId !== '',
  })

  const registerMutation = useMutation({
    mutationFn: async (data: AddImmunotherapyForm) => {
      const isMinor = isMinorBirthDate(data.birthDate)
      const guardianBody = isMinor
        ? {
            fullName: data.guardianName.trim(),
            ...(data.guardianCpf.trim() ? { cpf: data.guardianCpf.replace(/\D/g, '') } : {}),
            phoneNumber: data.guardianPhone.replace(/\D/g, ''),
          }
        : undefined

      const body = {
        ...(data.patientId
          ? { patientId: data.patientId }
          : {
              patient: {
                fullName: data.name.trim(),
                birthDate: data.birthDate,
                weightInKg: Number(data.weight.replace(',', '.')),
                phoneNumber: data.phone.replace(/\D/g, ''),
                ...(data.cpf.trim() ? { cpf: data.cpf.replace(/\D/g, '') } : {}),
                responsiblePhysicianId: account?.professional?.id ?? '',
                ...(guardianBody ? { guardian: guardianBody } : {}),
              },
            }),
        immunoType: data.type.trim(),
        administrationRoute: 'SUBCUTANEOUS' as const,
        extract: data.extract.trim(),
        inductionStartDate: toZonedOffsetIso(data.startDate, '08:00', account?.organization?.timeZone ?? 'America/Sao_Paulo'),
        protocolVersionId: data.protocolVersionId,
        stepIds: data.stepIds,
        startingStepId: data.startingStepId,
        targetStepId: data.targetStepId,
      }
      const idempotencyKey = idempotencyKeyRef.current.prepare(body)
      try {
        return await registerImmunotherapy({ ...body, idempotencyKey })
      } catch (error) {
        idempotencyKeyRef.current.failed(error instanceof ApiError && error.statusCode >= 400 && error.statusCode < 500)
        throw error
      }
    },
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
      exitBlocker.allowNextNavigation()
      navigate({ to: '/immunotherapies' })
    },
  })

  const selectStep = async (target: 1 | 2 | 3) => {
    if (registerMutation.isPending) return
    if (target <= step) { setStep(target); return }
    if (values.patientId && (!patientDetailQuery.isSuccess || patientDetailQuery.isFetching)) return
    for (let current = step; current < target; current++) {
      const fields = current === 1 ? STEP_1_FIELDS : STEP_2_FIELDS
      if (!(await trigger([...fields], { shouldFocus: true }))) {
        setStep(current as 1 | 2)
        return
      }
    }
    setStep(target)
  }
  const advanceStep = () => selectStep((step + 1) as 2 | 3)

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (registerMutation.isPending) return
    if (step < 3) {
      void advanceStep()
    } else {
      void handleSubmit((data) => registerMutation.mutate(data))()
    }
  }

  const { isDirty } = form.formState
  const exitBlocker = useUnsavedChangesBlocker({
    hasUnsavedChanges:
      isDirty && !registerMutation.isSuccess,
  })

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
          onSelect={(i) => { void selectStep((i + 1) as 1 | 2 | 3) }}
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
                />
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
        onConfirm={() => {
          exitBlocker.allowNextNavigation()
          navigate({ to: '/immunotherapies' })
        }}
      />

      <CancelWizardModal
        open={exitBlocker.isBlocked}
        title="Sair sem salvar?"
        description="Há dados preenchidos que ainda não foram salvos. Se sair agora, a prescrição em andamento será perdida."
        onClose={exitBlocker.cancelLeave}
        onConfirm={exitBlocker.confirmLeave}
        cancelLabel="Sair sem salvar"
      />
    </div>
  )
}
