import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cn } from '@/shared/lib/cn'
import { CardButton } from '@/features/settings/components/CardButton'
import { SettingsLayout } from '@/features/settings/components/SettingsLayout'
import { CONTACT_SUPPORT_EMAIL } from '@/shared/constants/contact'
import { FAQS } from '@/features/settings/constants/faqs'
import {
  createSupportRequest,
  listSupportRequests,
} from '@/shared/api/notifications.api'
import { ApiError } from '@/shared/api/contracts/errors'
import { Button, FieldLabel, TextArea, TextInput } from '@/shared/components'
import { formatInstantDate } from '@/features/patient/adapters/clinical-presentation'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBook, faChevronDown, faEnvelope } from '@fortawesome/free-solid-svg-icons'

const quickLinks = [
  { icon: faBook, label: 'Documentação', desc: 'Guias e tutoriais', color: '#6C9EA5' },
  { icon: faEnvelope, label: 'E-mail', desc: CONTACT_SUPPORT_EMAIL, color: '#F4845F' },
]

const STATUS_LABELS = { RECEIVED: 'Recebida', HANDLED: 'Atendida' } as const

function SupportRequestSection() {
  const queryClient = useQueryClient()
  const [subject, setSubject] = useState('')
  const [message, setMessage] = useState('')
  const [failure, setFailure] = useState<string | null>(null)

  const listQuery = useQuery({
    queryKey: ['support-requests'],
    queryFn: ({ signal }) => listSupportRequests(signal),
  })
  const mutation = useMutation({
    mutationFn: () =>
      createSupportRequest({ subject: subject.trim(), message: message.trim() }),
    onSuccess: async () => {
      setSubject('')
      setMessage('')
      await queryClient.invalidateQueries({ queryKey: ['support-requests'] })
    },
    onError: (error) => {
      setFailure(
        error instanceof ApiError ? error.message : 'Não foi possível enviar a solicitação.',
      )
    },
  })

  return (
    <section className="lg:col-span-2 border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
      <div className="px-4 py-3 border-b border-(--border-custom) bg-gray-50/50">
        <h2 className="text-xs font-bold text-(--text)">Solicitação de suporte</h2>
        <p className="text-[0.62rem] text-(--text-muted) mt-0.5">
          Cada solicitação é persistida com confirmação de recebimento; suas
          solicitações anteriores aparecem abaixo.
        </p>
      </div>
      <div className="p-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="space-y-3">
          <FieldLabel label="Assunto" required>
            <TextInput
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Ex: dúvida sobre a agenda"
            />
          </FieldLabel>
          <FieldLabel label="Mensagem" required>
            <TextArea
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Descreva a dúvida ou o problema"
            />
          </FieldLabel>
          {failure && <p role="alert" className="text-[0.7rem] text-red-700">{failure}</p>}
          <Button
            tone="brand"
            variant="solid"
            disabled={!subject.trim() || !message.trim() || mutation.isPending}
            onClick={() => { setFailure(null); mutation.mutate() }}
          >
            Enviar solicitação
          </Button>
        </div>
        <div className="space-y-2">
          <div className="text-[0.7rem] font-semibold text-(--text-muted)">Minhas solicitações</div>
          {listQuery.isPending && <p className="text-[0.65rem] text-(--text-muted)">Carregando…</p>}
          {(listQuery.data ?? []).length === 0 && !listQuery.isPending && (
            <p className="text-[0.65rem] text-(--text-muted)">Nenhuma solicitação registrada.</p>
          )}
          <div className="max-h-56 overflow-y-auto space-y-1.5 pr-1">
            {(listQuery.data ?? []).map((request) => (
              <div key={request.id} className="rounded-lg border border-(--border-custom) bg-white px-3 py-2">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[0.7rem] font-bold text-(--text) truncate">{request.subject}</span>
                  <span className="text-[0.58rem] font-semibold text-brand bg-brand/10 border border-brand/20 px-2 py-0.5 rounded-full shrink-0">
                    {STATUS_LABELS[request.status]}
                  </span>
                </div>
                <div className="text-[0.6rem] text-(--text-muted)">{formatInstantDate(request.createdAt)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  return (
    <SettingsLayout subtitle="Ajuda">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            <div className="lg:col-span-2 grid grid-cols-2 gap-3">
              {quickLinks.map((item) => {
                const Icon = item.icon
                return (
                  <CardButton
                    key={item.label}
                    orientation="vertical"
                    icon={<FontAwesomeIcon icon={Icon} style={{ fontSize: 16 }} />}
                    iconColor={item.color}
                    title={item.label}
                    description={item.desc}
                    className="bg-white!"
                  />
                )
              })}
            </div>

            <section className="lg:col-span-2 border border-(--border-custom) rounded-3xl overflow-hidden bg-[#F6F8F8]">
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
                        <FontAwesomeIcon icon={faChevronDown} className={cn('text-(--text-muted) shrink-0 transition-transform', expanded && 'rotate-180')} style={{ fontSize: 14 }} />
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

        <SupportRequestSection />

        <div className="lg:col-span-2 text-center text-[0.65rem] text-(--text-muted) py-2">
          Allervia · Precisa de ajuda? Envie uma solicitação de suporte acima.
        </div>
      </div>
    </SettingsLayout>
  )
}
