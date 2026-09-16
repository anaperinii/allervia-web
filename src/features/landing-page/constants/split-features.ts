export interface SplitFeature {
  title: string
  description: string
}

export const SPLIT_FEATURES: SplitFeature[] = [
  { title: 'Veja tudo de relance', description: 'Monitore o status de cada paciente, fase do protocolo e próxima aplicação em tempo real.' },
  { title: 'Protocolos como você pensa', description: 'Configure fases de indução e manutenção com concentrações, volumes e intervalos que refletem sua lógica clínica.' },
  { title: 'Progressão automática de doses', description: 'O sistema calcula a próxima dose com base no protocolo validado, eliminando erros manuais.' },
  { title: 'Rastreabilidade completa', description: 'Cada decisão terapêutica é registrada — da prescrição à aplicação, com histórico auditável.' },
]
