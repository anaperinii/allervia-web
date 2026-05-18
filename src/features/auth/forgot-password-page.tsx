import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from '@tanstack/react-router'
import { AuthCard } from '@/features/auth/auth-card'
import { ArrowLeft, Mail, ShieldCheck, Clock, CheckCircle, KeyRound } from 'lucide-react'
import {
  forgotPasswordEmailSchema,
  forgotPasswordResetSchema,
  type ForgotPasswordEmailForm,
  type ForgotPasswordResetForm,
} from '@/features/auth/schemas/forgot-password'
import { TextInput, Reveal } from '@/shared/components'

type Step = 'request' | 'code' | 'reset' | 'done'

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [codeError, setCodeError] = useState<string | null>(null)

  const emailForm = useForm<ForgotPasswordEmailForm>({
    resolver: zodResolver(forgotPasswordEmailSchema),
    mode: 'onBlur',
    defaultValues: { email: '' },
  })

  const resetForm = useForm<ForgotPasswordResetForm>({
    resolver: zodResolver(forgotPasswordResetSchema),
    mode: 'onBlur',
    defaultValues: { password: '', confirmPassword: '' },
  })
  const passwordValue = resetForm.watch('password')

  const submitEmail = emailForm.handleSubmit((data) => {
    setSubmittedEmail(data.email)
    setStep('code')
  })

  const submitCode = () => {
    if (code.join('').length !== 6) {
      setCodeError('Insira o código completo de 6 dígitos')
      return
    }
    setCodeError(null)
    setStep('reset')
  }

  const submitReset = resetForm.handleSubmit(() => setStep('done'))

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) value = value.slice(-1)
    if (value && !/^\d$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)
    if (codeError) setCodeError(null)
    if (value && index < 5) document.getElementById(`code-${index + 1}`)?.focus()
  }

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      document.getElementById(`code-${index - 1}`)?.focus()
    }
  }

  const handleCodePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    if (pasted.length === 6) {
      setCode(pasted.split(''))
      document.getElementById('code-5')?.focus()
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-white pt-17">
      <div className="flex flex-1 items-center justify-center px-6 sm:px-8 gap-16 max-w-6xl mx-auto w-full py-10">
        <Reveal delay={100} className="flex flex-col w-full max-w-sm gap-6">

          {step === 'request' && (
            <form onSubmit={submitEmail} className="flex flex-col gap-6" noValidate>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-2">
                  <KeyRound size={22} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">Redefinição de senha</h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Informe o e-mail associado à sua conta. Enviaremos um código de verificação para confirmar sua identidade.
                </p>
              </div>

              <div className="flex flex-col gap-1.5">
                <label htmlFor="fp-email" className="text-xs font-medium text-(--text)/80">E-mail cadastrado</label>
                <TextInput
                  id="fp-email"
                  type="email"
                  placeholder="seu@email.com.br"
                  invalid={!!emailForm.formState.errors.email}
                  {...emailForm.register('email')}
                />
                {emailForm.formState.errors.email && (
                  <span className="text-[0.65rem] text-red-500">{emailForm.formState.errors.email.message}</span>
                )}
              </div>

              <button
                type="submit"
                disabled={emailForm.formState.isSubmitting}
                className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none disabled:opacity-50"
              >
                Enviar código de verificação
              </button>

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
          )}

          {step === 'code' && (
            <>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-2">
                  <Mail size={22} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">Verificação de identidade</h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Enviamos um código de 6 dígitos para <span className="font-semibold text-(--text)">{submittedEmail}</span>. Insira-o abaixo para continuar.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col items-center gap-1.5">
                  <label className="text-xs font-medium text-(--text)/80 self-start">Código de verificação</label>
                  <div className="flex gap-2.5" onPaste={handleCodePaste}>
                    {code.map((digit, i) => (
                      <input
                        key={i}
                        id={`code-${i}`}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleCodeChange(i, e.target.value)}
                        onKeyDown={(e) => handleCodeKeyDown(i, e)}
                        className={`w-11 h-12 rounded-xl border text-center text-lg font-bold bg-gray-50/60 focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent transition-all ${codeError ? 'border-red-400 bg-red-50/30' : 'border-(--border-custom)'}`}
                      />
                    ))}
                  </div>
                  {codeError && <span className="text-[0.65rem] text-red-500">{codeError}</span>}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={submitCode}
                  className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none"
                >
                  Verificar código
                </button>
                <div className="flex items-center justify-between">
                  <button onClick={() => setStep('request')} className="flex items-center gap-1.5 text-xs font-medium text-(--text-muted) hover:text-brand transition-colors bg-transparent border-none cursor-pointer">
                    <ArrowLeft size={13} />
                    Voltar
                  </button>
                  <button className="text-xs font-medium text-brand hover:underline bg-transparent border-none cursor-pointer">
                    Reenviar código
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-lg px-3.5 py-2.5">
                <Clock size={14} className="text-amber-600 shrink-0" />
                <p className="text-[0.6rem] text-amber-700 leading-relaxed">
                  O código expira em 10 minutos. Verifique também sua pasta de spam caso não encontre o e-mail.
                </p>
              </div>
            </>
          )}

          {step === 'reset' && (
            <form onSubmit={submitReset} className="flex flex-col gap-6" noValidate>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand/10 mb-2">
                  <ShieldCheck size={22} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">Criar nova senha</h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Defina uma nova senha segura para sua conta. Ela deve atender aos requisitos mínimos de segurança.
                </p>
              </div>

              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-password" className="text-xs font-medium text-(--text)/80">Nova senha</label>
                  <TextInput
                    id="fp-password"
                    type="password"
                    placeholder="Mínimo 8 caracteres"
                    invalid={!!resetForm.formState.errors.password}
                    {...resetForm.register('password')}
                  />
                  {resetForm.formState.errors.password && (
                    <span className="text-[0.65rem] text-red-500">{resetForm.formState.errors.password.message}</span>
                  )}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label htmlFor="fp-confirm" className="text-xs font-medium text-(--text)/80">Confirmar nova senha</label>
                  <TextInput
                    id="fp-confirm"
                    type="password"
                    placeholder="Repita a nova senha"
                    invalid={!!resetForm.formState.errors.confirmPassword}
                    {...resetForm.register('confirmPassword')}
                  />
                  {resetForm.formState.errors.confirmPassword && (
                    <span className="text-[0.65rem] text-red-500">{resetForm.formState.errors.confirmPassword.message}</span>
                  )}
                </div>

                <div className="bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-3">
                  <p className="text-[0.65rem] font-semibold text-(--text-muted) mb-2">Requisitos da senha:</p>
                  <div className="flex flex-col gap-1.5">
                    {[
                      { label: 'Mínimo de 8 caracteres', met: passwordValue.length >= 8 },
                      { label: 'Pelo menos uma letra maiúscula', met: /[A-Z]/.test(passwordValue) },
                      { label: 'Pelo menos uma letra minúscula', met: /[a-z]/.test(passwordValue) },
                      { label: 'Pelo menos um número', met: /\d/.test(passwordValue) },
                    ].map((req) => (
                      <div key={req.label} className="flex items-center gap-1.5">
                        <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center ${req.met ? 'bg-emerald-100' : 'bg-gray-200'}`}>
                          <CheckCircle size={9} className={req.met ? 'text-emerald-600' : 'text-gray-400'} />
                        </div>
                        <span className={`text-[0.65rem] ${req.met ? 'text-emerald-700 font-medium' : 'text-(--text-muted)'}`}>{req.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={resetForm.formState.isSubmitting}
                className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all cursor-pointer border-none disabled:opacity-50"
              >
                Redefinir senha
              </button>
            </form>
          )}

          {step === 'done' && (
            <>
              <div className="flex flex-col items-center text-center gap-1.5">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand/10 mb-2">
                  <CheckCircle size={26} className="text-brand" />
                </div>
                <h1 className="font-extrabold text-2xl text-(--text)">Senha redefinida</h1>
                <p className="text-xs text-(--text-muted) leading-relaxed max-w-xs">
                  Sua senha foi atualizada com sucesso. Agora você pode acessar sua conta com a nova senha. Por segurança, todas as sessões anteriores foram encerradas.
                </p>
              </div>

              <Link
                to="/login"
                className="w-full h-10 rounded-xl text-sm font-semibold text-white bg-linear-to-br from-brand to-teal-400 shadow-[0_2px_12px_rgba(20,184,166,0.3)] hover:-translate-y-px hover:shadow-[0_4px_20px_rgba(20,184,166,0.4)] transition-all no-underline flex items-center justify-center"
              >
                Acessar minha conta
              </Link>

              <div className="flex items-center gap-2 bg-gray-50 border border-(--border-custom) rounded-lg px-3.5 py-2.5">
                <ShieldCheck size={14} className="text-brand shrink-0" />
                <p className="text-[0.6rem] text-(--text-muted) leading-relaxed">
                  Caso não tenha solicitado esta alteração, entre em contato imediatamente com nosso suporte pelo e-mail seguranca@imunecare.com.br.
                </p>
              </div>
            </>
          )}
        </Reveal>

        <Reveal delay={200}>
          <AuthCard initialSlide={0} />
        </Reveal>
      </div>
    </div>
  )
}
