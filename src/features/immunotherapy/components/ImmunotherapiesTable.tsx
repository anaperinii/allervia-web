import { cn } from '@/shared/lib/cn'
import type { ImmunotherapyListItem } from '@/shared/api/contracts/clinical'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import { PHASE_VIEW } from '@/features/protocols/lab/phase-view'
import {
  formatInstantDate,
  ROUTE_LABELS,
} from '@/features/patient/adapters/clinical-presentation'

interface ImmunotherapiesTableProps {
  items: ImmunotherapyListItem[]
  onSelect: (item: ImmunotherapyListItem) => void
}

export function ImmunotherapiesTable({ items, onSelect }: ImmunotherapiesTableProps) {
  return (
    <table className="w-full" aria-label="Lista de imunoterapias">
      <thead>
        <tr className="border-b border-white/40 bg-white/20 backdrop-blur-md">
          <th className="text-left text-[0.8rem] font-semibold text-[#12333a] pl-5 pr-4 pt-4 pb-2.5">Paciente</th>
          <th className="text-left text-[0.8rem] font-semibold text-[#12333a] pl-6 pr-4 pt-4 pb-2.5">Tipo</th>
          <th className="text-left text-[0.8rem] font-semibold text-[#12333a] px-4 pt-4 pb-2.5">Intervalo e fase</th>
          <th className="text-left text-[0.8rem] font-semibold text-[#12333a] px-4 pt-4 pb-2.5">Via de administração</th>
          <th className="text-left text-[0.8rem] font-semibold text-[#12333a] px-4 pt-4 pb-2.5">Próxima aplicação</th>
          <th className="text-left text-[0.8rem] font-semibold text-[#12333a] px-4 pt-4 pb-2.5">Médico responsável</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={6} className="text-center text-(--text-muted) py-10 text-xs">
              Nenhum tratamento encontrado com os filtros atuais
            </td>
          </tr>
        ) : (
          items.map((item) => {
            // Fallback pela data de manutenção: sustenta respostas de um
            // servidor anterior ao campo currentPhase.
            const phase =
              PHASE_VIEW[
                item.currentPhase ??
                  (item.maintenanceStartDate ? 'MAINTENANCE' : 'BUILD_UP')
              ]
            const interval = item.nextDose?.intervalDays ?? null
            const intervalColor =
              interval !== null ? getIntervalColor(interval) : null
            const inactivePatient = !item.patient.isActive
            return (
              <tr
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Abrir prontuário de ${item.patient.fullName}`}
                onClick={() => onSelect(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(item)
                  }
                }}
                className="border-b border-(--border-custom) last:border-0 cursor-pointer hover:bg-[#6C9EA5]/5 transition-colors duration-150 focus:outline-none focus:bg-[#6C9EA5]/10"
              >
                <td className={cn('pl-5 pr-4 py-2 text-xs font-medium', inactivePatient ? 'text-(--text-muted)' : 'text-(--text)')}>
                  <div className="flex items-center gap-2">
                    {item.patient.fullName}
                    {inactivePatient && (
                      <span className="text-[0.55rem] font-semibold px-1.5 py-px rounded-full bg-gray-100 text-(--text-muted) border border-gray-200">
                        Cadastro inativo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-gray-200/70 text-[0.7rem] font-medium text-(--text-muted) border border-gray-200">
                    {item.immunoType}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <div className="flex flex-wrap items-center gap-1.5">
                    {intervalColor ? (
                      <span
                        className="inline-flex items-center rounded-md border px-2 py-0.5 text-[0.65rem] font-semibold"
                        style={{
                          backgroundColor: intervalColor.bg + '4D',
                          color: intervalColor.text,
                          borderColor: intervalColor.dot + '30',
                        }}
                      >
                        {interval} dias
                      </span>
                    ) : (
                      <span className="text-[0.65rem] text-(--text-muted)">
                        Sem previsão
                      </span>
                    )}
                    <span
                      className={cn(
                        'inline-flex items-center rounded-md border px-2 py-0.5 text-[0.65rem] font-semibold',
                        phase.chip,
                      )}
                    >
                      {phase.label}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-2 text-xs text-(--text-muted)">
                  {ROUTE_LABELS[item.administrationRoute]}
                </td>
                <td className="px-4 py-2 text-xs text-(--text-muted)">
                  {item.nextDose ? formatInstantDate(item.nextDose.scheduledAt) : '—'}
                </td>
                <td className="px-4 py-2 text-xs text-(--text-muted)">
                  {item.responsiblePhysician.fullName}
                </td>
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  )
}
