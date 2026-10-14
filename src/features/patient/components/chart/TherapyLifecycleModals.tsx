import { getImmunotherapy } from '@/shared/api/clinical.api'
import { useSession } from '@/shared/auth/useSession'
import { ClinicalReviewNotice } from '@/shared/components/ClinicalReviewNotice'
import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, Select, showApiErrorToast, TextArea, TextInput } from '@/shared/components'
import {
  executeTherapyLifecycle,
  getTherapyLifecycle,
} from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import type {
  LifecycleEventType,
  TherapyLifecycleEvent,
} from '@/shared/api/contracts/clinical'
import { queryKeys } from '@/shared/api/query-keys'
import {
  INACTIVATION_CATEGORY_LABELS,
} from '@/features/patient/constants/clinical-labels'
import { toZonedOffsetIso } from '@/shared/lib/dates'
import { useIdempotencyKey } from '@/shared/lib/use-idempotency-key'
import { formatInstantDate } from '@/features/patient/adapters/clinical-presentation'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'

const EVENT_LABELS: Record<LifecycleEventType, string> = {
  SUSPENSION: 'Suspensão',
  RESUMPTION: 'Retomada',
  COMPLETION: 'Encerramento',
}

interface LifecycleModalProps {
  open: boolean
  therapyId: string
  therapyRevision: number
  organizationId: string
  onClose: () => void
  onDone: (kind: 'suspended' | 'resumed') => void
}

export function SuspendTherapyModal(props: LifecycleModalProps) {
  if (!props.open) return null
  return <SuspendForm key={props.therapyId} {...props} />
}

function SuspendForm({
  therapyId,
  therapyRevision,
  organizationId,
  onClose,
  onDone,
}: LifecycleModalProps) {
  const queryClient = useQueryClient()
  const { account } = useSession()
  const [category, setCategory] = useState('')
  const [reason, setReason] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const idempotencyKeyFor = useIdempotencyKey()

  const [reviewRequired, setReviewRequired] = useState(false)
  const [confirmedRevision, setConfirmedRevision] = useState<number | null>(therapyRevision)
  const mutation = useMutation({
    mutationFn: () => {
      const command = {
        action: 'SUSPEND' as const,
        expectedRevision: confirmedRevision!,
        reason: reason.trim(),
        ...(category ? { category } : {}),
        ...(expectedReturnDate
          ? { expectedReturnAt: toZonedOffsetIso(expectedReturnDate, '08:00', account?.organization?.timeZone ?? 'America/Sao_Paulo') }
          : {}),
      }
      return executeTherapyLifecycle(therapyId, {
        ...command,
        idempotencyKey: idempotencyKeyFor([therapyId, command]),
      })
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      onDone('suspended')
      onClose()
    },
    meta: { suppressErrorToast: true },
    onError: async (error) => {
      if (error instanceof ApiError && error.code.startsWith('STALE_')) { setReviewRequired(true); setConfirmedRevision(null); try { const current = await getImmunotherapy(therapyId); setConfirmedRevision(current.revision) } catch { return }; await queryClient.invalidateQueries({ queryKey: queryKeys.clinical(organizationId) }) }
      showApiErrorToast(
        error,
        error instanceof ApiError && error.code === 'STALE_CLINICAL_REVISION'
          ? {
              title: 'Tratamento desatualizado',
              description:
                'O tratamento mudou desde a abertura da tela. Recarregue e confirme novamente.',
            }
          : {},
      )
    },
  })

  const canSubmit = reason.trim().length >= 10 && !!category && !mutation.isPending && !reviewRequired

  return (
    <Modal
      open
      pending={mutation.isPending || (mutation.error instanceof ApiError && mutation.error.isIndeterminate)}
      dirty={!!reason}
      onClose={onClose}
      title="Suspender tratamento"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button tone="danger" variant="solid" disabled={!canSubmit} onClick={() => mutation.mutate()}>
            Suspender tratamento
          </Button>
        </>
      }
    >
      {reviewRequired && confirmedRevision === null && <div role="alert"><p>Não foi possível carregar a revisão atual. Seu rascunho está preservado.</p><button type="button" onClick={async () => { try { const current = await getImmunotherapy(therapyId); setConfirmedRevision(current.revision); await queryClient.invalidateQueries({ queryKey: queryKeys.clinical(organizationId) }) } catch (error) { showApiErrorToast(error) } }}>Recarregar registro atual</button></div>}
      <ClinicalReviewNotice required={reviewRequired && confirmedRevision !== null} onReview={() => { if (confirmedRevision !== null) setReviewRequired(false) }} />
      <div className="flex items-start gap-2 bg-brand/10 border border-brand/25 rounded-lg px-3 py-2.5">
        <FontAwesomeIcon icon={faCircleInfo} className="text-brand shrink-0 mt-0.5" style={{ fontSize: 14 }} />
        <p className="text-[0.65rem] text-brand-dark leading-relaxed">
          A suspensão bloqueia novos comandos clínicos e preserva a previsão pendente
          para a retomada. Motivo, categoria e autoria ficam no histórico do tratamento.
        </p>
      </div>
      <FieldLabel label="Categoria do motivo" required>
        <Select value={category} onChange={(e) => setCategory(e.target.value)}>
          <option value="" disabled>Selecione a categoria</option>
          {Object.entries(INACTIVATION_CATEGORY_LABELS)
            .filter(([key]) => key !== 'treatment_completion')
            .map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
        </Select>
      </FieldLabel>
      <FieldLabel
        label="Detalhamento clínico"
        required
        helperText={`Mínimo 10 caracteres · ${reason.trim().length} digitados`}
      >
        <TextArea
          rows={3}
          placeholder="Descreva o contexto clínico da suspensão"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </FieldLabel>
      <FieldLabel label="Previsão de retorno" hint="(opcional)">
        <TextInput
          type="date"
          value={expectedReturnDate}
          onChange={(e) => setExpectedReturnDate(e.target.value)}
        />
      </FieldLabel>
    </Modal>
  )
}

