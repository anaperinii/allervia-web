import { Link } from '@tanstack/react-router'
import { ArrowLeft, KeyRound, ShieldCheck } from 'lucide-react'
import type { UseFormReturn } from 'react-hook-form'
import { Button, FieldLabel, TextInput } from '@/shared/components'
import type { ForgotPasswordEmailForm } from '@/features/auth/forms/forgot-password'

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

      <div className="flex items-center gap-2 bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5">
        <ShieldCheck size={14} className="text-brand shrink-0" />
        <p className="text-[0.6rem] text-(--text-muted) leading-relaxed">
          Este processo é protegido por criptografia de ponta a ponta. Nenhum dado sensível é armazenado durante a verificação.
        </p>
      </div>

      <Link to="/login" className="flex items-center justify-end gap-1.5 text-xs font-medium text-(--text-muted) hover:text-brand no-underline transition-colors">
        <ArrowLeft size={13} />
        Voltar ao login
      </Link>
    </form>
  )
}
