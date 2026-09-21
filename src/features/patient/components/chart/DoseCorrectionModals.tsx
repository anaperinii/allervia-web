import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, Select, TextArea, TextInput, toast } from '@/shared/components'
import {
  addLateObservation,
  getDose,
  retractDose,
} from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { toOffsetIso, todayStr } from '@/shared/lib/dates'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleInfo } from '@fortawesome/free-solid-svg-icons'

function toList(text: string): string[] {
  return text
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .filter(Boolean)
}

interface CorrectionModalProps {
  doseId: string | null
  organizationId: string
  onClose: () => void
}

/**
 * Retratação de aplicação registrada em erro: comando auditado que preserva os
 * valores administrados, arquiva a sucessora pendente e reemite a previsão
 * original. Sucessora já aplicada exige análise explícita — o servidor recusa.
 */
export function RetractDoseModal({ doseId, organizationId, onClose }: CorrectionModalProps) {
  const queryClient = useQueryClient()
  const [reason, setReason] = useState('')
  const [failure, setFailure] = useState<string | null>(null)

  const doseQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, doseId ?? ''),
    queryFn: ({ signal }) => getDose(doseId!, signal),
    enabled: doseId !== null && organizationId !== '',
  })
  const dose = doseQuery.data ?? null

  const mutation = useMutation({
    mutationFn: () =>
      retractDose(doseId!, {
        reason: reason.trim(),
        expectedRevision: dose!.revision,
        expectedTherapyRevision: dose!.therapyRevision,
      }),
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
    onError: (error) => {
      setFailure(
        error instanceof ApiError && error.code === 'SUCCESSOR_ALREADY_ADMINISTERED'
          ? 'A dose seguinte já foi aplicada: a retratação em cadeia exige análise clínica explícita, não um comando automático.'
          : error instanceof ApiError
            ? error.message
            : 'Não foi possível retratar a aplicação.',
      )
    },
  })

  return (
    <Modal
      open={doseId !== null}
      onClose={onClose}
      title="Registrar aplicação em erro"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button
            tone="danger"
            variant="solid"
            disabled={reason.trim().length < 10 || !dose || mutation.isPending}
            onClick={() => { setFailure(null); mutation.mutate() }}
          >
            Registrar em erro
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2.5">
        <FontAwesomeIcon icon={faCircleInfo} className="text-amber-700 shrink-0 mt-0.5" style={{ fontSize: 14 }} />
        <p className="text-[0.65rem] text-amber-800 leading-relaxed">
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
      {failure && <p role="alert" className="text-[0.7rem] text-red-700 leading-relaxed">{failure}</p>}
    </Modal>
  )
}

/** Observação pós-aplicação tardia: registro adicional com autoria e instante próprios. */
export function LateObservationModal({ doseId, organizationId, onClose }: CorrectionModalProps) {
  const queryClient = useQueryClient()
  const [effects, setEffects] = useState('')
  const [medications, setMedications] = useState('')
  const [notes, setNotes] = useState('')
  const [date, setDate] = useState(todayStr())
  const [time, setTime] = useState('12:00')
  const [conduct, setConduct] = useState('')
  const [conductJustification, setConductJustification] = useState('')
  const [failure, setFailure] = useState<string | null>(null)

  const doseQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, doseId ?? ''),
    queryFn: ({ signal }) => getDose(doseId!, signal),
    enabled: doseId !== null && organizationId !== '',
  })
  const dose = doseQuery.data ?? null

  const mutation = useMutation({
    mutationFn: () =>
      addLateObservation(doseId!, {
        reportedSideEffects: toList(effects),
        administeredMedications: toList(medications),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
        observedAt: toOffsetIso(date, time),
        ...(conduct
          ? {
              conduct: {
                type: conduct as 'MAINTAIN' | 'REQUEST_PHYSICIAN_REVIEW' | 'SUSPEND_TREATMENT',
                justification: conductJustification.trim() || undefined,
              },
            }
          : {}),
        expectedTherapyRevision: dose!.therapyRevision,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clinical', organizationId] })
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Observação tardia registrada',
        description: 'Registro adicional imutável com sua autoria e o instante observado.',
        autoDismissMs: 8000,
      })
      onClose()
    },
    onError: (error) => {
      setFailure(
        error instanceof ApiError && error.code === 'CONDUCT_REQUIRES_PHYSICIAN'
          ? 'Suspender o tratamento exige poder de revisão clínica. Registre a observação e solicite avaliação médica.'
          : error instanceof ApiError
            ? error.message
            : 'Não foi possível registrar a observação.',
      )
    },
  })

  const canSubmit =
    !!dose &&
    (toList(effects).length > 0 || toList(medications).length > 0 || notes.trim().length > 0) &&
    (!conduct || conduct === 'MAINTAIN' || conductJustification.trim().length > 0) &&
    !mutation.isPending

  return (
    <Modal
      open={doseId !== null}
      onClose={onClose}
      title="Observação pós-aplicação tardia"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Voltar</Button>
          <Button tone="brand" variant="solid" disabled={!canSubmit} onClick={() => { setFailure(null); mutation.mutate() }}>
            Registrar observação
          </Button>
        </>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <FieldLabel label="Efeitos relatados" hint="(separe por vírgula)">
          <TextInput value={effects} onChange={(e) => setEffects(e.target.value)} placeholder="Ex: urticária, prurido" />
        </FieldLabel>
        <FieldLabel label="Medicações administradas" hint="(separe por vírgula)">
          <TextInput value={medications} onChange={(e) => setMedications(e.target.value)} placeholder="Ex: anti-histamínico" />
        </FieldLabel>
        <FieldLabel label="Data observada">
          <TextInput type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </FieldLabel>
        <FieldLabel label="Hora observada">
          <TextInput type="time" value={time} onChange={(e) => setTime(e.target.value)} />
        </FieldLabel>
      </div>
      <FieldLabel label="Notas">
        <TextArea rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Contexto do relato (ex: paciente ligou à noite)" />
      </FieldLabel>
      <FieldLabel label="Conduta decorrente" hint="(opcional)">
        <Select value={conduct} onChange={(e) => setConduct(e.target.value)}>
          <option value="">Sem conduta registrada</option>
          <option value="MAINTAIN">Manter protocolo</option>
          <option value="REQUEST_PHYSICIAN_REVIEW">Solicitar avaliação médica</option>
          <option value="SUSPEND_TREATMENT">Suspender tratamento (exige revisão clínica)</option>
        </Select>
      </FieldLabel>
      {conduct && conduct !== 'MAINTAIN' && (
        <FieldLabel label="Justificativa da conduta" required>
          <TextArea
            rows={2}
            value={conductJustification}
            onChange={(e) => setConductJustification(e.target.value)}
            placeholder="Contexto clínico da conduta"
          />
        </FieldLabel>
      )}
      {failure && <p role="alert" className="text-[0.7rem] text-red-700 leading-relaxed">{failure}</p>}
    </Modal>
  )
}
