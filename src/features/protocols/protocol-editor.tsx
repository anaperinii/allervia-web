import { useMemo, useState } from 'react'
import { Button, FieldLabel, Select, TextInput } from '@/shared/components'
import type {
  ProtocolDefinitionDraft,
  ProtocolStep,
} from '@/shared/api/contracts/protocols'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'

const PHASE_LABELS = {
  BUILD_UP: 'Indução',
  MAINTENANCE: 'Manutenção',
} as const

interface ProtocolEditorProps {
  draft: ProtocolDefinitionDraft
  readOnly: boolean
  onChange: (draft: ProtocolDefinitionDraft) => void
}

export function ProtocolEditor({ draft, readOnly, onChange }: ProtocolEditorProps) {
  const [nextIndex, setNextIndex] = useState(draft.steps.length + 1)

  const stepIds = useMemo(() => draft.steps.map((step) => step.id), [draft.steps])

  const patchStep = (index: number, patch: Partial<ProtocolStep>) => {
    const steps = draft.steps.map((step, position) =>
      position === index ? { ...step, ...patch } : step,
    )
    onChange({ ...draft, steps })
  }

  const addStep = () => {
    const id = `etapa-${nextIndex}`
    setNextIndex((value) => value + 1)
    const previous = draft.steps[draft.steps.length - 1]
    const steps: ProtocolStep[] = [
      ...draft.steps.map((step, position) =>
        position === draft.steps.length - 1 && step.nextStepId === null
          ? { ...step, nextStepId: id }
          : step,
      ),
      {
        id,
        label: `Etapa ${nextIndex}`,
        phase: previous?.phase ?? 'BUILD_UP',
        concentration: previous?.concentration ?? '1000',
        volume: previous?.volume ?? '0.1',
        intervalDays: previous?.intervalDays ?? 7,
        nextStepId: null,
      },
    ]
    onChange({ ...draft, steps })
  }

  const removeStep = (index: number) => {
    const removed = draft.steps[index]
    const steps = draft.steps
      .filter((_, position) => position !== index)
      .map((step) =>
        step.nextStepId === removed.id ? { ...step, nextStepId: null } : step,
      )
    onChange({ ...draft, steps })
  }

  return (
    <div className="flex flex-col gap-3">
      {draft.steps.map((step, index) => (
        <div
          key={index}
          className="rounded-xl border border-(--border-custom) bg-white p-3 grid grid-cols-2 md:grid-cols-4 gap-3"
        >
          <FieldLabel label="Identificador">
            <TextInput
              value={step.id}
              disabled={readOnly}
              onChange={(e) => patchStep(index, { id: e.target.value })}
            />
          </FieldLabel>
          <FieldLabel label="Rótulo (apresentação)">
            <TextInput
              value={step.label}
              disabled={readOnly}
              onChange={(e) => patchStep(index, { label: e.target.value })}
            />
          </FieldLabel>
          <FieldLabel label="Fase">
            <Select
              value={step.phase}
              disabled={readOnly}
              onChange={(e) =>
                patchStep(index, {
                  phase: e.target.value as ProtocolStep['phase'],
                })
              }
            >
              <option value="BUILD_UP">{PHASE_LABELS.BUILD_UP}</option>
              <option value="MAINTENANCE">{PHASE_LABELS.MAINTENANCE}</option>
            </Select>
          </FieldLabel>
          <FieldLabel label="Sucessor">
            <Select
              value={step.nextStepId ?? ''}
              disabled={readOnly}
              onChange={(e) =>
                patchStep(index, { nextStepId: e.target.value || null })
              }
            >
              <option value="">Fim da sequência</option>
              {stepIds.map((id) => (
                <option key={id} value={id}>
                  {id === step.id ? `${id} (permanece)` : id}
                </option>
              ))}
            </Select>
          </FieldLabel>
          <FieldLabel label="Concentração (1:N)">
            <TextInput
              value={step.concentration}
              disabled={readOnly}
              inputMode="numeric"
              onChange={(e) =>
                patchStep(index, { concentration: e.target.value.trim() })
              }
            />
          </FieldLabel>
          <FieldLabel label="Volume (mL)">
            <TextInput
              value={step.volume}
              disabled={readOnly}
              inputMode="decimal"
              onChange={(e) => patchStep(index, { volume: e.target.value.trim() })}
            />
          </FieldLabel>
          <FieldLabel label="Intervalo (dias)">
            <TextInput
              value={String(step.intervalDays)}
              disabled={readOnly}
              inputMode="numeric"
              onChange={(e) =>
                patchStep(index, {
                  intervalDays: Number(e.target.value.replace(/\D/g, '')) || 0,
                })
              }
            />
          </FieldLabel>
          {!readOnly && (
            <div className="flex items-end justify-end">
              <Button
                variant="outline"
                tone="danger"
                size="sm"
                leftIcon={<FontAwesomeIcon icon={faTrash} style={{ fontSize: 11 }} />}
                onClick={() => removeStep(index)}
              >
                Remover etapa
              </Button>
            </div>
          )}
        </div>
      ))}

      {!readOnly && (
        <Button
          variant="outline"
          leftIcon={<FontAwesomeIcon icon={faPlus} style={{ fontSize: 12 }} />}
          onClick={addStep}
          className="self-start"
        >
          Adicionar etapa
        </Button>
      )}
    </div>
  )
}
