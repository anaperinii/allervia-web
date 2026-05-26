import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, Lock, Plus } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { Button, IconButton, Select } from '@/shared/components'
import type { TeamRole } from '@/features/settings/constants/team-roles'
import { useTeamsStore, type Invite, type TeamMember } from '@/features/settings/stores/useTeamsStore'
import { MembersTable } from '@/features/settings/components/MembersTable'
import { InvitesTable } from '@/features/settings/components/InvitesTable'
import { InviteMemberModal } from '@/features/settings/components/InviteMemberModal'
import { TeamConfirmModal, type TeamConfirmState } from '@/features/settings/components/TeamConfirmModal'
import { TablePagination } from '@/shared/components'

type StatusFilter = TeamMember['status'] | 'all'
type RoleFilter = TeamRole | 'all'

export function TeamsPage() {
  const canManageTeam = useHasPermission('manage_team')
  const members = useTeamsStore((s) => s.members)
  const invites = useTeamsStore((s) => s.invites)
  const removeMember = useTeamsStore((s) => s.removeMember)
  const setMemberStatus = useTeamsStore((s) => s.setMemberStatus)
  const deleteInvite = useTeamsStore((s) => s.deleteInvite)

  const [tab, setTab] = useState<'members' | 'invites'>('members')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<TeamConfirmState | null>(null)

  const filteredMembers = useMemo(() => members
    .filter((m) => statusFilter === 'all' || m.status === statusFilter)
    .filter((m) => roleFilter === 'all' || m.role === roleFilter)
    .sort((a, b) => a.status === 'active' && b.status !== 'active' ? -1 : a.status !== 'active' && b.status === 'active' ? 1 : 0)
  , [members, statusFilter, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage))
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredMembers.slice(start, start + itemsPerPage)
  }, [filteredMembers, currentPage, itemsPerPage])

  useEffect(() => { setCurrentPage(1) }, [statusFilter, roleFilter, itemsPerPage])

  const pendingCount = invites.filter((i) => i.status === 'pending').length

  const handleConfirm = () => {
    if (!confirmState) return
    switch (confirmState.type) {
      case 'remove-member':
        removeMember(confirmState.id)
        break
      case 'deactivate':
        setMemberStatus(confirmState.id, 'inactive')
        break
      case 'activate':
        setMemberStatus(confirmState.id, 'active')
        break
      case 'delete-invite':
        deleteInvite(confirmState.id)
        break
      case 'resend-invite':
        break
    }
    setConfirmState(null)
  }

  if (!canManageTeam) {
    return (
      <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
        <div className="flex flex-1 min-h-0 flex-col items-center justify-center rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] m-4 p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Lock size={22} className="text-(--text-muted)" />
          </div>
          <h2 className="text-base font-bold text-(--text) mb-1.5">Acesso restrito</h2>
          <p className="text-xs text-(--text-muted) max-w-sm leading-relaxed mb-5">
            A gestão de equipe está disponível apenas para o perfil <span className="font-semibold text-(--text)">Administrador</span>. Troque de perfil pelo menu de usuário para acessar esta área.
          </p>
          <Button variant="outline" to="/settings">Voltar para configurações</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <IconButton aria-label="Voltar" to="/settings"><ArrowLeft size={16} /></IconButton>
            <h1 className="text-2xl font-bold text-(--text)">Equipes e Convites</h1>
          </div>
          <Button tone="brand" variant="solid" prominent leftIcon={<Plus size={14} />} onClick={() => setShowInviteModal(true)} className="px-3">
            Convidar membro
          </Button>
        </div>

        <div role="tablist" aria-label="Equipe" className="border-b border-(--border-custom) px-5 flex items-center gap-1">
          <button
            role="tab"
            aria-selected={tab === 'members'}
            onClick={() => setTab('members')}
            className={cn(
              'px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer',
              tab === 'members' ? 'border-brand text-brand' : 'border-transparent text-(--text-muted) hover:text-(--text)',
            )}
          >
            Membros ({members.length})
          </button>
          <button
            role="tab"
            aria-selected={tab === 'invites'}
            onClick={() => setTab('invites')}
            className={cn(
              'px-4 py-2.5 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer',
              tab === 'invites' ? 'border-brand text-brand' : 'border-transparent text-(--text-muted) hover:text-(--text)',
            )}
          >
            Convites
            {pendingCount > 0 && (
              <span className="text-[0.55rem] font-bold text-white bg-brand rounded-full px-1.5 py-px">{pendingCount}</span>
            )}
          </button>
        </div>

        {tab === 'members' ? (
          <>
            <div className="px-5 py-3 border-b border-(--border-custom) flex items-center gap-2">
              <Select
                aria-label="Filtrar por status"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
                className="h-8 bg-white text-xs min-w-28"
              >
                <option value="active">Ativos</option>
                <option value="inactive">Inativos</option>
                <option value="all">Todos</option>
              </Select>
              <Select
                aria-label="Filtrar por perfil"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
                className="h-8 bg-white text-xs min-w-36"
              >
                <option value="all">Todos os perfis</option>
                <option value="admin">Administrador</option>
                <option value="doctor">Médico</option>
                <option value="nurse">Enfermeiro</option>
                <option value="technician">Técnico</option>
              </Select>
              <span className="text-[0.65rem] text-(--text-muted)">{filteredMembers.length} membros</span>
            </div>

            <div className="flex-1 overflow-y-auto">
              <MembersTable
                members={paginatedMembers}
                openMenuId={openMenuId}
                onToggleMenu={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                onCloseMenu={() => setOpenMenuId(null)}
                onDeactivate={(member) => { setOpenMenuId(null); setConfirmState({ type: 'deactivate', id: member.id, name: member.name }) }}
                onActivate={(member) => { setOpenMenuId(null); setConfirmState({ type: 'activate', id: member.id, name: member.name }) }}
                onRemove={(member) => { setOpenMenuId(null); setConfirmState({ type: 'remove-member', id: member.id, name: member.name }) }}
              />
            </div>

            <TablePagination
              currentPage={currentPage}
              totalPages={totalPages}
              itemsPerPage={itemsPerPage}
              onPageChange={setCurrentPage}
              onItemsPerPageChange={setItemsPerPage}
            />
          </>
        ) : (
          <div className="flex-1 overflow-y-auto">
            <InvitesTable
              invites={invites}
              onResend={(invite: Invite) => setConfirmState({ type: 'resend-invite', id: invite.id, name: invite.email })}
              onDelete={(invite: Invite) => setConfirmState({ type: 'delete-invite', id: invite.id, name: invite.email })}
            />
          </div>
        )}
      </div>

      <InviteMemberModal
        open={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        onSubmit={() => setShowInviteModal(false)}
      />

      <TeamConfirmModal
        state={confirmState}
        onClose={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />
    </div>
  )
}
