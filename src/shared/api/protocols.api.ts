import { apiRequest } from '@/shared/api/client'
import type {
  AutomationSettings,
  BindLegacyResult,
  MigrationInventory,
  ProtocolDefinitionDraft,
  ProtocolVersion,
  ResolvedPrescriptionInput,
  SimulationResult,
  TreatmentProtocol,
} from '@/shared/api/contracts/protocols'

export function listProtocols(
  signal?: AbortSignal,
): Promise<TreatmentProtocol[]> {
  return apiRequest('/treatment-protocols', { signal })
}

export function readVersion(
  versionId: string,
  signal?: AbortSignal,
): Promise<ProtocolVersion> {
  return apiRequest(`/treatment-protocols/versions/${versionId}`, { signal })
}

export function createProtocol(body: {
  name: string
  definition: ProtocolDefinitionDraft
}): Promise<{ protocol: TreatmentProtocol; version: ProtocolVersion }> {
  return apiRequest('/treatment-protocols', { method: 'POST', body })
}

/** Nova versão em rascunho de um protocolo existente. */
export function createVersion(
  protocolId: string,
  definition: ProtocolDefinitionDraft,
): Promise<ProtocolVersion> {
  return apiRequest(`/treatment-protocols/${protocolId}/versions`, {
    method: 'POST',
    body: { definition },
  })
}

/**
 * Edição de rascunho com revisão esperada: um 409 STALE_PROTOCOL_REVISION
 * significa que alguém salvou antes — recarregar, comparar e reconfirmar,
 * nunca reenviar por cima.
 */
export function editVersion(
  versionId: string,
  expectedRevision: number,
  definition: ProtocolDefinitionDraft,
): Promise<ProtocolVersion> {
  return apiRequest(`/treatment-protocols/versions/${versionId}`, {
    method: 'PATCH',
    body: { expectedRevision, definition },
  })
}

function mutateVersion(
  versionId: string,
  action: 'publish' | 'retire' | 'default',
  expectedRevision: number,
): Promise<ProtocolVersion> {
  return apiRequest(`/treatment-protocols/versions/${versionId}/${action}`, {
    method: 'POST',
    body: { expectedRevision },
  })
}

export function publishVersion(versionId: string, expectedRevision: number) {
  return mutateVersion(versionId, 'publish', expectedRevision)
}

export function retireVersion(versionId: string, expectedRevision: number) {
  return mutateVersion(versionId, 'retire', expectedRevision)
}

export function setDefaultVersion(versionId: string, expectedRevision: number) {
  return mutateVersion(versionId, 'default', expectedRevision)
}

export function simulateVersion(
  versionId: string,
  body: {
    prescription: Record<string, unknown>
    administered: Record<string, unknown>
    stepId?: string
  },
): Promise<SimulationResult> {
  return apiRequest(`/treatment-protocols/versions/${versionId}/simulate`, {
    method: 'POST',
    body,
  })
}

/** Inventário de migração: leitura pura, nenhuma escrita. */
export function readMigrationInventory(
  signal?: AbortSignal,
): Promise<MigrationInventory> {
  return apiRequest('/treatment-protocols/migration/inventory', { signal })
}

/**
 * Rascunho técnico derivado do legado. Idempotente por organização; nasce com
 * revisão de transições obrigatória e não pode ser publicado sem revisão.
 */
export function createOriginDraft(): Promise<
  TreatmentProtocol & { versions: ProtocolVersion[] }
> {
  return apiRequest('/treatment-protocols/migration/origin-draft', {
    method: 'POST',
    body: {},
  })
}

/**
 * Ensaio (dryRun, padrão) ou vinculação revisada de um tratamento legado.
 * O ensaio não escreve nada; a vinculação grava a prescrição e o plano da
 * única dose pendente, preservando datas, valores e histórico.
 */
export function bindLegacyTherapy(
  therapyId: string,
  body: {
    versionId: string
    prescription: ResolvedPrescriptionInput
    expectedRevision: number
    dryRun?: boolean
  },
): Promise<BindLegacyResult> {
  return apiRequest(`/treatment-protocols/migration/therapies/${therapyId}`, {
    method: 'POST',
    body,
  })
}

export function readAutomation(
  signal?: AbortSignal,
): Promise<AutomationSettings> {
  return apiRequest('/treatment-protocols/automation', { signal })
}

export function updateAutomation(body: {
  enabled: boolean
  timeZone: string
}): Promise<{ enabled: boolean; timeZone: string }> {
  return apiRequest('/treatment-protocols/automation', {
    method: 'PATCH',
    body,
  })
}
