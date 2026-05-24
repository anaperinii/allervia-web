import { Eye, Dna, Zap, Map } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface SplitFeature {
  icon: LucideIcon
  title: string
  description: string
}

export const SPLIT_FEATURES: SplitFeature[] = [
  { icon: Eye, title: 'Veja tudo de relance', description: 'Monitore o status de cada paciente, fase do protocolo e próxima aplicação em tempo real.' },
  { icon: Dna, title: 'Protocolos como você pensa', description: 'Configure fases de indução e manutenção com concentrações, volumes e intervalos que refletem sua lógica clínica.' },
  { icon: Zap, title: 'Progressão automática de doses', description: 'O sistema calcula a próxima dose com base no protocolo validado, eliminando erros manuais.' },
  { icon: Map, title: 'Rastreabilidade completa', description: 'Cada decisão terapêutica é registrada — da prescrição à aplicação, com histórico auditável.' },
]
