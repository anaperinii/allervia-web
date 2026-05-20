export interface FooterLink {
  label: string
  href?: string
}

export interface FooterColumn {
  title: string
  links: FooterLink[]
}

export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: 'Produto',
    links: [
      { label: 'Funcionalidades', href: '#features' },
      { label: 'Preços', href: '#pricing' },
      { label: 'Changelog' },
      { label: 'Roadmap' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre nós', href: '#about' },
      { label: 'Blog' },
      { label: 'Carreiras' },
      { label: 'Contato' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacidade' },
      { label: 'Termos de uso' },
      { label: 'LGPD' },
      { label: 'Segurança' },
    ],
  },
]
