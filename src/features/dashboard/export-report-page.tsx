import { useEffect, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { exportClinicalDoses } from '@/shared/api/clinical.api'
import type { ClinicalExportRow, TherapyStatus } from '@/shared/api/contracts/clinical'
import { ApiError } from '@/shared/api/contracts/errors'
import { exportClinicalDatasetCsv } from '@/features/patient/exporters'
import { downloadFile } from '@/shared/lib/file-download'
import { Button, FieldLabel, Modal, Select, TextArea, toast } from '@/shared/components'
import { PageHeader, Pill } from '@/shared/components/showcase'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleCheck, faCircleInfo, faDownload } from '@fortawesome/free-solid-svg-icons'

const PAGE_SIZE = 100
const MAX_PAGES = 20

type ExportFormat = 'csv' | 'json'

const STATUS_OPTIONS: { value: '' | TherapyStatus; label: string }[] = [
  { value: '', label: 'Todos os tratamentos' },
  { value: 'IN_PROGRESS', label: 'Em andamento' },
  { value: 'SUSPENDED', label: 'Suspensos' },
  { value: 'COMPLETED', label: 'Concluídos' },
]

export function ExportReportPage() {
  const navigate = useNavigate()
  const canViewDashboard = useHasPermission('view_dashboard')
  useEffect(() => {
    if (!canViewDashboard) navigate({ to: '/immunotherapies' })
  }, [canViewDashboard, navigate])

  const [format, setFormat] = useState<ExportFormat>('csv')
  const [status, setStatus] = useState<'' | TherapyStatus>('')
  const [justification, setJustification] = useState('')
  const [consent, setConsent] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [progress, setProgress] = useState<string | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  const exportDisabled = !consent || !justification.trim() || progress !== null

  async function runExport() {
    setFailure(null)
    const asOf = new Date().toISOString()
    const rows: ClinicalExportRow[] = []
    let total = 0
    try {
      for (let page = 1; page <= MAX_PAGES; page++) {
        setProgress(`Buscando página ${page}…`)
        const result = await exportClinicalDoses({
          asOf,
          page,
          pageSize: PAGE_SIZE,
          ...(status ? { status } : {}),
        })
        rows.push(...result.items)
        total = result.total
        if (rows.length >= total) break
      }
      if (rows.length < total) {
        setFailure(
          `O conjunto tem ${total} linhas e o limite do navegador é ${MAX_PAGES * PAGE_SIZE}. Exportado parcialmente até a linha ${rows.length}; volumes maiores exigem o job de exportação (pendência declarada).`,
        )
      }
      if (format === 'csv') {
        exportClinicalDatasetCsv(rows, asOf)
      } else {
        downloadFile(
          JSON.stringify({ asOf, total: rows.length, rows }, null, 2),
          `allervia_export_${asOf.replace(/[:.]/g, '-')}.json`,
          'application/json',
        )
      }
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Exportação gerada',
        description: `Corte temporal ${asOf}; ${rows.length} linha(s). A solicitação foi registrada na auditoria do servidor.`,
        autoDismissMs: 8000,
      })
    } catch (error) {
      setFailure(
        error instanceof ApiError ? error.message : 'Não foi possível gerar a exportação.',
      )
    } finally {
      setProgress(null)
    }
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-hidden pt-0">
      <PageHeader
        breadcrumb={['Painel de Métricas']}
        title="Exportar Relatório"
        actions={
          <div className="flex flex-col items-end gap-1">
            <Pill
              icon={faDownload}
              active
              onClick={() => !exportDisabled && setShowConfirm(true)}
              disabled={exportDisabled}
              className={exportDisabled ? 'opacity-50 cursor-not-allowed' : undefined}
            >
              Exportar {format.toUpperCase()}
            </Pill>
            {!consent && (
              <span className="text-[0.68rem] font-medium" style={{ color: '#E0453C' }}>
                Aceite a declaração LGPD para habilitar a exportação
              </span>
            )}
          </div>
        }
      />

      <div className="flex-1 overflow-y-auto max-w-2xl space-y-4 px-1 pb-8">
        <div className="flex items-start gap-2 bg-brand/10 border border-brand/25 rounded-lg px-3 py-2.5">
          <FontAwesomeIcon icon={faCircleInfo} className="text-brand shrink-0 mt-0.5" style={{ fontSize: 14 }} />
          <p className="text-[0.68rem] text-brand-dark leading-relaxed">
            O arquivo descreve o conjunto clínico persistido no instante da geração
            (corte temporal explícito), com previsto e realizado separados, versão
            fixada e fuso da prescrição em cada linha. Cada geração fica registrada
            na auditoria do servidor com autor, filtros e corte.
          </p>
        </div>

        <div className="rounded-xl border border-(--border-custom) bg-white px-4 py-3 space-y-3">
          <FieldLabel label="Formato">
            <Select value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)}>
              <option value="csv">CSV (com proteção de células-fórmula)</option>
              <option value="json">JSON estruturado</option>
            </Select>
          </FieldLabel>
          <FieldLabel label="Filtro por situação do tratamento">
            <Select value={status} onChange={(e) => setStatus(e.target.value as '' | TherapyStatus)}>
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </Select>
          </FieldLabel>
          <FieldLabel label="Justificativa" required>
            <TextArea
              rows={2}
              placeholder="Motivo desta exportação (LGPD)"
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
            />
          </FieldLabel>
          <label className="flex items-start gap-2 text-[0.7rem] text-(--text) cursor-pointer">
            <input
              type="checkbox"
              checked={consent}
              onChange={(e) => setConsent(e.target.checked)}
              className="mt-0.5"
            />
            Declaro ciência da LGPD: os dados exportados permanecem sob
            responsabilidade da organização e desta solicitação registrada.
          </label>
        </div>

        {progress && <p className="text-xs text-(--text-muted)">{progress}</p>}
        {failure && <p role="alert" className="text-[0.72rem] text-amber-700 leading-relaxed">{failure}</p>}
      </div>

      <Modal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        title="Confirmar exportação"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setShowConfirm(false)}>Cancelar</Button>
            <Button
              tone="brand"
              variant="solid"
              onClick={() => { setShowConfirm(false); void runExport() }}
            >
              Confirmar e exportar
            </Button>
          </>
        }
      >
        <p className="text-[0.7rem] text-(--text-muted) leading-relaxed">
          A geração define o corte temporal e registra a solicitação na auditoria do
          servidor com autor e filtros. Formato: {format.toUpperCase()}
          {status ? ` · Filtro: ${STATUS_OPTIONS.find((o) => o.value === status)?.label}` : ''}.
        </p>
      </Modal>
    </div>
  )
}
