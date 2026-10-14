import { ApiError } from '@/shared/api/contracts/errors'


const CODE_SHAPED = /^[A-Z][A-Z0-9]*(?:_[A-Z0-9]+)+$/

const FRIENDLY_BY_STATUS: Record<number, string> = {
  400: 'Revise os dados informados e tente novamente.',
  401: 'Entre novamente para continuar.',
  403: 'Seu perfil não tem permissão para esta ação.',
  404: 'O registro não foi encontrado. Atualize a tela e tente novamente.',
  409: 'O registro mudou enquanto você trabalhava. Recarregue e confirme de novo.',
  422: 'Revise os dados informados e tente novamente.',
  429: 'Muitas tentativas em pouco tempo. Aguarde e tente novamente.',
}

export const GENERIC_FAILURE_MESSAGE =
  'Não foi possível concluir a ação. Tente novamente.'


export function humanErrorMessage(
  error: unknown,
  fallback: string = GENERIC_FAILURE_MESSAGE,
): string {
  if (!(error instanceof ApiError)) return fallback
  const message = error.message?.trim() ?? ''
  if (message.length > 0 && !CODE_SHAPED.test(message)) return message
  if (error.statusCode >= 500)
    return 'O servidor falhou ao processar a ação. Tente novamente.'
  return FRIENDLY_BY_STATUS[error.statusCode] ?? fallback
}


export function apiTechnicalReference(error: unknown): string | undefined {
  if (!(error instanceof ApiError)) return undefined
  const parts = [error.code, error.requestId].filter(
    (part): part is string => typeof part === 'string' && part.length > 0,
  )
  return parts.length > 0 ? parts.join(' · ') : undefined
}
