import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button, ConfirmDiscardModal, FieldLabel, Modal, Select, TextArea, TextInput } from '@/shared/components'
import { INACTIVATION_CATEGORY_LABELS } from '@/features/patient/constants/clinical-labels'
import {
  inactivateSchema,
  INACTIVATE_DEFAULTS,
  type InactivateForm,
} from '@/features/patient/schemas/inactivate'
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard'
import type { Inactivation, InactivationCategory, Patient } from '@/features/patient/stores/usePatientStore'

interface InactivateModalProps {
  open: boolean
  patient: Patient
  onClose: () => void
  onConfirm: (inactivation: Inactivation) => void
}

export function InactivateModal({ open, patient, onClose, onConfirm }: InactivateModalProps) {
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<InactivateForm>({
    resolver: zodResolver(inactivateSchema),
    mode: 'onBlur',
    defaultValues: INACTIVATE_DEFAULTS,
  })
  const [category, detail, otherReason, expectedReturnDate] = useWatch({
    control,
    name: ['category', 'detail', 'otherReason', 'expectedReturnDate'],
  })

  const isDirty = !!category || !!detail?.trim() || !!otherReason?.trim() || !!expectedReturnDate

  const { requestClose, guardOpen, cancelDiscard, confirmDiscard } = useUnsavedChangesGuard({
    open,
    isDirty,
    onClose,
  })

  useEffect(() => {
    if (open) reset(INACTIVATE_DEFAULTS)
  }, [open, reset])

  const submit = handleSubmit((v) => {
    const expectedReturn = v.expectedReturnDate
      ? format(new Date(v.expectedReturnDate + 'T00:00:00'), 'dd/MM/yyyy')
      : null
    const detailFinal =
      v.category === 'other' && v.otherReason.trim()
        ? `[${v.otherReason.trim()}] ${v.detail.trim()}`
        : v.detail.trim()
    onConfirm({
      id: `inact-${Date.now()}`,
      category: v.category as InactivationCategory,
      detail: detailFinal,
      startDate: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      expectedReturnDate: expectedReturn,
      responsibleDoctor: patient.responsibleDoctor,
      snapshotConcentration: patient.currentDoseConcentration,
      snapshotInterval: patient.currentInterval,
    })
    onClose()
  })

  return (
    <>
    <Modal
      open={open}
      onClose={requestClose}
      title="Inativar imunoterapia"
      footer={<Button tone="brand" variant="solid" onClick={submit}>Inativar imunoterapia</Button>}
    >
      <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
        <Info size={14} className="text-brand shrink-0 mt-0.5" />
        <p className="text-[0.65rem] text-teal-800 leading-relaxed">
          A inativação <span className="font-bold">pausa as aplicações</span> e registra o motivo no histórico clínico. O paciente poderá ser reativado a qualquer momento, com o médico definindo o ponto de retomada do protocolo.
        </p>
      </div>

      <FieldLabel label="Motivo da inativação" required error={errors.category?.message}>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onChange={field.onChange} onBlur={field.onBlur} invalid={!!errors.category}>
              <option value="" disabled>Selecione a categoria</option>
              {(Object.keys(INACTIVATION_CATEGORY_LABELS) as InactivationCategory[])
                .filter((k) => k !== 'treatment_completion')
                .map((k) => (
                  <option key={k} value={k}>{INACTIVATION_CATEGORY_LABELS[k]}</option>
                ))}
            </Select>
          )}
        />
      </FieldLabel>
      {category === 'other' && (
        <FieldLabel label="Especifique o motivo" error={errors.otherReason?.message}>
          <TextInput placeholder="Especifique o motivo da inativação" invalid={!!errors.otherReason} {...register('otherReason')} />
        </FieldLabel>
      )}

      <FieldLabel
        label="Detalhamento clínico"
        required
        error={errors.detail?.message}
        helperText={`Mínimo 10 caracteres · ${(detail ?? '').trim().length} digitados`}
      >
        <TextArea
          rows={3}
          placeholder="Descreva o contexto clínico da inativação (obrigatório para rastreabilidade)"
          invalid={!!errors.detail}
          {...register('detail')}
        />
      </FieldLabel>

      <FieldLabel
        label="Previsão de retorno"
        hint="(opcional)"
        helperText="Use para lembrar a equipe de avaliar a reativação. Deixe em branco se não houver previsão."
      >
        <TextInput type="date" {...register('expectedReturnDate')} />
      </FieldLabel>

      <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3 py-2 flex items-center justify-between">
        <span className="text-[0.65rem] text-(--text-muted)">Responsável pela inativação</span>
        <span className="text-[0.7rem] font-semibold text-(--text)">{patient.responsibleDoctor}</span>
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
