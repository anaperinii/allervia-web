import { cn } from '@/shared/lib/cn'
import { MediaRow } from './MediaRow'
import { ROLE_BADGES } from '@/features/settings/constants/team-roles'
import type { TeamMember } from '@/features/settings/stores/useTeamsStore'
import { MemberActionMenu } from './MemberActionMenu'

interface MembersTableProps {
  members: TeamMember[]
  openMenuId: string | null
  onToggleMenu: (id: string) => void
  onCloseMenu: () => void
  onDeactivate: (member: TeamMember) => void
  onActivate: (member: TeamMember) => void
  onRemove: (member: TeamMember) => void
}

export function MembersTable({
  members,
  openMenuId,
  onToggleMenu,
  onCloseMenu,
  onDeactivate,
  onActivate,
  onRemove,
}: MembersTableProps) {
  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-(--border-custom) bg-gray-50/80">
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Membro</th>
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Perfil</th>
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Status</th>
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5">Desde</th>
          <th className="text-right text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-5 py-2.5 w-12"></th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => {
          const role = ROLE_BADGES[member.role]
          return (
            <tr key={member.id} className="border-b border-(--border-custom) last:border-0 hover:bg-gray-50/50 transition-colors">
              <td className="px-5 py-3">
                <MediaRow
                  leading={
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-linear-to-br from-brand to-brand-dark text-white text-[0.6rem] font-bold shrink-0">
                      {member.avatar}
                    </div>
                  }
                  title={member.name}
                  description={member.email}
                />
              </td>
              <td className="px-5 py-3">
                <span className={cn('text-[0.65rem] font-semibold px-2 py-0.5 rounded-full', role.bg, role.color)}>
                  {role.label}
                </span>
              </td>
              <td className="px-5 py-3">
                <span className={cn('text-[0.65rem] font-medium flex items-center gap-1', member.status === 'active' ? 'text-green-600' : 'text-(--text-muted)')}>
                  <span className={cn('w-1.5 h-1.5 rounded-full', member.status === 'active' ? 'bg-green-500' : 'bg-gray-300')} />
                  {member.status === 'active' ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="px-5 py-3 text-xs text-(--text-muted)">{member.since}</td>
              <td className="px-5 py-3 text-right">
                <MemberActionMenu
                  member={member}
                  open={openMenuId === member.id}
                  onToggle={() => onToggleMenu(member.id)}
                  onClose={onCloseMenu}
                  onDeactivate={() => onDeactivate(member)}
                  onActivate={() => onActivate(member)}
                  onRemove={() => onRemove(member)}
                />
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
