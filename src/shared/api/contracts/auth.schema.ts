import { z } from 'zod'
import { createContractParser } from '@/shared/api/contracts/contract-parser'
import type {
  AccountContext,
  SessionEnvelope,
  StartSessionResult,
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

const mfaEnrollmentSchema = z.object({
  credentialId: z.string().min(1),
  keyUri: z.string().min(1),
  secret: z.string().min(1),
})


export const startSessionResultSchema = z.union([
  sessionEnvelopeSchema,
  z.object({
    status: z.literal('MFA_REQUIRED'),
    challengeToken: z.string().min(1),
    expiresAt: z.string().min(1),
  }),
  z.object({
    status: z.literal('MFA_ENROLLMENT_REQUIRED'),
    challengeToken: z.string().min(1),
    expiresAt: z.string().min(1),
    enrollment: mfaEnrollmentSchema,
  }),
])

export const parseStartSessionResult = createContractParser<StartSessionResult>(
  startSessionResultSchema,
  'Não foi possível validar a resposta de autenticação. Tente entrar novamente.',
)

export const accountContextSchema = z.object({
  user: z.object({
    id: z.string().min(1),
    email: z.string().min(1),
    type: z.string().min(1),
    isActive: z.boolean(),
    createdAt: z.string().min(1),
  }),

  professional: z
    .object({
      id: z.string().min(1),
      fullName: z.string().min(1),
      phoneNumber: z.string(),
      profession: z.string().min(1),
      councilNumber: z.string().nullable(),
      councilUf: z.string().nullable(),
    })
    .nullable(),
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

export const parseReauthentication = createContractParser<{ reauthenticatedAt: string; maxAgeSeconds: number }>(
  z.object({ reauthenticatedAt: z.string().datetime({ offset: true }), maxAgeSeconds: z.number().int().positive() }),
  'Não foi possível validar a confirmação de identidade.',
)
export const parseMfaEnrollment = createContractParser<{ credentialId: string; secret: string; keyUri: string }>(
  mfaEnrollmentSchema,
  'Não foi possível validar o cadastro do autenticador.',
)
export const parseRecoveryCodes = createContractParser<{ recoveryCodes: string[] }>(
  z.object({ recoveryCodes: z.array(z.string().min(1)).min(1) }),
  'Não foi possível validar os códigos de recuperação.',
)
