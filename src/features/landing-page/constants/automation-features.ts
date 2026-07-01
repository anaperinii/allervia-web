import type { AutomationGlyphKind } from '@/features/landing-page/components/AutomationGlyph'

export interface AutomationFeature {
  kind: AutomationGlyphKind
  title: string
  description: string
}

export const AUTOMATION_FEATURES: AutomationFeature[] = [
  { kind: 'tracking', title: 'Rastreamento de Desempenho', description: 'Monitore adesão, intervalos e resultados sem precisar revisar registros manualmente.' },
  { kind: 'sync', title: 'Sincronização em Tempo Real', description: 'Dados do paciente, fases do protocolo e status de aplicações sempre atualizados.' },
  { kind: 'automation', title: 'Automação Inteligente', description: 'Cálculo automático de doses e progressão de protocolo baseado em regras clínicas validadas.' },
  { kind: 'protocols', title: 'Gestão de Protocolos', description: 'Organize e visualize protocolos de indução e manutenção como um blueprint clínico executável.' },
]
