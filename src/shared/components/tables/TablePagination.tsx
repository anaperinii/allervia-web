import { IconButton } from '@/shared/components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faAnglesLeft, faAnglesRight, faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons'

interface TablePaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  onPageChange: (page: number) => void
}

export function TablePagination({ currentPage, totalPages, totalItems, onPageChange }: TablePaginationProps) {
  const controls = [
    { icon: faAnglesLeft, label: 'Primeira página', action: () => onPageChange(1), disabled: currentPage === 1 },
    { icon: faChevronLeft, label: 'Página anterior', action: () => onPageChange(currentPage - 1), disabled: currentPage === 1 },
    { icon: faChevronRight, label: 'Próxima página', action: () => onPageChange(currentPage + 1), disabled: currentPage === totalPages },
    { icon: faAnglesRight, label: 'Última página', action: () => onPageChange(totalPages), disabled: currentPage === totalPages },
  ]

  return (
    <div className="border-t border-(--border-custom) px-4 py-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {totalItems !== undefined && (
            <span className="text-xs text-(--text-muted)">
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
              <FontAwesomeIcon icon={Icon} style={{ fontSize: 12 }} />
            </IconButton>
          ))}
        </div>
      </div>
    </div>
  )
}
