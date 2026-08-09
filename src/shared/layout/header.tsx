import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import allerviaMarkWhite from '@/assets/allervia-mark-dark.png'
import allerviaMarkBlack from '@/assets/allervia-mark-light.png'
import { AllerviaWordmark } from '@/shared/components/AllerviaWordmark'
import { ThemeSwitch } from '@/features/landing-page/components/ThemeSwitch'
import { useLandingTheme } from '@/features/landing-page/theme-context'
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
  const showNavLinks = !isAuthPage
  const showThemeSwitch = hasHero
  const [pastHero, setPastHero] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.scrollY > window.innerHeight - 80
  })
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setPastHero(window.scrollY > window.innerHeight - 80)
    }
    handleScroll()
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const { theme } = useLandingTheme()
  const bareBar = hasHero && !showNavLinks
  const heroPill = hasHero && showNavLinks
  const overHeroTop = heroPill && !pastHero
  const isLightBrand = !overHeroTop && theme === 'light'
  const onLightPlate = overHeroTop || isLightBrand
  const markSrc = onLightPlate ? allerviaMarkBlack : allerviaMarkWhite

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  const onDarkPlate = bareBar
  const linkColor = onDarkPlate ? 'rgba(255,255,255,0.72)' : overHeroTop ? 'rgba(14,46,52,0.62)' : 'var(--ll-ink-muted)'
  const linkHoverColor = onDarkPlate ? '#ffffff' : overHeroTop ? '#0E2E34' : 'var(--ll-ink)'
  const brandColor = onDarkPlate ? '#ffffff' : overHeroTop ? '#0E2E34' : 'var(--ll-ink)'
  const loginBorder = onDarkPlate
    ? '1.5px solid rgba(255,255,255,0.25)'
    : overHeroTop
      ? '1.5px solid rgba(14,46,52,0.22)'
      : '1.5px solid var(--ll-border-strong)'
  const loginBg = onDarkPlate ? 'rgba(255,255,255,0.04)' : 'transparent'
  const loginInk = onDarkPlate ? '#ffffff' : overHeroTop ? '#0E2E34' : 'var(--ll-ink-strong)'

  const ctaSolidBg = 'linear-gradient(to bottom right, var(--color-brand), var(--color-brand-dark))'
  const ctaSolidShadow = '0 2px 12px rgba(108,158,165,0.3)'
  const ctaSolidBorder = '1.5px solid transparent'

  return (
    <>
      <nav
        className={cn(
          'fixed z-100 flex items-center justify-between transition-all duration-900 ease-[cubic-bezier(0.22,1,0.36,1)]',
          heroPill
            ? 'left-0 right-0 mx-auto w-[min(1120px,92%)] h-14 px-6 rounded-2xl border backdrop-blur-md'
            : bareBar
              ? 'left-0 right-0 px-[5%] h-17'
              : 'left-0 right-0 px-[5%] h-17 border-b backdrop-blur-xl',
        )}
        style={{
          top: heroPill ? '22px' : 0,
          background: heroPill
            ? overHeroTop
              ? 'rgba(255,255,255,0.34)'
              : 'var(--ll-header-scroll-bg)'
            : bareBar
              ? 'transparent'
              : 'var(--ll-header-scroll-bg)',
          borderColor: heroPill
            ? overHeroTop
              ? 'rgba(14,46,52,0.10)'
              : 'var(--ll-border)'
            : bareBar
              ? 'transparent'
              : 'var(--ll-border)',
          boxShadow: heroPill ? '0 10px 28px rgba(14,46,52,0.10), inset 0 1px 0 rgba(255,255,255,0.55)' : undefined,
          animation: 'header-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) 0.15s both',
        }}
      >
        <Link
          to="/"
          className="relative flex items-center gap-2.5 no-underline"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <img src={markSrc} alt="" className="h-8 w-8 object-contain" />
          <AllerviaWordmark className="text-xl" style={{ color: brandColor }} />
        </Link>

        {showNavLinks && (
          <ul className="group/nav hidden md:flex gap-8 list-none absolute left-1/2 -translate-x-1/2">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm font-medium no-underline transition-all duration-300 group-hover/nav:blur-[1.5px] group-hover/nav:opacity-55 hover:blur-none! hover:opacity-100!"
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
            className="px-5 py-2 rounded-lg text-[0.8rem] font-medium cursor-pointer transition-all duration-200 no-underline hover:shadow-[0_6px_16px_var(--ll-halo-accent)]"
            style={{
              border: loginBorder,
              color: loginInk,
              background: loginBg,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = onDarkPlate
                ? 'rgba(255,255,255,0.10)'
                : 'var(--ll-accent-bg-soft)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = loginBg
            }}
          >
            Entrar
          </Link>
          <Link
            to="/trial"
            className="px-5 py-2 rounded-lg text-[0.8rem] font-semibold cursor-pointer no-underline text-white transition-[filter] duration-200 hover:brightness-95"
            style={{ background: ctaSolidBg, boxShadow: ctaSolidShadow, border: ctaSolidBorder }}
          >
            Começar agora
          </Link>
          {showThemeSwitch && (
            <ThemeSwitch overHero={onDarkPlate} scheme={overHeroTop ? 'dark' : 'auto'} />
          )}
        </div>

        <button
          className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl border transition-all duration-200"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Menu"
          style={{
            border: onDarkPlate ? '1px solid rgba(255,255,255,0.2)' : '1px solid var(--ll-border)',
            background: onDarkPlate ? 'rgba(255,255,255,0.06)' : 'var(--ll-surface)',
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
          {showNavLinks && navLinks.map((link) => (
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
            className={cn('flex flex-col gap-3', showNavLinks && 'mt-4 pt-4 border-t')}
            style={{ borderColor: 'var(--ll-border)' }}
          >
            <Link
              to="/login"
              className="text-center px-4 py-2.5 rounded-lg text-sm font-semibold no-underline"
              style={{
                border: '1.5px solid var(--ll-border-strong)',
                color: 'var(--ll-ink-strong)',
              }}
            >
              Entrar
            </Link>
            <Link
              to="/trial"
              className="text-center px-4 py-2.5 rounded-lg text-sm font-semibold no-underline text-white"
              style={{ background: ctaSolidBg, boxShadow: ctaSolidShadow, border: ctaSolidBorder }}
            >
              Começar agora
            </Link>
            {showThemeSwitch && (
              <div className="flex justify-center pt-2">
                <ThemeSwitch />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
