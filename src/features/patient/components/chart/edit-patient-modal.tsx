import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Save } from 'lucide-react'
import { Button, FieldLabel, Modal, ReadOnlyField, TextInput } from '@/shared/components'
import { editPatientSchema, type EditPatientForm } from '@/features/patient/forms/edit-patient'
import type { Patient } from '@/features/patient/stores/patient-store'

interface EditPatientModalProps {
  open: boolean
  patient: Patient
  onClose: () => void
  onSave: (patch: EditPatientForm) => void
}

export function EditPatientModal({ open, patient, onClose, onSave }: EditPatientModalProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const {
    register,
    handleSubmit,
    getValues,
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

  const openConfirm = handleSubmit(() => setShowConfirm(true))

  const handleConfirmSave = () => {
    onSave(getValues())
    setShowConfirm(false)
    onClose()
    reset()
  }

  const handleCancel = () => {
    setShowConfirm(false)
    onClose()
    reset()
  }

  const values = getValues()

  return (
    <>
      <Modal
        open={open}
        onClose={handleCancel}
        title="Editar dados do paciente"
        size="lg"
        footer={
          <>
            <Button variant="outline" onClick={handleCancel}>Cancelar</Button>
            <Button tone="brand" variant="solid" leftIcon={<Save size={13} />} onClick={openConfirm}>
              Salvar alterações
            </Button>
          </>
        }
      >
        <div>
          <h4 className="text-xs font-bold text-(--text) mb-3 flex items-center gap-2">
            <div className="w-1 h-4 rounded-full bg-brand" />
            Dados Pessoais
          </h4>
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
              <TextInput invalid={!!errors.responsibleDoctor} {...register('responsibleDoctor')} />
            </FieldLabel>
            <FieldLabel label="CPF">
              <ReadOnlyField>{patient.cpf}</ReadOnlyField>
            </FieldLabel>
            <FieldLabel label="Data de nascimento">
              <ReadOnlyField>{patient.birthDate}</ReadOnlyField>
            </FieldLabel>
          </div>
        </div>
      </Modal>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirmar alterações?"
        size="sm"
        footer={
          <>
            <Button variant="outline" fullWidth onClick={() => setShowConfirm(false)}>Voltar</Button>
            <Button tone="brand" variant="solid" fullWidth onClick={handleConfirmSave}>Confirmar e salvar</Button>
          </>
        }
      >
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
              <span className="text-[0.6rem] text-(--text-muted) shrink-0">{f.label}</span>
              <div className="flex items-center gap-1.5 text-[0.6rem] min-w-0">
                <span className="text-(--text-muted) line-through truncate max-w-24">{f.prev}</span>
                <span className="text-(--text-muted)">→</span>
                <span className="font-semibold text-brand truncate max-w-24">{f.next}</span>
              </div>
            </div>
          ))}
          {[values.name, values.phone, values.weight, values.responsibleDoctor].every(
            (next, i) => [patient.name, patient.phone, patient.weight, patient.responsibleDoctor][i] === next,
          ) && (
            <span className="text-[0.6rem] text-(--text-muted)">Nenhuma alteração detectada.</span>
          )}
        </div>
      </Modal>
    </>
  )
}
