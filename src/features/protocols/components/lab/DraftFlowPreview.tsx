import { useMemo } from 'react'
import { FlowDiagram } from './FlowDiagram'
import { buildFlowGraph } from '@/features/protocols/lab/flow-graph'
import type { ProtocolStep } from '@/shared/api/contracts/protocols'

const NO_VERDICTS = new Map()

interface DraftFlowPreviewProps {
  steps: ProtocolStep[]
  perRow?: number
}

/**
 * Espelha, dentro do editor, o mesmo mapa que o laboratório desenha — só que
 * alimentado pelo rascunho em edição, para que a trilha apareça enquanto ela é
 * montada.
 */
export function DraftFlowPreview({ steps, perRow }: DraftFlowPreviewProps) {
  const graph = useMemo(() => buildFlowGraph(steps), [steps])
  const visited = useMemo(
    () => new Set(steps.map((step) => step.id)),
    [steps],
  )

  if (steps.length === 0) {
    return (
      <section className="rounded-2xl border border-dashed border-(--border-custom) bg-white p-6 text-center">
        <p className="text-xs font-semibold text-(--text)">
          Nenhuma etapa para desenhar
        </p>
        <p className="mt-1 text-[0.7rem] text-(--text-muted)">
          O mapa da trilha aparece aqui conforme você adiciona etapas.
        </p>
      </section>
    )
  }

  return (
    <section className="flex flex-col gap-2">
      <div className="px-1">
        <h2 className="text-[0.7rem] font-bold uppercase tracking-wide text-slate-500">
          Trilha resultante
        </h2>
        <p className="mt-0.5 text-[0.65rem] text-slate-400">
          É este o caminho que o paciente vai percorrer, na ordem em que as
          etapas se encadeiam.
        </p>
      </div>
      <FlowDiagram
        chains={graph.chains}
        activeStepId={null}
        visited={visited}
        selectedStepId={null}
        verdicts={NO_VERDICTS}
        startDate=""
        timeZone=""
        showDates={false}
        onSelectStep={() => {}}
        perRow={perRow}
      />
    </section>
  )
}
