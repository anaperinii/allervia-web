import { CheckCircle, ShieldCheck } from 'lucide-react'
import { Button } from '@/shared/components'

export function DoneStep() {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-1.5">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 mb-2">
          <CheckCircle size={26} className="text-brand" />
        </div>
        <h1 className="font-extrabold text-2xl text-(--text)">Senha redefinida</h1>
        <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
          Sua senha foi atualizada com sucesso. Agora você pode acessar sua conta com a nova senha. Por segurança, todas as sessões anteriores foram encerradas.
        </p>
      </div>

      <Button tone="brand" variant="solid" prominent fullWidth size="lg" to="/login">
        Acessar minha conta
      </Button>

      <div className="flex items-center gap-2 bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5">
        <ShieldCheck size={14} className="text-brand shrink-0" />
        <p className="text-[0.6rem] text-(--text-muted) leading-relaxed">
          Caso não tenha solicitado esta alteração, entre em contato imediatamente com nosso suporte pelo e-mail seguranca@imunecare.com.br.
        </p>
      </div>
    </>
  )
}
