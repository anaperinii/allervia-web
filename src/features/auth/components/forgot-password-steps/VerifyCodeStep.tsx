import { ChevronLeft, Clock } from 'lucide-react'
import { VerificationCodeInput } from '@/shared/components'
import { useCountdown } from '@/shared/hooks/useCountdown'

const CODE_TTL_SECONDS = 10 * 60

interface VerifyCodeStepProps {
  code: string
  onCodeChange: (value: string) => void
  codeError: string | null
  email: string
  resendKey: number
  onSubmit: () => void
  onBack: () => void
  onResend: () => void
}

export function VerifyCodeStep({ code, onCodeChange, codeError, email, resendKey, onSubmit, onBack, onResend }: VerifyCodeStepProps) {
  const { formatted, isExpired } = useCountdown(CODE_TTL_SECONDS, resendKey)

  return (
    <>
      <div className="flex flex-col items-center text-center gap-1.5">
        <h1 className="font-semibold text-[1.75rem] tracking-tight text-[color:var(--ink)]">
          Verificação de identidade
        </h1>
        <p className="text-[0.84rem] leading-relaxed max-w-sm" style={{ color: 'var(--ink-soft)' }}>
          Enviamos um código para <span className="font-semibold text-[color:var(--ink)]">{email}</span>.
          <br />
          Insira-o abaixo para continuar.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1.5">
          <label className="text-xs font-medium self-start" style={{ color: 'var(--ink-soft)' }}>
            Código de verificação
          </label>
          <VerificationCodeInput value={code} onChange={onCodeChange} error={codeError} autoFocus />
          {codeError && <span className="text-[0.65rem] text-[color:var(--err)]">{codeError}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onSubmit}
          disabled={isExpired}
          className="inline-flex w-full items-center justify-center rounded-lg h-10 text-sm font-semibold transition-[filter] duration-200 hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: 'var(--btn)',
            color: 'var(--btn-ink)',
          }}
        >
          Verificar código
        </button>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium bg-transparent border-none cursor-pointer transition-colors"
            style={{ color: 'var(--ink-soft)' }}
          >
            <ChevronLeft size={13} />
            Voltar
          </button>
          <button
            onClick={onResend}
            className="text-xs font-medium hover:underline bg-transparent border-none cursor-pointer"
            style={{ color: 'var(--accent)' }}
          >
            Reenviar código
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
        <Clock size={14} className="shrink-0" style={{ color: 'var(--glass-ink)' }} />
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