export function ResumeTherapyModal(props: LifecycleModalProps) {
  if (!props.open) return null
  return <ResumeForm key={props.therapyId} {...props} />
}

function ResumeForm({
  therapyId,
  therapyRevision,
  organizationId,
  onClose,
  onDone,
}: LifecycleModalProps) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const idempotencyKeyFor = useIdempotencyKey()
  const [reviewRequired, setReviewRequired] = useState(false)
  const [confirmedRevision, setConfirmedRevision] = useState<number | null>(therapyRevision)
  const mutation = useMutation({
    mutationFn: () => {
      const command = {
        action: 'RESUME' as const,
        expectedRevision: confirmedRevision!,
        reason: reason.trim(),
      }
      return executeTherapyLifecycle(therapyId, {
        ...command,
        idempotencyKey: idempotencyKeyFor([therapyId, command]),
      })
    },
    onError: async (error) => { if (error instanceof ApiError && error.code.startsWith('STALE_')) { setReviewRequired(true); setConfirmedRevision(null); try { const current = await getImmunotherapy(therapyId); setConfirmedRevision(current.revision) } catch { return }; await queryClient.invalidateQueries({ queryKey: queryKeys.clinical(organizationId) }) } },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      onDone('resumed')
      onClose()
    },
  })
  return (
    <Modal
      open
      pending={mutation.isPending || (mutation.error instanceof ApiError && mutation.error.isIndeterminate)}
      dirty={!!reason}
      onClose={onClose}
      title="Retomar tratamento"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button
            tone="success"
            variant="solid"
            disabled={reason.trim().length < 5 || mutation.isPending || reviewRequired}
            onClick={() => mutation.mutate()}
          >
            Retomar tratamento
          </Button>
        </>
      }
    >
      {reviewRequired && confirmedRevision === null && <div role="alert"><p>Não foi possível carregar a revisão atual. Seu rascunho está preservado.</p><button type="button" onClick={async () => { try { const current = await getImmunotherapy(therapyId); setConfirmedRevision(current.revision); await queryClient.invalidateQueries({ queryKey: queryKeys.clinical(organizationId) }) } catch (error) { showApiErrorToast(error) } }}>Recarregar registro atual</button></div>}
      <ClinicalReviewNotice required={reviewRequired && confirmedRevision !== null} onReview={() => { if (confirmedRevision !== null) setReviewRequired(false) }} />
      <p className="text-xs text-(--text) leading-relaxed">
        O tratamento volta a aceitar comandos clínicos a partir da previsão preservada.
        Para retomar em outro valor ou data, edite os dados previstos na linha do tempo após a retomada.
      </p>
      <FieldLabel label="Motivo da retomada" required>
        <TextArea
          rows={2}
          placeholder="Ex: paciente reavaliado e apto a continuar."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </FieldLabel>
    </Modal>
  )
}

