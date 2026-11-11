import proArt from '@/assets/pro-art.jpg'
import { collectAccentTolerantPages } from '@/shared/api/search'
import { searchVariants } from '@/shared/lib/search-terms'
import { Link } from '@tanstack/react-router'
import { useEffect, useRef, useState } from 'react'
import { Controller, type UseFormReturn } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { FieldLabel, StepHeading, TextInput } from '@/shared/components'
import { EditPatientModal } from '@/features/patient/components/chart/EditPatientModal'
import type { Patient } from '@/features/patient/stores/usePatientStore'
import { cn } from '@/shared/lib/cn'
import { formatCPF, formatPhone, formatWeight } from '@/shared/lib/formatters'
import { calculateAge, parseIsoDate, toDateInputValue } from '@/shared/lib/dates'
import {
  getPatient,
  listDosesForTherapy,
  listPatients,
  listTherapiesForPatient,
  updatePatient,
} from '@/shared/api/clinical.api'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import type { PatientListItem, TherapySummary } from '@/shared/api/contracts/clinical'
import { PHASE_VIEW } from '@/features/protocols/lab/phase-view'
import {
  formatInstantDate,
  formatStepPresentation,
  THERAPY_STATUS_LABELS,
} from '@/features/patient/adapters/clinical-presentation'
import {
  isMinorBirthDate,
  type AddImmunotherapyForm,
} from '@/features/immunotherapy/schemas/add-immunotherapy'

