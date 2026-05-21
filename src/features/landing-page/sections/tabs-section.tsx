import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import { Blob, Reveal } from '@/shared/components'
import { SectionHeader } from '@/features/landing-page/components/section-header'
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
    <section className="py-24 px-[5%] relative overflow-hidden">
      <Blob className="-top-28 -left-20 w-95 h-95 bg-teal-200/20" />
      <Blob className="-top-32 -right-20 w-100 h-100 bg-cyan-100/25" />
      <Blob className="top-1/2 left-1/3 w-75 h-75 bg-teal-100/20" />
      <Blob className="-bottom-32 -left-16 w-100 h-100 bg-linear-to-br from-teal-200/25 to-cyan-200/20" />
      <Blob className="-bottom-28 -right-20 w-95 h-95 bg-teal-100/25" />

      <Reveal className="mb-12 relative">
        <SectionHeader
          eyebrow="Aprofunde-se"
          title="Projetado para o fluxo clínico real"
          description="Cada funcionalidade reflete as necessidades reais de clínicas de imunoterapia alérgica."
          align="center"
          titleMaxWidth="max-w-150"
        />
      </Reveal>

      <div className="flex gap-2 justify-center flex-wrap mb-12">
        {PRODUCT_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleSelectTab(tab.id)}
            className={cn(
              'px-5 py-2 rounded-full border-[1.5px] font-semibold text-[0.875rem] cursor-pointer transition-all duration-200',
              activeTab === tab.id
                ? 'bg-linear-to-br from-brand to-teal-400 border-transparent text-white shadow-[0_4px_16px_rgba(20,184,166,0.3)]'
                : 'border-(--border-custom) bg-transparent text-(--text-muted) hover:border-teal-300 hover:text-teal-600',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-[4%] items-center">
        <Reveal>
          <h3 className="text-[1.4rem] font-extrabold mb-4">{active.title}</h3>
          <p className="text-[0.95rem] text-(--text-muted) leading-[1.7] mb-6">{active.description}</p>
          <span className="text-teal-600 font-semibold text-[0.9rem] cursor-default opacity-70">
            {active.linkLabel} →
          </span>
        </Reveal>
        <Reveal className="bg-gray-50/80 border border-(--border-custom) rounded-2xl p-3 relative overflow-hidden shadow-[0_8px_40px_rgba(0,70,40,0.08)]">
          <div className="flex items-center gap-1.5 mb-2 px-1">
            <div className="w-2 h-2 rounded-full bg-red-400" />
            <div className="w-2 h-2 rounded-full bg-amber-400" />
            <div className="w-2 h-2 rounded-full bg-emerald-400" />
            <div className="ml-2 flex-1 bg-white border border-(--border-custom) rounded-md h-4 flex items-center px-2">
              <span className="text-[0.5rem] text-(--text-muted) font-medium">
                imunecare.com.br/{active.urlSlug}
              </span>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-(--border-custom) shadow-[0_2px_12px_rgba(0,70,40,0.05)] overflow-hidden relative">
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
