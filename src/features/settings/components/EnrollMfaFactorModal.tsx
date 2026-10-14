import { useEffect, useRef, useState } from 'react'
import { getAuthGeneration } from '@/shared/api/client'
import {
  Button,
  Modal,
  QrCodeImage,
  VerificationCodeInput,
} from '@/shared/components'
import { confirmMfaFactor, enrollMfaFactor } from '@/shared/api/auth.api'
import { ApiError } from '@/shared/api/contracts/errors'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faMobileScreen, faShieldHalved } from '@fortawesome/free-solid-svg-icons'

interface Enrollment {
  credentialId: string
  secret: string
  keyUri: string
}

interface EnrollMfaFactorModalProps {
  open: boolean
  onClose: () => void
  onCompleted: () => void
  initialEnrollment: Enrollment
  runSensitive: (action: () => Promise<void>) => Promise<void>
  reauthenticationPending?: boolean
}

function EnrollmentForm({
  open,
  onClose,
  onCompleted,
  initialEnrollment,
  runSensitive,
  reauthenticationPending = false,
}: EnrollMfaFactorModalProps) {
  const mounted = useRef(true)
  const inFlight = useRef(false)
  const [enrollment, setEnrollment] = useState<Enrollment | null>(initialEnrollment)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState<string | null>(null)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])

  const reloadEnrollment = () => runSensitive(async () => {
    const identity = getAuthGeneration()
    setLoading(true)
    setCode('')
    setError(null)
    setEnrollment(null)
    try {
      const result = await enrollMfaFactor({})
      if (mounted.current && identity === getAuthGeneration()) setEnrollment(result)
    } catch (error) {
      if (!mounted.current || identity !== getAuthGeneration()) return
      if (error instanceof ApiError && error.code === 'REAUTHENTICATION_REQUIRED') throw error
      setError(error instanceof ApiError ? error.message : 'Não foi possível gerar a chave. Tente novamente.')
    } finally { if (mounted.current) setLoading(false) }
  })

  const confirm = () => runSensitive(async () => {
    if (!enrollment || inFlight.current) return
    inFlight.current = true
    const identity = getAuthGeneration()
    setError(null)
    setConfirming(true)
    try {
      const result = await confirmMfaFactor({
        credentialId: enrollment.credentialId,
        code,
      })
      if (!mounted.current || identity !== getAuthGeneration()) return
      setEnrollment(null)
      setCode('')
      setRecoveryCodes(result.recoveryCodes)
    } catch (err) {
      if (!mounted.current || identity !== getAuthGeneration()) return
      if (err instanceof ApiError && err.code === 'REAUTHENTICATION_REQUIRED') throw err
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível confirmar o código. Tente novamente.',
      )
    } finally {
      inFlight.current = false
      if (mounted.current) setConfirming(false)
    }
  })

  const copyCodes = async () => {
    if (!recoveryCodes) return
    try { await navigator.clipboard.writeText(recoveryCodes.join('\n')); setCopied(true); setCopyError(null) } catch { setCopyError('Não foi possível copiar. Selecione e guarde os códigos manualmente.') }
  }

  const finish = () => {
    onCompleted()
    onClose()
  }

  if (recoveryCodes) {
    return (
      <Modal
        open={open}
        onClose={finish}
        size="sm"
        title="Guarde seus códigos de recuperação"
        icon={<FontAwesomeIcon icon={faShieldHalved} style={{ fontSize: 16 }} />}
        tone="success"
        footer={
          <>
            <Button
              variant="outline"
              leftIcon={<FontAwesomeIcon icon={faCopy} style={{ fontSize: 12 }} />}
              onClick={() => void copyCodes()}
            >
              {copied ? 'Copiado' : 'Copiar'}
            </Button>
            <Button tone="brand" variant="solid" onClick={finish}>
              Salvei meus códigos
            </Button>
          </>
        }
      >
        <p className="text-xs text-(--text-muted)">
          Eles permitem entrar caso você perca o aplicativo autenticador. Cada
          código vale uma única vez e esta é a única vez que eles aparecem.
          Suas outras sessões foram encerradas por segurança.
        </p>
        {copyError && <p role="alert">{copyError}</p>}
      <ul className="grid grid-cols-2 gap-2 rounded-xl border border-(--border-custom) bg-gray-50 p-3">
          {recoveryCodes.map((item) => (
            <li
              key={item}
              className="text-center font-mono text-xs tracking-wide text-(--text) select-all"
            >
              {item}
            </li>
          ))}
        </ul>
      </Modal>
    )
  }

  return (
    <Modal
      open={open}
      pending={confirming || reauthenticationPending || loading}
      onClose={onClose}
      size="sm"
      title="Configurar aplicativo autenticador"
      icon={<FontAwesomeIcon icon={faMobileScreen} style={{ fontSize: 16 }} />}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={confirming}>
            Cancelar
          </Button>
          <Button
            tone="brand"
            variant="solid"
            onClick={() => void confirm()}
            disabled={!enrollment || confirming || reauthenticationPending || code.length !== 6}
          >
            Confirmar
          </Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">
        Escaneie o QR code com seu aplicativo autenticador (Google
        Authenticator, Authy, 1Password etc.) e informe o código de 6 dígitos
        gerado.
      </p>

      {loading && (
        <p className="text-xs text-(--text-muted)">Gerando chave segura…</p>
      )}

      {enrollment && (
        <>
          <div className="flex justify-center">
            <div className="rounded-xl border border-(--border-custom) bg-white p-3">
              <QrCodeImage value={enrollment.keyUri} size={168} />
            </div>
          </div>
          <div className="rounded-xl border border-(--border-custom) bg-gray-50 p-3">
            <div className="text-[0.6rem] font-semibold text-(--text-muted)">
              Não consegue escanear? Informe esta chave manualmente
            </div>
            <code className="mt-1 block break-all text-xs text-(--text) select-all">
              {enrollment.secret}
            </code>
          </div>
          <VerificationCodeInput
            value={code}
            onChange={setCode}
            autoFocus
            aria-label="Código do aplicativo autenticador"
          />
        </>
      )}

      {error && !loading && <Button variant="outline" disabled={confirming} onClick={() => { void reloadEnrollment() }}>Gerar nova chave</Button>}
      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}

export function EnrollMfaFactorModal(props: EnrollMfaFactorModalProps) {
  return props.open ? <EnrollmentForm {...props} /> : null
}
