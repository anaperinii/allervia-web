import type { EvolutionForm } from '@/features/patient/schemas/evolution'
import type { DoseDetail } from '@/shared/api/contracts/clinical'
import { FieldLabel, Select, StepHeading, TextArea, TextInput } from '@/shared/components'
import { GLASS_CARD_SHADOW } from '@/shared/constants/glass-card'
import { cn } from '@/shared/lib/cn'
import { addMinutesToTime } from '@/shared/lib/dates'
import { useProfessionalDirectory } from '@/shared/hooks/useProfessionalDirectory'
import { formatStepPresentation } from '@/features/patient/adapters/clinical-presentation'
import { Controller, type UseFormReturn } from 'react-hook-form'

import { faCircleInfo } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const CONDUCT_OPTIONS = [
  { value: 'MAINTAIN', label: 'Manter protocolo', desc: 'Mantém a previsão recomendada' },
  { value: 'REQUEST_PHYSICIAN_REVIEW', label: 'Solicitar avaliação médica', desc: 'Encaminha a decisão ao prescritor' },
  { value: 'SUSPEND_TREATMENT', label: 'Suspender tratamento', desc: 'Exige poder de revisão clínica' },
] as const

interface PostApplicationStepProps {
  form: UseFormReturn<EvolutionForm>
  dose: DoseDetail | null
}

