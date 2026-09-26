import { useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useQuery } from '@tanstack/react-query'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { AuthStepTransition } from '@/features/auth/components/AuthStepTransition'
import { registerSchema, type RegisterForm } from '@/features/auth/schemas/register'
import { WelcomeStep } from '@/features/auth/components/register-steps/WelcomeStep'
import { FormStep } from '@/features/auth/components/register-steps/FormStep'
import { DoneStep } from '@/features/auth/components/register-steps/DoneStep'
import { maskWithPrefix } from '@/shared/lib/mask'
import { queryKeys } from '@/shared/api/query-keys'
import { ApiError } from '@/shared/api/contracts/errors'
import {
  completeInviteRegistration,
  readInviteContext,
} from '@/shared/api/team.api'
import { ROLE_BADGES } from '@/features/settings/constants/team-roles'

type Step = 'welcome' | 'form' | 'done'

interface RegisterPageProps {
  token?: string
}

function maskEmail(email: string) {
  const [local, domain] = email.split('@')
  return `${maskWithPrefix(local)}@${domain}`
}

function Message({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center gap-2">
      <h1 className="font-extrabold text-2xl text-[color:var(--ink)]">{title}</h1>
      <p className="text-xs text-[color:var(--ink-soft)] leading-relaxed max-w-xs">
        {description}
      </p>
    </div>
  )
}

export function RegisterPage({ token }: RegisterPageProps = {}) {
  const [step, setStep] = useState<Step>('welcome')
  const [submittedData, setSubmittedData] = useState<RegisterForm | null>(null)
  const [failure, setFailure] = useState<string | null>(null)

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      name: '',
      password: '',
      confirmPassword: '',
      profession: undefined,
      phoneNumber: '',
    },
  })

  const inviteQuery = useQuery({
    queryKey: queryKeys.inviteContext(token ?? ''),
    queryFn: ({ signal }) => readInviteContext(token!, signal),
    enabled: Boolean(token),
    retry: false,
  })

  const invite = inviteQuery.data
  const maskedEmail = useMemo(
    () => (invite ? maskEmail(invite.email) : ''),
    [invite],
  )

  const submitForm = form.handleSubmit(async (data) => {
    if (!token) return
    setFailure(null)

    try {
      await completeInviteRegistration(token, {
        fullName: data.name,
        password: data.password,
        profession: data.profession,
        phoneNumber: data.phoneNumber.replace(/\D/g, ''),
      })
      setSubmittedData(data)
      setStep('done')
    } catch (error) {
      setFailure(
        error instanceof ApiError
          ? error.message
          : 'Não foi possível concluir o cadastro.',
      )
    }
  })

  if (!token) {
    return (
      <AuthLayout animate={false}>
        <Message
          title="Convite necessário"
          description="Abra o link que você recebeu por e-mail para completar o cadastro. O acesso é criado a partir de um convite da sua organização."
        />
      </AuthLayout>
    )
  }

  if (inviteQuery.isPending) {
    return (
      <AuthLayout animate={false}>
        <Message
          title="Carregando convite"
          description="Estamos conferindo o seu convite com o servidor."
        />
      </AuthLayout>
    )
  }

  if (inviteQuery.error) {
    const error = inviteQuery.error
    return (
      <AuthLayout animate={false}>
        <Message
          title="Convite indisponível"
          description={
            error instanceof ApiError
              ? error.message
              : 'Não foi possível validar este convite.'
          }
        />
      </AuthLayout>
    )
  }

  if (!invite) return null

  return (
    <AuthLayout animate={false}>
      <AuthStepTransition stepKey={step}>
        {step === 'welcome' && (
          <WelcomeStep
            maskedEmail={maskedEmail}
            roleLabel={ROLE_BADGES[invite.role].label}
            organizationName={invite.organizationName}
            expiresAt={new Date(invite.expiresAt).toLocaleDateString('pt-BR')}
            onContinue={() => setStep('form')}
          />
        )}
        {step === 'form' && (
          <FormStep
            form={form}
            maskedEmail={maskedEmail}
            submitting={form.formState.isSubmitting}
            error={failure}
            onSubmit={(event) => void submitForm(event)}
          />
        )}
        {step === 'done' && submittedData && (
          <DoneStep data={submittedData} maskedEmail={maskedEmail} />
        )}
      </AuthStepTransition>
    </AuthLayout>
  )
}
