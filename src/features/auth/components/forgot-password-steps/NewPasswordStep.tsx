import type { UseFormReturn } from 'react-hook-form'
import { FieldLabel, PasswordInput, PasswordRequirements } from '@/shared/components'
import type { ForgotPasswordResetForm } from '@/features/auth/schemas/forgot-password'

interface NewPasswordStepProps {
  form: UseFormReturn<ForgotPasswordResetForm>
  onSubmit: (event: React.BaseSyntheticEvent) => void
}

export function NewPasswordStep({ form, onSubmit }: NewPasswordStepProps) {
  const password = form.watch('password')
  const errors = form.formState.errors

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col items-center text-center gap-1.5">
        <h1 className="font-semibold text-[1.75rem] tracking-tight text-[color:var(--ink)]">Criar nova senha</h1>
        <p className="text-[0.84rem] leading-relaxed max-w-sm" style={{ color: 'var(--ink-soft)' }}>
          Defina uma nova senha segura para sua conta.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <FieldLabel label="Nova senha" error={errors.password?.message}>
          <PasswordInput
            placeholder="Mínimo 8 caracteres"
            invalid={!!errors.password}
            {...form.register('password')}
          />
        </FieldLabel>

        <FieldLabel label="Confirmar nova senha" error={errors.confirmPassword?.message}>
          <PasswordInput
            placeholder="Repita a nova senha"
            invalid={!!errors.confirmPassword}
            {...form.register('confirmPassword')}
          />
        </FieldLabel>

        <PasswordRequirements password={password} />
      </div>

      <button
        type="submit"
        disabled={form.formState.isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-lg h-10 text-sm font-semibold transition-[filter] duration-200 hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background: 'var(--btn)',
          color: 'var(--btn-ink)',
        }}
      >
        Redefinir senha
      </button>
    </form>
  )
}
