import { z } from 'zod'
import { createContractParser } from '@/shared/api/contracts/contract-parser'
import type {
  AccountContext,
  SessionEnvelope,
} from '@/shared/api/contracts/account'

export const sessionEnvelopeSchema = z.object({
  authenticated: z.boolean(),
  csrfToken: z.string().min(1),
  session: z.object({
    id: z.string().min(1),
    organizationId: z.string().min(1),
    userId: z.string().min(1),
    createdAt: z.string().min(1),
    expiresAt: z.string().min(1),
    lastInteractiveAt: z.string().min(1),
    mfaVerified: z.boolean(),
    reauthenticatedAt: z.string().min(1).nullable(),
  }),
})

export const parseSessionEnvelope = createContractParser<SessionEnvelope>(
  sessionEnvelopeSchema,
  'Não foi possível validar a sessão recebida. Entre novamente.',
)

export const accountContextSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    email: z.string().min(1),
    type: z.string().min(1),
    isActive: z.boolean(),
    createdAt: z.string().min(1),
  }),
  organization: z
    .object({
      id: z.string().min(1),
      name: z.string().min(1),
      timeZone: z.string().min(1),
      automationEnabled: z.boolean(),
    })
    .nullable(),
  roles: z.array(z.string().min(1)),
  capabilities: z.array(z.string().min(1)),
  security: z.object({
    mfaEnabled: z.boolean(),
    mfaRequired: z.boolean(),
    sessionBased: z.boolean(),
  }),
})

export const parseAccountContext = createContractParser<AccountContext>(
  accountContextSchema,
  'Não foi possível validar os dados da conta recebidos. Tente novamente.',
)
