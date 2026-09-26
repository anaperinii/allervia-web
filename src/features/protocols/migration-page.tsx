import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from '@tanstack/react-router'
import { Button, toast } from '@/shared/components'
import { PageHeader, Pill } from '@/shared/components/showcase'
import { useSession } from '@/shared/auth/useSession'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { queryKeys } from '@/shared/api/query-keys'
import {
  createOriginDraft,
  listProtocols,
  readMigrationInventory,
} from '@/shared/api/protocols.api'
import { ApiError } from '@/shared/api/contracts/errors'
import type { MigrationReportRow } from '@/shared/api/contracts/protocols'
import { formatInstantDate } from '@/features/patient/adapters/clinical-presentation'
import { BindLegacyModal } from '@/features/protocols/components/BindLegacyModal'
import { cn } from '@/shared/lib/cn'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faFileMedical, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

const ISSUE_LABELS: Record<string, string> = {
  PROTOCOL_NOT_BOUND: 'Sem prescrição vinculada',
  MULTIPLE_PENDING_DOSES: 'Previsões duplicadas — revisão manual',
  NO_PENDING_DOSE_REQUIRES_REVIEW: 'Sem previsão pendente — revisão manual',
  UNSUPPORTED_ROUTE: 'Via não suportada pela automação (SLIT)',
}

function issueLabel(issue: string): string {
  if (issue.startsWith('UNREPRESENTABLE_VALUE:'))
    return 'Valor legado não representável com exatidão'
  return ISSUE_LABELS[issue] ?? issue
}

function isBindable(row: MigrationReportRow): boolean {
  return (
    row.prescriptionId === null &&
    row.issues.every((issue) => issue === 'PROTOCOL_NOT_BOUND') &&
    row.pendingDoses.length === 1
  )
}