export function PostApplicationStep({ form, dose }: PostApplicationStepProps) {
  const { control, register, getValues, setValue, watch, formState: { errors } } = form
  const { members: executors } = useProfessionalDirectory()
  const stepId = watch('stepId')
  const sideEffectPost = watch('sideEffectPost')
  const medicationNeededPost = watch('medicationNeededPost')
  const conduct = watch('conduct')

  const allowedValues = dose?.allowedValues ?? []
  const plannedStepId = dose?.plannedStepId ?? null
  const selectedStep = allowedValues.find((step) => step.id === stepId) ?? null
  const isAdjusted = plannedStepId !== null && stepId !== '' && stepId !== plannedStepId

  return (
    <div className="space-y-5">
      <StepHeading description="Registre a aplicação realizada: valor permitido pela prescrição, janela de horário e executor. A sucessora é gravada pelo servidor na confirmação." />
      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Data da aplicação" error={errors.applicationDate?.message}>
          <TextInput type="date" invalid={!!errors.applicationDate} {...register('applicationDate')} />
        </FieldLabel>
        <div className="grid grid-cols-2 gap-2">
          <FieldLabel label="Hora início" error={errors.startTime?.message}>
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
          <FieldLabel label="Hora fim" error={errors.endTime?.message}>
            <TextInput type="time" invalid={!!errors.endTime} {...register('endTime')} />
          </FieldLabel>
        </div>
        <FieldLabel
          label="Valor administrado"
          hint={
            plannedStepId
              ? '(previsto pela prescrição já selecionado)'
              : undefined
          }
          error={errors.stepId?.message}
        >
          <Select invalid={!!errors.stepId} {...register('stepId')}>
            <option value="" disabled>
              {allowedValues.length === 0 ? 'Sem valores permitidos' : 'Selecione o valor'}
            </option>
            {allowedValues.map((step) => (
              <option key={step.id} value={step.id}>
                {step.label} — {formatStepPresentation(step)} · {step.intervalDays}d
                {step.id === plannedStepId ? ' (previsto)' : ''}
              </option>
            ))}
          </Select>
        </FieldLabel>
        <FieldLabel label="Executor da aplicação" error={errors.performerId?.message}>
          <Select invalid={!!errors.performerId} {...register('performerId')}>
            <option value="" disabled>Selecione o executor</option>
            {executors
              .filter((member) =>
                member.roles.some((role) => role === 'PHYSICIAN' || role === 'NURSE'),
              )
              .map((member) => (
                <option key={member.professionalId} value={member.professionalId}>
                  {member.fullName}
                </option>
              ))}
          </Select>
        </FieldLabel>
        {isAdjusted && (
          <div className="col-span-2" style={{ animation: 'slide-up-fade 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            <FieldLabel
              label="Motivo clínico do valor diferente do previsto"
              required
              error={errors.adjustmentReason?.message}
            >
              <TextArea
                rows={2}
                placeholder={
                  selectedStep
                    ? `Justifique administrar ${formatStepPresentation(selectedStep)} no lugar do previsto`
                    : 'Justifique o valor escolhido'
                }
                invalid={!!errors.adjustmentReason}
                className="focus:ring-amber-400"
                {...register('adjustmentReason')}
              />
            </FieldLabel>
          </div>
        )}
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
        {sideEffectPost === 'yes' && (
          <div className="col-start-1" style={{ animation: 'slide-up-fade 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            <FieldLabel label="Efeitos colaterais relatados" error={errors.reportedEffectsPost?.message}>
              <TextInput
                placeholder="Separe múltiplos efeitos por vírgula"
                invalid={!!errors.reportedEffectsPost}
                {...register('reportedEffectsPost')}
              />
            </FieldLabel>
          </div>
        )}
        {medicationNeededPost === 'yes' && (
          <div className="col-start-2" style={{ animation: 'slide-up-fade 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            <FieldLabel label="Medicações administradas" error={errors.medicationsPost?.message}>
              <TextInput
                placeholder="Separe múltiplas medicações por vírgula"
                invalid={!!errors.medicationsPost}
                {...register('medicationsPost')}
              />
            </FieldLabel>
          </div>
        )}
        {sideEffectPost === 'yes' && medicationNeededPost === 'yes' && (
          <div className="col-span-2" style={{ animation: 'slide-up-fade 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}>
            <div
              className="rounded-2xl bg-white/25 backdrop-blur-xl p-3.5 space-y-2.5"
              style={{
                boxShadow: GLASS_CARD_SHADOW,
                backdropFilter: 'blur(20px) saturate(150%)',
                WebkitBackdropFilter: 'blur(20px) saturate(150%)',
                backgroundImage:
                  'linear-gradient(105deg, rgba(245,158,11,0.18) 0%, rgba(252,211,77,0.10) 25%, rgba(254,243,199,0.04) 55%, transparent 80%)',
              }}
            >
              <div className="flex items-start gap-2">
                <FontAwesomeIcon icon={faCircleInfo} className="text-amber-700 shrink-0 mt-0.5" style={{ fontSize: 16 }} />
                <div className="leading-relaxed">
                  <div className="text-[0.78rem] font-bold text-amber-800">Reação adversa com uso de medicação registrada</div>
                  <div className="text-[0.68rem] text-amber-800/80 mt-0.5">
                    Selecione a conduta imediata gravada junto da aplicação. Suspender exige poder de revisão clínica;
                    ajustar a próxima previsão é um comando próprio feito no prontuário.
                  </div>
                </div>
              </div>
              <Controller
                control={control}
                name="conduct"
                render={({ field }) => (
                  <div role="radiogroup" aria-label="Conduta imediata" className="grid grid-cols-3 gap-2">
                    {CONDUCT_OPTIONS.map((opt) => {
                      const selected = field.value === opt.value
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => field.onChange(opt.value as EvolutionForm['conduct'])}
                          className={cn(
                            'text-left px-2.5 py-2 rounded-lg border-[1.5px] transition-all cursor-pointer',
                            selected
                              ? 'border-amber-500 bg-gray-50/60'
                              : 'border-amber-200 bg-gray-50/60 hover:border-amber-400',
                          )}
                        >
                          <div className="text-[0.75rem] font-bold text-(--text)">{opt.label}</div>
                          <div className="text-[0.65rem] text-(--text-muted) mt-0.5">{opt.desc}</div>
                        </button>
                      )
                    })}
                  </div>
                )}
              />
              {errors.conduct?.message && (
                <span className="text-[0.6rem] text-red-500 block">{errors.conduct.message}</span>
              )}
              {conduct && (
                <FieldLabel
                  label="Justificativa clínica"
                  required
                  error={errors.conductJustification?.message}
                >
                  <TextArea
                    rows={2}
                    placeholder="Contexto clínico da conduta escolhida"
                    invalid={!!errors.conductJustification}
                    className="focus:ring-amber-400"
                    {...register('conductJustification')}
                  />
                </FieldLabel>
              )}
            </div>
          </div>
        )}
        <div className="col-span-2">
          <FieldLabel label="Notas do responsável">
            <TextArea rows={2} placeholder="Insira aqui" {...register('notesPost')} />
          </FieldLabel>
        </div>
      </div>
    </div>
  )
}
