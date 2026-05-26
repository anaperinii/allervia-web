import { Controller, type UseFormReturn } from 'react-hook-form'
import { FieldLabel, Select, TextInput } from '@/shared/components'
import { formatConcentration, formatVolume } from '@/shared/lib/formatters'
import { todayStr , minDateStr } from '@/shared/lib/dates'
import { useDateBounds } from '@/shared/hooks/use-date-bounds'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/custom-types-store'
import { MODALITY_OPTIONS } from '@/features/immunotherapy/constants/modality'
import type { AddImmunotherapyForm } from '@/features/immunotherapy/forms/add-immunotherapy'

interface ImmunotherapyDataStepProps {
  form: UseFormReturn<AddImmunotherapyForm>
}

export function ImmunotherapyDataStep({ form }: ImmunotherapyDataStepProps) {
  useDateBounds() // keeps date inputs updated on year change
  const { control, register, formState: { errors } } = form
  const customTypes = useCustomTypesStore((s) => s.types)

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-bold text-(--text)">Dados da Imunoterapia</h2>
      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Tipo" required error={errors.type?.message}>
          <Select invalid={!!errors.type} {...register('type')}>
            <option value="" disabled>Selecione o tipo</option>
            {customTypes.map((t) => <option key={t.id} value={t.label}>{t.label}</option>)}
          </Select>
        </FieldLabel>
        <FieldLabel label="Via Cutânea" required error={errors.modality?.message}>
          <Select invalid={!!errors.modality} {...register('modality')}>
            <option value="" disabled>Selecione</option>
            {MODALITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </Select>
        </FieldLabel>
        <FieldLabel label="Data de Início" required error={errors.startDate?.message}>
          <TextInput type="date" min={todayStr()} invalid={!!errors.startDate} {...register('startDate')} />
        </FieldLabel>
        <FieldLabel label="Extrato" required error={errors.extract?.message}>
          <TextInput placeholder="Ex: Der p 60 + Der f 10% + Blt 30%" invalid={!!errors.extract} {...register('extract')} />
        </FieldLabel>
        <FieldLabel label="Meta de Concentração" required error={errors.targetConcentration?.message}>
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
        <FieldLabel label="Meta de Volume" required error={errors.targetVolume?.message}>
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
