import { useEffect } from 'react'
import { Controller, useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Info, PowerOff } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { Button, ConfirmDiscardModal, FieldLabel, Modal, Select, TextArea, TextInput } from '@/shared/components'
import { useUnsavedChangesGuard } from '@/shared/hooks/useUnsavedChangesGuard'
import { INACTIVATION_CATEGORY_LABELS } from '@/features/patient/constants/clinical-labels'
import { PROTOCOL_INTERVAL_PRESET_STRINGS } from '@/features/immunotherapy/constants/scit-protocol'
import {
  createReactivateSchema,
  REACTIVATE_DEFAULTS,
  type ReactivateForm,
} from '@/features/patient/schemas/reactivate'
import type { Application, Inactivation, Patient } from '@/features/patient/stores/usePatientStore'

interface ReactivateModalProps {
  open: boolean
  patient: Patient
  activeInactivation: Inactivation | null
  suggestedNextDose: string
  lastRealized: Application | null
  pauseDays: number
  isMaintenance: boolean
  progressPct: number
  onClose: () => void
  onConfirm: (payload: {
    note: string
    reactivatedBy: string
    reactivateConcentration: string
    reactivateInterval: number
    justification: string
  }) => void
}

export function ReactivateModal({
  open,
  patient,
  activeInactivation,
  suggestedNextDose,
  lastRealized,
  pauseDays,
  isMaintenance,
  progressPct,
  onClose,
  onConfirm,
}: ReactivateModalProps) {
  const schema = createReactivateSchema({
    suggestedConcentration: suggestedNextDose,
    snapshotInterval: activeInactivation?.snapshotInterval ?? patient.currentInterval,
  })

  const form = useForm<ReactivateForm>({
    resolver: zodResolver(schema),
    mode: 'onBlur',
    defaultValues: REACTIVATE_DEFAULTS,
  })
  const { control, register, handleSubmit, reset, setValue, formState: { errors } } = form
  const [concentration, interval, justification, note] = useWatch({
    control,
    name: ['concentration', 'interval', 'justification', 'note'],
  })
  const isCustomInterval = interval && !PROTOCOL_INTERVAL_PRESET_STRINGS.includes(interval)
  const selectInterval = isCustomInterval ? 'outro' : interval

  useEffect(() => {
    if (open && activeInactivation) {
      reset({
        concentration: suggestedNextDose,
        interval: String(activeInactivation.snapshotInterval),
        justification: '',
        note: '',
      })
    }
  }, [open, activeInactivation, suggestedNextDose, reset])

  const diverges = activeInactivation
    ? concentration.trim() !== suggestedNextDose.trim() ||
      interval.trim() !== String(activeInactivation.snapshotInterval)
    : false

  const isDirty = diverges || !!justification?.trim() || !!note?.trim()

  const { requestClose, guardOpen, cancelDiscard, confirmDiscard } = useUnsavedChangesGuard({
    open,
    isDirty,
    onClose,
  })

  if (!activeInactivation) return null

  const submit = handleSubmit((v) => {
    onConfirm({
      note: v.note.trim(),
      reactivatedBy: patient.responsibleDoctor,
      reactivateConcentration: v.concentration.trim(),
      reactivateInterval: Number(v.interval.trim()),
      justification: v.justification.trim(),
    })
    onClose()
  })

  return (
    <>
    <Modal
      open={open}
      onClose={requestClose}
      title="Reativar paciente"
      size="lg"
      footer={
        <>
          <Button variant="outline" onClick={requestClose}>Voltar</Button>
          <Button tone="success" variant="solid" onClick={submit}>Reativar paciente</Button>
        </>
      }
    >
      <div className="flex items-start gap-2 bg-brand/10 border border-brand/25 rounded-lg px-3 py-2.5">
        <Info size={14} className="text-brand shrink-0 mt-0.5" />
        <p className="text-[0.65rem] text-brand-dark leading-relaxed">
          A sugestão abaixo respeita a progressão do protocolo. O médico pode <span className="font-bold">ajustar o ponto de retomada</span> conforme o tempo de pausa e a avaliação clínica.
        </p>
      </div>

      <div className="bg-yellow-50/50 border border-yellow-200 rounded-lg p-3 space-y-1.5">
        <div className="flex items-center gap-1.5 text-[0.55rem] font-bold text-yellow-700 uppercase tracking-wider mb-2">
          <PowerOff size={10} />
          Inativação atual
        </div>
        <Row label="Motivo" value={INACTIVATION_CATEGORY_LABELS[activeInactivation.category]} />
        <Row label="Início" value={activeInactivation.startDate} />
        <Row
          label="Tempo pausado"
          value={`${pauseDays} ${pauseDays === 1 ? 'dia' : 'dias'}`}
          accentClass={pauseDays > 30 ? 'text-red-600' : pauseDays > 14 ? 'text-amber-600' : 'text-(--text)'}
        />
        {activeInactivation.expectedReturnDate && (
          <Row label="Retorno previsto" value={activeInactivation.expectedReturnDate} />
        )}
      </div>

      <div className="bg-gray-50 border border-(--border-custom) rounded-lg p-3 space-y-1.5">
        <div className="text-[0.55rem] font-bold text-(--text-muted) uppercase tracking-wider mb-2">Progresso até a inativação</div>
        {lastRealized && (
          <Row label="Última aplicação" value={`${lastRealized.date} · ${lastRealized.dose}`} />
        )}
        <Row label="Concentração/volume atual" value={activeInactivation.snapshotConcentration} />
        <Row label="Intervalo" value={`${activeInactivation.snapshotInterval} dias`} />
        <Row label="Etapa" value={isMaintenance ? 'Manutenção' : `Indução · ${progressPct}%`} />
      </div>

      <div className="bg-teal-50/40 border border-teal-200 rounded-lg p-3 space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="text-[0.55rem] font-bold text-brand uppercase tracking-wider">Ponto de retomada</div>
          <button
            type="button"
            onClick={() => {
              setValue('concentration', suggestedNextDose)
              setValue('interval', String(activeInactivation.snapshotInterval))
            }}
            className="text-[0.55rem] font-semibold text-brand hover:underline cursor-pointer"
          >
            Usar sugestão do protocolo
          </button>
        </div>

        <FieldLabel label="Próxima concentração e volume" required error={errors.concentration?.message}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[0.6rem] text-(--text-muted) shrink-0">Sugestão:</span>
            <span className="text-[0.65rem] font-semibold text-brand shrink-0">{suggestedNextDose}</span>
          </div>
          <TextInput placeholder="Ex: 1:1.000 — 0,4ml" invalid={!!errors.concentration} {...register('concentration')} />
        </FieldLabel>

        <FieldLabel label="Intervalo entre doses" required error={errors.interval?.message}>
          <Controller
            control={control}
            name="interval"
            render={({ field }) => (
              <Select
                value={selectInterval}
                onChange={(e) => field.onChange(e.target.value === 'outro' ? ' ' : e.target.value)}
                onBlur={field.onBlur}
                invalid={!!errors.interval}
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
              <TextInput
                type="number"
                min={1}
                placeholder="Ex: 35"
                value={interval.trim()}
                onChange={(e) => setValue('interval', e.target.value.replace(/[^0-9]/g, ''), { shouldValidate: true })}
                invalid={!!errors.interval}
                className="flex-1"
              />
              <span className="text-[0.6rem] text-(--text-muted) shrink-0">dias</span>
            </div>
          )}
        </FieldLabel>
      </div>

      <FieldLabel
        label="Justificativa do ponto de retomada"
        required={diverges}
        hint={!diverges ? '(opcional)' : undefined}
        error={errors.justification?.message}
      >
        <TextArea
          rows={2}
          placeholder={diverges
            ? 'Justifique por que o ponto de retomada difere da sugestão do protocolo.'
            : 'Ex: paciente apto, seguir protocolo.'}
          invalid={!!errors.justification}
          {...register('justification')}
        />
      </FieldLabel>

      <FieldLabel label="Observação clínica" hint="(opcional)">
        <TextArea rows={2} placeholder="Ex: sem sintomas residuais, pré-medicação não necessária." {...register('note')} />
      </FieldLabel>

      <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3 py-2 flex items-center justify-between">
        <span className="text-[0.65rem] text-(--text-muted)">Responsável pela retomada</span>
        <span className="text-[0.7rem] font-semibold text-(--text)">{patient.responsibleDoctor}</span>
      </div>
    </Modal>

    <ConfirmDiscardModal
      open={guardOpen}
      onCancel={cancelDiscard}
      onConfirm={confirmDiscard}
    />
    </>
  )
}

function Row({ label, value, accentClass }: { label: string; value: string; accentClass?: string }) {
  return (
    <div className="flex items-center justify-between text-[0.65rem]">
      <span className="text-(--text-muted)">{label}</span>
      <span className={cn('font-semibold', accentClass ?? 'text-(--text)')}>{value}</span>
    </div>
  )
}
