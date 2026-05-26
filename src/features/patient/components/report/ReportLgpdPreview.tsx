import { Info } from 'lucide-react'
import type { Application, Patient } from '@/features/patient/stores/usePatientStore'
import type { AccessLog } from '@/shared/stores/useAuditStore'
import type { LgpdFileFormat } from '@/features/patient/exporters/types'
import { maskName } from '@/shared/lib/mask'

interface ReportLgpdPreviewProps {
  patient: Patient
  applications: Application[]
  accessLogs: AccessLog[]
  lgpdFormat: LgpdFileFormat
  anonymized: boolean
}

export function ReportLgpdPreview({
  patient,
  applications,
  accessLogs,
  lgpdFormat,
  anonymized,
}: ReportLgpdPreviewProps) {
  const items = [
    { label: 'Dados cadastrais', value: '1 registro' },
    { label: 'Dados da imunoterapia', value: '1 registro' },
    { label: 'Histórico de aplicações', value: `${applications.length} ${applications.length === 1 ? 'registro' : 'registros'}` },
    { label: 'Histórico de acessos', value: `${accessLogs.length} ${accessLogs.length === 1 ? 'registro' : 'registros'}` },
    { label: 'Ajustes de protocolo', value: `${patient.protocolAdjustments?.length ?? 0} ${(patient.protocolAdjustments?.length ?? 0) === 1 ? 'registro' : 'registros'}` },
    { label: 'Inativações', value: `${patient.inactivations?.length ?? 0} ${(patient.inactivations?.length ?? 0) === 1 ? 'registro' : 'registros'}` },
  ]

  return (
    <div className="bg-white rounded-xl border border-(--border-custom) shadow-sm max-w-2xl mx-auto p-6 space-y-4">
      <div className="pb-3 border-b border-(--border-custom)">
        <h2 className="text-sm font-bold text-(--text)">Pacote de Portabilidade LGPD</h2>
        <p className="text-[0.65rem] text-(--text-muted) mt-0.5">
          {anonymized ? maskName(patient.name, true) : patient.name} · {lgpdFormat.toUpperCase()}
        </p>
      </div>
      <div className="flex items-start gap-2 bg-brand/5 border border-brand/20 rounded-lg px-3 py-2.5">
        <Info size={13} className="text-brand shrink-0 mt-0.5" />
        <p className="text-[0.65rem] text-(--text) leading-relaxed">
          Pacote estruturado conforme <span className="font-bold">Art. 18, V</span> (portabilidade) e <span className="font-bold">Art. 19</span> (direito de acesso) da LGPD. Contém os dados do titular, ajustes/inativações de protocolo e o histórico de quem acessou o prontuário.
        </p>
      </div>
      <div>
        <div className="text-[0.6rem] font-bold text-(--text-muted) uppercase tracking-wider mb-2">Conteúdo do pacote</div>
        <div className="grid grid-cols-2 gap-2">
          {items.map((item) => (
            <div key={item.label} className="border border-(--border-custom) rounded-lg px-3 py-2">
              <div className="text-[0.55rem] text-(--text-muted) uppercase tracking-wider">{item.label}</div>
              <div className="text-xs font-bold text-(--text) mt-0.5">{item.value}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="text-[0.55rem] text-(--text-muted) leading-relaxed pt-2 border-t border-(--border-custom)">
        Ao confirmar a exportação, o pacote completo será gerado no formato selecionado. Assegure-se de que há justificativa formal do titular (Art. 18, § 3º da LGPD) antes de liberar o arquivo.
      </div>
    </div>
  )
}
