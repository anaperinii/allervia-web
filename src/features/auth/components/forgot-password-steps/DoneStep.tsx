import { Link } from '@tanstack/react-router'
import { CheckCircle, ShieldCheck } from 'lucide-react'

export function DoneStep() {
  return (
    <>
      <div className="flex flex-col items-center text-center gap-1.5">
        <div
          className="relative flex h-14 w-14 items-center justify-center rounded-full mb-2 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 20% 22%, rgba(255,255,255,0.28) 0%, transparent 40%), radial-gradient(circle at 80% 18%, rgba(255,255,255,0.16) 0%, transparent 45%), radial-gradient(circle at 78% 82%, rgba(255,255,255,0.22) 0%, transparent 45%), radial-gradient(circle at 22% 80%, rgba(255,255,255,0.14) 0%, transparent 42%), rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.22)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow:
              'inset 0 0 14px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.20)',
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
        className="inline-flex w-full items-center justify-center rounded-lg py-3 text-sm font-semibold transition-[filter] duration-200 hover:brightness-95 no-underline cursor-pointer"
        style={{
          background:
            'linear-gradient(to bottom right, #6C9EA5, #4d7e85)',
          color: '#ffffff',
          boxShadow:
            '0 2px 12px rgba(108,158,165,0.3)',
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
