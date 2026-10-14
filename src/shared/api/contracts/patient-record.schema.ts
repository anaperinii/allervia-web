import { z } from 'zod'
import { ApiError } from '@/shared/api/contracts/errors'
const observation = z.object({ id: z.string(), reportedSideEffects: z.array(z.string()), administeredMedications: z.array(z.string()), notes: z.string().nullable() }).passthrough()
const dose = z.object({ id: z.string(), status: z.string(), administeredAt: z.string().nullable(), observations: z.array(observation), observationAddenda: z.array(observation) }).passthrough()
const recordSchema = z.object({ asOf: z.string().datetime(), complete: z.literal(true), redactedFields: z.array(z.string()), patient: z.object({ id: z.string() }).passthrough(), therapies: z.array(z.object({ id: z.string(), doses: z.array(dose), prescriptions: z.array(z.record(z.string(), z.unknown())), lifecycleEvents: z.array(z.record(z.string(), z.unknown())) }).passthrough()), appointments: z.array(z.object({ id: z.string(), doseId: z.string().nullable() }).passthrough()), history: z.array(z.record(z.string(), z.unknown())) })
export type PatientClinicalRecord = z.infer<typeof recordSchema>
export function parsePatientRecord(body: unknown): PatientClinicalRecord {
  const parsed = recordSchema.safeParse(body)
  if (!parsed.success) throw new ApiError({ statusCode: 502, code: 'INVALID_API_RESPONSE', message: 'Resposta de prontuário inválida.' })
  return parsed.data
}
