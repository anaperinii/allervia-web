import { useMemo, useState, useEffect } from 'react'
import { useNavigate, useSearch, Link } from '@tanstack/react-router'
import { useImmunotherapiesStore } from '@/features/immunotherapy/stores/immunotherapies-store'
import { useCustomTypesStore } from '@/features/immunotherapy/stores/custom-types-store'
import { usePatientStore, seedInactivationsFor } from '@/features/patient/stores/patient-store'
import { useHasPermission, useDoctorFilter } from '@/shared/identity/user-store'
import {
  Search,
  Plus,
  FileText,
  Archive,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ChevronDown,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Toast, Button, Select, TextInput } from '@/shared/components'

import { getIntervalColor } from '@/features/immunotherapy/constants/interval-colors'

export function ImmunotherapiesPage() {
  const navigate = useNavigate()
  const { success, patientName, patientId } = useSearch({ from: '/immunotherapies' })
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (success) {
      setShowToast(true)
      navigate({ to: '/immunotherapies', search: {}, replace: true })
      const timer = setTimeout(() => setShowToast(false), 8000)
      return () => clearTimeout(timer)
    }
  }, [success])

  const { setSelectedPatient } = usePatientStore()
  const canAddImmunotherapy = useHasPermission('add_immunotherapy')
  const canEvolve = useHasPermission('evolve_patient')
  const doctorFilter = useDoctorFilter()
  const {
    immunotherapies,
    searchTerm,
    typeFilter,
    intervalFilter,
    showInactive,
    currentPage,
    setSearchTerm,
    setTypeFilter,
    setIntervalFilter,
    setShowInactive,
    setCurrentPage,
  } = useImmunotherapiesStore()

  const [itemsPerPage, setItemsPerPage] = useState(10)

  const customTypes = useCustomTypesStore((s) => s.types)
  const tipos = useMemo(() => {
    return Array.from(new Set([...immunotherapies.map((i) => i.type), ...customTypes.map((t) => t.label)]))
  }, [immunotherapies, customTypes])

  const ciclos = useMemo(() => {
    return Array.from(new Set(immunotherapies.map((i) => i.cycleInterval.days.toString()))).sort(
      (a, b) => Number(a) - Number(b)
    )
  }, [immunotherapies])

  const filtered = useMemo(() => {
    return immunotherapies.filter((item) => {
      const matchDoctor = !doctorFilter || item.responsibleDoctor === doctorFilter
      const matchSearch = !searchTerm || item.name.toLowerCase().includes(searchTerm.toLowerCase())
      const matchTipo = typeFilter === 'Todos os tipos' || item.type === typeFilter
      const matchCiclo =
        intervalFilter === 'Todos os intervalos' || item.cycleInterval.days.toString() === intervalFilter
      const matchStatus = showInactive ? item.status === 'inactive' : item.status === 'active'
      return matchDoctor && matchSearch && matchTipo && matchCiclo && matchStatus
    })
  }, [immunotherapies, searchTerm, typeFilter, intervalFilter, showInactive, doctorFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage))

  const paginated = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage
    return filtered.slice(start, start + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, typeFilter, intervalFilter, itemsPerPage, setCurrentPage])

  return (
    <div className="flex flex-1 flex-col bg-gray-50/80 min-h-0 overflow-hidden">
      <div className="mx-4 my-4 flex flex-1 flex-col rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.06)] overflow-hidden">
        {/* Header */}
        <div className="border-b border-(--border-custom) px-5 py-4">
          <h1 className="mb-3.5 text-2xl font-bold text-(--text)">Imunoterapias</h1>

          <div className="flex flex-wrap items-center gap-1.5">
            {/* Search */}
            <div className="relative flex-1 min-w-45">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-(--text-muted) z-10" />
              <TextInput
                placeholder="Pesquisar paciente"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-8 pl-8"
              />
            </div>

            {/* Tipo filter */}
            <Select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-8 bg-white w-auto"
            >
              <option value="Todos os tipos">Todos os tipos</option>
              {tipos.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </Select>

            {/* Ciclo filter */}
            <Select
              value={intervalFilter}
              onChange={(e) => setIntervalFilter(e.target.value)}
              className="h-8 bg-white w-auto"
            >
              <option value="Todos os intervalos">Todos os intervalos</option>
              {ciclos.map((c) => (
                <option key={c} value={c}>{c} dias</option>
              ))}
            </Select>

            {/* Inativas toggle */}
            <button
              onClick={() => setShowInactive(!showInactive)}
              className={cn(
                "h-8 w-8 flex items-center justify-center rounded-lg border-[1.5px] transition-all",
                showInactive
                  ? "border-brand bg-teal-50 text-brand"
                  : "border-(--border-custom) text-(--text-muted) hover:border-brand hover:text-brand hover:bg-teal-50"
              )}
              title="Imunoterapias inativas"
            >
              <Archive size={14} />
            </button>

            {canAddImmunotherapy && (
              <Button
                tone="brand"
                variant="solid"
                prominent
                leftIcon={<Plus size={14} />}
                to="/add-immunotherapy"
                className="px-3"
              >
                Adicionar Imunoterapia
              </Button>
            )}

            {canEvolve && (
              <Button tone="brand" variant="outline" leftIcon={<FileText size={14} />} to="/patient-evolution" className="px-3">
                Evoluir Paciente
              </Button>
            )}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-(--border-custom) bg-gray-50/80">
                <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Nome</th>
                <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Tipo</th>
                <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Dose e Concentração Atuais</th>
                <th className="text-left text-[0.65rem] font-semibold text-(--text-muted) uppercase tracking-wider px-4 py-2.5">Intervalo Atual</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center text-(--text-muted) py-10 text-xs">
                    Nenhum resultado encontrado
                  </td>
                </tr>
              ) : (
                paginated.map((item) => {
                  const color = getIntervalColor(item.cycleInterval.days)
                  return (
                    <tr
                      key={item.id}
                      className="border-b border-(--border-custom) last:border-0 cursor-pointer hover:bg-teal-50/40 transition-colors duration-150"
                      onClick={() => {
                        setSelectedPatient({
                          id: item.id, nome: item.name, dataNascimento: '02/07/2000', idade: 25,
                          telefone: '(62) 99557-1423', peso: '89.7 kg', cpf: '711.905.744-89',
                          medicoResponsavel: item.responsibleDoctor, status: item.status === 'active' ? 'ativo' as const : 'inativo' as const,
                          tipoImunoterapia: item.type, inicioInducao: '01/01/2020', inicioManutencao: null,
                          viaAdministracao: 'Subcutânea', extrato: 'Der p 60 + der f 10% + blt 30%',
                          concentracaoVolumeMeta: '1:10 - 0,5ml', metaAtingida: false,
                          intervaloAtual: item.cycleInterval.days, dataProximaAplicacao: '21/05/2025',
                          concentracaoDoseAtuais: item.doseConcentration,
                          inactivations: item.status === 'inactive' ? seedInactivationsFor(item.id, item.doseConcentration, item.cycleInterval.days) : undefined,
                        })
                        navigate({ to: '/patient/$patientId', params: { patientId: item.id } })
                      }}
                    >
                      <td className={cn("px-4 py-2 text-xs font-medium", item.status === 'inactive' ? "text-(--text-muted)" : "text-(--text)")}>
                        <div className="flex items-center gap-2">
                          {item.name}
                          {item.status === 'inactive' && <span className="text-[0.55rem] font-semibold px-1.5 py-px rounded-full bg-gray-100 text-(--text-muted) border border-gray-200">Inativo</span>}
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-gray-100 text-[0.7rem] font-medium text-(--text-muted)">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-xs text-(--text-muted)">{item.doseConcentration}</td>
                      <td className="px-4 py-2">
                        <span
                          className="inline-flex items-center gap-1.5 px-2 py-px rounded-full text-[0.65rem] font-semibold border"
                          style={{ backgroundColor: color.bg, color: color.text, borderColor: color.dot + '30' }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full shrink-0"
                            style={{ backgroundColor: color.dot }}
                          />
                          {item.cycleInterval.days} dias
                        </span>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="border-t border-(--border-custom) px-4 py-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-(--text-muted)">Registros por página</span>
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(Number(e.target.value))}
                  className="h-7 pl-2 pr-6 rounded-md border border-(--border-custom) bg-white text-xs appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-teal-400 transition-all"
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
                <ChevronDown size={10} className="absolute right-1.5 top-1/2 -translate-y-1/2 text-(--text-muted) pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-xs text-(--text-muted) mr-1.5">
                Página {currentPage} de {totalPages}
              </span>
              {[
                { icon: ChevronsLeft, action: () => setCurrentPage(1), disabled: currentPage === 1 },
                { icon: ChevronLeft, action: () => setCurrentPage(currentPage - 1), disabled: currentPage === 1 },
                { icon: ChevronRight, action: () => setCurrentPage(currentPage + 1), disabled: currentPage === totalPages },
                { icon: ChevronsRight, action: () => setCurrentPage(totalPages), disabled: currentPage === totalPages },
              ].map((btn, i) => {
                const Icon = btn.icon
                return (
                  <button
                    key={i}
                    onClick={btn.action}
                    disabled={btn.disabled}
                    className="h-7 w-7 flex items-center justify-center rounded-md border border-(--border-custom) text-(--text-muted) disabled:opacity-40 disabled:cursor-not-allowed hover:border-teal-300 hover:text-teal-600 transition-all"
                  >
                    <Icon size={12} />
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      <Toast
        open={showToast}
        onClose={() => setShowToast(false)}
        variant="success"
        icon={<CheckCircle size={16} />}
        title="Registro salvo com sucesso!"
        description={<>
          Os dados de {patientName || 'paciente'} foram registrados e a próxima dose já está agendada.
          {patientId && (
            <Link
              to="/patient/$patientId"
              params={{ patientId }}
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700 mt-2 transition-colors"
            >
              Acessar prontuário do paciente &rarr;
            </Link>
          )}
        </>}
      />
    </div>
  )
}
