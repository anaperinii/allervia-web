import { cn } from '@/shared/lib/cn'
import { MediaRow } from './MediaRow'
import { PatientInitials } from '@/shared/components/glass-card'
import { PROFESSION_LABELS, ROLE_BADGES } from '@/features/settings/constants/team-roles'
import type { TeamMember } from '@/shared/api/contracts/team'
import { MemberActionMenu } from './MemberActionMenu'

interface MembersTableProps {
  members: TeamMember[]
  openMenuId: string | null
  onToggleMenu: (id: string) => void
  onCloseMenu: () => void
  onDeactivate: (member: TeamMember) => void
  onActivate: (member: TeamMember) => void
}

const monthYear = new Intl.DateTimeFormat('pt-BR', {
  month: 'short',
  year: 'numeric',
})

export function MembersTable({
  members,
  openMenuId,
  onToggleMenu,
  onCloseMenu,
  onDeactivate,
  onActivate,
}: MembersTableProps) {
  if (members.length === 0) {
    return (
      <div className="text-center py-12 text-xs text-(--text-muted)">
        Nenhum membro encontrado com os filtros atuais.
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-(--border-custom) bg-gray-50/80">
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Membro</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Papéis</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Profissão</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Acesso</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Desde</th>
          <th className="text-right text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5 w-12"></th>
        </tr>
      </thead>
      <tbody>
        {members.map((member) => (
          <tr
            key={member.professionalId}
            className="border-b border-(--border-custom) last:border-0 hover:bg-gray-50/50 transition-colors"
          >
            <td className="px-5 py-3">
              <MediaRow
                leading={<PatientInitials name={member.fullName} size={32} />}
                title={member.fullName}
                description={member.email}
              />
            </td>
            <td className="px-5 py-3">
              <div className="flex flex-wrap gap-1">
                {member.roles.length > 0 ? (
                  member.roles.map((role) => (
                    <span
                      key={role}
                      className="inline-block px-2 py-0.5 rounded-md bg-gray-200/70 text-[0.65rem] font-medium text-(--text-muted) border border-gray-200"
                    >
                      {ROLE_BADGES[role].label}
                    </span>
                  ))
                ) : (
                  <span className="text-[0.65rem] text-(--text-muted)">Sem papel</span>
                )}
              </div>
            </td>
            <td className="px-5 py-3 text-xs text-(--text-muted)">
              {PROFESSION_LABELS[member.profession]}
            </td>
            <td className="px-5 py-3">
              <span
                className={cn(
                  'text-[0.65rem] font-medium flex items-center gap-1',
                  member.isActive ? 'text-green-600' : 'text-(--text-muted)',
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full',
                    member.isActive ? 'bg-green-500' : 'bg-gray-300',
                  )}
                />
                {member.isActive ? 'Ativo' : 'Encerrado'}
              </span>
            </td>
            <td className="px-5 py-3 text-xs text-(--text-muted)">
              {monthYear.format(new Date(member.createdAt))}
            </td>
            <td className="px-5 py-3 text-right">
              <MemberActionMenu
                member={member}
                open={openMenuId === member.professionalId}
                onToggle={() => onToggleMenu(member.professionalId)}
                onClose={onCloseMenu}
                onDeactivate={() => onDeactivate(member)}
                onActivate={() => onActivate(member)}
              />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
