import { z } from 'zod'
import { createContractParser } from '@/shared/api/contracts/contract-parser'
import type { ClinicalMetrics } from '@/shared/api/contracts/clinical'

const count = z.number().int().nonnegative()

export const clinicalMetricsSchema = z.object({
  from: z.string().min(1),
  to: z.string().min(1),
  timeZone: z.string().min(1),
  applications: z
    .object({
      total: count,
      onSchedule: count,
      offSchedule: count,
      byDay: z.array(z.object({ day: z.string().min(1), count })),
    })
    .refine((value) => value.total === value.onSchedule + value.offSchedule)
    .refine(
      (value) =>
        value.byDay.reduce((sum, entry) => sum + entry.count, 0) === value.total,
    ),
  scheduled: z.object({ pending: count, overdue: count }),
  adherence: z
    .object({
      numerator: count,
      denominator: count,
      ratio: z.number().min(0).max(1).nullable(),
    })
    .refine((value) => value.denominator !== 0 || value.ratio === null),
  therapies: z.object({
    inProgress: count,
    suspended: count,
    completed: count,
    buildUp: count,
    maintenance: count,
  }),
})

export const parseClinicalMetrics = createContractParser<ClinicalMetrics>(
  clinicalMetricsSchema,
  'Não foi possível validar os indicadores recebidos. Tente novamente.',
)
