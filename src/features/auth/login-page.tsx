import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { UserRound } from 'lucide-react'
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
    navigate({ to: '/home' })
  })

  return (
    <AuthLayout>
      <div className="flex flex-col items-center text-center gap-1.5">
        <div
          className="relative flex h-12 w-12 items-center justify-center rounded-full mb-2 overflow-hidden"
          style={{
            background:
              'radial-gradient(circle at 20% 22%, rgba(255,255,255,0.28) 0%, transparent 40%), radial-gradient(circle at 80% 18%, rgba(255,255,255,0.16) 0%, transparent 45%), radial-gradient(circle at 78% 82%, rgba(255,255,255,0.22) 0%, transparent 45%), radial-gradient(circle at 22% 80%, rgba(255,255,255,0.14) 0%, transparent 42%), rgba(255,255,255,0.03)',
            border: '1px solid rgba(255,255,255,0.22)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            boxShadow:
              'inset 0 0 14px rgba(255,255,255,0.18), inset 0 1px 0 rgba(255,255,255,0.35), inset 0 -1px 0 rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.20)',
          }}
        >
          <UserRound size={22} style={{ color: '#9BC1C4' }} />
        </div>
        <h1 className="font-semibold text-2xl tracking-tight text-white">Bem-vindo(a) de volta</h1>
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
            className="inline-flex w-full items-center justify-center rounded-xl py-3 text-sm font-semibold transition-all hover:brightness-95 hover:shadow-[0_14px_40px_rgba(108,158,165,0.45),inset_0_1px_0_rgba(255,255,255,0.55)]! disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), #6C9EA5',
              color: '#06232a',
              boxShadow:
                '0 12px 28px rgba(108,158,165,0.30), inset 0 1px 0 rgba(255,255,255,0.4)',
            }}
          >
            Log in
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
