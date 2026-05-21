export interface Faq {
  question: string
  answer: string
}

export const FAQS: Faq[] = [
  {
    question: 'Como cadastrar um novo paciente?',
    answer: 'Acesse Imunoterapias > Adicionar Imunoterapia. O cadastro do paciente é feito na primeira etapa do fluxo, seguido da prescrição do protocolo.',
  },
  {
    question: 'Como funciona o cálculo automático de doses?',
    answer: 'O sistema segue o protocolo SCIT padrão: progressão de volume (0,1 → 0,2 → 0,4 → 0,8ml) dentro de cada concentração (1:10.000 → 1:1.000 → 1:100 → 1:10), com intervalo de 7 dias na indução.',
  },
  {
    question: 'Posso ajustar o protocolo manualmente?',
    answer: 'Sim. O médico responsável pode alterar concentração, volume e intervalo a qualquer momento, mediante justificativa clínica obrigatória.',
  },
  {
    question: 'Como exportar relatórios?',
    answer: 'Acesse Dashboard > Exportar Relatório. Você pode escolher o formato (PDF, Excel, CSV), período e quais gráficos incluir.',
  },
  {
    question: 'O que acontece quando o paciente não comparece?',
    answer: 'A aplicação é marcada como "Ausente" no agendamento. O sistema alerta para avaliação sobre necessidade de retroceder doses antes de prosseguir.',
  },
]
