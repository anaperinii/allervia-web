import type { CSSProperties } from 'react'
import { useCountdown } from '@/shared/hooks/useCountdown'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronLeft, faClock } from '@fortawesome/free-solid-svg-icons'

/** O backend emite o token de redefinição com validade de 10 minutos. */
const TOKEN_TTL_SECONDS = 10 * 60

const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  fontFamily: 'inherit',
  fontSize: '13px',
  color: 'var(--ink)',
  background: 'var(--field)',
  border: '1px solid var(--field-bd)',
  borderRadius: 12,
}

interface VerifyTokenStepProps {
  token: string
  onTokenChange: (value: string) => void
  tokenError: string | null
  email: string
  resendKey: number
  submitting: boolean
  onSubmit: () => void
  onBack: () => void
  onResend: () => void
}

/**
 * O e-mail de redefinição traz um link com o token. Abrir o link preenche este
 * campo; colar o valor manualmente também funciona. Não existe código curto de
 * seis dígitos neste fluxo — o token é o que o servidor emitiu.
 */
export function VerifyTokenStep({
  token,
  onTokenChange,
  tokenError,
  email,
  resendKey,
  submitting,
  onSubmit,
  onBack,
  onResend,
}: VerifyTokenStepProps) {
  const { formatted, isExpired } = useCountdown(TOKEN_TTL_SECONDS, resendKey)

  return (
    <>
      <div className="flex flex-col items-center text-center gap-1.5">
        <h1 className="font-semibold text-[1.75rem] tracking-tight text-[color:var(--ink)]">
          Verificação de identidade
        </h1>
        <p className="text-[0.84rem] leading-relaxed max-w-sm" style={{ color: 'var(--ink-soft)' }}>
          Se houver uma conta para{' '}
          <span className="font-semibold text-[color:var(--ink)]">{email}</span>, enviamos
          um link de redefinição.
          <br />
          Abra o link ou cole o código recebido abaixo.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-medium" style={{ color: 'var(--ink-soft)' }}>
            Código de redefinição
          </span>
          <input
            type="text"
            autoComplete="one-time-code"
            placeholder="Cole aqui o código recebido por e-mail"
            value={token}
            maxLength={256}
            onChange={(event) => onTokenChange(event.target.value)}
            style={fieldStyle}
          />
          {tokenError && (
            <span className="text-[0.65rem] text-[color:var(--err)]" role="alert">
              {tokenError}
            </span>
          )}
        </label>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onSubmit}
          disabled={isExpired || submitting || token.trim().length === 0}
          className="inline-flex w-full items-center justify-center rounded-lg h-10 text-sm font-semibold transition-[filter] duration-200 hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          style={{ background: 'var(--btn)', color: 'var(--btn-ink)' }}
        >
          Verificar código
        </button>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium bg-transparent border-none cursor-pointer transition-colors"
            style={{ color: 'var(--ink-soft)' }}
          >
            <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: 13 }} />
            Voltar
          </button>
          <button
            onClick={onResend}
            className="text-xs font-medium hover:underline bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--accent)' }}
          >
            Reenviar e-mail
          </button>
        </div>
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
            <>O código expirou. Solicite um novo para continuar.</>
          ) : (
            <>
              O código expira em <span className="font-bold tabular-nums">{formatted}</span>. Verifique também sua pasta de spam caso não encontre o e-mail.
            </>
          )}
        </p>
      </div>
    </>
  )
}
