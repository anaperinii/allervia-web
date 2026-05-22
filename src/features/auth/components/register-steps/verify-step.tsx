import { Clock, Mail } from 'lucide-react'
import { Button, VerificationCodeInput } from '@/shared/components'
import { useCountdown } from '@/shared/hooks/use-countdown'

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
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-1">
          <Mail size={22} className="text-brand" />
        </div>
        <h1 className="font-extrabold text-2xl text-(--text)">Verifique sua conta</h1>
        <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
          Enviamos um código de 6 dígitos para <span className="font-semibold text-(--text)">{maskedEmail}</span>. Insira-o abaixo para ativar sua conta.
        </p>
      </div>

      <div className="flex flex-col items-center gap-1.5">
        <label className="text-xs font-medium text-(--text)/80 self-start">Código de verificação</label>
        <VerificationCodeInput value={code} onChange={onCodeChange} error={codeError} autoFocus />
        {codeError && <span className="text-[0.6rem] text-red-500">{codeError}</span>}
      </div>

      <Button tone="brand" variant="solid" prominent fullWidth size="lg" onClick={onSubmit} disabled={isExpired}>
        Verificar e ativar conta
      </Button>

      <div className="flex items-center justify-end">
        <button onClick={onResend} className="text-xs font-medium text-brand hover:underline bg-transparent border-none cursor-pointer">
          Reenviar código
        </button>
      </div>

      <div className="flex items-center gap-2 rounded-lg px-3.5 py-2.5 backdrop-blur-md bg-amber-200/25 border border-amber-300/40">
        <Clock size={14} className="text-amber-600 shrink-0" />
        <p className="text-[0.65rem] text-amber-800 leading-relaxed">
          {isExpired ? (
            <>O código expirou. Solicite um novo para continuar.</>
          ) : (
            <>
              O código expira em <span className="font-semibold tabular-nums">{formatted}</span>. Caso não encontre o e-mail, verifique sua pasta de spam ou promoções.
            </>
          )}
        </p>
      </div>
    </>
  )
}
