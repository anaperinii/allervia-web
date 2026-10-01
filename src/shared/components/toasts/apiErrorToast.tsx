import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleExclamation,
  faClockRotateLeft,
  faLock,
  faMagnifyingGlass,
  faTriangleExclamation,
  faWifi,
} from '@fortawesome/free-solid-svg-icons'
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import { ApiError, API_ERROR_CODES } from '@/shared/api/contracts/errors'
import { toast } from './useToastStore'
import type { ToastVariant } from './Toast'

interface Presentation {
  title: string
  variant: ToastVariant
  icon: IconDefinition
}

const FALLBACK_MESSAGE = 'Não foi possível concluir a ação. Tente novamente.'

const ATTENTION: Presentation = {
  title: 'Ação não concluída',
  variant: 'warning',
  icon: faTriangleExclamation,
}

const BY_STATUS: Record<number, Presentation> = {
  400: { ...ATTENTION, title: 'Revise os dados informados' },
  401: { title: 'Sessão expirada', variant: 'warning', icon: faLock },
  403: { title: 'Sem permissão', variant: 'warning', icon: faLock },
  404: {
    title: 'Registro não encontrado',
    variant: 'warning',
    icon: faMagnifyingGlass,
  },
  409: { ...ATTENTION, title: 'Ação não permitida agora' },
  422: { ...ATTENTION, title: 'Revise os dados informados' },
  429: {
    title: 'Muitas tentativas',
    variant: 'warning',
    icon: faClockRotateLeft,
  },
}

function presentation(error: ApiError): Presentation {
  if (error.code === API_ERROR_CODES.network)
    return { title: 'Sem conexão', variant: 'danger', icon: faWifi }
  if (error.statusCode >= 500)
    return {
      title: 'Falha no servidor',
      variant: 'danger',
      icon: faCircleExclamation,
    }
  return BY_STATUS[error.statusCode] ?? ATTENTION
}

function fieldErrorSummary(error: ApiError): string | undefined {
  const entries = Object.values(error.fieldErrors ?? {}).flat()
  return entries.length > 0 ? entries.join(' ') : undefined
}

export interface ApiErrorToastOverride {
  title?: string
  description?: string
}

export function showApiErrorToast(
  error: unknown,
  override: ApiErrorToastOverride = {},
): string | undefined {
  if (!(error instanceof ApiError)) {
    if (error instanceof DOMException && error.name === 'AbortError') return
    return toast.warning({
      icon: <FontAwesomeIcon icon={ATTENTION.icon} style={{ fontSize: 16 }} />,
      title: override.title ?? ATTENTION.title,
      description: override.description ?? FALLBACK_MESSAGE,
      position: 'top-right',
    })
  }

  const { title, variant, icon } = presentation(error)
  const description =
    override.description ?? fieldErrorSummary(error) ?? error.message

  return toast[variant]({
    icon: <FontAwesomeIcon icon={icon} style={{ fontSize: 16 }} />,
    title: override.title ?? title,
    description: error.requestId ? (
      <>
        {description}
        <span className="mt-1 block text-[10px] opacity-60">
          Referência: {error.requestId}
        </span>
      </>
    ) : (
      description
    ),
    position: 'top-right',
    autoDismissMs: 8000,
  })
}
