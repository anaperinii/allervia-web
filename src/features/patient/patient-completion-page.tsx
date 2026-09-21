import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { CompletionFollowupStep } from '@/features/patient/components/treatment-completion/CompletionFollowupStep'
import { CompletionOverviewStep } from '@/features/patient/components/treatment-completion/CompletionOverviewStep'
import { CompletionReviewStep } from '@/features/patient/components/treatment-completion/CompletionReviewStep'
import { buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'
import { COMPLETION_DEFAULTS, completionSchema, type CompletionForm } from '@/features/patient/schemas/completion'
import { useCompletionDraftsStore } from '@/features/patient/stores/useCompletionDraftsStore'
import { derivePatientDates, usePatientStore } from '@/features/patient/stores/usePatientStore'
import { Button, CancelWizardModal, toast, WizardStepsBreadcrumb, type WizardStep } from '@/shared/components'
import { formatDurationFromIsoStart } from '@/shared/lib/dates'
import { useProfessionalDirectory } from '@/shared/hooks/useProfessionalDirectory'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'

import { PageHeader, SHOWCASE } from '@/shared/components/showcase'
import {
  faChartColumn,
  faCircleCheck,
  faClipboardCheck,
  faFilePen,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const STEPS: WizardStep[] = [
  { label: 'Visão geral', icon: faChartColumn, description: 'Métricas do tratamento que está sendo encerrado: aplicações realizadas, aderência, reações adversas e duração total.' },
  { label: 'Plano pós-alta', icon: faListCheck, description: 'Defina as recomendações de alta, os retornos de monitoramento e os sinais de alerta para retorno antecipado.' },
  { label: 'Revisão', icon: faClipboardCheck, description: 'Confira o resumo do desfecho e assine o encerramento. O registro vai para o prontuário e a imunoterapia é inativada.' },
]

export function PatientCompletionPage() {
  const { patientId } = useSearch({ from: '/patient-completion' })
  const selectedId = usePatientStore((s) => s.selectedPatient?.id)
  return <PatientCompletionContent key={patientId ?? selectedId ?? 'none'} />
}

function PatientCompletionContent() {
  const navigate = useNavigate()
  const { members: physicians } = useProfessionalDirectory('PHYSICIAN')
  const { patientId } = useSearch({ from: '/patient-completion' })
  const selectedPatient = usePatientStore((s) => s.selectedPatient)
  const applications = usePatientStore((s) => s.applications)
  const immunotherapies = useImmunotherapiesStore((s) => s.immunotherapies)

  const [showCancelModal, setShowCancelModal] = useState(false)
  const saveDraft = useCompletionDraftsStore((s) => s.saveDraft)
  const loadDraft = useCompletionDraftsStore((s) => s.loadDraft)
  const clearDraft = useCompletionDraftsStore((s) => s.clearDraft)

  const patient = useMemo(() => {
    if (selectedPatient && (!patientId || selectedPatient.id === patientId)) return selectedPatient
    if (!patientId) return null
    const imm = immunotherapies.find((i) => i.id === patientId)
    return imm ? buildPatientFromImmunotherapy(imm) : null
  }, [selectedPatient, patientId, immunotherapies])

  const [initialDraft] = useState(() => patient ? loadDraft(patient.id) : null)
  const [step, setStep] = useState<0 | 1 | 2>(initialDraft?.step ?? 0)
  const [draftSavedAt, setDraftSavedAt] = useState<string | null>(initialDraft?.savedAt ?? null)

  const form = useForm<CompletionForm>({
    resolver: zodResolver(completionSchema),
    mode: 'onBlur',
    defaultValues: initialDraft?.values ?? COMPLETION_DEFAULTS,
  })
  const { handleSubmit, trigger, getValues } = form


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
    const doctor = physicians.find(
      (member) => member.fullName === patient.responsibleDoctor,
    )
    if (!doctor?.councilNumber) return '—'
    return `${doctor.councilNumber}/${doctor.councilUf ?? ''}`
  }, [patient, physicians])

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

  const onConfirm = () => handleSubmit((data) => {
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

    // Encerramento estruturado (recomendações finais, retornos, sinais de
    // alerta) exige o contrato próprio de ciclo de vida; nada é gravado
    // localmente como se fosse prontuário.
    void detailParts

    toast.success({
      icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
      title: 'Encerramento ainda não disponível',
      description:
        'O registro estruturado da conclusão chega com o fluxo de ciclo de vida clínico. Nenhum dado foi gravado.',
      autoDismissMs: 8000,
    })

    navigate({ to: '/patient/$patientId', params: { patientId: patient.id } })
  })()

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step < 2) void advanceStep()
    else void onConfirm()
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <PageHeader
        breadcrumb={['Prontuário', 'Conclusão de Tratamento']}
        title={patient.name}
        actions={
          draftSavedAt && (
            <span
              className="inline-flex h-9 items-center gap-1.5 rounded-full px-4 text-[0.7rem] font-semibold"
              style={{ background: SHOWCASE.white, color: SHOWCASE.inkSoft, border: `1px solid ${SHOWCASE.line}` }}
            >
              <FontAwesomeIcon icon={faFilePen} style={{ fontSize: 11 }} />
              Rascunho salvo · {draftSavedAt}
            </span>
          )
        }
      />

      <div className="mb-2">
        <WizardStepsBreadcrumb
          steps={STEPS}
          current={step}
          ariaLabel="Etapas da conclusão"
          onSelect={(i) => setStep(i as 0 | 1 | 2)}
        />
      </div>

      <form onSubmit={handleFormSubmit} noValidate className="wizard-fields flex flex-1 min-h-0 flex-col">
        <div
          key={step}
          className="flex flex-1 flex-col overflow-y-auto pt-1 pb-4 animate-in fade-in-0 slide-in-from-right-2 duration-300"
        >
          <div className="w-full">
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
        </div>

        <div className="border-t border-(--border-custom) pt-3 flex items-center justify-end gap-2">
          <Button type="button" tone="danger" variant="outline" onClick={() => setShowCancelModal(true)}>
            Cancelar
          </Button>
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

      <CancelWizardModal
        open={showCancelModal}
        title="Sair da conclusão?"
        description="Suas últimas inserções serão salvas automaticamente como rascunho. Você pode retomar a conclusão de onde parou a qualquer momento."
        keepEditingLabel="Continuar editando"
        secondaryLabel="Sair sem salvar"
        onSecondary={() => {
          setShowCancelModal(false)
          clearDraft(patient.id)
          navigate({ to: '/patient/$patientId', params: { patientId: patient.id } })
        }}
        cancelLabel="Salvar e sair"
        cancelTone="brand"
        onClose={() => setShowCancelModal(false)}
        onConfirm={() => {
          persistDraft()
          toast.success({
            icon: <FontAwesomeIcon icon={faFilePen} style={{ fontSize: 16 }} />,
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
