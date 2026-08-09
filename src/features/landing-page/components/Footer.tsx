import { Heart } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import allerviaMarkWhite from '@/assets/allervia-mark-dark.png'
import allerviaMarkBlack from '@/assets/allervia-mark-light.png'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
import { useLandingTheme } from '@/features/landing-page/theme-context'
import { FOOTER_COLUMNS } from '@/features/landing-page/constants/footer-columns'

export function Footer() {
  const { theme } = useLandingTheme()
  const isLight = theme === 'light'
  const markSrc = isLight ? allerviaMarkBlack : allerviaMarkWhite
  return (
    <footer
      className="relative border-t"
      style={{
        borderColor: 'var(--ll-border)',
        color: 'var(--ll-ink)',
      }}
      >
      <span
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 'clamp(-272px, -13.6vw, -88px)',
          zIndex: 0,
          display: 'block',
          textAlign: 'center',
          fontSize: 'clamp(110px, 27vw, 520px)',
          fontWeight: 600,
          textTransform: 'lowercase',
          letterSpacing: '-0.005em',
          lineHeight: 0.8,
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          color: 'var(--ll-ink)',
          opacity: isLight ? 0.05 : 0.035,
        }}
      >
        allervia
      </span>

      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ zIndex: 1, background: 'var(--ll-bg-foot)' }}
      />

      <div className="relative z-[2] pt-14 pb-8 px-[5%]">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr] gap-8 sm:gap-12 mb-12">
        <div>
          <Link
            to="/"
            aria-label="Voltar para a página inicial"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="mb-4 flex w-fit items-center gap-2.5 no-underline"
          >
            <img src={markSrc} alt="" className="h-9 w-9 object-contain" />
            <AllerviaWordmark className="text-2xl" style={{ color: 'var(--ll-ink)' }} />
          </Link>
          <p className="text-[0.875rem] leading-[1.7] max-w-72" style={{ color: 'var(--ll-ink-muted)' }}>
            Plataforma completa para gestão de protocolos de imunoterapia alérgica. Feito para clínicas, por engenheiros de software.
          </p>
        </div>

        {FOOTER_COLUMNS.map((column) => (
          <div key={column.title}>
            <h4 className="text-[0.85rem] font-semibold mb-4 tracking-wide uppercase" style={{ color: 'var(--ll-ink)' }}>
              {column.title}
            </h4>
            <ul className="list-none flex flex-col gap-2.5">
              {column.links.map((link) => (
                <li key={link.label}>
                  {link.href ? (
                    <a
                      href={link.href}
                      className="text-[0.85rem] no-underline transition-all duration-200 hover:translate-x-0.5"
                      style={{ color: 'var(--ll-ink-muted)' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = 'var(--ll-ink-strong)'
                        e.currentTarget.style.textShadow = '0 0 12px var(--ll-halo-accent-strong)'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = 'var(--ll-ink-muted)'
                        e.currentTarget.style.textShadow = 'none'
                      }}
                    >
                      {link.label}
                    </a>
                  ) : (
                    <span
                      aria-disabled="true"
                      className="text-[0.85rem] cursor-default"
                      style={{ color: 'var(--ll-ink-tertiary)' }}
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

      <div
        className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t gap-3"
        style={{ borderColor: 'var(--ll-border)' }}
      >
        <p className="text-[0.8rem]" style={{ color: 'var(--ll-ink-muted)' }}>
          &copy; {new Date().getFullYear()} Allervia. Todos os direitos reservados.
        </p>
        <p className="text-[0.8rem] inline-flex items-center gap-1" style={{ color: 'var(--ll-ink-muted)' }}>
          Feito com <Heart size={13} className="fill-current" style={{ color: 'var(--ll-accent)' }} /> para a alergologia brasileira
        </p>
      </div>
      </div>

    </footer>
  )
}
