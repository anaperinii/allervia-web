import { collectPages } from '@/shared/api/pagination'
import { useQuery } from '@tanstack/react-query'
import { listTeamMembers } from '@/shared/api/team.api'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import type { TeamMember } from '@/shared/api/contracts/team'

const DIRECTORY_PAGE_SIZE = 100

export function useProfessionalDirectory(role?: 'PHYSICIAN' | 'NURSE') {
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const filters = { pageSize: DIRECTORY_PAGE_SIZE, isActive: true, role }

  const query = useQuery({
    queryKey: queryKeys.team(organizationId, { directory: true, ...filters }),
    queryFn: async ({ signal }) => {
      const result = await collectPages((page) => listTeamMembers({ ...filters, page }, signal), { signal, maxPages: 50, getId: (member) => member.userId })
      if (!result.complete) throw new Error('Diretório incompleto: refine a consulta de profissionais.')
      return result
    },
    enabled: organizationId !== '',
    staleTime: 5 * 60_000,
  })

  const members: TeamMember[] = query.data?.items ?? []

  return {
    members,
    isLoading: query.isPending,
    error: query.error,
  }
}
