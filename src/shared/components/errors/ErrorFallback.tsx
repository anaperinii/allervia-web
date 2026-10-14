import { useContext } from 'react'
import { Link } from '@tanstack/react-router'
import { Button } from '@/shared/components/forms/Button'
import { SessionContext } from '@/shared/auth/session-context'
import {
  classifyError,
  technicalReference,
  type AppErrorKind,
} from './error-kind'
import { chunkReloadAlreadyUsed, reloadForChunkFailureOnce } from './chunk-reload'

const COPY: Record<AppErrorKind, { title: string; body: string }> = {
  chunk: {
    title: 'Esta página mudou desde que você abriu',
    body: 'Uma parte do aplicativo foi atualizada no servidor. Recarregue para continuar. Formulários abertos nesta aba serão perdidos.',
  },
  network: {
    title: 'Não foi possível falar com o servidor',
    body: 'A conexão falhou antes de a resposta chegar. Nenhuma ação clínica foi confirmada por esta tela.',
  },
  api: {
    title: 'O servidor recusou esta leitura',
    body: 'A tela não pôde ser montada com os dados recebidos. Tentar de novo refaz apenas a leitura.',
  },
  render: {
    title: 'Algo quebrou ao montar esta tela',
    body: 'A falha foi registrada. Tentar de novo refaz apenas a leitura desta tela; nada é enviado novamente.',
  },
}

export interface ErrorFallbackProps {
  error: unknown

  onRetry?: () => void

  standalone?: boolean
}

export function ErrorFallback({ error, onRetry, standalone }: ErrorFallbackProps) {
  const session = useContext(SessionContext)
  const kind = classifyError(error)
  const copy = COPY[kind]
  const destination = session?.status === 'authenticated' ? '/immunotherapies' : '/'
  const destinationLabel =
    session?.status === 'authenticated' ? 'Ir para a lista clínica' : 'Ir para a página inicial'
  const reloaded = kind === 'chunk' && chunkReloadAlreadyUsed()

  return (
    <div
      role="alert"
      className="flex min-h-[60vh] flex-1 flex-col items-center justify-center gap-4 px-6 text-center"
    >
      <div className="max-w-md space-y-2">
        <h1 className="text-lg font-semibold text-(--text)">{copy.title}</h1>
        <p className="text-sm text-(--text-muted)">{copy.body}</p>
        {reloaded && (
          <p className="text-sm text-(--text-muted)">
            A página já foi recarregada uma vez e a falha continuou. Feche e abra o aplicativo
            novamente ou acione o suporte com a referência abaixo.
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-center gap-2">
        {kind === 'chunk' ? (
          <Button type="button" onClick={reloadForChunkFailureOnce} disabled={reloaded}>
            Recarregar o aplicativo
          </Button>
        ) : (
          onRetry && (
            <Button type="button" onClick={onRetry}>
              Tentar novamente
            </Button>
          )
        )}
        {standalone ? (
          <a
            href={destination}
            className="text-xs font-semibold text-brand underline"
          >
            {destinationLabel}
          </a>
        ) : (
          <Link to={destination} className="text-xs font-semibold text-brand underline">
            {destinationLabel}
          </Link>
        )}
      </div>

      <p className="text-[0.7rem] text-(--text-muted)">
        Referência técnica: <span className="font-mono">{technicalReference(error)}</span>
      </p>
    </div>
  )
}