export function LifecycleHistoryModal({
  open,
  therapyId,
  organizationId,
  onClose,
}: {
  open: boolean
  therapyId: string
  organizationId: string
  onClose: () => void
}) {
  const query = useQuery({
    queryKey: [...queryKeys.immunotherapy(organizationId, therapyId), 'lifecycle'],
    queryFn: ({ signal }) => getTherapyLifecycle(therapyId, signal),
    enabled: open && organizationId !== '',
  })
  return (
    <Modal open={open} onClose={onClose} title="Histórico do tratamento" size="lg">
      {query.isPending && <p className="text-xs text-(--text-muted)">Carregando…</p>}
      {query.data && query.data.events.length === 0 && (
        <p className="text-xs text-(--text-muted)">Nenhum evento de ciclo de vida registrado.</p>
      )}
      <div className="space-y-2">
        {(query.data?.events ?? []).map((event) => (
          <LifecycleEventCard key={event.id} event={event} />
        ))}
      </div>
    </Modal>
  )
}

function LifecycleEventCard({ event }: { event: TherapyLifecycleEvent }) {
  return (
    <div className="rounded-lg border border-(--border-custom) bg-white px-3.5 py-2.5 space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-(--text)">{EVENT_LABELS[event.type]}</span>
        <span className="text-[0.6rem] text-(--text-muted)">
          {formatInstantDate(event.createdAt)} · {event.createdBy.professional?.fullName ?? '—'}
        </span>
      </div>
      {event.category && (
        <div className="text-[0.65rem] text-(--text-muted)">
          Categoria: <span className="font-semibold text-(--text)">
            {INACTIVATION_CATEGORY_LABELS[event.category as keyof typeof INACTIVATION_CATEGORY_LABELS] ?? event.category}
          </span>
        </div>
      )}
      <div className="text-[0.7rem] text-(--text) leading-relaxed">{event.reason}</div>
      {event.expectedReturnAt && (
        <div className="text-[0.65rem] text-(--text-muted)">
          Retorno previsto: <span className="font-semibold text-(--text)">{formatInstantDate(event.expectedReturnAt)}</span>
        </div>
      )}
      {event.recommendations && (
        <div className="text-[0.65rem] text-(--text-muted) leading-relaxed">
          Recomendações:{' '}
          {[
            event.recommendations.retesting ? 'retestagem alérgica' : null,
            event.recommendations.rescueMedication ? 'medicação de resgate' : null,
            event.recommendations.environmentalControl ? 'controle ambiental' : null,
            ...(event.recommendations.custom ?? []),
          ]
            .filter(Boolean)
            .join(', ') || '—'}
          {event.recommendations.monitoringSchedule && (
            <> · Retornos: {event.recommendations.monitoringSchedule}</>
          )}
          {event.recommendations.warningSigns && (
            <> · Sinais de alerta: {event.recommendations.warningSigns}</>
          )}
        </div>
      )}
      {event.archivedDoseIds.length > 0 && (
        <div className="text-[0.6rem] text-amber-700">
          {event.archivedDoseIds.length} previsão(ões) arquivada(s) por este evento.
        </div>
      )}
    </div>
  )
}
