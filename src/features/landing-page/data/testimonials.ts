export interface Testimonial {
  quote: string
  name: string
  handle: string
  initials: string
}

export const TESTIMONIALS: Testimonial[] = [
  { quote: 'O ImuneCare transformou a gestão da nossa clínica. Antes dependíamos de planilhas — agora temos controle total dos protocolos.', name: 'Dra. Sofia Andrade', handle: '@sofia.alergista', initials: 'SA' },
  { quote: 'O cálculo automático de doses eliminou os erros manuais. Minha equipe confia muito mais no processo agora.', name: 'Dr. Marcos Rezende', handle: '@mrezende_imuno', initials: 'MR' },
  { quote: 'Consigo acompanhar cada paciente em diferentes fases do protocolo sem perder nenhum detalhe. Ferramenta essencial.', name: 'Dra. Camila Alves', handle: '@camilaalergol', initials: 'CA' },
  { quote: 'A rastreabilidade das aplicações e reações adversas nos deu uma segurança clínica que não tínhamos antes.', name: 'Dr. Rodrigo Figueiredo', handle: '@rodrifig', initials: 'RF' },
  { quote: 'Os dashboards analíticos me ajudam a tomar decisões clínicas mais informadas sobre a progressão dos pacientes.', name: 'Dra. Larissa Pinheiro', handle: '@larissapin', initials: 'LP' },
  { quote: 'Implementação foi simples e a equipe toda adotou rápido. O suporte é excelente.', name: 'Dr. Bruno Nascimento', handle: '@brunon_med', initials: 'BN' },
]
