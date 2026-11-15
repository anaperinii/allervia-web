import { ClinicalReviewNotice } from '@/shared/components/ClinicalReviewNotice'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, showApiErrorToast, TextArea, toast } from '@/shared/components'
import { getDose, retractDose } from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useIdempotencyKey } from '@/shared/lib/use-idempotency-key'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleInfo, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

interface CorrectionModalProps {
  doseId: string | null
  organizationId: string
  onClose: () => void
}

export function RetractDoseModal(props: CorrectionModalProps) { return props.doseId ? <RetractDoseForm key={props.doseId} {...props} /> : null }

function RetractDoseForm({ doseId, organizationId, onClose }: CorrectionModalProps) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const idempotencyKeyFor = useIdempotencyKey()

  const doseQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, doseId ?? ''),
    queryFn: ({ signal }) => getDose(doseId!, signal),
    enabled: doseId !== null && organizationId !== '',
  })
  const dose = doseQuery.data ?? null

  const [reviewRequired, setReviewRequired] = useState(false)
  const mutation = useMutation({
    mutationFn: () => {
      const command = {
        reason: reason.trim(),
        expectedRevision: dose!.revision,
        expectedTherapyRevision: dose!.therapyRevision,
      }
      return retractDose(doseId!, {
        ...command,
        idempotencyKey: idempotencyKeyFor([doseId, command]),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Aplicação registrada em erro',
        description:
          'Os valores administrados foram preservados na trilha; a previsão original voltou a ficar pendente.',
        autoDismissMs: 8000,
      })
      onClose()
    },
    meta: { suppressErrorToast: true },
    onError: async (error) => {
      if (error instanceof ApiError && error.code.startsWith('STALE_')) { setReviewRequired(true); await queryClient.invalidateQueries({ queryKey: queryKeys.clinical(organizationId) }) }
      showApiErrorToast(
        error,
        error instanceof ApiError &&
          error.code === 'SUCCESSOR_ALREADY_ADMINISTERED'
          ? {
              title: 'Retratação exige análise clínica',
              description:
                'A dose seguinte já foi aplicada: a retratação em cadeia exige análise clínica explícita, não um comando automático.',
            }
          : {},
      )
    },
  })

  return (
    <Modal
      open={doseId !== null}
      pending={mutation.isPending || (mutation.error instanceof ApiError && mutation.error.isIndeterminate)}
      dirty={!!reason}
      onClose={onClose}
      title="Registrar aplicação em erro"
      icon={<FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 16 }} />}
      tone="danger"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button
            tone="danger"
            variant="solid"
            disabled={reason.trim().length < 10 || !dose || mutation.isPending || reviewRequired}
            onClick={() => mutation.mutate()}
          >
            Registrar em erro
          </Button>
        </>
      }
    >
      <ClinicalReviewNotice required={reviewRequired} onReview={() => setReviewRequired(false)} />
      <div className="flex items-start gap-2 bg-gray-100 border border-gray-200 rounded-lg px-3 py-2.5">
        <FontAwesomeIcon icon={faCircleInfo} className="text-gray-500 shrink-0 mt-0.5" style={{ fontSize: 14 }} />
        <p className="text-[0.65rem] text-gray-600 leading-relaxed">
          Nada é apagado: a aplicação vira &quot;registrada em erro&quot; com todos os valores
          preservados, a próxima previsão criada por ela é arquivada e a previsão original
          volta a ficar pendente.
        </p>
      </div>
      <FieldLabel
        label="Motivo clínico da retratação"
        required
        helperText={`Mínimo 10 caracteres · ${reason.trim().length} digitados`}
      >
        <TextArea
          rows={3}
          placeholder="Ex: registro lançado no paciente errado."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </FieldLabel>
    </Modal>
  )
}

