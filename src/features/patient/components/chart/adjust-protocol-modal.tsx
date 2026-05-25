import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Button, ConfirmDiscardModal, FieldLabel, Modal, Select, TextArea, TextInput } from '@/shared/components'
import { PROTOCOL_INTERVAL_PRESET_STRINGS } from '@/features/immunotherapy/constants/scit-protocol'
import {
  adjustProtocolSchema,
  ADJUST_PROTOCOL_DEFAULTS,
  type AdjustProtocolForm,
} from '@/features/patient/forms/adjust-protocol'
import { useUnsavedChangesGuard } from '@/shared/hooks/use-unsaved-changes-guard'
import type { Patient, ProtocolAdjustment, ProtocolAdjustmentType } from '@/features/patient/stores/patient-store'

interface AdjustProtocolModalProps {
  open: boolean
  patient: Patient
  onClose: () => void
  onConfirm: (adjustment: ProtocolAdjustment, patch: { newType: string; newRoute: string; newExtract: string }) => void
}

export function AdjustProtocolModal({ open, patient, onClose, onConfirm }: AdjustProtocolModalProps) {
  const form = useForm<AdjustProtocolForm>({
    resolver: zodResolver(adjustProtocolSchema),
    mode: 'onBlur',
    defaultValues: ADJUST_PROTOCOL_DEFAULTS,
  })
  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = form
  const [type, newInterval, newConcentration, newType, newRoute, newExtract, justification, otherReason] = useWatch({
    control,
    name: ['type', 'newInterval', 'newConcentration', 'newType', 'newRoute', 'newExtract', 'justification', 'otherReason'],
  })
  const isCustomInterval = newInterval && !PROTOCOL_INTERVAL_PRESET_STRINGS.includes(newInterval)
  const selectInterval = isCustomInterval ? 'outro' : newInterval

  const hasChanges =
    newConcentration !== patient.currentDoseConcentration ||
    newInterval.trim() !== String(patient.currentInterval) ||
    newType !== patient.immunotherapyType ||
    newRoute !== patient.administrationRoute ||
    newExtract !== patient.extract

  const isDirty = hasChanges || !!type || !!justification?.trim() || !!otherReason?.trim()

  const { requestClose, guardOpen, cancelDiscard, confirmDiscard } = useUnsavedChangesGuard({
    open,
    isDirty,
    onClose,
  })

  useEffect(() => {
    if (open) {
      reset({
        type: '',
        otherReason: '',
        newConcentration: patient.currentDoseConcentration,
        newInterval: String(patient.currentInterval),
        newType: patient.immunotherapyType,
        newRoute: patient.administrationRoute,
        newExtract: patient.extract,
        justification: '',
      })
    }
  }, [open, patient, reset])

  const submit = handleSubmit((v) => {
    const justificationFinal =
      v.type === 'other' && v.otherReason.trim()
        ? `[${v.otherReason.trim()}] ${v.justification.trim()}`
        : v.justification.trim()
    const adjustment: ProtocolAdjustment = {
      id: `adj-${Date.now()}`,
      date: format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }),
      type: v.type as ProtocolAdjustmentType,
      previousConcentration: patient.currentDoseConcentration,
      previousInterval: patient.currentInterval,
      newConcentration: v.newConcentration,
      newInterval: Number(v.newInterval.trim()),
      justification: justificationFinal,
      responsibleDoctor: patient.responsibleDoctor,
    }
    onConfirm(adjustment, { newType: v.newType, newRoute: v.newRoute, newExtract: v.newExtract })
    onClose()
  })

  return (
    <>
    <Modal
      open={open}
      onClose={requestClose}
      title="Ajustar protocolo"
      footer={
        <>
          <Button variant="outline" onClick={requestClose}>Cancelar</Button>
          <Button tone="brand" variant="solid" onClick={submit} disabled={!hasChanges}>Confirmar ajuste</Button>
        </>
      }
    >
      <div className="flex items-start gap-2 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2.5">
        <Info size={14} className="text-brand shrink-0 mt-0.5" />
        <p className="text-[0.65rem] text-teal-800 leading-relaxed">
          Alterações no protocolo são <span className="font-bold">irreversíveis</span>. A progressão continuará a partir dos novos valores e o desvio será destacado no prontuário e nos relatórios clínicos.
        </p>
      </div>

      <FieldLabel label="Tipo de ajuste" required error={errors.type?.message}>
        <Controller
          control={control}
          name="type"
          render={({ field }) => (
            <Select value={field.value} onChange={field.onChange} onBlur={field.onBlur} invalid={!!errors.type}>
              <option value="" disabled>Selecione o motivo do ajuste</option>
              <option value="dose_reduction">Redução de dose</option>
              <option value="interval_increase">Aumento de intervalo</option>
              <option value="concentration_change">Alteração de concentração</option>
              <option value="suspension">Suspensão temporária</option>
              <option value="other">Outro</option>
            </Select>
          )}
        />
      </FieldLabel>
      {type === 'other' && (
        <FieldLabel label="Especifique o motivo" error={errors.otherReason?.message}>
          <TextInput placeholder="Especifique o motivo do ajuste" invalid={!!errors.otherReason} {...register('otherReason')} />
        </FieldLabel>
      )}

      <div className="space-y-2.5">
        <div className="text-xs font-bold text-(--text) flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-brand" />
          Dados da imunoterapia
        </div>
        <div className="grid grid-cols-2 gap-2">
          <FieldLabel label="Tipo">
            <Select {...register('newType')}>
              <option value="Ácaros">Ácaros</option>
              <option value="Gramíneas">Gramíneas</option>
              <option value="Cão e Gato">Cão e Gato</option>
              <option value="Cândida">Cândida</option>
              <option value="Herpes">Herpes</option>
              <option value="Fungos">Fungos</option>
              <option value="Insetos">Insetos</option>
            </Select>
          </FieldLabel>
          <FieldLabel label="Via">
            <Select {...register('newRoute')}>
              <option value="Subcutânea">Subcutânea</option>
              <option value="Sublingual">Sublingual</option>
            </Select>
          </FieldLabel>
        </div>
        <FieldLabel label="Extrato">
          <TextInput placeholder="Ex: Der p 60 + Der f 10%" {...register('newExtract')} />
        </FieldLabel>
      </div>

      <div className="space-y-2.5">
        <div className="text-xs font-bold text-(--text) flex items-center gap-2">
          <div className="w-1 h-4 rounded-full bg-brand" />
          Parâmetros do protocolo
        </div>

        <FieldLabel label="Concentração e volume" error={errors.newConcentration?.message}>
          <TextInput
            placeholder="Ex: 1:1.000 — 0,2ml"
            invalid={!!errors.newConcentration}
            {...register('newConcentration')}
          />
        </FieldLabel>

        <FieldLabel label="Intervalo entre doses" error={errors.newInterval?.message}>
          <Controller
            control={control}
            name="newInterval"
            render={({ field }) => (
              <Select
                value={selectInterval}
                onChange={(e) => field.onChange(e.target.value === 'outro' ? ' ' : e.target.value)}
                onBlur={field.onBlur}
                invalid={!!errors.newInterval}
              >
                <option value="" disabled>Selecione</option>
                <option value="7">7 dias</option>
                <option value="14">14 dias</option>
                <option value="21">21 dias</option>
                <option value="28">28 dias</option>
                <option value="outro">Outro</option>
              </Select>
            )}
          />
          {isCustomInterval && (
            <div className="flex items-center gap-2 mt-2">
              <span className="text-[0.6rem] text-(--text-muted) shrink-0">Especifique:</span>
              <TextInput
                type="number"
                min={1}
                placeholder="Ex: 35"
                value={(newInterval ?? '').trim()}
                onChange={(e) => setValue('newInterval', e.target.value.replace(/[^0-9]/g, ''), { shouldValidate: true })}
                className="flex-1"
              />
              <span className="text-[0.6rem] text-(--text-muted) shrink-0">dias</span>
            </div>
          )}
        </FieldLabel>
      </div>

      <FieldLabel label="Justificativa clínica" required error={errors.justification?.message}>
        <TextArea
          rows={3}
          placeholder="Descreva o motivo clínico do ajuste (obrigatório conforme protocolo)"
          invalid={!!errors.justification}
          {...register('justification')}
        />
      </FieldLabel>
    </Modal>

    <ConfirmDiscardModal
      open={guardOpen}
      onCancel={cancelDiscard}
      onConfirm={confirmDiscard}
    />
    </>
  )
}
