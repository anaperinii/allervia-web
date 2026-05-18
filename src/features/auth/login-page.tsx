import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { AuthCard } from '@/features/auth/auth-card'
import { Eye, EyeOff } from 'lucide-react'
import { validateEmail } from '@/shared/lib/validators'
import { TextInput, Reveal } from '@/shared/components'

export function LoginPage() {
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  const touch = (field: string) => setTouched((t) => ({ ...t, [field]: true }))

  const clearError = (field: string) => {
    if (errors[field]) setErrors((prev) => { const n = { ...prev }; delete n[field]; return n })
  }

  const validate = (): boolean => {
    const e: Record<string, string> = {}
    const emailErr = validateEmail(email)
    if (emailErr) e.email = emailErr
    if (!password) e.password = 'Senha é obrigatória'
    else if (password.length < 8) e.password = 'A senha deve ter no mínimo 8 caracteres'
    setErrors(e)
    setTouched({ email: true, password: true })
    return Object.keys(e).length === 0
  }

  function handleLogin() {
    if (!validate()) return
    navigate({ to: '/immunotherapies' })
  }

  const isInvalid = (field: string) => !!(errors[field] && touched[field])
  const ErrMsg = ({ field }: { field: string }) =>
    errors[field] && touched[field] ? <span className="text-[0.6rem] text-red-500 mt-0.5 block">{errors[field]}</span> : null

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

          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-(--text)/80">Email</label>
              <TextInput
                type="email"
                placeholder="seu@email.com.br"
                value={email}
                onChange={(e) => { setEmail(e.target.value); clearError('email') }}
                onBlur={() => {
                  touch('email')
                  const err = validateEmail(email)
                  if (err) setErrors((p) => ({ ...p, email: err }))
                }}
                invalid={isInvalid('email')}
                autoComplete="email"
                maxLength={254}
              />
              <ErrMsg field="email" />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-(--text)/80">Senha</label>
              <div className="relative">
                <TextInput
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Insira aqui"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password') }}
                  onBlur={() => touch('password')}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin() }}
                  invalid={isInvalid('password')}
                  className="h-11 pr-10 text-sm"
                  autoComplete="current-password"
                  maxLength={128}
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
              <ErrMsg field="password" />
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleLogin}
              className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none"
            >
              Log in
            </button>
            <div className="flex justify-end">
              <Link to="/forgot-password" className="text-xs font-medium text-brand hover:underline no-underline">Esqueceu a senha?</Link>
            </div>
          </div>
        </Reveal>

        <Reveal delay={200}>
          <AuthCard initialSlide={0} />
        </Reveal>
      </div>
    </div>
  )
}
