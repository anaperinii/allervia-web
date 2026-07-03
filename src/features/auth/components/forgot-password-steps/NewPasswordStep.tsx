import { ShieldCheck } from 'lucide-react'
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
        <div
          className="flex h-12 w-12 items-center justify-center rounded-full mb-2 border"
          style={{
            background: 'rgba(108,158,165,0.18)',
            borderColor: 'rgba(108,158,165,0.30)',
          }}
        >
          <ShieldCheck size={22} style={{ color: '#9BC1C4' }} />
        </div>
        <h1 className="font-semibold text-2xl tracking-tight text-white">Criar nova senha</h1>
        <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
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
        className="inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all hover:brightness-95 hover:shadow-[0_14px_40px_rgba(108,158,165,0.45),inset_0_1px_0_rgba(255,255,255,0.55)]! disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
        style={{
          background:
            'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), #6C9EA5',
          color: '#06232a',
          boxShadow:
            '0 12px 28px rgba(108,158,165,0.30), inset 0 1px 0 rgba(255,255,255,0.4)',
        }}
      >
        Redefinir senha
      </button>
    </form>
  )
}
