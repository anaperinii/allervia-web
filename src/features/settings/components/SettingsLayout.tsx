import { Link, useNavigate } from '@tanstack/react-router'
import { LogOut } from 'lucide-react'
import { useState } from 'react'
import { Button, Modal } from '@/shared/components'
import { useUserStore, ROLE_LABELS } from '@/shared/stores/useUserStore'
import type { ReactNode } from 'react'

interface SettingsLayoutProps {
  subtitle?: string
  headerActions?: ReactNode
  children: ReactNode
}

export function SettingsLayout({ subtitle, headerActions, children }: SettingsLayoutProps) {
  const navigate = useNavigate()
  const current = useUserStore((s) => s.current)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const initials = current.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

  const handleLogout = () => {
    setShowLogoutModal(false)
    navigate({ to: '/login' })
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden px-5 pt-8 pb-5">
      <div className="mb-8 flex items-center justify-between gap-3">
        <div className="flex items-end gap-2.5">
          {subtitle ? (
            <>
              <Link
                to="/settings"
                className="text-3xl font-semibold leading-none text-(--text-muted) hover:text-(--text) transition-colors no-underline"
              >
                Configurações
              </Link>
              <span className="text-2xl font-light leading-none text-(--text-muted)/60 mb-0.5">/</span>
              <span className="text-xl font-medium leading-none text-(--text) mb-0.5">{subtitle}</span>
            </>
          ) : (
            <h1 className="text-3xl font-semibold leading-none text-(--text)">Configurações</h1>
          )}
        </div>
        {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
      </div>

      {!subtitle && (
        <div
          className="relative mb-8 flex items-center gap-6 overflow-hidden rounded-xl bg-white/45 px-8 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.06)] backdrop-blur-xl"
          style={{
            backgroundImage:
              'linear-gradient(105deg, rgba(24,193,203,0.13) 0%, rgba(77,212,219,0.07) 25%, rgba(230,249,250,0.03) 55%, transparent 80%)',
          }}
        >
          <div className="relative h-18 w-18 shrink-0" style={{ width: '72px', height: '72px' }}>
            <div
              aria-hidden="true"
              className="absolute"
              style={{
                width: '46px',
                height: '46px',
                top: '5px',
                right: '3px',
                borderRadius: '15px',
                background: 'linear-gradient(150deg, #4DD4DB 0%, #18C1CB 55%, #0FA8B2 100%)',
                transform: 'rotate(14deg)',
                boxShadow: '0 10px 18px rgba(15,118,144,0.30)',
              }}
            />
            <div
              className="absolute flex items-center justify-center"
              style={{
                width: '56px',
                height: '56px',
                bottom: '5px',
                left: '0',
                borderRadius: '18px',
                background:
                  'linear-gradient(155deg, rgba(230,249,250,0.65) 0%, rgba(77,212,219,0.45) 100%)',
                backdropFilter: 'blur(10px) saturate(140%)',
                WebkitBackdropFilter: 'blur(10px) saturate(140%)',
                border: '1.5px solid rgba(255,255,255,0.55)',
                boxShadow:
                  '0 12px 22px rgba(24,193,203,0.22), inset 0 1px 1px rgba(255,255,255,0.65)',
              }}
            >
              <span
                className="text-lg font-bold text-white"
                style={{
                  textShadow:
                    '0 1px 2px rgba(14,116,144,0.45), 0 0 6px rgba(255,255,255,0.35)',
                }}
              >
                {initials}
              </span>
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-lg font-semibold text-(--text)">{current.name}</div>
            <div className="text-[0.8rem] text-(--text-muted) mt-0.5">{ROLE_LABELS[current.role]}</div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              tone="danger"
              variant="outline"
              size="md"
              leftIcon={<LogOut size={14} />}
              onClick={() => setShowLogoutModal(true)}
              className="px-4"
            >
              Encerrar sessão
            </Button>
            <Button tone="brand" variant="solid" prominent size="md" to="/profile" className="px-4">
              Seu Perfil
            </Button>
          </div>
        </div>
      )}

      {subtitle ? (
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex-1 min-h-0 overflow-y-auto p-5">{children}</div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
      )}

      <Modal
        open={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        size="sm"
        title="Encerrar sessão"
        icon={<LogOut size={16} />}
        tone="danger"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowLogoutModal(false)}>Cancelar</Button>
            <Button tone="danger" variant="solid" onClick={handleLogout}>Encerrar sessão</Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">
          Você será desconectado do ImuneCare e redirecionado para a tela de login. Continuar?
        </p>
      </Modal>
    </div>
  )
}
