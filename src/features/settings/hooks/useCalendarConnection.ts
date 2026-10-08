import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  disconnectCalendar,
  getCalendarConnection,
  startCalendarAuthorization,
} from '@/shared/api/integrations.api'
import { queryKeys } from '@/shared/api/query-keys'
import { useHasPermission } from '@/shared/stores/useUserStore'
import type { CalendarConnectionDetails } from '@/shared/api/contracts/integrations'

export function useCalendarConnection() {
  const canManage = useHasPermission('manage_calendar_connection')
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: queryKeys.calendarConnection(),
    queryFn: ({ signal }) => getCalendarConnection(signal),
    enabled: canManage,
    staleTime: 30_000,
  })

  const connect = useMutation({
    mutationFn: startCalendarAuthorization,
    onSuccess: ({ authorizationUrl }) => {
      window.location.assign(authorizationUrl)
    },
  })

  const disconnect = useMutation({
    mutationFn: (removeEvents: boolean) => disconnectCalendar(removeEvents),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.calendarConnection(),
      })
    },
  })

  const connection = query.data?.connected
    ? (query.data as CalendarConnectionDetails)
    : null

  return {
    canManage,
    connection,
    isConnected: connection !== null,
    isBroken: connection?.status === 'BROKEN',
    isLoading: query.isPending && canManage,
    error: query.error,
    connect,
    disconnect,
  }
}
