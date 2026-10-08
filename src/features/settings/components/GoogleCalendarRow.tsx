import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendar } from '@fortawesome/free-solid-svg-icons'
import { Button } from '@/shared/components'
import { MediaRow } from '@/features/settings/components/MediaRow'
import { useCalendarConnection } from '@/features/settings/hooks/useCalendarConnection'
import { ApiError } from '@/shared/api/contracts/errors'

function StatusBadge({ tone, label }: { tone: 'ok' | 'warn'; label: string }) {
  const palette =
    tone === 'ok'
      ? 'text-teal-700 bg-teal-50 border-teal-200'
      : 'text-amber-700 bg-amber-50 border-amber-200'
  return (
    <span
      className={`text-[0.6rem] font-semibold ${palette} border px-2 py-0.5 rounded-full shrink-0`}
    >
      {label}
    </span>
  )
}

function formatMoment(iso: string | null): string {
  if (!iso) return 'nunca'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return 'nunca'
  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function GoogleCalendarRow() {
  const {
    canManage,
    connection,
    isConnected,
    isBroken,
    isLoading,
    error,
    connect,
    disconnect,
  } = useCalendarConnection()

  if (!canManage) {
    return (
      <MediaRow
        icon={<FontAwesomeIcon icon={faCalendar} style={{ fontSize: 14 }} />}
        title="Google Agenda"
        description="Apenas profissionais com agenda própria podem conectar uma conta Google."
        trailing={<StatusBadge tone="warn" label="Sem permissão" />}
      />
    )
  }

  const unavailable =
    error instanceof ApiError && error.code === 'GOOGLE_TOKEN_KEY_UNAVAILABLE'
  const actionError = connect.error ?? disconnect.error
  const actionMessage =
    actionError instanceof ApiError ? actionError.message : null

  const description = isBroken
    ? `Conexão revogada no Google (${connection?.googleAccountEmail}). Reconecte para retomar a sincronização.`
    : isConnected
      ? `Conectado como ${connection?.googleAccountEmail}. Última sincronização: ${formatMoment(connection?.lastIncrementalSyncAt ?? null)}.`
      : 'Conecte sua conta Google para que os compromissos da sua agenda apareçam no Google Agenda.'

  return (
    <div>
      <MediaRow
        icon={<FontAwesomeIcon icon={faCalendar} style={{ fontSize: 14 }} />}
        title="Google Agenda"
        description={unavailable ? 'Integração indisponível: credenciais do Google não configuradas no servidor.' : description}
        trailing={
          isLoading ? (
            <StatusBadge tone="warn" label="Carregando…" />
          ) : unavailable ? (
            <StatusBadge tone="warn" label="Indisponível" />
          ) : isBroken ? (
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge tone="warn" label="Reconexão necessária" />
              <Button
                tone="brand"
                variant="solid"
                disabled={connect.isPending}
                onClick={() => connect.mutate()}
              >
                Reconectar
              </Button>
            </div>
          ) : isConnected ? (
            <div className="flex items-center gap-2 shrink-0">
              <StatusBadge tone="ok" label="Conectado" />
              <Button
                variant="outline"
                disabled={disconnect.isPending}
                onClick={() => disconnect.mutate(false)}
              >
                Desconectar
              </Button>
            </div>
          ) : (
            <Button
              tone="brand"
              variant="solid"
              disabled={connect.isPending}
              onClick={() => connect.mutate()}
            >
              Conectar
            </Button>
          )
        }
      />
      {isConnected && connection && connection.deadLetteredJobs > 0 && (
        <p role="alert" className="mt-1 text-[0.6rem] text-amber-700">
          {connection.deadLetteredJobs} sincronização(ões) falharam de forma
          definitiva. Reconecte a conta ou fale com o suporte.
        </p>
      )}
      {actionMessage && (
        <p role="alert" className="mt-1 text-[0.6rem] text-red-700">
          {actionMessage}
        </p>
      )}
    </div>
  )
}
