import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { NotificationsPanel } from '@/features/notification/components/NotificationsPanel'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell, faXmark } from '@fortawesome/free-solid-svg-icons'

interface NotificationsDrawerProps {
  open: boolean
  onClose: () => void
}

export function NotificationsDrawer({ open, onClose }: NotificationsDrawerProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className="fixed inset-0 z-100 flex justify-end bg-black/10 backdrop-blur-[2px] animate-in fade-in-0 duration-200"
      onClick={onClose}
    >
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Central de Notificações"
        onClick={(e) => e.stopPropagation()}
        className="flex h-full w-full max-w-[480px] flex-col bg-white shadow-[-16px_0_40px_-20px_rgba(16,60,68,0.5)] animate-in slide-in-from-right-[480px] duration-300 ease-out"
      >
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#DDE6E6] px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-50">
              <FontAwesomeIcon icon={faBell} style={{ fontSize: 16 }} className="text-brand" />
            </div>
            <h2 className="text-base font-bold text-(--text)">
              Central de Notificações
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar notificações"
            className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-(--text-muted) transition-colors hover:bg-gray-100 hover:text-(--text)"
          >
            <FontAwesomeIcon icon={faXmark} style={{ fontSize: 14 }} />
          </button>
        </div>

        <NotificationsPanel variant="drawer" />
      </aside>
    </div>,
    document.body,
  )
}
