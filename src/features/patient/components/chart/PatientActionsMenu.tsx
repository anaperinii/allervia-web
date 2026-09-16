import { useEffect, useRef, useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { IconButton } from '@/shared/components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsisVertical } from '@fortawesome/free-solid-svg-icons'

interface PatientActionsMenuProps {
  canInactivate: boolean
  canLgpdPortability: boolean
  canComplete: boolean
  completeDisabled: boolean
  patientStatus: 'active' | 'inactive'
  onInactivate: () => void
  onPortability: () => void
  onComplete: () => void
}

export function PatientActionsMenu({
  canInactivate,
  canLgpdPortability,
  canComplete,
  completeDisabled,
  patientStatus,
  onInactivate,
  onPortability,
  onComplete,
}: PatientActionsMenuProps) {
  const [open, setOpen] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) setOpen(false)
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open])

  const isInactivateDisabled = patientStatus === 'inactive'
  const isCompleteDisabled = patientStatus === 'inactive' || completeDisabled

  const handle = (action: () => void) => () => {
    setOpen(false)
    action()
  }

  return (
    <div ref={wrapperRef} className="relative inline-block">
      <IconButton
        aria-label="Mais ações do paciente"
        aria-expanded={open}
        variant="default"
        onClick={() => setOpen((o) => !o)}
        className="border border-(--border-custom)"
      >
        <FontAwesomeIcon icon={faEllipsisVertical} style={{ fontSize: 14 }} />
      </IconButton>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-56 bg-white border border-(--border-custom) rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-1 duration-150 divide-y divide-(--border-custom)"
        >
          {canComplete && (
            <MenuItem
              label="Concluir tratamento"
              hint="Meta clínica atingida"
              onClick={handle(onComplete)}
              disabled={isCompleteDisabled}
            />
          )}
          {canInactivate && (
            <MenuItem
              label="Inativar imunoterapia"
              hint="Pausa as aplicações"
              onClick={handle(onInactivate)}
              disabled={isInactivateDisabled}
            />
          )}
          {canLgpdPortability && (
            <MenuItem
              label="Portabilidade LGPD"
              hint="Exportar pacote estruturado"
              onClick={handle(onPortability)}
            />
          )}
        </div>
      )}
    </div>
  )
}

interface MenuItemProps {
  label: string
  hint?: string
  onClick: () => void
  disabled?: boolean
}

function MenuItem({ label, hint, onClick, disabled }: MenuItemProps) {
  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'group relative flex w-full items-center px-3 py-2.5 text-left transition-colors border-l-2 border-transparent',
        disabled
          ? 'opacity-50 cursor-not-allowed'
          : 'hover:bg-teal-50/60 hover:border-l-brand cursor-pointer',
      )}
    >
      <div className="min-w-0">
        <div className="text-xs font-medium text-(--text)">{label}</div>
        {hint && <div className="text-[0.55rem] text-(--text-muted)">{hint}</div>}
      </div>
    </button>
  )
}
