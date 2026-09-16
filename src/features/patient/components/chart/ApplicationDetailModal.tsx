import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Modal } from '@/shared/components'
import type { Application } from '@/features/patient/stores/usePatientStore'

interface ApplicationDetailModalProps {
  application: Application | null
  onClose: () => void
}

export function ApplicationDetailModal({ application, onClose }: ApplicationDetailModalProps) {
  const [tab, setTab] = useState<'pre' | 'post'>('pre')
  const [hasSwitched, setHasSwitched] = useState(false)

  const handleClose = () => {
    onClose()
    setTab('pre')
    setHasSwitched(false)
  }

  const switchTab = (next: 'pre' | 'post') => {
    if (next === tab) return
    setHasSwitched(true)
    setTab(next)
  }

  return (
    <Modal open={!!application} onClose={handleClose} title="Dados da aplicação" size="lg">
      {application && (
        <>
          <div role="tablist" aria-label="Etapas da aplicação" className="flex items-center justify-center gap-2">
            <TabButton active={tab === 'pre'} onClick={() => switchTab('pre')}>Pré-Aplicação</TabButton>
            <TabButton active={tab === 'post'} onClick={() => switchTab('post')}>Pós-Aplicação</TabButton>
          </div>

          <div key={hasSwitched ? tab : 'initial'} className={hasSwitched ? 'animate-in fade-in-0 slide-in-from-right-2 duration-200' : undefined}>
            {tab === 'pre' ? <PreTab application={application} /> : <PostTab application={application} />}
          </div>
        </>
      )}
    </Modal>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onClick}
      className={cn(
        'px-4 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 cursor-pointer',
        active ? 'bg-linear-to-br from-brand to-brand-dark text-white shadow-sm' : 'bg-teal-50 text-teal-600 hover:bg-teal-100',
      )}
    >
      {children}
    </button>
  )
}

function PreTab({ application }: { application: Application }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
    </div>
  )
}

function PostTab({ application }: { application: Application }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-4">
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
