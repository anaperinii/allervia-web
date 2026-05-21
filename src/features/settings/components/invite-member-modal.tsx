import { useState } from 'react'
import { Shield } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Modal, Button, TextInput, FieldLabel } from '@/shared/components'
import { ROLE_BADGES, ROLE_DESCRIPTIONS, type TeamRole } from '@/features/settings/data/team-roles'

interface InviteMemberModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: { email: string; role: TeamRole }) => void
}

export function InviteMemberModal({ open, onClose, onSubmit }: InviteMemberModalProps) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<TeamRole>('doctor')

  const handleClose = () => {
    setEmail('')
    setRole('doctor')
    onClose()
  }

  const handleSubmit = () => {
    if (!email) return
    onSubmit({ email, role })
    handleClose()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title="Convidar novo membro"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={handleClose}>Cancelar</Button>
          <Button tone="brand" variant="solid" disabled={!email} onClick={handleSubmit}>Enviar convite</Button>
        </>
      }
    >
      <FieldLabel label="E-mail do convidado">
        <TextInput
          type="email"
          placeholder="nome@clinica.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </FieldLabel>
      <div>
        <label className="text-xs font-semibold text-(--text-muted) mb-1.5 block">Perfil de acesso</label>
        <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Perfil de acesso">
          {(Object.entries(ROLE_BADGES) as [TeamRole, (typeof ROLE_BADGES)[TeamRole]][]).map(([key, val]) => {
            const selected = role === key
            return (
              <button
                key={key}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setRole(key)}
                className={cn(
                  'h-9 rounded-lg border text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer',
                  selected
                    ? 'border-brand bg-brand-50 text-brand-dark'
                    : 'border-(--border-custom) text-(--text-muted) hover:border-brand/50',
                )}
              >
                <Shield size={12} />
                {val.label}
              </button>
            )
          })}
        </div>
      </div>
      <div className="bg-brand-50 border border-brand/20 rounded-lg p-3">
        <div className="text-[0.65rem] font-semibold text-brand-dark mb-1">Sobre este perfil</div>
        <div className="text-[0.6rem] text-brand-dark/80 leading-relaxed">
          {ROLE_DESCRIPTIONS[role]}
        </div>
      </div>
    </Modal>
  )
}
