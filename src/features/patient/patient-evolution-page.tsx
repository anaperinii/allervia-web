import { EvolutionReviewStep } from '@/features/patient/components/treatment-evolution/EvolutionReviewStep'
import { PostApplicationStep } from '@/features/patient/components/treatment-evolution/PostApplicationStep'
import { PreApplicationStep } from '@/features/patient/components/treatment-evolution/PreApplicationStep'
import { SelectPatientStep } from '@/features/patient/components/treatment-evolution/SelectPatientStep'
import {
  EVOLUTION_DEFAULTS,
  evolutionSchema,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
  type EvolutionForm,
} from '@/features/patient/schemas/evolution'
import {
  administerDose,
  getDose,
  getImmunotherapy,
  listDosesForTherapy,
  previewDose,
} from '@/shared/api/clinical.api'
import type {
  AdministerDoseBody,
  ImmunotherapyListItem,
  PreviewDoseBody,
} from '@/shared/api/contracts/clinical'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { Button, CancelWizardModal, toast, WizardStepsBreadcrumb, type WizardStep } from '@/shared/components'
import { todayStr, toOffsetIso } from '@/shared/lib/dates'
import { useProfessionalDirectory } from '@/shared/hooks/useProfessionalDirectory'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { PageHeader } from '@/shared/components/showcase'
import { faCircleCheck, faClipboardCheck, faNotesMedical, faSyringe, faUser } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const STEPS: WizardStep[] = [
  { label: 'Paciente', icon: faUser, description: 'Escolha a imunoterapia a evoluir e confira a última aplicação e a previsão pendente persistida.' },
  { label: 'Pré-Aplicação', icon: faSyringe, description: 'Relate como o paciente passou no intervalo: efeitos colaterais, necessidade de medicação e o que foi observado.' },
  { label: 'Pós-Aplicação', icon: faNotesMedical, description: 'Registre o valor permitido administrado, a janela de horário, o executor e a conduta imediata quando houver reação.' },
  { label: 'Revisão dos Dados', icon: faClipboardCheck, description: 'Confira previsto, realizado e a recomendação do servidor. Salvar grava tudo em uma única transação.' },
]

