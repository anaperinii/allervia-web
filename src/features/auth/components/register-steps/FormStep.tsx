import type { UseFormReturn } from 'react-hook-form'
import { Button, FieldLabel, TextInput, PasswordInput, PasswordRequirements } from '@/shared/components'
import type { RegisterForm } from '@/features/auth/schemas/register'

interface FormStepProps {
  form: UseFormReturn<RegisterForm>
  maskedEmail: string
  onSubmit: (event: React.BaseSyntheticEvent) => void
}

export function FormStep({ form, maskedEmail, onSubmit }: FormStepProps) {
  const password = form.watch('password')
  const errors = form.formState.errors

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6" noValidate>
      <div className="flex flex-col items-center text-center gap-1.5">
        <h1 className="font-extrabold text-2xl text-[color:var(--ink)]">Complete seu cadastro</h1>
        <p className="text-xs text-[color:var(--ink-soft)] leading-relaxed max-w-xs">
          Preencha os dados abaixo para finalizar a configuração da sua conta e começar a utilizar o Allervia.
        </p>
      </div>

      <div className="flex flex-col gap-3.5">
        <FieldLabel label="Nome completo" error={errors.name?.message}>
          <TextInput
            type="text"
            placeholder="Seu nome completo"
            invalid={!!errors.name}
            {...form.register('name')}
          />
        </FieldLabel>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-(--text-muted)">E-mail</label>
            <span className="text-[0.6rem] text-[color:var(--accent)]">Definido pelo administrador</span>
          </div>
          <TextInput
            type="email"
            value={maskedEmail}
            readOnly
            className="text-(--text-muted) cursor-default bg-gray-100/60"
          />
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          <FieldLabel label="Senha" error={errors.password?.message}>
            <PasswordInput
              placeholder="Mín. 8 caracteres"
              invalid={!!errors.password}
              iconSize={14}
              {...form.register('password')}
            />
          </FieldLabel>
          <FieldLabel label="Confirmar senha" error={errors.confirmPassword?.message}>
            <PasswordInput
              placeholder="Repita a senha"
              invalid={!!errors.confirmPassword}
              iconSize={14}
              {...form.register('confirmPassword')}
            />
          </FieldLabel>
        </div>

        <PasswordRequirements password={password} />

        <FieldLabel label="Especialidade" error={errors.specialty?.message}>
          <TextInput
            type="text"
            placeholder="Ex.: Alergologia e Imunologia"
            invalid={!!errors.specialty}
            maxLength={80}
            {...form.register('specialty')}
          />
        </FieldLabel>
      </div>

      <Button type="submit" tone="brand" variant="solid" prominent fullWidth size="lg" disabled={form.formState.isSubmitting}>
        Criar conta
      </Button>

      <p className="text-[0.55rem] text-[color:var(--ink-soft)] text-center leading-relaxed">
        Ao criar sua conta, você concorda com os{' '}
        <a href="#" className="text-[color:var(--accent)] no-underline hover:underline">Termos de Uso</a> e a{' '}
        <a href="#" className="text-[color:var(--accent)] no-underline hover:underline">Política de Privacidade</a> do Allervia.
      </p>
    </form>
  )
}
