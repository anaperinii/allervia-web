import { Button } from '@/shared/components'
import { GoogleCalendarLogo } from '@/features/settings/components/GoogleCalendarLogo'
import { MediaRow } from '@/features/settings/components/MediaRow'
import { useCalendarConnection } from '@/features/settings/hooks/useCalendarConnection'
import { ApiError } from '@/shared/api/contracts/errors'

export function StatusBadge({ tone, label }: { tone: 'ok' | 'warn' | 'danger'; label: string }) {
  const palette =
    tone === 'ok'
      ? 'text-green-700 bg-green-50 border-green-200'
      : tone === 'danger'
        ? 'text-rose-700 bg-rose-50 border-rose-200'
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
        leading={
          <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 bg-brand-50">
            <GoogleCalendarLogo size={18} />
          </div>
        }
        title={
          <span className="flex items-center gap-2">
            Google Agenda
            <StatusBadge tone="warn" label="Sem permissão" />
          </span>
        }
        description="Apenas profissionais com agenda própria podem conectar uma conta Google."
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

  const statusBadge = isLoading ? (
    <StatusBadge tone="warn" label="Carregando…" />
  ) : unavailable ? (
    <StatusBadge tone="warn" label="Indisponível" />
  ) : isBroken ? (
    <StatusBadge tone="warn" label="Reconexão necessária" />
  ) : isConnected ? (
    (connection?.pendingJobs ?? 0) > 0 ? (
      <StatusBadge tone="warn" label="Sincronização pendente" />
    ) : (
      <StatusBadge tone="ok" label="Conectado" />
    )
  ) : (
    <StatusBadge tone="danger" label="Desconectado" />
  )

  return (
    <div>
      <MediaRow
        leading={
          <div className="flex h-8 w-8 items-center justify-center rounded-lg shrink-0 bg-brand-50">
            <GoogleCalendarLogo size={18} />
          </div>
        }
        title={
          <span className="flex items-center gap-2">
            Google Agenda
            {statusBadge}
          </span>
        }
        description={unavailable ? 'Integração indisponível: credenciais do Google não configuradas no servidor.' : description}
        trailing={
          isLoading || unavailable ? null : isBroken ? (
            <Button
              tone="brand"
              variant="solid"
              disabled={connect.isPending}
              onClick={() => connect.mutate()}
            >
              Reconectar
            </Button>
          ) : isConnected ? (
            <Button
              variant="outline"
              disabled={disconnect.isPending}
              onClick={() => disconnect.mutate(false)}
            >
              Desconectar
            </Button>
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
