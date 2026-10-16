import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'

interface InvalidLinkStepProps {
  message: string
  submitting: boolean
  onRequestNew: () => void
}

export function InvalidLinkStep({ message, submitting, onRequestNew }: InvalidLinkStepProps) {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-1.5">
        <FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 24, color: 'var(--err)' }} />
        <h1 className="font-semibold text-[1.75rem] tracking-tight text-[color:var(--ink)]">
          Link inválido
        </h1>
        <p className="text-[0.84rem] leading-relaxed max-w-sm" style={{ color: 'var(--ink-soft)' }}>
          {message}
        </p>
      </div>

      <button
        onClick={onRequestNew}
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-lg h-10 text-sm font-semibold transition-[filter] duration-200 hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        style={{ background: 'var(--btn)', color: 'var(--btn-ink)' }}
      >
        Solicitar novo link
      </button>
    </>
  )
}
