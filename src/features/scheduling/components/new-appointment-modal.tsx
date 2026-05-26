import { useEffect, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar } from 'lucide-react'
import { Modal, Button, Select, TextInput } from '@/shared/components'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/immunotherapies-store'
import { PROTOCOL_DOSES, PROTOCOL_INTERVAL_PRESETS } from '@/features/immunotherapy/constants/scit-protocol'
import {
  newAppointmentSchema,
  NEW_APPOINTMENT_DEFAULTS,
  type NewAppointmentForm,
} from '@/features/scheduling/schemas/new-appointment'

interface NewAppointmentModalProps {
  open: boolean
  googleConnected: boolean
  onClose: () => void
  onSubmit: (data: NewAppointmentForm) => void
}

export function NewAppointmentModal({ open, googleConnected, onClose, onSubmit }: NewAppointmentModalProps) {
  const { immunotherapies } = useImmunotherapiesStore()
  const [isCustomIntervalMode, setIsCustomIntervalMode] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<NewAppointmentForm>({
    resolver: zodResolver(newAppointmentSchema),
    mode: 'onBlur',
    defaultValues: NEW_APPOINTMENT_DEFAULTS,
  })

  useEffect(() => {
    if (open) {
      reset(NEW_APPOINTMENT_DEFAULTS)
      setIsCustomIntervalMode(false)
    }
  }, [open, reset])

  const intervalValue = watch('interval')
  const selectIntervalValue = isCustomIntervalMode ? 'outro' : intervalValue

  const handleIntervalSelectChange = (value: string) => {
    if (value === 'outro') {
      setIsCustomIntervalMode(true)
      setValue('interval', '', { shouldValidate: false })
    } else {
      setIsCustomIntervalMode(false)
      setValue('interval', value, { shouldValidate: true })
    }
  }

  const customIntervalWarning = useMemo(() => {
    if (!isCustomIntervalMode) return null
    const n = parseInt(intervalValue.trim(), 10)
    if (isNaN(n) || n <= 0) return null
    if (n < 4) return '⚠ Intervalo muito curto desrespeita o tempo mínimo de segurança entre doses. Reavalie o protocolo.'
    if (n > 15) return '⚠ Intervalo muito longo na indução pode comprometer a progressão. Confirme a conduta clínica.'
    return null
  }, [isCustomIntervalMode, intervalValue])

  const onValidSubmit = handleSubmit((data) => onSubmit(data))

  const errorMsg = (message?: string) =>
    message ? <span className="text-[0.6rem] text-red-500 mt-0.5 block">{message}</span> : null

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Novo Agendamento"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" onClick={onValidSubmit}>Agendar</Button>
        </>
      }
    >
      {googleConnected && (
        <div className="flex items-center gap-2 bg-brand/5 border border-brand/20 rounded-lg px-3 py-2">
          <Calendar size={13} className="text-brand shrink-0" />
          <p className="text-[0.6rem] text-brand leading-relaxed">
            Este agendamento será sincronizado automaticamente com o Google Agenda.
          </p>
        </div>
      )}

      <div>
        <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Paciente</label>
        <Select invalid={!!errors.patientId} {...register('patientId')} defaultValue="">
          <option value="" disabled>Selecione o paciente</option>
          {immunotherapies
            .filter((immunotherapy) => immunotherapy.status === 'active')
            .map((immunotherapy) => (
              <option key={immunotherapy.id} value={immunotherapy.id}>
                {immunotherapy.name}
              </option>
            ))}
        </Select>
        {errorMsg(errors.patientId?.message)}
      </div>

      <div>
        <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Data</label>
        <TextInput type="date" invalid={!!errors.date} {...register('date')} />
        {errorMsg(errors.date?.message)}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Hora início</label>
          <TextInput type="time" invalid={!!errors.startTime} {...register('startTime')} />
          {errorMsg(errors.startTime?.message)}
        </div>
        <div>
          <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Hora fim</label>
          <TextInput type="time" invalid={!!errors.endTime} {...register('endTime')} />
          {errorMsg(errors.endTime?.message)}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Dose / Concentração</label>
          <Select invalid={!!errors.dose} {...register('dose')} defaultValue="">
            <option value="" disabled>Selecione</option>
            {PROTOCOL_DOSES.map((dose) => (
              <option key={dose} value={dose}>{dose}</option>
            ))}
          </Select>
          {errorMsg(errors.dose?.message)}
        </div>
        <div>
          <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Intervalo</label>
          <Select
            value={selectIntervalValue}
            onChange={(e) => handleIntervalSelectChange(e.target.value)}
            invalid={!!errors.interval}
          >
            {PROTOCOL_INTERVAL_PRESETS.map((preset) => (
              <option key={preset} value={String(preset)}>{preset} dias</option>
            ))}
            <option value="outro">Outro</option>
          </Select>
          {errorMsg(errors.interval?.message)}

          {isCustomIntervalMode && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <TextInput
                  type="number"
                  min="1"
                  placeholder="Ex: 35"
                  value={intervalValue}
                  onChange={(e) =>
                    setValue('interval', e.target.value.replace(/[^0-9]/g, ''), { shouldValidate: true })
                  }
                  className="flex-1"
                />
                <span className="text-[0.65rem] text-(--text-muted) shrink-0">dias</span>
              </div>
              {customIntervalWarning && (
                <div className="text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                  {customIntervalWarning}
                </div>
              )}
              <div>
                <label className="text-[0.65rem] font-semibold text-(--text-muted) mb-1 block">
                  Justificativa do intervalo personalizado <span className="text-red-400">*</span>
                </label>
                <textarea
                  rows={2}
                  placeholder="Descreva o motivo clínico para um intervalo fora do protocolo padrão"
                  {...register('intervalJustification')}
                  className="w-full rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 py-2 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all resize-none"
                />
                {errorMsg(errors.intervalJustification?.message)}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Observações</label>
        <textarea
          rows={2}
          placeholder="Observações adicionais (opcional)"
          {...register('notes')}
          className="w-full rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 py-2 text-xs placeholder:text-(--text-muted)/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all resize-none"
        />
      </div>
    </Modal>
  )
}
