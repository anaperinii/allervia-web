import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Button, FieldLabel, Modal, Select, showApiErrorToast } from '@/shared/components'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/useCustomTypesStore'
import { updateImmunotherapy } from '@/shared/api/clinical.api'
import { ApiError } from '@/shared/api/contracts/errors'
import type { TherapySummary } from '@/shared/api/contracts/clinical'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPenToSquare } from '@fortawesome/free-solid-svg-icons'

interface EditTherapyModalProps {
  open: boolean
  therapy: TherapySummary | null
  onClose: () => void
  onSaved: () => Promise<void> | void
}

export function EditTherapyModal({
  open,
  therapy,
  onClose,
  onSaved,
}: EditTherapyModalProps) {
  const customTypes = useCustomTypesStore((s) => s.types)
  const [immunoType, setImmunoType] = useState(therapy?.immunoType ?? '')

  const mutation = useMutation({
    mutationFn: () =>
      updateImmunotherapy(therapy!.id, {
        expectedRevision: therapy!.revision,
        immunoType,
      }),
    onSuccess: async () => {
      await onSaved()
      onClose()
    },
    meta: { suppressErrorToast: true },
    onError: (error) =>
      showApiErrorToast(
        error,
        error instanceof ApiError && error.code === 'STALE_CLINICAL_REVISION'
          ? {
              title: 'Tratamento desatualizado',
              description:
                'O tratamento mudou desde a abertura desta tela. Feche e tente de novo.',
            }
          : {},
      ),
  })

  const options = customTypes.some((type) => type.label === therapy?.immunoType)
    ? customTypes
    : [
        ...(therapy ? [{ id: therapy.immunoType, label: therapy.immunoType }] : []),
        ...customTypes,
      ]

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Editar imunoterapia"
      icon={<FontAwesomeIcon icon={faPenToSquare} style={{ fontSize: 16 }} />}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            tone="brand"
            variant="solid"
            disabled={
              !therapy ||
              mutation.isPending ||
              immunoType.trim().length === 0 ||
              immunoType === therapy.immunoType
            }
            onClick={() => mutation.mutate()}
          >
            Salvar
          </Button>
        </>
      }
    >
      {therapy && (
        <div className="flex flex-col gap-3">
          <FieldLabel label="Tipo de alérgeno">
            <Select
              value={immunoType}
              onChange={(e) => setImmunoType(e.target.value)}
            >
              {options.map((type) => (
                <option key={type.id} value={type.label}>
                  {type.label}
                </option>
              ))}
            </Select>
          </FieldLabel>

          <p className="text-[0.65rem] leading-relaxed text-(--text-muted)">
            Extrato, versão do protocolo, etapas e meta não mudam por aqui: o
            servidor exige revisão de prescrição para qualquer valor que governe
            a dose, preservando o histórico já aplicado. Use{' '}
            <span className="font-semibold text-(--text)">Revisar prescrição</span>{' '}
            para isso.
          </p>
        </div>
      )}
    </Modal>
  )
}