export function MigrationPage() {
  const navigate = useNavigate()
  const canManage = useHasPermission('adjust_protocol')
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const queryClient = useQueryClient()
  const [selectedRow, setSelectedRow] = useState<MigrationReportRow | null>(null)

  useEffect(() => {
    if (!canManage) navigate({ to: '/immunotherapies' })
  }, [canManage, navigate])

  const inventoryQuery = useQuery({
    queryKey: queryKeys.migrationInventory(organizationId),
    queryFn: ({ signal }) => readMigrationInventory(signal),
    enabled: organizationId !== '' && canManage,
  })
  const protocolsQuery = useQuery({
    queryKey: queryKeys.protocols(organizationId),
    queryFn: ({ signal }) => listProtocols(signal),
    enabled: organizationId !== '' && canManage,
  })

  const draftMutation = useMutation({
    mutationFn: () => createOriginDraft(),
    onSuccess: async (protocol) => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.protocols(organizationId),
      })
      toast.success({
        icon: <FontAwesomeIcon icon={faFileMedical} style={{ fontSize: 16 }} />,
        title: 'Rascunho técnico disponível',
        description: (
          <>
            Derivado do inventário, sem aprovação clínica: as transições exigem
            revisão médica antes de qualquer publicação.
            <Link
              to="/protocols"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 mt-2 transition-colors"
            >
              Revisar &quot;{protocol.name}&quot; no catálogo &rarr;
            </Link>
          </>
        ),
        autoDismissMs: 8000,
      })
    },
    onError: (error) => {
      toast.warning({
        icon: <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 16 }} />,
        title: 'Não foi possível gerar o rascunho',
        description: error instanceof ApiError ? error.message : 'Tente novamente.',
      })
    },
  })

  const rows = useMemo(
    () => inventoryQuery.data?.report ?? [],
    [inventoryQuery.data],
  )
  const pendingRows = rows.filter((row) => row.prescriptionId === null)
  const boundRows = rows.filter((row) => row.prescriptionId !== null)

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <PageHeader
        breadcrumb={['Configurações', 'Migração de legados']}
        title="Migração assistida"
        actions={
          <Pill
            active
            icon={faFileMedical}
            onClick={() => draftMutation.mutate()}
            disabled={draftMutation.isPending}
          >
            Gerar rascunho técnico
          </Pill>
        }
      />

      <div className="flex-1 overflow-y-auto space-y-4 px-1 pb-6">
        <div className="flex items-start gap-2 bg-brand/10 border border-brand/25 rounded-lg px-3 py-2.5">
          <FontAwesomeIcon icon={faTriangleExclamation} className="text-brand shrink-0 mt-0.5" style={{ fontSize: 14 }} />
          <p className="text-[0.68rem] text-brand-dark leading-relaxed">
            O inventário é somente leitura. Tratamentos sem prescrição vinculada ficam
            <span className="font-bold"> bloqueados para novos comandos clínicos</span> até a
            vinculação revisada. Valores legados nunca são aproximados: divergência exige
            decisão clínica sobre a versão publicada ou sobre o registro.
          </p>
        </div>

        {inventoryQuery.isPending && (
          <p className="text-xs text-(--text-muted) px-1">Carregando inventário…</p>
        )}
        {inventoryQuery.error && (
          <p role="alert" className="text-xs text-red-700 px-1">
            {inventoryQuery.error instanceof ApiError
              ? inventoryQuery.error.message
              : 'Não foi possível carregar o inventário.'}
          </p>
        )}

        {inventoryQuery.data && (
          <>
            <SectionTitle
              title={`Pendentes de migração (${pendingRows.length})`}
            />
            {pendingRows.length === 0 && (
              <p className="text-xs text-(--text-muted) px-1">
                Nenhum tratamento pendente: todos têm prescrição vinculada.
              </p>
            )}
            <div className="space-y-2">
              {pendingRows.map((row) => (
                <TherapyRow
                  key={row.therapyId}
                  row={row}
                  onBind={isBindable(row) ? () => setSelectedRow(row) : undefined}
                />
              ))}
            </div>

            {boundRows.length > 0 && (
              <>
                <SectionTitle title={`Migrados (${boundRows.length})`} />
                <div className="space-y-2">
                  {boundRows.map((row) => (
                    <TherapyRow key={row.therapyId} row={row} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      <BindLegacyModal
        row={selectedRow}
        protocols={protocolsQuery.data ?? []}
        organizationId={organizationId}
        onClose={() => setSelectedRow(null)}
        onBound={() => setSelectedRow(null)}
      />
    </div>
  )
}

function SectionTitle({ title }: { title: string }) {
  return (
    <div className="text-[0.7rem] font-extrabold uppercase tracking-wider text-(--text-muted) px-1 pt-2">
      {title}
    </div>
  )
}

function TherapyRow({
  row,
  onBind,
}: {
  row: MigrationReportRow
  onBind?: () => void
}) {
  const bound = row.prescriptionId !== null
  const pending = row.pendingDoses[0] ?? null
  return (
    <div className="rounded-xl border border-(--border-custom) bg-white px-4 py-3">
      <div className="flex items-center gap-3 flex-wrap">
        <div className="min-w-0 flex-1">
          <Link
            to="/patient/$patientId"
            params={{ patientId: row.patient.id }}
            search={{ therapy: row.therapyId }}
            className="text-sm font-bold text-(--text) hover:text-brand hover:underline"
          >
            {row.patient.fullName}
          </Link>
          <div className="text-[0.68rem] text-(--text-muted)">
            {row.immunoType} · {row.extract} · início {formatInstantDate(row.inductionStartDate)}
          </div>
        </div>
        {bound ? (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[0.6rem] font-semibold text-emerald-700">
            <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 10 }} />
            Migrado
          </span>
        ) : (
          row.issues.map((issue) => (
            <span
              key={issue}
              className={cn(
                'inline-flex items-center rounded-md px-2 py-0.5 text-[0.6rem] font-semibold border',
                issue === 'PROTOCOL_NOT_BOUND'
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-red-50 border-red-200 text-red-700',
              )}
            >
              {issueLabel(issue)}
            </span>
          ))
        )}
        {onBind && (
          <Button tone="brand" variant="solid" size="sm" onClick={onBind}>
            Revisar e vincular
          </Button>
        )}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
        <Cell
          label="Meta legada"
          value={`1:${Number(row.target.concentration).toLocaleString('pt-BR')} - ${(row.target.volume ?? '—').replace('.', ',')}ml`}
        />
        <Cell
          label="Previsão pendente"
          value={
            pending
              ? `1:${Number(pending.concentration).toLocaleString('pt-BR')} - ${pending.volume.replace('.', ',')}ml · ${pending.intervalDays}d · ${formatInstantDate(pending.scheduledAt)}`
              : row.pendingDoses.length > 1
                ? `${row.pendingDoses.length} previsões pendentes`
                : 'Nenhuma'
          }
        />
        <Cell
          label="Doses registradas"
          value={`${row.decimals.length} (${row.decimals.filter((d) => d.historicalRecordUnchanged).length} históricas intocáveis)`}
        />
      </div>
    </div>
  )
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white px-3 py-2">
      <div className="text-[0.6rem] font-semibold text-(--text-muted) mb-0.5">{label}</div>
      <div className="text-[0.72rem] font-medium text-(--text)">{value}</div>
    </div>
  )
}
