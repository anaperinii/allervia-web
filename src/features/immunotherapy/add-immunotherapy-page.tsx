import { useEffect, useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import { Button, CancelWizardModal, IconButton, toast, WizardStepsIndicator } from '@/shared/components'
import { useHasPermission } from '@/shared/identity/user-store'
import { useImmunotherapiesStore, type Immunotherapy } from '@/features/immunotherapy/stores/immunotherapies-store'
import { INDUCTION_INTERVAL, INITIAL_DOSE } from '@/features/immunotherapy/constants/scit-protocol'
import { registerPatientProfile, buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'
import { usePatientStore, type Application } from '@/features/patient/stores/patient-store'
import { tomorrowStr } from '@/shared/lib/dates'
import { MONTHS_PT_UPPER } from '@/shared/constants/months-pt'
import {
  addImmunotherapySchema,
  type AddImmunotherapyForm,
  STEP_1_FIELDS,
  STEP_2_FIELDS,
} from '@/features/immunotherapy/forms/add-immunotherapy'
import { PatientDataStep } from '@/features/immunotherapy/components/add-steps/patient-data-step'
import { ImmunotherapyDataStep } from '@/features/immunotherapy/components/add-steps/immunotherapy-data-step'
import { AddImmunotherapyReviewStep } from '@/features/immunotherapy/components/add-steps/add-immunotherapy-review-step'

const STEP_LABELS = ['Dados do Paciente', 'Dados da Imunoterapia', 'Revisão dos Dados']

function calculateAge(birthDateIso: string): number {
  const birth = new Date(birthDateIso + 'T12:00')
  if (isNaN(birth.getTime())) return 0
  const now = new Date()
  let age = now.getFullYear() - birth.getFullYear()
  const m = now.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--
  return age
}

function isoToPtDate(iso: string): string {
  const [yyyy, mm, dd] = iso.split('-')
  return `${dd}/${mm}/${yyyy}`
}

export function AddImmunotherapyPage() {
  const navigate = useNavigate()
  const canAdd = useHasPermission('add_immunotherapy')
  const addImmunotherapy = useImmunotherapiesStore((s) => s.addImmunotherapy)
  const immunotherapies = useImmunotherapiesStore((s) => s.immunotherapies)
  const scheduleApplication = usePatientStore((s) => s.scheduleApplication)
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient)

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
    const isDuplicate = immunotherapies.some((imm) => {
      if (imm.status !== 'active' || imm.type !== data.type.trim()) return false
      
      try {
        const patient = buildPatientFromImmunotherapy(imm)
        if (patient && patient.cpf) {
          return patient.cpf === data.cpf
        }
      } catch {
        // Caso falhe ao construir o paciente por algum motivo, checa pelo nome como fallback
      }
      return imm.name.toLowerCase() === data.name.trim().toLowerCase()
    })

    if (isDuplicate) {
      toast.danger({
        icon: <AlertCircle size={16} />,
        title: 'Paciente já cadastrado',
        description: 'Já existe um tratamento ativo com este tipo de imunoterapia para este paciente.',
      })
      return
    }

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

    sessionStorage.setItem('lastSavedImmunotherapy', JSON.stringify(data))

    toast.success({
      icon: <CheckCircle size={16} />,
      title: 'Registro salvo com sucesso!',
      description: (
        <>
          Os dados de <span className="font-semibold text-teal-700">{newImm.name}</span> foram registrados e a próxima dose já está agendada.
          <button
            type="button"
            onClick={() => {
              toast.dismiss()
              setSelectedPatient(buildPatientFromImmunotherapy(newImm))
              navigate({ to: '/patient/$patientId', params: { patientId: newId } })
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-600 hover:text-teal-700 active:text-teal-800 mt-3 transition-colors px-2.5 py-1.5 rounded-md hover:bg-teal-100/50 cursor-pointer text-left"
          >
            Acessar prontuário do paciente →
          </button>
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
    <div className="flex flex-1 flex-col bg-gray-50/80 p-4 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <IconButton aria-label="Voltar" onClick={() => setShowCancelModal(true)}>
            <ArrowLeft size={16} />
          </IconButton>
          <h1 className="text-2xl font-bold text-(--text)">Adicionar Imunoterapia</h1>
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
