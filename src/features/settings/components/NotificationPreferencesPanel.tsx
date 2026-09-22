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
}

/** Preferências persistidas por usuário; ausência de registro = habilitado. */
export function NotificationPreferencesPanel() {
  const queryClient = useQueryClient()
  const query = useQuery({
    queryKey: ['notifications', 'preferences'],
    queryFn: ({ signal }) => getNotificationPreferences(signal),
  })
  const mutation = useMutation({
    mutationFn: ({ kind, enabled }: { kind: ServerNotificationKind; enabled: boolean }) =>
      setNotificationPreference(kind, enabled),
    onSuccess: (preferences) => {
      queryClient.setQueryData(['notifications', 'preferences'], preferences)
    },
  })

  if (query.isPending)
    return <p className="text-[0.65rem] text-(--text-muted)">Carregando preferências…</p>

  return (
    <div className="space-y-3">
      {(query.data ?? []).map((preference, index) => {
        const display = KIND_LABELS[preference.kind]
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
