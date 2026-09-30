import { cn } from '@/shared/lib/cn'
import {
  cadence,
  chainEndingLabel,
  dilution,
  projectDate,
  volume,
  type FlowChain,
  type FlowNode,
} from '@/features/protocols/lab/flow-graph'

export type VerdictState = 'checking' | 'match' | 'mismatch' | 'end' | 'error'

export interface Verdict {
  state: VerdictState
  detail?: string
}

/** Etapas por fileira do mapa antes da trilha dobrar para a fileira seguinte. */
const DEFAULT_PER_ROW = 5

const CARD_W = 128
const CARD_H = 116
const GAP_X = 58
const GAP_Y = 68
/** Braço da Bézier que faz o laço lateral quando a trilha troca de fileira. */
const CURVE_ARM = 96

const TRACK_HALO = '#e6edf2'
const TRACK_PENDING = '#c9d5de'
const TRACK_DONE = '#257E8C'

const PHASE_VIEW = {
  BUILD_UP: {
    label: 'Indução',
    short: 'Indução',
    bar: 'bg-sky-400',
    ring: 'border-sky-200',
    text: 'text-sky-700',
  },
  MAINTENANCE: {
    label: 'Manutenção',
    short: 'Manut.',
    bar: 'bg-emerald-400',
    ring: 'border-emerald-200',
    text: 'text-emerald-700',
  },
} as const

const VERDICT_VIEW: Record<
  VerdictState,
  { label: string; dot: string; text: string }
