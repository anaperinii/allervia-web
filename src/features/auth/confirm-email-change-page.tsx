import { useEffect, useRef, useState } from 'react'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthStepTransition } from '@/features/auth/components/AuthStepTransition'
import { InvalidLinkStep } from '@/features/auth/components/confirm-email-change-steps/InvalidLinkStep'
import { ConfirmStep } from '@/features/auth/components/confirm-email-change-steps/ConfirmStep'
import { DoneStep } from '@/features/auth/components/confirm-email-change-steps/DoneStep'
import { confirmEmailChange, verifyEmailChangeToken } from '@/shared/api/email-change.api'
import { ApiError } from '@/shared/api/contracts/errors'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleNotch } from '@fortawesome/free-solid-svg-icons'

type Step = 'verifying' | 'invalid' | 'confirm' | 'done'

const GENERIC_INVALID_MESSAGE = 'Esse link de confirmação é inválido ou já expirou.'

interface ConfirmEmailChangePageProps {
  initialToken?: string
}

function describeFailure(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback
}

export function ConfirmEmailChangePage({ initialToken }: ConfirmEmailChangePageProps = {}) {
  const verificationInFlight = useRef(false)
  const [step, setStep] = useState<Step>(initialToken ? 'verifying' : 'invalid')
  const [newEmail, setNewEmail] = useState('')
  const [invalidLinkMessage, setInvalidLinkMessage] = useState(GENERIC_INVALID_MESSAGE)
  const [confirmError, setConfirmError] = useState<string | null>(null)
  const [confirming, setConfirming] = useState(false)
  const [doneMessage, setDoneMessage] = useState('')

  useEffect(() => {
    if (!initialToken || verificationInFlight.current) return
    verificationInFlight.current = true

    verifyEmailChangeToken(initialToken)
      .then((result) => {
        setNewEmail(result.newEmail)
        setStep('confirm')
      })
      .catch((error: unknown) => {
        setInvalidLinkMessage(describeFailure(error, GENERIC_INVALID_MESSAGE))
        setStep('invalid')
      })
      .finally(() => {
        verificationInFlight.current = false
      })
    // Runs once for the token carried by the magic link that opened this page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleConfirm = async () => {
    if (!initialToken || confirming) return
    setConfirming(true)
    setConfirmError(null)
    try {
      const { message } = await confirmEmailChange(initialToken)
      setDoneMessage(message)
      setStep('done')
    } catch (error) {
      if (error instanceof ApiError && error.statusCode === 404) {
        setInvalidLinkMessage(describeFailure(error, GENERIC_INVALID_MESSAGE))
        setStep('invalid')
        return
      }
      setConfirmError(describeFailure(error, 'Não foi possível confirmar a troca de e-mail.'))
    } finally {
      setConfirming(false)
    }
  }

  return (
    <AuthLayout animate={false}>
      <AuthStepTransition stepKey={step}>
        {step === 'verifying' && (
          <div className="flex flex-col items-center text-center gap-3 py-6">
            <FontAwesomeIcon icon={faCircleNotch} spin style={{ fontSize: 22, color: 'var(--accent)' }} />
            <p className="text-[0.84rem] leading-relaxed max-w-sm" style={{ color: 'var(--ink-soft)' }}>
              Verificando o link de confirmação...
            </p>
          </div>
        )}
        {step === 'invalid' && <InvalidLinkStep message={invalidLinkMessage} />}
        {step === 'confirm' && (
          <ConfirmStep
            newEmail={newEmail}
            submitting={confirming}
            error={confirmError}
            onConfirm={() => void handleConfirm()}
          />
        )}
        {step === 'done' && <DoneStep message={doneMessage} />}
      </AuthStepTransition>
    </AuthLayout>
  )
}
