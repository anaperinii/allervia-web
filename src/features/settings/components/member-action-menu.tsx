import { useEffect, useRef } from 'react'
import { MoreHorizontal, Pencil, Shield, Trash2, UserCheck, UserX } from 'lucide-react'
import { IconButton } from '@/shared/components'
import type { TeamMember } from '@/features/settings/stores/teams-store'

interface MemberActionMenuProps {
  member: TeamMember
  open: boolean
  onToggle: () => void
  onClose: () => void
  onDeactivate: () => void
  onActivate: () => void
  onRemove: () => void
}

export function MemberActionMenu({ member, open, onToggle, onClose, onDeactivate, onActivate, onRemove }: MemberActionMenuProps) {
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
        <MoreHorizontal size={14} />
      </IconButton>
      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-1 w-44 bg-white border border-(--border-custom) rounded-lg shadow-[0_8px_24px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in fade-in-0 slide-in-from-top-1 duration-150"
        >
          <button role="menuitem" onClick={onClose} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-(--text) hover:bg-gray-50 transition-colors cursor-pointer">
            <Pencil size={12} className="text-(--text-muted)" />
            Editar perfil
          </button>
          <button role="menuitem" onClick={onClose} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-(--text) hover:bg-gray-50 transition-colors cursor-pointer">
            <Shield size={12} className="text-(--text-muted)" />
            Alterar permissões
          </button>
          {member.status === 'active' ? (
            <button role="menuitem" onClick={onDeactivate} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer">
              <UserX size={12} />
              Desativar membro
            </button>
          ) : (
            <button role="menuitem" onClick={onActivate} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-green-600 hover:bg-green-50 transition-colors cursor-pointer">
              <UserCheck size={12} />
              Reativar membro
            </button>
          )}
          <div className="border-t border-(--border-custom)" />
          <button role="menuitem" onClick={onRemove} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
            <Trash2 size={12} />
            Remover da equipe
          </button>
        </div>
      )}
    </div>
  )
}
