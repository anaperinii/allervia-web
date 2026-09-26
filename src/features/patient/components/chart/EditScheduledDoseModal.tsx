import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, Select, TextArea, TextInput } from '@/shared/components'
import { updateScheduledDose } from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { toOffsetIso } from '@/shared/lib/dates'
import { formatStepPresentation } from '@/features/patient/adapters/clinical-presentation'
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

function localDateInput(iso: string): string {
  const date = new Date(iso)
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}
function localTimeInput(iso: string): string {
  const date = new Date(iso)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

export function EditScheduledDoseModal(props: EditScheduledDoseModalProps) {
  if (!props.open || !props.dose) return null
  return (
    <EditScheduledDoseForm
      key={`${props.dose.id}-${props.dose.revision}-${props.dose.therapyRevision}`}
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
  const [stepId, setStepId] = useState(dose?.plannedStepId ?? '')
  const [date, setDate] = useState(dose ? localDateInput(dose.scheduledAt) : '')
  const [time, setTime] = useState(dose ? localTimeInput(dose.scheduledAt) : '')
  const [reason, setReason] = useState('')
  const [failure, setFailure] = useState<string | null>(null)

  const selectedStep = dose?.allowedValues.find((step) => step.id === stepId) ?? null

  const mutation = useMutation({
    mutationFn: () =>
      updateScheduledDose(dose!.id, {
        values: {
          concentration: selectedStep!.concentration,
          volume: selectedStep!.volume,
          intervalDays: selectedStep!.intervalDays,
          stepId: selectedStep!.id,
        },
        scheduledAt: toOffsetIso(date, time),
        reason: reason.trim(),
        expectedRevision: dose!.revision,
        expectedTherapyRevision: dose!.therapyRevision,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      onSaved()
      onClose()
    },
    onError: async (error) => {
      if (error instanceof ApiError && error.code === 'STALE_CLINICAL_REVISION') {
        await queryClient.invalidateQueries({
          queryKey: queryKeys.dose(organizationId, dose?.id ?? ''),
        })
        setFailure(
          'A previsão mudou desde que você abriu este formulário. Os dados foram recarregados; confirme novamente.',
        )
        return
      }
      setFailure(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar a edição da previsão.',
      )
    },
  })

  const canSubmit =
    !!dose && !!selectedStep && !!date && !!time && reason.trim().length > 0 && !mutation.isPending

  return (
    <Modal
      open={open && !!dose}
      onClose={onClose}
      title="Editar previsão pendente"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button
            tone="brand"
            variant="solid"
            disabled={!canSubmit}
            onClick={() => { setFailure(null); mutation.mutate() }}
          >
            Salvar previsão
          </Button>
        </>
      }
    >
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
              {step.label} — {formatStepPresentation(step)} · {step.intervalDays}d
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

      {failure && (
        <p role="alert" className="text-[0.7rem] text-red-700">{failure}</p>
      )}
    </Modal>
  )
}
