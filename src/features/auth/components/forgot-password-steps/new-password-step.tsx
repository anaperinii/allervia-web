import { ShieldCheck } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Button, FieldLabel, PasswordInput, PasswordRequirements } from '@/shared/components'
import type { ForgotPasswordResetForm } from '@/features/auth/forms/forgot-password'

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
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-2">
          <ShieldCheck size={22} className="text-brand" />
        </div>
        <h1 className="font-extrabold text-2xl text-(--text)">Criar nova senha</h1>
        <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
          Defina uma nova senha segura para sua conta.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <FieldLabel label="Nova senha" required error={errors.password?.message}>
          <PasswordInput
            placeholder="Mínimo 8 caracteres"
            invalid={!!errors.password}
            {...form.register('password')}
          />
        </FieldLabel>

        <FieldLabel label="Confirmar nova senha" required error={errors.confirmPassword?.message}>
          <PasswordInput
            placeholder="Repita a nova senha"
            invalid={!!errors.confirmPassword}
            {...form.register('confirmPassword')}
          />
        </FieldLabel>

        <PasswordRequirements password={password} />
      </div>

      <Button type="submit" tone="brand" variant="solid" prominent fullWidth size="lg" disabled={form.formState.isSubmitting}>
        Redefinir senha
      </Button>
    </form>
  )
}
