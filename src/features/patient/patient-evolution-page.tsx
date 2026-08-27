import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, differenceInDays, format } from 'date-fns'
import { Button, CancelWizardModal, toast, WizardStepsBreadcrumb, type WizardStep } from '@/shared/components'
import { usePatientStore, derivePatientDates } from '@/features/patient/stores/usePatientStore'
import { buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'
import { useImmunotherapiesStore, type Immunotherapy } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { useHasPermission, useUserStore } from '@/shared/stores/useUserStore'
import { useAuditStore } from '@/shared/stores/useAuditStore'
import { calculateNextDose, parseDose } from '@/features/immunotherapy/constants/scit-protocol'
import { comparePtDateDesc, parsePtDate } from '@/shared/lib/dates'
import { MONTHS_PT_UPPER } from '@/shared/constants/months-pt'
import {
  evolutionSchema,
  type EvolutionForm,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
  EVOLUTION_DEFAULTS,
} from '@/features/patient/schemas/evolution'
import { SelectPatientStep } from '@/features/patient/components/treatment-evolution/SelectPatientStep'
import { PreApplicationStep } from '@/features/patient/components/treatment-evolution/PreApplicationStep'
import { PostApplicationStep } from '@/features/patient/components/treatment-evolution/PostApplicationStep'
import { EvolutionReviewStep } from '@/features/patient/components/treatment-evolution/EvolutionReviewStep'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faClipboardCheck, faNotesMedical, faSyringe, faUser } from '@fortawesome/free-solid-svg-icons'
import { PageHeader } from '@/shared/components/showcase'

const STEPS: WizardStep[] = [
  { label: 'Paciente', icon: faUser, description: 'Escolha a imunoterapia a evoluir e confira a última aplicação, a dose atual e o que o protocolo prevê como próxima.' },
  { label: 'Pré-Aplicação', icon: faSyringe, description: 'Relate como o paciente passou no intervalo: efeitos colaterais, necessidade de medicação e o que foi observado.' },
  { label: 'Pós-Aplicação', icon: faNotesMedical, description: 'Registre a aplicação realizada com data, horário, responsável, concentração e volume, e defina o intervalo até a próxima dose.' },
  { label: 'Revisão dos Dados', icon: faClipboardCheck, description: 'Confira o que será gravado no prontuário e a próxima aplicação que será agendada automaticamente.' },
]

