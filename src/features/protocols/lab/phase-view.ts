import type { ProtocolPhase } from '@/shared/api/contracts/protocols'

interface PhaseView {
  label: string
  short: string

  bar: string

  ring: string
  text: string

  chip: string

  selected: string
}


export const PHASE_VIEW: Record<ProtocolPhase, PhaseView> = {
  BUILD_UP: {
    label: 'Indução',
    short: 'Indução',
    bar: 'bg-[#74C3B9]',
    ring: 'border-[#74C3B9]',
    text: 'text-[#2F7F76]',
    chip: 'border-[#74C3B9]/45 bg-[#74C3B9]/20 text-[#2F7F76]',

    selected:
      'border-[#2F7F76] bg-[#E8F5F3] shadow-[0_0_0_3px_rgba(116,195,185,0.45),0_10px_22px_-10px_rgba(16,60,68,0.45)]',
  },
  MAINTENANCE: {
    label: 'Manutenção',
    short: 'Manut.',
    bar: 'bg-[#B7E06A]',
    ring: 'border-[#B7E06A]',
    text: 'text-[#5F8A22]',
    chip: 'border-[#B7E06A]/55 bg-[#B7E06A]/25 text-[#5F8A22]',
    selected:
      'border-[#5F8A22] bg-[#F3F9E3] shadow-[0_0_0_3px_rgba(183,224,106,0.55),0_10px_22px_-10px_rgba(60,80,20,0.4)]',
  },
}
