import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { cn } from '@/shared/lib/cn'
import { CardSwap, Card } from '@/shared/components/CardSwap'
import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { useLandingTheme } from '@/features/landing-page/theme-context'
import { PRODUCT_TABS, type TabId } from '@/features/landing-page/constants/tabs'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faChevronRight } from '@fortawesome/free-solid-svg-icons'

export function TabsSection() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')

  const handleSelectTab = (id: TabId) => {
    if (id === activeTab) return
    setActiveTab(id)
  }

  const activeIndex = PRODUCT_TABS.findIndex((t) => t.id === activeTab)
  const { theme } = useLandingTheme()
  const darkTheme = theme === 'dark'
  const panelBorder = darkTheme ? 'rgba(224,240,238,0.1)' : 'rgba(18,51,58,0.16)'
  const panelBg = darkTheme ? '#101617' : '#eef2f3'
  const panelTabBorder = darkTheme ? 'rgba(224,240,238,0.07)' : 'rgba(18,51,58,0.1)'
  const tabActiveColor = darkTheme ? '#f2f6f6' : '#12333a'
  const tabIdleColor = darkTheme ? '#5e7376' : '#8299a0'

  return (
    <section
      className="py-24 px-[5%] relative overflow-hidden"
      style={{ background: 'var(--ll-bg)' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '40%',
          left: '20%',
          width: '60vmax',
          height: '60vmax',
          background: 'radial-gradient(circle, var(--ll-halo-soft), transparent 62%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-2 30s ease-in-out infinite',
        }}
      />

      <Reveal className="mb-16 relative">
        <SectionHeader
          eyebrow="Aprofunde-se"
          title="Projetado para o fluxo clínico real"
          description="Cada funcionalidade reflete as necessidades reais de clínicas de imunoterapia alérgica."
          align="center"
          titleMaxWidth="max-w-4xl"
        />
      </Reveal>

      <div className="relative grid grid-cols-1 lg:grid-cols-[0.95fr_1.05fr] gap-10 lg:gap-14 items-center">
        {/* Left — numbered step list */}
        <Reveal className="relative lg:max-w-lg lg:justify-self-end">
          <div
            aria-hidden="true"
            className="absolute left-4.25 top-6 bottom-6 w-px"
            style={{ background: 'var(--ll-border)' }}
          />
          <ul className="relative flex flex-col gap-1 list-none">
            {PRODUCT_TABS.map((tab) => {
              const isActive = tab.id === activeTab
              return (
                <li key={tab.id} className="flex items-start gap-4">
                  <button
                    onClick={() => handleSelectTab(tab.id)}
                    aria-label={tab.title}
                    className="relative z-10 mt-3.5 shrink-0 flex h-9 w-9 items-center justify-center cursor-pointer"
                  >
                    <span
                      className="rounded-full transition-all duration-300"
                      style={
                        isActive
                          ? {
                              height: '20px',
                              width: '20px',
                              background:
                                'linear-gradient(to bottom right, var(--color-brand), var(--color-brand-dark))',
                              boxShadow: '0 2px 12px rgba(108,158,165,0.3)',
                            }
                          : {
                              height: '11px',
                              width: '11px',
                              background:
                                'linear-gradient(var(--ll-surface), var(--ll-surface)), var(--ll-bg)',
                              border: '1px solid var(--ll-border)',
                            }
                      }
                    />
                  </button>
                  <div className="flex-1 py-3.5">
                    <button
                      onClick={() => handleSelectTab(tab.id)}
                      className="block text-left cursor-pointer"
                    >
                      <h4
                        className="text-[1.05rem] tracking-tight transition-colors duration-300"
                        style={{
                          color: isActive ? 'var(--ll-ink)' : 'var(--ll-ink-muted)',
                          fontWeight: isActive ? 600 : 500,
                        }}
                      >
                        {tab.title}
                      </h4>
                    </button>
                    <div
                      className="grid transition-all duration-400 ease-out"
                      style={{
                        gridTemplateRows: isActive ? '1fr' : '0fr',
                        opacity: isActive ? 1 : 0,
                      }}
                    >
                      <div className="overflow-hidden">
                        <p
                          className="text-[0.9rem] leading-[1.65] mt-2"
                          style={{ color: 'var(--ll-ink-muted)' }}
                        >
                          {tab.description}
                        </p>
                        <Link
                          to="/trial"
                          tabIndex={isActive ? 0 : -1}
                          className={cn(
                            'group mt-3 inline-flex items-center gap-1.5 font-semibold text-[0.875rem] no-underline cursor-pointer transition-colors duration-200 hover:underline underline-offset-4 decoration-2',
                            !isActive && 'pointer-events-none',
                          )}
                          style={{ color: 'var(--ll-accent-strong)' }}
                          onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--ll-ink)' }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--ll-accent-strong)' }}
                        >
                          {tab.linkLabel}
                          <FontAwesomeIcon
                            icon={faChevronRight}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                            style={{ fontSize: 15 }}
                          />
                        </Link>
                      </div>
                    </div>
                  </div>
                </li>
              )
            })}
          </ul>
        </Reveal>

        <Reveal className="relative min-w-0 flex justify-center lg:justify-end lg:pl-10 lg:-mr-[8vw] lg:mt-16 lg:-mb-28">
          <CardSwap
            width="min(100%, 44rem)"
            height="clamp(18rem, 30vw, 28rem)"
            cardDistance={54}
            verticalDistance={62}
            skewAmount={5}
            active={activeIndex}
            onCardClick={(idx) => handleSelectTab(PRODUCT_TABS[idx].id)}
            className="mx-auto lg:mx-0"
          >
            {PRODUCT_TABS.map((tab) => (
              <Card
                key={tab.id}
                className="cursor-pointer flex flex-col"
                style={{
                  background: panelBg,
                  border: `1px solid ${panelBorder}`,
                }}
              >
                <div
                  className="flex items-center h-10 shrink-0 px-4"
                  style={{ borderBottom: `1px solid ${panelTabBorder}` }}
                >
                  <span
                    className="text-[0.78rem] font-semibold"
                    style={{ color: tab.id === activeTab ? tabActiveColor : tabIdleColor }}
                  >
                    {tab.label}
                  </span>
                </div>
                <img
                  src={tab.image}
                  alt={tab.label}
                  loading="lazy"
                  decoding="async"
                  className="flex-1 min-h-0 w-full object-cover object-top"
                />
              </Card>
            ))}
          </CardSwap>
        </Reveal>
      </div>
    </section>
  )
}