import { faArrowUpRightFromSquare, faChevronDown, faChevronUp, faPen, faXmark } from '@fortawesome/free-solid-svg-icons'
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
  const terms = searchVariants(term)
  const patientsQuery = useQuery({
    queryKey: queryKeys.patients(organizationId, { picker: true, search: terms.join('|') }),
    queryFn: ({ signal }) =>
      collectAccentTolerantPages({
        term,
        signal,
        load: (page, search) => listPatients({ page, pageSize: 100, isActive: true, search }, signal),
        getId: (patient) => patient.id,
        getSearchableText: (patient) => patient.fullName,
      }),
    enabled:
      organizationId !== '' && !isExisting && term.length >= MIN_SEARCH_LENGTH,
  })


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

  const detail = patientDetailQuery.data
  useEffect(() => {
    if (!detail) return
    setValue('name', detail.fullName)
    setValue('phone', formatPhone(detail.phoneNumber))
    setValue('weight', formatWeight(String(detail.weightInKg)))
    setValue('birthDate', toDateInputValue(detail.birthDate))
  }, [detail, setValue])

  const therapiesQuery = useQuery({
    queryKey: [...queryKeys.patient(organizationId, patientId), 'therapies'],
    queryFn: ({ signal }) => listTherapiesForPatient(patientId, signal),
    enabled: organizationId !== '' && isExisting,
  })

  const queryClient = useQueryClient()
  const [showEditPatientModal, setShowEditPatientModal] = useState(false)
  const patientDetail = patientDetailQuery.data
  const patientForModal: Patient | null = patientDetail
    ? {
        id: patientDetail.id,
        name: patientDetail.fullName,
        birthDate: patientDetail.birthDate,
        age: calculateAge(patientDetail.birthDate),
        phone: formatPhone(patientDetail.phoneNumber),
        weight: formatWeight(String(patientDetail.weightInKg)),
        cpf: patientDetail.cpf ?? '',
        guardian: patientDetail.guardian
          ? {
              name: patientDetail.guardian.fullName,
              cpf: patientDetail.guardian.cpf ?? '',
              phone: patientDetail.guardian.phoneNumber,
            }
          : null,
        responsibleDoctor: patientDetail.responsiblePhysician.fullName,
        responsibleDoctorId: patientDetail.responsiblePhysician.id,
        status: patientDetail.isActive ? 'active' : 'inactive',
        immunotherapyType: '',
        administrationRoute: '',
        extract: '',
        targetConcentrationVolume: '',
        targetReached: false,
        currentInterval: 0,
        nextApplicationDate: '',
        currentDoseConcentration: '',
      }
    : null

  const savePatientMutation = useMutation({
    mutationFn: (patch: {
      name: string
      phone: string
      weight: string
      responsibleDoctor: string
      guardianName?: string
      guardianCpf?: string
      guardianPhone?: string
    }) =>
      updatePatient(patientId, {
        fullName: patch.name,
        phoneNumber: patch.phone.replace(/\D/g, ''),
        weightInKg: Number(patch.weight.replace(',', '.').replace(/[^0-9.]/g, '')),
        ...(patch.responsibleDoctor && patch.responsibleDoctor !== patientDetail?.responsiblePhysician.id
          ? { responsiblePhysicianId: patch.responsibleDoctor }
          : {}),
        ...(patch.guardianName
          ? {
              guardian: {
                fullName: patch.guardianName.trim(),
                cpf: patch.guardianCpf,
                phoneNumber: (patch.guardianPhone ?? '').replace(/\D/g, ''),
              },
            }
          : {}),
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.patient(organizationId, patientId) })
      setShowEditPatientModal(false)
    },
  })
  const openTherapies = (therapiesQuery.data ?? []).filter(
    (therapy) => therapy.status === 'IN_PROGRESS' || therapy.status === 'SUSPENDED',
  )
  const hasSuspended = openTherapies.some((therapy) => therapy.status === 'SUSPENDED')
  const [showOpenTherapies, setShowOpenTherapies] = useState(true)

  const cpfLocked = isExisting

  const suggestions = isExisting ? [] : (patientsQuery.data?.items ?? [])
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
    <>
    <div className="space-y-5">
      {patientsQuery.data?.truncated && <p role="status">Lista limitada: {patientsQuery.data.items.length}/{patientsQuery.data.total}. Refine a busca.</p>}
      <StepHeading description="Digite o nome do paciente: se ele já estiver cadastrado, selecione-o na lista para reaproveitar os dados pessoais. Caso contrário, preencha os campos para criar o cadastro. O tratamento é vinculado ao prescritor autenticado." />

      {isExisting && patientDetailQuery.isError && <p role="alert">
        Não foi possível carregar o cadastro. <button type="button" onClick={() => void patientDetailQuery.refetch()}>Tentar novamente</button>
      </p>}

      {isExisting && openTherapies.length > 0 && (
        <div
          className="relative overflow-hidden rounded-xl border border-gray-400/30"
          style={{ animation: 'fade-in-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both' }}
        >
          <img
            src={proArt}
            alt=""
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 h-full w-full scale-110 object-cover blur-2xl"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{ background: 'rgba(255,255,255,0.8)' }}
          />

          <div className="relative z-10 flex items-center gap-2 px-4 py-2.5">
            <span
              aria-hidden="true"
              className="absolute left-0 h-5 w-[3px] rounded-r-full"
              style={{ background: '#257E8C' }}
            />
            <span className="text-[0.78rem] font-semibold text-(--text)">
              {openTherapies.length === 1
                ? `1 imunoterapia vinculada para ${name}`
                : `${openTherapies.length} imunoterapias vinculadas para ${name}`}
            </span>
            <span className="truncate text-[0.78rem] text-(--text-muted)">
              · cada uma segue protocolo e agenda próprios; prescrever outra não
              interrompe as atuais
            </span>
            <button
              type="button"
              onClick={() => setShowOpenTherapies((open) => !open)}
              aria-expanded={showOpenTherapies}
              className="ml-auto flex shrink-0 items-center gap-1.5 text-[0.75rem] font-semibold text-(--text-muted) transition-colors hover:text-(--text) cursor-pointer"
            >
              {showOpenTherapies ? 'Minimizar' : 'Mostrar'}
              <FontAwesomeIcon
                icon={showOpenTherapies ? faChevronUp : faChevronDown}
                style={{ fontSize: 9 }}
              />
            </button>
          </div>

          <div
            className={cn(
              'relative z-10 grid transition-all duration-300 ease-out',
              showOpenTherapies ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
            )}
          >
            <ul className="overflow-hidden border-t border-(--border-custom)">
              {openTherapies.map((therapy) => (
                <OpenTherapyRow
                  key={therapy.id}
                  therapy={therapy}
                  patientId={patientId}
                  organizationId={organizationId}
                />
              ))}
            </ul>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        <FieldLabel label="Nome do Paciente" error={errors.name?.message}>
          <div className="relative">
            <TextInput
              readOnly={isExisting}
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
              className={cn(isExisting && 'pr-56 bg-gray-100/60 text-(--text-muted)')}
              {...nameField}
              onFocus={() => setShowSuggestions(true)}
              onBlur={(e) => {
                setTimeout(() => setShowSuggestions(false), 200)
                void nameField.onBlur(e)
              }}
              onKeyDown={handleKeyDown}
            />
            {isExisting && (
              <div className="absolute right-2 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
                <button
                  type="button"
                  onClick={clearPatient}
                  aria-label="Limpar seleção e desvincular o paciente"
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.65rem] font-semibold text-gray-800 transition-colors hover:bg-[#cbd0d3] cursor-pointer"
                  style={{ background: '#D1D5D8' }}
                >
                  <FontAwesomeIcon icon={faXmark} style={{ fontSize: 10 }} />
                  Limpar seleção
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditPatientModal(true)}
                  disabled={!patientForModal}
                  aria-label="Editar dados do avaliado no prontuário"
                  className="flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[0.65rem] font-semibold text-white transition-colors hover:bg-[#0c2429] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ background: '#12333a' }}
                >
                  <FontAwesomeIcon icon={faPen} style={{ fontSize: 10 }} />
                  Editar dados pessoais
                </button>
              </div>
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
                readOnly={isExisting}
                placeholder="(00) 00000-0000"
                invalid={!!errors.phone}
                value={field.value}
                className={cn(isExisting && 'bg-gray-100/60 text-(--text-muted)')}
                onBlur={field.onBlur}
                onChange={(e) => field.onChange(formatPhone(e.target.value))}
              />
            )}
          />
        </FieldLabel>

        <div className="grid grid-cols-[1fr_5rem] gap-2">
          <FieldLabel label="Data de Nascimento" error={errors.birthDate?.message}>
            <TextInput
              readOnly={isExisting}
              type="date"
              invalid={!!errors.birthDate}
              className={cn(isExisting && 'bg-gray-100/60 text-(--text-muted)')}
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
                  readOnly={isExisting}
                  placeholder="Ex: 70.5"
                  invalid={!!errors.weight}
                  className={cn('pr-10', isExisting && 'bg-gray-100/60 text-(--text-muted)')}
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
          <div className="col-span-2 grid grid-cols-3 gap-4">
            <FieldLabel label="Nome do Responsável" error={errors.guardianName?.message}>
              <TextInput
                readOnly={isExisting}
                placeholder="Nome completo"
                invalid={!!errors.guardianName}
                className={cn(isExisting && 'bg-gray-100/60 text-(--text-muted)')}
                {...register('guardianName')}
              />
            </FieldLabel>
            <FieldLabel label="CPF do Responsável" error={errors.guardianCpf?.message}>
              <Controller
                control={control}
                name="guardianCpf"
                render={({ field }) => (
                  <TextInput
                    readOnly={isExisting}
                    placeholder="000.000.000-00"
                    invalid={!!errors.guardianCpf}
                    value={field.value}
                    className={cn(isExisting && 'bg-gray-100/60 text-(--text-muted)')}
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
                    readOnly={isExisting}
                    placeholder="(00) 00000-0000"
                    invalid={!!errors.guardianPhone}
                    value={field.value}
                    className={cn(isExisting && 'bg-gray-100/60 text-(--text-muted)')}
                    onBlur={field.onBlur}
                    onChange={(e) => field.onChange(formatPhone(e.target.value))}
                  />
                )}
              />
            </FieldLabel>
          </div>
        )}

      </div>

      {isExisting && therapiesQuery.isError && (
        <p role="status" className="text-[0.65rem] leading-relaxed text-amber-700">
          Não foi possível verificar as imunoterapias já cadastradas deste paciente.{' '}
          <button type="button" onClick={() => void therapiesQuery.refetch()}>
            Tentar novamente
          </button>
        </p>
      )}
    </div>

    {patientForModal && (
      <EditPatientModal
        open={showEditPatientModal}
        patient={patientForModal}
        onClose={() => setShowEditPatientModal(false)}
        onSave={(patch) => savePatientMutation.mutate(patch)}
      />
    )}
    </>
  )
}

