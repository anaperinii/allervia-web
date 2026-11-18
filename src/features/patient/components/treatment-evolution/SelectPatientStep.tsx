import { collectAccentTolerantPages } from '@/shared/api/search'
import { searchVariants } from '@/shared/lib/search-terms'
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StepHeading, TextInput } from '@/shared/components'
import { PatientInitials } from '@/shared/components/glass-card'
import { cn } from '@/shared/lib/cn'
import { listImmunotherapies } from '@/shared/api/clinical.api'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { useKeyboardAutocomplete } from '@/shared/hooks/useKeyboardAutocomplete'
import {
  formatInstantDate,
  formatStepPresentation,
} from '@/features/patient/adapters/clinical-presentation'
import type {
  DoseDetail,
  DoseRecord,
  ImmunotherapyListItem,
} from '@/shared/api/contracts/clinical'

import { faCircleInfo, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

interface SelectPatientStepProps {
  selected: ImmunotherapyListItem | null
  pendingDose: DoseDetail | null
  lastAdministered: DoseRecord | null
  administeredCount: number
  isLoadingDose: boolean
  preselectedLocked: boolean
  onSelect: (item: ImmunotherapyListItem) => void
}

export function SelectPatientStep({
  selected,
  pendingDose,
  lastAdministered,
  administeredCount,
  isLoadingDose,
  preselectedLocked,
  onSelect,
}: SelectPatientStepProps) {
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const [search, setSearch] = useState(selected?.patient.fullName ?? '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const inputId = 'evolution-patient-search'
  const listboxId = 'evolution-patient-suggestions'

  const searchTerms = searchVariants(search)
  const therapiesQuery = useQuery({
    queryKey: queryKeys.immunotherapies(organizationId, {
      picker: 'evolution',
      search: searchTerms.join('|') || undefined,
    }),
    queryFn: ({ signal }) =>
      collectAccentTolerantPages({
        term: search,
        signal,
        load: (page, term) =>
          listImmunotherapies({ page, pageSize: 100, status: 'IN_PROGRESS', search: term }, signal),
        getId: (item) => item.id,
        getSearchableText: (item) => `${item.patient.fullName} ${item.immunoType}`,
      }),
    enabled: organizationId !== '' && !preselectedLocked,
  })

  const filtered = useMemo(
    () => (therapiesQuery.data?.items ?? []),
    [therapiesQuery.data],
  )

  const suggestionsKey = JSON.stringify([search, filtered.map((item) => item.id)])
  const { highlightedIndex, setHighlightedIndex, suggestionsRef, handleKeyDown } = useKeyboardAutocomplete({
    isOpen: showSuggestions,
    itemCount: filtered.length,
    resetKey: suggestionsKey,
    onClose: () => setShowSuggestions(false),
    onSelect: (idx) => {
      if (filtered[idx]) {
        onSelect(filtered[idx])
        setSearch(filtered[idx].patient.fullName)
        setShowSuggestions(false)
      }
    },
  })

  const planned = pendingDose?.plannedValues ?? null
  const administered = lastAdministered?.administeredValues ?? null

  return (
    <div className="space-y-5">
      {therapiesQuery.data?.truncated && <p role="status">Lista limitada: {therapiesQuery.data.items.length}/{therapiesQuery.data.total}. Refine a busca.</p>}
      <StepHeading description="Escolha a imunoterapia a evoluir e confira a última aplicação realizada e a previsão pendente gravada no servidor." />
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">Buscar paciente</label>
        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" style={{ fontSize: 14 }} />
        <TextInput
          id={inputId}
          placeholder="Buscar paciente por nome"
          value={search}
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          name="evolution-patient-search"
          disabled={preselectedLocked}
          onChange={(e) => { setSearch(e.target.value); setShowSuggestions(true) }}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-expanded={showSuggestions && filtered.length > 0}
          aria-controls={listboxId}
          aria-autocomplete="list"
          aria-activedescendant={highlightedIndex >= 0 ? `${listboxId}-${highlightedIndex}` : undefined}
          className={cn('pl-8', preselectedLocked && 'opacity-60 cursor-not-allowed')}
        />
        {showSuggestions && filtered.length > 0 && (
          <div
            ref={suggestionsRef}
            id={listboxId}
            role="listbox"
            className="absolute z-10 w-full mt-1 bg-white border border-(--border-custom) rounded-lg shadow-lg max-h-48 overflow-y-auto"
          >
            {filtered.map((item, idx) => (
              <button
                key={item.id}
                id={`${listboxId}-${idx}`}
                type="button"
                role="option"
                aria-selected={highlightedIndex === idx}
                data-suggestion-item
                onClick={() => { onSelect(item); setSearch(item.patient.fullName); setShowSuggestions(false) }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={cn(
                  'w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between',
                  highlightedIndex === idx ? 'bg-teal-50' : 'hover:bg-teal-50',
                )}
              >
                <span className="text-xs font-medium text-(--text)">{item.patient.fullName}</span>
                <span className="text-[0.65rem] text-(--text-muted)">{item.immunoType}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <div className="border border-(--border-custom) rounded-xl mt-4 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-(--border-custom) flex items-center gap-3 bg-gray-50/80">
            <PatientInitials name={selected.patient.fullName} size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-(--text)">{selected.patient.fullName}</div>
              <div className="text-[0.7rem] text-(--text-muted)">
                {selected.immunoType} · {selected.extract} · {selected.responsiblePhysician.fullName}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0">
            <div className="p-4 bg-stone-50 border-r border-(--border-custom)">
              <div className="text-[0.65rem] font-bold text-stone-500 uppercase tracking-wider mb-3">Última aplicação</div>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                <Cell label="Aplicações" value={administeredCount ? String(administeredCount) : '-'} />
                <Cell
                  label="Valores"
                  value={administered ? formatStepPresentation(administered) : '-'}
                />
                <Cell
                  label="Data"
                  value={lastAdministered?.administeredAt ? formatInstantDate(lastAdministered.administeredAt) : '-'}
                />
                <Cell label="Intervalo" value={administered ? `${administered.intervalDays} dias` : '-'} />
              </div>
            </div>

            <div className="p-4 bg-teal-50/50">
              <div className="text-[0.65rem] font-bold text-teal-600 uppercase tracking-wider mb-3">Previsão pendente</div>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                <Cell
                  label="Valores"
                  value={
                    isLoadingDose
                      ? '…'
                      : planned
                        ? formatStepPresentation(planned)
                        : '-'
                  }
                />
                <Cell
                  label="Data prevista"
                  value={pendingDose ? formatInstantDate(pendingDose.scheduledAt) : '-'}
                />
                <Cell label="Intervalo" value={planned ? `${planned.intervalDays} dias` : '-'} />
                <Cell label="Fase" value={planned ? (planned.phase === 'MAINTENANCE' ? 'Manutenção' : 'Indução') : '-'} />
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && !isLoadingDose && !pendingDose && (
        <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-3 mt-3">
          <FontAwesomeIcon icon={faCircleInfo} className="text-amber-600 shrink-0" style={{ fontSize: 14 }} />
          <p className="text-xs text-amber-800">
            Este tratamento não tem <span className="font-semibold">previsão pendente</span> para administrar.
          </p>
        </div>
      )}

      {pendingDose?.migrationRequired && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3.5 py-3 mt-3">
          <FontAwesomeIcon icon={faCircleInfo} className="text-red-500 shrink-0" style={{ fontSize: 14 }} />
          <p className="text-xs text-red-700">
            Tratamento legado sem prescrição vinculada: a migração assistida precisa acontecer antes de novos comandos clínicos.
          </p>
        </div>
      )}
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[0.6rem] text-(--text-muted) font-medium">{label}</div>
      <div className="text-xs font-bold text-(--text)">{value}</div>
    </div>
  )
}
