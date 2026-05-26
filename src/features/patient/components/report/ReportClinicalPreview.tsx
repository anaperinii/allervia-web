import { EyeOff } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
  ADJUSTMENT_TYPE_LABELS,
  INACTIVATION_CATEGORY_LABELS,
} from '@/features/patient/constants/clinical-labels'
import { derivePatientDates } from '@/features/patient/lib/patient-dates'
import type { Application, Patient } from '@/features/patient/stores/usePatientStore'
import type { ReportFileFormat, ReportSectionId } from '@/features/patient/exporters/types'
import { maskCpf, maskName, maskPhone } from '@/shared/lib/mask'

interface ReportClinicalPreviewProps {
  patient: Patient
  realizedApplications: Application[]
  reactionsCount: number
  selectedSections: ReportSectionId[]
  fileFormat: ReportFileFormat
  anonymized: boolean
}

export function ReportClinicalPreview({
  patient,
  realizedApplications,
  reactionsCount,
  selectedSections,
  fileFormat,
  anonymized,
}: ReportClinicalPreviewProps) {
  const { inductionStart } = derivePatientDates(realizedApplications, patient.id)
  return (
    <div className="bg-white rounded-xl border border-(--border-custom) shadow-sm max-w-2xl mx-auto">
      <div className="px-6 py-5 border-b border-(--border-custom)">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-(--text)">
              Relatório Clínico: {anonymized ? maskName(patient.name, true) : patient.name}
            </h2>
            <p className="text-[0.65rem] text-(--text-muted) mt-0.5">
              Gerado em {format(new Date(), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
          </div>
          <div className="text-[0.6rem] text-(--text-muted) text-right">
            <div>ImuneCare</div>
            <div>Formato: {fileFormat.toUpperCase()}</div>
            {anonymized && (
              <div className="flex items-center gap-1 text-brand font-semibold mt-0.5 justify-end">
                <EyeOff size={10} />
                Dados anonimizados
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-6 py-5 space-y-5">
        {selectedSections.length === 0 ? (
          <div className="text-center py-12 text-xs text-(--text-muted)">Selecione pelo menos uma seção.</div>
        ) : (
          <>
            {selectedSections.includes('personal') && (
              <Section title="Dados Pessoais">
                <KeyValueGrid items={[
                  ['Nome', anonymized ? maskName(patient.name, true) : patient.name],
                  ['CPF', maskCpf(patient.cpf, anonymized)],
                  ['Data de Nascimento', patient.birthDate],
                  ['Idade', `${patient.age} anos`],
                  ['Telefone', maskPhone(patient.phone, anonymized)],
                  ['Peso', patient.weight],
                  ['Médico Responsável', patient.responsibleDoctor],
                ]} />
              </Section>
            )}

            {selectedSections.includes('immunotherapy') && (
              <Section title="Dados da Imunoterapia">
                <KeyValueGrid items={[
                  ['Tipo', patient.immunotherapyType],
                  ['Via', patient.administrationRoute],
                  ['Extrato', patient.extract],
                  ['Início Indução', inductionStart ?? '-'],
                  ['Meta', patient.targetConcentrationVolume],
                  ['Dose Atual', patient.currentDoseConcentration],
                  ['Intervalo Atual', `${patient.currentInterval} dias`],
                ]} />
              </Section>
            )}

            {selectedSections.includes('applications') && (
              <Section title={`Histórico de Aplicações (${realizedApplications.length})`}>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-(--border-custom)">
                      <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Data</th>
                      <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Dose</th>
                      <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Intervalo</th>
                      <th className="text-left text-[0.6rem] font-semibold text-(--text-muted) uppercase pb-2">Reação</th>
                    </tr>
                  </thead>
                  <tbody>
                    {realizedApplications.slice(0, 15).map((app) => (
                      <tr key={app.id} className="border-b border-(--border-custom) last:border-0">
                        <td className="py-1.5 text-[0.65rem] text-(--text)">{app.date}</td>
                        <td className="py-1.5 text-[0.65rem] text-(--text)">{app.dose}</td>
                        <td className="py-1.5 text-[0.65rem] text-(--text)">{app.cycle.days}d</td>
                        <td className="py-1.5 text-[0.65rem]">
                          <span className={cn('font-medium', app.sideEffect === 'yes' ? 'text-amber-600' : 'text-green-600')}>
                            {app.sideEffect === 'yes' ? 'Sim' : 'Não'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {realizedApplications.length > 15 && (
                  <div className="text-center text-[0.6rem] text-(--text-muted) mt-2">… e mais {realizedApplications.length - 15} aplicações</div>
                )}
              </Section>
            )}

            {selectedSections.includes('reactions') && (
              <Section title={`Reações Adversas (${reactionsCount})`}>
                {reactionsCount === 0 ? (
                  <p className="text-[0.7rem] text-(--text-muted)">Nenhuma reação adversa registrada.</p>
                ) : (
                  <div className="space-y-2">
                    {realizedApplications.filter((a) => a.sideEffect === 'yes').map((app) => (
                      <div key={app.id} className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.65rem] font-semibold text-amber-700">{app.date} — {app.dose}</span>
                          <span className="text-[0.55rem] text-amber-600">{app.medicationNeeded === 'yes' ? 'Com medicação' : 'Sem medicação'}</span>
                        </div>
                        {app.administratorNote && app.administratorNote !== '-' && (
                          <div className="text-[0.6rem] text-amber-600 mt-1">{app.administratorNote}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {selectedSections.includes('adjustments') && (
              <Section title={`Ajustes de Protocolo (${patient.protocolAdjustments?.length ?? 0})`}>
                {!patient.protocolAdjustments?.length ? (
                  <p className="text-[0.7rem] text-(--text-muted)">Nenhum ajuste registrado.</p>
                ) : (
                  <div className="space-y-2">
                    {patient.protocolAdjustments.map((adj) => (
                      <div key={adj.id} className="border border-(--border-custom) rounded-lg px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.65rem] font-semibold text-(--text)">{ADJUSTMENT_TYPE_LABELS[adj.type]}</span>
                          <span className="text-[0.55rem] text-(--text-muted)">{adj.date}</span>
                        </div>
                        <div className="text-[0.6rem] text-(--text-muted)">
                          <span className="line-through">{adj.previousConcentration} · {adj.previousInterval}d</span>
                          {' → '}
                          <span className="text-brand font-semibold">{adj.newConcentration} · {adj.newInterval}d</span>
                        </div>
                        <div className="text-[0.6rem] text-(--text-muted) leading-relaxed">{adj.justification}</div>
                        <div className="text-[0.55rem] text-(--text-muted)">Responsável: {adj.responsibleDoctor}</div>
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {selectedSections.includes('inactivations') && (
              <Section title={`Histórico de Inativações (${patient.inactivations?.length ?? 0})`}>
                {!patient.inactivations?.length ? (
                  <p className="text-[0.7rem] text-(--text-muted)">Nenhuma inativação registrada.</p>
                ) : (
                  <div className="space-y-2">
                    {patient.inactivations.map((inact) => (
                      <div key={inact.id} className="border border-(--border-custom) rounded-lg px-3 py-2 space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="text-[0.65rem] font-semibold text-(--text)">{INACTIVATION_CATEGORY_LABELS[inact.category]}</span>
                          <span className="text-[0.55rem] text-(--text-muted)">{inact.startDate}</span>
                        </div>
                        <div className="text-[0.6rem] text-(--text-muted) leading-relaxed">{inact.detail}</div>
                        {inact.reactivatedAt && (
                          <div className="text-[0.55rem] text-emerald-700">Reativada em {inact.reactivatedAt}</div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </Section>
            )}

            {selectedSections.includes('progress') && (
              <Section title="Progressão do Protocolo">
                <div className="grid grid-cols-3 gap-3">
                  <StatBox value={String(realizedApplications.length)} label="Aplicações" />
                  <StatBox value={patient.currentDoseConcentration.split(' - ')[0]} label="Concentração atual" />
                  <StatBox value={`${patient.currentInterval}d`} label="Intervalo" />
                </div>
              </Section>
            )}
          </>
        )}
      </div>

      <div className="px-6 py-3 border-t border-(--border-custom)">
        <div className="flex justify-between mb-2">
          <span className="text-[0.6rem] text-(--text-muted)">ImuneCare © 2026</span>
          <span className="text-[0.6rem] text-(--text-muted)">Página 1 de 1</span>
        </div>
        <p className="text-[0.5rem] text-(--text-muted)/60 leading-relaxed mb-2">
          Documento protegido pela Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018). A reprodução, compartilhamento ou armazenamento não autorizado é proibido. O responsável pela exportação assume total responsabilidade pelo uso das informações.
        </p>
        <div className="text-center py-1.5 bg-gray-50 rounded-md border border-(--border-custom)">
          <span className="text-[0.7rem] font-bold text-gray-300 uppercase tracking-[0.2em]">Confidencial</span>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-xs font-bold text-(--text) mb-3 pb-1.5 border-b border-(--border-custom)">{title}</h3>
      {children}
    </div>
  )
}

function KeyValueGrid({ items }: { items: [string, string][] }) {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2">
      {items.map(([label, value]) => (
        <div key={label} className="flex items-center gap-2 text-[0.7rem]">
          <span className="text-(--text-muted)">{label}:</span>
          <span className="font-medium text-(--text)">{value}</span>
        </div>
      ))}
    </div>
  )
}

function StatBox({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-gray-50 rounded-lg p-3 text-center">
      <div className="text-lg font-extrabold text-brand">{value}</div>
      <div className="text-[0.6rem] text-(--text-muted)">{label}</div>
    </div>
  )
}
