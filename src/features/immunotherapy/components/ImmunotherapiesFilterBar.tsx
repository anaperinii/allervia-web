import { Search } from 'lucide-react'
import { Button, Select, TextInput } from '@/shared/components'

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
  canAddImmunotherapy: boolean
  canEvolve: boolean
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
  canAddImmunotherapy,
  canEvolve,
}: ImmunotherapiesFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="relative flex-1 min-w-45">
        <label htmlFor="immunotherapy-search" className="sr-only">Pesquisar paciente</label>
        <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) z-10" />
        <TextInput
          id="immunotherapy-search"
          placeholder="Pesquisar paciente"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-8 pl-8 bg-[#F3F5F6]! border-[#CBD6D6]!"
        />
      </div>

      <Select
        aria-label="Filtrar por tipo"
        value={typeFilter}
        onChange={(e) => setTypeFilter(e.target.value)}
        className="h-8 bg-[#F3F5F6]! w-auto border-[#CBD6D6]!"
      >
        <option value="Todos os tipos">Todos os tipos</option>
        {types.map((t) => <option key={t} value={t}>{t}</option>)}
      </Select>

      <Select
        aria-label="Filtrar por intervalo"
        value={intervalFilter}
        onChange={(e) => setIntervalFilter(e.target.value)}
        className="h-8 bg-[#F3F5F6]! w-auto border-[#CBD6D6]!"
      >
        <option value="Todos os intervalos">Todos os intervalos</option>
        {intervals.map((c) => <option key={c} value={c}>{c} dias</option>)}
      </Select>

      <Select
        aria-label="Filtrar por status"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="h-8 bg-[#F3F5F6]! w-auto border-[#CBD6D6]!"
      >
        <option value="active">Ativas</option>
        <option value="inactive">Inativas</option>
        <option value="completed">Concluídas</option>
        <option value="all">Todas</option>
      </Select>

      {canAddImmunotherapy && (
        <Button tone="brand" variant="solid" prominent to="/add-immunotherapy" className="px-3">
          Adicionar Imunoterapia
        </Button>
      )}

      {canEvolve && (
        <Button tone="brand" variant="solid" prominent to="/patient-evolution" className="px-3">
          Evoluir Paciente
        </Button>
      )}
    </div>
  )
}
