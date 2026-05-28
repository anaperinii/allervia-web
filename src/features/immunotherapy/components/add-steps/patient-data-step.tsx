import { Controller, type UseFormReturn } from 'react-hook-form'
import { FieldLabel, Select, TextInput } from '@/shared/components'
import { formatCPF, formatPhone, formatWeight } from '@/shared/lib/formatters'
import { todayStr , minDateStr } from '@/shared/lib/dates'
import { useDateBounds } from '@/shared/hooks/use-date-bounds'
import { PROFILES } from '@/shared/identity/user-store'
import type { AddImmunotherapyForm } from '@/features/immunotherapy/forms/add-immunotherapy'

interface PatientDataStepProps {
  form: UseFormReturn<AddImmunotherapyForm>
}

export function PatientDataStep({ form }: PatientDataStepProps) {
  useDateBounds() // keeps date inputs updated on year change
  const { control, register, formState: { errors } } = form

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-bold text-(--text)">Dados do Paciente</h2>
      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Nome do Paciente" required error={errors.name?.message}>
          <TextInput placeholder="Nome completo" invalid={!!errors.name} {...register('name')} />
        </FieldLabel>
        <FieldLabel label="CPF" required error={errors.cpf?.message}>
          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <TextInput
                placeholder="000.000.000-00"
                invalid={!!errors.cpf}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(formatCPF(e.target.value))}
              />
            )}
          />
        </FieldLabel>
        <FieldLabel label="Telefone" required error={errors.phone?.message}>
          <Controller
            control={control}
            name="phone"
            render={({ field }) => (
              <TextInput
                placeholder="(00) 00000-0000"
                invalid={!!errors.phone}
                value={field.value}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(formatPhone(e.target.value))}
              />
            )}
          />
        </FieldLabel>
        <FieldLabel label="Data de Nascimento" required error={errors.birthDate?.message}>
          <TextInput type="date" min={minDateStr()} max={todayStr()} invalid={!!errors.birthDate} {...register('birthDate')} />
        </FieldLabel>
        <FieldLabel label="Peso" required error={errors.weight?.message}>
          <div className="relative">
            <Controller
              control={control}
              name="weight"
              render={({ field }) => (
                <TextInput
                  placeholder="Ex: 72.5"
                  invalid={!!errors.weight}
                  className="pr-10"
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(formatWeight(e.target.value))}
                />
              )}
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[0.65rem] font-semibold text-(--text-muted)">kg</span>
          </div>
        </FieldLabel>
        <FieldLabel label="Médico Responsável" required error={errors.responsibleDoctor?.message}>
          <Select invalid={!!errors.responsibleDoctor} {...register('responsibleDoctor')}>
            <option value="" disabled>Selecione o médico</option>
            {PROFILES.filter((p) => p.role === 'doctor').map((p) => (
              <option key={p.id} value={p.name}>{p.name} · {p.registration}</option>
            ))}
          </Select>
        </FieldLabel>
      </div>
    </div>
  )
}
