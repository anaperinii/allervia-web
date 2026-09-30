import type { ProtocolPhase } from '@/shared/api/contracts/protocols'

interface PhaseView {
  label: string
  short: string
  /** Faixa de cor no topo do card do mapa. */
  bar: string
  /** Borda do card quando a etapa faz parte da trilha. */
  ring: string
  text: string
  /** Tag com fundo, no padrão das tags SCIT/SLIT do painel de métricas. */
  chip: string
  /** Realce do card quando a etapa está selecionada no mapa. */
  selected: string
}

// Mesmos tons das tags SCIT/SLIT do painel de métricas.
export const PHASE_VIEW: Record<ProtocolPhase, PhaseView> = {
  BUILD_UP: {
    label: 'Indução',
    short: 'Indução',
    bar: 'bg-[#74C3B9]',
    ring: 'border-[#74C3B9]',
    text: 'text-[#2F7F76]',
    chip: 'border-[#74C3B9] bg-[#74C3B9]/25 text-[#2F7F76]',
    // Fundo sólido: translúcido deixaria a trilha aparecer por baixo do card.
    selected:
      'border-[#2F7F76] bg-[#E8F5F3] shadow-[0_0_0_3px_rgba(116,195,185,0.45),0_10px_22px_-10px_rgba(16,60,68,0.45)]',
  },
  MAINTENANCE: {
    label: 'Manutenção',
    short: 'Manut.',
    bar: 'bg-[#B7E06A]',
    ring: 'border-[#B7E06A]',
    text: 'text-[#5F8A22]',
    chip: 'border-[#B7E06A] bg-[#B7E06A]/30 text-[#5F8A22]',
    selected:
      'border-[#5F8A22] bg-[#F3F9E3] shadow-[0_0_0_3px_rgba(183,224,106,0.55),0_10px_22px_-10px_rgba(60,80,20,0.4)]',
  },
}
