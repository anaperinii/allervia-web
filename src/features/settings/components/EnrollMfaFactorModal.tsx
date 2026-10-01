import { useEffect, useState } from 'react'
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
}

export function EnrollMfaFactorModal({
  open,
  onClose,
  onCompleted,
}: EnrollMfaFactorModalProps) {
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null)
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [confirming, setConfirming] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    let cancelled = false
    enrollMfaFactor({})
      .then((result) => {
        if (!cancelled) setEnrollment(result)
      })
      .catch((err) => {
        if (!cancelled)
          setError(
            err instanceof ApiError
              ? err.message
              : 'Não foi possível iniciar o cadastro. Tente novamente.',
          )
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const confirm = async () => {
    if (!enrollment) return
    setError(null)
    setConfirming(true)
    try {
      const result = await confirmMfaFactor({
        credentialId: enrollment.credentialId,
        code,
      })
      setRecoveryCodes(result.recoveryCodes)
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : 'Não foi possível confirmar o código. Tente novamente.',
      )
    } finally {
      setConfirming(false)
    }
  }

  const copyCodes = async () => {
    if (!recoveryCodes) return
    await navigator.clipboard.writeText(recoveryCodes.join('\n'))
    setCopied(true)
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
            disabled={!enrollment || confirming || code.length !== 6}
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

      {error && (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      )}
    </Modal>
  )
}
