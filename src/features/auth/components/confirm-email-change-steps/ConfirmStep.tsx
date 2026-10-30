import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelopeCircleCheck } from '@fortawesome/free-solid-svg-icons'

interface ConfirmStepProps {
  newEmail: string
  submitting: boolean
  error: string | null
  onConfirm: () => void
}

export function ConfirmStep({ newEmail, submitting, error, onConfirm }: ConfirmStepProps) {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-1.5">
        <FontAwesomeIcon icon={faEnvelopeCircleCheck} style={{ fontSize: 24, color: 'var(--accent)' }} />
        <h1 className="font-semibold text-[1.75rem] tracking-tight text-[color:var(--ink)]">
          Confirmar troca de e-mail
        </h1>
        <p className="text-[0.84rem] leading-relaxed max-w-sm" style={{ color: 'var(--ink-soft)' }}>
          Seu e-mail de acesso será alterado para{' '}
          <span className="font-semibold" style={{ color: 'var(--ink)' }}>{newEmail}</span>.
        </p>
      </div>

      <button
        onClick={onConfirm}
        disabled={submitting}
        className="inline-flex w-full items-center justify-center rounded-lg h-10 text-sm font-semibold transition-[filter] duration-200 hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        style={{ background: 'var(--btn)', color: 'var(--btn-ink)' }}
      >
        Confirmar troca
      </button>

      {error && (
        <span className="text-[0.7rem] text-[color:var(--err)]" role="alert">
          {error}
        </span>
      )}
    </>
  )
}
