import { useSession } from '@/shared/auth/useSession'
import { queryKeys } from '@/shared/api/query-keys'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getNotificationPreferences,
  setNotificationPreference,
  type ServerNotificationKind,
} from '@/shared/api/notifications.api'
import { Switch } from '@/shared/components'

const KIND_LABELS: Record<ServerNotificationKind, { label: string; desc: string }> = {
  PHYSICIAN_REVIEW_REQUESTED: {
    label: 'Avaliação médica solicitada',
    desc: 'Quando a equipe registra conduta pedindo sua avaliação',
  },
  TREATMENT_SUSPENDED: {
    label: 'Tratamento suspenso',
    desc: 'Quando um tratamento sob sua responsabilidade é suspenso por outro profissional',
  },
  EMAIL_CHANGE_REQUEST_PENDING: {
    label: 'Troca de e-mail aguardando aprovação',
    desc: 'Quando alguém pede alteração do e-mail de acesso e falta a decisão da administração',
  },
  EMAIL_CHANGE_REQUEST_DECIDED: {
    label: 'Pedido de troca de e-mail decidido',
    desc: 'Quando um pedido de troca de e-mail de acesso é aprovado ou recusado',
  },
}

const FALLBACK_KIND_LABEL = {
  label: 'Notificação do sistema',
  desc: 'Aviso enviado pela plataforma',
}

export function NotificationPreferencesPanel() {
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const userId = account?.user.id ?? ''
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: queryKeys.notificationPreferences(organizationId, userId),
    enabled: userId !== '',
    queryFn: ({ signal }) => getNotificationPreferences(signal),
  })
  const mutation = useMutation({
    mutationFn: ({ kind, enabled }: { kind: ServerNotificationKind; enabled: boolean }) =>
      setNotificationPreference(kind, enabled),
    onSuccess: (preferences) => {
      queryClient.setQueryData(queryKeys.notificationPreferences(organizationId, userId), preferences)
    },
  })

  if (query.isPending)
    return <p className="text-[0.65rem] text-(--text-muted)">Carregando preferências…</p>

  if (query.isError) return <div role="alert">Não foi possível carregar as preferências. <button onClick={() => void query.refetch()}>Tentar novamente</button></div>
  return (
    <div className="space-y-3">
      {(query.data ?? []).map((preference, index) => {
        const display = KIND_LABELS[preference.kind] ?? FALLBACK_KIND_LABEL
        return (
          <div key={preference.kind}>
            {index > 0 && <div className="border-t border-(--border-custom) mb-3" />}
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold text-(--text)">{display.label}</div>
                <div className="text-[0.65rem] text-(--text-muted)">{display.desc}</div>
              </div>
              <Switch
                checked={preference.enabled}
                disabled={mutation.isPending || query.isFetching}
                onChange={(enabled) =>
                  mutation.mutate({ kind: preference.kind, enabled })
                }
                aria-label={display.label}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}
