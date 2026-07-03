import { Link } from '@tanstack/react-router'
import { CheckCircle, ShieldCheck } from 'lucide-react'

export function DoneStep() {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-1.5">
        <div
          className="flex h-14 w-14 items-center justify-center rounded-full mb-2 border"
          style={{
            background: 'rgba(108,158,165,0.18)',
            borderColor: 'rgba(108,158,165,0.30)',
          }}
        >
          <CheckCircle size={26} style={{ color: '#9BC1C4' }} />
        </div>
        <h1 className="font-semibold text-2xl tracking-tight text-white">Senha redefinida</h1>
        <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Sua senha foi atualizada com sucesso. Agora você pode acessar sua conta com a nova
          senha. Por segurança, todas as sessões anteriores foram encerradas.
        </p>
      </div>

      <Link
        to="/login"
        className="inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all hover:brightness-95 hover:shadow-[0_14px_40px_rgba(108,158,165,0.45),inset_0_1px_0_rgba(255,255,255,0.55)]! no-underline cursor-pointer"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), #6C9EA5',
          color: '#06232a',
          boxShadow:
            '0 12px 28px rgba(108,158,165,0.30), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        Acessar minha conta
      </Link>

      <div
        className="flex items-center gap-2 rounded-lg px-3.5 py-2.5"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        <ShieldCheck size={14} className="shrink-0" style={{ color: '#9BC1C4' }} />
        <p className="text-[0.6rem] leading-relaxed" style={{ color: 'rgba(255,255,255,0.60)' }}>
          Caso não tenha solicitado esta alteração, entre em contato imediatamente com nosso
          suporte pelo e-mail seguranca@allervia.com.br.
        </p>
      </div>
    </>
  )
}
