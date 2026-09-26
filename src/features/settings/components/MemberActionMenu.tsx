import { useEffect, useRef } from 'react'
import { IconButton } from '@/shared/components'
import type { TeamMember } from '@/shared/api/contracts/team'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEllipsis, faUserCheck, faUserXmark } from '@fortawesome/free-solid-svg-icons'

interface MemberActionMenuProps {
  member: TeamMember
  open: boolean
  onToggle: () => void
  onClose: () => void
  onDeactivate: () => void
  onActivate: () => void
}

export function MemberActionMenu({
  member,
  open,
  onToggle,
  onClose,
  onDeactivate,
  onActivate,
}: MemberActionMenuProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [open, onClose])

  return (
    <div ref={ref} className="relative inline-block">
      <IconButton size="sm" aria-label="Ações do membro" aria-expanded={open} onClick={onToggle}>
        <FontAwesomeIcon icon={faEllipsis} style={{ fontSize: 14 }} />
      </IconButton>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-48 bg-white border border-(--border-custom) rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-1 duration-150"
        >
          {member.isActive ? (
            <button
              role="menuitem"
              onClick={onDeactivate}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faUserXmark} style={{ fontSize: 12 }} />
              Encerrar acesso
            </button>
          ) : (
            <button
              role="menuitem"
              onClick={onActivate}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-green-600 hover:bg-green-50 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faUserCheck} style={{ fontSize: 12 }} />
              Restaurar acesso
            </button>
          )}
        </div>
      )}
    </div>
  )
}
