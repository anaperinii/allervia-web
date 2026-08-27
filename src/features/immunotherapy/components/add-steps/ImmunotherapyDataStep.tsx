import { Controller, type UseFormReturn } from 'react-hook-form'
import { FieldLabel, Select, StepHeading, TextInput } from '@/shared/components'
import { formatConcentration, formatVolume } from '@/shared/lib/formatters'
import { todayStr } from '@/shared/lib/dates'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/useCustomTypesStore'
import { MODALITY_OPTIONS } from '@/features/immunotherapy/constants/modality'
import type { AddImmunotherapyForm } from '@/features/immunotherapy/schemas/add-immunotherapy'

interface ImmunotherapyDataStepProps {
  form: UseFormReturn<AddImmunotherapyForm>
}

export function ImmunotherapyDataStep({ form }: ImmunotherapyDataStepProps) {
  const { control, register, formState: { errors } } = form
  const customTypes = useCustomTypesStore((s) => s.types)

  return (
    <div className="space-y-5">
      <StepHeading description="Tipo de alérgeno, via de administração, extrato, data de início e as metas de concentração e volume do protocolo." />
      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Tipo" error={errors.type?.message}>
          <Select invalid={!!errors.type} {...register('type')}>
            <option value="" disabled>Selecione o tipo</option>
            {customTypes.map((t) => <option key={t.id} value={t.label}>{t.label}</option>)}
          </Select>
        </FieldLabel>
        <FieldLabel label="Via Cutânea" error={errors.modality?.message}>
          <Select invalid={!!errors.modality} {...register('modality')}>
            <option value="" disabled>Selecione</option>
            {MODALITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FieldLabel>
        <FieldLabel label="Data de Início" error={errors.startDate?.message}>
          <TextInput type="date" min={todayStr()} invalid={!!errors.startDate} {...register('startDate')} />
        </FieldLabel>
        <FieldLabel label="Extrato" error={errors.extract?.message}>
          <TextInput placeholder="Ex: Der p 60 + Der f 10% + Blt 30%" invalid={!!errors.extract} {...register('extract')} />
        </FieldLabel>
        <FieldLabel label="Meta de Concentração" error={errors.targetConcentration?.message}>
          <Controller
            control={control}
            name="targetConcentration"
            render={({ field }) => (
              <TextInput
                placeholder="1:10"
                invalid={!!errors.targetConcentration}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(formatConcentration(e.target.value))}
              />
            )}
          />
        </FieldLabel>
        <FieldLabel label="Meta de Volume" error={errors.targetVolume?.message}>
          <div className="relative">
            <Controller
              control={control}
              name="targetVolume"
              render={({ field }) => (
                <TextInput
                  placeholder="Ex: 0.5"
                  invalid={!!errors.targetVolume}
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
      </div>
    </div>
  )
}
