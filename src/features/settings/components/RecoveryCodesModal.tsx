import { useState } from 'react'
import { Button, Modal } from '@/shared/components'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCopy, faShieldHalved } from '@fortawesome/free-solid-svg-icons'

interface RecoveryCodesModalProps {
  codes: string[] | null
  onClose: () => void
}

export function RecoveryCodesModal({ codes, onClose }: RecoveryCodesModalProps) {
  const [copied, setCopied] = useState(false)

  const copyCodes = async () => {
    if (!codes) return
    await navigator.clipboard.writeText(codes.join('\n'))
    setCopied(true)
  }

  return (
    <Modal
      open={!!codes}
      onClose={onClose}
      size="sm"
      title="Novos códigos de recuperação"
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
          <Button tone="brand" variant="solid" onClick={onClose}>
            Salvei meus códigos
          </Button>
        </>
      }
    >
      <p className="text-xs text-(--text-muted)">
        Os códigos anteriores foram invalidados. Cada código vale uma única vez
        e esta é a única vez que eles aparecem.
      </p>
      <ul className="grid grid-cols-2 gap-2 rounded-xl border border-(--border-custom) bg-gray-50 p-3">
        {(codes ?? []).map((item) => (
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
