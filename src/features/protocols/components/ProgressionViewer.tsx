import { useMemo } from 'react'
import { Modal } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import type {
  ProtocolStep,
  ProtocolVersion,
} from '@/shared/api/contracts/protocols'

const PHASE_VIEW = {
  BUILD_UP: {
    label: 'Indução',
    className: 'bg-sky-50 text-sky-700 border-sky-200',
  },
  MAINTENANCE: {
    label: 'Manutenção',
    className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
} as const

interface ProgressionRow {
  step: ProtocolStep
  position: number
  day: number | null
  repeats: boolean
  endsSequence: boolean
}

function dilution(value: string): string {
  const parsed = Number(value)
  return Number.isFinite(parsed)
    ? `1:${parsed.toLocaleString('pt-BR')}`
    : `1:${value}`
}

function volume(value: string): string {
  return `${value.replace('.', ',')} mL`
}

function cadence(days: number): string {
  if (days === 7) return '7 dias · semanal'
  if (days === 14) return '14 dias · quinzenal'
  if (days > 0 && days % 7 === 0) return `${days} dias · ${days / 7} semanas`
  return `${days} dias`
}

/** Percorre o encadeamento real (nextStepId), não a ordem do array. */
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
      title={`${protocolName} · v${version.number}`}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[0.65rem] font-semibold text-(--text-muted)">
          {progression.rows.length}{' '}
          {progression.rows.length === 1 ? 'etapa' : 'etapas'} na sequência
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-semibold border bg-sky-50 text-sky-700 border-sky-200">
          {summary.buildUp} de indução
        </span>
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-semibold border bg-emerald-50 text-emerald-700 border-emerald-200">
          {summary.maintenance} de manutenção
        </span>
        {isDefault && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-semibold border bg-brand-50 text-brand-dark border-brand/30">
            Padrão para novas prescrições
          </span>
        )}
      </div>

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

      <ol className="flex flex-col gap-1.5">
        {progression.rows.map((row, index) => {
          const phase = PHASE_VIEW[row.step.phase]
          return (
            <li
              key={row.step.id}
              className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg border border-(--border-custom) bg-white px-3 py-2 animate-in fade-in-0 slide-in-from-bottom-1 fill-mode-backwards"
              style={{ animationDelay: `${Math.min(index * 25, 400)}ms` }}
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-gray-100 text-[0.65rem] font-bold text-(--text-muted)">
                {row.position}
              </span>
              <span className="min-w-36 text-xs font-semibold text-(--text)">
                {row.step.label}
              </span>
              <span className="text-xs text-(--text)">
                {dilution(row.step.concentration)}
              </span>
              <span className="text-xs text-(--text)">
                {volume(row.step.volume)}
              </span>
              <span className="text-[0.65rem] text-(--text-muted)">
                {cadence(row.step.intervalDays)}
              </span>
              <span className="text-[0.65rem] text-(--text-muted)">
                dia {row.day}
              </span>
              <span
                className={cn(
                  'ml-auto inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-semibold border',
                  phase.className,
                )}
              >
                {phase.label}
              </span>
              {row.repeats && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-semibold border bg-amber-50 text-amber-700 border-amber-200">
                  Repete
                </span>
              )}
              {row.endsSequence && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[0.65rem] font-semibold border bg-slate-100 text-slate-600 border-slate-200">
                  Fim da sequência
                </span>
              )}
            </li>
          )
        })}
      </ol>

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
