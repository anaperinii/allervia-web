import { Button } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import type { ProtocolStep } from '@/shared/api/contracts/protocols'
import {
  cadence,
  dilution,
  projectDate,
  volume,
} from '@/features/protocols/lab/flow-graph'
import type { Verdict } from './FlowDiagram'

interface StepInspectorProps {
  step: ProtocolStep | null
  day: number | null
  incoming: string[]
  verdict: Verdict | undefined
  startDate: string
  timeZone: string
  showDates: boolean
  isStart: boolean
  onSetStart: (stepId: string) => void
  onFocus: (stepId: string) => void
}

export function StepInspector({
  step,
  day,
  incoming,
  verdict,
  startDate,
  timeZone,
  showDates,
  isStart,
  onSetStart,
  onFocus,
}: StepInspectorProps) {
  if (!step) {
    return (
      <div className="rounded-2xl border border-dashed border-(--border-custom) bg-white p-4">
        <p className="text-[0.7rem] leading-relaxed text-(--text-muted)">
          Clique em uma etapa do diagrama para inspecionar valores, cadência e
          quem aponta para ela.
        </p>
      </div>
    )
  }

  const date =
    showDates && day !== null ? projectDate(startDate, day, timeZone) : null

  const facts: { label: string; value: string }[] = [
    { label: 'Identificador', value: step.id },
    { label: 'Fase', value: step.phase === 'BUILD_UP' ? 'Indução' : 'Manutenção' },
    { label: 'Diluição', value: dilution(step.concentration) },
    { label: 'Volume', value: volume(step.volume) },
    { label: 'Cadência', value: cadence(step.intervalDays) },
    {
      label: date ? 'Data projetada' : 'Dia na trilha',
      value: date ?? (day !== null ? `dia ${day}` : '—'),
    },
    {
      label: 'Sucessora',
      value:
        step.nextStepId === null
          ? 'Nenhuma · fim de sequência'
          : step.nextStepId === step.id
            ? 'Ela mesma · repete indefinidamente'
            : step.nextStepId,
    },
  ]

  return (
    <div className="rounded-2xl border border-(--border-custom) bg-white overflow-hidden">
      <header className="border-b border-(--border-custom) bg-gray-50/50 px-4 py-3">
        <h3 className="text-xs font-bold text-(--text)">{step.label}</h3>
        {verdict?.detail && (
          <p
            className={cn(
              'mt-1 text-[0.65rem] leading-relaxed',
              verdict.state === 'mismatch' || verdict.state === 'error'
                ? 'text-red-700'
                : 'text-(--text-muted)',
            )}
          >
            {verdict.detail}
          </p>
        )}
      </header>

      <dl className="divide-y divide-(--border-custom)">
        {facts.map((fact) => (
          <div key={fact.label} className="flex items-baseline gap-3 px-4 py-2">
            <dt className="w-28 shrink-0 text-[0.65rem] text-(--text-muted)">
              {fact.label}
            </dt>
            <dd className="min-w-0 flex-1 break-words text-[0.7rem] font-medium text-(--text)">
              {fact.value}
            </dd>
          </div>
        ))}
      </dl>

      <div className="border-t border-(--border-custom) px-4 py-3">
        <p className="text-[0.65rem] font-semibold text-(--text)">
          Quem aponta para esta etapa
        </p>
        {incoming.length === 0 ? (
          <p className="mt-1 text-[0.65rem] leading-relaxed text-(--text-muted)">
            Nenhuma. O motor só chega aqui se a prescrição começar nesta etapa.
          </p>
        ) : (
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {incoming.map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => onFocus(id)}
                className="cursor-pointer rounded-md border border-(--border-custom) bg-gray-50 px-2 py-0.5 text-[0.65rem] font-medium text-(--text-muted) transition-colors hover:border-brand/40 hover:text-brand-dark"
              >
                {id}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="border-t border-(--border-custom) px-4 py-3">
        <Button
          variant="outline"
          size="sm"
          fullWidth
          disabled={isStart}
          className="border-[#12333a]/40 text-[#12333a] hover:border-[#12333a]/70 hover:bg-[#12333a]/6"
          onClick={() => onSetStart(step.id)}
        >
          {isStart ? 'Já é a etapa inicial' : 'Simular a partir desta etapa'}
        </Button>
      </div>
    </div>
  )
}
