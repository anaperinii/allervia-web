import { useState } from 'react'
import { cn } from '@/shared/lib/cn'
import { Reveal } from './Reveal'
import { SectionHeader } from '@/features/landing-page/components/SectionHeader'
import { PRODUCT_TABS, type TabId } from '@/features/landing-page/constants/tabs'

export function TabsSection() {
  const [activeTab, setActiveTab] = useState<TabId>('dashboard')
  const [visited, setVisited] = useState<Set<TabId>>(() => new Set(['dashboard']))

  const handleSelectTab = (id: TabId) => {
    setActiveTab(id)
    if (!visited.has(id)) {
      setVisited((prev) => new Set(prev).add(id))
    }
  }

  const active = PRODUCT_TABS.find((tab) => tab.id === activeTab) ?? PRODUCT_TABS[0]

  return (
    <section
      className="py-24 px-[5%] relative overflow-hidden"
      style={{ background: '#08191d' }}
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute"
        style={{
          top: '40%',
          left: '20%',
          width: '60vmax',
          height: '60vmax',
          background: 'radial-gradient(circle, rgba(155,193,196,0.08), transparent 62%)',
          transform: 'translate(-50%, -50%)',
          animation: 'av-drift-2 30s ease-in-out infinite',
        }}
      />

      <Reveal className="mb-14 relative">
        <SectionHeader
          eyebrow="Aprofunde-se"
          title="Projetado para o fluxo clínico real"
          description="Cada funcionalidade reflete as necessidades reais de clínicas de imunoterapia alérgica."
          align="center"
          titleMaxWidth="max-w-150"
        />
      </Reveal>

      <div className="relative flex gap-2 justify-center flex-wrap mb-14">
        {PRODUCT_TABS.map((tab) => {
          const isActive = activeTab === tab.id
          return (
            <button
              key={tab.id}
              onClick={() => handleSelectTab(tab.id)}
              className={cn(
                'px-5 py-2 rounded-full font-semibold text-[0.875rem] cursor-pointer transition-all duration-200 hover:-translate-y-px',
              )}
              style={
                isActive
                  ? {
                      background:
                        'linear-gradient(180deg, rgba(255,255,255,0.45), rgba(255,255,255,0.08) 44%, rgba(255,255,255,0) 56%), #6C9EA5',
                      color: '#06232a',
                      boxShadow: '0 4px 16px rgba(108,158,165,0.30), inset 0 1px 0 rgba(255,255,255,0.4)',
                      border: 'none',
                    }
                  : {
                      background: 'rgba(220,225,229,0.04)',
                      color: '#7FA6AC',
                      border: '1px solid rgba(220,225,229,0.13)',
                    }
              }
            >
              {tab.label}
            </button>
          )
        })}
      </div>

      <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-[4%] items-center">
        <Reveal>
          <h3 className="text-[1.6rem] font-light tracking-tight mb-4" style={{ color: '#DCE1E5' }}>
            {active.title}
          </h3>
          <p className="text-[0.95rem] leading-[1.7] mb-6" style={{ color: '#7FA6AC' }}>
            {active.description}
          </p>
          <span className="font-semibold text-[0.9rem] cursor-default" style={{ color: '#9BC1C4' }}>
            {active.linkLabel} →
          </span>
        </Reveal>
        <Reveal
          className="rounded-2xl p-3 relative overflow-hidden"
          style={{
            background:
              'linear-gradient(160deg, rgba(220,225,229,0.05), rgba(220,225,229,0.018))',
            border: '1px solid rgba(220,225,229,0.13)',
            boxShadow: '0 30px 80px -30px rgba(0,0,0,0.7)',
          }}
        >
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <div className="w-2 h-2 rounded-full bg-red-400/80" />
            <div className="w-2 h-2 rounded-full bg-amber-400/80" />
            <div className="w-2 h-2 rounded-full bg-emerald-400/80" />
            <div
              className="ml-2 flex-1 rounded-md h-4 flex items-center px-2"
              style={{
                background: 'rgba(8,25,29,0.6)',
                border: '1px solid rgba(220,225,229,0.10)',
              }}
            >
              <span className="text-[0.5rem] font-medium" style={{ color: '#7FA6AC' }}>
                allervia.com.br/{active.urlSlug}
              </span>
            </div>
          </div>
          <div
            className="rounded-xl overflow-hidden relative"
            style={{
              background: 'rgba(8,25,29,0.4)',
              border: '1px solid rgba(220,225,229,0.10)',
            }}
          >
            {PRODUCT_TABS.filter((tab) => visited.has(tab.id)).map((tab, index) => (
              <img
                key={tab.id}
                src={tab.image}
                alt={tab.label}
                loading="lazy"
                decoding="async"
                className={cn(
                  'w-full block transition-opacity duration-500 ease-out',
                  index === 0 ? 'relative' : 'absolute inset-0',
                  activeTab === tab.id ? 'opacity-100' : 'opacity-0 pointer-events-none',
                )}
              />
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  )
}
