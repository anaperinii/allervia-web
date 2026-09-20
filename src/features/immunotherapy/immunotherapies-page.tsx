import {
  ImmunotherapiesFilterBar,
  type ModalityTab,
  type StatusFilter,
} from '@/features/immunotherapy/components/ImmunotherapiesFilterBar'
import { ImmunotherapiesTable } from '@/features/immunotherapy/components/ImmunotherapiesTable'
import { MODALITY_OPTIONS } from '@/features/immunotherapy/constants/modality-options'
import { legacyModalityToRoute } from '@/features/patient/adapters/clinical-presentation'
import { listImmunotherapies } from '@/shared/api/clinical.api'
import { readAutomation } from '@/shared/api/protocols.api'
import type { ImmunotherapyListItem } from '@/shared/api/contracts/clinical'
import { ApiError } from '@/shared/api/contracts/errors'
import { queryKeys } from '@/shared/api/query-keys'
import { useSession } from '@/shared/auth/useSession'
import { SegmentedControl, TablePagination } from '@/shared/components'
import { PageHeader, Pill, SHOWCASE } from '@/shared/components/showcase'
import { useHasPermission } from '@/shared/stores/useUserStore'
import { useQuery } from '@tanstack/react-query'
import { useNavigate } from '@tanstack/react-router'
import { useState } from 'react'

export function ImmunotherapiesPage() {
  const navigate = useNavigate()
  const { account } = useSession()
  const organizationId = account?.organization?.id ?? ''
  const canAddImmunotherapy = useHasPermission('add_immunotherapy')
  const canEvolve = useHasPermission('evolve_patient')

  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('IN_PROGRESS')
  const [modalityTab, setModalityTab] = useState<ModalityTab>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  // Filtros e paginação resolvidos no servidor; o escopo por médico responsável
  // é aplicado pela autorização, não por comparação de nome no cliente.
  const filters = {
    page: currentPage,
    pageSize: itemsPerPage,
    search: searchTerm.trim() || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
    route:
      modalityTab === 'all' ? undefined : legacyModalityToRoute(modalityTab),
  }

  const listQuery = useQuery({
    queryKey: queryKeys.immunotherapies(organizationId, filters),
    queryFn: ({ signal }) => listImmunotherapies(filters, signal),
    enabled: organizationId !== '',
  })

  // Estado de configuração da organização: sem versão padrão publicada, novas
  // prescrições ficam bloqueadas — a pendência aparece para todos, com o
  // responsável pela configuração indicado, sem impedir a consulta ao histórico.
  const automationQuery = useQuery({
    queryKey: queryKeys.automation(organizationId),
    queryFn: ({ signal }) => readAutomation(signal),
    enabled: organizationId !== '',
  })
  const configurationPending =
    automationQuery.data?.defaults !== undefined &&
    automationQuery.data.defaults.length === 0

  const items = listQuery.data?.items ?? []
  const total = listQuery.data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / itemsPerPage))

  const applyFilter = (apply: () => void) => {
    apply()
    setCurrentPage(1)
  }

  const handleSelect = (item: ImmunotherapyListItem) => {
    // Paciente e tratamento são identidades distintas: a URL carrega as duas.
    navigate({
      to: '/patient/$patientId',
      params: { patientId: item.patient.id },
      search: { therapy: item.id },
    })
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-visible">
      <PageHeader
        title="Imunoterapias Alérgicas"
        actions={
          <ImmunotherapiesFilterBar
            searchTerm={searchTerm}
            setSearchTerm={(value) => applyFilter(() => setSearchTerm(value))}
            statusFilter={statusFilter}
            setStatusFilter={(value) => applyFilter(() => setStatusFilter(value))}
          />
        }
      />

      <div className="mb-4 flex items-center justify-between gap-4">
        <SegmentedControl
          value={modalityTab}
          onChange={(value) => applyFilter(() => setModalityTab(value))}
          aria-label="Modalidade"
          options={MODALITY_OPTIONS.map((option) => ({
            value: option.value,
            label: option.label,
          }))}
        />

        <div className="flex items-center gap-2 shrink-0">
          {canAddImmunotherapy && (
            <Pill active onClick={() => navigate({ to: '/add-immunotherapy' })}>
              Adicionar Imunoterapia
            </Pill>
          )}
          {canEvolve && (
            <Pill active onClick={() => navigate({ to: '/patient-evolution' })}>
              Evoluir Paciente
            </Pill>
          )}
        </div>
      </div>

      {configurationPending && (
        <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-[0.7rem] text-amber-800">
          <span className="font-semibold">Configuração de protocolo pendente.</span>{' '}
          Novas prescrições dependem de uma versão publicada e padrão.{' '}
          <button
            type="button"
            onClick={() => navigate({ to: '/protocols' })}
            className="font-semibold underline cursor-pointer bg-transparent border-none text-amber-800"
          >
            Abrir catálogo de protocolos
          </button>
        </div>
      )}

      {listQuery.error && (
        <div
          role="alert"
          className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-[0.7rem] text-red-700"
        >
          {listQuery.error instanceof ApiError
            ? listQuery.error.message
            : 'Não foi possível carregar os tratamentos.'}
        </div>
      )}

      <div
        className="flex flex-1 flex-col min-h-0 overflow-hidden rounded-3xl"
        style={{ background: SHOWCASE.card, border: `1px solid ${SHOWCASE.line}` }}
      >
        <div className="flex-1 overflow-auto">
          {listQuery.isPending ? (
            <div className="py-12 text-center text-xs text-(--text-muted)">
              Carregando tratamentos…
            </div>
          ) : (
            <ImmunotherapiesTable items={items} onSelect={handleSelect} />
          )}
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={(size) => applyFilter(() => setItemsPerPage(size))}
        />
      </div>
    </div>
  )
}
