import { useEffect, useMemo, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useSearch } from '@tanstack/react-router'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { FlowDiagram, type Verdict } from '@/features/protocols/components/lab/FlowDiagram'
import { LabControls } from '@/features/protocols/components/lab/LabControls'
import { StepInspector } from '@/features/protocols/components/lab/StepInspector'
import { buildFlowGraph } from '@/features/protocols/lab/flow-graph'
import { listProtocols, readVersion, simulateVersion } from '@/shared/api/protocols.api'
import type { ProtocolVersion } from '@/shared/api/contracts/protocols'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { todayStr } from '@/shared/lib/dates'

/** Ritmo da animação da trilha. */
const STEP_INTERVAL_MS = 900

export function ProtocolLabPage() {
  const { versionId } = useSearch({ from: '/protocol-lab' })
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const timeZone = account?.organization?.timeZone ?? ''

  const versionQuery = useQuery({
    queryKey: queryKeys.protocolVersion(organizationId, versionId),
    queryFn: ({ signal }) => readVersion(versionId, signal),
    enabled: organizationId !== '' && versionId !== '',
  })

  const protocolsQuery = useQuery({
    queryKey: queryKeys.protocols(organizationId),
    queryFn: ({ signal }) => listProtocols(signal),
    enabled: organizationId !== '',
  })

  const [startStepId, setStartStepId] = useState('')
  const [cursor, setCursor] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null)
  const [showDates, setShowDates] = useState(false)
  const [startDate, setStartDate] = useState(todayStr)
  const [verdicts, setVerdicts] = useState<Map<string, Verdict>>(new Map())

  const version: ProtocolVersion | undefined = versionQuery.data
  const steps = useMemo(() => version?.definition.steps ?? [], [version])
  const effectiveStart = startStepId || steps[0]?.id || ''

  const graph = useMemo(
    () => buildFlowGraph(steps, effectiveStart),
    [steps, effectiveStart],
  )
  const mainChain = graph.chains.find((chain) => chain.kind === 'main')
  const mainNodes = useMemo(() => mainChain?.nodes ?? [], [mainChain])

  const protocolName =
    protocolsQuery.data?.find((protocol) => protocol.id === version?.protocolId)
      ?.name ?? 'Protocolo'

  const boundedCursor = Math.min(cursor, Math.max(mainNodes.length - 1, 0))
  const activeNode = mainNodes[boundedCursor]
  const visited = useMemo(
    () => new Set(mainNodes.slice(0, boundedCursor + 1).map((node) => node.step.id)),
    [mainNodes, boundedCursor],
  )
  const canStepForward = boundedCursor < mainNodes.length - 1

  useEffect(() => {
    if (!playing || mainNodes.length === 0) return
    const timer = window.setInterval(() => {
      setCursor((current) => {
        if (current >= mainNodes.length - 1) {
          setPlaying(false)
          return current
        }
        return current + 1
      })
    }, STEP_INTERVAL_MS)
    return () => window.clearInterval(timer)
  }, [playing, mainNodes.length])

  const resetRun = (nextStartStepId?: string) => {
    setPlaying(false)
    setCursor(0)
    setVerdicts(new Map())
    if (nextStartStepId !== undefined) setStartStepId(nextStartStepId)
  }

  const validation = useMutation({
    mutationFn: async () => {
      if (!version || mainNodes.length === 0) return
      const target = mainNodes[mainNodes.length - 1].step.id
      const stepIds = steps.map((step) => step.id)
      const next = new Map<string, Verdict>()
      setVerdicts(new Map(next))

      for (const node of mainNodes) {
        next.set(node.step.id, { state: 'checking' })
        setVerdicts(new Map(next))

        let result
        try {
          result = await simulateVersion(version.id, {
            prescription: {
              protocolId: version.protocolId,
              protocolVersionId: version.id,
              route: version.definition.route,
              stepIds,
              startingStepId: effectiveStart,
              targetStepId: target,
            },
            administered: {
              route: version.definition.route,
              volumeUnit: version.definition.volumeUnit,
              concentrationUnit: version.definition.concentrationUnit,
              concentration: node.step.concentration,
              volume: node.step.volume,
              intervalDays: node.step.intervalDays,
            },
            stepId: node.step.id,
          })
        } catch (error) {
          next.set(node.step.id, {
            state: 'error',
            detail:
              error instanceof ApiError
                ? `O motor recusou a transição: ${error.message}`
                : 'O motor não respondeu a esta transição.',
          })
          setVerdicts(new Map(next))
          continue
        }

        const expected = node.step.nextStepId
        if (result.kind === 'RECOMMENDED') {
          next.set(
            node.step.id,
            result.stepId === expected
              ? {
                  state: 'match',
                  detail: `O motor recomenda ${result.label}, como o diagrama desenha.`,
                }
              : {
                  state: 'mismatch',
                  detail: `O diagrama segue para ${expected ?? 'nenhuma etapa'}, mas o motor recomenda ${result.stepId}.`,
                },
          )
        } else if (result.kind === 'END_OF_SEQUENCE') {
          next.set(
            node.step.id,
            expected === null
              ? {
                  state: 'end',
                  detail:
                    'Sem sucessora automática. Fim de sequência não é alta clínica, apenas ausência de recomendação.',
                }
              : {
                  state: 'mismatch',
                  detail: `O diagrama segue para ${expected}, mas o motor não recomenda sucessora.`,
                },
          )
        } else {
          next.set(node.step.id, {
            state: 'error',
            detail: `O motor não resolveu a transição (${result.code}).`,
          })
        }
        setVerdicts(new Map(next))
      }
    },
  })

  const selectedStep = steps.find((step) => step.id === selectedStepId) ?? null
  const selectedNode = graph.chains
    .flatMap((chain) => chain.nodes)
    .find((node) => node.step.id === selectedStepId)

  const mismatches = [...verdicts.values()].filter(
    (verdict) => verdict.state === 'mismatch' || verdict.state === 'error',
  ).length

  const loadError = versionQuery.error
    ? versionQuery.error instanceof ApiError
      ? versionQuery.error.message
      : 'Não foi possível carregar a versão.'
    : null

  return (
    <SettingsLayout
      parents={['Protocolos de Imunoterapia']}
      subtitle={
        version ? (
          <>
            {protocolName}{' '}
            <span className="relative top-[0.08em] align-middle text-[0.55em] font-medium text-slate-400">
              v{version.number}
            </span>
          </>
        ) : (
          'Laboratório de simulação'
        )
      }
    >
      {versionQuery.isPending ? (
        <p className="text-xs text-(--text-muted)">Carregando versão…</p>
      ) : loadError ? (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.7rem] text-red-700"
        >
          {loadError}
        </div>
      ) : steps.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-(--border-custom) bg-white p-8 text-center">
          <p className="text-xs font-semibold text-(--text)">
            Esta versão não tem etapas
          </p>
          <p className="mt-1 text-[0.7rem] text-(--text-muted)">
            Não há fluxo para simular enquanto a definição estiver vazia.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            {graph.danglingRefs.length > 0 && (
              <div
                role="alert"
                className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.7rem] leading-relaxed text-red-700"
              >
                {graph.danglingRefs.length === 1
                  ? 'Uma etapa aponta para outra que não existe nesta versão'
                  : `${graph.danglingRefs.length} etapas apontam para outras que não existem nesta versão`}
                : {graph.danglingRefs.map((ref) => ref.fromStepId).join(', ')}.
                O sistema não conseguirá recomendar a dose seguinte a partir
                delas.
              </div>
            )}

            <FlowDiagram
              chains={graph.chains}
              activeStepId={activeNode?.step.id ?? null}
              visited={visited}
              selectedStepId={selectedStepId}
              verdicts={verdicts}
              startDate={startDate}
              timeZone={timeZone}
              showDates={showDates}
              onSelectStep={setSelectedStepId}
            />
          </div>

          <aside className="flex w-full flex-col gap-4 xl:w-80 xl:shrink-0">
            <LabControls
              steps={steps}
              startStepId={effectiveStart}
              onStartStepChange={(stepId) => resetRun(stepId)}
              startDate={startDate}
              onStartDateChange={setStartDate}
              showDates={showDates}
              onShowDatesChange={setShowDates}
              playing={playing}
              onTogglePlay={() => {
                if (playing) {
                  setPlaying(false)
                  return
                }
                // Dar play no fim da trilha recomeça a execução.
                if (!canStepForward) setCursor(0)
                setPlaying(true)
              }}
              canRun={mainNodes.length > 1}
              onValidate={() => validation.mutate()}
              validating={validation.isPending}
              validationSummary={
                verdicts.size === 0 || validation.isPending
                  ? null
                  : mismatches === 0
                    ? {
                        text: 'O motor concorda com todo o mapa.',
                        tone: 'ok',
                      }
                    : {
                        text: `${mismatches} divergência(s) com o motor — veja os selos no mapa.`,
                        tone: 'bad',
                      }
              }
              cursorLabel={
                activeNode
                  ? `Etapa ${activeNode.position} de ${mainNodes.length} · ${activeNode.step.label} · dia ${activeNode.day}`
                  : 'Sem etapas na trilha'
              }
            />

            <StepInspector
              step={selectedStep}
              day={selectedNode?.day ?? null}
              incoming={selectedStepId ? (graph.incoming.get(selectedStepId) ?? []) : []}
              verdict={selectedStepId ? verdicts.get(selectedStepId) : undefined}
              startDate={startDate}
              timeZone={timeZone}
              showDates={showDates}
              isStart={selectedStepId === effectiveStart}
              onSetStart={(stepId) => resetRun(stepId)}
              onFocus={setSelectedStepId}
            />
          </aside>
        </div>
      )}
    </SettingsLayout>
  )
}
