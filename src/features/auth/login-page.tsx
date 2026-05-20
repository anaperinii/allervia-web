import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthCard } from '@/features/auth/components/auth-card'
import { loginSchema, type LoginForm } from '@/features/auth/forms/login'
import { Button, FieldLabel, TextInput, PasswordInput, Reveal } from '@/shared/components'

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
    <div className="flex flex-col min-h-screen bg-white pt-17">
      <div className="flex flex-1 items-center justify-center px-6 sm:px-8 gap-16 max-w-6xl mx-auto w-full py-10">
        <Reveal delay={100} className="flex flex-col w-full max-w-sm gap-7">
          <div className="flex flex-col items-center text-center gap-1.5">
            <h1 className="font-extrabold text-3xl text-(--text)">Bem-vindo(a) de volta</h1>
            <p className="text-sm text-(--text-muted)">
              Não possui uma conta?{' '}
              <Link to="/trial" className="font-medium text-brand hover:underline no-underline">Começar agora</Link>
            </p>
          </div>

          <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
            <FieldLabel label="Email" error={errors.email?.message}>
              <TextInput
                type="email"
                placeholder="seu@email.com.br"
                invalid={!!errors.email}
                autoComplete="email"
                maxLength={254}
                {...register('email')}
              />
            </FieldLabel>

            <FieldLabel label="Senha" error={errors.password?.message}>
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
        </Reveal>

        <Reveal delay={200}>
          <AuthCard initialSlide={0} />
        </Reveal>
      </div>
    </div>
  )
}
