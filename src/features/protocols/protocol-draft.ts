import type {
  ProtocolDefinitionDraft,
} from '@/shared/api/contracts/protocols'

export const EMPTY_DRAFT: ProtocolDefinitionDraft = {
  schemaVersion: 1,
  engineVersion: '1',
  route: 'SUBCUTANEOUS',
  volumeUnit: 'mL',
  concentrationUnit: 'DILUTION_DENOMINATOR',
  steps: [],
}

export function validateDraft(draft: ProtocolDefinitionDraft): string[] {
  const problems: string[] = []
  const ids = new Set<string>()

  if (draft.steps.length === 0) {
    problems.push('O protocolo precisa de ao menos uma etapa.')
  }

  for (const step of draft.steps) {
    const name = step.label || step.id || '(sem id)'
    if (!/^[a-z0-9][a-z0-9-_]*$/i.test(step.id)) {
      problems.push(`Etapa "${name}": id deve ser alfanumérico, sem espaços.`)
    }
    if (ids.has(step.id)) {
      problems.push(`Etapa "${name}": id repetido.`)
    }
    ids.add(step.id)

    if (!/^\d+$/.test(step.concentration) || Number(step.concentration) <= 0) {
      problems.push(
        `Etapa "${name}": concentração deve ser o denominador inteiro da diluição (ex.: 1000 para 1:1.000).`,
      )
    }
    if (!/^\d+(\.\d+)?$/.test(step.volume) || Number(step.volume) <= 0) {
      problems.push(
        `Etapa "${name}": volume deve ser decimal exato com ponto (ex.: 0.1).`,
      )
    }
    if (!Number.isInteger(step.intervalDays) || step.intervalDays <= 0) {
      problems.push(
        `Etapa "${name}": intervalo deve ser inteiro positivo em dias.`,
      )
    }
  }

  for (const step of draft.steps) {
    if (step.nextStepId !== null && !ids.has(step.nextStepId)) {
      problems.push(
        `Etapa "${step.label || step.id}": sucessor "${step.nextStepId}" não existe.`,
      )
    }
  }

  return problems
}
