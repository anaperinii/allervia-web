import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, Select, TextArea, TextInput } from '@/shared/components'
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
import { toOffsetIso } from '@/shared/lib/dates'
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

/** Suspensão com motivo, categoria e previsão de retorno persistidos. */
export function SuspendTherapyModal(props: LifecycleModalProps) {
  if (!props.open) return null
  return <SuspendForm key={`${props.therapyId}-${props.therapyRevision}`} {...props} />
}

function SuspendForm({
  therapyId,
  therapyRevision,
  organizationId,
  onClose,
  onDone,
}: LifecycleModalProps) {
  const queryClient = useQueryClient()
  const [category, setCategory] = useState('')
  const [reason, setReason] = useState('')
  const [expectedReturnDate, setExpectedReturnDate] = useState('')
  const [failure, setFailure] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      executeTherapyLifecycle(therapyId, {
        action: 'SUSPEND',
        expectedRevision: therapyRevision,
        reason: reason.trim(),
        ...(category ? { category } : {}),
        ...(expectedReturnDate
          ? { expectedReturnAt: toOffsetIso(expectedReturnDate, '08:00') }
          : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      onDone('suspended')
      onClose()
    },
    onError: (error) => {
      setFailure(
        error instanceof ApiError && error.code === 'STALE_CLINICAL_REVISION'
          ? 'O tratamento mudou desde a abertura da tela. Recarregue e confirme novamente.'
          : error instanceof ApiError
            ? error.message
            : 'Não foi possível suspender o tratamento.',
      )
    },
  })

  const canSubmit = reason.trim().length >= 10 && !!category && !mutation.isPending

  return (
    <Modal
      open
      onClose={onClose}
      title="Suspender tratamento"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button tone="danger" variant="solid" disabled={!canSubmit} onClick={() => { setFailure(null); mutation.mutate() }}>
            Suspender tratamento
          </Button>
        </>
      }
    >
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
      {failure && <p role="alert" className="text-[0.7rem] text-red-700">{failure}</p>}
    </Modal>
  )
}

/** Retomada com motivo persistido; o ponto de retomada é a previsão preservada. */
export function ResumeTherapyModal(props: LifecycleModalProps) {
  if (!props.open) return null
  return <ResumeForm key={`${props.therapyId}-${props.therapyRevision}`} {...props} />
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
  const [failure, setFailure] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: () =>
      executeTherapyLifecycle(therapyId, {
        action: 'RESUME',
        expectedRevision: therapyRevision,
        reason: reason.trim(),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      onDone('resumed')
      onClose()
    },
    onError: (error) => {
      setFailure(
        error instanceof ApiError ? error.message : 'Não foi possível retomar o tratamento.',
      )
    },
  })
  return (
    <Modal
      open
      onClose={onClose}
      title="Retomar tratamento"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button
            tone="success"
            variant="solid"
            disabled={reason.trim().length < 5 || mutation.isPending}
            onClick={() => { setFailure(null); mutation.mutate() }}
          >
            Retomar tratamento
          </Button>
        </>
      }
    >
      <p className="text-xs text-(--text) leading-relaxed">
        O tratamento volta a aceitar comandos clínicos a partir da previsão preservada.
        Para retomar em outro valor ou data, use &quot;Editar previsão pendente&quot; após a retomada.
      </p>
      <FieldLabel label="Motivo da retomada" required>
        <TextArea
          rows={2}
          placeholder="Ex: paciente reavaliado e apto a continuar."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </FieldLabel>
      {failure && <p role="alert" className="text-[0.7rem] text-red-700">{failure}</p>}
    </Modal>
  )
}

/** Histórico legível do ciclo de vida, reconstruível após reload. */
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
