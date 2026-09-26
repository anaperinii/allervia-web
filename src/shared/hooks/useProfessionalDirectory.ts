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
    queryFn: ({ signal }) => listTeamMembers(filters, signal),
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
