import { useMemo } from 'react'
import { Modal } from '@/shared/components'
import { ProtocolEditor } from '@/features/protocols/protocol-editor'
import { MODAL_HEADER_BACKGROUND } from '@/features/scheduling/constants/modal-header'
import type {
  ProtocolStep,
  ProtocolVersion,
} from '@/shared/api/contracts/protocols'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faThumbtack } from '@fortawesome/free-solid-svg-icons'

function noop() {}

interface ProgressionRow {
  step: ProtocolStep
  position: number
  day: number | null
  repeats: boolean
  endsSequence: boolean
}

function buildProgression(steps: ProtocolStep[]): {
  rows: ProgressionRow[]
  orphans: ProtocolStep[]
} {
  const byId = new Map(steps.map((step) => [step.id, step]))
  const rows: ProgressionRow[] = []
  const visited = new Set<string>()
  let current = steps[0]
  let day = 0
  let position = 0

  while (current && !visited.has(current.id)) {
    visited.add(current.id)
    position += 1
    const repeats = current.nextStepId === current.id
    const next = current.nextStepId ? byId.get(current.nextStepId) : undefined
    rows.push({
      step: current,
      position,
      day,
      repeats,
      endsSequence: current.nextStepId === null,
    })
    if (repeats || !next) break
    day += current.intervalDays
    current = next
  }

  return {
    rows,
    orphans: steps.filter((step) => !visited.has(step.id)),
  }
}

interface ProgressionViewerProps {
  open: boolean
  onClose: () => void
  protocolName: string
  version: ProtocolVersion | null
  isDefault: boolean
}

export function ProgressionViewer({
  open,
  onClose,
  protocolName,
  version,
  isDefault,
}: ProgressionViewerProps) {
  const progression = useMemo(
    () =>
      version
        ? buildProgression(version.definition.steps)
        : { rows: [], orphans: [] },
    [version],
  )

  const summary = useMemo(() => {
    const rows = progression.rows
    const buildUp = rows.filter((row) => row.step.phase === 'BUILD_UP').length
    const maintenance = rows.length - buildUp
    const firstMaintenance = rows.find(
      (row) => row.step.phase === 'MAINTENANCE',
    )
    const last = rows[rows.length - 1]
    return {
      buildUp,
      maintenance,
      daysToMaintenance: firstMaintenance?.day ?? null,
      daysToLast: last?.day ?? null,
      plateau: last?.repeats ?? false,
    }
  }, [progression.rows])

  if (!version) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="xl"
      ariaLabel="Visualizar progressão do protocolo"
      headerSlot={
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[0.95rem] font-bold text-(--text)">
              {protocolName}
            </span>
            <span className="shrink-0 text-[0.82rem] font-medium text-(--text-muted)">
              v{version.number}
            </span>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            {isDefault && (
              <span className="inline-flex items-center gap-1 rounded-md bg-[#12333a] px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                <FontAwesomeIcon icon={faThumbtack} style={{ fontSize: 10 }} />
                Padrão para novas prescrições
              </span>
            )}
            <span className="inline-flex items-center rounded-md bg-gray-300 px-2 py-0.5 text-[0.65rem] font-semibold text-gray-800">
              {progression.rows.length}{' '}
              {progression.rows.length === 1 ? 'etapa' : 'etapas'} na sequência
            </span>
          </div>
        </div>
      }
      headerStyle={{
        background: MODAL_HEADER_BACKGROUND,
        borderBottom: 'none',
        paddingTop: '1.4rem',
      }}
    >
      <p className="text-xs leading-relaxed text-(--text-muted)">
        O dia é contado a partir da primeira aplicação, somando o intervalo de
        cada etapa.
        {summary.daysToMaintenance !== null && (
          <> A manutenção começa no dia {summary.daysToMaintenance}.</>
        )}
        {summary.plateau && summary.daysToLast !== null && (
          <>
            {' '}
            A última etapa se repete indefinidamente a partir do dia{' '}
            {summary.daysToLast}.
          </>
        )}
      </p>

      <ProtocolEditor draft={version.definition} readOnly onChange={noop} />

      {progression.orphans.length > 0 && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
          <p className="text-[0.7rem] font-semibold text-amber-800">
            {progression.orphans.length}{' '}
            {progression.orphans.length === 1
              ? 'etapa não é alcançada'
              : 'etapas não são alcançadas'}{' '}
            pelo encadeamento
          </p>
          <p className="mt-1 text-[0.65rem] leading-relaxed text-amber-800">
            {progression.orphans.map((step) => step.label).join(' · ')}. Nenhuma
            etapa anterior aponta para elas, então o motor nunca as recomenda.
          </p>
        </div>
      )}
    </Modal>
  )
}
