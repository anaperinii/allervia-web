import { Mail, ShieldCheck } from 'lucide-react'
import { Button, VerificationCodeInput } from '@/shared/components'

interface VerifyStepProps {
  code: string
  onCodeChange: (value: string) => void
  codeError: string | null
  maskedEmail: string
  onSubmit: () => void
  onResend?: () => void
}

export function VerifyStep({ code, onCodeChange, codeError, maskedEmail, onSubmit, onResend }: VerifyStepProps) {
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

      <Button tone="brand" variant="solid" prominent fullWidth size="lg" onClick={onSubmit}>
        Verificar e ativar conta
      </Button>

      <div className="flex items-center justify-end">
        <button onClick={onResend} className="text-xs font-medium text-brand hover:underline bg-transparent border-none cursor-pointer">
          Reenviar código
        </button>
      </div>

      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
        <ShieldCheck size={14} className="text-amber-600 shrink-0" />
        <p className="text-[0.6rem] text-amber-700 leading-relaxed">
          O código expira em 10 minutos. Caso não encontre o e-mail, verifique sua pasta de spam ou promoções.
        </p>
      </div>
    </>
  )
}
