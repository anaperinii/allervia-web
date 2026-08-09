import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthStepTransition } from '@/features/auth/components/AuthStepTransition'
import {
  forgotPasswordEmailSchema,
  forgotPasswordResetSchema,
  type ForgotPasswordEmailForm,
  type ForgotPasswordResetForm,
} from '@/features/auth/schemas/forgot-password'
import { RequestEmailStep } from '@/features/auth/components/forgot-password-steps/RequestEmailStep'
import { VerifyCodeStep } from '@/features/auth/components/forgot-password-steps/VerifyCodeStep'
import { NewPasswordStep } from '@/features/auth/components/forgot-password-steps/NewPasswordStep'
import { DoneStep } from '@/features/auth/components/forgot-password-steps/DoneStep'
import { toast } from '@/shared/components'

type Step = 'request' | 'code' | 'reset' | 'done'

export function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>('request')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [resendKey, setResendKey] = useState(0)

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

  const handleResendCode = () => {
    setCode('')
    setCodeError(null)
    setResendKey((k) => k + 1)
    toast.success({
      icon: <Check size={14} />,
      title: 'Novo código enviado para o seu email',
      position: 'top-right',
      compact: true,
      autoDismissMs: 3000,
    })
  }

  const submitReset = resetForm.handleSubmit(() => setStep('done'))

  return (
    <AuthLayout animate={false}>
      <AuthStepTransition stepKey={step}>
        {step === 'request' && <RequestEmailStep form={emailForm} onSubmit={submitEmail} />}
        {step === 'code' && (
          <VerifyCodeStep
            code={code}
            onCodeChange={handleCodeChange}
            codeError={codeError}
            email={submittedEmail}
            resendKey={resendKey}
            onSubmit={submitCode}
            onBack={() => setStep('request')}
            onResend={handleResendCode}
          />
        )}
        {step === 'reset' && <NewPasswordStep form={resetForm} onSubmit={submitReset} />}
        {step === 'done' && <DoneStep />}
      </AuthStepTransition>
    </AuthLayout>
  )
}
