import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button, Modal, Switch } from '@/shared/components'
import {
  ROLE_BADGES,
  ROLE_DESCRIPTIONS,
  type TeamRole,
} from '@/features/settings/constants/team-roles'
import { queryKeys } from '@/shared/api/query-keys'
import { ApiError } from '@/shared/api/contracts/errors'
import type { ProfessionalRoleGrant, TeamMember } from '@/shared/api/contracts/team'
import { grantRole, listProfessionalRoles, revokeRole } from '@/shared/api/team.api'

import { faUserGear } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const ALL_ROLES = Object.keys(ROLE_BADGES) as TeamRole[]

interface ManageRolesModalProps {
  member: TeamMember | null
  organizationId: string
  /** Profissional da sessão: remover o próprio papel de Administrador merece aviso. */
  currentProfessionalId?: string
  onClose: () => void
  onSaved: () => Promise<void>
}

export function ManageRolesModal({
  member,
  organizationId,
  currentProfessionalId,
  onClose,
  onSaved,
}: ManageRolesModalProps) {
  const open = member !== null

  const grantsQuery = useQuery({
    queryKey: queryKeys.memberRoles(organizationId, member?.professionalId ?? ''),
    queryFn: ({ signal }) => listProfessionalRoles(member!.professionalId, signal),
    enabled: open && organizationId !== '',
  })

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Gerenciar papéis"
      icon={<FontAwesomeIcon icon={faUserGear} style={{ fontSize: 16 }} />}
    >
      {member && grantsQuery.isPending && (
        <p className="text-xs text-(--text-muted)">Carregando papéis…</p>
      )}
      {member && grantsQuery.error && (
        <p role="alert" className="text-xs text-red-700">
          {grantsQuery.error instanceof ApiError
            ? grantsQuery.error.message
            : 'Não foi possível carregar os papéis deste membro.'}
        </p>
      )}
      {member && grantsQuery.data && (
        <RolesForm
          key={member.professionalId}
          member={member}
          grants={grantsQuery.data}
          isSelf={member.professionalId === currentProfessionalId}
          onClose={onClose}
          onSaved={onSaved}
        />
      )}
    </Modal>
  )
}

function RolesForm({
  member,
  grants,
  isSelf,
  onClose,
  onSaved,
}: {
  member: TeamMember
  grants: ProfessionalRoleGrant[]
  isSelf: boolean
  onClose: () => void
  onSaved: () => Promise<void>
}) {
  const active = grants.filter((grant) => grant.revokedAt === null)
  const grantIdByRole = new Map(active.map((grant) => [grant.role, grant.id]))

  const [selected, setSelected] = useState<Set<TeamRole>>(
    () => new Set(active.map((grant) => grant.role)),
  )
  const [failure, setFailure] = useState<string | null>(null)

  const toGrant = ALL_ROLES.filter(
    (role) => selected.has(role) && !grantIdByRole.has(role),
  )
  const toRevoke = ALL_ROLES.filter(
    (role) => !selected.has(role) && grantIdByRole.has(role),
  )
  const dirty = toGrant.length > 0 || toRevoke.length > 0
  const removesOwnAdmin = isSelf && toRevoke.includes('ADMINISTRATOR')

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Concede antes de revogar: se algo falhar no meio, o membro não fica
      // momentaneamente sem papel algum.
      for (const role of toGrant) {
        await grantRole({ professionalId: member.professionalId, name: role })
      }
      for (const role of toRevoke) {
        await revokeRole(grantIdByRole.get(role)!)
      }
    },
    onSuccess: async () => {
      setFailure(null)
      await onSaved()
      onClose()
    },
    onError: (error) =>
      setFailure(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível salvar os papéis. As mudanças já aplicadas permanecem.',
      ),
  })

  const toggle = (role: TeamRole, checked: boolean) => {
    setSelected((current) => {
      const next = new Set(current)
      if (checked) next.add(role)
      else next.delete(role)
      return next
    })
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs text-(--text-muted)">
        Papéis de{' '}
        <span className="font-semibold text-(--text)">{member.fullName}</span>.
        Cada papel soma as suas permissões às dos demais.
      </p>

      <div className="flex flex-col gap-2">
        {ALL_ROLES.map((role) => (
          <div
            key={role}
            className="flex items-start justify-between gap-3 rounded-xl border border-(--border-custom) bg-white px-3 py-2.5"
          >
            <div className="min-w-0">
              <div className="text-xs font-semibold text-(--text)">
                {ROLE_BADGES[role].label}
              </div>
              <div className="mt-0.5 text-[0.65rem] leading-relaxed text-(--text-muted)">
                {ROLE_DESCRIPTIONS[role]}
              </div>
            </div>
            <Switch
              checked={selected.has(role)}
              disabled={saveMutation.isPending}
              onChange={(checked) => toggle(role, checked)}
              aria-label={ROLE_BADGES[role].label}
            />
          </div>
        ))}
      </div>

      {removesOwnAdmin && (
        <p
          role="alert"
          className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[0.7rem] leading-relaxed text-amber-800"
        >
          Você está removendo o seu próprio papel de Administrador. Ao salvar,
          você perde o acesso a esta tela e não conseguirá desfazer sozinho.
        </p>
      )}

      {failure && (
        <p role="alert" className="text-[0.7rem] text-red-700">
          {failure}
        </p>
      )}

      <div className="flex items-center justify-end gap-2 pt-1">
        <Button variant="outline" size="sm" onClick={onClose}>
          Cancelar
        </Button>
        <Button
          tone="brand"
          variant="solid"
          size="sm"
          disabled={!dirty || saveMutation.isPending}
          onClick={() => saveMutation.mutate()}
        >
          {saveMutation.isPending ? 'Salvando…' : 'Salvar papéis'}
        </Button>
      </div>
    </div>
  )
}
