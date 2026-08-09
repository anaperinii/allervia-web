import { useState, type CSSProperties } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { loginSchema, type LoginForm } from '@/features/auth/schemas/login'

const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  fontFamily: 'inherit',
  fontSize: '13.5px',
  color: 'var(--ink)',
  background: 'var(--field)',
  border: '1px solid var(--field-bd)',
  borderRadius: 12,
}

export function LoginPage() {
  const navigate = useNavigate()
  const [showPw, setShowPw] = useState(false)

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
      <div>
        <h1
          className="text-[2.05rem] font-medium leading-[1.12] tracking-[-0.03em]"
          style={{ color: 'var(--ink)' }}
        >
          Bem-vindo(a) de volta
        </h1>
        <p
          className="mt-2.5 text-[0.92rem] leading-relaxed"
          style={{ color: 'var(--ink-soft)' }}
        >
          Acesse o prontuário, a agenda terapêutica e a progressão de doses dos seus pacientes.
        </p>
      </div>

      <form onSubmit={onSubmit} noValidate className="mt-6 flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-semibold tracking-[0.02em]" style={{ color: 'var(--ink)' }}>
            Email
          </span>
          <input
            type="email"
            placeholder="seu@email.com.br"
            autoComplete="email"
            maxLength={254}
            style={fieldStyle}
            {...register('email')}
          />
          {errors.email?.message && (
            <span className="text-[11.5px]" style={{ color: 'var(--err)' }}>
              {errors.email.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-semibold tracking-[0.02em]" style={{ color: 'var(--ink)' }}>
            Senha
          </span>
          <span className="relative flex items-center">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Insira aqui"
              autoComplete="current-password"
              maxLength={128}
              style={{ ...fieldStyle, paddingRight: 40 }}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-2 inline-flex items-center justify-center w-7.5 h-7.5 cursor-pointer bg-transparent border-none"
              style={{ color: 'var(--ink-faint)' }}
            >
              {showPw ? <EyeOff size={17} /> : <Eye size={17} />}
            </button>
          </span>
          {errors.password?.message && (
            <span className="text-[11.5px]" style={{ color: 'var(--err)' }}>
              {errors.password.message}
            </span>
          )}
        </label>

        <div className="flex items-center justify-end mt-0.5">
          <Link
            to="/forgot-password"
            className="text-[12.5px] font-medium no-underline hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1.5 w-full h-10 text-sm font-semibold rounded-lg cursor-pointer transition-[filter] duration-200 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ color: 'var(--btn-ink)', background: 'var(--btn)', border: 'none' }}
        >
          Entrar
        </button>

        <p className="mt-3 text-center text-[12.5px]" style={{ color: 'var(--ink-soft)' }}>
          Não possui uma conta?{' '}
          <Link to="/trial" className="font-semibold underline underline-offset-2" style={{ color: 'var(--accent-alt)' }}>
            Solicitar demonstração
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
