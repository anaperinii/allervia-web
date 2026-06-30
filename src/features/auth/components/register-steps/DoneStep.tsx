import { CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components'
import type { RegisterForm } from '@/features/auth/schemas/register'

interface DoneStepProps {
  data: RegisterForm
  maskedEmail: string
}

export function DoneStep({ data, maskedEmail }: DoneStepProps) {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 mb-1">
          <CheckCircle size={26} className="text-brand" />
        </div>
        <h1 className="font-extrabold text-2xl text-(--text)">Conta ativada com sucesso!</h1>
        <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
          Sua conta foi verificada e está pronta para uso.
        </p>
      </div>

      <div className="border border-(--border-custom) rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-2.5 border-b border-(--border-custom)">
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted)">Resumo da conta</span>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-(--text-muted)">Nome</span>
            <span className="text-[0.7rem] font-semibold text-(--text)">{data.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-(--text-muted)">E-mail</span>
            <span className="text-[0.7rem] font-semibold text-brand">{maskedEmail}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-(--text-muted)">Especialidade</span>
            <span className="text-[0.7rem] font-semibold text-(--text)">{data.specialty}</span>
          </div>
        </div>
      </div>

      <Button tone="brand" variant="solid" prominent fullWidth size="lg" to="/login" rightIcon={<ArrowRight size={14} />}>
        Acessar o Allervia
      </Button>
    </>
  )
}
