import { Clock, Mail, Send, Trash2, X } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Button, IconButton } from '@/shared/components'
import { ROLE_BADGES } from '@/features/settings/data/team-roles'
import type { Invite } from '@/features/settings/stores/teams-store'

interface InvitesTableProps {
  invites: Invite[]
  onResend: (invite: Invite) => void
  onDelete: (invite: Invite) => void
}

export function InvitesTable({ invites, onResend, onDelete }: InvitesTableProps) {
  if (invites.length === 0) {
    return <div className="text-center py-12 text-xs text-(--text-muted)">Nenhum convite enviado.</div>
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-(--border-custom) bg-gray-50/80">
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">E-mail</th>
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Perfil</th>
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Enviado em</th>
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Status</th>
          <th className="text-right text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5 w-24">Ações</th>
        </tr>
      </thead>
      <tbody>
        {invites.map((invite) => {
          const role = ROLE_BADGES[invite.role]
          return (
            <tr key={invite.id} className="border-b border-(--border-custom) last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-(--text-muted) shrink-0">
                    <Mail size={14} />
                  </div>
                  <span className="text-xs font-medium text-(--text)">{invite.email}</span>
                </div>
              </td>
              <td className="px-5 py-3">
                <span className={cn('text-[0.65rem] font-semibold px-2 py-0.5 rounded-full', role.bg, role.color)}>
                  {role.label}
                </span>
              </td>
              <td className="px-5 py-3 text-xs text-(--text-muted)">{invite.sentAt}</td>
              <td className="px-5 py-3">
                {invite.status === 'pending' ? (
                  <span className="text-[0.65rem] font-medium text-amber-600 flex items-center gap-1">
                    <Clock size={11} />
                    Pendente
                  </span>
                ) : (
                  <span className="text-[0.65rem] font-medium text-(--text-muted) flex items-center gap-1">
                    <X size={11} />
                    Expirado
                  </span>
                )}
              </td>
              <td className="px-5 py-3">
                <div className="flex items-center justify-end gap-1">
                  {invite.status === 'pending' && (
                    <Button variant="outline" size="sm" leftIcon={<Send size={10} />} onClick={() => onResend(invite)}>
                      Reenviar
                    </Button>
                  )}
                  <IconButton size="sm" tone="danger" aria-label="Excluir convite" onClick={() => onDelete(invite)}>
                    <Trash2 size={12} />
                  </IconButton>
                </div>
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
