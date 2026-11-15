import { useEffect, useMemo, useRef, useState } from 'react'
import { Button, FieldLabel, IconButton, Modal, TextInput } from '@/shared/components'
import { PHASE_VIEW } from '@/features/protocols/lab/phase-view'
import { cn } from '@/shared/lib/cn'
import type {
  ProtocolDefinitionDraft,
  ProtocolPhase,
  ProtocolStep,
} from '@/shared/api/contracts/protocols'
import {
  deriveStepIntervalTolerance,
  toleranceProblems,
  type StepIntervalTolerance,
} from '@/shared/lib/dose-interval'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faChevronDown,
  faChevronRight,
  faEllipsis,
  faGripVertical,
  faPlus,
  faSliders,
  faTrash,
  faTriangleExclamation,
} from '@fortawesome/free-solid-svg-icons'

const PHASE_LABELS: Record<ProtocolPhase, string> = {
  BUILD_UP: 'Indução',
  MAINTENANCE: 'Manutenção',
}

function formatConcentration(value: string): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return value
  return n.toLocaleString('pt-BR')
}

function formatVolume(value: string): string {
  const n = Number(value)
  if (!Number.isFinite(n)) return value
  return n.toLocaleString('pt-BR')
}

interface ProtocolEditorProps {
  draft: ProtocolDefinitionDraft
  readOnly: boolean
  onChange: (draft: ProtocolDefinitionDraft) => void
}

export function ProtocolEditor({ draft, readOnly, onChange }: ProtocolEditorProps) {
  const [nextIndex, setNextIndex] = useState(draft.steps.length + 1)
  const [collapsedPhases, setCollapsedPhases] = useState<Record<string, boolean>>({})
  const [pendingRemoveIndex, setPendingRemoveIndex] = useState<number | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null)

  const stepIds = useMemo(() => draft.steps.map((step) => step.id), [draft.steps])

  const groups = useMemo(() => {
    const order: ProtocolPhase[] = []
    const byPhase = new Map<ProtocolPhase, { step: ProtocolStep; index: number }[]>()
    draft.steps.forEach((step, index) => {
      if (!byPhase.has(step.phase)) {
        byPhase.set(step.phase, [])
        order.push(step.phase)
      }
      byPhase.get(step.phase)!.push({ step, index })
    })
    return order.map((phase) => ({ phase, items: byPhase.get(phase)! }))
  }, [draft.steps])

  const followingIntervalOf = (step: ProtocolStep): number | null => {
    if (step.nextStepId === null) return null
    return (
      draft.steps.find((candidate) => candidate.id === step.nextStepId)
        ?.intervalDays ?? null
    )
  }

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
        label: id,
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

  const reorderStep = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    const steps = [...draft.steps]
    const [moved] = steps.splice(fromIndex, 1)
    steps.splice(toIndex, 0, moved)
    onChange({ ...draft, steps })
  }

  const gridCols = readOnly
    ? 'grid-cols-[96px_1fr_92px_92px_100px_84px]'
    : 'grid-cols-[24px_96px_1fr_92px_92px_100px_84px_28px]'

  return (
    <div className="rounded-xl border border-(--border-custom) bg-white overflow-hidden">
      <div className={cn('grid items-center gap-3 px-4 py-2.5 border-b border-(--border-custom) text-[0.72rem] font-medium text-(--text-muted)', gridCols)}>
        {!readOnly && <span />}
        <span>ID</span>
        <span>Apresentação</span>
        <span>Concentração</span>
        <span>Vol. (mL)</span>
        <span>Intervalo (dias)</span>
        <span>Sucessor</span>
        {!readOnly && <span />}
      </div>

      {groups.map((group) => {
        const collapsed = collapsedPhases[group.phase] ?? false
        return (
          <div key={group.phase}>
            <button
              type="button"
              onClick={() =>
                setCollapsedPhases((prev) => ({ ...prev, [group.phase]: !collapsed }))
              }
              className="flex w-full cursor-pointer items-center gap-2 border-b border-(--border-custom) bg-gray-50/50 px-4 py-2 text-left text-[0.75rem] font-semibold text-(--text)"
            >
              <FontAwesomeIcon icon={collapsed ? faChevronRight : faChevronDown} style={{ fontSize: 10 }} />
              <span className={cn('h-2 w-2 rounded-full', PHASE_VIEW[group.phase].bar)} />
              {PHASE_LABELS[group.phase]} · {group.items.length}{' '}
              {group.items.length === 1 ? 'etapa' : 'etapas'}
            </button>

            {!collapsed &&
              group.items.map(({ step, index }) => (
                <StepRow
                  key={index}
                  step={step}
                  stepIds={stepIds}
                  readOnly={readOnly}
                  gridCols={gridCols}
                  followingIntervalDays={followingIntervalOf(step)}
                  onPatch={(patch) => patchStep(index, patch)}
                  onRemove={() => setPendingRemoveIndex(index)}
                  dragging={draggedIndex === index}
                  dragOver={dragOverIndex === index}
                  onDragStart={() => setDraggedIndex(index)}
                  onDragEnter={() => {
                    if (draggedIndex !== null && draggedIndex !== index) setDragOverIndex(index)
                  }}
                  onDragEnd={() => {
                    setDraggedIndex(null)
                    setDragOverIndex(null)
                  }}
                  onDrop={() => {
                    if (draggedIndex !== null) reorderStep(draggedIndex, index)
                    setDraggedIndex(null)
                    setDragOverIndex(null)
                  }}
                />
              ))}
          </div>
        )
      })}

      {!readOnly && (
        <div className="px-4 py-3">
          <button
            type="button"
            onClick={addStep}
            className="flex cursor-pointer items-center gap-1.5 text-[0.8rem] font-medium text-brand hover:text-brand-dark"
          >
            <FontAwesomeIcon icon={faPlus} style={{ fontSize: 11 }} />
            Adicionar etapa
          </button>
        </div>
      )}

      <Modal
        open={pendingRemoveIndex !== null}
        onClose={() => setPendingRemoveIndex(null)}
        size="sm"
        title="Remover etapa"
        icon={<FontAwesomeIcon icon={faTriangleExclamation} style={{ fontSize: 16 }} />}
        tone="danger"
        footer={
          <>
            <Button variant="outline" onClick={() => setPendingRemoveIndex(null)}>
              Cancelar
            </Button>
            <Button
              tone="danger"
              variant="solid"
              onClick={() => {
                if (pendingRemoveIndex !== null) removeStep(pendingRemoveIndex)
                setPendingRemoveIndex(null)
              }}
            >
              Remover etapa
            </Button>
          </>
        }
      >
        <p className="text-sm text-(--text-muted)">
          Tem certeza que deseja remover esta etapa? Essa ação não pode ser desfeita.
        </p>
      </Modal>
    </div>
  )
}

