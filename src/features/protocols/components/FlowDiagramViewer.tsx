import { useMemo, useRef, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { Button, Modal } from '@/shared/components'
import { MODAL_HEADER_BACKGROUND } from '@/features/scheduling/constants/modal-header'
import { FlowDiagram } from '@/features/protocols/components/lab/FlowDiagram'
import { buildFlowGraph } from '@/features/protocols/lab/flow-graph'
import type { ProtocolStep } from '@/shared/api/contracts/protocols'

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFilePdf } from '@fortawesome/free-solid-svg-icons'

const NO_VERDICTS = new Map()

const PAGE_W_MM = 210
const PAGE_H_MM = 297
const MARGIN_MM = 10
const MM_TO_PX = 96 / 25.4
const PRINTABLE_W_PX = (PAGE_W_MM - MARGIN_MM * 2) * MM_TO_PX
const PRINTABLE_H_PX = (PAGE_H_MM - MARGIN_MM * 2) * MM_TO_PX

function noop() {}

interface FlowDiagramViewerProps {
  open: boolean
  onClose: () => void
  protocolName: string
  versionNumber: number
  steps: ProtocolStep[]
}

function exportPortraitPdf(contentRef: RefObject<HTMLDivElement | null>) {
  const content = contentRef.current
  if (content) {
    content.style.zoom = ''
    const rect = content.getBoundingClientRect()
    const scale = Math.min(PRINTABLE_W_PX / rect.width, PRINTABLE_H_PX / rect.height, 1) * 0.98
    content.style.zoom = String(scale)
  }
  document.body.classList.add('printing-flow-diagram')
  const cleanup = () => document.body.classList.remove('printing-flow-diagram')
  window.addEventListener('afterprint', cleanup, { once: true })
  requestAnimationFrame(() => {
    window.print()
  })
}

export function FlowDiagramViewer({
  open,
  onClose,
  protocolName,
  versionNumber,
  steps,
}: FlowDiagramViewerProps) {
  const graph = useMemo(() => buildFlowGraph(steps), [steps])
  const visited = useMemo(() => new Set(steps.map((step) => step.id)), [steps])
  const printContentRef = useRef<HTMLDivElement>(null)

  if (!open) return null

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="2xl"
      ariaLabel="Visualizar diagrama de fluxo"
      headerSlot={
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline gap-2">
            <span className="truncate text-[0.95rem] font-bold text-(--text)">
              {protocolName}
            </span>
            <span className="shrink-0 text-[0.82rem] font-medium text-(--text-muted)">
              v{versionNumber}
            </span>
          </div>
          <p className="mt-0.5 text-[0.72rem] text-(--text-muted)">
            Diagrama de fluxo da versão
          </p>
        </div>
      }
      headerStyle={{
        background: MODAL_HEADER_BACKGROUND,
        borderBottom: 'none',
        paddingTop: '1.4rem',
      }}
      headerAction={
        <Button
          variant="solid"
          size="sm"
          className="bg-[#12333a] text-white hover:bg-[#0e2a30]"
          leftIcon={<FontAwesomeIcon icon={faFilePdf} style={{ fontSize: 12 }} />}
          onClick={() => exportPortraitPdf(printContentRef)}
        >
          Exportar PDF
        </Button>
      }
    >
      <FlowDiagram
        chains={graph.chains}
        activeStepId={null}
        visited={visited}
        selectedStepId={null}
        verdicts={NO_VERDICTS}
        startDate=""
        timeZone=""
        showDates={false}
        onSelectStep={noop}
      />

      {createPortal(
        <div
          id="flow-diagram-print-root"
          style={{ position: 'fixed', top: 0, left: '-10000px' }}
        >
          <div ref={printContentRef} className="w-max">
            <FlowDiagram
              chains={graph.chains}
              activeStepId={null}
              visited={visited}
              selectedStepId={null}
              verdicts={NO_VERDICTS}
              startDate=""
              timeZone=""
              showDates={false}
              onSelectStep={noop}
            />
          </div>
        </div>,
        document.body,
      )}
    </Modal>
  )
}
