import { useMemo, useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  executeTherapyLifecycle,
  getImmunotherapy,
  listDosesForTherapy,
} from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { Button, FieldLabel, TextArea, TextInput, toast } from '@/shared/components'
import { PageHeader } from '@/shared/components/showcase'
import {
  formatInstantDate,
  THERAPY_STATUS_LABELS,
} from '@/features/patient/adapters/clinical-presentation'
import { cn } from '@/shared/lib/cn'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

export function PatientCompletionPage() {
  const navigate = useNavigate()
  const { patientId, therapy: therapyParam } = useSearch({
    from: '/patient-completion',
  })
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const queryClient = useQueryClient()

  const therapyQuery = useQuery({
    queryKey: queryKeys.immunotherapy(organizationId, therapyParam ?? ''),
    queryFn: ({ signal }) => getImmunotherapy(therapyParam!, signal),
    enabled: organizationId !== '' && !!therapyParam,
  })
  const therapy = therapyQuery.data ?? null

  const dosesQuery = useQuery({
    queryKey: queryKeys.doses(organizationId, therapyParam ?? ''),
    queryFn: ({ signal }) => listDosesForTherapy(therapyParam!, signal),
    enabled: organizationId !== '' && !!therapyParam,
  })
  const administered = useMemo(
    () =>
      (dosesQuery.data ?? []).filter((dose) => dose.administeredAt !== null),
    [dosesQuery.data],
  )

  const [retesting, setRetesting] = useState(true)
  const [rescueMedication, setRescueMedication] = useState(true)
  const [environmentalControl, setEnvironmentalControl] = useState(true)
  const [customText, setCustomText] = useState('')
  const [monitoringSchedule, setMonitoringSchedule] = useState('')
  const [warningSigns, setWarningSigns] = useState('')
  const [note, setNote] = useState('')
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [failure, setFailure] = useState<string | null>(null)

  const mutation = useMutation({
    mutationFn: () =>
      executeTherapyLifecycle(therapy!.id, {
        action: 'COMPLETE',
        expectedRevision: therapy!.revision,
        reason: reason.trim(),
        recommendations: {
          retesting,
          rescueMedication,
          environmentalControl,
          custom: customText
            .split(/[;\n]/)
            .map((item) => item.trim())
            .filter(Boolean),
          ...(monitoringSchedule.trim()
            ? { monitoringSchedule: monitoringSchedule.trim() }
            : {}),
          ...(warningSigns.trim() ? { warningSigns: warningSigns.trim() } : {}),
          ...(note.trim() ? { note: note.trim() } : {}),
        },
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Tratamento encerrado',
        description:
          'Recomendações finais persistidas no histórico do tratamento; previsões pendentes arquivadas.',
        autoDismissMs: 8000,
      })
      navigate({
        to: '/patient/$patientId',
        params: { patientId: therapy!.patient.id },
        search: { therapy: therapy!.id },
      })
    },
    onError: (error) => {
      setFailure(
        error instanceof ApiError && error.code === 'STALE_CLINICAL_REVISION'
          ? 'O tratamento mudou desde a abertura da tela. Recarregue e confirme novamente.'
          : error instanceof ApiError
            ? error.message
            : 'Não foi possível encerrar o tratamento.',
      )
    },
  })

  if (!therapyParam) {
    return (
      <MissingState
        message="Selecione o tratamento a encerrar pelo prontuário do paciente."
        onBack={() =>
          patientId
            ? navigate({ to: '/patient/$patientId', params: { patientId } })
            : navigate({ to: '/immunotherapies' })
        }
      />
    )
  }
  if (therapyQuery.isPending) {
    return <MissingState message="Carregando tratamento…" />
  }
  if (!therapy) {
    return (
      <MissingState
        message="Tratamento não encontrado."
        onBack={() => navigate({ to: '/immunotherapies' })}
      />
    )
  }

  const canSubmit =
    therapy.status === 'IN_PROGRESS' &&
    reason.trim().length >= 10 &&
    confirmed &&
    !mutation.isPending

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <PageHeader
        breadcrumb={['Prontuário', 'Conclusão de Tratamento']}
        title={therapy.patient.fullName}
      />
      <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-8 max-w-3xl">
        <div className="rounded-xl border border-(--border-custom) bg-white px-4 py-3">
          <div className="text-xs font-bold text-(--text) mb-2">Resumo do tratamento</div>
          <div className="grid grid-cols-3 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
            <Cell label="Tipo" value={`${therapy.immunoType} · ${therapy.extract}`} />
            <Cell label="Situação" value={THERAPY_STATUS_LABELS[therapy.status]} />
            <Cell label="Início" value={formatInstantDate(therapy.inductionStartDate)} />
            <Cell
              label="Manutenção desde"
              value={therapy.maintenanceStartDate ? formatInstantDate(therapy.maintenanceStartDate) : '—'}
            />
            <Cell label="Aplicações realizadas" value={String(administered.length)} />
            <Cell
              label="Previsão pendente"
              value={therapy.nextDose ? formatInstantDate(therapy.nextDose.scheduledAt) : 'Nenhuma'}
            />
          </div>
          {therapy.nextDose && (
            <p className="mt-2 text-[0.65rem] text-amber-700">
              A previsão pendente será arquivada pelo encerramento — efeito explícito e auditado.
            </p>
          )}
        </div>

        <div className="rounded-xl border border-(--border-custom) bg-white px-4 py-3 space-y-3">
          <div className="text-xs font-bold text-(--text)">Recomendações finais</div>
          <div className="flex flex-wrap gap-2">
            <ToggleChip label="Retestagem alérgica" active={retesting} onToggle={() => setRetesting((v) => !v)} />
            <ToggleChip label="Medicação de resgate" active={rescueMedication} onToggle={() => setRescueMedication((v) => !v)} />
            <ToggleChip label="Controle ambiental" active={environmentalControl} onToggle={() => setEnvironmentalControl((v) => !v)} />
          </div>
          <FieldLabel label="Recomendações adicionais" hint="(separe por ponto e vírgula)">
            <TextInput
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Ex: retorno em 6 meses; evitar exposição a ácaros"
            />
          </FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Plano de retornos">
              <TextArea rows={2} value={monitoringSchedule} onChange={(e) => setMonitoringSchedule(e.target.value)} placeholder="Ex: semestral no primeiro ano." />
            </FieldLabel>
            <FieldLabel label="Sinais de alerta">
              <TextArea rows={2} value={warningSigns} onChange={(e) => setWarningSigns(e.target.value)} placeholder="Ex: recorrência de sintomas respiratórios." />
            </FieldLabel>
          </div>
          <FieldLabel label="Nota clínica" hint="(opcional)">
            <TextArea rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          </FieldLabel>
        </div>

        <div className="rounded-xl border border-(--border-custom) bg-white px-4 py-3 space-y-3">
          <FieldLabel
            label="Motivo do encerramento"
            required
            helperText={`Mínimo 10 caracteres · ${reason.trim().length} digitados`}
          >
            <TextArea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex: meta terapêutica atingida e sustentada."
            />
          </FieldLabel>
          <label className="flex items-start gap-2 text-[0.7rem] text-(--text) cursor-pointer">
            <input
              type="checkbox"
              checked={confirmed}
              onChange={(e) => setConfirmed(e.target.checked)}
              className="mt-0.5"
            />
            Confirmo o encerramento deste tratamento com as recomendações acima; o
            registro é persistido no histórico e as previsões pendentes serão arquivadas.
          </label>
          {therapy.status !== 'IN_PROGRESS' && (
            <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <FontAwesomeIcon icon={faCircleInfo} className="text-amber-700 shrink-0" style={{ fontSize: 13 }} />
              <p className="text-[0.68rem] text-amber-800">
                Só tratamentos em andamento podem ser encerrados; retome antes, se suspenso.
              </p>
            </div>
          )}
          {failure && <p role="alert" className="text-[0.7rem] text-red-700">{failure}</p>}
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() =>
                navigate({
                  to: '/patient/$patientId',
                  params: { patientId: therapy.patient.id },
                  search: { therapy: therapy.id },
                })
              }
            >
              Voltar ao prontuário
            </Button>
            <Button tone="brand" variant="solid" disabled={!canSubmit} onClick={() => { setFailure(null); mutation.mutate() }}>
              Encerrar tratamento
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function MissingState({ message, onBack }: { message: string; onBack?: () => void }) {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <span className="text-xs text-(--text-muted)">{message}</span>
      {onBack && (
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-semibold text-brand underline cursor-pointer bg-transparent border-none"
        >
          Voltar
        </button>
      )}
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-3 py-2">
      <div className="text-[0.6rem] font-semibold text-(--text-muted) mb-0.5">{label}</div>
      <div className="text-[0.72rem] font-medium text-(--text)">{value}</div>
    </div>
  )
}

function ToggleChip({ label, active, onToggle }: { label: string; active: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={active}
      onClick={onToggle}
      className={cn(
        'rounded-lg border px-3 py-1.5 text-[0.7rem] font-semibold transition-colors cursor-pointer',
        active
          ? 'border-brand bg-brand-50 text-brand-dark'
          : 'border-(--border-custom) bg-white text-(--text-muted) hover:border-brand/50',
      )}
    >
      {label}
    </button>
  )
}
