import { Select, TextInput } from '@/shared/components'
import { SHOWCASE } from '@/shared/components/showcase'
import type { TherapyStatus } from '@/shared/api/contracts/clinical'
import { faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

export type ModalityTab = 'all' | 'subcutaneous' | 'sublingual'
export type StatusFilter = TherapyStatus | 'all'

interface ImmunotherapiesFilterBarProps {
  searchTerm: string
  setSearchTerm: (v: string) => void
  statusFilter: StatusFilter
  setStatusFilter: (v: StatusFilter) => void
}

/**
 * Filtros resolvidos no servidor: busca por paciente/extrato/tipo e situação
 * do tratamento. Filtros locais sobre a página atual foram removidos porque
 * tornariam o total incoerente com o que a tabela mostra.
 */
export function ImmunotherapiesFilterBar({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
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
          placeholder="Pesquisar paciente, tipo ou extrato"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="h-9 pl-9 pr-4 text-[0.78rem]"
        />
      </div>

      <Select
        aria-label="Filtrar por situação"
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        className="h-9 w-auto"
      >
        <option value="IN_PROGRESS">Em andamento</option>
        <option value="SUSPENDED">Suspensas</option>
        <option value="COMPLETED">Concluídas</option>
        <option value="all">Todas</option>
      </Select>
    </div>
  )
}
