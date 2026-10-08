import { Button, IconButton } from '@/shared/components'
import { ROLE_BADGES } from '@/features/settings/constants/team-roles'
import type { Invite, InviteStatus } from '@/shared/api/contracts/team'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCheck,
  faClock,
  faEnvelope,
  faPaperPlane,
  faTrash,
  faXmark,
} from '@fortawesome/free-solid-svg-icons'

interface InvitesTableProps {
  invites: Invite[]
  onResend: (invite: Invite) => void
  onCancel: (invite: Invite) => void
}

const dateFormat = new Intl.DateTimeFormat('pt-BR')

const STATUS_VIEW: Record<
  InviteStatus,
  { label: string; icon: typeof faClock; className: string }
> = {
  ACTIVE: { label: 'Aguardando', icon: faClock, className: 'text-amber-600' },
  EXPIRED: { label: 'Expirado', icon: faXmark, className: 'text-(--text-muted)' },
  USED: { label: 'Aceito', icon: faCheck, className: 'text-green-600' },
  CANCELLED: { label: 'Cancelado', icon: faXmark, className: 'text-(--text-muted)' },
}

export function InvitesTable({ invites, onResend, onCancel }: InvitesTableProps) {
  if (invites.length === 0) {
    return (
      <div className="text-center py-12 text-xs text-(--text-muted)">
        Nenhum convite enviado.
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-(--border-custom) bg-gray-50/80">
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Convidado</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Papel</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Enviado em</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Válido até</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Situação</th>
          <th className="text-right text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5 w-24">Ações</th>
        </tr>
      </thead>
      <tbody>
        {invites.map((invite) => {
          const status = STATUS_VIEW[invite.status]
          return (
            <tr
              key={invite.id}
              className="border-b border-(--border-custom) last:border-0 hover:bg-gray-50/50 transition-colors"
            >
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-(--text-muted) shrink-0">
                    <FontAwesomeIcon icon={faEnvelope} style={{ fontSize: 14 }} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-medium text-(--text) truncate">
                      {invite.fullName}
                    </div>
                    <div className="text-[0.65rem] text-(--text-muted) truncate">
                      {invite.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-5 py-3">
                <span className="inline-block px-2 py-0.5 rounded-md bg-gray-200/70 text-[0.65rem] font-medium text-(--text-muted) border border-gray-200">
                  {ROLE_BADGES[invite.role].label}
                </span>
              </td>
              <td className="px-5 py-3 text-xs text-(--text-muted)">
                {dateFormat.format(new Date(invite.createdAt))}
              </td>
              <td className="px-5 py-3 text-xs text-(--text-muted)">
                {dateFormat.format(new Date(invite.expiresAt))}
              </td>
              <td className="px-5 py-3">
                <span
                  className={`text-[0.65rem] font-medium flex items-center gap-1 ${status.className}`}
                >
                  <FontAwesomeIcon icon={status.icon} style={{ fontSize: 11 }} />
                  {status.label}
                </span>
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-1">
                  {invite.status !== 'USED' && (
                    <Button
                      variant="outline"
                      size="sm"
                      leftIcon={<FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: 10 }} />}
                      onClick={() => onResend(invite)}
                    >
                      Reenviar
                    </Button>
                  )}
                  {invite.status === 'ACTIVE' && (
                    <IconButton
                      size="sm"
                      tone="danger"
                      aria-label="Cancelar convite"
                      onClick={() => onCancel(invite)}
                    >
                      <FontAwesomeIcon icon={faTrash} style={{ fontSize: 12 }} />
                    </IconButton>
                  )}
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
