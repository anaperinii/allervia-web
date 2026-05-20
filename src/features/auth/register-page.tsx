import { useState, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthCard } from '@/features/auth/components/auth-card'
import { registerSchema, type RegisterForm } from '@/features/auth/forms/register'
import { Reveal } from '@/shared/components'
import { WelcomeStep } from '@/features/auth/components/register-steps/welcome-step'
import { FormStep } from '@/features/auth/components/register-steps/form-step'
import { VerifyStep } from '@/features/auth/components/register-steps/verify-step'
import { DoneStep } from '@/features/auth/components/register-steps/done-step'

type Step = 'welcome' | 'form' | 'verify' | 'done'

const STUB_INVITE = {
  email: 'jaque.rod55@gmail.com',
  inviterName: 'Tatiana Gonçalves de Abreu',
  organizationName: 'Clínica ImuneCare',
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  return `${local.slice(0, 3)}${'*'.repeat(Math.max(local.length - 3, 3))}@${domain}`
}

export function RegisterPage() {
  const [step, setStep] = useState<Step>('welcome')
  const [code, setCode] = useState('')
  const [codeError, setCodeError] = useState<string | null>(null)
  const [submittedData, setSubmittedData] = useState<RegisterForm | null>(null)

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

  return (
    <div className="flex flex-col min-h-screen bg-white pt-17">
      <div className="flex flex-1 items-center justify-center px-6 sm:px-8 gap-16 max-w-6xl mx-auto w-full py-10">
        <Reveal delay={100}>
          <AuthCard initialSlide={1} />
        </Reveal>

        <Reveal delay={200} className="flex flex-col w-full max-w-sm gap-6">
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
              onSubmit={submitCode}
            />
          )}
          {step === 'done' && submittedData && (
            <DoneStep data={submittedData} maskedEmail={maskedEmail} />
          )}
        </Reveal>
      </div>
    </div>
  )
}
