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
          className="flex h-12 w-12 items-center justify-center rounded-full mb-2 border"
          style={{
            background: 'rgba(108,158,165,0.18)',
            borderColor: 'rgba(108,158,165,0.30)',
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
        className="inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all hover:brightness-95 hover:shadow-[0_14px_40px_rgba(108,158,165,0.45),inset_0_1px_0_rgba(255,255,255,0.55)]! disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), #6C9EA5',
          color: '#06232a',
          boxShadow:
            '0 12px 28px rgba(108,158,165,0.30), inset 0 1px 0 rgba(255,255,255,0.4)',
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
