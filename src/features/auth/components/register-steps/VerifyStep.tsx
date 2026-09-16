import { Button, VerificationCodeInput } from '@/shared/components'
import { useCountdown } from '@/shared/hooks/useCountdown'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faClock, faEnvelope } from '@fortawesome/free-solid-svg-icons'

const CODE_TTL_SECONDS = 10 * 60

interface VerifyStepProps {
  code: string
  onCodeChange: (value: string) => void
  codeError: string | null
  maskedEmail: string
  resendKey: number
  onSubmit: () => void
  onResend: () => void
}

export function VerifyStep({ code, onCodeChange, codeError, maskedEmail, resendKey, onSubmit, onResend }: VerifyStepProps) {
  const { formatted, isExpired } = useCountdown(CODE_TTL_SECONDS, resendKey)

  return (
    <>
      <div className="flex flex-col items-center text-center gap-1.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full mb-1 bg-[var(--field)] border border-[color:var(--field-bd)]">
          <FontAwesomeIcon icon={faEnvelope} className="text-[color:var(--accent)]" style={{ fontSize: 22 }} />
        </div>
        <h1 className="font-extrabold text-2xl text-[color:var(--ink)]">Verifique sua conta</h1>
        <p className="text-xs text-[color:var(--ink-soft)] leading-relaxed max-w-xs">
          Enviamos um código para <span className="font-semibold text-[color:var(--ink)]">{maskedEmail}</span>.
          <br />
          Insira-o abaixo para ativar sua conta.
        </p>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <label className="text-xs font-medium text-(--text)/80 self-start">Código de verificação</label>
        <VerificationCodeInput value={code} onChange={onCodeChange} error={codeError} autoFocus />
        {codeError && <span className="text-[0.6rem] text-[color:var(--err)]">{codeError}</span>}
      </div>

      <Button tone="brand" variant="solid" prominent fullWidth size="lg" onClick={onSubmit} disabled={isExpired}>
        Verificar e ativar conta
      </Button>

      <div className="flex items-center justify-end">
        <button onClick={onResend} className="text-xs font-medium text-[color:var(--accent)] hover:underline bg-transparent border-none cursor-pointer">
          Reenviar código
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
            <>O código expirou. Solicite um novo para continuar.</>
          ) : (
            <>
              O código expira em <span className="font-bold tabular-nums">{formatted}</span>. Caso não encontre o e-mail, verifique sua pasta de spam ou promoções.
            </>
          )}
        </p>
      </div>
    </>
  )
}
