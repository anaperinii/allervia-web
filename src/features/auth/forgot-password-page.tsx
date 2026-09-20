import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthStepTransition } from '@/features/auth/components/AuthStepTransition'
import {
  forgotPasswordEmailSchema,
  forgotPasswordResetSchema,
  type ForgotPasswordEmailForm,
  type ForgotPasswordResetForm,
} from '@/features/auth/schemas/forgot-password'
import { RequestEmailStep } from '@/features/auth/components/forgot-password-steps/RequestEmailStep'
import { VerifyTokenStep } from '@/features/auth/components/forgot-password-steps/VerifyTokenStep'
import { NewPasswordStep } from '@/features/auth/components/forgot-password-steps/NewPasswordStep'
import { DoneStep } from '@/features/auth/components/forgot-password-steps/DoneStep'
import { toast } from '@/shared/components'
import {
  confirmPasswordReset,
  requestPasswordReset,
  verifyPasswordResetToken,
} from '@/shared/api/auth.api'
import { ApiError } from '@/shared/api/contracts/errors'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCheck } from '@fortawesome/free-solid-svg-icons'

type Step = 'request' | 'token' | 'reset' | 'done'

interface ForgotPasswordPageProps {
  /** Token vindo do link enviado por e-mail. */
  initialToken?: string
}

function describeFailure(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function ForgotPasswordPage({ initialToken }: ForgotPasswordPageProps = {}) {
  const [step, setStep] = useState<Step>(initialToken ? 'token' : 'request')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [token, setToken] = useState(initialToken ?? '')
  const [tokenError, setTokenError] = useState<string | null>(null)
  const [resendKey, setResendKey] = useState(0)
  const [verifying, setVerifying] = useState(false)
  const [resetError, setResetError] = useState<string | null>(null)

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

  const submitEmail = emailForm.handleSubmit(async (data) => {
    setSubmittedEmail(data.email)

    try {
      await requestPasswordReset(data.email)
    } catch (error) {
      // A resposta é deliberadamente indiferente à existência da conta; apenas
      // falhas de transporte chegam aqui.
      emailForm.setError('email', {
        message: describeFailure(error, 'Não foi possível enviar o e-mail agora.'),
      })
      return
    }

    setStep('token')
  })

  const submitToken = async () => {
    const value = token.trim()
    if (!value) {
      setTokenError('Informe o código recebido por e-mail')
      return
    }

    setVerifying(true)
    setTokenError(null)

    try {
      await verifyPasswordResetToken(value)
      setStep('reset')
    } catch (error) {
      setTokenError(describeFailure(error, 'Código inválido ou expirado.'))
    } finally {
      setVerifying(false)
    }
  }

  const handleTokenChange = (value: string) => {
    setToken(value)
    if (tokenError) setTokenError(null)
  }

  const handleResend = async () => {
    if (!submittedEmail) {
      setStep('request')
      return
    }

    try {
      await requestPasswordReset(submittedEmail)
    } catch (error) {
      setTokenError(describeFailure(error, 'Não foi possível reenviar o e-mail.'))
      return
    }

    setToken('')
    setTokenError(null)
    setResendKey((k) => k + 1)
    toast.success({
      icon: <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />,
      title: 'Novo e-mail de redefinição enviado',
      position: 'top-right',
      compact: true,
      autoDismissMs: 3000,
    })
  }

  const submitReset = resetForm.handleSubmit(async (data) => {
    setResetError(null)

    try {
      await confirmPasswordReset({ token: token.trim(), newPassword: data.password })
      setStep('done')
    } catch (error) {
      const message = describeFailure(error, 'Não foi possível redefinir a senha.')
      // Token consumido ou expirado devolve o usuário ao passo anterior.
      if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 409)) {
        setTokenError(message)
        setStep('token')
        return
      }
      setResetError(message)
    }
  })

  return (
    <AuthLayout animate={false}>
      <AuthStepTransition stepKey={step}>
        {step === 'request' && (
          <RequestEmailStep form={emailForm} onSubmit={() => void submitEmail()} />
        )}
        {step === 'token' && (
          <VerifyTokenStep
            token={token}
            onTokenChange={handleTokenChange}
            tokenError={tokenError}
            email={submittedEmail}
            resendKey={resendKey}
            submitting={verifying}
            onSubmit={() => void submitToken()}
            onBack={() => setStep('request')}
            onResend={() => void handleResend()}
          />
        )}
        {step === 'reset' && (
          <>
            <NewPasswordStep form={resetForm} onSubmit={() => void submitReset()} />
            {resetError && (
              <span className="text-[0.7rem] text-[color:var(--err)]" role="alert">
                {resetError}
              </span>
            )}
          </>
        )}
        {step === 'done' && <DoneStep />}
      </AuthStepTransition>
    </AuthLayout>
  )
}
