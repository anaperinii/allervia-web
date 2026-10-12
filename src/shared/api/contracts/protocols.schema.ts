import { z } from 'zod'
import { createContractParser } from '@/shared/api/contracts/contract-parser'
import type { ProtocolVersion } from '@/shared/api/contracts/protocols'

const count = z.number().int().nonnegative()

export const protocolVersionSchema = z.object({
  id: z.string().min(1),
  status: z.enum(['DRAFT', 'PUBLISHED', 'RETIRED']),
  revision: count,
  definition: z.object({
    steps: z.array(z.object({ id: z.string().min(1) })),
  }),
})

export const parseProtocolVersion = createContractParser<ProtocolVersion>(
  protocolVersionSchema,
  'Não foi possível validar a versão de protocolo recebida. Tente novamente.',
)
