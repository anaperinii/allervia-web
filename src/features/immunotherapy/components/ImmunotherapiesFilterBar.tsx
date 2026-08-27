import { Select, TextInput } from '@/shared/components'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { SHOWCASE } from '@/shared/components/showcase'

export type ModalityTab = 'all' | 'subcutaneous' | 'sublingual'

export const MODALITY_OPTIONS: { value: ModalityTab; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'subcutaneous', label: 'Subcutânea' },
  { value: 'sublingual', label: 'Sublingual' },
]

interface ImmunotherapiesFilterBarProps {
  searchTerm: string
  setSearchTerm: (v: string) => void
  typeFilter: string
  setTypeFilter: (v: string) => void
  intervalFilter: string
  setIntervalFilter: (v: string) => void
  statusFilter: string
  setStatusFilter: (v: string) => void
  types: string[]
  intervals: string[]
}

export function ImmunotherapiesFilterBar({
  searchTerm,
  setSearchTerm,
  typeFilter,
  setTypeFilter,
  intervalFilter,
  setIntervalFilter,
  statusFilter,
  setStatusFilter,
  types,
  intervals,
}: ImmunotherapiesFilterBarProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="relative w-80">
        <label htmlFor="immunotherapy-search" className="sr-only">
          Pesquisar paciente
        </label>
        <FontAwesomeIcon
          icon={faMagnifyingGlass}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10"
          style={{ fontSize: 12, color: SHOWCASE.inkSoft }}
        />
        <TextInput
          id="immunotherapy-search"
          placeholder="Pesquisar paciente"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 pl-9 pr-4 text-[0.78rem]"
        />
      </div>

      <Select
        aria-label="Filtrar por tipo"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className="h-9 w-auto"
      >
        <option value="Todos os tipos">Todos os tipos</option>
        {types.map((t) => <option key={t} value={t}>{t}</option>)}
      </Select>

      <Select
        aria-label="Filtrar por intervalo"
        value={intervalFilter}
        onChange={(e) => setIntervalFilter(e.target.value)}
        className="h-9 w-auto"
      >
        <option value="Todos os intervalos">Todos os intervalos</option>
        {intervals.map((c) => <option key={c} value={c}>{c} dias</option>)}
      </Select>

      <Select
        aria-label="Filtrar por status"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="h-9 w-auto"
      >
        <option value="active">Ativas</option>
        <option value="inactive">Inativas</option>
        <option value="completed">Concluídas</option>
        <option value="all">Todas</option>
      </Select>
    </div>
  )
}
