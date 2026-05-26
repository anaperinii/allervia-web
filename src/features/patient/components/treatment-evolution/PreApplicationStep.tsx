import type { UseFormReturn } from 'react-hook-form'
import { cn } from '@/shared/lib/cn'
import { FieldLabel, Select, TextArea, TextInput } from '@/shared/components'
import type { EvolutionForm } from '@/features/patient/schemas/evolution'

interface PreApplicationStepProps {
  form: UseFormReturn<EvolutionForm>
}

export function PreApplicationStep({ form }: PreApplicationStepProps) {
  const { register, watch, formState: { errors } } = form
  const sideEffect = watch('sideEffect')
  const medicationNeeded = watch('medicationNeeded')

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-bold text-(--text)">Pré-Aplicação</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FieldLabel label="Como o paciente passou durante o intervalo?" required error={errors.intervalReport?.message}>
            <TextArea rows={3} placeholder="Descreva aqui" invalid={!!errors.intervalReport} {...register('intervalReport')} />
          </FieldLabel>
        </div>
        <FieldLabel label="Efeito colateral">
          <Select {...register('sideEffect')}>
            <option value="no">Não</option>
            <option value="yes">Sim</option>
          </Select>
        </FieldLabel>
        <FieldLabel label="Necessidade de medicação">
          <Select {...register('medicationNeeded')}>
            <option value="no">Não</option>
            <option value="yes">Sim</option>
          </Select>
        </FieldLabel>
        <div>
          <label className={cn('text-xs font-semibold mb-1.5 block', sideEffect === 'yes' ? 'text-(--text-muted)' : 'text-(--text-muted)/40')}>
            Efeitos colaterais relatados {sideEffect === 'yes' && <span className="text-red-400">*</span>}
          </label>
          <TextInput
            placeholder="Insira aqui"
            disabled={sideEffect !== 'yes'}
            invalid={sideEffect === 'yes' && !!errors.reportedEffects}
            className={cn(sideEffect !== 'yes' && 'opacity-40 cursor-not-allowed')}
            {...register('reportedEffects')}
          />
          {sideEffect === 'yes' && errors.reportedEffects?.message && (
            <span className="text-[0.6rem] text-red-500 mt-0.5 block">{errors.reportedEffects.message}</span>
          )}
        </div>
        <div>
          <label className={cn('text-xs font-semibold mb-1.5 block', medicationNeeded === 'yes' ? 'text-(--text-muted)' : 'text-(--text-muted)/40')}>
            Medicações administradas {medicationNeeded === 'yes' && <span className="text-red-400">*</span>}
          </label>
          <TextInput
            placeholder="Insira aqui"
            disabled={medicationNeeded !== 'yes'}
            invalid={medicationNeeded === 'yes' && !!errors.medications}
            className={cn(medicationNeeded !== 'yes' && 'opacity-40 cursor-not-allowed')}
            {...register('medications')}
          />
          {medicationNeeded === 'yes' && errors.medications?.message && (
            <span className="text-[0.6rem] text-red-500 mt-0.5 block">{errors.medications.message}</span>
          )}
        </div>
        <div className="col-span-2">
          <FieldLabel label="Notas do responsável">
            <TextArea rows={2} placeholder="Insira aqui" {...register('notesPre')} />
          </FieldLabel>
        </div>
      </div>
    </div>
  )
}
