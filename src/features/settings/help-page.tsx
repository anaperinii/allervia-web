import { useState } from 'react'
import { ArrowLeft, Book, ChevronDown, Mail, MessageCircle } from 'lucide-react'
import { cn } from '@/shared/lib/cn'
import { IconButton } from '@/shared/components'
import { CardButton } from '@/features/settings/components/CardButton'
import { CONTACT_SUPPORT_EMAIL } from '@/shared/constants/contact'
import { FAQS } from '@/features/settings/constants/faqs'

const quickLinks = [
  { icon: Book, label: 'Documentação', desc: 'Guias e tutoriais', color: '#18C1CB' },
  { icon: MessageCircle, label: 'Chat de suporte', desc: 'Fale com a equipe', color: '#6366F1' },
  { icon: Mail, label: 'E-mail', desc: CONTACT_SUPPORT_EMAIL, color: '#F4845F' },
]

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="flex flex-1 min-h-0 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden m-4">
        <div className="border-b border-(--border-custom) px-5 py-4 flex items-center gap-3">
          <IconButton aria-label="Voltar" to="/settings"><ArrowLeft size={16} /></IconButton>
          <h1 className="text-2xl font-bold text-(--text)">Ajuda</h1>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          <div className="max-w-2xl mx-auto space-y-5">
            <div className="grid grid-cols-3 gap-3">
              {quickLinks.map((item) => {
                const Icon = item.icon
                return (
                  <CardButton
                    key={item.label}
                    orientation="vertical"
                    icon={<Icon size={16} />}
                    iconColor={item.color}
                    title={item.label}
                    description={item.desc}
                  />
                )
              })}
            </div>

            <section className="border border-(--border-custom) rounded-xl overflow-hidden">
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
                        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50/50 transition-colors cursor-pointer"
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
              ImuneCare v2.0.0-beta · Precisa de ajuda? Entre em contato pelo chat.
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