export function PatientEvolutionPage() {
  const navigate = useNavigate()
  const { patientId: preselectedId } = useSearch({ from: '/patient-evolution' })
  const setStorePatient = usePatientStore((s) => s.setSelectedPatient)
  const recordEvolution = usePatientStore((s) => s.recordEvolution)
  const applications = usePatientStore((s) => s.applications)
  const patientFromStore = usePatientStore((s) => s.selectedPatient)
  const currentUser = useUserStore((s) => s.current)
  const logAccess = useAuditStore((s) => s.logAccess)
  const immunotherapies = useImmunotherapiesStore((s) => s.immunotherapies)
  const canEvolve = useHasPermission('evolve_patient')

  useEffect(() => {
    if (!canEvolve) navigate({ to: '/immunotherapies' })
  }, [canEvolve, navigate])

  const [step, setStep] = useState<0 | 1 | 2 | 3>(0)
  const [showCancelModal, setShowCancelModal] = useState(false)
  const [selectedImmunotherapy, setSelectedImmunotherapy] = useState<Immunotherapy | null>(null)

  const form = useForm<EvolutionForm>({
    resolver: zodResolver(evolutionSchema),
    mode: 'onBlur',
    defaultValues: EVOLUTION_DEFAULTS,
  })
  const { handleSubmit, trigger, watch, getValues, setValue, formState: { errors } } = form

  const handleSelect = (item: Immunotherapy) => {
    setSelectedImmunotherapy(item)
    setStorePatient(buildPatientFromImmunotherapy(item))
  }

  useEffect(() => {
    if (preselectedId && !selectedImmunotherapy) {
      const found = immunotherapies.find((immunotherapy) => immunotherapy.id === preselectedId)
      if (found) handleSelect(found)
    }
  }, [preselectedId, immunotherapies])

  const applicationsForPatient = useMemo(() => {
    if (!selectedImmunotherapy) return []
    return applications.filter((application) => application.patientId === selectedImmunotherapy.id)
  }, [applications, selectedImmunotherapy])

  const lastApplication = useMemo(() => {
    const realized = applicationsForPatient.filter((application) => application.status === 'completed')
    if (!realized.length) return null
    return [...realized].sort((a, b) => comparePtDateDesc(a.date, b.date))[0]
  }, [applicationsForPatient])

  const doseNumber = useMemo(
    () => applicationsForPatient.filter((application) => application.status === 'completed').length,
    [applicationsForPatient],
  )

  const nextDose = useMemo(() => {
    if (!lastApplication || !selectedImmunotherapy) return null
    const [d, m, y] = lastApplication.date.split('/')
    const currentDose = `${lastApplication.extractConcentration || lastApplication.dose.split(' - ')[0]} - ${lastApplication.appliedVolume || lastApplication.dose.split(' - ')[1]}`
    const currentInterval = lastApplication.cycle.days
    const calc = calculateNextDose(currentDose, currentInterval)
    const nextDate = addDays(new Date(+y, +m - 1, +d), calc.interval)
    const next = parseDose(calc.dose)
    return {
      date: format(nextDate, 'dd/MM/yyyy'),
      conc: next?.conc ?? calc.dose,
      vol: next?.vol ?? '',
      dose: doseNumber + 1,
      interval: calc.interval,
    }
  }, [lastApplication, selectedImmunotherapy, doseNumber])

  const formValues = watch()

  const plannedNext = useMemo(() => {
    if (!formValues.applicationDate || !formValues.nextInterval || !formValues.nextInterval.trim()) return null
    const [y, m, d] = formValues.applicationDate.split('-')
    if (!y || !m || !d) return null
    const applicationDate = new Date(+y, +m - 1, +d)
    if (isNaN(applicationDate.getTime())) return null
    const intervalDays = parseInt(formValues.nextInterval.trim(), 10)
    if (isNaN(intervalDays) || intervalDays <= 0) return null
    const nextDate = addDays(applicationDate, intervalDays)
    return { date: format(nextDate, 'dd/MM/yyyy'), interval: intervalDays, applicationDate }
  }, [formValues.applicationDate, formValues.nextInterval])

  const treatmentTime = useMemo(() => {
    if (!patientFromStore) return null
    const { inductionStart } = derivePatientDates(applications, patientFromStore.id)
    if (!inductionStart) return null
    try {
      const start = parsePtDate(inductionStart)
      const days = differenceInDays(new Date(), start)
      const years = Math.floor(days / 365)
      if (years > 0) return `${years} ${years === 1 ? 'ano' : 'anos'}`
      const months = Math.floor(days / 30)
      if (months > 0) return `${months} ${months === 1 ? 'mês' : 'meses'}`
      return `${days} ${days === 1 ? 'dia' : 'dias'}`
    } catch {
      return null
    }
  }, [patientFromStore, applications])

  const advanceStep = async () => {
    if (step === 0 && (!selectedImmunotherapy || selectedImmunotherapy.status === 'inactive')) return
    if (step === 1) {
      const ok = await trigger([...STEP_1_FIELDS])
      if (!ok) return
      if (nextDose) {
        const p = getValues()
        if (!p.applicationDate) setValue('applicationDate', nextDose.date.split('/').reverse().join('-'))
        if (!p.appliedVolume) setValue('appliedVolume', nextDose.vol.replace('ml', '').replace(',', '.'))
        if (!p.concentration) setValue('concentration', nextDose.conc)
        if (!p.nextInterval) setValue('nextInterval', String(nextDose.interval))
      }
    }
    if (step === 2) {
      const ok = await trigger([...STEP_2_FIELDS])
      if (!ok) return
    }
    setStep((s) => (s + 1) as 0 | 1 | 2 | 3)
  }

  const onSaveEvolution = handleSubmit((data) => {
    if (!selectedImmunotherapy || !plannedNext) return
    const [y, m, d] = data.applicationDate.split('-')
    const dataRealizada = `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`
    const mesRealizada = MONTHS_PT_UPPER[parseInt(m, 10) - 1]
    const volStr = data.appliedVolume.replace('.', ',') + 'ml'
    const doseStr = `${data.concentration} - ${volStr}`
    const interval = plannedNext.interval
    const ciclo = interval === 7 ? 1 : interval === 14 ? 1 : interval === 21 ? 2 : interval === 28 ? 3 : 1
    const nextDateParts = plannedNext.date.split('/')
    const nextMonth = MONTHS_PT_UPPER[parseInt(nextDateParts[1], 10) - 1]

    const completed = {
      id: `evo-${Date.now()}-r`,
      patientId: selectedImmunotherapy.id,
      date: dataRealizada,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'completed' as const,
      dose: doseStr,
      cycle: { number: ciclo, days: interval },
      month: mesRealizada,
      year: parseInt(y, 10),
      appliedVolume: volStr,
      extractConcentration: data.concentration,
      sideEffect: data.sideEffectPost,
      reportedEffects: data.sideEffectPost === 'yes' ? data.reportedEffectsPost : undefined,
      medicationNeeded: data.medicationNeededPost,
      medications: data.medicationNeededPost === 'yes' ? data.medicationsPost : undefined,
      administrator: data.administrator,
      administratorNote: data.notesPost || '-',
    }

    const nextCalc = calculateNextDose(doseStr, interval)
    const next = {
      id: `evo-${Date.now()}-n`,
      patientId: selectedImmunotherapy.id,
      date: plannedNext.date,
      startTime: data.startTime,
      endTime: data.endTime,
      status: 'scheduled' as const,
      dose: nextCalc.dose,
      cycle: { number: ciclo, days: nextCalc.interval },
      month: nextMonth,
      year: parseInt(nextDateParts[2], 10),
    }

    recordEvolution({ completed, next })

    logAccess({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userRegistration: currentUser.registration,
      patientId: selectedImmunotherapy.id,
      patientName: selectedImmunotherapy.name,
      action: 'apply_dose',
      description: `Aplicou ${doseStr} em ${dataRealizada} (ciclo ${ciclo} · intervalo ${interval} dias) · responsável: ${data.administrator}`,
    })

    toast.success({
      icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
      title: 'Evolução registrada com sucesso!',
      description: (
        <>
          A aplicação de {selectedImmunotherapy.name} foi registrada e a próxima dose já está agendada.
          <Link
            to="/patient/$patientId"
            params={{ patientId: selectedImmunotherapy.id }}
            className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 mt-2 transition-colors"
          >
            Acessar prontuário do paciente &rarr;
          </Link>
        </>
      ),
      autoDismissMs: 8000,
    })

    navigate({ to: '/immunotherapies' })
  })

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (step < 3) {
      void advanceStep()
    } else {
      void onSaveEvolution()
    }
  }

  const continueDisabled = step === 0 && (!selectedImmunotherapy || selectedImmunotherapy.status === 'inactive')

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <PageHeader
        key={selectedImmunotherapy?.id ?? 'root'}
        breadcrumb={[
          preselectedId ? 'Prontuário' : 'Imunoterapias',
          ...(selectedImmunotherapy ? ['Evolução do Paciente'] : []),
        ]}
        title={selectedImmunotherapy ? selectedImmunotherapy.name : 'Evolução do Paciente'}
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
          <div
            className="flex flex-1 min-h-0 flex-col justify-start px-2 pt-1 pb-10 overflow-y-auto"
          >
            <div className="w-full">
              {step === 0 && (
                <SelectPatientStep
                  selected={selectedImmunotherapy}
                  patient={patientFromStore}
                  applicationsForPatient={applicationsForPatient}
                  lastApplication={lastApplication}
                  doseNumber={doseNumber}
                  nextDose={nextDose}
                  treatmentTime={treatmentTime}
                  immunotherapies={immunotherapies}
                  preselectedLocked={!!preselectedId && !!selectedImmunotherapy}
                  onSelect={handleSelect}
                />
              )}
              {step === 1 && <PreApplicationStep form={form} />}
              {step === 2 && <PostApplicationStep form={form} />}
              {step === 3 && (
                <EvolutionReviewStep
                  form={formValues}
                  plannedNextDate={plannedNext?.date ?? null}
                  plannedNextInterval={plannedNext?.interval ?? null}
                />
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
            <Button type="submit" tone="brand" variant="solid" disabled={step < 3 && continueDisabled}>
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

      {errors && Object.keys(errors).length > 0 && step === 3 && (
        <p className="sr-only" role="alert">Existem erros no formulário. Revise as etapas anteriores.</p>
      )}
    </div>
  )
}
