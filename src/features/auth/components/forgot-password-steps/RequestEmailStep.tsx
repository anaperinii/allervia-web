import { Link } from '@tanstack/react-router'
import { ChevronLeft, KeyRound } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { FieldLabel, TextInput } from '@/shared/components'
import type { ForgotPasswordEmailForm } from '@/features/auth/schemas/forgot-password'

interface RequestEmailStepProps {
  form: UseFormReturn<ForgotPasswordEmailForm>
  onSubmit: (event: React.BaseSyntheticEvent) => void
}

export function RequestEmailStep({ form, onSubmit }: RequestEmailStepProps) {
  const errors = form.formState.errors

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col items-center text-center gap-1.5">
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-full mb-2 overflow-hidden"
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
          <KeyRound size={22} style={{ color: '#9BC1C4' }} />
        </div>
        <h1 className="font-semibold text-2xl tracking-tight text-white">Redefinição de senha</h1>
        <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Informe o e-mail associado à sua conta. Enviaremos um código de verificação para
          confirmar sua identidade.
        </p>
      </div>

      <FieldLabel label="E-mail cadastrado" error={errors.email?.message}>
        <TextInput
          type="email"
          placeholder="seu@email.com.br"
          invalid={!!errors.email}
          {...form.register('email')}
        />
      </FieldLabel>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-lg py-3 text-sm font-semibold transition-[filter] duration-200 hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background:
            'linear-gradient(to bottom right, #6C9EA5, #4d7e85)',
          color: '#ffffff',
          boxShadow:
            '0 2px 12px rgba(108,158,165,0.3)',
        }}
      >
        Enviar código de verificação
      </button>

      <Link
        to="/login"
        className="flex items-center justify-start gap-1.5 text-xs font-medium no-underline transition-colors"
        style={{ color: 'rgba(255,255,255,0.65)' }}
      >
        <ChevronLeft size={13} />
        Voltar
      </Link>
    </form>
  )
}
