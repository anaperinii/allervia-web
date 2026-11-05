import { format, parse } from 'date-fns'
import { StepHeading } from '@/shared/components'
import { cn } from '@/shared/lib/cn'
import type { EvolutionForm } from '@/features/patient/schemas/evolution'
import type { PreviewDoseResult } from '@/shared/api/contracts/clinical'
import type { ProtocolStep } from '@/shared/api/contracts/protocols'
import { formatStepOption } from '@/features/patient/adapters/clinical-presentation'
import { civilDaysBetween, requiresJustification } from '@/shared/lib/dose-interval'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCircleInfo, faFlagCheckered } from '@fortawesome/free-solid-svg-icons'

const CONDUCT_LABELS: Record<string, string> = {
  MAINTAIN: 'Manter protocolo',
  REQUEST_PHYSICIAN_REVIEW: 'Solicitar avaliação médica',
  SUSPEND_TREATMENT: 'Suspender tratamento',
}

const BADGE_TONES = {
  later: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  earlier: 'bg-amber-50 text-amber-700 ring-amber-600/20',
} as const

interface ReviewItem {
  label: string
  value: string
  badge?: { text: string; tone: keyof typeof BADGE_TONES }
}

interface ReviewStepProps {
  form: EvolutionForm
  plannedStep: ProtocolStep | null
  selectedStep: ProtocolStep | null
  performerName: string | null
}

export function EvolutionReviewStep({
  form,
  plannedStep,
  selectedStep,
  performerName,
}: ReviewStepProps) {
  const preItems: ReviewItem[] = [
    ...(form.intervalReport ? [{ label: 'Relato do intervalo', value: form.intervalReport }] : []),
    { label: 'Efeito Colateral', value: form.sideEffect === 'yes' ? 'Sim' : 'Não' },
    { label: 'Necessidade de Medicação', value: form.medicationNeeded === 'yes' ? 'Sim' : 'Não' },
    ...(form.sideEffect === 'yes' ? [{ label: 'Efeitos Relatados', value: form.reportedEffects || '—' }] : []),
    ...(form.medicationNeeded === 'yes' ? [{ label: 'Medicações', value: form.medications || '—' }] : []),
    ...(form.notesPre ? [{ label: 'Notas', value: form.notesPre }] : []),
  ]

  const nextDateDiverges =
    form.nextApplicationDate !== '' &&
    form.nextApplicationDatePlanned !== '' &&
    form.nextApplicationDate !== form.nextApplicationDatePlanned

  const shiftFromPlanned = nextDateDiverges
    ? civilDaysBetween(form.nextApplicationDatePlanned, form.nextApplicationDate)
    : null

  const askedForIntervalReason =
    form.nextIntervalBand !== '' && requiresJustification(form.nextIntervalBand)

  const postItems: ReviewItem[] = [
    { label: 'Data da aplicação', value: formatDayOrDash(form.applicationDate) },
    {
      label: 'Data da próxima aplicação',
      value: formatDayOrDash(form.nextApplicationDate),
      ...(shiftFromPlanned !== null && shiftFromPlanned !== 0
        ? {
            badge: {
              text: `${shiftFromPlanned > 0 ? '+' : '−'}${Math.abs(shiftFromPlanned)}d`,
              tone: shiftFromPlanned > 0 ? ('later' as const) : ('earlier' as const),
            },
          }
        : {}),
    },
    ...(nextDateDiverges
      ? [
          { label: 'Data prevista pelo protocolo', value: formatDayOrDash(form.nextApplicationDatePlanned) },
        ]
      : []),
    ...(askedForIntervalReason
      ? [{ label: 'Justificativa da data', value: form.nextScheduleReason || '—' }]
      : []),
    { label: 'Horário', value: form.endTime ? `${form.startTime} – ${form.endTime}` : form.startTime || '—' },
    {
      label: 'Previsto pela prescrição',
      value: plannedStep ? formatStepOption(plannedStep) : '—',
    },
    {
      label: 'Realizado',
      value: selectedStep ? formatStepOption(selectedStep) : '—',
    },
    ...(form.adjustmentReason ? [{ label: 'Motivo do ajuste', value: form.adjustmentReason }] : []),
    { label: 'Executor', value: performerName ?? '—' },
    { label: 'Efeito Colateral', value: form.sideEffectPost === 'yes' ? 'Sim' : 'Não' },
    ...(form.sideEffectPost === 'yes' ? [{ label: 'Efeitos Relatados', value: form.reportedEffectsPost || '—' }] : []),
    { label: 'Necessidade de Medicação', value: form.medicationNeededPost === 'yes' ? 'Sim' : 'Não' },
    ...(form.medicationNeededPost === 'yes' ? [{ label: 'Medicações', value: form.medicationsPost || '—' }] : []),
    ...(form.conduct
      ? [{ label: 'Conduta imediata', value: CONDUCT_LABELS[form.conduct] ?? '—' }]
      : []),
    ...(form.conductJustification
      ? [{ label: 'Justificativa da conduta', value: form.conductJustification }]
      : []),
    ...(form.notesPost ? [{ label: 'Notas', value: form.notesPost }] : []),
  ]

  return (
    <div className="mt-1 space-y-3">
      <StepHeading description="Confira previsto e realizado. Ao salvar, aplicação, observações, conduta e a próxima previsão são gravadas juntas — ou nada é gravado." />
      <div className="grid grid-cols-1 gap-3">
        <ReviewCard title="Pré-Aplicação" items={preItems} />
        <ReviewCard title="Pós-Aplicação" items={postItems} />
      </div>

    </div>
  )
}

