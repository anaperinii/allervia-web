import { useEffect, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft } from 'lucide-react'
import { Button, ConfirmDiscardModal, FieldLabel, Modal, ReadOnlyField, Select, TextInput } from '@/shared/components'
import { PROFILES } from '@/shared/identity/user-store'
import { editPatientSchema, type EditPatientForm } from '@/features/patient/schemas/edit-patient'
import { useUnsavedChangesGuard } from '@/shared/hooks/use-unsaved-changes-guard'
import type { Patient } from '@/features/patient/stores/patient-store'

const DOCTORS = PROFILES.filter((p) => p.role === 'doctor')

interface EditPatientModalProps {
  open: boolean
  patient: Patient
  onClose: () => void
  onSave: (patch: EditPatientForm) => void
}

export function EditPatientModal({ open, patient, onClose, onSave }: EditPatientModalProps) {
  const [step, setStep] = useState<'form' | 'review'>('form')
  const {
    control,
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<EditPatientForm>({
    resolver: zodResolver(editPatientSchema),
    defaultValues: {
      name: patient.name,
      phone: patient.phone,
      weight: patient.weight,
      responsibleDoctor: patient.responsibleDoctor,
    },
  })

  useEffect(() => {
    if (open) {
      reset({
        name: patient.name,
        phone: patient.phone,
        weight: patient.weight,
        responsibleDoctor: patient.responsibleDoctor,
      })
      setStep('form')
    }
  }, [open, patient.name, patient.phone, patient.weight, patient.responsibleDoctor, reset])

  const values = useWatch({ control })
  const hasChanges =
    values.name !== patient.name ||
    values.phone !== patient.phone ||
    values.weight !== patient.weight ||
    values.responsibleDoctor !== patient.responsibleDoctor

  const closeAndReset = () => {
    onClose()
    reset()
    setStep('form')
  }

  const { requestClose: handleCancel, guardOpen, cancelDiscard, confirmDiscard } = useUnsavedChangesGuard({
    open,
    isDirty: hasChanges,
    onClose: closeAndReset,
  })

  const goToReview = async () => {
    const ok = await trigger()
    if (ok) setStep('review')
  }

  const submit = handleSubmit((data) => {
    onSave(data)
    closeAndReset()
  })

  return (
    <>
      <Modal
        open={open}
        onClose={handleCancel}
        title={step === 'form' ? 'Editar dados do paciente' : 'Confirmar alterações?'}
        size="lg"
        footer={
          step === 'form' ? (
            <>
              <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
              <Button tone="brand" variant="solid" onClick={goToReview} disabled={!hasChanges}>
                Salvar alterações
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" leftIcon={<ArrowLeft size={13} />} onClick={() => setStep('form')}>
                Voltar
              </Button>
              <Button tone="brand" variant="solid" onClick={submit}>Confirmar e salvar</Button>
            </>
          )
        }
      >
        <div key={step} className="animate-in fade-in-0 slide-in-from-right-2 duration-200">
          {step === 'form' ? (
            <div className="grid grid-cols-2 gap-3">
              <FieldLabel label="Nome completo" error={errors.name?.message}>
                <TextInput invalid={!!errors.name} {...register('name')} />
              </FieldLabel>
              <FieldLabel label="Telefone" error={errors.phone?.message}>
                <TextInput invalid={!!errors.phone} {...register('phone')} />
              </FieldLabel>
              <FieldLabel label="Peso" error={errors.weight?.message}>
                <TextInput invalid={!!errors.weight} {...register('weight')} />
              </FieldLabel>
              <FieldLabel label="Médico responsável" error={errors.responsibleDoctor?.message}>
                <Select invalid={!!errors.responsibleDoctor} {...register('responsibleDoctor')}>
                  <option value="" disabled>Selecione o médico</option>
                  {DOCTORS.map((doctor) => (
                    <option key={doctor.id} value={doctor.name}>
                      {doctor.name} · {doctor.registration}
                    </option>
                  ))}
                </Select>
              </FieldLabel>
              <FieldLabel label="CPF">
                <ReadOnlyField>{patient.cpf}</ReadOnlyField>
              </FieldLabel>
              <FieldLabel label="Data de nascimento">
                <ReadOnlyField>{patient.birthDate}</ReadOnlyField>
              </FieldLabel>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-(--text-muted) leading-relaxed">
                Os dados do paciente serão atualizados. Esta ação será registrada no histórico de alterações do prontuário.
              </p>
              <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5 space-y-1.5">
                {[
                  { label: 'Nome', prev: patient.name, next: values.name },
                  { label: 'Telefone', prev: patient.phone, next: values.phone },
                  { label: 'Peso', prev: patient.weight, next: values.weight },
                  { label: 'Médico', prev: patient.responsibleDoctor, next: values.responsibleDoctor },
                ].filter((f) => f.prev !== f.next).map((f) => (
                  <div key={f.label} className="flex items-center justify-between gap-2">
                    <span className="text-[0.65rem] text-(--text-muted) shrink-0">{f.label}</span>
                    <div className="flex items-center gap-1.5 text-[0.65rem] min-w-0">
                      <span className="text-(--text-muted) line-through truncate max-w-32">{f.prev}</span>
                      <span className="text-(--text-muted)">→</span>
                      <span className="font-semibold text-brand truncate max-w-32">{f.next}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDiscardModal
        open={guardOpen}
        onCancel={cancelDiscard}
        onConfirm={confirmDiscard}
      />
    </>
  )
}
