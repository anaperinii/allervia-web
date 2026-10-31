import { InviteMemberModal } from '@/features/settings/components/InviteMemberModal'
import { InvitesTable } from '@/features/settings/components/InvitesTable'
import { ManageRolesModal } from '@/features/settings/components/ManageRolesModal'
import { MembersTable } from '@/features/settings/components/MembersTable'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { ChangeAccessEmailModal } from '@/features/settings/components/ChangeAccessEmailModal'
import { ApproveEmailChangeModal } from '@/features/settings/components/ApproveEmailChangeModal'
import { EmailChangeRequestsTable } from '@/features/settings/components/EmailChangeRequestsTable'
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
import type { EmailChangeRequestDto } from '@/shared/api/contracts/email-change'
import type { Invite, TeamMember } from '@/shared/api/contracts/team'
import {
  cancelInvite,
  resendInvite,
  createInvite,
  listInvites,
  listTeamMembers,
  updateMemberAccess,
} from '@/shared/api/team.api'
import { listEmailChangeRequests, rejectEmailChange } from '@/shared/api/email-change.api'
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

  const [deliveryNotice, setDeliveryNotice] = useState('')
  const [invitePage, setInvitePage] = useState(1)
  const [requestsPage, setRequestsPage] = useState(1)
  const [tab, setTab] = useState<'members' | 'invites' | 'requests'>('members')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('active')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [confirmState, setConfirmState] = useState<TeamConfirmState | null>(null)
  const [rolesTarget, setRolesTarget] = useState<TeamMember | null>(null)
  const [changeEmailTarget, setChangeEmailTarget] = useState<TeamMember | null>(null)
  const [approveTarget, setApproveTarget] = useState<EmailChangeRequestDto | null>(null)

  const memberFilters = {
    page: currentPage,
    pageSize: itemsPerPage,
    search: search.trim() || undefined,
    role: roleFilter === 'all' ? undefined : roleFilter,
    isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
  }

  const inviteFilters = { page: invitePage, pageSize: 50, includeExpired: true }
  const requestFilters = { page: requestsPage, pageSize: itemsPerPage }

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

  const emailChangeRequestsQuery = useQuery({
    queryKey: queryKeys.emailChangeRequests(organizationId, requestFilters),
    queryFn: ({ signal }) => listEmailChangeRequests(requestFilters, signal),
    enabled: canManageTeam && organizationId !== '',
  })

  const refreshAll = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['team', organizationId] }),
      queryClient.invalidateQueries({ queryKey: ['invites', organizationId] }),
      queryClient.invalidateQueries({ queryKey: ['email-change-requests', organizationId] }),
    ])
  }

  const accessMutation = useMutation({
    mutationFn: (input: { professionalId: string; isActive: boolean }) =>
      updateMemberAccess(input.professionalId, input.isActive),
    onSuccess: refreshAll,
  })

  const rejectEmailChangeMutation = useMutation({
    mutationFn: (requestId: string) => rejectEmailChange(requestId),
    onSuccess: refreshAll,
  })

  const inviteMutation = useMutation({
    mutationFn: (input: { email: string; fullName: string; role: TeamRole }) =>
      createInvite({
        email: input.email,
        fullName: input.fullName,
        userRole: input.role,
      }),
    onSuccess: async (result) => {
      setDeliveryNotice(result.emailDelivered === true ? 'Convite registrado e e-mail enviado ao servidor SMTP.' : 'Convite registrado; envio do e-mail não confirmado. Use reenviar convite.')
      setShowInviteModal(false)
      await refreshAll()
    },
  })

  const cancelMutation = useMutation({
    mutationFn: (inviteId: string) => cancelInvite(inviteId),
    onSuccess: refreshAll,
  })

  const resendMutation = useMutation({
    mutationFn: (invite: Invite) => resendInvite(invite.id),
    onSuccess: async (result) => {
      setDeliveryNotice(`${result.reissued ? 'Convite reemitido.' : 'Convite reenviado.'} ${result.emailDelivered === true ? 'E-mail enviado ao servidor SMTP.' : 'Envio do e-mail não confirmado.'}`)
      await refreshAll()
    },
  })

  const members = membersQuery.data?.items ?? []
  const invites = invitesQuery.data?.items ?? []
  const emailChangeRequests = emailChangeRequestsQuery.data?.items ?? []
  const totalMembers = membersQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(totalMembers / itemsPerPage))
  const totalRequests = emailChangeRequestsQuery.data?.total ?? 0
  const pendingRequests = emailChangeRequestsQuery.data?.pending ?? 0
  const totalRequestPages = Math.max(1, Math.ceil(totalRequests / itemsPerPage))

  const applyFilter = (apply: () => void) => {
    apply()
    setCurrentPage(1)
  }

  const handleConfirm = () => {
    if (
      !confirmState ||
      accessMutation.isPending ||
      cancelMutation.isPending ||
      resendMutation.isPending ||
      rejectEmailChangeMutation.isPending
    )
      return

    switch (confirmState.type) {
      case 'deactivate':
        if (confirmState.id === account?.professional?.id) { setDeliveryNotice('Não é permitido desativar o próprio acesso.'); return }
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
      case 'reject-email-change':
        rejectEmailChangeMutation.mutate(confirmState.id)
        break
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
      <div className="flex h-full min-h-0 flex-col pl-1.5">
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
          onClick={() => setShowInviteModal(true)}
          className="w-44"
        >
          Convidar membro
        </Button>
      </div>

      {deliveryNotice && <p role="status" className="mb-3">{deliveryNotice}</p>}
      {tab === 'invites' && (invitesQuery.data?.total ?? 0) > 50 && <div><Button disabled={invitePage === 1} onClick={() => setInvitePage(page => page - 1)}>Anterior</Button><span>Página {invitePage}</span><Button disabled={invitePage * 50 >= (invitesQuery.data?.total ?? 0)} onClick={() => setInvitePage(page => page + 1)}>Próxima</Button></div>}
      {loadFailure && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.7rem] text-red-700"
        >
          {describe(loadFailure, 'Não foi possível carregar a equipe.')}
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
              tab === 'members'
                ? 'bg-white text-[#12333a] z-10 shadow-[0_-3px_10px_-3px_rgba(18,51,58,0.10),-5px_0_10px_-5px_rgba(18,51,58,0.10),5px_0_10px_-5px_rgba(18,51,58,0.10)]'
                : 'bg-[#F7F9F9] text-[#8CA1A6] hover:bg-white/70 hover:text-[#4A6469]',
            )}
          >
            {tab === 'members' && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute -right-3 bottom-0 h-3 w-3"
                style={{ background: 'radial-gradient(circle at 100% 0%, transparent 11.5px, #FFFFFF 12.5px)' }}
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
              tab === 'invites'
                ? 'bg-white text-[#12333a] z-10 shadow-[0_-3px_10px_-3px_rgba(18,51,58,0.10),-5px_0_10px_-5px_rgba(18,51,58,0.10),5px_0_10px_-5px_rgba(18,51,58,0.10)]'
                : 'bg-[#F7F9F9] text-[#8CA1A6] hover:bg-white/70 hover:text-[#4A6469]',
            )}
          >
            {tab === 'invites' && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-3 bottom-0 h-3 w-3"
                  style={{ background: 'radial-gradient(circle at 0% 0%, transparent 11.5px, #FFFFFF 12.5px)' }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 bottom-0 h-3 w-3"
                  style={{ background: 'radial-gradient(circle at 100% 0%, transparent 11.5px, #FFFFFF 12.5px)' }}
                />
              </>
            )}
            Convites <span className="text-[0.65rem] font-normal opacity-60">({invitesQuery.data?.total ?? 0})</span>
          </button>
          <button
            role="tab"
            aria-selected={tab === 'requests'}
            onClick={() => setTab('requests')}
            className={cn(
              'relative rounded-t-xl px-5 py-2 text-xs font-semibold transition-colors flex items-center gap-1.5 cursor-pointer',
              tab === 'requests'
                ? 'bg-white text-[#12333a] z-10 shadow-[0_-3px_10px_-3px_rgba(18,51,58,0.10),-5px_0_10px_-5px_rgba(18,51,58,0.10),5px_0_10px_-5px_rgba(18,51,58,0.10)]'
                : 'bg-[#F7F9F9] text-[#8CA1A6] hover:bg-white/70 hover:text-[#4A6469]',
            )}
          >
            {tab === 'requests' && (
              <>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -left-3 bottom-0 h-3 w-3"
                  style={{ background: 'radial-gradient(circle at 0% 0%, transparent 11.5px, #FFFFFF 12.5px)' }}
                />
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute -right-3 bottom-0 h-3 w-3"
                  style={{ background: 'radial-gradient(circle at 100% 0%, transparent 11.5px, #FFFFFF 12.5px)' }}
                />
              </>
            )}
            Pedidos de e-mail <span className="text-[0.65rem] font-normal opacity-60">({totalRequests})</span>
            {pendingRequests > 0 && (
              <span
                className="inline-flex items-center rounded-md border border-amber-300/40 bg-amber-100/40 px-2 py-0.5 text-[0.6rem] font-medium text-amber-700/80"
                title={`${pendingRequests} aguardando aprovação`}
              >
                {pendingRequests} pendente{pendingRequests === 1 ? '' : 's'}
              </span>
            )}
          </button>
        </div>
      </div>

      {tab === 'members' ? (
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-tr-xl rounded-b-xl bg-white border border-[#DDE6E6]">
          <div className="flex-1 overflow-auto">
            {membersQuery.isPending ? (
              <div className="py-12 text-center text-xs text-(--text-muted)">
                Carregando equipe…
              </div>
            ) : (
              <MembersTable
                members={members}
                currentProfessionalId={account?.professional?.id}
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
                onManageRoles={(member: TeamMember) => {
                  setOpenMenuId(null)
                  setRolesTarget(member)
                }}
                onChangeEmail={(member: TeamMember) => {
                  setOpenMenuId(null)
                  setChangeEmailTarget(member)
                }}
              />
            )}
          </div>
          <TablePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />
        </div>
      ) : tab === 'invites' ? (
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-tr-xl rounded-b-xl bg-white border border-[#DDE6E6]">
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
      ) : (
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded-tr-xl rounded-b-xl bg-white border border-[#DDE6E6]">
          <div className="flex-1 overflow-auto">
            {emailChangeRequestsQuery.isPending ? (
              <div className="py-12 text-center text-xs text-(--text-muted)">
                Carregando pedidos…
              </div>
            ) : (
              <EmailChangeRequestsTable
                requests={emailChangeRequests}
                onApprove={(request) => setApproveTarget(request)}
                onReject={(request) =>
                  setConfirmState({
                    type: 'reject-email-change',
                    id: request.id,
                    name: request.professionalName,
                  })
                }
              />
            )}
          </div>
          <TablePagination
            currentPage={requestsPage}
            totalPages={totalRequestPages}
            onPageChange={setRequestsPage}
          />
        </div>
      )}
      </div>

      <InviteMemberModal
        open={showInviteModal}
        submitting={inviteMutation.isPending}
        onClose={() => setShowInviteModal(false)}
        onSubmit={(data) => inviteMutation.mutate(data)}
      />

      <ManageRolesModal
        member={rolesTarget}
        organizationId={organizationId}
        currentProfessionalId={account?.professional?.id}
        onClose={() => setRolesTarget(null)}
        onSaved={refreshAll}
      />

      <ChangeAccessEmailModal
        member={changeEmailTarget}
        onClose={() => setChangeEmailTarget(null)}
        onDispatched={() => void refreshAll()}
      />

      <ApproveEmailChangeModal
        request={approveTarget}
        onClose={() => setApproveTarget(null)}
        onApproved={() => void refreshAll()}
      />

      <TeamConfirmModal
        state={confirmState}
        submitting={
          accessMutation.isPending ||
          cancelMutation.isPending ||
          resendMutation.isPending ||
          rejectEmailChangeMutation.isPending
        }
        onClose={() => setConfirmState(null)}
        onConfirm={handleConfirm}
      />
    </SettingsLayout>
  )
}
