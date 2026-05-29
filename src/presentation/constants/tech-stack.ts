import reactLogo from '@/presentation/assets/logos/react.svg'
import typescriptLogo from '@/presentation/assets/logos/typescript.svg'
import viteLogo from '@/presentation/assets/logos/vite.svg'
import tanstackLogo from '@/presentation/assets/logos/tanstack.svg'
import zustandLogo from '@/presentation/assets/logos/zustand.svg'
import tailwindLogo from '@/presentation/assets/logos/tailwindcss.svg'
import zodLogo from '@/presentation/assets/logos/zod.svg'
import reactHookFormLogo from '@/presentation/assets/logos/reacthookform.svg'
import radixLogo from '@/presentation/assets/logos/radixui.svg'
import rechartsLogo from '@/presentation/assets/logos/recharts.svg'
import dateFnsLogo from '@/presentation/assets/logos/datefns.svg'
import jsPdfLogo from '@/presentation/assets/logos/jspdf.svg'
import lucideLogo from '@/presentation/assets/logos/lucide.svg'
import eslintLogo from '@/presentation/assets/logos/eslint.svg'

export interface TechBadge {
  name: string
  version: string
  color: string
  logo: string
}

export interface TechCategory {
  label: string
  items: TechBadge[]
}

export const TECH_CATEGORIES: TechCategory[] = [
  {
    label: 'Core',
    items: [
      { name: 'React', version: '19.2', color: '#61DAFB', logo: reactLogo },
      { name: 'TypeScript', version: '6.0', color: '#3178C6', logo: typescriptLogo },
      { name: 'Vite', version: '8.0', color: '#646CFF', logo: viteLogo },
    ],
  },
  {
    label: 'Roteamento & Estado',
    items: [
      { name: 'TanStack Router', version: '1.16', color: '#FF4154', logo: tanstackLogo },
      { name: 'Zustand', version: '5.0', color: '#8B5E34', logo: zustandLogo },
    ],
  },
  {
    label: 'Formulários & Validação',
    items: [
      { name: 'React Hook Form', version: '7.76', color: '#EC5990', logo: reactHookFormLogo },
      { name: 'Zod', version: '4.4', color: '#3068B7', logo: zodLogo },
    ],
  },
  {
    label: 'UI & Estilo',
    items: [
      { name: 'Tailwind CSS', version: '4.2', color: '#38BDF8', logo: tailwindLogo },
      { name: 'Radix UI', version: '1.x', color: '#6E56CF', logo: radixLogo },
      { name: 'Lucide', version: '1.8', color: '#F97316', logo: lucideLogo },
    ],
  },
  {
    label: 'Dados & Visualização',
    items: [
      { name: 'Recharts', version: '3.8', color: '#22B5BF', logo: rechartsLogo },
      { name: 'date-fns', version: '4.1', color: '#EC4899', logo: dateFnsLogo },
    ],
  },
  {
    label: 'Exportação & Qualidade',
    items: [
      { name: 'jsPDF', version: '4.2', color: '#E5393B', logo: jsPdfLogo },
      { name: 'ESLint', version: '9.39', color: '#4B32C3', logo: eslintLogo },
    ],
  },
]
