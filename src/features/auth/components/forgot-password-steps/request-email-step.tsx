import { Link } from '@tanstack/react-router'
import { ArrowLeft, KeyRound } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Button, FieldLabel, TextInput } from '@/shared/components'
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
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-2">
          <KeyRound size={22} className="text-brand" />
        </div>
        <h1 className="font-extrabold text-2xl text-(--text)">Redefinição de senha</h1>
        <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
          Informe o e-mail associado à sua conta. Enviaremos um código de verificação para confirmar sua identidade.
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

      <Button type="submit" tone="brand" variant="solid" prominent fullWidth size="lg" disabled={form.formState.isSubmitting}>
        Enviar código de verificação
      </Button>

      <Link to="/login" className="flex items-center justify-start gap-1.5 text-xs font-medium text-(--text-muted) hover:text-brand no-underline transition-colors">
        <ArrowLeft size={13} />
        Voltar
      </Link>
    </form>
  )
}
