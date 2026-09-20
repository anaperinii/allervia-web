import { useState, type CSSProperties } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AuthLayout } from '@/features/auth/components/AuthLayout'
import { SecondFactorStep } from '@/features/auth/components/SecondFactorStep'
import { RecoveryCodesNotice } from '@/features/auth/components/RecoveryCodesNotice'
import { loginSchema, type LoginForm } from '@/features/auth/schemas/login'
import { startSession, verifySecondFactor } from '@/shared/api/auth.api'
import { isMfaChallenge, type MfaChallenge, type SessionState } from '@/shared/api/contracts/account'
import { ApiError } from '@/shared/api/contracts/errors'
import { useSession } from '@/shared/auth/useSession'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons'

const fieldStyle: CSSProperties = {
  width: '100%',
  padding: '10px 13px',
  fontFamily: 'inherit',
  fontSize: '13.5px',
  color: 'var(--ink)',
  background: 'var(--field)',
  border: '1px solid var(--field-bd)',
  borderRadius: 12,
}

const AFTER_LOGIN_ROUTE = '/immunotherapies'

function describeFailure(error: unknown): string {
  if (!(error instanceof ApiError)) {
    return 'Não foi possível entrar. Tente novamente.'
  }
  return error.message
}

export function LoginPage() {
  const navigate = useNavigate()
  const { adopt } = useSession()
  const [showPw, setShowPw] = useState(false)
  const [challenge, setChallenge] = useState<MfaChallenge | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [pendingSession, setPendingSession] = useState<SessionState | null>(null)
  const [failure, setFailure] = useState<string | null>(null)
  const [verifying, setVerifying] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: { email: '', password: '' },
  })

  const enterApplication = async (session: SessionState) => {
    await adopt(session)
    await navigate({ to: AFTER_LOGIN_ROUTE })
  }

  const onSubmit = handleSubmit(async (values) => {
    setFailure(null)
    try {
      const result = await startSession(values)

      if (isMfaChallenge(result)) {
        setChallenge(result)
        return
      }

      await enterApplication(result.session)
    } catch (error) {
      setFailure(describeFailure(error))
    }
  })

  const submitSecondFactor = async (code: string) => {
    if (!challenge) return
    setFailure(null)
    setVerifying(true)

    try {
      const envelope = await verifySecondFactor({
        challengeToken: challenge.challengeToken,
        code,
      })

      // Os códigos de recuperação só aparecem quando o cadastro acabou de ser
      // concluído, e apenas nesta resposta.
      if (envelope.recoveryCodes?.length) {
        setPendingSession(envelope.session)
        setRecoveryCodes(envelope.recoveryCodes)
        return
      }

      await enterApplication(envelope.session)
    } catch (error) {
      setFailure(describeFailure(error))
    } finally {
      setVerifying(false)
    }
  }

  const restart = () => {
    setChallenge(null)
    setFailure(null)
  }

  if (recoveryCodes && pendingSession) {
    return (
      <AuthLayout>
        <RecoveryCodesNotice
          codes={recoveryCodes}
          onContinue={() => void enterApplication(pendingSession)}
        />
      </AuthLayout>
    )
  }

  if (challenge) {
    return (
      <AuthLayout>
        <SecondFactorStep
          challenge={challenge}
          error={failure}
          submitting={verifying}
          onSubmit={(code) => void submitSecondFactor(code)}
          onBack={restart}
        />
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div>
        <h1
          className="text-[2.05rem] font-medium leading-[1.12] tracking-[-0.03em]"
          style={{ color: 'var(--ink)' }}
        >
          Bem-vindo(a) de volta
        </h1>
        <p
          className="mt-2.5 text-[0.92rem] leading-relaxed"
          style={{ color: 'var(--ink-soft)' }}
        >
          Acesse o prontuário, a agenda terapêutica e a progressão de doses dos seus pacientes.
        </p>
      </div>

      <form onSubmit={(event) => void onSubmit(event)} noValidate className="mt-6 flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-semibold tracking-[0.02em]" style={{ color: 'var(--ink)' }}>
            Email
          </span>
          <input
            type="email"
            placeholder="seu@email.com.br"
            autoComplete="email"
            maxLength={254}
            style={fieldStyle}
            {...register('email')}
          />
          {errors.email?.message && (
            <span className="text-[11.5px]" style={{ color: 'var(--err)' }}>
              {errors.email.message}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1.5">
          <span className="text-[11.5px] font-semibold tracking-[0.02em]" style={{ color: 'var(--ink)' }}>
            Senha
          </span>
          <span className="relative flex items-center">
            <input
              type={showPw ? 'text' : 'password'}
              placeholder="Insira aqui"
              autoComplete="current-password"
              maxLength={128}
              style={{ ...fieldStyle, paddingRight: 40 }}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label={showPw ? 'Ocultar senha' : 'Mostrar senha'}
              className="absolute right-2 inline-flex items-center justify-center w-7.5 h-7.5 cursor-pointer bg-transparent border-none"
              style={{ color: 'var(--ink-faint)' }}
            >
              {showPw ? <FontAwesomeIcon icon={faEyeSlash} style={{ fontSize: 17 }} /> : <FontAwesomeIcon icon={faEye} style={{ fontSize: 17 }} />}
            </button>
          </span>
          {errors.password?.message && (
            <span className="text-[11.5px]" style={{ color: 'var(--err)' }}>
              {errors.password.message}
            </span>
          )}
        </label>

        {failure && (
          <span className="text-[11.5px]" style={{ color: 'var(--err)' }} role="alert">
            {failure}
          </span>
        )}

        <div className="flex items-center justify-end mt-0.5">
          <Link
            to="/forgot-password"
            className="text-[12.5px] font-medium no-underline hover:underline"
            style={{ color: 'var(--accent)' }}
          >
            Esqueceu a senha?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-1.5 w-full h-10 text-sm font-semibold rounded-lg cursor-pointer transition-[filter] duration-200 hover:brightness-110 disabled:opacity-70 disabled:cursor-not-allowed"
          style={{ color: 'var(--btn-ink)', background: 'var(--btn)', border: 'none' }}
        >
          Entrar
        </button>

        <p className="mt-3 text-center text-[12.5px]" style={{ color: 'var(--ink-soft)' }}>
          Não possui uma conta?{' '}
          <Link to="/trial" className="font-semibold underline underline-offset-2" style={{ color: 'var(--accent-alt)' }}>
            Solicitar demonstração
          </Link>
        </p>
      </form>
    </AuthLayout>
  )
}
