import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react'
import { IconButton, Select } from '@/shared/components'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  itemsPerPage: number
  onPageChange: (page: number) => void
  onItemsPerPageChange: (n: number) => void
}

export function TablePagination({ currentPage, totalPages, totalItems, itemsPerPage, onPageChange, onItemsPerPageChange }: TablePaginationProps) {
  const controls = [
    { icon: ChevronsLeft, label: 'Primeira página', action: () => onPageChange(1), disabled: currentPage === 1 },
    { icon: ChevronLeft, label: 'Página anterior', action: () => onPageChange(currentPage - 1), disabled: currentPage === 1 },
    { icon: ChevronRight, label: 'Próxima página', action: () => onPageChange(currentPage + 1), disabled: currentPage === totalPages },
    { icon: ChevronsRight, label: 'Última página', action: () => onPageChange(totalPages), disabled: currentPage === totalPages },
  ]

  return (
    <div className="border-t border-(--border-custom) px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-(--text-muted)">Registros por página</span>
          <div className="w-16">
            <Select
              aria-label="Registros por página"
              value={itemsPerPage}
              onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
              className="h-7 text-xs"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
            </Select>
          </div>
          {totalItems !== undefined && (
            <span className="ml-3 text-xs text-(--text-muted)">
              {totalItems} {totalItems === 1 ? 'registro' : 'registros'} no total
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-(--text-muted) mr-1.5">Página {currentPage} de {totalPages}</span>
          {controls.map(({ icon: Icon, label, action, disabled }) => (
            <IconButton
              key={label}
              aria-label={label}
              size="sm"
              onClick={action}
              disabled={disabled}
              className="border border-(--border-custom)"
            >
              <Icon size={12} />
            </IconButton>
          ))}
        </div>
      </div>
    </div>
  )
}
