import { format, parse } from 'date-fns'
import { StepHeading } from '@/shared/components'
import type { EvolutionForm } from '@/features/patient/schemas/evolution'
import type { PreviewDoseResult } from '@/shared/api/contracts/clinical'
import type { ProtocolStep } from '@/shared/api/contracts/protocols'
import {
  formatInstantDate,
  formatStepPresentation,
} from '@/features/patient/adapters/clinical-presentation'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCalendarCheck, faCircleInfo, faFlagCheckered } from '@fortawesome/free-solid-svg-icons'

const CONDUCT_LABELS: Record<string, string> = {
  MAINTAIN: 'Manter protocolo',
  REQUEST_PHYSICIAN_REVIEW: 'Solicitar avaliação médica',
  SUSPEND_TREATMENT: 'Suspender tratamento',
}

interface ReviewStepProps {
  form: EvolutionForm
  plannedStep: ProtocolStep | null
  selectedStep: ProtocolStep | null
  performerName: string | null
  preview: PreviewDoseResult | null
  previewPending: boolean
  previewError: string | null
}

/**
 * Revisão antes do comando: previsto e realizado lado a lado e a prévia da
 * sucessora calculada pelo servidor sobre este exato corpo. A prévia não grava
 * nada; a confirmação grava tudo em uma transação.
 */
export function EvolutionReviewStep({
  form,
  plannedStep,
  selectedStep,
  performerName,
  preview,
  previewPending,
  previewError,
}: ReviewStepProps) {
  const preItems: { label: string; value: string }[] = [
    ...(form.intervalReport ? [{ label: 'Relato do intervalo', value: form.intervalReport }] : []),
    { label: 'Efeito Colateral', value: form.sideEffect === 'yes' ? 'Sim' : 'Não' },
    { label: 'Necessidade de Medicação', value: form.medicationNeeded === 'yes' ? 'Sim' : 'Não' },
    ...(form.sideEffect === 'yes' ? [{ label: 'Efeitos Relatados', value: form.reportedEffects || '—' }] : []),
    ...(form.medicationNeeded === 'yes' ? [{ label: 'Medicações', value: form.medications || '—' }] : []),
    ...(form.notesPre ? [{ label: 'Notas', value: form.notesPre }] : []),
  ]

  const postItems: { label: string; value: string }[] = [
    { label: 'Data', value: form.applicationDate ? format(parse(form.applicationDate, 'yyyy-MM-dd', new Date()), 'dd/MM/yyyy') : '—' },
    { label: 'Horário', value: form.endTime ? `${form.startTime} – ${form.endTime}` : form.startTime || '—' },
    {
      label: 'Previsto pela prescrição',
      value: plannedStep ? `${plannedStep.label} — ${formatStepPresentation(plannedStep)}` : '—',
    },
    {
      label: 'Realizado',
      value: selectedStep ? `${selectedStep.label} — ${formatStepPresentation(selectedStep)}` : '—',
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

      {previewPending && (
        <p className="text-[0.75rem] text-(--text-muted)">Consultando a recomendação do servidor…</p>
      )}
      {previewError && (
        <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 rounded-lg px-3.5 py-3">
          <FontAwesomeIcon icon={faCircleInfo} className="text-red-500 shrink-0" style={{ fontSize: 14 }} />
          <p className="text-xs text-red-700">{previewError}</p>
        </div>
      )}
      {preview?.recommendation.kind === 'RECOMMENDED' && (
        <div
          className="relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3"
          style={{
            background: 'linear-gradient(120deg, #fbfcfc, #f4f7f7)',
            boxShadow: '0 6px 18px -6px rgba(16,60,68,0.18)',
          }}
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: '#10b981', boxShadow: '0 2px 8px rgba(16,185,129,0.35)' }}
          >
            <FontAwesomeIcon icon={faCalendarCheck} style={{ fontSize: 16, color: '#ffffff' }} />
          </span>
          <p className="text-[0.78rem] leading-relaxed text-slate-600">
            O servidor recomenda como próxima dose{' '}
            <span className="font-bold text-slate-800">
              {preview.recommendation.label} — {formatStepPresentation(preview.recommendation.values)}
            </span>
            {preview.nextScheduledAt && (
              <>
                {' '}para <span className="font-bold text-slate-800">{formatInstantDate(preview.nextScheduledAt)}</span>
                {' '}(intervalo de{' '}
                <span className="font-bold text-slate-800">{preview.recommendation.values.intervalDays} dias</span>).
              </>
            )}
            {' '}Ela será gravada junto desta confirmação.
          </p>
        </div>
      )}
      {preview?.recommendation.kind === 'END_OF_SEQUENCE' && (
        <div
          className="relative flex items-center gap-3 overflow-hidden rounded-xl px-4 py-3"
          style={{
            background: 'linear-gradient(120deg, #fbfcfc, #f4f7f7)',
            boxShadow: '0 6px 18px -6px rgba(16,60,68,0.18)',
          }}
        >
          <span
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
            style={{ background: '#0ea5e9', boxShadow: '0 2px 8px rgba(14,165,233,0.35)' }}
          >
            <FontAwesomeIcon icon={faFlagCheckered} style={{ fontSize: 14, color: '#ffffff' }} />
          </span>
          <p className="text-[0.78rem] leading-relaxed text-slate-600">
            Fim da sequência automática: nenhuma sucessora será criada. Isso{' '}
            <span className="font-semibold">não encerra o tratamento</span> — a decisão clínica continua com o prescritor.
          </p>
        </div>
      )}
    </div>
  )
}

interface ReviewCardProps {
  title: string
  items: { label: string; value: string }[]
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
      <div className="grid grid-cols-3 gap-px bg-(--border-custom) rounded-lg overflow-hidden border border-(--border-custom)">
        {items.map((item) => (
          <div key={item.label} className="bg-white px-3 py-2">
            <div className="text-[0.7rem] font-semibold text-(--text-muted) mb-0.5">{item.label}</div>
            <div className="text-[0.82rem] font-medium text-(--text)">{item.value || '—'}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
