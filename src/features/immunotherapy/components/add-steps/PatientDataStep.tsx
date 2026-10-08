import { useEffect, useRef, useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useQuery } from '@tanstack/react-query'
import { FieldLabel, StepHeading, TextInput } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { formatCPF, formatPhone, formatWeight } from '@/shared/lib/formatters'
import { calculateAge, parseIsoDate, toDateInputValue } from '@/shared/lib/dates'
import { getPatient, listPatients } from '@/shared/api/clinical.api'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import type { PatientListItem } from '@/shared/api/contracts/clinical'
import {
  isMinorBirthDate,
  type AddImmunotherapyForm,
} from '@/features/immunotherapy/schemas/add-immunotherapy'

import { faXmark } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const MIN_SEARCH_LENGTH = 2
const LISTBOX_ID = 'add-immunotherapy-patient-suggestions'

interface PatientDataStepProps {
  form: UseFormReturn<AddImmunotherapyForm>
}

export function PatientDataStep({ form }: PatientDataStepProps) {
  const { control, register, setValue, watch, formState: { errors } } = form
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''

  const name = watch('name')
  const patientId = watch('patientId')
  const isExisting = patientId !== ''

  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const suggestionsRef = useRef<HTMLDivElement>(null)

  const term = name.trim()
  const patientsQuery = useQuery({
    queryKey: queryKeys.patients(organizationId, { picker: true, search: term }),
    queryFn: ({ signal }) =>
      listPatients({ pageSize: 50, isActive: true, search: term }, signal),
    enabled:
      organizationId !== '' && !isExisting && term.length >= MIN_SEARCH_LENGTH,
  })

  // A listagem só devolve o CPF mascarado; o detalhe traz o número completo.
  const patientDetailQuery = useQuery({
    queryKey: queryKeys.patient(organizationId, patientId),
    queryFn: ({ signal }) => getPatient(patientId, signal),
    enabled: organizationId !== '' && isExisting,
  })
  const detailCpf = patientDetailQuery.data?.cpf

  useEffect(() => {
    if (detailCpf !== undefined) setValue('cpf', formatCPF(detailCpf ?? ''))
  }, [detailCpf, setValue])

  const detailGuardian = patientDetailQuery.data?.guardian
  useEffect(() => {
    if (!patientDetailQuery.data) return
    setValue('guardianName', detailGuardian?.fullName ?? '')
    setValue('guardianCpf', formatCPF(detailGuardian?.cpf ?? ''))
    setValue('guardianPhone', formatPhone(detailGuardian?.phoneNumber ?? ''))
  }, [patientDetailQuery.data, detailGuardian, setValue])

  // Cadastro antigo pode não ter CPF; nesse caso o campo fica editável para o
  // prescritor completar — o valor é gravado no cadastro ao salvar.
  const cpfLocked =
    isExisting && (patientDetailQuery.isPending || Boolean(detailCpf))

  const suggestions = isExisting ? [] : (patientsQuery.data?.items ?? []).slice(0, 8)
  const isOpen = showSuggestions && suggestions.length > 0

  const suggestionsKey = suggestions.map((patient) => patient.id).join(',')
  const [previousSuggestionsKey, setPreviousSuggestionsKey] = useState(suggestionsKey)
  if (previousSuggestionsKey !== suggestionsKey) {
    setPreviousSuggestionsKey(suggestionsKey)
    setHighlightedIndex(-1)
  }

  useEffect(() => {
    if (highlightedIndex >= 0 && suggestionsRef.current) {
      const items = suggestionsRef.current.querySelectorAll('[data-suggestion-item]')
      items[highlightedIndex]?.scrollIntoView({ block: 'nearest' })
    }
  }, [highlightedIndex])

  const birthDate = watch('birthDate')
  const age =
    birthDate && parseIsoDate(birthDate) && parseIsoDate(birthDate)! <= new Date()
      ? calculateAge(birthDate)
      : null
  const isMinor = isMinorBirthDate(birthDate)

  const selectPatient = (patient: PatientListItem) => {
    setValue('patientId', patient.id, { shouldValidate: true })
    setValue('name', patient.fullName, { shouldValidate: true })
    setValue('cpf', '')
    setValue('phone', formatPhone(patient.phoneNumber))
    setValue('birthDate', toDateInputValue(patient.birthDate))
    setValue('weight', formatWeight(String(patient.weightInKg)))
    setValue('guardianName', '')
    setValue('guardianCpf', '')
    setValue('guardianPhone', '')
    setShowSuggestions(false)
    setHighlightedIndex(-1)
  }

  const clearPatient = () => {
    setValue('patientId', '')
    setValue('name', '', { shouldValidate: true })
    setValue('cpf', '')
    setValue('phone', '')
    setValue('birthDate', '')
    setValue('weight', '')
    setValue('guardianName', '')
    setValue('guardianCpf', '')
    setValue('guardianPhone', '')
    setShowSuggestions(false)
    setHighlightedIndex(-1)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const index = highlightedIndex >= 0 ? highlightedIndex : 0
      if (suggestions[index]) selectPatient(suggestions[index])
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  const nameField = register('name', {
    onChange: () => {
      // Editar o nome desfaz o vínculo: volta a ser um cadastro novo.
      if (isExisting) {
        setValue('patientId', '')
        setValue('cpf', '')
        setValue('phone', '')
        setValue('birthDate', '')
        setValue('weight', '')
        setValue('guardianName', '')
        setValue('guardianCpf', '')
        setValue('guardianPhone', '')
      }
      setShowSuggestions(true)
    },
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
      <StepHeading description="Digite o nome do paciente: se ele já estiver cadastrado, selecione-o na lista para reaproveitar os dados pessoais. Caso contrário, preencha os campos para criar o cadastro. O tratamento é vinculado ao prescritor autenticado." />

      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Nome do Paciente" error={errors.name?.message}>
          <div className="relative">
            <TextInput
              placeholder="Nome completo"
              invalid={!!errors.name}
              autoComplete="off"
              role="combobox"
              aria-expanded={isOpen}
              aria-controls={LISTBOX_ID}
              aria-autocomplete="list"
              aria-activedescendant={
                highlightedIndex >= 0 ? `${LISTBOX_ID}-${highlightedIndex}` : undefined
              }
              className={cn(isExisting && 'pr-32')}
              {...nameField}
              onFocus={() => setShowSuggestions(true)}
              onBlur={(e) => {
                setTimeout(() => setShowSuggestions(false), 200)
                void nameField.onBlur(e)
              }}
              onKeyDown={handleKeyDown}
            />
            {isExisting && (
              <button
                type="button"
                onClick={clearPatient}
                aria-label="Limpar seleção e desvincular o paciente"
                className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-lg border border-red-300 bg-red-50 px-2.5 py-1 text-[0.65rem] font-semibold text-red-700 transition-colors hover:border-red-400 hover:bg-red-100 cursor-pointer"
              >
                <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
                Limpar seleção
              </button>
            )}
            {isOpen && (
              <div
                ref={suggestionsRef}
                id={LISTBOX_ID}
                role="listbox"
                className="absolute z-10 mt-1 max-h-48 w-full overflow-y-auto rounded-lg border border-(--border-custom) bg-white shadow-lg"
              >
                {suggestions.map((patient, index) => (
                  <button
                    key={patient.id}
                    id={`${LISTBOX_ID}-${index}`}
                    type="button"
                    role="option"
                    aria-selected={highlightedIndex === index}
                    data-suggestion-item
                    onClick={() => selectPatient(patient)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={cn(
                      'flex w-full items-center justify-between px-4 py-2.5 text-left transition-colors',
                      highlightedIndex === index ? 'bg-teal-50' : 'hover:bg-teal-50',
                    )}
                  >
                    <span className="text-xs font-medium text-(--text)">{patient.fullName}</span>
                    <span className="text-[0.65rem] text-(--text-muted)">
                      {patient.cpfMasked ?? '—'}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </FieldLabel>

        <FieldLabel label="CPF" error={errors.cpf?.message}>
          <Controller
            control={control}
            name="cpf"
            render={({ field }) => (
              <TextInput
                placeholder={
                  isExisting && patientDetailQuery.isPending ? 'Carregando…' : '000.000.000-00'
                }
                invalid={!!errors.cpf}
                value={field.value}
                readOnly={cpfLocked}
                tabIndex={cpfLocked ? -1 : undefined}
                className={cn(cpfLocked && 'bg-gray-100/60 text-(--text-muted)')}
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

        <div className="grid grid-cols-[1fr_5rem] gap-2">
          <FieldLabel label="Data de Nascimento" error={errors.birthDate?.message}>
            <TextInput
              type="date"
              invalid={!!errors.birthDate}
              {...register('birthDate')}
            />
          </FieldLabel>
          <FieldLabel label="Idade">
            <TextInput
              value={age === null ? '—' : `${age} ${age === 1 ? 'ano' : 'anos'}`}
              readOnly
              tabIndex={-1}
              aria-label="Idade calculada a partir da data de nascimento"
              className="text-center text-(--text-muted) bg-gray-100/60"
            />
          </FieldLabel>
        </div>

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

        {isMinor && (
          <div className="col-span-2 rounded-xl border border-(--border-custom) bg-gray-50/60 p-4">
            <div className="mb-1 text-xs font-bold text-(--text)">Responsável Legal</div>
            <p className="mb-3 text-[0.65rem] leading-relaxed text-(--text-muted)">
              Paciente menor de idade: informe nome, CPF e telefone de contato do
              responsável legal.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <FieldLabel label="Nome do Responsável" error={errors.guardianName?.message}>
                <TextInput
                  placeholder="Nome completo"
                  invalid={!!errors.guardianName}
                  {...register('guardianName')}
                />
              </FieldLabel>
              <FieldLabel label="CPF do Responsável" error={errors.guardianCpf?.message}>
                <Controller
                  control={control}
                  name="guardianCpf"
                  render={({ field }) => (
                    <TextInput
                      placeholder="000.000.000-00"
                      invalid={!!errors.guardianCpf}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(formatCPF(e.target.value))}
                    />
                  )}
                />
              </FieldLabel>
              <FieldLabel label="Telefone do Responsável" error={errors.guardianPhone?.message}>
                <Controller
                  control={control}
                  name="guardianPhone"
                  render={({ field }) => (
                    <TextInput
                      placeholder="(00) 00000-0000"
                      invalid={!!errors.guardianPhone}
                      value={field.value}
                      onBlur={field.onBlur}
                      onChange={(e) => field.onChange(formatPhone(e.target.value))}
                    />
                  )}
                />
              </FieldLabel>
            </div>
          </div>
        )}

        {isExisting && (
          <p className="col-span-2 text-[0.65rem] leading-relaxed text-(--text-muted)">
            Paciente já cadastrado: o tratamento não duplica o cadastro. Ajustes em
            CPF, telefone, nascimento e peso atualizam o cadastro do paciente ao
            salvar.
          </p>
        )}
      </div>
    </div>
  )
}
