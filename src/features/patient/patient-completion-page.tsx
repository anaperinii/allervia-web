import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle, FileEdit } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  Button,
  CancelWizardModal,
  IconButton,
  toast,
  WizardStepsIndicator,
} from '@/shared/components'
import { usePatientStore, derivePatientDates } from '@/features/patient/stores/usePatientStore'
import { buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { PROFILES } from '@/shared/stores/useUserStore'
import { formatDurationFromIsoStart } from '@/shared/lib/dates'
import {
  completionSchema,
  COMPLETION_DEFAULTS,
  type CompletionForm,
} from '@/features/patient/schemas/completion'
import { CompletionOverviewStep } from '@/features/patient/components/treatment-completion/CompletionOverviewStep'
import { CompletionFollowupStep } from '@/features/patient/components/treatment-completion/CompletionFollowupStep'
import { CompletionReviewStep } from '@/features/patient/components/treatment-completion/CompletionReviewStep'
import { useCompletionDraftsStore } from '@/features/patient/stores/useCompletionDraftsStore'

const STEP_LABELS = ['Visão geral', 'Plano pós-alta', 'Revisão'] as const

export function PatientCompletionPage() {
  const navigate = useNavigate()
  const { patientId } = useSearch({ from: '/patient-completion' })
  const selectedPatient = usePatientStore((s) => s.selectedPatient)
  const applications = usePatientStore((s) => s.applications)
  const inactivateImmunotherapy = usePatientStore((s) => s.inactivateImmunotherapy)
  const immunotherapies = useImmunotherapiesStore((s) => s.immunotherapies)

  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(null)
  const restoredRef = useRef(false)
  const saveDraft = useCompletionDraftsStore((s) => s.saveDraft)
  const loadDraft = useCompletionDraftsStore((s) => s.loadDraft)
  const clearDraft = useCompletionDraftsStore((s) => s.clearDraft)

  const patient = useMemo(() => {
    if (selectedPatient && (!patientId || selectedPatient.id === patientId)) return selectedPatient
    if (!patientId) return null
    const imm = immunotherapies.find((i) => i.id === patientId)
    return imm ? buildPatientFromImmunotherapy(imm) : null
  }, [selectedPatient, patientId, immunotherapies])

  const form = useForm<CompletionForm>({
    resolver: zodResolver(completionSchema),
    mode: 'onBlur',
    defaultValues: COMPLETION_DEFAULTS,
  })
  const { handleSubmit, trigger, reset, getValues } = form

  useEffect(() => {
    if (restoredRef.current || !patient) return
    restoredRef.current = true
    const draft = loadDraft(patient.id)
    if (draft) {
      reset(draft.values)
      setStep(draft.step)
      setDraftSavedAt(draft.savedAt)
    }
  }, [patient, loadDraft, reset])

  const patientApplications = useMemo(
    () => (patient ? applications.filter((application) => application.patientId === patient.id) : []),
    [applications, patient],
  )
  const realizedApplications = useMemo(
    () => patientApplications.filter((application) => application.status === 'completed'),
    [patientApplications],
  )
  const adverseEventsCount = useMemo(
    () => realizedApplications.filter((application) => application.sideEffect === 'yes').length,
    [realizedApplications],
  )
  const rescheduledCount = useMemo(
    () => patientApplications.filter((application) => application.status === 'missed' || application.status === 'canceled').length,
    [patientApplications],
  )
  const adherencePct = useMemo(() => {
    const base = realizedApplications.length + rescheduledCount
    if (base === 0) return 100
    return Math.round((realizedApplications.length / base) * 100)
  }, [realizedApplications, rescheduledCount])

  const { inductionStart, maintenanceStart } = useMemo(
    () => (patient ? derivePatientDates(applications, patient.id) : { inductionStart: null, maintenanceStart: null }),
    [patient, applications],
  )

  const totalDurationLabel = useMemo(
    () => formatDurationFromIsoStart(inductionStart),
    [inductionStart],
  )

  const doctorRegistration = useMemo(() => {
    if (!patient) return '—'
    const doctor = PROFILES.find((profile) => profile.name === patient.responsibleDoctor)
    return doctor?.registration ?? '—'
  }, [patient])

  if (!patient) {
    return (
      <div className="flex flex-1 items-center justify-center">
        <span className="text-xs text-(--text-muted)">Paciente não encontrado</span>
      </div>
    )
  }

  const advanceStep = async () => {
    if (step === 1) {
      const ok = await trigger(['monitoringSchedule', 'warningSigns'])
      if (!ok) return
    }
    setStep((s) => (s + 1) as 0 | 1 | 2)
  }

  const persistDraft = () => {
    if (!patient) return
    const savedAt = format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
    saveDraft({ patientId: patient.id, step, values: getValues(), savedAt })
    setDraftSavedAt(savedAt)
  }

  const onConfirm = handleSubmit((data) => {
    clearDraft(patient.id)
    const recommendations: string[] = []
    if (data.recommendRetesting) recommendations.push('Retestagem alérgica')
    if (data.maintainRescueMed) recommendations.push('Medicação de resgate')
    if (data.environmentalControl) recommendations.push('Controle ambiental')
    recommendations.push(...(data.customRecommendations ?? []).map((recommendation) => recommendation.trim()).filter(Boolean))

    const detailParts = [
      'Tratamento concluído — desfecho de sucesso.',
      `Período: ${inductionStart ?? '-'} → hoje (${totalDurationLabel}).`,
      `${realizedApplications.length} aplicações · ${adverseEventsCount} eventos adversos · aderência ${adherencePct}%.`,
      recommendations.length ? `Recomendações: ${recommendations.join(', ')}.` : null,
      data.monitoringSchedule?.trim() ? `Retornos: ${data.monitoringSchedule.trim()}.` : null,
      data.warningSigns?.trim() ? `Sinais de alerta: ${data.warningSigns.trim()}.` : null,
      data.note?.trim() ? `Nota: ${data.note.trim()}.` : null,
    ].filter(Boolean) as string[]

    inactivateImmunotherapy({
      id: `complete-${Date.now()}`,
      category: 'treatment_completion',
      detail: detailParts.join(' '),
      startDate: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      expectedReturnDate: null,
      responsibleDoctor: patient.responsibleDoctor,
      snapshotConcentration: patient.currentDoseConcentration,
      snapshotInterval: patient.currentInterval,
    })

    toast.success({
      icon: <CheckCircle size={16} />,
      title: 'Tratamento concluído',
      description: 'O protocolo foi encerrado com desfecho de sucesso e o registro está disponível no prontuário.',
      autoDismissMs: 8000,
    })

    navigate({ to: '/patient/$patientId', params: { patientId: patient.id } })
  })

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step < 2) void advanceStep()
    else void onConfirm()
  }

  return (
    <div className="flex flex-1 flex-col p-4 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <IconButton aria-label="Voltar" onClick={() => setShowCancelModal(true)}>
            <ArrowLeft size={16} />
          </IconButton>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold text-(--text)">Concluir tratamento</h1>
            <p className="text-[0.7rem] text-(--text-muted)">{patient.name}</p>
          </div>
          {draftSavedAt && (
            <span className="inline-flex items-center gap-1.5 text-[0.6rem] font-semibold text-(--text-muted) bg-gray-50 border border-(--border-custom) rounded-full px-2.5 py-1">
              <FileEdit size={11} className="text-brand" />
              Rascunho salvo · {draftSavedAt}
            </span>
          )}
        </div>

        <WizardStepsIndicator
          current={step}
          ariaLabel="Etapas da conclusão"
          labels={STEP_LABELS}
        />

        <form onSubmit={handleFormSubmit} noValidate className="flex flex-1 min-h-0 flex-col">
          <div key={step} className="flex-1 overflow-y-auto px-5 py-4 animate-in fade-in-0 slide-in-from-right-2 duration-300">
            {step === 0 && (
              <CompletionOverviewStep
                patient={patient}
                applications={patientApplications}
                inductionStart={inductionStart}
                maintenanceStart={maintenanceStart}
                totalApplications={realizedApplications.length}
                adherencePct={adherencePct}
                rescheduledCount={rescheduledCount}
                adverseEventsCount={adverseEventsCount}
                totalDurationLabel={totalDurationLabel}
              />
            )}
            {step === 1 && <CompletionFollowupStep form={form} />}
            {step === 2 && (
              <CompletionReviewStep
                form={form}
                patient={patient}
                doctorRegistration={doctorRegistration}
                inductionStart={inductionStart}
                totalApplications={realizedApplications.length}
                adverseEventsCount={adverseEventsCount}
                totalDurationLabel={totalDurationLabel}
              />
            )}
          </div>

          <div className="border-t border-(--border-custom) px-5 py-3 flex items-center justify-end gap-2">
            {step > 0 && (
              <Button type="button" tone="brand" variant="outline" onClick={() => setStep((s) => (s - 1) as 0 | 1 | 2)}>
                Voltar
              </Button>
            )}
            <Button type="submit" tone="brand" variant="solid">
              {step < 2 ? 'Continuar' : 'Concluir tratamento'}
            </Button>
          </div>
        </form>
      </div>

      <CancelWizardModal
        open={showCancelModal}
        title="Sair da conclusão?"
        description="Suas últimas inserções serão salvas automaticamente como rascunho. Você pode retomar a conclusão de onde parou a qualquer momento."
        keepEditingLabel="Continuar editando"
        cancelLabel="Salvar e sair"
        cancelTone="brand"
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          persistDraft()
          toast.success({
            icon: <FileEdit size={16} />,
            title: 'Rascunho salvo',
            description: 'Você pode retomar a conclusão de onde parou.',
            autoDismissMs: 4000,
          })
          navigate({ to: '/patient/$patientId', params: { patientId: patient.id } })
        }}
      />
    </div>
  )
}
