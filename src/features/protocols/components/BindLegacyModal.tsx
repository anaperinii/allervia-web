import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, Select, toast } from '@/shared/components'
import { bindLegacyTherapy } from '@/shared/api/protocols.api'
import { ApiError } from '@/shared/api/contracts/errors'
import type {
  MigrationReportRow,
  ProtocolStep,
  ResolvedPrescriptionInput,
  TreatmentProtocol,
} from '@/shared/api/contracts/protocols'
import { formatStepPresentation } from '@/features/patient/adapters/clinical-presentation'
import { cn } from '@/shared/lib/cn'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faFlaskVial } from '@fortawesome/free-solid-svg-icons'

const BIND_ERROR_EXPLANATIONS: Record<string, string> = {
  VALUE_NOT_CONFIGURED:
    'O valor legado não corresponde a nenhuma etapa selecionada. Não escolhemos o valor mais próximo: ajuste a seleção de etapas ou revise a versão publicada para conter o valor exato.',
  AMBIGUOUS_VALUE:
    'Mais de uma etapa selecionada tem exatamente esses valores. Restrinja a seleção até o valor legado corresponder a uma única etapa.',
  LEGACY_TARGET_MISMATCH:
    'A meta legada (concentração/volume) difere da etapa meta escolhida. A meta precisa coincidir exatamente com o registro histórico.',
  PENDING_DOSE_REQUIRES_REVIEW:
    'O tratamento não tem exatamente uma previsão pendente. Revise as previsões duplicadas ou ausentes antes de vincular.',
  STALE_CLINICAL_REVISION:
    'O tratamento mudou desde a abertura do inventário. Recarregue e reconfirme a decisão.',
  PRESCRIPTION_ALREADY_BOUND:
    'Este tratamento já foi vinculado com outra configuração. Recarregue o inventário.',
  CLINICAL_TRANSITION_REVIEW_REQUIRED:
    'A versão escolhida ainda exige revisão clínica das transições e não pode receber vínculos.',
  UNSUPPORTED_ROUTE:
    'A via deste tratamento não é suportada pela automação atual (SLIT permanece leitura).',
}

interface BindLegacyModalProps {
  row: MigrationReportRow | null
  protocols: TreatmentProtocol[]
  organizationId: string
  onClose: () => void
  onBound: () => void
}

export function BindLegacyModal(props: BindLegacyModalProps) {
  if (!props.row) return null
  return <BindLegacyForm key={`${props.row.therapyId}-${props.row.revision}`} {...props} />
}

