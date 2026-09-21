import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { listAuditLogs } from '@/shared/api/clinical.api'
import type { AuditLogEntry } from '@/shared/api/contracts/clinical'
import { ApiError } from '@/shared/api/contracts/errors'
import { useSession } from '@/shared/auth/useSession'
import { Button } from '@/shared/components'
import { formatInstantDate } from '@/features/patient/adapters/clinical-presentation'

const PAGE = 25

/**
 * Auditoria administrativa da organização (capacidade auditLogs:read).
 * Paginação por cursor; a trilha clínica por tratamento tem leitura própria no
 * prontuário e não passa por aqui.
 */
export function AuditTrailPanel() {
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const [pages, setPages] = useState<AuditLogEntry[][]>([])
  const [cursor, setCursor] = useState<string | undefined>(undefined)

  const query = useQuery({
    queryKey: ['audit-logs', organizationId, cursor ?? 'first'],
    queryFn: ({ signal }) => listAuditLogs({ limit: PAGE, cursor }, signal),
    enabled: organizationId !== '',
    staleTime: 30_000,
  })

  const current = query.data ?? []
  const entries = [...pages.flat(), ...current]
  const hasMore = current.length === PAGE

  return (
    <div className="space-y-2">
      {query.error && (
        <p role="alert" className="text-[0.7rem] text-red-700">
          {query.error instanceof ApiError
            ? query.error.message
            : 'Não foi possível carregar a auditoria.'}
        </p>
      )}
      {query.isPending && <p className="text-xs text-(--text-muted)">Carregando…</p>}
      {!query.isPending && entries.length === 0 && !query.error && (
        <p className="text-xs text-(--text-muted)">Nenhum registro de auditoria.</p>
      )}
      <div className="max-h-80 overflow-y-auto space-y-1.5 pr-1">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="rounded-lg border border-(--border-custom) bg-white px-3 py-2"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.68rem] font-bold text-(--text)">{entry.action}</span>
              <span className="text-[0.6rem] text-(--text-muted) shrink-0">
                {formatInstantDate(entry.timestamp)}
              </span>
            </div>
            <div className="text-[0.62rem] text-(--text-muted)">
              {entry.entityType} · {entry.entityId}
            </div>
          </div>
        ))}
      </div>
      {hasMore && (
        <Button
          variant="outline"
          size="sm"
          disabled={query.isPending}
          onClick={() => {
            setPages((previous) => [...previous, current])
            setCursor(current[current.length - 1]?.id)
          }}
        >
          Carregar mais
        </Button>
      )}
    </div>
  )
}
