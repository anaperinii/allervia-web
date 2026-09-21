import { useEffect, useMemo, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { StepHeading, TextInput } from '@/shared/components'
import { PatientInitials } from '@/shared/components/glass-card'
import { cn } from '@/shared/lib/cn'
import { listImmunotherapies } from '@/shared/api/clinical.api'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
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

/**
 * Seleção do tratamento a evoluir. A "dose prevista" é a previsão persistida no
 * servidor, não um cálculo local; sem previsão pendente não há o que administrar.
 */
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
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputId = 'evolution-patient-search'
  const listboxId = 'evolution-patient-suggestions'

  const therapiesQuery = useQuery({
    queryKey: queryKeys.immunotherapies(organizationId, {
      picker: 'evolution',
      search: search.trim() || undefined,
    }),
    queryFn: ({ signal }) =>
      listImmunotherapies(
        {
          pageSize: 50,
          status: 'IN_PROGRESS',
          search: search.trim() || undefined,
        },
        signal,
      ),
    enabled: organizationId !== '' && !preselectedLocked,
  })

  const filtered = useMemo(
    () => (therapiesQuery.data?.items ?? []).slice(0, 8),
    [therapiesQuery.data],
  )

  const suggestionsKey = JSON.stringify([search, showSuggestions, filtered.map((item) => item.id)])
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || filtered.length === 0) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const idx = highlightedIndex >= 0 ? highlightedIndex : 0
      if (filtered[idx]) {
        onSelect(filtered[idx])
        setSearch(filtered[idx].patient.fullName)
        setShowSuggestions(false)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  const planned = pendingDose?.plannedValues ?? null
  const administered = lastAdministered?.administeredValues ?? null

  return (
    <div className="space-y-5">
      <StepHeading description="Escolha a imunoterapia a evoluir e confira a última aplicação realizada e a previsão pendente gravada no servidor." />
      <div className="relative">
        <label htmlFor={inputId} className="sr-only">Buscar paciente</label>
        <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-3 top-1/2 -translate-y-1/2 text-(--text-muted)" style={{ fontSize: 14 }} />
        <TextInput
          id={inputId}
          placeholder="Buscar paciente por nome"
          value={search}
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
