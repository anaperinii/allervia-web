import { useEffect, useRef, useState } from 'react'
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
import { LinkSentStep } from '@/features/auth/components/forgot-password-steps/LinkSentStep'
import { InvalidLinkStep } from '@/features/auth/components/forgot-password-steps/InvalidLinkStep'
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
import { faCheck, faCircleNotch } from '@fortawesome/free-solid-svg-icons'

type Step = 'request' | 'sent' | 'verifying' | 'invalid' | 'reset' | 'done'

interface ForgotPasswordPageProps {
  initialToken?: string
}

function describeFailure(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function ForgotPasswordPage({ initialToken }: ForgotPasswordPageProps = {}) {
  const verificationInFlight = useRef(false)
  const resendInFlight = useRef(false)
  const [resending, setResending] = useState(false)
  const [step, setStep] = useState<Step>(initialToken ? 'verifying' : 'request')
  const [submittedEmail, setSubmittedEmail] = useState('')
  const [token, setToken] = useState('')
  const [resendError, setResendError] = useState<string | null>(null)
  const [invalidLinkMessage, setInvalidLinkMessage] = useState('')
  const [resendKey, setResendKey] = useState(0)
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

  useEffect(() => {
    if (!initialToken || verificationInFlight.current) return
    verificationInFlight.current = true

    verifyPasswordResetToken(initialToken)
      .then(() => {
        setToken(initialToken)
        setStep('reset')
      })
      .catch((error: unknown) => {
        setInvalidLinkMessage(
          describeFailure(error, 'Esse link de redefinição é inválido ou já expirou.'),
        )
        setStep('invalid')
      })
      .finally(() => {
        verificationInFlight.current = false
      })
    // Runs once for the token carried by the magic link that opened this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const submitEmail = emailForm.handleSubmit(async (data) => {
    setSubmittedEmail(data.email)

    try {
      await requestPasswordReset(data.email)
    } catch (error) {
      emailForm.setError('email', {
        message: describeFailure(error, 'Não foi possível enviar o e-mail agora.'),
      })
      return
    }

    setStep('sent')
  })

  const handleResend = async () => {
    if (resendInFlight.current) return
    if (!submittedEmail) {
      setStep('request')
      return
    }

    resendInFlight.current = true
    setResending(true)
    try {
      await requestPasswordReset(submittedEmail)
    } catch (error) {
      setResendError(describeFailure(error, 'Não foi possível reenviar o e-mail.'))
      return
    } finally {
      resendInFlight.current = false
      setResending(false)
    }

    setResendError(null)
    setResendKey((k) => k + 1)
    toast.success({
      icon: <FontAwesomeIcon icon={faCheck} style={{ fontSize: 14 }} />,
      title: 'Solicitação de redefinição recebida',
      position: 'top-right',
      compact: true,
      autoDismissMs: 3000,
    })
  }

  const submitReset = resetForm.handleSubmit(async (data) => {
    setResetError(null)

    try {
      await confirmPasswordReset({ token, newPassword: data.password })
      setToken('')
      resetForm.reset()
      setStep('done')
    } catch (error) {
      const message = describeFailure(error, 'Não foi possível redefinir a senha.')
      if (error instanceof ApiError && (error.statusCode === 404 || error.statusCode === 409)) {
        resetForm.reset()
        setToken('')
        setInvalidLinkMessage(message)
        setStep('invalid')
        return
      }
      setResetError(message)
    }
  })

  return (
    <AuthLayout animate={false}>
      <AuthStepTransition stepKey={step}>
        {step === 'request' && (
          <RequestEmailStep form={emailForm} onSubmit={event => void submitEmail(event)} />
        )}
        {step === 'sent' && (
          <LinkSentStep
            email={submittedEmail}
            resendKey={resendKey}
            submitting={resending}
            resendError={resendError}
            onBack={() => setStep('request')}
            onResend={() => void handleResend()}
          />
        )}
        {step === 'verifying' && (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <FontAwesomeIcon icon={faCircleNotch} spin style={{ fontSize: 22, color: 'var(--accent)' }} />
            <p className="text-[0.84rem] leading-relaxed max-w-sm" style={{ color: 'var(--ink-soft)' }}>
              Verificando o link de redefinição...
            </p>
          </div>
        )}
        {step === 'invalid' && (
          <InvalidLinkStep
            message={invalidLinkMessage}
            submitting={resending}
            onRequestNew={() => void handleResend()}
          />
        )}
        {step === 'reset' && (
          <>
            <NewPasswordStep form={resetForm} onSubmit={event => void submitReset(event)} />
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
