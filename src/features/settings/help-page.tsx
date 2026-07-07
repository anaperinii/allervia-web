import { useState } from 'react'
import { Book, ChevronDown, Mail, MessageCircle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { CardButton } from '@/features/settings/components/CardButton'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { CONTACT_SUPPORT_EMAIL } from '@/shared/constants/contact'
import { FAQS } from '@/features/settings/constants/faqs'

const quickLinks = [
  { icon: Book, label: 'Documentação', desc: 'Guias e tutoriais', color: '#6C9EA5' },
  { icon: MessageCircle, label: 'Chat de suporte', desc: 'Fale com a equipe', color: '#6366F1' },
  { icon: Mail, label: 'E-mail', desc: CONTACT_SUPPORT_EMAIL, color: '#F4845F' },
]

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <SettingsLayout subtitle="Ajuda">
      <div className="max-w-2xl mx-auto space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {quickLinks.map((item, index) => {
                const Icon = item.icon
                const g = index === 0
                  ? `${item.color}47 0%, ${item.color}29 25%, ${item.color}12 55%`
                  : `${item.color}2b 0%, ${item.color}17 25%, ${item.color}0a 55%`
                return (
                  <CardButton
                    key={item.label}
                    orientation="vertical"
                    icon={<Icon size={16} />}
                    iconColor={item.color}
                    title={item.label}
                    description={item.desc}
                    className="bg-white/55! backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]"
                    style={{
                      backgroundImage: `linear-gradient(105deg, ${g}, transparent 80%)`,
                    }}
                  />
                )
              })}
            </div>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden bg-white/55 backdrop-blur-xl shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
              <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
                <h2 className="text-xs font-bold text-(--text)">Perguntas frequentes</h2>
              </div>
              <div className="divide-y divide-(--border-custom)">
                {FAQS.map((faq, index) => {
                  const expanded = openFaq === index
                  const panelId = `faq-panel-${index}`
                  return (
                    <div key={faq.question}>
                      <button
                        type="button"
                        aria-expanded={expanded}
                        aria-controls={panelId}
                        onClick={() => setOpenFaq(expanded ? null : index)}
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-200/60 transition-colors cursor-pointer"
                      >
                        <span className="text-xs font-medium text-(--text) pr-4">{faq.question}</span>
                        <ChevronDown size={14} className={cn('text-(--text-muted) shrink-0 transition-transform', expanded && 'rotate-180')} />
                      </button>
                      <div
                        id={panelId}
                        role="region"
                        className={cn('overflow-hidden transition-all duration-300', expanded ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0')}
                      >
                        <div className="px-4 pb-3 text-xs text-(--text-muted) leading-relaxed">{faq.answer}</div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

        <div className="text-center text-[0.65rem] text-(--text-muted) py-2">
          Allervia v2.0.0-beta · Precisa de ajuda? Entre em contato pelo chat.
        </div>
      </div>
    </SettingsLayout>
  )
}
