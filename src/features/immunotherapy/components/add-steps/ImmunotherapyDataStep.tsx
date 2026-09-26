import { useMemo } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { FieldLabel, Select, StepHeading, TextInput } from '@/shared/components'
import { todayStr } from '@/shared/lib/dates'
import { cn } from '@/shared/lib/cn'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/useCustomTypesStore'
import { listProtocols, readAutomation } from '@/shared/api/protocols.api'
import type { ProtocolStep, ProtocolVersion } from '@/shared/api/contracts/protocols'
import { formatStepPresentation } from '@/features/patient/adapters/clinical-presentation'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import type { AddImmunotherapyForm } from '@/features/immunotherapy/schemas/add-immunotherapy'

interface ImmunotherapyDataStepProps {
  form: UseFormReturn<AddImmunotherapyForm>
}

interface PublishedOption {
  version: ProtocolVersion
  protocolName: string
  isDefault: boolean
}

export function ImmunotherapyDataStep({ form }: ImmunotherapyDataStepProps) {
  const { control, register, setValue, watch, formState: { errors } } = form
  const customTypes = useCustomTypesStore((s) => s.types)
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''

  const protocolsQuery = useQuery({
    queryKey: queryKeys.protocols(organizationId),
    queryFn: ({ signal }) => listProtocols(signal),
    enabled: organizationId !== '',
  })
  const automationQuery = useQuery({
    queryKey: queryKeys.automation(organizationId),
    queryFn: ({ signal }) => readAutomation(signal),
    enabled: organizationId !== '',
  })

  const defaultVersionIds = useMemo(
    () => new Set((automationQuery.data?.defaults ?? []).map((d) => d.versionId)),
    [automationQuery.data],
  )

  const publishedOptions = useMemo<PublishedOption[]>(() => {
    return (protocolsQuery.data ?? []).flatMap((protocol) =>
      protocol.versions
        .filter((version) => version.status === 'PUBLISHED')
        .map((version) => ({
          version,
          protocolName: protocol.name,
          isDefault: defaultVersionIds.has(version.id),
        })),
    )
  }, [protocolsQuery.data, defaultVersionIds])

  const selectedVersionId = watch('protocolVersionId')
  const selectedStepIds = watch('stepIds')
  const selectedVersion = publishedOptions.find(
    (option) => option.version.id === selectedVersionId,
  )?.version

  const steps: ProtocolStep[] = selectedVersion?.definition.steps ?? []

  const toggleStep = (stepId: string) => {
    const next = selectedStepIds.includes(stepId)
      ? selectedStepIds.filter((id) => id !== stepId)
      :
        steps.map((step) => step.id).filter(
          (id) => id === stepId || selectedStepIds.includes(id),
        )
    setValue('stepIds', next, { shouldValidate: true })
    if (!next.includes(watch('startingStepId'))) setValue('startingStepId', '')
    if (!next.includes(watch('targetStepId'))) setValue('targetStepId', '')
  }

  return (
    <div className="space-y-5">
      <StepHeading description="Tipo de alérgeno, extrato, data de início e a versão publicada do protocolo com as etapas permitidas." />
      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Tipo" error={errors.type?.message}>
          <Select invalid={!!errors.type} {...register('type')}>
            <option value="" disabled>Selecione o tipo</option>
            {customTypes.map((t) => <option key={t.id} value={t.label}>{t.label}</option>)}
          </Select>
        </FieldLabel>
        <FieldLabel label="Via de Administração">
          <TextInput value="Subcutânea (SCIT)" readOnly className="text-(--text-muted) bg-gray-100/60" />
        </FieldLabel>
        <FieldLabel label="Data de Início" error={errors.startDate?.message}>
          <TextInput type="date" min={todayStr()} invalid={!!errors.startDate} {...register('startDate')} />
        </FieldLabel>
        <FieldLabel label="Extrato" error={errors.extract?.message}>
          <TextInput placeholder="Ex: Der p 60% + Der f 10% + Blt 30%" invalid={!!errors.extract} {...register('extract')} />
        </FieldLabel>
        <FieldLabel label="Versão do protocolo" error={errors.protocolVersionId?.message}>
          <Controller
            control={control}
            name="protocolVersionId"
            render={({ field }) => (
              <Select
                invalid={!!errors.protocolVersionId}
                value={field.value}
                onChange={(e) => {
                  field.onChange(e.target.value)
                  setValue('stepIds', [])
                  setValue('startingStepId', '')
                  setValue('targetStepId', '')
                }}
              >
                <option value="" disabled>
                  {protocolsQuery.isPending
                    ? 'Carregando versões…'
                    : publishedOptions.length === 0
                      ? 'Nenhuma versão publicada'
                      : 'Selecione a versão'}
                </option>
                {publishedOptions.map((option) => (
                  <option key={option.version.id} value={option.version.id}>
                    {option.protocolName} — v{option.version.number}
                    {option.isDefault ? ' (padrão)' : ''}
                  </option>
                ))}
              </Select>
            )}
          />
        </FieldLabel>
      </div>

      {selectedVersion && (
        <div className="space-y-3">
          <FieldLabel label="Etapas permitidas na prescrição" error={errors.stepIds?.message}>
            <div className="flex flex-wrap gap-2">
              {steps.map((step) => {
                const selected = selectedStepIds.includes(step.id)
                return (
                  <button
                    key={step.id}
                    type="button"
                    role="checkbox"
                    aria-checked={selected}
                    onClick={() => toggleStep(step.id)}
                    className={cn(
                      'rounded-lg border px-3 py-1.5 text-[0.7rem] font-semibold transition-colors cursor-pointer',
                      selected
                        ? 'border-brand bg-brand-50 text-brand-dark'
                        : 'border-(--border-custom) bg-white text-(--text-muted) hover:border-brand/50',
                    )}
                  >
                    {step.label}
                    <span className="ml-1.5 font-normal opacity-75">
                      {formatStepPresentation(step)} · {step.intervalDays}d
                    </span>
                  </button>
                )
              })}
            </div>
          </FieldLabel>

          <div className="grid grid-cols-2 gap-4">
            <FieldLabel label="Etapa inicial" error={errors.startingStepId?.message}>
              <Select invalid={!!errors.startingStepId} {...register('startingStepId')}>
                <option value="" disabled>Selecione</option>
                {steps
                  .filter((step) => selectedStepIds.includes(step.id))
                  .map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.label} — {formatStepPresentation(step)}
                    </option>
                  ))}
              </Select>
            </FieldLabel>
            <FieldLabel label="Etapa meta" error={errors.targetStepId?.message}>
              <Select invalid={!!errors.targetStepId} {...register('targetStepId')}>
                <option value="" disabled>Selecione</option>
                {steps
                  .filter((step) => selectedStepIds.includes(step.id))
                  .map((step) => (
                    <option key={step.id} value={step.id}>
                      {step.label} — {formatStepPresentation(step)}
                    </option>
                  ))}
              </Select>
            </FieldLabel>
          </div>
        </div>
      )}
    </div>
  )
}
