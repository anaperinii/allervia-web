import { useEffect, useMemo, useRef, useState } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlay, faStop } from '@fortawesome/free-solid-svg-icons'
import { ApiError, API_ERROR_CODES } from '@/shared/api/contracts/errors'
import { Button, showApiErrorToast, useToastStore } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import { ERROR_CATALOG, type ErrorCatalogEntry } from './error-catalog.generated'

const PLAYBACK_INTERVAL_MS = 1600

const STATUS_LABEL: Record<number, string> = {
  400: 'Dados inválidos',
  401: 'Sessão',
  403: 'Permissão',
  404: 'Não encontrado',
  405: 'Método',
  409: 'Conflito de estado',
  410: 'Descontinuado',
  415: 'Conteúdo',
  422: 'Não processável',
  429: 'Limite',
  500: 'Servidor',
  503: 'Indisponível',
}

const STATUS_STYLE: Record<string, string> = {
  attention: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  failure: 'bg-red-100 text-red-800 border-red-300',
}

function toneOf(status: number): 'attention' | 'failure' {
  return status >= 500 ? 'failure' : 'attention'
}

function clearToasts() {
  const { toasts, dismiss } = useToastStore.getState()
  toasts.forEach((item) => dismiss(item.id))
}

function fire(entry: ErrorCatalogEntry) {
  clearToasts()
  showApiErrorToast(
    new ApiError({
      statusCode: entry.status,
      code: entry.code,
      message: entry.message,
      requestId: `lab-${entry.code.toLowerCase()}`,
    }),
  )
}

const EDGE_CASES = [
  {
    label: 'Sem conexão',
    run: () => {
      clearToasts()
      showApiErrorToast(
        new ApiError({
          statusCode: 0,
          code: API_ERROR_CODES.network,
          message: 'Não foi possível falar com o servidor.',
        }),
      )
    },
  },
  {
    label: 'Validação com fieldErrors',
    run: () => {
      clearToasts()
      showApiErrorToast(
        new ApiError({
          statusCode: 400,
          code: 'VALIDATION_ERROR',
          message: 'Requisição inválida. Confira os campos destacados.',
          fieldErrors: {
            birthDate: ['Data de nascimento inválida.'],
            weightInKg: ['Peso deve ser maior que zero.'],
          },
          requestId: 'lab-validation',
        }),
      )
    },
  },
  {
    label: 'Erro não-ApiError',
    run: () => {
      clearToasts()
      showApiErrorToast(new Error('boom'))
    },
  },
]

export function ToastLabPage() {
  const [term, setTerm] = useState('')
  const [playing, setPlaying] = useState(false)
  const [cursor, setCursor] = useState(0)

  const entries = useMemo(() => {
    const needle = term.trim().toLowerCase()
    if (!needle) return ERROR_CATALOG
    return ERROR_CATALOG.filter(
      (entry) =>
        entry.code.toLowerCase().includes(needle) ||
        entry.message.toLowerCase().includes(needle),
    )
  }, [term])

  const entriesRef = useRef(entries)
  useEffect(() => {
    entriesRef.current = entries
  }, [entries])

  useEffect(() => {
    if (!playing) return
    const timer = setInterval(() => {
      setCursor((current) => {
        const list = entriesRef.current
        if (list.length === 0 || current >= list.length) {
          setPlaying(false)
          return current
        }
        fire(list[current])
        return current + 1
      })
    }, PLAYBACK_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [playing])

  if (!import.meta.env.DEV) {
    return (
      <div className="p-8">
        <p className="text-sm text-slate-600">
          Esta página existe apenas em desenvolvimento.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-slate-900">
          Laboratório de toasts de erro
        </h1>
        <p className="max-w-3xl text-sm text-slate-600">
          Cada linha dispara o toast exato que a API produziria para aquele
          código. Os textos vêm do catálogo do backend — regere com{' '}
          <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">
            npm run errors:export
          </code>{' '}
          no allervia-backend.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={term}
          onChange={(event) => setTerm(event.target.value)}
          placeholder="Filtrar por código ou mensagem"
          className="h-10 w-72 rounded-lg border border-slate-300 px-3 text-sm outline-none focus:border-teal-500"
        />
        <span className="text-xs text-slate-500">
          {entries.length} de {ERROR_CATALOG.length}
        </span>
        <Button
          onClick={() => {
            setCursor(0)
            setPlaying((current) => !current)
          }}
        >
          <FontAwesomeIcon
            icon={playing ? faStop : faPlay}
            style={{ fontSize: 12 }}
          />
          <span className="ml-2">
            {playing ? 'Parar' : 'Percorrer todos'}
          </span>
        </Button>
        {playing && (
          <span className="text-xs text-slate-500">
            {cursor}/{entries.length}
          </span>
        )}
      </div>

      <section className="flex flex-wrap gap-2">
        {EDGE_CASES.map((edge) => (
          <button
            key={edge.label}
            type="button"
            onClick={edge.run}
            className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 transition-colors hover:border-teal-400 hover:text-teal-700"
          >
            {edge.label}
          </button>
        ))}
      </section>

      <ul className="flex flex-col divide-y divide-slate-200 rounded-xl border border-slate-200">
        {entries.map((entry) => (
          <li key={entry.code}>
            <button
              type="button"
              onClick={() => fire(entry)}
              className="flex w-full items-start gap-4 px-4 py-3 text-left transition-colors hover:bg-slate-50"
            >
              <span
                className={cn(
                  'mt-0.5 shrink-0 rounded-md border px-2 py-0.5 text-[11px] font-semibold tabular-nums',
                  STATUS_STYLE[toneOf(entry.status)],
                )}
              >
                {entry.status}
              </span>
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="font-mono text-xs font-semibold text-slate-900">
                  {entry.code}
                </span>
                <span className="mt-0.5 text-sm text-slate-600">
                  {entry.message}
                </span>
              </span>
              <span className="mt-0.5 shrink-0 text-[11px] text-slate-400">
                {STATUS_LABEL[entry.status] ?? ''}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}
