import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ChevronLeft, CheckCircle } from 'lucide-react'
import { Button, CancelWizardModal, IconButton, toast, WizardStepsIndicator } from '@/shared/components'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { useImmunotherapiesStore, type Immunotherapy } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { INDUCTION_INTERVAL, INITIAL_DOSE } from '@/features/immunotherapy/constants/scit-protocol'
import { registerPatientProfile } from '@/features/patient/constants/patient-profiles'
import { usePatientStore, type Application } from '@/features/patient/stores/usePatientStore'
import { tomorrowStr, isoToPtDate, calculateAge } from '@/shared/lib/dates'
import { MONTHS_PT_UPPER } from '@/shared/constants/months-pt'
import {
  addImmunotherapySchema,
  type AddImmunotherapyForm,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
} from '@/features/immunotherapy/schemas/add-immunotherapy'
import { PatientDataStep } from '@/features/immunotherapy/components/add-steps/PatientDataStep'
import { ImmunotherapyDataStep } from '@/features/immunotherapy/components/add-steps/ImmunotherapyDataStep'
import { AddImmunotherapyReviewStep } from '@/features/immunotherapy/components/add-steps/AddImmunotherapyReviewStep'

const STEP_LABELS = ['Dados do Paciente', 'Dados da Imunoterapia', 'Revisão dos Dados']

export function AddImmunotherapyPage() {
  const navigate = useNavigate()
  const canAdd = useHasPermission('add_immunotherapy')
  const addImmunotherapy = useImmunotherapiesStore((s) => s.addImmunotherapy)
  const scheduleApplication = usePatientStore((s) => s.scheduleApplication)

  useEffect(() => {
    if (!canAdd) navigate({ to: '/immunotherapies' })
  }, [canAdd, navigate])

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showCancelModal, setShowCancelModal] = useState(false)

  const form = useForm<AddImmunotherapyForm>({
    resolver: zodResolver(addImmunotherapySchema),
    mode: 'onBlur',
    defaultValues: {
      name: '', cpf: '', phone: '', birthDate: '', weight: '', responsibleDoctor: '',
      type: '', modality: '', startDate: tomorrowStr(), extract: '', targetConcentration: '', targetVolume: '',
    },
  })
  const { handleSubmit, trigger, watch } = form

  const advanceStep = async () => {
    const fields = step === 1 ? STEP_1_FIELDS : STEP_2_FIELDS
    const isValid = await trigger([...fields])
    if (isValid) setStep((s) => (s + 1) as 1 | 2 | 3)
  }

  const saveImmunotherapy = handleSubmit((data) => {
    const newId = `new-${Date.now()}`
    const modality = data.modality as Immunotherapy['modality']

    const newImm: Immunotherapy = {
      id: newId,
      name: data.name.trim(),
      phone: data.phone.trim(),
      type: data.type.trim(),
      doseConcentration: INITIAL_DOSE,
      cycleInterval: { number: 1, days: INDUCTION_INTERVAL },
      modality,
      status: 'active',
      responsibleDoctor: data.responsibleDoctor.trim(),
    }
    addImmunotherapy(newImm)

    const startDatePt = isoToPtDate(data.startDate)
    registerPatientProfile(newId, {
      birthDate: isoToPtDate(data.birthDate),
      age: calculateAge(data.birthDate),
      cpf: data.cpf,
      weight: `${data.weight} kg`,
      extract: data.extract.trim(),
      targetConcentrationVolume: `${data.targetConcentration} - ${data.targetVolume.replace('.', ',')}ml`,
      targetReached: false,
    })

    const [, mm] = data.startDate.split('-')
    const mesIdx = Math.max(0, Math.min(11, Number(mm) - 1))
    const firstApp: Application = {
      id: `app-${newId}-1`,
      patientId: newId,
      date: startDatePt,
      startTime: '09:00',
      endTime: '09:30',
      status: 'scheduled',
      dose: INITIAL_DOSE,
      cycle: { number: 1, days: INDUCTION_INTERVAL },
      month: MONTHS_PT_UPPER[mesIdx],
      year: Number(data.startDate.split('-')[0]),
      modality,
    }
    scheduleApplication(firstApp)

    toast.success({
      icon: <CheckCircle size={16} />,
      title: 'Registro salvo com sucesso!',
      description: (
        <>
          Os dados de {newImm.name} foram registrados e a próxima dose já está agendada.
          <Link
            to="/patient/$patientId"
            params={{ patientId: newId }}
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
      void saveImmunotherapy()
    }
  }

  return (
    <div className="flex flex-1 flex-col p-4 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <IconButton aria-label="Voltar" onClick={() => setShowCancelModal(true)}>
            <ChevronLeft size={16} />
          </IconButton>
          <h1 className="text-3xl font-semibold text-(--text)">Adicionar Imunoterapia</h1>
        </div>

        <WizardStepsIndicator
          current={step - 1}
          ariaLabel="Etapas do cadastro"
          labels={STEP_LABELS}
        />

        <form onSubmit={handleFormSubmit} noValidate className="flex flex-1 min-h-0 flex-col">
          <div className="flex-1 overflow-y-auto px-5 py-4">
            {step === 1 && <PatientDataStep form={form} />}
            {step === 2 && <ImmunotherapyDataStep form={form} />}
            {step === 3 && <AddImmunotherapyReviewStep form={watch()} />}
          </div>

          <div className="border-t border-(--border-custom) px-5 py-3 flex justify-end gap-2">
            {step > 1 && (
              <Button type="button" tone="brand" variant="outline" onClick={() => setStep((s) => (s - 1) as 1 | 2 | 3)}>
                Voltar
              </Button>
            )}
            <Button type="submit" tone="brand" variant="solid">
              {step < 3 ? 'Continuar' : 'Salvar Imunoterapia'}
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
