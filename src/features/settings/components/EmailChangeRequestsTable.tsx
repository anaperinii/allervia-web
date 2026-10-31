import { Button } from '@/shared/components'
import type {
  EmailChangeRequestDto,
  EmailChangeStatus,
} from '@/shared/api/contracts/email-change'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelopeCircleCheck, faUserCheck, faXmark } from '@fortawesome/free-solid-svg-icons'

interface EmailChangeRequestsTableProps {
  requests: EmailChangeRequestDto[]
  onApprove: (request: EmailChangeRequestDto) => void
  onReject: (request: EmailChangeRequestDto) => void
}

const dateFormat = new Intl.DateTimeFormat('pt-BR')
const timeFormat = new Intl.DateTimeFormat('pt-BR', {
  hour: '2-digit',
  minute: '2-digit',
})
const dateTimeFormat = new Intl.DateTimeFormat('pt-BR', {
  dateStyle: 'short',
  timeStyle: 'short',
})

interface StatusDisplay {
  label: string
  dot: string
  text: string
}

const STATUS_DISPLAY: Record<EmailChangeStatus, StatusDisplay> = {
  PENDING: { label: 'Pendente', dot: 'bg-amber-500', text: 'text-amber-700' },
  DISPATCHED: { label: 'Aguardando confirmação', dot: 'bg-brand', text: 'text-brand' },
  CONFIRMED: { label: 'Concluído', dot: 'bg-emerald-500', text: 'text-emerald-700' },
  REJECTED: { label: 'Recusado', dot: 'bg-red-500', text: 'text-red-600' },
  SUPERSEDED: { label: 'Substituído', dot: 'bg-gray-400', text: 'text-(--text-muted)' },
  EXPIRED: { label: 'Expirado', dot: 'bg-gray-400', text: 'text-(--text-muted)' },
}

const FALLBACK_STATUS: StatusDisplay = {
  label: 'Encerrado',
  dot: 'bg-gray-400',
  text: 'text-(--text-muted)',
}

function isOpen(status: EmailChangeStatus): boolean {
  return status === 'PENDING' || status === 'DISPATCHED'
}

export function EmailChangeRequestsTable({
  requests,
  onApprove,
  onReject,
}: EmailChangeRequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-xs text-(--text-muted)">
        Nenhum pedido de troca de e-mail registrado.
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-(--border-custom) bg-[#F7F9F9]">
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Profissional</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">E-mail atual</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Novo e-mail</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Status</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Pedido em</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Prazo</th>
          <th className="text-right text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5 w-36">Ações</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => {
          const status = STATUS_DISPLAY[request.status] ?? FALLBACK_STATUS
          const open = isOpen(request.status)
          return (
          <tr
            key={request.id}
            className="border-b border-(--border-custom) last:border-0 hover:bg-gray-50/50 transition-colors"
          >
            <td className="px-5 py-3">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100 text-(--text-muted) shrink-0">
                  <FontAwesomeIcon icon={faEnvelopeCircleCheck} style={{ fontSize: 14 }} />
                </div>
                <div className="min-w-0 text-xs font-medium text-(--text) truncate">
                  {request.professionalName}
                </div>
              </div>
            </td>
            <td className="px-5 py-3 text-xs text-(--text-muted) break-all">
              {request.currentEmail}
            </td>
            <td className="px-5 py-3 text-xs font-medium text-(--text) break-all">
              {request.newEmail}
            </td>
            <td className="px-5 py-3">
              <span
                className={`inline-flex items-center gap-1.5 text-xs font-medium whitespace-nowrap ${status.text}`}
                title={
                  request.decidedAt
                    ? `Encerrado em ${dateTimeFormat.format(new Date(request.decidedAt))}`
                    : undefined
                }
              >
                <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${status.dot}`} />
                {status.label}
              </span>
            </td>
            <td className="px-5 py-3 text-xs text-(--text-muted) whitespace-nowrap">
              {dateFormat.format(new Date(request.requestedAt))}
              <span className="ml-1.5 text-(--text-muted)/70">
                {timeFormat.format(new Date(request.requestedAt))}
              </span>
            </td>
            <td className="px-5 py-3 text-xs text-(--text-muted)">
              {open ? dateFormat.format(new Date(request.expiresAt)) : '—'}
            </td>
            <td className="px-5 py-3">
              {request.status === 'PENDING' && (
                <div className="flex items-center justify-end gap-1">
                  <Button
                    tone="success"
                    variant="outline"
                    size="sm"
                    leftIcon={<FontAwesomeIcon icon={faUserCheck} style={{ fontSize: 11 }} />}
                    onClick={() => onApprove(request)}
                  >
                    Aprovar
                  </Button>
                  <Button
                    tone="danger"
                    variant="outline-white"
                    size="sm"
                    leftIcon={<FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />}
                    onClick={() => onReject(request)}
                  >
                    Recusar
                  </Button>
                </div>
              )}
            </td>
          </tr>
          )
        })}
      </tbody>
    </table>
  )
}