interface StepRowProps {
  step: ProtocolStep
  stepIds: string[]
  readOnly: boolean
  gridCols: string
  followingIntervalDays: number | null
  onPatch: (patch: Partial<ProtocolStep>) => void
  onRemove: () => void
  dragging: boolean
  dragOver: boolean
  onDragStart: () => void
  onDragEnter: () => void
  onDragEnd: () => void
  onDrop: () => void
}

function StepRow({
  step,
  stepIds,
  readOnly,
  gridCols,
  followingIntervalDays,
  onPatch,
  onRemove,
  dragging,
  dragOver,
  onDragStart,
  onDragEnter,
  onDragEnd,
  onDrop,
}: StepRowProps) {
  const [editingTolerance, setEditingTolerance] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [menuOpen])

  const derived = deriveStepIntervalTolerance(step.intervalDays, followingIntervalDays)
  const authored = step.intervalTolerance
  const problems = authored ? toleranceProblems(authored, step.intervalDays) : []

  return (
    <div
      onDragOver={(e) => {
        if (!readOnly) e.preventDefault()
      }}
      onDragEnter={onDragEnter}
      onDrop={(e) => {
        e.preventDefault()
        onDrop()
      }}
      className={cn(
        'border-b border-(--border-custom) px-4 py-2.5 last:border-b-0 transition-colors',
        dragging && 'opacity-40',
        dragOver && !dragging && 'bg-teal-50/60',
      )}
    >
      <div className={cn('grid items-center gap-3', gridCols)}>
        {!readOnly && (
          <span
            draggable
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            className="cursor-grab text-gray-400 hover:text-gray-600 active:cursor-grabbing"
            title="Arrastar para reordenar"
          >
            <FontAwesomeIcon icon={faGripVertical} style={{ fontSize: 12 }} />
          </span>
        )}

        <TextInput
          value={step.id}
          disabled={readOnly}
          className="font-bold"
          onChange={(e) => onPatch({ id: e.target.value })}
        />

        <span
          className={cn(
            'inline-flex w-fit items-center gap-1 rounded-md border px-2.5 py-1 text-[0.72rem] font-medium',
            PHASE_VIEW[step.phase].chip,
          )}
        >
          1:{formatConcentration(step.concentration)} · {formatVolume(step.volume)} mL
        </span>

        <TextInput
          value={formatConcentration(step.concentration)}
          disabled={readOnly}
          inputMode="numeric"
          onChange={(e) => onPatch({ concentration: e.target.value.replace(/\D/g, '') })}
        />
        <TextInput
          value={step.volume}
          disabled={readOnly}
          inputMode="decimal"
          onChange={(e) => onPatch({ volume: e.target.value.trim() })}
        />
        <TextInput
          value={String(step.intervalDays)}
          disabled={readOnly}
          inputMode="numeric"
          onChange={(e) =>
            onPatch({ intervalDays: Number(e.target.value.replace(/\D/g, '')) || 0 })
          }
        />

        {readOnly ? (
          <span className="text-[0.78rem] text-(--text-muted)">
            {step.nextStepId ?? '—'}
          </span>
        ) : (
          <select
            value={step.nextStepId ?? ''}
            onChange={(e) => onPatch({ nextStepId: e.target.value || null })}
            className="w-full cursor-pointer rounded-md border border-(--border-custom) bg-white px-2 py-1.5 text-[0.78rem] text-(--text-muted) outline-none"
          >
            <option value="">—</option>
            {stepIds.map((id) => (
              <option key={id} value={id}>
                {id === step.id ? `${id} (permanece)` : id}
              </option>
            ))}
          </select>
        )}

        {!readOnly ? (
          <div ref={menuRef} className="relative inline-block justify-self-end">
            <IconButton
              size="sm"
              aria-label="Ações da etapa"
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
            >
              <FontAwesomeIcon icon={faEllipsis} style={{ fontSize: 14 }} />
            </IconButton>
            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-full z-50 mt-1 w-44 overflow-hidden rounded-lg border border-(--border-custom) bg-white shadow-[0_8px_24px_rgba(0,0,0,0.1)]"
              >
                <button
                  role="menuitem"
                  disabled={!authored && !derived}
                  onClick={() => {
                    if (authored) {
                      onPatch({ intervalTolerance: undefined })
                      setEditingTolerance(false)
                    } else {
                      setEditingTolerance((v) => !v)
                    }
                    setMenuOpen(false)
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs text-(--text) transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FontAwesomeIcon icon={faSliders} style={{ fontSize: 11 }} />
                  {authored ? 'Voltar ao derivado' : 'Editar limites'}
                </button>
                <button
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false)
                    onRemove()
                  }}
                  className="flex w-full cursor-pointer items-center gap-2 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50/60"
                >
                  <FontAwesomeIcon icon={faTrash} style={{ fontSize: 11 }} />
                  Remover etapa
                </button>
              </div>
            )}
          </div>
        ) : null}
      </div>

      <div className={cn('mt-1.5 flex items-center gap-2 text-[0.68rem] text-(--text-muted)', !readOnly && 'pl-9')}>
        <span>
          {authored
            ? `Tolerância: curto < ${authored.shortBelowDays}d · longo ${authored.longFromDays} – ${authored.stepReviewAboveDays}d · revisão > ${authored.stepReviewAboveDays}d`
            : derived
              ? `Tolerância: curto < ${derived.shortBelowDays}d · longo ${derived.longFromDays} – ${derived.stepReviewAboveDays}d · revisão > ${derived.stepReviewAboveDays}d`
              : 'Preencha o intervalo da etapa para ver os limites.'}
        </span>
        {authored && (
          <span className="rounded-md border border-(--border-custom) px-2 py-0.5 text-[0.62rem]">
            personalizada
          </span>
        )}
      </div>

      {editingTolerance && !authored && derived && (
        <div className={cn('mt-2 grid grid-cols-3 gap-3', !readOnly && 'pl-9')}>
          {TOLERANCE_FIELDS.map((field) => (
            <FieldLabel key={field.key} label={field.label} hint={field.hint}>
              <TextInput
                value={String(derived[field.key])}
                disabled={readOnly}
                inputMode="numeric"
                onChange={(e) =>
                  onPatch({
                    intervalTolerance: {
                      ...derived,
                      [field.key]: Number(e.target.value.replace(/\D/g, '')) || 0,
                    },
                  })
                }
              />
            </FieldLabel>
          ))}
        </div>
      )}

      {authored && (
        <div className={cn('mt-2 grid grid-cols-3 gap-3', !readOnly && 'pl-9')}>
          {TOLERANCE_FIELDS.map((field) => (
            <FieldLabel key={field.key} label={field.label} hint={field.hint}>
              <TextInput
                value={String(authored[field.key])}
                disabled={readOnly}
                inputMode="numeric"
                onChange={(e) =>
                  onPatch({
                    intervalTolerance: {
                      ...authored,
                      [field.key]: Number(e.target.value.replace(/\D/g, '')) || 0,
                    },
                  })
                }
              />
            </FieldLabel>
          ))}
        </div>
      )}

      {problems.length > 0 && (
        <ul className={cn('mt-2 list-disc text-[0.66rem] text-red-600', !readOnly && 'pl-9')}>
          {problems.map((problem) => (
            <li key={problem}>{problem}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

const TOLERANCE_FIELDS = [
  {
    key: 'shortBelowDays',
    label: 'Curto abaixo de',
    hint: 'alerta e exige justificativa',
  },
  {
    key: 'longFromDays',
    label: 'Longo a partir de',
    hint: 'alerta, mantém a dose calculada',
  },
  {
    key: 'stepReviewAboveDays',
    label: 'Revisão acima de',
    hint: 'exige avaliar retrocesso',
  },
] as const satisfies readonly { key: keyof StepIntervalTolerance; label: string; hint: string }[]
