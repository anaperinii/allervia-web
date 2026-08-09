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
        <div className="flex h-14 w-14 items-center justify-center rounded-full mb-1 bg-[var(--field)] border border-[color:var(--field-bd)]">
          <CheckCircle size={26} className="text-[color:var(--accent)]" />
        </div>
        <h1 className="font-extrabold text-2xl text-[color:var(--ink)]">Conta ativada com sucesso!</h1>
        <p className="text-xs text-[color:var(--ink-soft)] leading-relaxed max-w-xs">
          Sua conta foi verificada e está pronta para uso.
        </p>
      </div>

      <div className="border border-[color:var(--bd)] rounded-xl overflow-hidden bg-[var(--field)]">
        <div className="px-4 py-2.5 border-b border-[color:var(--bd)]">
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-[color:var(--ink-soft)]">Resumo da conta</span>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-[color:var(--ink-soft)]">Nome</span>
            <span className="text-[0.7rem] font-semibold text-[color:var(--ink)]">{data.name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-[color:var(--ink-soft)]">E-mail</span>
            <span className="text-[0.7rem] font-semibold text-[color:var(--accent)]">{maskedEmail}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-[color:var(--ink-soft)]">Especialidade</span>
            <span className="text-[0.7rem] font-semibold text-[color:var(--ink)]">{data.specialty}</span>
          </div>
        </div>
      </div>

      <Button tone="brand" variant="solid" prominent fullWidth size="lg" to="/login" rightIcon={<ArrowRight size={14} />}>
        Acessar o Allervia
      </Button>
    </>
  )
}
