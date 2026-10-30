import { Button } from '@/shared/components'
import type { EmailChangeRequestDto } from '@/shared/api/contracts/email-change'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEnvelopeCircleCheck, faUserCheck, faXmark } from '@fortawesome/free-solid-svg-icons'

interface EmailChangeRequestsTableProps {
  requests: EmailChangeRequestDto[]
  onApprove: (request: EmailChangeRequestDto) => void
  onReject: (request: EmailChangeRequestDto) => void
}

const dateFormat = new Intl.DateTimeFormat('pt-BR')

export function EmailChangeRequestsTable({
  requests,
  onApprove,
  onReject,
}: EmailChangeRequestsTableProps) {
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 text-xs text-(--text-muted)">
        Nenhum pedido de troca de e-mail pendente.
      </div>
    )
  }

  return (
    <table className="w-full">
      <thead>
        <tr className="border-b border-(--border-custom) bg-gray-50/80">
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Profissional</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">E-mail atual → novo</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Pedido em</th>
          <th className="text-left text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5">Prazo</th>
          <th className="text-right text-[0.72rem] font-semibold text-[#12333a] px-5 pt-4 pb-2.5 w-36">Ações</th>
        </tr>
      </thead>
      <tbody>
        {requests.map((request) => (
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
            <td className="px-5 py-3 text-xs text-(--text-muted)">
              {request.currentEmail} → {request.newEmail}
            </td>
            <td className="px-5 py-3 text-xs text-(--text-muted)">
              {dateFormat.format(new Date(request.requestedAt))}
            </td>
            <td className="px-5 py-3 text-xs text-(--text-muted)">
              {dateFormat.format(new Date(request.expiresAt))}
            </td>
            <td className="px-5 py-3">
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
                  variant="outline"
                  size="sm"
                  leftIcon={<FontAwesomeIcon icon={faXmark} style={{ fontSize: 11 }} />}
                  onClick={() => onReject(request)}
                >
                  Recusar
                </Button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
