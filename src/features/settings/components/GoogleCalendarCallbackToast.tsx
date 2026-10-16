import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircleCheck,
  faCircleExclamation,
} from '@fortawesome/free-solid-svg-icons'
import { toast } from '@/shared/components'
import { queryKeys } from '@/shared/api/query-keys'

const ERROR_MESSAGES: Record<string, string> = {
  GOOGLE_OAUTH_STATE_INVALID:
    'O link de autorização expirou ou já foi usado. Inicie a conexão novamente.',
  GOOGLE_OAUTH_SESSION_INVALID:
    'Sua sessão não corresponde à conta que iniciou a conexão. Entre novamente e refaça a conexão.',
  GOOGLE_REFRESH_TOKEN_MISSING:
    'O Google não concedeu a autorização necessária. Remova o acesso do Allervia na sua conta Google e tente de novo.',
  GOOGLE_SCOPE_NOT_GRANTED:
    'A permissão de agenda não foi concedida. Marque o acesso à agenda na tela de consentimento do Google.',
  GOOGLE_OAUTH_EXCHANGE_FAILED:
    'Falha na comunicação com o Google. Tente novamente em instantes.',
  GOOGLE_TOKEN_KEY_UNAVAILABLE:
    'A integração está indisponível no servidor. Fale com o suporte.',
  GOOGLE_CALENDAR_ALREADY_CONNECTED:
    'Já existe uma conta Google conectada para este profissional.',
}

const FALLBACK_ERROR = 'Não foi possível concluir a conexão. Tente novamente.'

export function GoogleCalendarCallbackToast() {
  const queryClient = useQueryClient()

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const status = params.get('status')
    if (status !== 'connected' && status !== 'error') return

    if (status === 'connected') {
      toast.success({
        icon: <FontAwesomeIcon icon={faCircleCheck} style={{ fontSize: 16 }} />,
        title: 'Google Agenda conectado',
        description:
          'Seus compromissos passam a ser sincronizados com o Google Agenda.',
        position: 'top-right',
        autoDismissMs: 8000,
      })
      void queryClient.invalidateQueries({
        queryKey: queryKeys.calendarConnection(),
      })
    } else {
      const code = params.get('code') ?? ''
      toast.danger({
        icon: (
          <FontAwesomeIcon icon={faCircleExclamation} style={{ fontSize: 16 }} />
        ),
        title: 'Falha ao conectar o Google Agenda',
        description: ERROR_MESSAGES[code] ?? FALLBACK_ERROR,
        position: 'top-right',
        autoDismissMs: 8000,
      })
    }

    params.delete('status')
    params.delete('code')
    const remaining = params.toString()
    window.history.replaceState(
      null,
      '',
      window.location.pathname + (remaining ? `?${remaining}` : ''),
    )
  }, [queryClient])

  return null
}
