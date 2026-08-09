import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Check } from 'lucide-react'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthStepTransition } from '@/features/auth/components/AuthStepTransition'
import { registerSchema, type RegisterForm } from '@/features/auth/schemas/register'
import { WelcomeStep } from '@/features/auth/components/register-steps/WelcomeStep'
import { FormStep } from '@/features/auth/components/register-steps/FormStep'
import { VerifyStep } from '@/features/auth/components/register-steps/VerifyStep'
import { DoneStep } from '@/features/auth/components/register-steps/DoneStep'
import { toast } from '@/shared/components'
import { maskWithPrefix } from '@/shared/lib/mask'

type Step = 'welcome' | 'form' | 'verify' | 'done'

const STUB_INVITE = {
  email: 'jaque.rod55@gmail.com',
  inviterName: 'Tatiana Gonçalves de Abreu',
  organizationName: 'Instituto Vitality',
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  return `${maskWithPrefix(local)}@${domain}`
}

export function RegisterPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [submittedData, setSubmittedData] = useState<RegisterForm | null>(null)
  const [resendKey, setResendKey] = useState(0)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: { name: '', password: '', confirmPassword: '', specialty: '' },
  })

  const maskedEmail = useMemo(() => maskEmail(STUB_INVITE.email), [])

  const submitForm = form.handleSubmit((data) => {
    setSubmittedData(data)
    setStep('verify')
  })

  const submitCode = () => {
    if (code.length !== 6) {
      setCodeError('Insira o código completo de 6 dígitos')
      return
    }
    setCodeError(null)
    setStep('done')
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

  return (
    <AuthLayout animate={false}>
      <AuthStepTransition stepKey={step}>
        {step === 'welcome' && (
          <WelcomeStep
            maskedEmail={maskedEmail}
            inviterName={STUB_INVITE.inviterName}
            organizationName={STUB_INVITE.organizationName}
            onContinue={() => setStep('form')}
          />
        )}
        {step === 'form' && (
          <FormStep form={form} maskedEmail={maskedEmail} onSubmit={submitForm} />
        )}
        {step === 'verify' && (
          <VerifyStep
            code={code}
            onCodeChange={handleCodeChange}
            codeError={codeError}
            maskedEmail={maskedEmail}
            resendKey={resendKey}
            onSubmit={submitCode}
            onResend={handleResendCode}
          />
        )}
        {step === 'done' && submittedData && (
          <DoneStep data={submittedData} maskedEmail={maskedEmail} />
        )}
      </AuthStepTransition>
    </AuthLayout>
  )
}
