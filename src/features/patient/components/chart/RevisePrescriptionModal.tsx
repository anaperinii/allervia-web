import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, Select, TextArea, toast } from '@/shared/components'
import { revisePrescription } from '@/shared/api/clinical.api'
import { listProtocols } from '@/shared/api/protocols.api'
import { ApiError } from '@/shared/api/contracts/errors'
import type { ProtocolStep } from '@/shared/api/contracts/protocols'
import { queryKeys } from '@/shared/api/query-keys'
import { formatStepPresentation } from '@/features/patient/adapters/clinical-presentation'
import { cn } from '@/shared/lib/cn'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faFlaskVial } from '@fortawesome/free-solid-svg-icons'

interface RevisePrescriptionModalProps {
  open: boolean
  therapyId: string
  therapyRevision: number
  currentVersionId: string | null
  organizationId: string
  onClose: () => void
}

/**
 * Revisão de prescrição entre versões publicadas: ensaio obrigatório mostrando
 * o impacto na previsão pendente antes da confirmação. Snapshot novo; o
 * histórico permanece na versão em que cada dose foi decidida.
 */
export function RevisePrescriptionModal(props: RevisePrescriptionModalProps) {
  if (!props.open) return null
  return (
    <ReviseForm key={`${props.therapyId}-${props.therapyRevision}`} {...props} />
  )
}

function ReviseForm({
  therapyId,
  therapyRevision,
  currentVersionId,
  organizationId,
  onClose,
}: RevisePrescriptionModalProps) {
  const queryClient = useQueryClient()
  const [versionId, setVersionId] = useState('')
  const [stepIds, setStepIds] = useState<string[]>([])
  const [startingStepId, setStartingStepId] = useState('')
  const [targetStepId, setTargetStepId] = useState('')
  const [pendingStepId, setPendingStepId] = useState('')
  const [reason, setReason] = useState('')
  const [failure, setFailure] = useState<string | null>(null)
  const [rehearsed, setRehearsed] = useState<{ body: string; summary: string } | null>(null)

  const protocolsQuery = useQuery({
    queryKey: queryKeys.protocols(organizationId),
    queryFn: ({ signal }) => listProtocols(signal),
    enabled: organizationId !== '',
  })

  const publishedOptions = useMemo(
    () =>
      (protocolsQuery.data ?? []).flatMap((protocol) =>
        protocol.versions
          .filter(
            (version) =>
              version.status === 'PUBLISHED' && version.id !== currentVersionId,
          )
          .map((version) => ({ protocol, version })),
      ),
    [protocolsQuery.data, currentVersionId],
  )
  const selected = publishedOptions.find((option) => option.version.id === versionId)
  const steps: ProtocolStep[] = selected?.version.definition.steps ?? []

  function body(dryRun: boolean) {
    return {
      targetVersionId: versionId,
      prescription: {
        protocolId: selected!.protocol.id,
        protocolVersionId: versionId,
        route: 'SUBCUTANEOUS' as const,
        stepIds,
        startingStepId,
        targetStepId,
      },
      pendingStepId,
      reason: reason.trim(),
      expectedRevision: therapyRevision,
      dryRun,
    }
  }
  const ready =
    !!selected &&
    stepIds.length > 0 &&
    !!startingStepId &&
    !!targetStepId &&
    !!pendingStepId &&
    reason.trim().length >= 10
  const currentKey = ready ? JSON.stringify(body(true)) : null
  const rehearsedMatches = rehearsed !== null && rehearsed.body === currentKey

  const mutation = useMutation({
    mutationFn: (dryRun: boolean) => revisePrescription(therapyId, body(dryRun)),
    onSuccess: async (result, dryRun) => {
      if (dryRun && result.dryRun) {
        setRehearsed({
          body: currentKey!,
          summary: `${result.pendingStep.label} — 1:${Number(result.pendingStep.concentration).toLocaleString('pt-BR')} - ${result.pendingStep.volume.replace('.', ',')}ml · ${result.pendingStep.intervalDays}d`,
        })
        setFailure(null)
        return
      }
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Prescrição revisada!',
        description:
          'Snapshot novo fixado; o histórico permanece nas versões em que cada dose foi decidida.',
        autoDismissMs: 8000,
      })
      onClose()
    },
    onError: (error) => {
      setRehearsed(null)
      setFailure(
        error instanceof ApiError ? error.message : 'Não foi possível revisar a prescrição.',
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
    if (!next.includes(pendingStepId)) setPendingStepId('')
  }

  return (
    <Modal
      open
      onClose={onClose}
      title="Revisar prescrição para outra versão"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button
            variant="outline"
            tone="brand"
            disabled={!ready || mutation.isPending}
            onClick={() => { setFailure(null); mutation.mutate(true) }}
            leftIcon={<FontAwesomeIcon icon={faFlaskVial} style={{ fontSize: 11 }} />}
          >
            Ensaiar (sem gravar)
          </Button>
          <Button
            tone="brand"
            variant="solid"
            disabled={!rehearsedMatches || mutation.isPending}
            onClick={() => { setFailure(null); mutation.mutate(false) }}
          >
            Confirmar revisão
          </Button>
        </>
      }
    >
      <FieldLabel label="Nova versão publicada">
        <Select
          value={versionId}
          onChange={(e) => {
            setVersionId(e.target.value)
            setStepIds([]); setStartingStepId(''); setTargetStepId(''); setPendingStepId('')
            setRehearsed(null)
          }}
        >
          <option value="" disabled>
            {publishedOptions.length === 0
              ? 'Nenhuma outra versão publicada'
              : 'Selecione a versão'}
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
          <FieldLabel label="Etapas permitidas">
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
          <div className="grid grid-cols-3 gap-3">
            <StepSelect label="Etapa inicial" value={startingStepId} onChange={(v) => { setStartingStepId(v); setRehearsed(null) }} steps={steps} stepIds={stepIds} />
            <StepSelect label="Etapa meta" value={targetStepId} onChange={(v) => { setTargetStepId(v); setRehearsed(null) }} steps={steps} stepIds={stepIds} />
            <StepSelect label="Previsão pendente vira" value={pendingStepId} onChange={(v) => { setPendingStepId(v); setRehearsed(null) }} steps={steps} stepIds={stepIds} />
          </div>
        </>
      )}

      <FieldLabel
        label="Motivo clínico da revisão"
        required
        helperText={`Mínimo 10 caracteres · ${reason.trim().length} digitados`}
      >
        <TextArea
          rows={2}
          placeholder="Descreva por que a prescrição muda de versão"
          value={reason}
          onChange={(e) => { setReason(e.target.value); setRehearsed(null) }}
        />
      </FieldLabel>

      {rehearsedMatches && (
        <div className="flex items-start gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
          <FontAwesomeIcon icon={faCircleCheck} className="text-emerald-600 shrink-0 mt-0.5" style={{ fontSize: 13 }} />
          <p className="text-[0.68rem] text-emerald-800 leading-relaxed">
            Ensaio aprovado sem gravar nada: a previsão pendente passa a{' '}
            <span className="font-bold">{rehearsed!.summary}</span> mantendo a data
            prevista; as doses históricas permanecem intocadas.
          </p>
        </div>
      )}
      {failure && <p role="alert" className="text-[0.7rem] text-red-700 leading-relaxed">{failure}</p>}
    </Modal>
  )
}

function StepSelect({
  label,
  value,
  onChange,
  steps,
  stepIds,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  steps: ProtocolStep[]
  stepIds: string[]
}) {
  return (
    <FieldLabel label={label}>
      <Select value={value} onChange={(e) => onChange(e.target.value)}>
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
  )
}
