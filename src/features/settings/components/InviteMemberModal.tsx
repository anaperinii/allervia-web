import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Modal, Button, TextInput, FieldLabel } from '@/shared/components'
import {
  ROLE_BADGES,
  ROLE_DESCRIPTIONS,
  type TeamRole,
} from '@/features/settings/constants/team-roles'

interface InviteMemberModalProps {
  open: boolean
  submitting: boolean
  error: string | null
  onClose: () => void
  onSubmit: (data: { email: string; fullName: string; role: TeamRole }) => void
}

export function InviteMemberModal({
  open,
  submitting,
  error,
  onClose,
  onSubmit,
}: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<TeamRole>('PHYSICIAN')

  const handleClose = () => {
    setEmail('')
    setFullName('')
    setRole('PHYSICIAN')
    onClose()
  }

  const canSubmit = email.trim().length > 0 && fullName.trim().length > 0

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Convidar novo membro"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>
            Cancelar
          </Button>
          <Button
            tone="brand"
            variant="solid"
            disabled={!canSubmit || submitting}
            onClick={() =>
              onSubmit({ email: email.trim(), fullName: fullName.trim(), role })
            }
          >
            Enviar convite
          </Button>
        </>
      }
    >
      <FieldLabel label="Nome do convidado">
        <TextInput
          placeholder="Nome completo"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
        />
      </FieldLabel>
      <FieldLabel label="E-mail do convidado">
        <TextInput
          type="email"
          placeholder="nome@clinica.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FieldLabel>
      <div>
        <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">
          Papel de acesso
        </label>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Papel de acesso">
          {(Object.entries(ROLE_BADGES) as [TeamRole, (typeof ROLE_BADGES)[TeamRole]][]).map(
            ([key, val]) => {
              const selected = role === key
              return (
                <button
                  key={key}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setRole(key)}
                  className={cn(
                    'h-9 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center cursor-pointer',
                    selected
                      ? 'border-brand bg-brand-50 text-brand-dark'
                      : 'border-(--border-custom) text-(--text-muted) hover:border-brand/50',
                  )}
                >
                  {val.label}
                </button>
              )
            },
          )}
        </div>
      </div>
      <div className="bg-brand-50 border border-brand/20 rounded-lg p-3">
        <div className="text-[0.65rem] font-semibold text-brand-dark mb-1">
          Sobre este papel
        </div>
        <div className="text-[0.6rem] text-brand-dark/80 leading-relaxed">
          {ROLE_DESCRIPTIONS[role]}
        </div>
      </div>
      {error && (
        <p className="text-[0.7rem] text-red-600" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}
