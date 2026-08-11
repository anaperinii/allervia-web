import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { TablePagination } from '@/shared/components'
import { useImmunotherapiesStore, type Immunotherapy } from '@/features/immunotherapy/stores/useImmunotherapiesStore'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/useCustomTypesStore'
import { usePatientStore } from '@/features/patient/stores/usePatientStore'
import { buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'
import { useDoctorFilter, useHasPermission } from '@/shared/stores/useUserStore'
import { ImmunotherapiesFilterBar } from '@/features/immunotherapy/components/ImmunotherapiesFilterBar'
import { ImmunotherapiesTable } from '@/features/immunotherapy/components/ImmunotherapiesTable'
import { cn } from '@/shared/lib/cn'

type ModalityTab = 'all' | 'subcutaneous' | 'sublingual'

const MODALITY_TABS: { value: ModalityTab; label: string }[] = [
  { value: 'all', label: 'Todas' },
  { value: 'subcutaneous', label: 'Subcutânea' },
  { value: 'sublingual', label: 'Sublingual' },
]

export function ImmunotherapiesPage() {
  const navigate = useNavigate()
  const immunotherapies = useImmunotherapiesStore((s) => s.immunotherapies)
  const customTypes = useCustomTypesStore((s) => s.types)
  const setSelectedPatient = usePatientStore((s) => s.setSelectedPatient)
  const canAddImmunotherapy = useHasPermission('add_immunotherapy')
  const canEvolve = useHasPermission('evolve_patient')
  const doctorFilter = useDoctorFilter()

  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('Todos os tipos')
  const [intervalFilter, setIntervalFilter] = useState('Todos os intervalos')
  const [statusFilter, setStatusFilter] = useState('active')
  const [modalityTab, setModalityTab] = useState<ModalityTab>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const types = useMemo(
    () => customTypes.map((t) => t.label),
    [customTypes],
  )

  const intervals = useMemo(
    () => Array.from(new Set(immunotherapies.map((i) => i.cycleInterval.days.toString())))
      .sort((a, b) => Number(a) - Number(b)),
    [immunotherapies],
  )

  const filtered = useMemo(() => {
    return immunotherapies.filter((item) => {
      const matchDoctor = !doctorFilter || item.responsibleDoctor === doctorFilter
      const matchSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchType = typeFilter === 'Todos os tipos' || item.type === typeFilter
      const matchInterval = intervalFilter === 'Todos os intervalos' || item.cycleInterval.days.toString() === intervalFilter
      const matchStatus = statusFilter === 'all' || item.status === statusFilter
      const matchModality = modalityTab === 'all' || item.modality === modalityTab
      return matchDoctor && matchSearch && matchType && matchInterval && matchStatus && matchModality
    })
  }, [immunotherapies, searchTerm, typeFilter, intervalFilter, statusFilter, doctorFilter, modalityTab])

  const modalityCounts = useMemo(() => {
    const base = immunotherapies.filter((i) => !doctorFilter || i.responsibleDoctor === doctorFilter)
    return {
      all: base.length,
      subcutaneous: base.filter((i) => i.modality === 'subcutaneous').length,
      sublingual: base.filter((i) => i.modality === 'sublingual').length,
    } as Record<ModalityTab, number>
  }, [immunotherapies, doctorFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, intervalFilter, statusFilter, itemsPerPage, modalityTab])

  const handleSelect = (item: Immunotherapy) => {
    setSelectedPatient(buildPatientFromImmunotherapy(item))
    navigate({ to: '/patient/$patientId', params: { patientId: item.id } })
  }

  return (
    <div className="flex flex-1 flex-col min-h-0 overflow-visible">
      <div className="mb-6">
        <div className="mb-8 flex items-center gap-3">
          <h1 className="text-3xl font-medium text-(--text)">Imunoterapias Alérgicas</h1>
        </div>
        <ImmunotherapiesFilterBar
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          typeFilter={typeFilter}
          setTypeFilter={setTypeFilter}
          intervalFilter={intervalFilter}
          setIntervalFilter={setIntervalFilter}
          statusFilter={statusFilter}
          setStatusFilter={setStatusFilter}
          types={types}
          intervals={intervals}
          canAddImmunotherapy={canAddImmunotherapy}
          canEvolve={canEvolve}
        />
      </div>

      <div className="flex items-end gap-1">
        {MODALITY_TABS.map((tab, idx) => {
          const isActive = modalityTab === tab.value
          const isFirst = idx === 0
          return (
            <button
              key={tab.value}
              type="button"
              onClick={() => setModalityTab(tab.value)}
              className={cn(
                'relative px-5 py-2 text-xs font-semibold transition-colors rounded-t-xl',
                isActive
                  ? 'bg-gray-50/80 text-slate-800 z-10'
                  : 'bg-white/55 text-slate-400 hover:bg-white/75 hover:text-slate-600',
              )}
            >
              {isActive && (
                <>
                  {!isFirst && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute -left-3 bottom-0 h-3 w-3"
                      style={{
                        background:
                          'radial-gradient(circle at 0% 0%, transparent 11.5px, rgba(249,250,251,0.8) 12.5px)',
                      }}
                    />
                  )}
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -right-3 bottom-0 h-3 w-3"
                    style={{
                      background:
                        'radial-gradient(circle at 100% 0%, transparent 11.5px, rgba(249,250,251,0.8) 12.5px)',
                    }}
                  />
                </>
              )}
              {tab.label} <span className="text-[0.65rem] font-normal opacity-60">({modalityCounts[tab.value]})</span>
            </button>
          )
        })}
      </div>

      <div className="flex flex-1 flex-col min-h-0 overflow-hidden rounded-tr-2xl rounded-b-2xl bg-white/25 backdrop-blur-xl border border-white/50 shadow-[0_22px_55px_-14px_rgba(16,50,60,0.28)]">
        <div className="flex-1 overflow-auto">
          <ImmunotherapiesTable items={paginated} onSelect={handleSelect} />
        </div>

        <TablePagination
          currentPage={currentPage}
          totalPages={totalPages}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  )
}
