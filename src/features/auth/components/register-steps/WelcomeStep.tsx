import { Smile, ArrowRight } from 'lucide-react'
import { Button } from '@/shared/components'

interface WelcomeStepProps {
  maskedEmail: string
  inviterName: string
  organizationName: string
  onContinue: () => void
}

export function WelcomeStep({ maskedEmail, inviterName, organizationName, onContinue }: WelcomeStepProps) {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-2">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-1">
          <Smile size={22} className="text-brand" />
        </div>
        <h1 className="font-extrabold text-2xl text-(--text)">É um prazer ter você aqui</h1>
        <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
          Seu acesso ao <span className="font-semibold text-(--text)">ImuneCare</span> chegou! Configure sua conta agora e comece a usar o sistema.
        </p>
      </div>

      <div className="border border-(--border-custom) rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-2.5 border-b border-(--border-custom)">
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-(--text-muted)">Detalhes do convite</span>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-(--text-muted)">Convidado por</span>
            <span className="text-[0.7rem] font-semibold text-(--text)">{inviterName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-(--text-muted)">Organização</span>
            <span className="text-[0.7rem] font-semibold text-(--text)">{organizationName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-(--text-muted)">E-mail vinculado</span>
            <span className="text-[0.7rem] font-semibold text-brand">{maskedEmail}</span>
          </div>
        </div>
      </div>

      <Button tone="brand" variant="solid" prominent fullWidth size="lg" rightIcon={<ArrowRight size={14} />} onClick={onContinue}>
        Completar meu cadastro
      </Button>
    </>
  )
}
