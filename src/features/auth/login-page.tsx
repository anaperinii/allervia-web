import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserRound } from 'lucide-react'
import { AuthLayout } from '@/features/auth/components/auth-layout'
import { loginSchema, type LoginForm } from '@/features/auth/forms/login'
import { Button, FieldLabel, TextInput, PasswordInput } from '@/shared/components'

export function LoginPage() {
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const onSubmit = handleSubmit(() => {
    navigate({ to: '/immunotherapies' })
  })

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center gap-1.5">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-2">
          <UserRound size={22} className="text-brand" />
        </div>
        <h1 className="font-extrabold text-2xl text-(--text)">Bem-vindo(a) de volta</h1>
        <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
          Não possui uma conta?{' '}
          <Link to="/trial" className="font-medium text-brand hover:underline no-underline">Começar agora</Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FieldLabel label="Email" required error={errors.email?.message}>
          <TextInput
            type="email"
            placeholder="seu@email.com.br"
            invalid={!!errors.email}
            autoComplete="email"
            maxLength={254}
            {...register('email')}
          />
        </FieldLabel>

        <FieldLabel label="Senha" required error={errors.password?.message}>
          <PasswordInput
            placeholder="Insira aqui"
            invalid={!!errors.password}
            autoComplete="current-password"
            maxLength={128}
            {...register('password')}
          />
        </FieldLabel>

        <div className="flex flex-col gap-3">
          <Button type="submit" tone="brand" variant="solid" prominent fullWidth size="lg" disabled={isSubmitting}>
            Log in
          </Button>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-xs font-medium text-brand hover:underline no-underline">Esqueceu a senha?</Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
