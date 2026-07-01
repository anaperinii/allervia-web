import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { AllerviaLogo } from '@/features/landing-page/components/AllerviaLogo'
import { ThemeSwitch } from '@/features/landing-page/components/ThemeSwitch'
import { cn } from '@/shared/lib/cn'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Sobre', href: '#about' },
  { label: 'Preços', href: '#pricing' },
  { label: 'Depoimentos', href: '#testimonials' },
]

interface HeaderProps {
  isAuthPage?: boolean
  hasHero?: boolean
}

export function Header({ isAuthPage = false, hasHero = false }: HeaderProps) {
  const [scrolled, setScrolled] = useState(false)
  const [pastHero, setPastHero] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.scrollY > window.innerHeight - 80
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
      setPastHero(window.scrollY > window.innerHeight - 80)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isTransparent = (hasHero && !pastHero) || isAuthPage
  const showShadow = !isTransparent && scrolled

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const linkColor = isTransparent ? 'rgba(255,255,255,0.7)' : 'var(--ll-ink-muted)'
  const linkHoverColor = isTransparent ? '#ffffff' : 'var(--ll-ink)'
  const brandColor = isTransparent ? '#ffffff' : 'var(--ll-ink)'
  const logoColor = isTransparent ? '#ffffff' : 'var(--ll-accent-strong)'
  const loginBorder = isTransparent ? '1.5px solid rgba(255,255,255,0.25)' : '1.5px solid var(--ll-border-strong)'
  const loginBg = isTransparent ? 'rgba(255,255,255,0.04)' : 'transparent'

  const ctaBgGradient = 'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%)'
  const ctaBaseColor = isTransparent ? '#6C9EA5' : 'var(--ll-accent)'
  const ctaInkColor = isTransparent ? '#06232a' : 'var(--ll-accent-ink)'
  const ctaHaloColor = isTransparent ? 'rgba(108,158,165,0.30)' : 'var(--ll-halo-accent-strong)'

  return (
    <>
      <nav
        className={cn(
          'fixed left-0 right-0 z-100 flex items-center justify-between px-[5%] h-17 transition-all duration-500 ease-out border-b',
          isTransparent ? '' : 'backdrop-blur-xl',
        )}
        style={{
          top: hasHero && !pastHero ? 'var(--ll-hero-frame-pad, 0px)' : 0,
          background: isTransparent ? 'transparent' : 'var(--ll-header-scroll-bg)',
          borderColor: showShadow ? 'var(--ll-border)' : 'transparent',
          animation: 'header-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
        }}
      >
        <Link
          to="/"
          className="relative flex items-center gap-2.5 no-underline"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <AllerviaLogo size={28} color={logoColor} />
          <span className="relative text-xl font-semibold tracking-[2px]" style={{ color: brandColor }}>
            ALLERVIA
          </span>
        </Link>

        {!isAuthPage && (
          <ul className="hidden md:flex gap-8 list-none absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium no-underline transition-colors duration-200"
                  style={{ color: linkColor }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = linkHoverColor }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = linkColor }}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        )}

        <div className="hidden md:flex gap-2.5 items-center">
          <Link
            to="/login"
            className="px-5 py-1.5 rounded-full text-[0.8rem] font-medium cursor-pointer transition-all duration-200 no-underline"
            style={{
              border: loginBorder,
              color: brandColor,
              background: loginBg,
            }}
          >
            Log in
          </Link>
          <Link
            to="/trial"
            className="px-5 py-1.5 rounded-full text-[0.8rem] font-semibold cursor-pointer no-underline hover:-translate-y-px"
            style={{
              background: `${ctaBgGradient}, ${ctaBaseColor}`,
              color: ctaInkColor,
              boxShadow: `0 6px 18px ${ctaHaloColor}, inset 0 1px 0 rgba(255,255,255,0.4)`,
              transition: 'background 0.5s ease, color 0.5s ease, box-shadow 0.5s ease, transform 0.2s ease',
            }}
          >
            Começar agora
          </Link>
          {hasHero && <ThemeSwitch overHero={isTransparent} />}
        </div>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          style={{
            border: isTransparent ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--ll-border)',
            background: isTransparent ? 'rgba(255,255,255,0.06)' : 'var(--ll-surface)',
            color: brandColor,
          }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <div
        className={cn(
          'fixed inset-0 z-99 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        style={{ background: 'rgba(0,0,0,0.5)' }}
        onClick={() => setMobileMenuOpen(false)}
      />

      <div
        className={cn(
          'fixed top-17 left-0 right-0 z-99 backdrop-blur-xl border-b transition-all duration-300 md:hidden',
          mobileMenuOpen ? 'translate-y-0 opacity-100' : '-translate-y-4 opacity-0 pointer-events-none',
        )}
        style={{
          background: 'var(--ll-header-scroll-bg)',
          borderColor: 'var(--ll-border)',
        }}
      >
        <div className="flex flex-col p-6 gap-2">
          {!isAuthPage && navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setMobileMenuOpen(false)}
              className="text-base font-medium no-underline py-3 px-4 rounded-xl transition-all duration-200"
              style={{ color: 'var(--ll-ink-muted)' }}
            >
              {link.label}
            </a>
          ))}
          <div
            className={cn('flex flex-col gap-3', !isAuthPage && 'mt-4 pt-4 border-t')}
            style={{ borderColor: 'var(--ll-border)' }}
          >
            <Link
              to="/login"
              className="text-center px-4 py-2.5 rounded-full text-sm font-semibold no-underline"
              style={{
                border: '1.5px solid var(--ll-border-strong)',
                color: 'var(--ll-ink)',
              }}
            >
              Log in
            </Link>
            <Link
              to="/trial"
              className="text-center px-4 py-2.5 rounded-full text-sm font-semibold no-underline"
              style={{
                background: `${ctaBgGradient}, ${ctaBaseColor}`,
                color: ctaInkColor,
                boxShadow: `0 6px 18px ${ctaHaloColor}`,
                transition: 'background 0.5s ease, color 0.5s ease, box-shadow 0.5s ease',
              }}
            >
              Começar agora
            </Link>
            {hasHero && (
              <div className="flex justify-center pt-2">
                <ThemeSwitch overHero={isTransparent} />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
