import type { UserRole } from '@/shared/stores/useUserStore'

/**
 * PENDÊNCIA DE INTEGRAÇÃO — dados simulados.
 *
 * As telas ainda escolhem médico responsável e executor da aplicação a partir
 * desta lista fixa. A identidade do usuário autenticado já vem do servidor
 * (`/account/me`); o que falta é a listagem paginada de profissionais da
 * organização, entregue na etapa de organização e equipe. Até lá, nenhum
 * comando clínico deve derivar autorização daqui: estes registros só preenchem
 * campos de apresentação.
 */
export interface DirectoryEntry {
  id: string
  name: string
  role: UserRole
  title: string
  registration: string
  email: string
  phone: string
  specialty: string
  institution: string
}

export const MOCK_PROFESSIONAL_DIRECTORY: DirectoryEntry[] = [
  {
    id: 'doctor_karina',
    name: 'Dra. Karina Martins',
    role: 'doctor',
    title: 'Médica Alergista',
    registration: 'CRM/GO 24.815',
    email: 'karina@clinica.com',
    phone: '(62) 99557-1423',
    specialty: 'Alergologia e Imunologia',
    institution: 'Clínica Integrada Princípios',
  },
  {
    id: 'doctor_andre',
    name: 'Dr. André Lima',
    role: 'doctor',
    title: 'Médico Alergista',
    registration: 'CRM/GO 28.104',
    email: 'andre@clinica.com',
    phone: '(62) 98221-7066',
    specialty: 'Alergologia e Imunologia',
    institution: 'Clínica Integrada Princípios',
  },
  {
    id: 'nurse_jaqueline',
    name: 'Jaqueline Oliveira',
    role: 'nurse',
    title: 'Enfermeira',
    registration: 'COREN/GO 318.942',
    email: 'jaqueline@clinica.com',
    phone: '(62) 99431-5582',
    specialty: 'Enfermagem alergológica',
    institution: 'Clínica Integrada Princípios',
  },
]

/**
 * Quem aparece como executor da aplicação. O servidor registra a autoria pelo
 * ator autenticado; escolher outro nome aqui não altera o registro clínico.
 */
export const MOCK_APPLICATION_ADMINISTRATORS = MOCK_PROFESSIONAL_DIRECTORY.filter(
  (entry) => entry.role === 'nurse',
)