/** Texto livre vira lista para o contrato de observações. */
function toList(text: string): string[] {
  return text
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

export function PatientEvolutionPage() {
  const { therapy } = useSearch({ from: '/patient-evolution' })
  return <PatientEvolutionContent key={therapy ?? 'selection'} />
}

function PatientEvolutionContent() {
  const navigate = useNavigate()
  const { therapy: preselectedId } = useSearch({ from: '/patient-evolution' })
  const canEvolve = useHasPermission('evolve_patient')
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const queryClient = useQueryClient()
  const { members: professionals } = useProfessionalDirectory()

  useEffect(() => {
    if (!canEvolve) navigate({ to: '/immunotherapies' })
  }, [canEvolve, navigate])

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(preselectedId ?? null)
  const [failure, setFailure] = useState<string | null>(null)

  // Uma chave por intenção de formulário; reenvio por perda de resposta reutiliza a mesma.
  const idempotencyKeyRef = useRef<string>(crypto.randomUUID())

  const therapyQuery = useQuery({
    queryKey: queryKeys.immunotherapy(organizationId, selectedId ?? ''),
    queryFn: ({ signal }) => getImmunotherapy(selectedId!, signal),
    enabled: organizationId !== '' && selectedId !== null,
  })
  const therapy = therapyQuery.data ?? null

  const pendingDoseId =
    therapy?.nextDose && therapy.nextDose.status === 'SCHEDULED'
      ? therapy.nextDose.id
      : null

  const doseQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, pendingDoseId ?? ''),
    queryFn: ({ signal }) => getDose(pendingDoseId!, signal),
    enabled: organizationId !== '' && pendingDoseId !== null,
  })
  const dose = doseQuery.data ?? null

  const historyQuery = useQuery({
    queryKey: queryKeys.doses(organizationId, selectedId ?? ''),
    queryFn: ({ signal }) => listDosesForTherapy(selectedId!, signal),
    enabled: organizationId !== '' && selectedId !== null,
  })
  const administeredDoses = (historyQuery.data ?? []).filter(
    (record) => record.administeredAt !== null,
  )
  const lastAdministered =
    administeredDoses.length > 0
      ? [...administeredDoses].sort((a, b) =>
          (b.administeredAt ?? '').localeCompare(a.administeredAt ?? ''),
        )[0]
      : null

  const form = useForm<EvolutionForm>({
    resolver: zodResolver(evolutionSchema),
    mode: 'onBlur',
    defaultValues: { ...EVOLUTION_DEFAULTS, applicationDate: todayStr() },
  })
  const { handleSubmit, trigger, control, getValues, setValue, setError } = form
  const formValues = useWatch({ control }) as EvolutionForm

  // O valor previsto pela prescrição entra como seleção inicial.
  useEffect(() => {
    if (dose?.plannedStepId && !getValues('stepId')) {
      setValue('stepId', dose.plannedStepId)
    }
  }, [dose, getValues, setValue])

  const allowedValues = dose?.allowedValues ?? []
  const plannedStep =
    allowedValues.find((candidate) => candidate.id === dose?.plannedStepId) ?? null
  const selectedStep =
    allowedValues.find((candidate) => candidate.id === formValues.stepId) ?? null
  const performerName =
    professionals.find((member) => member.professionalId === formValues.performerId)
      ?.fullName ?? null

  function previewBody(): PreviewDoseBody | null {
    if (!dose || !selectedStep || !formValues.applicationDate || !formValues.startTime)
      return null
    return {
      values: {
        concentration: selectedStep.concentration,
        volume: selectedStep.volume,
        intervalDays: selectedStep.intervalDays,
        stepId: selectedStep.id,
      },
      administeredAt: toOffsetIso(formValues.applicationDate, formValues.startTime),
      expectedRevision: dose.revision,
      expectedTherapyRevision: dose.therapyRevision,
    }
  }
  const bodyForPreview = previewBody()

  // A prévia é do corpo exato: dose, valor, instante e revisões na chave fazem
  // respostas fora de ordem serem descartadas pelo próprio cache.
  const previewQuery = useQuery({
    queryKey: [
      ...queryKeys.dose(organizationId, dose?.id ?? ''),
      'preview',
      bodyForPreview?.values.stepId,
      bodyForPreview?.administeredAt,
      bodyForPreview?.expectedRevision,
      bodyForPreview?.expectedTherapyRevision,
    ],
    queryFn: ({ signal }) => previewDose(dose!.id, bodyForPreview!, signal),
    enabled: step === 3 && dose !== null && bodyForPreview !== null,
    retry: false,
    staleTime: 0,
  })

  const administerMutation = useMutation({
    mutationFn: (body: AdministerDoseBody) => administerDose(dose!.id, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Evolução registrada!',
        description: (
          <>
            Aplicação, observações e a próxima previsão foram gravadas juntas.
            {therapy && (
              <Link
                to="/patient/$patientId"
                params={{ patientId: therapy.patient.id }}
                search={{ therapy: therapy.id }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 mt-2 transition-colors"
              >
                Acessar prontuário do paciente &rarr;
              </Link>
            )}
          </>
        ),
        autoDismissMs: 8000,
      })
      navigate({ to: '/immunotherapies' })
    },
    onError: async (error) => {
      // Falha não gera sucesso local. Revisão desatualizada recarrega a dose
      // para nova confirmação clínica — nunca reenvia com revisões trocadas.
      if (error instanceof ApiError && error.code === 'STALE_CLINICAL_REVISION') {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.dose(organizationId, dose?.id ?? ''),
        })
        setFailure(
          'O tratamento mudou desde que você abriu este formulário. Os dados foram recarregados; revise e confirme novamente.',
        )
        return
      }
      setFailure(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível registrar a evolução. O estado da dose foi reconsultado; verifique antes de reenviar.',
      )
    },
  })

  const advanceStep = async () => {
    if (step === 0) {
      if (!therapy || therapy.status !== 'IN_PROGRESS' || !dose || dose.migrationRequired) return
    }
    if (step === 1) {
      const ok = await trigger([...STEP_1_FIELDS])
      if (!ok) return
    }
    if (step === 2) {
      const ok = await trigger([...STEP_2_FIELDS])
      if (!ok) return
      const values = getValues()
      if (
        dose?.plannedStepId &&
        values.stepId !== dose.plannedStepId &&
        !values.adjustmentReason.trim()
      ) {
        setError('adjustmentReason', {
          type: 'custom',
          message: 'Justifique o valor diferente do previsto',
        })
        return
      }
    }
    setStep((s) => (s + 1) as 0 | 1 | 2 | 3)
  }

  const onSaveEvolution = () =>
    handleSubmit((data) => {
      if (!dose || !selectedStep) return
      setFailure(null)
      const observations: AdministerDoseBody['observations'] = [
        {
          phase: 'PRE_ADMINISTRATION',
          reportedSideEffects: data.sideEffect === 'yes' ? toList(data.reportedEffects) : [],
          administeredMedications: data.medicationNeeded === 'yes' ? toList(data.medications) : [],
          ...(data.notesPre.trim() ? { notes: data.notesPre.trim() } : {}),
        },
        {
          phase: 'POST_ADMINISTRATION',
          reportedSideEffects: data.sideEffectPost === 'yes' ? toList(data.reportedEffectsPost) : [],
          administeredMedications: data.medicationNeededPost === 'yes' ? toList(data.medicationsPost) : [],
          ...(data.notesPost.trim() ? { notes: data.notesPost.trim() } : {}),
        },
      ]
      administerMutation.mutate({
        idempotencyKey: idempotencyKeyRef.current,
        values: {
          concentration: selectedStep.concentration,
          volume: selectedStep.volume,
          intervalDays: selectedStep.intervalDays,
          stepId: selectedStep.id,
        },
        administeredAt: toOffsetIso(data.applicationDate, data.startTime),
        ...(data.endTime
          ? { administrationEndedAt: toOffsetIso(data.applicationDate, data.endTime) }
          : {}),
        expectedRevision: dose.revision,
        expectedTherapyRevision: dose.therapyRevision,
        betweenDosesReport: data.intervalReport.trim(),
        performedById: data.performerId,
        ...(data.stepId !== dose.plannedStepId && data.adjustmentReason.trim()
          ? { reason: data.adjustmentReason.trim() }
          : {}),
        observations,
        ...(data.conduct
          ? {
              immediateConduct: {
                type: data.conduct,
                justification: data.conductJustification.trim(),
              },
            }
          : {}),
      })
    })()

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step < 3) {
      void advanceStep()
    } else {
      void onSaveEvolution()
    }
  }

  const continueDisabled =
    step === 0 &&
    (!therapy ||
      therapy.status !== 'IN_PROGRESS' ||
      !dose ||
      dose.migrationRequired ||
      doseQuery.isPending)

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <PageHeader
        key={therapy?.id ?? 'root'}
        breadcrumb={[
          preselectedId ? 'Prontuário' : 'Imunoterapias',
          ...(therapy ? ['Evolução do Paciente'] : []),
        ]}
        title={therapy ? therapy.patient.fullName : 'Evolução do Paciente'}
      />

      <div className="mb-2">
        <WizardStepsBreadcrumb
          steps={STEPS}
          current={step}
          ariaLabel="Etapas da evolução"
          onSelect={(i) => setStep(i as 0 | 1 | 2 | 3)}
        />
      </div>

      <div className="wizard-fields flex flex-1 min-h-0 flex-col overflow-hidden">
        <form onSubmit={handleFormSubmit} noValidate className="flex flex-1 min-h-0 flex-col">
          <div className="flex flex-1 min-h-0 flex-col justify-start px-2 pt-1 pb-10 overflow-y-auto">
            <div className="w-full">
              {step === 0 && (
                <SelectPatientStep
                  selected={therapy}
                  pendingDose={dose}
                  lastAdministered={lastAdministered}
                  administeredCount={administeredDoses.length}
                  isLoadingDose={
                    therapyQuery.isPending || (pendingDoseId !== null && doseQuery.isPending)
                  }
                  preselectedLocked={!!preselectedId}
                  onSelect={(item: ImmunotherapyListItem) => setSelectedId(item.id)}
                />
              )}
              {step === 1 && <PreApplicationStep form={form} />}
              {step === 2 && <PostApplicationStep form={form} dose={dose} />}
              {step === 3 && (
                <EvolutionReviewStep
                  form={formValues}
                  plannedStep={plannedStep}
                  selectedStep={selectedStep}
                  performerName={performerName}
                  preview={previewQuery.data ?? null}
                  previewPending={previewQuery.isPending && previewQuery.fetchStatus !== 'idle'}
                  previewError={
                    previewQuery.error
                      ? previewQuery.error instanceof ApiError
                        ? previewQuery.error.message
                        : 'Não foi possível consultar a recomendação.'
                      : null
                  }
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
            {step > 0 && (
              <Button type="button" tone="brand" variant="outline" onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2 | 3)}>
                Voltar
              </Button>
            )}
            <Button
              type="submit"
              tone="brand"
              variant="solid"
              disabled={(step < 3 && continueDisabled) || administerMutation.isPending}
            >
              {step < 3 ? 'Continuar' : 'Salvar Evolução'}
            </Button>
          </div>
        </form>
      </div>

      <CancelWizardModal
        open={showCancelModal}
        title="Cancelar evolução?"
        description="Os dados preenchidos serão perdidos. Deseja realmente cancelar a evolução do paciente?"
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => navigate({ to: '/immunotherapies' })}
      />
    </div>
  )
}
