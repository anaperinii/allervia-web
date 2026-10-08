import { editMinorPatientSchema, editPatientSchema, type EditPatientForm } from '@/features/patient/schemas/edit-patient'
import type { Patient } from '@/features/patient/stores/usePatientStore'
import { Button, ConfirmDiscardModal, FieldLabel, Modal, ReadOnlyField, Select, TextInput } from '@/shared/components'
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard'
import { useProfessionalDirectory } from '@/shared/hooks/useProfessionalDirectory'
import { formatCPF, formatPhone } from '@/shared/lib/formatters'
import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'

import { faChevronLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface EditPatientModalProps {
  open: boolean
  patient: Patient
  onClose: () => void
  onSave: (patch: EditPatientForm) => void
}

export function EditPatientModal(props: EditPatientModalProps) {
  return props.open ? <EditPatientModalForm key={JSON.stringify([props.patient.id, props.patient.name, props.patient.phone, props.patient.weight, props.patient.responsibleDoctor, props.patient.guardian])} {...props} /> : null
}

function EditPatientModalForm({ open, patient, onClose, onSave }: EditPatientModalProps) {
  const [step, setStep] = useState<'form' | 'review'>('form')
  const { members: doctors } = useProfessionalDirectory('PHYSICIAN')
  const isMinor = patient.age < 18
  const guardianDefaults = {
    guardianName: patient.guardian?.name ?? '',
    guardianCpf: patient.guardian?.cpf ? formatCPF(patient.guardian.cpf) : '',
    guardianPhone: patient.guardian?.phone ? formatPhone(patient.guardian.phone) : '',
  }
  const {
    control,
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm<EditPatientForm>({
    resolver: zodResolver(isMinor ? editMinorPatientSchema : editPatientSchema),
    defaultValues: {
      name: patient.name,
      phone: patient.phone,
      weight: patient.weight,
      responsibleDoctor: patient.responsibleDoctorId ?? '',
      ...guardianDefaults,
    },
  })


  const values = useWatch({ control })
  const doctorNameById = (id?: string) =>
    doctors.find((doctor) => doctor.professionalId === id)?.fullName ?? ''
  const hasChanges =
    values.name !== patient.name ||
    values.phone !== patient.phone ||
    values.weight !== patient.weight ||
    values.responsibleDoctor !== (patient.responsibleDoctorId ?? '') ||
    (isMinor &&
      (values.guardianName !== guardianDefaults.guardianName ||
        values.guardianCpf !== guardianDefaults.guardianCpf ||
        values.guardianPhone !== guardianDefaults.guardianPhone))

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
              <Button variant="outline" leftIcon={<FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 13 }} />} onClick={() => setStep('form')}>
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
                  {doctors.map((doctor) => (
                    <option key={doctor.professionalId} value={doctor.professionalId}>
                      {doctor.fullName}
                      {doctor.councilNumber
                        ? ` · ${doctor.councilNumber}/${doctor.councilUf ?? ''}`
                        : ''}
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
              {isMinor && (
                <div className="col-span-2 rounded-lg border border-(--border-custom) bg-gray-50/60 p-3">
                  <div className="mb-2 text-[0.7rem] font-bold text-(--text)">
                    Responsável Legal
                    <span className="ml-1.5 font-medium text-(--text-muted)">paciente menor de idade</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <FieldLabel label="Nome do responsável" error={errors.guardianName?.message}>
                      <TextInput invalid={!!errors.guardianName} {...register('guardianName')} />
                    </FieldLabel>
                    <FieldLabel label="CPF do responsável" error={errors.guardianCpf?.message}>
                      <Controller
                        control={control}
                        name="guardianCpf"
                        render={({ field }) => (
                          <TextInput
                            placeholder="000.000.000-00"
                            invalid={!!errors.guardianCpf}
                            value={field.value ?? ''}
                            onBlur={field.onBlur}
                            onChange={(e) => field.onChange(formatCPF(e.target.value))}
                          />
                        )}
                      />
                    </FieldLabel>
                    <FieldLabel label="Telefone do responsável" error={errors.guardianPhone?.message}>
                      <Controller
                        control={control}
                        name="guardianPhone"
                        render={({ field }) => (
                          <TextInput
                            placeholder="(00) 00000-0000"
                            invalid={!!errors.guardianPhone}
                            value={field.value ?? ''}
                            onBlur={field.onBlur}
                            onChange={(e) => field.onChange(formatPhone(e.target.value))}
                          />
                        )}
                      />
                    </FieldLabel>
                  </div>
                </div>
              )}
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
                  {
                    label: 'Médico',
                    prev: patient.responsibleDoctor,
                    next: doctorNameById(values.responsibleDoctor),
                  },
                  ...(isMinor
                    ? [
                        { label: 'Responsável legal', prev: guardianDefaults.guardianName, next: values.guardianName },
                        { label: 'CPF do responsável', prev: guardianDefaults.guardianCpf, next: values.guardianCpf },
                        { label: 'Tel. do responsável', prev: guardianDefaults.guardianPhone, next: values.guardianPhone },
                      ]
                    : []),
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
