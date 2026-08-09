import { Link } from '@tanstack/react-router'
import { ChevronLeft } from 'lucide-react'
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
        <h1 className="font-semibold text-[1.75rem] tracking-tight text-[color:var(--ink)]">Redefinição de senha</h1>
        <p className="text-[0.84rem] leading-relaxed max-w-sm" style={{ color: 'var(--ink-soft)' }}>
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
        className="inline-flex w-full items-center justify-center rounded-lg h-10 text-sm font-semibold transition-[filter] duration-200 hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background:
            'var(--btn)',
          color: 'var(--btn-ink)',
        }}
      >
        Enviar código de verificação
      </button>

      <Link
        to="/login"
        className="flex items-center justify-start gap-1.5 text-xs font-medium no-underline transition-colors"
        style={{ color: 'var(--ink-soft)' }}
      >
        <ChevronLeft size={13} />
        Voltar
      </Link>
    </form>
  )
}
