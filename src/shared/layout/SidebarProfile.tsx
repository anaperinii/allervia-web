import { useState, useEffect, useRef } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { Check, LogOut, UserCog } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useUserStore, PROFILES, ROLE_LABELS } from '@/shared/stores/useUserStore'

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter((part) => !['Dr.', 'Dra.', 'Dr', 'Dra'].includes(part))
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

interface SidebarProfileProps {
  isCollapsed: boolean
}

export function SidebarProfile({ isCollapsed }: SidebarProfileProps) {
  const navigate = useNavigate()
  const current = useUserStore((s) => s.current)
  const setProfile = useUserStore((s) => s.setProfile)
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

  const handleSelectProfile = (id: string) => {
    setProfile(id)
    setOpen(false)
  }

  const handleOpenProfilePage = () => {
    setOpen(false)
    navigate({ to: '/profile' })
  }

  const handleLogout = () => {
    setOpen(false)
    navigate({ to: '/login' })
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
        style={{ background: open ? 'rgba(255,255,255,0.10)' : 'transparent' }}
        onMouseEnter={(e) => {
          if (!open) e.currentTarget.style.background = 'rgba(255,255,255,0.05)'
        }}
        onMouseLeave={(e) => {
          if (!open) e.currentTarget.style.background = 'transparent'
        }}
      >
        <span
          className="relative flex h-8 w-8 items-center justify-center rounded-full text-[0.65rem] font-bold shrink-0 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 20% 22%, rgba(255,255,255,0.14) 0%, transparent 40%), radial-gradient(circle at 80% 18%, rgba(255,255,255,0.08) 0%, transparent 45%), radial-gradient(circle at 78% 82%, rgba(255,255,255,0.11) 0%, transparent 45%), radial-gradient(circle at 22% 80%, rgba(255,255,255,0.07) 0%, transparent 42%), rgba(255,255,255,0.02)',
            color: 'rgba(255,255,255,0.8)',
            border: '1px solid rgba(255,255,255,0.14)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow:
              'inset 0 0 14px rgba(255,255,255,0.10), inset 0 1px 0 rgba(255,255,255,0.18), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.20)',
          }}
        >
          {getInitials(current.name)}
        </span>
        {!isCollapsed && (
          <div className="min-w-0 flex-1 text-left">
            <div
              className="text-[0.75rem] font-semibold truncate"
              style={{ color: '#DCE1E5' }}
            >
              {current.name}
            </div>
            <div
              className="text-[0.7rem] truncate"
              style={{ color: 'rgba(220,225,229,0.55)' }}
            >
              {ROLE_LABELS[current.role]}
            </div>
          </div>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'absolute w-64 rounded-xl overflow-hidden z-50',
            isCollapsed ? 'bottom-0 left-full ml-3' : 'bottom-full left-0 mb-2',
          )}
          style={{
            background: 'rgba(255,255,255,0.68)',
            backdropFilter: 'blur(20px) saturate(150%)',
            WebkitBackdropFilter: 'blur(20px) saturate(150%)',
            border: '1px solid rgba(255,255,255,0.5)',
            boxShadow: '0 10px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.6)',
          }}
        >
          <div className="px-3 py-2.5 border-b border-slate-100">
            <div className="text-[0.6rem] uppercase tracking-wider font-semibold text-slate-600">
              Trocar perfil
            </div>
          </div>
          <div className="max-h-80 overflow-y-auto py-1">
            {PROFILES.map((profile) => {
              const isActive = profile.id === current.id
              return (
                <button
                  key={profile.id}
                  type="button"
                  onClick={() => handleSelectProfile(profile.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-3 py-2 text-left transition-colors cursor-pointer',
                    isActive ? '' : 'hover:bg-teal-900/10',
                  )}
                  style={
                    isActive
                      ? {
                          background:
                            'linear-gradient(90deg, rgba(35,78,88,0.22) 0%, rgba(35,78,88,0.07) 55%, rgba(35,78,88,0) 100%)',
                        }
                      : undefined
                  }
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand to-brand-dark text-white text-[0.65rem] font-bold">
                    {getInitials(profile.name)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-slate-800 truncate">
                      {profile.name}
                    </div>
                    <div className="text-[0.6rem] text-slate-600">
                      {ROLE_LABELS[profile.role]}
                    </div>
                  </div>
                  {isActive && <Check size={14} className="shrink-0 text-brand" />}
                </button>
              )
            })}
          </div>
          <div className="border-t border-slate-100">
            <button
              type="button"
              onClick={handleOpenProfilePage}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-slate-600 hover:bg-teal-900/10 transition-colors cursor-pointer"
            >
              <UserCog size={14} className="text-slate-600" />
              <span className="text-xs font-medium">Meu perfil</span>
            </button>
            <button
              type="button"
              onClick={handleLogout}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-red-600 hover:bg-red-900/10 transition-colors cursor-pointer"
            >
              <LogOut size={14} />
              <span className="text-xs font-medium">Sair</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
