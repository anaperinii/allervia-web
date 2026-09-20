import { describe, expect, it } from 'vitest'
import {
  ageFromBirthDate,
  buildLegacyPatient,
  formatCivilDate,
  formatStepPresentation,
  legacyModalityToRoute,
  routeToLegacyModality,
  therapyStatusToLegacy,
} from '@/features/patient/adapters/clinical-presentation'
import type {
  PatientDetail,
  TherapySummary,
} from '@/shared/api/contracts/clinical'

const THERAPY: TherapySummary = {
  id: 'therapy-1',
  immunoType: 'SCIT',
  administrationRoute: 'SUBCUTANEOUS',
  extract: 'Der p 100%',
  status: 'IN_PROGRESS',
  revision: 0,
  inductionStartDate: '2026-01-01T13:00:00.000Z',
  maintenanceStartDate: null,
  prescription: { versionId: 'version-1', revision: 1 },
  nextDose: {
    id: 'dose-1',
    scheduledAt: '2026-01-08T13:00:00.000Z',
    status: 'SCHEDULED',
  },
  createdAt: '2026-01-01T13:00:00.000Z',
}

const DETAIL: PatientDetail = {
  id: 'patient-1',
  fullName: 'Carla Mendes',
  cpfMasked: '***.***.*47-25',
  cpf: '52998224725',
  birthDate: '1990-06-15T00:00:00.000Z',
  phoneNumber: '62999999999',
  weightInKg: 70.5,
  isActive: true,
  responsiblePhysician: {
    id: 'prof-1',
    fullName: 'Dra. Karina Martins',
    councilNumber: '24815',
    councilUf: 'GO',
  },
  therapyCount: 1,
  therapyStatuses: ['IN_PROGRESS'],
  therapies: [THERAPY],
  createdAt: '2026-01-01T13:00:00.000Z',
  updatedAt: '2026-01-01T13:00:00.000Z',
}

describe('adapters de apresentação clínica', () => {
  it('mapeia enums de via e status sem inventar valores', () => {
    expect(routeToLegacyModality('SUBCUTANEOUS')).toBe('subcutaneous')
    expect(routeToLegacyModality('SUBLINGUAL')).toBe('sublingual')
    expect(legacyModalityToRoute('sublingual')).toBe('SUBLINGUAL')
    expect(therapyStatusToLegacy('IN_PROGRESS')).toBe('active')
    expect(therapyStatusToLegacy('SUSPENDED')).toBe('inactive')
    expect(therapyStatusToLegacy('COMPLETED')).toBe('completed')
  })

  it('apresenta data civil sem deslocamento de fuso', () => {
    // Meia-noite UTC não pode virar o dia anterior no fuso local.
    expect(formatCivilDate('1990-06-15T00:00:00.000Z')).toBe('15/06/1990')
  })

  it('formata o passo resolvido preservando as casas decimais', () => {
    expect(
      formatStepPresentation({
        id: 'low',
        concentration: '1000',
        volume: '0.1',
        intervalDays: 7,
      }),
    ).toBe('1:1.000 - 0,1ml')

    expect(
      formatStepPresentation({
        id: 'high',
        concentration: '10',
        volume: '0.50',
        intervalDays: 28,
      }),
    ).toBe('1:10 - 0,50ml')
  })

  it('calcula idade a partir da data civil', () => {
    const birth = new Date()
    birth.setUTCFullYear(birth.getUTCFullYear() - 30)
    expect(ageFromBirthDate(birth.toISOString())).toBe(30)
  })

  it('constrói o paciente legado carregando IDs e tratamento selecionado', () => {
    const legacy = buildLegacyPatient(DETAIL, THERAPY)

    expect(legacy.id).toBe('patient-1')
    expect(legacy.responsibleDoctorId).toBe('prof-1')
    expect(legacy.cpf).toBe('52998224725')
    expect(legacy.immunotherapyType).toBe('SCIT')
    expect(legacy.administrationRoute).toBe('Subcutânea')
    expect(legacy.extract).toBe('Der p 100%')
    expect(legacy.status).toBe('active')
    expect(legacy.birthDate).toBe('15/06/1990')
  })

  it('usa a máscara quando o documento completo não veio', () => {
    const { cpf: _cpf, ...restricted } = DETAIL
    const legacy = buildLegacyPatient(restricted as PatientDetail, null)

    expect(legacy.cpf).toBe('***.***.*47-25')
    expect(legacy.immunotherapyType).toBe('—')
    expect(legacy.nextApplicationDate).toBe('')
  })
})
