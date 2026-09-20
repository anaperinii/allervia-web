/** Envelope público de erro da API. `code` é estável; `message` é apresentação. */
export interface ApiErrorEnvelope {
  statusCode: number
  code: string
  message: string
  fieldErrors?: Record<string, string[]>
  requestId?: string
}

export const API_ERROR_CODES = {
  invalidCredentials: 'INVALID_CREDENTIALS',
  sessionExpired: 'SESSION_EXPIRED',
  sessionRevoked: 'SESSION_REVOKED',
  accountDisabled: 'ACCOUNT_DISABLED',
  organizationDisabled: 'ORGANIZATION_DISABLED',
  tooManyAttempts: 'TOO_MANY_ATTEMPTS',
  csrfInvalid: 'CSRF_TOKEN_INVALID',
  originNotAllowed: 'ORIGIN_NOT_ALLOWED',
  mfaRequired: 'MFA_REQUIRED',
  mfaChallengeInvalid: 'MFA_CHALLENGE_INVALID',
  mfaCodeInvalid: 'MFA_CODE_INVALID',
  mfaUnavailable: 'MFA_UNAVAILABLE',
  reauthenticationRequired: 'REAUTHENTICATION_REQUIRED',
  validationError: 'VALIDATION_ERROR',
  notFound: 'NOT_FOUND',
  forbidden: 'FORBIDDEN',
  endpointRetired: 'ENDPOINT_RETIRED',
  network: 'NETWORK_UNAVAILABLE',
  indeterminate: 'RESULT_INDETERMINATE',
} as const

/**
 * Erro normalizado de qualquer chamada. Componentes ramificam por `code`,
 * nunca pelo texto — que pode mudar sem aviso.
 */
export class ApiError extends Error {
  readonly statusCode: number
  readonly code: string
  readonly fieldErrors?: Record<string, string[]>
  readonly requestId?: string

  constructor(envelope: ApiErrorEnvelope) {
    super(envelope.message)
    this.name = 'ApiError'
    this.statusCode = envelope.statusCode
    this.code = envelope.code
    this.fieldErrors = envelope.fieldErrors
    this.requestId = envelope.requestId
  }

  /** Sessão ausente, expirada ou revogada: a aplicação precisa reautenticar. */
  get isUnauthenticated(): boolean {
    return this.statusCode === 401
  }

  /** O servidor respondeu, mas a conta não tem permissão para a ação. */
  get isForbidden(): boolean {
    return this.statusCode === 403
  }

  /**
   * Falha de rede ou timeout: não prova que o comando deixou de ser gravado.
   * Comandos clínicos precisam reconsultar o estado em vez de assumir falha.
   */
  get isIndeterminate(): boolean {
    return (
      this.code === API_ERROR_CODES.network ||
      this.code === API_ERROR_CODES.indeterminate
    )
  }
}
