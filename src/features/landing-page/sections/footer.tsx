import { Heart } from 'lucide-react'
import { FOOTER_COLUMNS } from '@/features/landing-page/data/footer-columns'

export function Footer() {
  return (
    <footer className="pt-16 pb-10 px-[5%] border-t border-(--border-custom) bg-(--bg)">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 sm:gap-12 mb-12">
        <div>
          <div className="text-[1.1rem] font-extrabold gradient-text mb-3">ImuneCare</div>
          <p className="text-[0.875rem] text-(--text-muted) leading-[1.7] max-w-65">
            Plataforma completa para gestão de protocolos de imunoterapia alérgica. Feito para clínicas, por engenheiros de software.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h4 className="text-[0.85rem] font-bold mb-4">{column.title}</h4>
            <ul className="list-none flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a
                      href={link.href}
                      className="text-[0.85rem] text-(--text-muted) no-underline transition-colors duration-200 hover:text-teal-600"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="text-[0.85rem] text-(--text-muted)/60 cursor-default"
                    >
                      {link.label}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-(--border-custom) gap-3">
        <p className="text-[0.8rem] text-(--text-muted)">
          &copy; {new Date().getFullYear()} ImuneCare. Todos os direitos reservados.
        </p>
        <p className="text-[0.8rem] text-(--text-muted) inline-flex items-center gap-1">
          Feito com <Heart size={13} className="text-red-400 fill-red-400" /> para a alergologia brasileira
        </p>
      </div>
    </footer>
  )
}
