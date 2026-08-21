import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { TextInput } from '@/shared/components'
import { PatientInitials } from '@/shared/components/glass-card'
import type { Immunotherapy } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import type { Application, Patient } from '@/features/patient/stores/usePatientStore'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'

interface NextDoseSummary {
  date: string
  conc: string
  vol: string
  dose: number
}

interface SelectPatientStepProps {
  selected: Immunotherapy | null
  patient: Patient | null
  applicationsForPatient: Application[]
  lastApplication: Application | null
  doseNumber: number
  nextDose: NextDoseSummary | null
  treatmentTime: string | null
  immunotherapies: Immunotherapy[]
  preselectedLocked: boolean
  onSelect: (item: Immunotherapy) => void
}

export function SelectPatientStep({
  selected,
  patient,
  lastApplication,
  doseNumber,
  nextDose,
  treatmentTime,
  immunotherapies,
  preselectedLocked,
  onSelect,
}: SelectPatientStepProps) {
  const [search, setSearch] = useState(selected?.name ?? '')
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(-1)
  const suggestionsRef = useRef<HTMLDivElement>(null)
  const inputId = 'evolution-patient-search'
  const listboxId = 'evolution-patient-suggestions'

  const filtered = useMemo(() => {
    if (!search) return immunotherapies.slice(0, 8)
    return immunotherapies.filter((i) => i.name.toLowerCase().includes(search.toLowerCase()))
  }, [search, immunotherapies])

  useEffect(() => {
    setHighlightedIndex(-1)
  }, [filtered.length, showSuggestions])

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
        setSearch(filtered[idx].name)
        setShowSuggestions(false)
      }
    } else if (e.key === 'Escape') {
      setShowSuggestions(false)
      setHighlightedIndex(-1)
    }
  }

  return (
    <div className="space-y-5">
      <h2 className="text-sm font-bold text-(--text)">Selecionar Paciente</h2>
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
                onClick={() => { onSelect(item); setSearch(item.name); setShowSuggestions(false) }}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={cn(
                  'w-full text-left px-4 py-2.5 transition-colors flex items-center justify-between',
                  highlightedIndex === idx ? 'bg-teal-50' : 'hover:bg-teal-50',
                )}
              >
                <span className="text-xs font-medium text-(--text)">{item.name}</span>
                <span className="text-[0.65rem] text-(--text-muted)">{item.type}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selected && patient && (
        <div className="border border-(--border-custom) rounded-xl mt-4 overflow-hidden">
          <div className="px-4 py-3.5 border-b border-(--border-custom) flex items-center gap-3 bg-gray-50/80">
            <PatientInitials name={patient.name} size={40} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-bold text-(--text)">{patient.name}</div>
              <div className="text-[0.7rem] text-(--text-muted)">
                {patient.age} anos · {patient.weight} · {patient.responsibleDoctor} · {selected.type}
                {treatmentTime && <> · {treatmentTime}</>}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-0">
            <div className="p-4 bg-stone-50 border-r border-(--border-custom)">
              <div className="text-[0.65rem] font-bold text-stone-500 uppercase tracking-wider mb-3">Última aplicação</div>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                <Cell label="Dose" value={`Dose ${doseNumber || '-'}`} />
                <Cell label="Volume" value={lastApplication?.appliedVolume || lastApplication?.dose.split(' - ')[1] || '-'} />
                <Cell label="Concentração" value={lastApplication?.extractConcentration || lastApplication?.dose.split(' - ')[0] || '-'} />
                <Cell label="Data" value={lastApplication?.date || '-'} />
              </div>
            </div>

            <div className="p-4 bg-teal-50/50">
              <div className="text-[0.65rem] font-bold text-teal-600 uppercase tracking-wider mb-3">Dose prevista</div>
              <div className="grid grid-cols-2 gap-y-2.5 gap-x-4">
                <Cell label="Dose" value={`Dose ${nextDose?.dose || '-'}`} />
                <Cell label="Volume" value={nextDose?.vol || '-'} />
                <Cell label="Concentração" value={nextDose?.conc || '-'} />
                <Cell label="Data" value={nextDose?.date || '-'} />
              </div>
            </div>
          </div>
        </div>
      )}

      {selected && selected.status === 'inactive' && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3.5 py-3 mt-3">
          <FontAwesomeIcon icon={faCircleInfo} className="text-red-500 shrink-0" style={{ fontSize: 14 }} />
          <p className="text-xs text-red-700">
            Este paciente está <span className="font-semibold">inativo</span>. Não é possível registrar uma evolução para pacientes inativos.
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
