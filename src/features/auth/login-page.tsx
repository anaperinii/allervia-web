import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthCard } from '@/features/auth/auth-card'
import { Eye, EyeOff } from 'lucide-react'
import { loginSchema, type LoginForm } from '@/features/auth/forms/login'
import { TextInput, Reveal } from '@/shared/components'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)

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
            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-email" className="text-xs font-medium text-(--text)/80">Email</label>
              <TextInput
                id="login-email"
                type="email"
                placeholder="seu@email.com.br"
                invalid={!!errors.email}
                autoComplete="email"
                maxLength={254}
                {...register('email')}
              />
              {errors.email && <span className="text-[0.6rem] text-red-500 mt-0.5 block">{errors.email.message}</span>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="login-password" className="text-xs font-medium text-(--text)/80">Senha</label>
              <div className="relative">
                <TextInput
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Insira aqui"
                  invalid={!!errors.password}
                  className="h-11 pr-10 text-sm"
                  autoComplete="current-password"
                  maxLength={128}
                  {...register('password')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-(--text-muted)/60 hover:text-(--text-muted) transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <span className="text-[0.6rem] text-red-500 mt-0.5 block">{errors.password.message}</span>}
            </div>

            <div className="flex flex-col gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Log in
              </button>
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
