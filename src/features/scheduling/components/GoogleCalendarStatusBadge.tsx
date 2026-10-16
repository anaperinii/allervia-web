import { StatusBadge } from '@/features/settings/components/GoogleCalendarRow'
import { GoogleCalendarLogo } from '@/features/settings/components/GoogleCalendarLogo'
import { useCalendarConnection } from '@/features/settings/hooks/useCalendarConnection'

export function GoogleCalendarStatusBadge() {
  const { canManage, isConnected, isBroken, isLoading } = useCalendarConnection()

  if (!canManage) return null

  const statusBadge = isLoading ? (
    <StatusBadge tone="warn" label="Carregando…" />
  ) : isBroken ? (
    <StatusBadge tone="warn" label="Reconexão necessária" />
  ) : isConnected ? (
    <StatusBadge tone="ok" label="Conectado" />
  ) : (
    <StatusBadge tone="danger" label="Desconectado" />
  )

  return (
    <div className="flex items-center gap-1.5 text-[0.7rem] font-medium text-(--text-muted)">
      <GoogleCalendarLogo size={14} />
      Google Agenda
      {statusBadge}
    </div>
  )
}
