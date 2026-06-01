import { Controller, type UseFormReturn } from 'react-hook-form'
import { Info } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { FieldLabel, Select, TextArea, TextInput } from '@/shared/components'
import { formatConcentration, formatVolume } from '@/shared/lib/formatters'
import { PROTOCOL_INTERVAL_PRESET_STRINGS } from '@/features/immunotherapy/constants/scit-protocol'
import { APPLICATION_ADMINISTRATORS } from '@/shared/identity/user-store'
import type { EvolutionForm } from '@/features/patient/forms/evolution'
import { minDateStr, todayStr } from '@/shared/lib/dates'
import { useDateBounds } from '@/shared/hooks/use-date-bounds'

function addMinutesToTime(time: string, minutes: number): string {
  const parts = time.split(':')
  if (parts.length !== 2) return ''
  const h = parseInt(parts[0], 10)
  const m = parseInt(parts[1], 10)
  if (isNaN(h) || isNaN(m)) return ''
  const total = h * 60 + m + minutes
  const newH = Math.floor(total / 60) % 24
  const newM = total % 60
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`
}

const REACTION_OPTIONS = [
  { value: 'reduce_dose', label: 'Reduzir dose', desc: 'Retornar ao volume anterior' },
  { value: 'increase_interval', label: 'Aumentar intervalo', desc: 'Ampliar espaçamento entre doses' },
  { value: 'suspend', label: 'Suspender temporariamente', desc: 'Pausar até avaliação médica' },
  { value: 'maintain', label: 'Manter protocolo', desc: 'Mantém dose e intervalo' },
] as const

interface PostApplicationStepProps {
  form: UseFormReturn<EvolutionForm>
}

export function PostApplicationStep({ form }: PostApplicationStepProps) {
  useDateBounds() // keeps date inputs updated on year change
  const { control, register, watch, getValues, setValue, formState: { errors } } = form
  const nextInterval = watch('nextInterval')
  const sideEffectPost = watch('sideEffectPost')
  const medicationNeededPost = watch('medicationNeededPost')
  const reactionAdjustment = watch('reactionAdjustment')

  const isCustomInterval = nextInterval && !PROTOCOL_INTERVAL_PRESET_STRINGS.includes(nextInterval)
  const selectIntervalValue = isCustomInterval ? 'outro' : nextInterval

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-bold text-(--text)">Pós-Aplicação</h2>
      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Data da aplicação" required error={errors.applicationDate?.message}>
          <TextInput type="date" min={minDateStr()} max={todayStr()} invalid={!!errors.applicationDate} {...register('applicationDate')} />
        </FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <FieldLabel label="Hora início" required error={errors.startTime?.message}>
            <Controller
              control={control}
              name="startTime"
              render={({ field }) => (
                <TextInput
                  type="time"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(e) => {
                    const v = e.target.value
                    field.onChange(v)
                    if (v && !getValues('endTime')) setValue('endTime', addMinutesToTime(v, 30))
                  }}
                  invalid={!!errors.startTime}
                />
              )}
            />
          </FieldLabel>
          <FieldLabel label="Hora fim" required error={errors.endTime?.message}>
            <TextInput type="time" invalid={!!errors.endTime} {...register('endTime')} />
          </FieldLabel>
        </div>
        <FieldLabel label="Volume aplicado" required error={errors.appliedVolume?.message}>
          <div className="relative">
            <Controller
              control={control}
              name="appliedVolume"
              render={({ field }) => (
                <TextInput
                  placeholder="Ex: 0.5"
                  invalid={!!errors.appliedVolume}
                  className="pr-10"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(formatVolume(e.target.value))}
                />
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-(--text-muted)">ml</span>
          </div>
        </FieldLabel>
        <FieldLabel label="Concentração do extrato" required error={errors.concentration?.message}>
          <Controller
            control={control}
            name="concentration"
            render={({ field }) => (
              <TextInput
                placeholder="1:10"
                invalid={!!errors.concentration}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(formatConcentration(e.target.value))}
              />
            )}
          />
        </FieldLabel>
        <div>
          <FieldLabel label="Intervalo próxima aplicação" required error={errors.nextInterval?.message}>
            <Controller
              control={control}
              name="nextInterval"
              render={({ field }) => (
                <Select
                  value={selectIntervalValue}
                  onChange={(e) => field.onChange(e.target.value === 'outro' ? ' ' : e.target.value)}
                  onBlur={field.onBlur}
                  invalid={!!errors.nextInterval}
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
          </FieldLabel>
          {isCustomInterval && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center gap-2">
                <Controller
                  control={control}
                  name="nextInterval"
                  render={({ field }) => (
                    <TextInput
                      type="number"
                      min={1}
                      placeholder="Ex: 35"
                      value={field.value.trim()}
                      onChange={(e) => field.onChange(e.target.value.replace(/[^0-9]/g, ''))}
                      invalid={!!errors.nextInterval}
                      className="flex-1"
                    />
                  )}
                />
                <span className="text-[0.65rem] text-(--text-muted) shrink-0">dias</span>
              </div>
              <CustomIntervalWarning value={nextInterval} />
              <FieldLabel label="Justificativa do intervalo personalizado" required error={errors.intervalJustification?.message}>
                <TextArea
                  rows={2}
                  placeholder="Descreva o motivo clínico para um intervalo fora do protocolo padrão"
                  invalid={!!errors.intervalJustification}
                  className="focus:ring-amber-400"
                  {...register('intervalJustification')}
                />
              </FieldLabel>
            </div>
          )}
        </div>
        <FieldLabel label="Responsável" required error={errors.administrator?.message}>
          <Select invalid={!!errors.administrator} {...register('administrator')}>
            <option value="" disabled>Selecione o responsável pela aplicação</option>
            {APPLICATION_ADMINISTRATORS.map((p) => (
              <option key={p.id} value={p.name}>{p.name} — {p.title}</option>
            ))}
          </Select>
        </FieldLabel>
        <FieldLabel label="Efeito colateral">
          <Select {...register('sideEffectPost')}>
            <option value="no">Não</option>
            <option value="yes">Sim</option>
          </Select>
        </FieldLabel>
        <FieldLabel label="Necessidade de medicação">
          <Select {...register('medicationNeededPost')}>
            <option value="no">Não</option>
            <option value="yes">Sim</option>
          </Select>
        </FieldLabel>
        <div className={cn('transition-all duration-300 overflow-hidden', sideEffectPost === 'yes' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0')}>
          <FieldLabel label="Efeitos colaterais relatados" error={errors.reportedEffectsPost?.message}>
            <TextInput placeholder="Insira aqui" invalid={!!errors.reportedEffectsPost} {...register('reportedEffectsPost')} />
          </FieldLabel>
        </div>
        <div className={cn('transition-all duration-300 overflow-hidden', medicationNeededPost === 'yes' ? 'max-h-24 opacity-100' : 'max-h-0 opacity-0')}>
          <FieldLabel label="Medicações administradas" error={errors.medicationsPost?.message}>
            <TextInput placeholder="Insira aqui" invalid={!!errors.medicationsPost} {...register('medicationsPost')} />
          </FieldLabel>
        </div>
        <div className={cn('col-span-2 transition-all duration-300 overflow-hidden', sideEffectPost === 'yes' && medicationNeededPost === 'yes' ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0')}>
          <div className="bg-amber-50/60 border border-amber-200 rounded-lg p-3 space-y-2.5">
            <div className="flex items-start gap-2">
              <Info size={14} className="text-amber-700 shrink-0 mt-0.5" />
              <div className="text-[0.65rem] text-amber-800 leading-relaxed">
                <span className="font-bold">Reação adversa com uso de medicação registrada.</span> Selecione a conduta a ser aplicada no protocolo antes de concluir a evolução. A escolha fica vinculada a esta aplicação no histórico clínico.
              </div>
            </div>
            <Controller
              control={control}
              name="reactionAdjustment"
              render={({ field }) => (
                <div role="radiogroup" aria-label="Conduta para o protocolo" className="grid grid-cols-2 gap-2">
                  {REACTION_OPTIONS.map((opt) => {
                    const selected = field.value === opt.value
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => field.onChange(opt.value as EvolutionForm['reactionAdjustment'])}
                        className={cn(
                          'text-left px-2.5 py-2 rounded-lg border-[1.5px] transition-all cursor-pointer',
                          selected ? 'border-amber-500 bg-amber-100/50' : 'border-amber-200 bg-white hover:border-amber-400',
                        )}
                      >
                        <div className="text-[0.65rem] font-bold text-(--text)">{opt.label}</div>
                        <div className="text-[0.55rem] text-(--text-muted) mt-0.5">{opt.desc}</div>
                      </button>
                    )
                  })}
                </div>
              )}
            />
            {reactionAdjustment && (
              <FieldLabel
                label="Justificativa clínica"
                required={reactionAdjustment === 'maintain'}
                error={errors.reactionAdjustmentJustification?.message}
              >
                <TextArea
                  rows={2}
                  placeholder={reactionAdjustment === 'maintain'
                    ? 'Justifique por que o protocolo será mantido mesmo com reação adversa'
                    : 'Contexto clínico da conduta (opcional)'}
                  className="focus:ring-amber-400"
                  {...register('reactionAdjustmentJustification')}
                />
              </FieldLabel>
            )}
          </div>
        </div>
        <div className="col-span-2">
          <FieldLabel label="Notas do responsável">
            <TextArea rows={2} placeholder="Insira aqui" {...register('notesPost')} />
          </FieldLabel>
        </div>
      </div>
    </div>
  )
}

function CustomIntervalWarning({ value }: { value: string }) {
  const n = parseInt(value.trim(), 10)
  if (isNaN(n) || n <= 0) return null
  if (n < 4) {
    return (
      <div className="text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
        Intervalo muito curto desrespeita o tempo mínimo de segurança entre doses. Reavalie o protocolo.
      </div>
    )
  }
  if (n > 15) {
    return (
      <div className="text-[0.65rem] text-amber-700 bg-amber-50 border border-amber-200 rounded px-2 py-1">
        Intervalo muito longo na indução pode comprometer a progressão. Confirme a conduta clínica.
      </div>
    )
  }
  return null
}
