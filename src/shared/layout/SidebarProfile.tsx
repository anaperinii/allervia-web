import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { cn } from '@/shared/lib/cn'
import { ROLE_LABELS, useCurrentUser } from '@/shared/stores/useUserStore'
import { useSession } from '@/shared/auth/useSession'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faUserGear } from '@fortawesome/free-solid-svg-icons'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((part) => !['Dr.', 'Dra.', 'Dr', 'Dra'].includes(part))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

const GLASS_AVATAR_STYLE: React.CSSProperties = {
  background: 'linear-gradient(160deg, #6C9EA5 0%, #4d7e85 100%)',
  color: '#ffffff',
  border: '1px solid rgba(16,113,129,0.22)',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.35), 0 2px 8px rgba(16,60,68,0.18)',
}

interface SidebarProfileProps {
  isCollapsed: boolean
}

export function SidebarProfile({ isCollapsed }: SidebarProfileProps) {
  const navigate = useNavigate()
  const current = useCurrentUser()
  const { signOut } = useSession()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open])

  const handleOpenProfilePage = () => {
    setOpen(false)
    navigate({ to: '/profile' })
  }

  const handleLogout = async () => {
    setOpen(false)
    await signOut()
    await navigate({ to: '/login' })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        aria-label="Meu perfil"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          'flex items-center rounded-xl transition-all duration-200 cursor-pointer w-full',
          isCollapsed ? 'h-10 w-10 justify-center mx-auto' : 'h-11 gap-2.5 px-2',
        )}
        style={{ background: open ? 'rgba(37,126,140,0.12)' : 'transparent' }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = 'rgba(37,126,140,0.07)'
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = 'transparent'
        }}
      >
        <span
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-[0.65rem] font-bold shrink-0 overflow-hidden"
          style={GLASS_AVATAR_STYLE}
        >
          {getInitials(current.name)}
        </span>
        {!isCollapsed && (
          <div className="min-w-0 flex-1 text-left">
            <div
              className="text-[0.75rem] font-semibold truncate"
              style={{ color: '#12333a' }}
            >
              {current.name}
            </div>
            <div
              className="text-[0.7rem] truncate"
              style={{ color: 'rgba(18,51,58,0.6)' }}
            >
              {ROLE_LABELS[current.role]}
            </div>
          </div>
        )}
      </button>

      {open && (
        <div
          className="absolute w-64 rounded-xl overflow-hidden z-50 bottom-full left-0 mb-2"
          style={{
            background: '#ffffff',
            border: '1px solid rgba(16,113,129,0.14)',
            boxShadow: '0 10px 40px rgba(16,60,68,0.18)',
          }}
        >
          <div className="px-3 py-2.5 border-b border-slate-100">
            <div className="text-xs font-semibold text-slate-800 truncate">
              {current.name}
            </div>
            <div className="text-[0.65rem] text-slate-600 truncate">
              {current.email}
            </div>
            <div className="text-[0.6rem] text-slate-500 mt-0.5">
              {current.roles.map((role) => ROLE_LABELS[role]).join(' · ') ||
                'Sem papel atribuído'}
            </div>
          </div>
          <div className="border-t border-slate-100">
            <button
              type="button"
              onClick={handleOpenProfilePage}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-600 hover:bg-teal-900/10 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faUserGear} className="text-slate-600" style={{ fontSize: 14 }} />
              <span className="text-xs font-medium">Meu perfil</span>
            </button>
            <button
              type="button"
              onClick={() => void handleLogout()}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-red-600 hover:bg-red-900/10 transition-colors cursor-pointer"
            >
              <FontAwesomeIcon icon={faRightFromBracket} style={{ fontSize: 14 }} />
              <span className="text-xs font-medium">Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
