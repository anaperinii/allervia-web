import type { Schema } from '@/shared/api/generated/helpers'

export type StepIntervalTolerance = Schema<'StepIntervalToleranceDto'>

export const DOSE_INTERVAL_BANDS = [
  'TOO_SHORT',
  'ON_PLAN',
  'LONG',
  'REQUIRES_STEP_REVIEW',
] as const

export type DoseIntervalBand = (typeof DOSE_INTERVAL_BANDS)[number]

export function isDoseIntervalBand(value: string): value is DoseIntervalBand {
  return (DOSE_INTERVAL_BANDS as readonly string[]).includes(value)
}

export function classifyDoseInterval(
  tolerance: StepIntervalTolerance,
  actualIntervalDays: number,
): DoseIntervalBand {
  if (actualIntervalDays < tolerance.shortBelowDays) return 'TOO_SHORT'
  if (actualIntervalDays > tolerance.stepReviewAboveDays)
    return 'REQUIRES_STEP_REVIEW'
  if (actualIntervalDays >= tolerance.longFromDays) return 'LONG'
  return 'ON_PLAN'
}

export function requiresJustification(band: DoseIntervalBand): boolean {
  return band === 'TOO_SHORT' || band === 'REQUIRES_STEP_REVIEW'
}

/**
 * Espelha a derivação do servidor em `clinical-rules/classify-dose-interval.ts`
 * para mostrar ao autor do protocolo o que ele ganha sem preencher nada. O
 * servidor continua sendo a autoridade: isto é apenas pré-visualização.
 */
export function deriveStepIntervalTolerance(
  intervalDays: number,
  followingIntervalDays: number | null,
): StepIntervalTolerance | null {
  if (!Number.isSafeInteger(intervalDays) || intervalDays < 1) return null
  const following = followingIntervalDays ?? intervalDays
  if (!Number.isSafeInteger(following) || following < 1) return null

  const shortBelowDays = Math.min(
    intervalDays - Math.floor(intervalDays / 2),
    intervalDays,
  )
  const longFromDays = Math.max(
    intervalDays + Math.floor(following / 2),
    intervalDays + 1,
  )
  return {
    shortBelowDays: Math.max(shortBelowDays, 1),
    longFromDays,
    stepReviewAboveDays: Math.max(intervalDays + following, longFromDays),
  }
}

export function toleranceProblems(
  tolerance: StepIntervalTolerance,
  intervalDays: number,
): string[] {
  const problems: string[] = []
  const positive = (value: number) => Number.isSafeInteger(value) && value > 0

  if (!positive(tolerance.shortBelowDays) || !positive(tolerance.longFromDays) || !positive(tolerance.stepReviewAboveDays)) {
    problems.push('os três limites devem ser inteiros positivos em dias')
    return problems
  }
  if (tolerance.shortBelowDays > intervalDays)
    problems.push('o limite curto não pode passar do intervalo da etapa')
  if (tolerance.longFromDays <= intervalDays)
    problems.push('o limite longo precisa ser maior que o intervalo da etapa')
  if (tolerance.stepReviewAboveDays < tolerance.longFromDays)
    problems.push('o limite de revisão não pode vir antes do limite longo')
  return problems
}

export function civilDaysBetween(from: string, to: string): number | null {
  if (!from || !to) return null
  const start = Date.parse(`${from}T00:00:00Z`)
  const end = Date.parse(`${to}T00:00:00Z`)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null
  return Math.round((end - start) / 86400000)
}
