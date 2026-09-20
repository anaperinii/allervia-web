import { useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { FieldLabel, SegmentedControl, Select, StepHeading, TextInput } from '@/shared/components'
import { formatCPF, formatPhone, formatWeight } from '@/shared/lib/formatters'
import { listPatients } from '@/shared/api/clinical.api'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import type { AddImmunotherapyForm } from '@/features/immunotherapy/schemas/add-immunotherapy'

interface PatientDataStepProps {
  form: UseFormReturn<AddImmunotherapyForm>
}

/**
 * Paciente novo ou existente. O médico responsável é sempre o prescritor
 * autenticado — o contrato atual não permite prescrever em nome de terceiro —
 * e por isso aparece como leitura, não como escolha.
 */
export function PatientDataStep({ form }: PatientDataStepProps) {
  const { control, register, setValue, watch, formState: { errors } } = form
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const patientMode = watch('patientMode')
  const [search, setSearch] = useState('')

  const patientsQuery = useQuery({
    queryKey: queryKeys.patients(organizationId, {
      picker: true,
      search: search.trim() || undefined,
    }),
    queryFn: ({ signal }) =>
      listPatients(
        { pageSize: 50, isActive: true, search: search.trim() || undefined },
        signal,
      ),
    enabled: organizationId !== '' && patientMode === 'existing',
  })

  const prescriberLabel = account?.professional
    ? `${account.professional.fullName}${
        account.professional.councilNumber
          ? ` · ${account.professional.councilNumber}/${account.professional.councilUf ?? ''}`
          : ''
      }`
    : ''

  return (
    <div className="space-y-5">
      <StepHeading description="Prescreva para um paciente novo ou selecione um já cadastrado. O tratamento é vinculado ao prescritor autenticado." />

      <Controller
        control={control}
        name="patientMode"
        render={({ field }) => (
          <SegmentedControl
            value={field.value}
            onChange={(value) => {
              field.onChange(value)
              setValue('patientId', '')
            }}
            aria-label="Origem do paciente"
            options={[
              { value: 'new', label: 'Paciente novo' },
              { value: 'existing', label: 'Paciente existente' },
            ]}
          />
        )}
      />

      {patientMode === 'existing' ? (
        <div className="grid grid-cols-2 gap-4">
          <FieldLabel label="Buscar paciente">
            <TextInput
              placeholder="Nome ou telefone"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </FieldLabel>
          <FieldLabel label="Paciente" error={errors.patientId?.message}>
            <Select invalid={!!errors.patientId} {...register('patientId')}>
              <option value="" disabled>
                {patientsQuery.isPending
                  ? 'Carregando pacientes…'
                  : 'Selecione o paciente'}
              </option>
              {(patientsQuery.data?.items ?? []).map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.fullName}
                  {patient.cpfMasked ? ` · ${patient.cpfMasked}` : ''}
                </option>
              ))}
            </Select>
          </FieldLabel>
          <p className="col-span-2 text-[0.65rem] leading-relaxed text-(--text-muted)">
            A lista mostra apenas pacientes sob sua responsabilidade. O novo
            tratamento não duplica o cadastro do paciente.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          <FieldLabel label="Nome do Paciente" error={errors.name?.message}>
            <TextInput placeholder="Nome completo" invalid={!!errors.name} {...register('name')} />
          </FieldLabel>
          <FieldLabel label="CPF (opcional)" error={errors.cpf?.message}>
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
          <FieldLabel label="Telefone" error={errors.phone?.message}>
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
          <FieldLabel label="Data de Nascimento" error={errors.birthDate?.message}>
            <TextInput type="date" invalid={!!errors.birthDate} {...register('birthDate')} />
          </FieldLabel>
          <FieldLabel label="Peso" error={errors.weight?.message}>
            <div className="relative">
              <Controller
                control={control}
                name="weight"
                render={({ field }) => (
                  <TextInput
                    placeholder="Ex: 70.5"
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
          <FieldLabel label="Médico Responsável">
            <TextInput value={prescriberLabel} readOnly className="text-(--text-muted) bg-gray-100/60" />
          </FieldLabel>
        </div>
      )}
    </div>
  )
}