interface OpenTherapyRowProps {
  therapy: TherapySummary
  patientId: string
  organizationId: string
}

function OpenTherapyRow({ therapy, patientId, organizationId }: OpenTherapyRowProps) {
  const dosesQuery = useQuery({
    queryKey: queryKeys.doses(organizationId, therapy.id),
    queryFn: ({ signal }) => listDosesForTherapy(therapy.id, signal),
    enabled: organizationId !== '',
  })

  const lastAdministered = (dosesQuery.data ?? [])
    .filter(
      (dose) => dose.administeredAt !== null && dose.status !== 'ENTERED_IN_ERROR',
    )
    .sort((a, b) => (b.administeredAt ?? '').localeCompare(a.administeredAt ?? ''))[0]

  const administeredValues =
    lastAdministered?.administeredValues ?? lastAdministered?.plannedValues ?? null
  const phase =
    administeredValues?.phase ??
    (therapy.maintenanceStartDate ? 'MAINTENANCE' : 'BUILD_UP')

  const details = [
    therapy.extract,
    `Início ${formatInstantDate(therapy.inductionStartDate)}`,
    ...(administeredValues
      ? [
          `Última dose ${formatStepPresentation(administeredValues)}`,
          PHASE_VIEW[phase].label,
        ]
      : dosesQuery.isPending
        ? ['Carregando doses…']
        : ['Sem dose aplicada']),
  ]

  return (
    <li className="flex items-center gap-3 border-b border-(--border-custom) px-4 py-2.5 last:border-b-0">
      <div className="inline-flex items-center gap-1.5 truncate">
        <span className="text-[0.76rem] font-medium text-(--text-muted)">{therapy.immunoType}</span>
        <span className="text-[0.72rem] text-(--text-muted)">({details.join(' · ')})</span>
        <Link
          to="/patient/$patientId"
          params={{ patientId }}
          search={{ therapy: therapy.id }}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 border-b border-transparent pb-px text-brand hover:border-current"
        >
          <span className="text-[0.72rem] font-medium">· Acessar prontuário</span>
          <FontAwesomeIcon icon={faArrowUpRightFromSquare} style={{ fontSize: 10 }} className="shrink-0" />
        </Link>
      </div>
      <span
        className={cn(
          'ml-auto inline-flex shrink-0 items-center rounded-md px-2 py-0.5 text-[0.65rem] font-semibold text-white',
          therapy.status === 'SUSPENDED' ? 'bg-amber-500' : 'bg-emerald-500',
        )}
      >
        {THERAPY_STATUS_LABELS[therapy.status]}
      </span>
    </li>
  )
}
