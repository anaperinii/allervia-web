import { useState, type CSSProperties, type FormEvent } from 'react'
import type { MfaChallenge } from '@/shared/api/contracts/account'

const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  fontFamily: 'inherit',
  fontSize: '13.5px',
  color: 'var(--ink)',
  background: 'var(--field)',
  border: '1px solid var(--field-bd)',
  borderRadius: 12,
}

interface SecondFactorStepProps {
  challenge: MfaChallenge
  error: string | null
  submitting: boolean
  onSubmit: (code: string) => void
  onBack: () => void
}

/**
 * Segundo fator do login. Quando a conta ainda não tem fator cadastrado, o
 * mesmo passo mostra o segredo para o aplicativo autenticador — a sessão
 * clínica só nasce depois que um código válido confirma o cadastro.
 */
export function SecondFactorStep({
  challenge,
  error,
  submitting,
  onSubmit,
  onBack,
}: SecondFactorStepProps) {
  const [code, setCode] = useState('')
  const enrolling = challenge.status === 'MFA_ENROLLMENT_REQUIRED'

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    onSubmit(code.trim())
  }

  return (
    <div>
      <h1
        className="text-[2.05rem] font-medium leading-[1.12] tracking-[-0.03em]"
        style={{ color: 'var(--ink)' }}
      >
        {enrolling ? 'Configure seu segundo fator' : 'Verificação em duas etapas'}
      </h1>
      <p
        className="mt-2.5 text-[0.92rem] leading-relaxed"
        style={{ color: 'var(--ink-soft)' }}
      >
        {enrolling
          ? 'Sua conta acessa dados clínicos e precisa de um segundo fator. Cadastre o segredo abaixo no seu aplicativo autenticador e confirme com o código gerado.'
          : 'Informe o código do seu aplicativo autenticador ou um código de recuperação.'}
      </p>

      {enrolling && challenge.enrollment && (
        <div
          className="mt-4 rounded-xl p-3 text-[0.8rem] leading-relaxed break-all"
          style={{
            background: 'var(--field)',
            border: '1px solid var(--field-bd)',
            color: 'var(--ink)',
          }}
        >
          <div className="font-semibold">Chave de configuração</div>
          <code className="mt-1 block select-all">{challenge.enrollment.secret}</code>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5">
          <span
            className="text-[11.5px] font-semibold tracking-[0.02em]"
            style={{ color: 'var(--ink)' }}
          >
            Código de verificação
          </span>
          <input
            type="text"
            inputMode="text"
            autoComplete="one-time-code"
            placeholder="000000"
            maxLength={32}
            value={code}
            onChange={(event) => setCode(event.target.value)}
            style={fieldStyle}
          />
        </label>

        {error && (
          <span className="text-[11.5px]" style={{ color: 'var(--err)' }} role="alert">
            {error}
          </span>
        )}

        <button
          type="submit"
          disabled={submitting || code.trim().length === 0}
          className="mt-1.5 w-full h-10 text-sm font-semibold rounded-lg cursor-pointer transition-[filter] duration-200 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ color: 'var(--btn-ink)', background: 'var(--btn)', border: 'none' }}
        >
          {enrolling ? 'Confirmar cadastro' : 'Verificar'}
        </button>

        <button
          type="button"
          onClick={onBack}
          className="text-[12.5px] font-medium underline underline-offset-2 cursor-pointer bg-transparent border-none"
          style={{ color: 'var(--ink-soft)' }}
        >
          Voltar para o início
        </button>
      </form>
    </div>
  )
}
