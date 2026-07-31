import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { loginSchema, type LoginForm } from '@/features/auth/schemas/login'
import { FieldLabel, TextInput, PasswordInput } from '@/shared/components'

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
      <div className="flex flex-col items-center text-center gap-1.5 mt-3">
        <h1 className="font-semibold text-3xl tracking-tight text-white">Bem-vindo(a) de volta</h1>
        <p className="text-xs leading-relaxed max-w-xs" style={{ color: 'rgba(255,255,255,0.65)' }}>
          Não possui uma conta?{' '}
          <Link
            to="/trial"
            className="font-medium hover:underline no-underline"
            style={{ color: '#9BC1C4' }}
          >
            Solicitar demonstração
          </Link>
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
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center rounded-lg py-3 text-sm font-semibold text-white transition-[filter] duration-200 hover:brightness-95 disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background: 'linear-gradient(to bottom right, #6C9EA5, #4d7e85)',
              boxShadow: '0 2px 12px rgba(108,158,165,0.3)',
            }}
          >
            Entrar
          </button>
          <div className="flex justify-end">
            <Link
              to="/forgot-password"
              className="text-xs font-medium hover:underline no-underline"
              style={{ color: '#9BC1C4' }}
            >
              Esqueceu a senha?
            </Link>
          </div>
        </div>
      </form>
    </AuthLayout>
  )
}
