import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthCard } from '@/features/auth/components/auth-card'
import {
  forgotPasswordEmailSchema,
  forgotPasswordResetSchema,
  type ForgotPasswordEmailForm,
  type ForgotPasswordResetForm,
} from '@/features/auth/forms/forgot-password'
import { Reveal } from '@/shared/components'
import { RequestEmailStep } from '@/features/auth/components/forgot-password-steps/request-email-step'
import { VerifyCodeStep } from '@/features/auth/components/forgot-password-steps/verify-code-step'
import { NewPasswordStep } from '@/features/auth/components/forgot-password-steps/new-password-step'
import { DoneStep } from '@/features/auth/components/forgot-password-steps/done-step'

type Step = 'request' | 'code' | 'reset' | 'done'

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [code, setCode] = useState('')
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

  const submitEmail = emailForm.handleSubmit((data) => {
    setSubmittedEmail(data.email)
    setStep('code')
  })

  const submitCode = () => {
    if (code.length !== 6) {
      setCodeError('Insira o código completo de 6 dígitos')
      return
    }
    setCodeError(null)
    setStep('reset')
  }

  const handleCodeChange = (value: string) => {
    setCode(value)
    if (codeError) setCodeError(null)
  }

  const submitReset = resetForm.handleSubmit(() => setStep('done'))

  return (
    <div className="flex flex-col min-h-screen bg-white pt-17">
      <div className="flex flex-1 items-center justify-center px-6 sm:px-8 gap-16 max-w-6xl mx-auto w-full py-10">
        <Reveal delay={100} className="flex flex-col w-full max-w-sm gap-6">
          {step === 'request' && (
            <RequestEmailStep form={emailForm} onSubmit={submitEmail} />
          )}
          {step === 'code' && (
            <VerifyCodeStep
              code={code}
              onCodeChange={handleCodeChange}
              codeError={codeError}
              email={submittedEmail}
              onSubmit={submitCode}
              onBack={() => setStep('request')}
            />
          )}
          {step === 'reset' && (
            <NewPasswordStep form={resetForm} onSubmit={submitReset} />
          )}
          {step === 'done' && <DoneStep />}
        </Reveal>

        <Reveal delay={200}>
          <AuthCard initialSlide={0} />
        </Reveal>
      </div>
    </div>
  )
}
