import { cn } from '@/shared/lib/cn'
import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'
import { MODALITY_LABELS } from '@/features/immunotherapy/constants/modality'
import type { Immunotherapy } from '@/features/immunotherapy/stores/useImmunotherapiesStore'

interface ImmunotherapiesTableProps {
  items: Immunotherapy[]
  onSelect: (item: Immunotherapy) => void
}

export function ImmunotherapiesTable({ items, onSelect }: ImmunotherapiesTableProps) {
  return (
    <table className="w-full" aria-label="Lista de imunoterapias">
      <thead>
        <tr className="border-b border-(--border-custom) bg-gray-50/80">
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider pl-5 pr-4 py-2.5">Nome</th>
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider pl-6 pr-4 py-2.5">Tipo</th>
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Via de administração</th>
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Dose e Concentração Atuais</th>
          <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Intervalo Atual</th>
        </tr>
      </thead>
      <tbody>
        {items.length === 0 ? (
          <tr>
            <td colSpan={5} className="text-center text-(--text-muted) py-10 text-xs">Nenhum resultado encontrado</td>
          </tr>
        ) : (
          items.map((item) => {
            const color = getIntervalColor(item.cycleInterval.days)
            const isInactive = item.status === 'inactive'
            return (
              <tr
                key={item.id}
                role="button"
                tabIndex={0}
                aria-label={`Abrir prontuário de ${item.name}`}
                onClick={() => onSelect(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(item)
                  }
                }}
                className="border-b border-(--border-custom) last:border-0 cursor-pointer hover:bg-[#6C9EA5]/5 transition-colors duration-150 focus:outline-none focus:bg-[#6C9EA5]/10"
              >
                <td className={cn('pl-5 pr-4 py-2 text-xs font-medium', isInactive ? 'text-(--text-muted)' : 'text-(--text)')}>
                  <div className="flex items-center gap-2">
                    {item.name}
                    {isInactive && (
                      <span className="text-[0.55rem] font-semibold px-1.5 py-px rounded-full bg-gray-100 text-(--text-muted) border border-gray-200">
                        Inativo
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="inline-block px-2 py-0.5 rounded-md bg-gray-200/70 text-[0.7rem] font-medium text-(--text-muted) border border-gray-200">
                    {item.type}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-(--text-muted)">{MODALITY_LABELS[item.modality]}</td>
                <td className="px-4 py-2 text-xs text-(--text-muted)">{item.doseConcentration}</td>
                <td className="px-4 py-2">
                  <span
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[0.65rem] font-semibold border"
                    style={{ backgroundColor: color.bg + '73', color: color.text, borderColor: color.dot + '30' }}
                  >
                    {item.cycleInterval.days} dias
                  </span>
                </td>
              </tr>
            )
          })
        )}
      </tbody>
    </table>
  )
}
