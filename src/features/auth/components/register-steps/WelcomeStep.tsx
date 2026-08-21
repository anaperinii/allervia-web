import { Button } from '@/shared/components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowRight, faFaceSmile } from '@fortawesome/free-solid-svg-icons'

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
        <div className="flex h-12 w-12 items-center justify-center rounded-full mb-1 bg-[var(--field)] border border-[color:var(--field-bd)]">
          <FontAwesomeIcon icon={faFaceSmile} className="text-[color:var(--accent)]" style={{ fontSize: 22 }} />
        </div>
        <h1 className="font-extrabold text-2xl text-[color:var(--ink)]">É um prazer ter você aqui</h1>
        <p className="text-xs text-[color:var(--ink-soft)] leading-relaxed max-w-xs">
          Seu acesso ao <span className="font-semibold text-[color:var(--ink)]">Allervia</span> chegou! Configure sua conta agora e comece a usar o sistema.
        </p>
      </div>

      <div className="border border-[color:var(--bd)] rounded-xl overflow-hidden bg-[var(--field)]">
        <div className="px-4 py-2.5 border-b border-[color:var(--bd)]">
          <span className="text-[0.6rem] font-semibold uppercase tracking-wider text-[color:var(--ink-soft)]">Detalhes do convite</span>
        </div>
        <div className="px-4 py-3 flex flex-col gap-2.5">
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-[color:var(--ink-soft)]">Convidado por</span>
            <span className="text-[0.7rem] font-semibold text-[color:var(--ink)]">{inviterName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-[color:var(--ink-soft)]">Organização</span>
            <span className="text-[0.7rem] font-semibold text-[color:var(--ink)]">{organizationName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[0.7rem] text-[color:var(--ink-soft)]">E-mail vinculado</span>
            <span className="text-[0.7rem] font-semibold text-[color:var(--accent)]">{maskedEmail}</span>
          </div>
        </div>
      </div>

      <Button tone="brand" variant="solid" prominent fullWidth size="lg" rightIcon={<FontAwesomeIcon icon={faArrowRight} style={{ fontSize: 14 }} />} onClick={onContinue}>
        Completar meu cadastro
      </Button>
    </>
  )
}
