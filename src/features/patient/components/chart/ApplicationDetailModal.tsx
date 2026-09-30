import { useQuery } from '@tanstack/react-query'
import { Button, Modal } from '@/shared/components'
import { getDose } from '@/shared/api/clinical.api'
import { queryKeys } from '@/shared/api/query-keys'
import { formatInstantDate } from '@/features/patient/adapters/clinical-presentation'
import type { DoseObservationAddendum } from '@/shared/api/contracts/clinical'
import type { Application } from '@/features/patient/stores/usePatientStore'

const CONDUCT_LABELS: Record<string, string> = {
  MAINTAIN: 'Manter protocolo',
  REQUEST_PHYSICIAN_REVIEW: 'Solicitar avaliação médica',
  SUSPEND_TREATMENT: 'Suspender tratamento',
}

interface ApplicationDetailModalProps {
  application: Application | null
  organizationId: string
  onClose: () => void
  onRetract?: (doseId: string) => void
  onLateObservation?: (doseId: string) => void
}

export function ApplicationDetailModal({
  application,
  organizationId,
  onClose,
  onRetract,
  onLateObservation,
}: ApplicationDetailModalProps) {
  const completed = application?.status === 'completed'

  // As observações tardias só existem no detalhe da dose; a listagem que
  // alimenta `application` não as carrega.
  const doseQuery = useQuery({
    queryKey: queryKeys.dose(organizationId, application?.id ?? ''),
    queryFn: ({ signal }) => getDose(application!.id, signal),
    enabled: organizationId !== '' && !!application && completed,
  })
  const addenda = doseQuery.data?.observationAddenda ?? []

  return (
    <Modal
      open={!!application}
      onClose={onClose}
      title="Dados da aplicação"
      size="2xl"
      footer={
        completed && (onRetract || onLateObservation) ? (
          <>
            {onLateObservation && (
              <Button
                variant="outline"
                tone="brand"
                onClick={() => onLateObservation(application!.id)}
              >
                Observação tardia
              </Button>
            )}
            {onRetract && (
              <Button
                variant="outline"
                tone="danger"
                onClick={() => onRetract(application!.id)}
              >
                Registrar em erro
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>Fechar</Button>
          </>
        ) : undefined
      }
    >
      {application && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Panel title="Pré-Aplicação">
              <Field colSpan label="Como o paciente passou durante o intervalo da última aplicação?">
                {application.administratorNote || 'Sem intercorrências relatadas durante o intervalo.'}
              </Field>
              <Field label="Presença de efeito colateral">{application.sideEffect === 'yes' ? 'Sim' : 'Não'}</Field>
              <Field label="Necessidade de medicação">{application.medicationNeeded === 'yes' ? 'Sim' : 'Não'}</Field>
              {application.sideEffect === 'yes' && (
                <Field colSpan label="Efeitos colaterais relatados">{application.reportedEffects || '—'}</Field>
              )}
              {application.medicationNeeded === 'yes' && (
                <Field colSpan label="Medicações administradas">{application.medications || '—'}</Field>
              )}
            </Panel>

            <Panel title="Pós-Aplicação">
              <Field label="Horário">{application.startTime} – {application.endTime}</Field>
              <Field label="Data">{application.date}</Field>
              <Field label="Volume aplicado">{application.appliedVolume || '-'}</Field>
              <Field label="Concentração aplicada">{application.extractConcentration || '-'}</Field>
              <Field label="Intervalo associado da dose">{application.cycle.days} dias</Field>
              <Field label="Responsável">{application.administrator || '-'}</Field>
              <Field label="Presença de efeito colateral">{application.sideEffect === 'yes' ? 'Sim' : 'Não'}</Field>
              <Field label="Necessidade de medicação">{application.medicationNeeded === 'yes' ? 'Sim' : 'Não'}</Field>
              {application.sideEffect === 'yes' && (
                <Field colSpan label="Efeitos colaterais relatados">{application.reportedEffects || '—'}</Field>
              )}
              {application.medicationNeeded === 'yes' && (
                <Field colSpan label="Medicações administradas">{application.medications || '—'}</Field>
              )}
              <Field colSpan label="Notas do responsável">{application.administratorNote || '-'}</Field>
            </Panel>
          </div>

          {addenda.length > 0 && (
            <Panel title={addenda.length > 1 ? 'Observações tardias' : 'Observação tardia'}>
              <div className="col-span-2 space-y-3">
                {addenda.map((addendum) => (
                  <Addendum key={addendum.id} addendum={addendum} />
                ))}
              </div>
            </Panel>
          )}
        </div>
      )}
    </Modal>
  )
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-(--border-custom) bg-white p-4">
      <h3 className="mb-3 text-[0.7rem] font-bold uppercase tracking-wide text-(--text-muted)">
        {title}
      </h3>
      <div className="grid grid-cols-2 gap-x-4 gap-y-3">{children}</div>
    </section>
  )
}

function Addendum({ addendum }: { addendum: DoseObservationAddendum }) {
  return (
    <div className="rounded-lg border border-(--border-custom) bg-gray-50/60 px-3 py-2.5">
      <div className="mb-1.5 text-[0.65rem] font-semibold text-(--text-muted)">
        Observado em {formatInstantDate(addendum.observedAt)}
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-2">
        <Field label="Efeitos colaterais relatados">
          {addendum.reportedSideEffects.join(', ') || '—'}
        </Field>
        <Field label="Medicações administradas">
          {addendum.administeredMedications.join(', ') || '—'}
        </Field>
        {addendum.conduct && (
          <Field label="Conduta imediata">
            {CONDUCT_LABELS[addendum.conduct] ?? addendum.conduct}
          </Field>
        )}
        {addendum.conductJustification && (
          <Field label="Justificativa da conduta">{addendum.conductJustification}</Field>
        )}
        {addendum.notes && <Field colSpan label="Notas">{addendum.notes}</Field>}
      </div>
    </div>
  )
}

function Field({ label, children, colSpan }: { label: string; children: React.ReactNode; colSpan?: boolean }) {
  return (
    <div className={colSpan ? 'col-span-2' : undefined}>
      <div className="text-[0.65rem] font-semibold text-(--text-muted) mb-0.5">{label}</div>
      <div className="text-xs text-(--text) leading-relaxed">{children}</div>
    </div>
  )
}
