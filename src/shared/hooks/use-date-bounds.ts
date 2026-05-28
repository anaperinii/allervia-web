/**
 * Hook que retorna min/max strings para inputs de data,
 * reagindo automaticamente à virada de ano via CurrentYearContext.
 * Qualquer componente que use este hook re-renderizará em 1° de janeiro,
 * garantindo que os atributos min/max nunca fiquem desatualizados.
 */
import { useCurrentYear } from '@/routes/__root'
import { todayStr, maxFutureDateStr, minDateStr } from '@/shared/lib/dates'

export function useDateBounds() {
  // Consome o contexto de ano — força re-render na virada de ano.
  // O valor em si não é usado diretamente pois as funções já chamam new Date().
  useCurrentYear()

  return {
    today: todayStr(),
    maxFuture: maxFutureDateStr(),
    minDate: minDateStr(),
  }
}
