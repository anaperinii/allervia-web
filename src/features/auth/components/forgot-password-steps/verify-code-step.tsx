import { ArrowLeft, Clock, Mail } from 'lucide-react'
import { Button, VerificationCodeInput } from '@/shared/components'
import { useCountdown } from '@/shared/hooks/use-countdown'

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
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-2">
          <Mail size={22} className="text-brand" />
        </div>
        <h1 className="font-extrabold text-2xl text-(--text)">Verificação de identidade</h1>
        <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
          Enviamos um código para <span className="font-semibold text-(--text)">{email}</span>.
          <br />
          Insira-o abaixo para continuar.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center gap-1.5">
          <label className="text-xs font-medium text-(--text)/80 self-start">Código de verificação</label>
          <VerificationCodeInput value={code} onChange={onCodeChange} error={codeError} autoFocus />
          {codeError && <span className="text-[0.65rem] text-red-500">{codeError}</span>}
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <Button tone="brand" variant="solid" prominent fullWidth size="lg" onClick={onSubmit} disabled={isExpired}>
          Verificar código
        </Button>
        <div className="flex items-center justify-between">
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-medium text-(--text-muted) hover:text-brand transition-colors bg-transparent border-none cursor-pointer">
            <ArrowLeft size={13} />
            Voltar
          </button>
          <button onClick={onResend} className="text-xs font-medium text-brand hover:underline bg-transparent border-none cursor-pointer">
            Reenviar código
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 backdrop-blur-md bg-amber-200/25 border border-amber-300/40">
        <Clock size={14} className="text-amber-600 shrink-0" />
        <p className="text-[0.65rem] text-amber-800 leading-relaxed">
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
