import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { CheckCircle } from 'lucide-react'
import { TablePagination, Toast } from '@/shared/components'
import { useImmunotherapiesStore, useImmunotherapyLookup, type Immunotherapy } from '@/features/immunotherapy/stores/immunotherapies-store'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/custom-types-store'
import { usePatientStore } from '@/features/patient/stores/patient-store'
import { buildPatientFromImmunotherapy } from '@/features/patient/constants/patient-profiles'
import { useDoctorFilter, useHasPermission } from '@/shared/identity/user-store'
import { ImmunotherapiesFilterBar } from '@/features/immunotherapy/components/immunotherapies-filter-bar'
import { ImmunotherapiesTable } from '@/features/immunotherapy/components/immunotherapies-table'

export function ImmunotherapiesPage() {
  const navigate = useNavigate()
  const { success, patientId } = useSearch({ from: '/immunotherapies' })
  const { getFullName } = useImmunotherapyLookup()
  const successPatientName = patientId ? getFullName(patientId) : ''
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (success) {
      setShowToast(true)
      navigate({ to: '/immunotherapies', search: {}, replace: true })
    }
  }, [success, navigate])

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
      const matchStatus = showInactive ? item.status === 'inactive' : item.status === 'active'
      return matchDoctor && matchSearch && matchType && matchInterval && matchStatus
    })
  }, [immunotherapies, searchTerm, typeFilter, intervalFilter, showInactive, doctorFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, intervalFilter, showInactive, itemsPerPage])

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
            setShowInactive={setShowInactive}
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

      <Toast
        open={showToast}
        onClose={() => setShowToast(false)}
        autoDismissMs={8000}
        variant="success"
        icon={<CheckCircle size={16} />}
        title="Registro salvo com sucesso!"
        description={
          <>
            Os dados de {successPatientName || 'paciente'} foram registrados e a próxima dose já está agendada.
            {patientId && (
              <Link
                to="/patient/$patientId"
                params={{ patientId }}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 mt-2 transition-colors"
              >
                Acessar prontuário do paciente &rarr;
              </Link>
            )}
          </>
        }
      />
    </div>
  )
}
