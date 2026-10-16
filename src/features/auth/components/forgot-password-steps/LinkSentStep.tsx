import type { CSSProperties } from 'react'
import { useCountdown } from '@/shared/hooks/useCountdown'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faClock, faEnvelopeOpenText } from '@fortawesome/free-solid-svg-icons'

const LINK_TTL_SECONDS = 10 * 60

const iconBadgeStyle: CSSProperties = {
  width: 48,
  height: 48,
  borderRadius: '50%',
  background: 'var(--field)',
  border: '1px solid var(--bd)',
}

interface LinkSentStepProps {
  email: string
  resendKey: number
  submitting: boolean
  resendError: string | null
  onBack: () => void
  onResend: () => void
}

export function LinkSentStep({
  email,
  resendKey,
  submitting,
  resendError,
  onBack,
  onResend,
}: LinkSentStepProps) {
  const { formatted, isExpired } = useCountdown(LINK_TTL_SECONDS, resendKey)

  return (
    <>
      <div className="flex flex-col items-center text-center gap-3">
        <div className="flex items-center justify-center" style={iconBadgeStyle}>
          <FontAwesomeIcon icon={faEnvelopeOpenText} style={{ fontSize: 18, color: 'var(--accent)' }} />
        </div>
        <h1 className="font-semibold text-[1.75rem] tracking-tight text-[color:var(--ink)]">
          Verifique seu e-mail
        </h1>
        <p className="text-[0.84rem] leading-relaxed max-w-sm" style={{ color: 'var(--ink-soft)' }}>
          Se houver uma conta para{' '}
          <span className="font-semibold text-[color:var(--ink)]">{email || 'seu e-mail'}</span>,
          enviamos um link de redefinição para sua caixa de entrada.
          <br />
          Abra o e-mail e clique no link para continuar. Verifique também a pasta de spam.
        </p>
      </div>

      {resendError && (
        <span className="text-[0.7rem] text-[color:var(--err)] text-center" role="alert">
          {resendError}
        </span>
      )}

      <div className="flex items-center justify-between">
        <button
          disabled={submitting}
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs font-medium bg-transparent border-none cursor-pointer transition-colors"
          style={{ color: 'var(--ink-soft)' }}
        >
          <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 13 }} />
          Voltar
        </button>
        <button
          disabled={submitting}
          onClick={onResend}
          className="text-xs font-medium hover:underline bg-transparent border-none cursor-pointer disabled:opacity-70"
          style={{ color: 'var(--accent)' }}
        >
          Reenviar e-mail
        </button>
      </div>

      <div
        className="flex items-center gap-2 rounded-lg px-3.5 py-2.5"
        style={{
          background: 'var(--glass)',
          border: '1px solid var(--glass-bd)',
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <FontAwesomeIcon icon={faClock} className="shrink-0" style={{ fontSize: 14, color: 'var(--glass-ink)' }} />
        <p className="text-[0.72rem] leading-relaxed" style={{ color: 'var(--glass-ink)' }}>
          {isExpired ? (
            <>O prazo estimado nesta tela terminou. O link continua valendo conforme o servidor; se não funcionar mais, solicite um novo.</>
          ) : (
            <>
              Prazo estimado do link: <span className="font-bold tabular-nums">{formatted}</span>. Depois disso, solicite um novo.
            </>
          )}
        </p>
      </div>
    </>
  )
}
