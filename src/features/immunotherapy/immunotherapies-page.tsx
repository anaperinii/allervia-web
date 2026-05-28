import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { TablePagination } from '@/shared/components'
import { useImmunotherapiesStore, type Immunotherapy } from '@/features/immunotherapy/stores/immunotherapies-store'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/custom-types-store'
import { usePatientStore } from '@/features/patient/stores/patient-store'
import { buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'
import { useDoctorFilter, useHasPermission } from '@/shared/identity/user-store'
import { ImmunotherapiesFilterBar } from '@/features/immunotherapy/components/immunotherapies-filter-bar'
import { ImmunotherapiesTable } from '@/features/immunotherapy/components/immunotherapies-table'

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
  const [showInactive, setShowInactive] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)

  const handleShowInactive = (value: boolean) => {
    setShowInactive(value)
    if (value) setShowCompleted(false)
  }

  const handleShowCompleted = (value: boolean) => {
    setShowCompleted(value)
    if (value) setShowInactive(false)
  }

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
      const matchStatus = showInactive ? item.status === 'inactive' : item.status === 'active'
      const matchCompleted = showCompleted ? item.completed === true : item.completed !== true
      return matchDoctor && matchSearch && matchType && matchInterval && matchStatus && matchCompleted
    })
  }, [immunotherapies, searchTerm, typeFilter, intervalFilter, showInactive, showCompleted, doctorFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, intervalFilter, showInactive, showCompleted, itemsPerPage])

  const handleSelect = (item: Immunotherapy) => {
    setSelectedPatient(buildPatientFromImmunotherapy(item))
    navigate({ to: '/patient/$patientId', params: { patientId: item.id } })
  }

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="mx-4 my-4 flex flex-1 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        <div className="border-b border-(--border-custom) px-5 py-4">
          <h1 className="mb-3.5 text-2xl font-bold text-(--text)">Imunoterapias</h1>
          <ImmunotherapiesFilterBar
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            typeFilter={typeFilter}
            setTypeFilter={setTypeFilter}
            intervalFilter={intervalFilter}
            setIntervalFilter={setIntervalFilter}
            showInactive={showInactive}
            setShowInactive={handleShowInactive}
            showCompleted={showCompleted}
            setShowCompleted={handleShowCompleted}
            types={types}
            intervals={intervals}
            canAddImmunotherapy={canAddImmunotherapy}
            canEvolve={canEvolve}
          />
        </div>

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
