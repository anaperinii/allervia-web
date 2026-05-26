import { BellOff } from 'lucide-react'
import { Button } from '@/shared/components'

interface NotificationsEmptyProps {
  hasActiveFilters: boolean
  onClearFilters: () => void
}

export function NotificationsEmpty({ hasActiveFilters, onClearFilters }: NotificationsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <BellOff size={32} className="text-gray-300 mb-3" />
      {hasActiveFilters ? (
        <>
          <span className="text-xs text-(--text-muted)">Nenhuma notificação corresponde aos filtros</span>
          <Button tone="danger" variant="ghost" size="sm" onClick={onClearFilters} className="mt-3">
            Limpar filtros
          </Button>
        </>
      ) : (
        <span className="text-xs text-(--text-muted)">Você não tem notificações</span>
      )}
    </div>
  )
}
