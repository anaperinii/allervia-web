import { ClinicalReviewNotice } from '@/shared/components/ClinicalReviewNotice'
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, Select, showApiErrorToast, TextArea, TextInput } from '@/shared/components'
import { updateScheduledDose } from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { toZonedOffsetIso, dayInZone, timeInZone } from '@/shared/lib/dates'
import { useIdempotencyKey } from '@/shared/lib/use-idempotency-key'
import { formatStepOption } from '@/features/patient/adapters/clinical-presentation'
import type { DoseDetail } from '@/shared/api/contracts/clinical'

import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface EditScheduledDoseModalProps {
  open: boolean
  dose: DoseDetail | null
  organizationId: string
  onClose: () => void
  onSaved: () => void
}

function localDateInput(iso: string, timeZone = 'America/Sao_Paulo'): string {
  const date = new Date(iso)
  return dayInZone(date, timeZone)
}
function localTimeInput(iso: string, timeZone = 'America/Sao_Paulo'): string {
  const date = new Date(iso)
  return timeInZone(date, timeZone)
}

export function EditScheduledDoseModal(props: EditScheduledDoseModalProps) {
  if (!props.open || !props.dose) return null
  return (
    <EditScheduledDoseForm
      key={props.dose.id}
      {...props}
    />
  )
}

function EditScheduledDoseForm({
  open,
  dose,
  organizationId,
  onClose,
  onSaved,
}: EditScheduledDoseModalProps) {
  const queryClient = useQueryClient()
  const timeZone = dose?.immunotherapy.currentPrescription?.resolved.timeZone ?? 'America/Sao_Paulo'
  const [stepId, setStepId] = useState(dose?.plannedStepId ?? '')
  const [date, setDate] = useState(dose ? localDateInput(dose.scheduledAt, timeZone) : '')
  const [time, setTime] = useState(dose ? localTimeInput(dose.scheduledAt, timeZone) : '')
  const [reason, setReason] = useState('')
  const idempotencyKeyFor = useIdempotencyKey()

  const selectedStep = dose?.allowedValues.find((step) => step.id === stepId) ?? null

  const [reviewRequired, setReviewRequired] = useState(false)
  const mutation = useMutation({
    mutationFn: () => {
      const command = {
        values: {
          concentration: selectedStep!.concentration,
          volume: selectedStep!.volume,
          intervalDays: selectedStep!.intervalDays,
          stepId: selectedStep!.id,
        },
        scheduledAt: toZonedOffsetIso(date, time, timeZone),
        reason: reason.trim(),
        expectedRevision: dose!.revision,
        expectedTherapyRevision: dose!.therapyRevision,
      }
      return updateScheduledDose(dose!.id, {
        ...command,
        idempotencyKey: idempotencyKeyFor([dose!.id, command]),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      onSaved()
      onClose()
    },
    meta: { suppressErrorToast: true },
    onError: async (error) => {
      if (error instanceof ApiError && error.code.startsWith('STALE_')) setReviewRequired(true)
      if (error instanceof ApiError && error.code === 'STALE_CLINICAL_REVISION') {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.dose(organizationId, dose?.id ?? ''),
        })
        showApiErrorToast(error, {
          title: 'Previsão desatualizada',
          description:
            'A previsão mudou desde que você abriu este formulário. Os dados foram recarregados; confirme novamente.',
        })
        return
      }
      showApiErrorToast(error)
    },
  })

  const canSubmit =
    !!dose && !!selectedStep && !!date && !!time && reason.trim().length > 0 && !mutation.isPending && !reviewRequired

  return (
    <Modal
      open={open && !!dose}
      pending={mutation.isPending || (mutation.error instanceof ApiError && mutation.error.isIndeterminate)}
      dirty={!!reason}
      onClose={onClose}
      title="Editar previsão pendente"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button
            tone="brand"
            variant="solid"
            disabled={!canSubmit}
            onClick={() => mutation.mutate()}
          >
            Salvar previsão
          </Button>
        </>
      }
    >
      <ClinicalReviewNotice required={reviewRequired} onReview={() => setReviewRequired(false)} />
      <div className="flex items-start gap-2 bg-brand/10 border border-brand/25 rounded-lg px-3 py-2.5">
        <FontAwesomeIcon icon={faCircleInfo} className="text-brand shrink-0 mt-0.5" style={{ fontSize: 14 }} />
        <p className="text-[0.65rem] text-brand-dark leading-relaxed">
          A edição ajusta apenas esta previsão — <span className="font-bold">nenhuma sucessora é criada</span>.
          Os valores oferecidos são os permitidos pela prescrição fixada, inclusive repetir ou reduzir.
        </p>
      </div>

      <FieldLabel label="Valor previsto">
        <Select value={stepId} onChange={(e) => setStepId(e.target.value)}>
          <option value="" disabled>Selecione o valor</option>
          {(dose?.allowedValues ?? []).map((step) => (
            <option key={step.id} value={step.id}>
              {formatStepOption(step)} · {step.intervalDays}d
              {step.id === dose?.plannedStepId ? ' (atual)' : ''}
            </option>
          ))}
        </Select>
      </FieldLabel>

      <div className="grid grid-cols-2 gap-3">
        <FieldLabel label="Data prevista">
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FieldLabel>
        <FieldLabel label="Hora prevista">
          <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </FieldLabel>
      </div>

      <FieldLabel label="Motivo clínico" required>
        <TextArea
          rows={2}
          placeholder="Descreva o motivo do ajuste da sessão prevista"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </FieldLabel>
    </Modal>
  )
}