function BindLegacyForm({
  row,
  protocols,
  organizationId,
  onClose,
  onBound,
}: BindLegacyModalProps) {
  const queryClient = useQueryClient()
  const therapy = row!
  const pending = therapy.pendingDoses[0]

  const [versionId, setVersionId] = useState('')
  const [stepIds, setStepIds] = useState<string[]>([])
  const [startingStepId, setStartingStepId] = useState('')
  const [targetStepId, setTargetStepId] = useState('')
  const [failure, setFailure] = useState<string | null>(null)
  const [rehearsed, setRehearsed] = useState<{ body: string; stepLabel: string } | null>(null)

  const publishedOptions = useMemo(
    () =>
      protocols.flatMap((protocol) =>
        protocol.versions
          .filter((version) => version.status === 'PUBLISHED')
          .map((version) => ({ protocol, version })),
      ),
    [protocols],
  )
  const selected = publishedOptions.find((option) => option.version.id === versionId)
  const steps: ProtocolStep[] = selected?.version.definition.steps ?? []

  function prescription(): ResolvedPrescriptionInput | null {
    if (!selected || stepIds.length === 0 || !startingStepId || !targetStepId) return null
    return {
      protocolId: selected.protocol.id,
      protocolVersionId: selected.version.id,
      route: 'SUBCUTANEOUS',
      stepIds,
      startingStepId,
      targetStepId,
    }
  }
  const currentBody = prescription()
  const currentKey = currentBody ? JSON.stringify(currentBody) : null
  const rehearsedMatches = rehearsed !== null && rehearsed.body === currentKey

  const bindMutation = useMutation({
    mutationFn: (dryRun: boolean) =>
      bindLegacyTherapy(therapy.therapyId, {
        versionId,
        prescription: currentBody!,
        expectedRevision: therapy.revision,
        dryRun,
      }),
    onSuccess: async (result, dryRun) => {
      if (dryRun && 'dryRun' in result) {
        const step = steps.find((candidate) => candidate.id === result.stepId)
        setRehearsed({
          body: currentKey!,
          stepLabel: step
            ? `${step.label} — ${formatStepPresentation(step)}`
            : result.stepId,
        })
        setFailure(null)
        return
      }
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Tratamento vinculado!',
        description:
          'Prescrição gravada com fuso e versão fixados; datas, valores e histórico preservados. A decisão ficou na trilha de auditoria.',
        autoDismissMs: 8000,
      })
      onBound()
    },
    onError: (error) => {
      setRehearsed(null)
      if (error instanceof ApiError && error.code && BIND_ERROR_EXPLANATIONS[error.code]) {
        setFailure(BIND_ERROR_EXPLANATIONS[error.code])
        if (error.code === 'STALE_CLINICAL_REVISION' || error.code === 'PRESCRIPTION_ALREADY_BOUND') {
          void queryClient.invalidateQueries({
            queryKey: ['clinical', organizationId, 'protocols', 'migration'],
          })
        }
        return
      }
      setFailure(
        error instanceof ApiError ? error.message : 'Não foi possível processar a vinculação.',
      )
    },
  })

  const toggleStep = (stepId: string) => {
    setRehearsed(null)
    const next = stepIds.includes(stepId)
      ? stepIds.filter((id) => id !== stepId)
      : steps.map((step) => step.id).filter((id) => id === stepId || stepIds.includes(id))
    setStepIds(next)
    if (!next.includes(startingStepId)) setStartingStepId('')
    if (!next.includes(targetStepId)) setTargetStepId('')
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={`Vincular tratamento de ${therapy.patient.fullName}`}
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button
            variant="outline"
            tone="brand"
            disabled={!currentBody || bindMutation.isPending}
            onClick={() => { setFailure(null); bindMutation.mutate(true) }}
            leftIcon={<FontAwesomeIcon icon={faFlaskVial} style={{ fontSize: 11 }} />}
          >
            Ensaiar (sem gravar)
          </Button>
          <Button
            tone="brand"
            variant="solid"
            disabled={!rehearsedMatches || bindMutation.isPending}
            onClick={() => { setFailure(null); bindMutation.mutate(false) }}
          >
            Vincular tratamento
          </Button>
        </>
      }
    >
      <div className="bg-gray-50 border border-(--border-custom) rounded-lg p-3 space-y-1.5">
        <div className="text-[0.55rem] font-bold text-(--text-muted) uppercase tracking-wider mb-1">
          Registro legado (imutável)
        </div>
        <Row
          label="Previsão pendente"
          value={
            pending
              ? `1:${Number(pending.concentration).toLocaleString('pt-BR')} - ${pending.volume.replace('.', ',')}ml · ${pending.intervalDays} dias`
              : '—'
          }
        />
        <Row
          label="Meta legada"
          value={`1:${Number(therapy.target.concentration).toLocaleString('pt-BR')} - ${(therapy.target.volume ?? '—').replace('.', ',')}ml`}
        />
      </div>

      <FieldLabel label="Versão publicada do protocolo">
        <Select
          value={versionId}
          onChange={(e) => {
            setVersionId(e.target.value)
            setStepIds([])
            setStartingStepId('')
            setTargetStepId('')
            setRehearsed(null)
          }}
        >
          <option value="" disabled>
            {publishedOptions.length === 0 ? 'Nenhuma versão publicada' : 'Selecione a versão'}
          </option>
          {publishedOptions.map((option) => (
            <option key={option.version.id} value={option.version.id}>
              {option.protocol.name} — v{option.version.number}
            </option>
          ))}
        </Select>
      </FieldLabel>

      {selected && (
        <>
          <FieldLabel label="Etapas permitidas na prescrição">
            <div className="flex flex-wrap gap-2">
              {steps.map((step) => {
                const active = stepIds.includes(step.id)
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="checkbox"
                    aria-checked={active}
                    onClick={() => toggleStep(step.id)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-[0.7rem] font-semibold transition-colors cursor-pointer',
                      active
                        ? 'border-brand bg-brand-50 text-brand-dark'
                        : 'border-(--border-custom) bg-white text-(--text-muted) hover:border-brand/50',
                    )}
                  >
                    {step.label}
                    <span className="ml-1.5 font-normal opacity-75">
                      {formatStepPresentation(step)} · {step.intervalDays}d
                    </span>
                  </button>
                )
              })}
            </div>
          </FieldLabel>
          <div className="grid grid-cols-2 gap-3">
            <FieldLabel label="Etapa inicial">
              <Select
                value={startingStepId}
                onChange={(e) => { setStartingStepId(e.target.value); setRehearsed(null) }}
              >
                <option value="" disabled>Selecione</option>
                {steps
                  .filter((step) => stepIds.includes(step.id))
                  .map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.label} — {formatStepPresentation(step)}
                    </option>
                  ))}
              </Select>
            </FieldLabel>
            <FieldLabel label="Etapa meta (deve coincidir com a meta legada)">
              <Select
                value={targetStepId}
                onChange={(e) => { setTargetStepId(e.target.value); setRehearsed(null) }}
              >
                <option value="" disabled>Selecione</option>
                {steps
                  .filter((step) => stepIds.includes(step.id))
                  .map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.label} — {formatStepPresentation(step)}
                    </option>
                  ))}
              </Select>
            </FieldLabel>
          </div>
        </>
      )}

      {rehearsedMatches && (
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
          <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 shrink-0 mt-0.5" style={{ fontSize: 13 }} />
          <p className="text-[0.68rem] text-emerald-800 leading-relaxed">
            Ensaio aprovado sem gravar nada: a previsão pendente corresponde a{' '}
            <span className="font-bold">{rehearsed!.stepLabel}</span> e as doses históricas
            permanecem intocadas. Vincular grava prescrição e plano em uma transação.
          </p>
        </div>
      )}
      {failure && (
        <p role="alert" className="text-[0.7rem] text-red-700 leading-relaxed">{failure}</p>
      )}
      {!rehearsedMatches && currentBody && !failure && (
        <p className="text-[0.65rem] text-(--text-muted)">
          Ensaie esta exata seleção antes de vincular; qualquer mudança exige novo ensaio.
        </p>
      )}
    </Modal>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-[0.65rem]">
      <span className="text-(--text-muted)">{label}</span>
      <span className="font-semibold text-(--text)">{value}</span>
    </div>
  )
}