interface NextDosePreviewProps {
  preview: PreviewDoseResult | null
  previewPending: boolean
  previewError: string | null
}

function formatDayOrDash(day: string): string {
  if (!day) return '—'
  return format(parse(day, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy')
}


export function NextDosePreview({
  preview,
  previewPending,
  previewError,
}: NextDosePreviewProps) {
  if (previewPending) {
    return (
      <p className="text-[0.72rem] text-(--text-muted)">
        Consultando a recomendação do servidor…
      </p>
    )
  }

  if (previewError) {
    return (
      <p className="flex items-center gap-2 text-[0.72rem] text-red-700">
        <FontAwesomeIcon icon={faCircleInfo} className="shrink-0 text-red-500" style={{ fontSize: 13 }} />
        {previewError}
      </p>
    )
  }

  if (preview?.recommendation.kind === 'END_OF_SEQUENCE') {
    return (
      <p className="flex items-center gap-2.5 text-[0.72rem] leading-snug text-slate-600">
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full"
          style={{ background: '#0ea5e9', boxShadow: '0 2px 8px rgba(14,165,233,0.35)' }}
        >
          <FontAwesomeIcon icon={faFlagCheckered} style={{ fontSize: 12, color: '#ffffff' }} />
        </span>
        <span>
          Fim da sequência automática: nenhuma sucessora será criada. Isso{' '}
          <span className="font-semibold">não encerra o tratamento</span> — a decisão clínica continua com o prescritor.
        </span>
      </p>
    )
  }

  return null
}

interface ReviewCardProps {
  title: string
  items: ReviewItem[]
}

function ReviewCard({ title, items }: ReviewCardProps) {
  return (
    <div
      className="relative overflow-hidden rounded-xl px-3.5 pt-4 pb-4"
      style={{
        background: 'radial-gradient(120% 130% at 12% 10%, #f5f8f8 0%, #eff4f4 52%, #e9f0f0 100%)',
        border: '1px solid rgba(16,113,129,0.14)',
      }}
    >
      <div className="relative mb-3 flex items-center">
        <span
          aria-hidden="true"
          className="absolute -left-3.5 h-5 w-0.75 rounded-r-full"
          style={{ background: '#257E8C' }}
        />
        <div className="text-[0.8rem] font-bold text-(--text)">{title}</div>
      </div>
      {
                                                                       }
      <div className="grid grid-cols-3 rounded-lg overflow-hidden border border-(--border-custom)">
        {items.map((item, index) => (
          <div
            key={item.label}
            className={cn(
              'bg-white px-3 py-2',
              index % 3 !== 2 && index !== items.length - 1 && 'border-r border-(--border-custom)',
              index < items.length - (items.length % 3 || 3) && 'border-b border-(--border-custom)',
            )}
          >
            <div className="text-[0.7rem] font-semibold text-(--text-muted) mb-0.5">{item.label}</div>
            <div className="flex items-center gap-1.5 text-[0.82rem] font-medium text-(--text)">
              <span>{item.value || '—'}</span>
              {item.badge && (
                <span
                  className={cn(
                    'inline-flex shrink-0 items-center rounded-full px-1.5 py-0.5 text-[0.62rem] font-bold tabular-nums ring-1 ring-inset',
                    BADGE_TONES[item.badge.tone],
                  )}
                  title={
                    item.badge.tone === 'later'
                      ? 'Dias além da data prevista pelo protocolo'
                      : 'Dias antes da data prevista pelo protocolo'
                  }
                >
                  {item.badge.text}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
