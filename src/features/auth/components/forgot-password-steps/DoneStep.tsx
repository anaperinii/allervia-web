import { Link } from '@tanstack/react-router'
import { ShieldCheck } from 'lucide-react'

export function DoneStep() {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-1.5">
        <h1 className="font-semibold text-[1.75rem] tracking-tight text-[color:var(--ink)]">Senha redefinida</h1>
        <p className="text-[0.84rem] leading-relaxed max-w-sm" style={{ color: 'var(--ink-soft)' }}>
          Sua senha foi atualizada com sucesso. Agora você pode acessar sua conta com a nova
          senha. Por segurança, todas as sessões anteriores foram encerradas.
        </p>
      </div>

      <Link
        to="/login"
        className="inline-flex w-full items-center justify-center rounded-lg h-10 text-sm font-semibold transition-[filter] duration-200 hover:brightness-95 no-underline cursor-pointer"
        style={{
          background: 'var(--btn)',
          color: 'var(--btn-ink)',
        }}
      >
        Acessar minha conta
      </Link>

      <div
        className="flex items-center gap-2 rounded-lg px-3.5 py-2.5"
        style={{
          background: 'var(--field)',
          border: '1px solid var(--bd)',
        }}
      >
        <ShieldCheck size={14} className="shrink-0" style={{ color: 'var(--accent)' }} />
        <p className="text-[0.6rem] leading-relaxed" style={{ color: 'var(--ink-faint)' }}>
          Caso não tenha solicitado esta alteração, entre em contato imediatamente com nosso
          suporte pelo e-mail seguranca@allervia.com.br.
        </p>
      </div>
    </>
  )
}
