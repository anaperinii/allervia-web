import { ChevronLeft, Clock, Mail } from 'lucide-react'
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
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-full mb-2 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 20% 22%, rgba(255,255,255,0.28) 0%, transparent 40%), radial-gradient(circle at 80% 18%, rgba(255,255,255,0.16) 0%, transparent 45%), radial-gradient(circle at 78% 82%, rgba(255,255,255,0.22) 0%, transparent 45%), radial-gradient(circle at 22% 80%, rgba(255,255,255,0.14) 0%, transparent 42%), rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.22)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow:
              'inset 0 0 14px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.20)',
          }}
        >
          <Mail size={22} style={{ color: '#9BC1C4' }} />
        </div>
        <h1 className="font-semibold text-2xl tracking-tight text-white">
          Verificação de identidade
        </h1>
        <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Enviamos um código para <span className="font-semibold text-white">{email}</span>.
          <br />
          Insira-o abaixo para continuar.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1.5">
          <label className="text-xs font-medium self-start" style={{ color: 'rgba(255,255,255,0.80)' }}>
            Código de verificação
          </label>
          <VerificationCodeInput value={code} onChange={onCodeChange} error={codeError} autoFocus />
          {codeError && <span className="text-[0.65rem] text-red-400">{codeError}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <button
          onClick={onSubmit}
          disabled={isExpired}
          className="inline-flex w-full items-center justify-center rounded-lg py-3 text-sm font-semibold transition-[filter] duration-200 hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background:
              'linear-gradient(to bottom right, #6C9EA5, #4d7e85)',
            color: '#ffffff',
            boxShadow:
              '0 2px 12px rgba(108,158,165,0.3)',
          }}
        >
          Verificar código
        </button>
        <div className="flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-xs font-medium bg-transparent border-none cursor-pointer transition-colors"
            style={{ color: 'rgba(255,255,255,0.65)' }}
          >
            <ChevronLeft size={13} />
            Voltar
          </button>
          <button
            onClick={onResend}
            className="text-xs font-medium hover:underline bg-transparent border-none cursor-pointer"
            style={{ color: '#9BC1C4' }}
          >
            Reenviar código
          </button>
        </div>
      </div>

      <div
        className="flex items-center gap-2 rounded-lg px-3.5 py-2.5"
        style={{
          background: 'rgba(251, 191, 36, 0.08)',
          border: '1px solid rgba(251, 191, 36, 0.28)',
        }}
      >
        <Clock size={14} className="shrink-0" style={{ color: '#fbbf24' }} />
        <p className="text-[0.65rem] leading-relaxed" style={{ color: 'rgba(253, 224, 130, 0.85)' }}>
          {isExpired ? (
            <>O código expirou. Solicite um novo para continuar.</>
          ) : (
            <>
              O código expira em <span className="font-semibold tabular-nums">{formatted}</span>. Verifique também sua pasta de spam caso não encontre o e-mail.
            </>
          )}
        </p>
      </div>
    </>
  )
}
