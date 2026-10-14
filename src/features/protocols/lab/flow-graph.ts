import type { ProtocolStep } from '@/shared/api/contracts/protocols'

export type ChainKind = 'main' | 'branch'


export type ChainEnding =
  | 'END_OF_SEQUENCE'
  | 'PLATEAU'
  | 'CYCLE'
  | 'REJOINS_OTHER_CHAIN'

export interface FlowNode {
  step: ProtocolStep

  position: number

  day: number

  repeats: boolean

  endsSequence: boolean

  exitsTo: string | null
}

export interface FlowChain {
  id: string
  kind: ChainKind
  nodes: FlowNode[]
  ending: ChainEnding

  totalDays: number
}

export interface FlowGraph {
  chains: FlowChain[]

  incoming: Map<string, string[]>

  danglingRefs: { fromStepId: string; missingStepId: string }[]
}







export function buildFlowGraph(
  steps: ProtocolStep[],
  startStepId?: string,
): FlowGraph {
  const byId = new Map(steps.map((step) => [step.id, step]))

  const incoming = new Map<string, string[]>()
  const danglingRefs: { fromStepId: string; missingStepId: string }[] = []
  for (const step of steps) {
    if (step.nextStepId === null) continue
    if (!byId.has(step.nextStepId)) {
      danglingRefs.push({
        fromStepId: step.id,
        missingStepId: step.nextStepId,
      })
      continue
    }
    const sources = incoming.get(step.nextStepId) ?? []
    sources.push(step.id)
    incoming.set(step.nextStepId, sources)
  }

  const chains: FlowChain[] = []
  const claimed = new Set<string>()

  const walk = (firstStepId: string, kind: ChainKind): FlowChain | null => {
    const first = byId.get(firstStepId)
    if (!first || claimed.has(firstStepId)) return null

    const nodes: FlowNode[] = []
    const seenHere = new Set<string>()
    let current: ProtocolStep | undefined = first
    let day = 0
    let ending: ChainEnding = 'END_OF_SEQUENCE'

    while (current) {
      claimed.add(current.id)
      seenHere.add(current.id)

      const repeats: boolean = current.nextStepId === current.id
      const next: ProtocolStep | undefined =
        current.nextStepId !== null && !repeats
          ? byId.get(current.nextStepId)
          : undefined
      const leavesChain = next !== undefined && claimed.has(next.id)

      nodes.push({
        step: current,
        position: nodes.length + 1,
        day,
        repeats,
        endsSequence: current.nextStepId === null,
        exitsTo: leavesChain ? next.id : null,
      })

      if (repeats) {
        ending = 'PLATEAU'
        break
      }
      if (current.nextStepId === null) {
        ending = 'END_OF_SEQUENCE'
        break
      }
      if (!next) {

        ending = 'END_OF_SEQUENCE'
        break
      }
      if (leavesChain) {
        ending = seenHere.has(next.id) ? 'CYCLE' : 'REJOINS_OTHER_CHAIN'
        break
      }

      day += current.intervalDays
      current = next
    }

    return {
      id: firstStepId,
      kind,
      nodes,
      ending,
      totalDays: nodes[nodes.length - 1]?.day ?? 0,
    }
  }

  const mainStart =
    startStepId && byId.has(startStepId) ? startStepId : steps[0]?.id
  if (mainStart) {
    const main = walk(mainStart, 'main')
    if (main) chains.push(main)
  }



  const isRoot = (step: ProtocolStep) => (incoming.get(step.id) ?? []).length === 0
  for (const step of steps) {
    if (claimed.has(step.id) || !isRoot(step)) continue
    const chain = walk(step.id, 'branch')
    if (chain) chains.push(chain)
  }
  for (const step of steps) {
    if (claimed.has(step.id)) continue
    const chain = walk(step.id, 'branch')
    if (chain) chains.push(chain)
  }

  return { chains, incoming, danglingRefs }
}

export function chainEndingLabel(ending: ChainEnding): string {
  switch (ending) {
    case 'PLATEAU':
      return 'Repete indefinidamente'
    case 'END_OF_SEQUENCE':
      return 'Fim da sequência'
    case 'CYCLE':
      return 'Volta para uma etapa anterior desta trilha'
    case 'REJOINS_OTHER_CHAIN':
      return 'Reentra em outra trilha'
  }
}


export function projectDate(
  startIso: string,
  days: number,
  timeZone: string,
): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startIso)) return null

  const base = new Date(`${startIso}T12:00:00Z`)
  if (Number.isNaN(base.getTime())) return null
  base.setUTCDate(base.getUTCDate() + days)
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: timeZone || 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(base)
  } catch {
    return new Intl.DateTimeFormat('pt-BR', {
      timeZone: 'UTC',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(base)
  }
}

export function dilution(value: string): string {
  const parsed = Number(value)
  return Number.isFinite(parsed)
    ? `1:${parsed.toLocaleString('pt-BR')}`
    : `1:${value}`
}

export function volume(value: string): string {
  return `${value.replace('.', ',')} mL`
}

export function cadence(days: number): string {
  if (days === 7) return '7 dias · semanal'
  if (days === 14) return '14 dias · quinzenal'
  if (days > 0 && days % 7 === 0) return `${days} dias · ${days / 7} semanas`
  return `${days} ${days === 1 ? 'dia' : 'dias'}`
}
