import { Crosshair, RefreshCw, Sparkles, FolderKanban } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface AutomationFeature {
  icon: LucideIcon
  title: string
  description: string
}

export const AUTOMATION_FEATURES: AutomationFeature[] = [
  { icon: Crosshair, title: 'Rastreamento de Desempenho', description: 'Monitore adesão, intervalos e resultados sem precisar revisar registros manualmente.' },
  { icon: RefreshCw, title: 'Sincronização em Tempo Real', description: 'Dados do paciente, fases do protocolo e status de aplicações sempre atualizados.' },
  { icon: Sparkles, title: 'Automação Inteligente', description: 'Cálculo automático de doses e progressão de protocolo baseado em regras clínicas validadas.' },
  { icon: FolderKanban, title: 'Gestão de Protocolos', description: 'Organize e visualize protocolos de indução e manutenção como um blueprint clínico executável.' },
]