> = {
  checking: { label: 'Verificando', dot: 'bg-slate-300', text: 'text-slate-500' },
  match: { label: 'Confere', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  mismatch: { label: 'Diverge', dot: 'bg-red-500', text: 'text-red-700' },
  end: { label: 'Sem sucessora', dot: 'bg-slate-400', text: 'text-slate-500' },
  error: { label: 'Não resolvido', dot: 'bg-amber-500', text: 'text-amber-700' },
}

const MAP_SURFACE =
  'bg-[radial-gradient(circle,rgba(18,51,58,0.10)_1px,transparent_1px)] [background-size:18px_18px]'

interface FlowDiagramProps {
  chains: FlowChain[]
  activeStepId: string | null
  visited: Set<string>
  selectedStepId: string | null
  verdicts: Map<string, Verdict>
  startDate: string
  timeZone: string
  showDates: boolean
  onSelectStep: (stepId: string) => void
  /** Quantas etapas cabem por fileira antes da trilha dobrar. */
  perRow?: number
}

export function FlowDiagram({
  chains,
  activeStepId,
  visited,
  selectedStepId,
  verdicts,
  startDate,
  timeZone,
  showDates,
  onSelectStep,
  perRow = DEFAULT_PER_ROW,
}: FlowDiagramProps) {
  return (
    <div className="flex flex-col gap-4">
      {chains.map((chain) => (
        <section
          key={chain.id}
          className={cn(
            'overflow-hidden rounded-2xl border bg-white',
            chain.kind === 'main'
              ? 'border-(--border-custom)'
              : 'border-dashed border-amber-200',
          )}
        >
          <header className="flex flex-wrap items-center gap-2 border-b border-(--border-custom) bg-gray-50/50 px-4 py-2.5">
            <h3 className="text-xs font-bold text-(--text)">
              {chain.kind === 'main' ? 'Trilha principal' : 'Sub-rota'}
            </h3>
            <span className="text-[0.65rem] text-(--text-muted)">
              {chain.nodes.length}{' '}
              {chain.nodes.length === 1 ? 'etapa' : 'etapas'} · {chain.totalDays}{' '}
              {chain.totalDays === 1 ? 'dia' : 'dias'}
            </span>
            <span className="ml-auto inline-flex items-center rounded-md border border-slate-200 bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-slate-600">
              {chainEndingLabel(chain.ending)}
            </span>
          </header>

          {chain.kind === 'branch' && (
            <p className="border-b border-(--border-custom) bg-amber-50/60 px-4 py-2 text-[0.65rem] leading-relaxed text-amber-800">
              Nenhuma etapa da trilha principal aponta para esta sequência: o
              motor nunca a recomenda sozinho. Ela só é alcançada se a prescrição
              começar dentro dela.
            </p>
          )}

          <div className={cn('overflow-x-auto py-6 pl-16 pr-8', MAP_SURFACE)}>
            <TrailMap
              chain={chain}
              activeStepId={activeStepId}
              visited={visited}
              selectedStepId={selectedStepId}
              verdicts={verdicts}
              startDate={startDate}
              timeZone={timeZone}
              showDates={showDates}
              onSelectStep={onSelectStep}
              perRow={perRow}
            />
          </div>
        </section>
      ))}
    </div>
  )
}

interface TrailMapProps extends Omit<FlowDiagramProps, 'chains'> {
  chain: FlowChain
}

interface Placed {
  node: FlowNode
  /** Centro do card, em coordenadas do mapa. */
  cx: number
  cy: number
  row: number
}

/**
 * Serpentina: a trilha corre para a direita, dobra na borda e volta para a
 * esquerda, de modo que dezenas de etapas cabem sem virar uma linha infinita.
 * Os cards são posicionados por coordenada e a trilha em si é um SVG por baixo:
 * reta dentro da fileira, Bézier lateral na dobra.
 */
function TrailMap({
  chain,
  activeStepId,
  visited,
  selectedStepId,
  verdicts,
  startDate,
  timeZone,
  showDates,
  onSelectStep,
  perRow = DEFAULT_PER_ROW,
}: TrailMapProps) {
  const placed: Placed[] = chain.nodes.map((node, index) => {
    const row = Math.floor(index / perRow)
    const indexInRow = index % perRow
    // Fileira ímpar corre no sentido inverso: é o que faz a trilha serpentear.
    const column = row % 2 === 1 ? perRow - 1 - indexInRow : indexInRow
    return {
      node,
      row,
      cx: column * (CARD_W + GAP_X) + CARD_W / 2,
      cy: row * (CARD_H + GAP_Y) + CARD_H / 2,
    }
  })

  const rowCount = Math.ceil(chain.nodes.length / perRow)
  const columnsUsed = Math.min(chain.nodes.length, perRow)
  const width = columnsUsed * CARD_W + (columnsUsed - 1) * GAP_X
  const height = rowCount * CARD_H + (rowCount - 1) * GAP_Y

  const segments = placed.slice(0, -1).map((from, index) => {
    const to = placed[index + 1]
    const done = visited.has(to.node.step.id)
    const sameRow = from.row === to.row

    // Na dobra, o laço sai pelo lado em que os dois cards estão encostados.
    const arm = from.cx > width / 2 ? CURVE_ARM : -CURVE_ARM
    const d = sameRow
      ? `M${from.cx} ${from.cy} L${to.cx} ${to.cy}`
      : `M${from.cx} ${from.cy} C${from.cx + arm} ${from.cy} ${to.cx + arm} ${to.cy} ${to.cx} ${to.cy}`

    return {
      key: `${from.node.step.id}->${to.node.step.id}`,
      d,
      done,
      active: activeStepId === to.node.step.id,
      label: `+${from.node.step.intervalDays}d`,
      lx: sameRow ? (from.cx + to.cx) / 2 : from.cx + arm * 0.78,
      ly: sameRow ? from.cy : (from.cy + to.cy) / 2,
    }
  })

  return (
    // mx-auto centra a trilha quando ela cabe; quando não cabe, as margens
    // zeram e o container rola em vez de cortar o início.
    <div className="relative mx-auto w-max" style={{ width, height }}>
      <svg
        aria-hidden="true"
        width={width}
        height={height}
        className="pointer-events-none absolute inset-0 overflow-visible"
      >
        {/* Leito da trilha: faixa larga e clara sob todos os segmentos. */}
        {segments.map((segment) => (
          <path
            key={`bed-${segment.key}`}
            d={segment.d}
            fill="none"
            stroke={TRACK_HALO}
            strokeWidth={20}
            strokeLinecap="round"
          />
        ))}
        {segments.map((segment) => (
          <path
            key={segment.key}
            d={segment.d}
            fill="none"
            stroke={segment.done ? TRACK_DONE : TRACK_PENDING}
            strokeWidth={segment.done ? 9 : 4}
            strokeLinecap="round"
            className={cn(
              'transition-all duration-500 ease-out',
              segment.active && 'animate-[pulse-soft_1.2s_ease-in-out_infinite]',
            )}
          />
        ))}
      </svg>

      {segments.map((segment) => (
        <span
          key={`label-${segment.key}`}
          aria-hidden="true"
          className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#dbe4ea] bg-white px-1.5 py-0.5 text-[0.55rem] font-bold text-slate-500"
          style={{ left: segment.lx, top: segment.ly }}
        >
          {segment.label}
        </span>
      ))}

      {placed.map((item) => (
        <div
          key={item.node.step.id}
          className="absolute"
          style={{
            left: item.cx - CARD_W / 2,
            top: item.cy - CARD_H / 2,
            width: CARD_W,
            height: CARD_H,
          }}
        >
          <StepCard
            node={item.node}
            active={activeStepId === item.node.step.id}
            visited={visited.has(item.node.step.id)}
            selected={selectedStepId === item.node.step.id}
            verdict={verdicts.get(item.node.step.id)}
            startDate={startDate}
            timeZone={timeZone}
            showDates={showDates}
            onSelect={onSelectStep}
          />
        </div>
      ))}
    </div>
  )
}

function StepCard({
  node,
  active,
  visited,
  selected,
  verdict,
  startDate,
  timeZone,
  showDates,
  onSelect,
}: {
  node: FlowNode
  active: boolean
  visited: boolean
  selected: boolean
  verdict: Verdict | undefined
  startDate: string
  timeZone: string
  showDates: boolean
  onSelect: (stepId: string) => void
}) {
  const phase = PHASE_VIEW[node.step.phase]
  const date = showDates ? projectDate(startDate, node.day, timeZone) : null

  return (
    <button
      type="button"
      onClick={() => onSelect(node.step.id)}
      aria-current={active ? 'step' : undefined}
      aria-label={`Etapa ${node.position}: ${node.step.label}`}
      title={`${node.step.label} · ${dilution(node.step.concentration)} · ${volume(node.step.volume)} · ${cadence(node.step.intervalDays)}`}
      className={cn(
        'relative flex h-full w-full cursor-pointer flex-col gap-0.5 overflow-hidden rounded-xl border bg-white p-2 text-left shadow-[0_2px_0_rgba(31,45,58,0.06),0_6px_14px_-8px_rgba(31,45,58,0.25)] transition-all duration-300',
        active
          ? 'border-brand shadow-[0_0_0_3px_rgba(37,126,140,0.20)] scale-[1.05]'
          : visited
            ? phase.ring
            : 'border-(--border-custom) opacity-55',
        selected && !active && 'ring-2 ring-brand/40',
      )}
    >
      <span
        aria-hidden="true"
        className={cn('absolute inset-x-0 top-0 h-1', phase.bar)}
      />

      {/* Cabeçalho: ordem na trilha e fase. */}
      <div className="flex items-center justify-between gap-1 pt-1">
        <span
          className={cn(
            'flex h-4 w-4 shrink-0 items-center justify-center rounded text-[0.55rem] font-bold transition-colors',
            active ? 'bg-brand text-white' : 'bg-gray-100 text-(--text-muted)',
          )}
        >
          {node.position}
        </span>
        <span
          className={cn(
            'truncate text-[0.52rem] font-bold uppercase tracking-wide',
            phase.text,
          )}
        >
          {phase.short}
        </span>
      </div>

      {/* O que se aplica: volume em destaque, diluição como qualificador. */}
      <div className="mt-0.5 flex items-baseline gap-1">
        <span className="text-[0.95rem] font-bold leading-none text-(--text)">
          {node.step.volume.replace('.', ',')}
        </span>
        <span className="text-[0.58rem] font-medium text-(--text-muted)">mL</span>
      </div>
      <span className="truncate text-[0.62rem] font-semibold text-(--text-muted)">
        {dilution(node.step.concentration)}
      </span>

      {/* Quando. O intervalo até a próxima etapa vive na linha, não aqui. */}
      <span className="mt-auto truncate text-[0.58rem] text-(--text-muted)">
        {date ?? `dia ${node.day}`}
      </span>

      {/* Exceções: só aparecem quando há algo fora do fluxo normal. */}
      {(verdict || node.repeats || node.endsSequence || node.exitsTo) && (
        <div className="flex items-center gap-1">
          {verdict && (
            <span
              className={cn(
                'flex min-w-0 items-center gap-1 text-[0.55rem] font-semibold',
                VERDICT_VIEW[verdict.state].text,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'h-1.5 w-1.5 shrink-0 rounded-full',
                  VERDICT_VIEW[verdict.state].dot,
                )}
              />
              <span className="truncate">{VERDICT_VIEW[verdict.state].label}</span>
            </span>
          )}
          {(node.repeats || node.endsSequence || node.exitsTo) && (
            <span className="ml-auto truncate text-[0.55rem] font-semibold text-slate-500">
              {node.repeats
                ? 'repete ↻'
                : node.exitsTo
                  ? `→ ${node.exitsTo}`
                  : 'fim'}
            </span>
          )}
        </div>
      )}
    </button>
  )
}
