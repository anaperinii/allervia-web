import { useEffect, useMemo, useState } from 'react'
import { Lock, Search } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { Button, Select, TextInput } from '@/shared/components'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
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
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<TeamConfirmState | null>(null)

  const filteredMembers = useMemo(() => members
    .filter((m) => !search.trim() || m.name.toLowerCase().includes(search.trim().toLowerCase()))
    .filter((m) => statusFilter === 'all' || m.status === statusFilter)
    .filter((m) => roleFilter === 'all' || m.role === roleFilter)
    .sort((a, b) => a.status === 'active' && b.status !== 'active' ? -1 : a.status !== 'active' && b.status === 'active' ? 1 : 0)
  , [members, search, statusFilter, roleFilter])

  const totalPages = Math.max(1, Math.ceil(filteredMembers.length / itemsPerPage))
  const paginatedMembers = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filteredMembers.slice(start, start + itemsPerPage)
  }, [filteredMembers, currentPage, itemsPerPage])

  useEffect(() => { setCurrentPage(1) }, [search, statusFilter, roleFilter, itemsPerPage])

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
      <SettingsLayout subtitle="Equipes e Convites">
        <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <Lock size={22} className="text-(--text-muted)" />
          </div>
          <h2 className="text-base font-bold text-(--text) mb-1.5">Acesso restrito</h2>
          <p className="text-xs text-(--text-muted) max-w-sm leading-relaxed mb-5">
            A gestão de equipe está disponível apenas para o perfil <span className="font-semibold text-(--text)">Administrador</span>. Troque de perfil pelo menu de usuário para acessar esta área.
          </p>
          <Button variant="outline" to="/settings">Voltar para configurações</Button>
        </div>
      </SettingsLayout>
    )
  }

  return (
    <SettingsLayout subtitle="Equipes e Convites">
      <div className="flex h-full min-h-0 flex-col">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-45">
          <label htmlFor="team-search" className="sr-only">Pesquisar usuário</label>
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) z-10" />
          <TextInput
            id="team-search"
            placeholder="Pesquisar usuário"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-8 pl-8 bg-[#F3F5F6]! border-[#CBD6D6]!"
          />
        </div>
        <Select
          aria-label="Filtrar por status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="h-8 bg-[#F3F5F6]! w-auto border-[#CBD6D6]!"
        >
          <option value="active">Ativos</option>
          <option value="inactive">Inativos</option>
          <option value="all">Todos</option>
        </Select>
        <Select
          aria-label="Filtrar por perfil"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as RoleFilter)}
          className="h-8 bg-[#F3F5F6]! w-auto border-[#CBD6D6]!"
        >
          <option value="all">Todos os perfis</option>
          <option value="admin">Administrador</option>
          <option value="doctor">Médico</option>
          <option value="nurse">Enfermeiro</option>
          <option value="technician">Técnico</option>
        </Select>
        <Button tone="brand" variant="solid" prominent onClick={() => setShowInviteModal(true)} className="w-44">
          Convidar membro
        </Button>
      </div>

      <div className="relative z-10 flex items-end justify-between gap-3">
        <div role="tablist" aria-label="Equipe" className="flex items-end gap-1">
          <button
            role="tab"
            aria-selected={tab === 'members'}
            onClick={() => setTab('members')}
            className={cn(
              'relative rounded-t-xl px-5 py-2 text-xs font-semibold transition-colors cursor-pointer',
              tab === 'members' ? 'bg-gray-50/80 text-slate-800 z-10' : 'bg-white/55 text-slate-400 hover:bg-white/75 hover:text-slate-600',
            )}
          >
            {tab === 'members' && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 bottom-0 h-3 w-3"
                style={{ background: 'radial-gradient(circle at 100% 0%, transparent 11.5px, rgba(249,250,251,0.8) 12.5px)' }}
              />
            )}
            Membros <span className="text-[0.65rem] font-normal opacity-60">({members.length})</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'invites'}
            onClick={() => setTab('invites')}
            className={cn(
              'relative rounded-t-xl px-5 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer',
              tab === 'invites' ? 'bg-gray-50/80 text-slate-800 z-10' : 'bg-white/55 text-slate-400 hover:bg-white/75 hover:text-slate-600',
            )}
          >
            {tab === 'invites' && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-3 bottom-0 h-3 w-3"
                  style={{ background: 'radial-gradient(circle at 0% 0%, transparent 11.5px, rgba(249,250,251,0.8) 12.5px)' }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 bottom-0 h-3 w-3"
                  style={{ background: 'radial-gradient(circle at 100% 0%, transparent 11.5px, rgba(249,250,251,0.8) 12.5px)' }}
                />
              </>
            )}
            Convites <span className="text-[0.65rem] font-normal opacity-60">({invites.length})</span>
          </button>
        </div>
      </div>

      {tab === 'members' ? (
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-tr-xl rounded-b-xl bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex-1 overflow-auto">
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
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-tr-xl rounded-b-xl bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
          <div className="flex-1 overflow-auto">
            <InvitesTable
              invites={invites}
              onResend={(invite: Invite) => setConfirmState({ type: 'resend-invite', id: invite.id, name: invite.email })}
              onDelete={(invite: Invite) => setConfirmState({ type: 'delete-invite', id: invite.id, name: invite.email })}
            />
          </div>
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
    </SettingsLayout>
  )
}
