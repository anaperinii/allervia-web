import { InviteMemberModal } from '@/features/settings/components/InviteMemberModal'
import { InvitesTable } from '@/features/settings/components/InvitesTable'
import { MembersTable } from '@/features/settings/components/MembersTable'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import {
  TeamConfirmModal,
  type TeamConfirmState,
} from '@/features/settings/components/TeamConfirmModal'
import type { TeamRole } from '@/features/settings/constants/team-roles'
import { Button, Select, TablePagination, TextInput } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { useSession } from '@/shared/auth/useSession'
import { queryKeys } from '@/shared/api/query-keys'
import { ApiError } from '@/shared/api/contracts/errors'
import type { Invite, TeamMember } from '@/shared/api/contracts/team'
import {
  cancelInvite,
  createInvite,
  listInvites,
  listTeamMembers,
  updateMemberAccess,
} from '@/shared/api/team.api'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'

import { faLock, faMagnifyingGlass } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

type StatusFilter = 'active' | 'inactive' | 'all'
type RoleFilter = TeamRole | 'all'

function describe(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function TeamsPage() {
  const canManageTeam = useHasPermission('manage_team')
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const queryClient = useQueryClient()

  const [tab, setTab] = useState<'members' | 'invites'>('members')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(5)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<TeamConfirmState | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)
  const [inviteError, setInviteError] = useState<string | null>(null)

  const memberFilters = {
    page: currentPage,
    pageSize: itemsPerPage,
    search: search.trim() || undefined,
    role: roleFilter === 'all' ? undefined : roleFilter,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  }

  const inviteFilters = { page: 1, pageSize: 50, includeExpired: true }

  // A paginação e os filtros são resolvidos no servidor: a página atual entra
  // na chave da consulta, então cada combinação tem o próprio resultado.
  const membersQuery = useQuery({
    queryKey: queryKeys.team(organizationId, memberFilters),
    queryFn: ({ signal }) => listTeamMembers(memberFilters, signal),
    enabled: canManageTeam && organizationId !== '',
  })

  const invitesQuery = useQuery({
    queryKey: queryKeys.invites(organizationId, inviteFilters),
    queryFn: ({ signal }) => listInvites(inviteFilters, signal),
    enabled: canManageTeam && organizationId !== '',
  })

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['team', organizationId] }),
      queryClient.invalidateQueries({ queryKey: ['invites', organizationId] }),
    ])
  }

  const accessMutation = useMutation({
    mutationFn: (input: { professionalId: string; isActive: boolean }) =>
      updateMemberAccess(input.professionalId, input.isActive),
    onSuccess: refreshAll,
    onError: (error) =>
      setActionError(describe(error, 'Não foi possível alterar o acesso.')),
  })

  const inviteMutation = useMutation({
    mutationFn: (input: { email: string; fullName: string; role: TeamRole }) =>
      createInvite({
        email: input.email,
        fullName: input.fullName,
        userRole: input.role,
      }),
    onSuccess: async () => {
      setShowInviteModal(false)
      setInviteError(null)
      await refreshAll()
    },
    onError: (error) =>
      setInviteError(describe(error, 'Não foi possível enviar o convite.')),
  })

  const cancelMutation = useMutation({
    mutationFn: (inviteId: string) => cancelInvite(inviteId),
    onSuccess: refreshAll,
    onError: (error) =>
      setActionError(describe(error, 'Não foi possível cancelar o convite.')),
  })

  // Reenviar é cancelar e emitir de novo: o servidor não reaproveita um token
  // já entregue, e o link antigo precisa parar de funcionar.
  const resendMutation = useMutation({
    mutationFn: async (invite: Invite) => {
      if (invite.status === 'ACTIVE') await cancelInvite(invite.id)
      await createInvite({
        email: invite.email,
        fullName: invite.fullName,
        userRole: invite.role,
      })
    },
    onSuccess: refreshAll,
    onError: (error) =>
      setActionError(describe(error, 'Não foi possível reenviar o convite.')),
  })

  const members = membersQuery.data?.items ?? []
  const invites = invitesQuery.data?.items ?? []
  const totalMembers = membersQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalMembers / itemsPerPage))

  const applyFilter = (apply: () => void) => {
    apply()
    setCurrentPage(1)
  }

  const handleConfirm = () => {
    if (!confirmState) return
    setActionError(null)

    switch (confirmState.type) {
      case 'deactivate':
        accessMutation.mutate({ professionalId: confirmState.id, isActive: false })
        break
      case 'activate':
        accessMutation.mutate({ professionalId: confirmState.id, isActive: true })
        break
      case 'cancel-invite':
        cancelMutation.mutate(confirmState.id)
        break
      case 'resend-invite': {
        const invite = invites.find((item) => item.id === confirmState.id)
        if (invite) resendMutation.mutate(invite)
        break
      }
    }

    setConfirmState(null)
  }

  if (!canManageTeam) {
    return (
      <SettingsLayout subtitle="Equipes e Convites">
        <div className="flex flex-1 flex-col items-center justify-center p-10 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 mb-4">
            <FontAwesomeIcon icon={faLock} className="text-(--text-muted)" style={{ fontSize: 22 }} />
          </div>
          <h2 className="text-base font-bold text-(--text) mb-1.5">Acesso restrito</h2>
          <p className="text-xs text-(--text-muted) max-w-sm leading-relaxed mb-5">
            A gestão de equipe é concedida pelo papel de{' '}
            <span className="font-semibold text-(--text)">Administrador</span> na
            sua organização. Peça a concessão a quem administra a clínica.
          </p>
          <Button variant="outline" to="/settings">Voltar para configurações</Button>
        </div>
      </SettingsLayout>
    )
  }

  const loadFailure = membersQuery.error ?? invitesQuery.error

  return (
    <SettingsLayout subtitle="Equipes e Convites">
      <div className="flex h-full min-h-0 flex-col">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-45">
          <label htmlFor="team-search" className="sr-only">Pesquisar usuário</label>
          <FontAwesomeIcon icon={faMagnifyingGlass} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) z-10" style={{ fontSize: 14 }} />
          <TextInput
            id="team-search"
            placeholder="Pesquisar por nome ou e-mail"
            value={search}
            onChange={(e) => applyFilter(() => setSearch(e.target.value))}
            className="h-9 pl-8"
          />
        </div>
        <Select
          aria-label="Filtrar por acesso"
          value={statusFilter}
          onChange={(e) => applyFilter(() => setStatusFilter(e.target.value as StatusFilter))}
          className="h-9 w-auto"
        >
          <option value="active">Com acesso</option>
          <option value="inactive">Acesso encerrado</option>
          <option value="all">Todos</option>
        </Select>
        <Select
          aria-label="Filtrar por papel"
          value={roleFilter}
          onChange={(e) => applyFilter(() => setRoleFilter(e.target.value as RoleFilter))}
          className="h-9 w-auto"
        >
          <option value="all">Todos os papéis</option>
          <option value="ADMINISTRATOR">Administrador</option>
          <option value="PHYSICIAN">Médico</option>
          <option value="NURSE">Enfermeiro</option>
          <option value="RECEPTIONIST">Recepção</option>
        </Select>
        <Button
          tone="brand"
          variant="solid"
          prominent
          onClick={() => {
            setInviteError(null)
            setShowInviteModal(true)
          }}
          className="w-44"
        >
          Convidar membro
        </Button>
      </div>

      {(loadFailure || actionError) && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.7rem] text-red-700"
        >
          {actionError ?? describe(loadFailure, 'Não foi possível carregar a equipe.')}
        </div>
      )}

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
            Membros <span className="text-[0.65rem] font-normal opacity-60">({totalMembers})</span>
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
            Convites <span className="text-[0.65rem] font-normal opacity-60">({invitesQuery.data?.total ?? 0})</span>
          </button>
        </div>
      </div>

      {tab === 'members' ? (
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-tr-xl rounded-b-xl bg-[#F6F8F8]">
          <div className="flex-1 overflow-auto">
            {membersQuery.isPending ? (
              <div className="py-12 text-center text-xs text-(--text-muted)">
                Carregando equipe…
              </div>
            ) : (
              <MembersTable
                members={members}
                openMenuId={openMenuId}
                onToggleMenu={(id) => setOpenMenuId(openMenuId === id ? null : id)}
                onCloseMenu={() => setOpenMenuId(null)}
                onDeactivate={(member: TeamMember) => {
                  setOpenMenuId(null)
                  setConfirmState({
                    type: 'deactivate',
                    id: member.professionalId,
                    name: member.fullName,
                  })
                }}
                onActivate={(member: TeamMember) => {
                  setOpenMenuId(null)
                  setConfirmState({
                    type: 'activate',
                    id: member.professionalId,
                    name: member.fullName,
                  })
                }}
              />
            )}
          </div>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={(size) => applyFilter(() => setItemsPerPage(size))}
          />
        </div>
      ) : (
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-tr-xl rounded-b-xl bg-[#F6F8F8]">
          <div className="flex-1 overflow-auto">
            {invitesQuery.isPending ? (
              <div className="py-12 text-center text-xs text-(--text-muted)">
                Carregando convites…
              </div>
            ) : (
              <InvitesTable
                invites={invites}
                onResend={(invite) =>
                  setConfirmState({
                    type: 'resend-invite',
                    id: invite.id,
                    name: invite.email,
                  })
                }
                onCancel={(invite) =>
                  setConfirmState({
                    type: 'cancel-invite',
                    id: invite.id,
                    name: invite.email,
                  })
                }
              />
            )}
          </div>
        </div>
      )}
      </div>

      <InviteMemberModal
        open={showInviteModal}
        submitting={inviteMutation.isPending}
        error={inviteError}
        onClose={() => setShowInviteModal(false)}
        onSubmit={(data) => inviteMutation.mutate(data)}
      />

      <TeamConfirmModal
        state={confirmState}
        submitting={
          accessMutation.isPending ||
          cancelMutation.isPending ||
          resendMutation.isPending
        }
        onClose={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />
    </SettingsLayout>
  )
}
