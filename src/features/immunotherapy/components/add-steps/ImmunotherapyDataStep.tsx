import { useMemo, useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { FieldLabel, Select, StepHeading, TextInput } from '@/shared/components'
import { todayStr } from '@/shared/lib/dates'
import { cn } from '@/shared/lib/cn'
import { listImmunotherapyTypes } from '@/shared/api/clinical.api'
import { listProtocols, readAutomation } from '@/shared/api/protocols.api'
import type { ProtocolStep, ProtocolVersion } from '@/shared/api/contracts/protocols'
import { formatStepOption } from '@/features/patient/adapters/clinical-presentation'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import type { AddImmunotherapyForm } from '@/features/immunotherapy/schemas/add-immunotherapy'

import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface ImmunotherapyDataStepProps {
  form: UseFormReturn<AddImmunotherapyForm>
}

const TYPES_LISTBOX_ID = 'add-immunotherapy-type-suggestions'

interface PublishedOption {
  version: ProtocolVersion
  protocolName: string
  isDefault: boolean
}

export function ImmunotherapyDataStep({ form }: ImmunotherapyDataStepProps) {
  const { control, register, setValue, watch, formState: { errors } } = form
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''

  const typesQuery = useQuery({
    queryKey: queryKeys.immunotherapyTypes(organizationId),
    queryFn: ({ signal }) => listImmunotherapyTypes(signal),
    enabled: organizationId !== '',
  })

  const [showTypeSuggestions, setShowTypeSuggestions] = useState(false)
  const [highlightedTypeIndex, setHighlightedTypeIndex] = useState(-1)

  const typeValue = watch('type')
  const knownTypes = typesQuery.data
  const typeSuggestions = useMemo(() => {
    const term = typeValue.trim().toLowerCase()
    if (!term) return knownTypes ?? []
    return (knownTypes ?? []).filter((label) => label.toLowerCase().includes(term))
  }, [knownTypes, typeValue])

  const typeDropdownOpen =
    showTypeSuggestions && (typesQuery.isPending || typeSuggestions.length > 0)

  const selectType = (label: string) => {
    setValue('type', label, { shouldValidate: true })
    setShowTypeSuggestions(false)
    setHighlightedTypeIndex(-1)
  }

  const handleTypeKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!typeDropdownOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedTypeIndex((prev) =>
        prev < typeSuggestions.length - 1 ? prev + 1 : 0,
      )
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedTypeIndex((prev) =>
        prev > 0 ? prev - 1 : typeSuggestions.length - 1,
      )
    } else if (e.key === 'Enter') {
      if (highlightedTypeIndex >= 0 && typeSuggestions[highlightedTypeIndex]) {
        e.preventDefault()
        selectType(typeSuggestions[highlightedTypeIndex])
      }
    } else if (e.key === 'Escape') {
      setShowTypeSuggestions(false)
      setHighlightedTypeIndex(-1)
    }
  }

  const typeField = register('type', {
    onChange: () => {
      setShowTypeSuggestions(true)
      setHighlightedTypeIndex(-1)
    },
  })

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

  const applyStepIds = (next: string[]) => {
    setValue('stepIds', next, { shouldValidate: true })
    if (!next.includes(watch('startingStepId'))) setValue('startingStepId', '')
    if (!next.includes(watch('targetStepId'))) setValue('targetStepId', '')
  }

  const toggleStep = (stepId: string) => {
    const next = selectedStepIds.includes(stepId)
      ? selectedStepIds.filter((id) => id !== stepId)
      :
        steps.map((step) => step.id).filter(
          (id) => id === stepId || selectedStepIds.includes(id),
        )
    applyStepIds(next)
  }

  const allSelected =
    steps.length > 0 && steps.every((step) => selectedStepIds.includes(step.id))

  return (
    <div className="space-y-5">
      <StepHeading description="Tipo de alérgeno, extrato, data de início e a versão publicada do protocolo com as etapas permitidas." />
      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Tipo" error={errors.type?.message}>
          <div className="relative">
            <TextInput
              placeholder="Ex: Ácaros, Gramíneas…"
              invalid={!!errors.type}
              autoComplete="off"
              role="combobox"
              aria-expanded={typeDropdownOpen}
              aria-controls={TYPES_LISTBOX_ID}
              aria-autocomplete="list"
              aria-activedescendant={
                highlightedTypeIndex >= 0
                  ? `${TYPES_LISTBOX_ID}-${highlightedTypeIndex}`
                  : undefined
              }
              {...typeField}
              onFocus={() => setShowTypeSuggestions(true)}
              onBlur={(e) => {
                setTimeout(() => setShowTypeSuggestions(false), 200)
                void typeField.onBlur(e)
              }}
              onKeyDown={handleTypeKeyDown}
            />
            {typeDropdownOpen && (
              <div
                id={TYPES_LISTBOX_ID}
                role="listbox"
                className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-(--border-custom) bg-white shadow-lg"
              >
                {typesQuery.isPending ? (
                  <div className="px-4 py-2.5 text-xs text-(--text-muted)">
                    Carregando tipos…
                  </div>
                ) : (
                  typeSuggestions.map((label, index) => (
                    <button
                      key={label}
                      id={`${TYPES_LISTBOX_ID}-${index}`}
                      type="button"
                      role="option"
                      aria-selected={highlightedTypeIndex === index}
                      onClick={() => selectType(label)}
                      onMouseEnter={() => setHighlightedTypeIndex(index)}
                      className={cn(
                        'block w-full px-4 py-2.5 text-left text-xs font-medium text-(--text) transition-colors',
                        highlightedTypeIndex === index
                          ? 'bg-teal-50'
                          : 'hover:bg-teal-50',
                      )}
                    >
                      {label}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
          {typesQuery.isError ? (
            <p className="mt-1 text-[0.6rem] leading-relaxed text-amber-700">
              Não foi possível carregar os tipos já usados na clínica — digite o
              tipo manualmente.
            </p>
          ) : (
            <p className="mt-1 text-[0.6rem] leading-relaxed text-(--text-muted)">
              {knownTypes !== undefined && knownTypes.length === 0
                ? 'Nenhum tipo cadastrado ainda — digite o primeiro.'
                : 'Escolha um tipo já usado na clínica ou digite um novo.'}
            </p>
          )}
        </FieldLabel>
        <FieldLabel label="Via de Administração">
          <TextInput value="Subcutânea (SCIT)" readOnly className="text-(--text-muted) bg-gray-100/60" />
        </FieldLabel>
        <FieldLabel
          label="Data de Início"
          error={errors.startDate?.message}
          helperText={`Primeira previsão às 08:00 no fuso ${account?.organization?.timeZone ?? 'America/Sao_Paulo'}.`}
        >
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

                  const version = publishedOptions.find(
                    (option) => option.version.id === e.target.value,
                  )?.version
                  setValue(
                    'stepIds',
                    version?.definition.steps.map((step) => step.id) ?? [],
                  )
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
          <fieldset
            className="relative rounded-xl border px-3.5 pb-3.5 pt-2.5"
            style={{ borderColor: 'rgba(18,51,58,0.22)' }}
          >
            <legend className="flex items-center gap-2 px-1.5">
              <span className="text-xs font-semibold text-(--text-muted)">
                Etapas permitidas na prescrição
              </span>
              <span className="text-[0.6rem] text-(--text-muted)">
                {selectedStepIds.length} de {steps.length} selecionadas
              </span>
            </legend>
            <button
              type="button"
              onClick={() =>
                applyStepIds(allSelected ? [] : steps.map((step) => step.id))
              }
              className={cn(
                'absolute -top-5 right-5 flex items-center gap-1.5 rounded-md border px-2 py-1 text-[0.65rem] font-semibold transition-colors cursor-pointer',
                allSelected
                  ? 'border-red-300 bg-red-50 text-red-700 hover:border-red-400 hover:bg-red-100'
                  : 'border-(--border-custom) bg-white text-(--text-muted) hover:border-brand/50 hover:text-brand-dark',
              )}
            >
              {allSelected && (
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
              )}
              {allSelected ? 'Limpar seleção' : 'Selecionar todas'}
            </button>
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
                    {formatStepOption(step)}
                    <span className="ml-1.5 font-normal opacity-75">
                      {step.intervalDays}d
                    </span>
                  </button>
                )
              })}
            </div>
            {errors.stepIds?.message && (
              <span className="mt-0.5 block text-[0.6rem] text-red-500">
                {errors.stepIds.message}
              </span>
            )}
          </fieldset>

          <div className="grid grid-cols-2 gap-4">
            <FieldLabel label="Etapa inicial" error={errors.startingStepId?.message}>
              <Select invalid={!!errors.startingStepId} {...register('startingStepId')}>
                <option value="" disabled>Selecione</option>
                {steps
                  .filter((step) => selectedStepIds.includes(step.id))
                  .map((step) => (
                    <option key={step.id} value={step.id}>
                      {formatStepOption(step)}
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
                      {formatStepOption(step)}
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
