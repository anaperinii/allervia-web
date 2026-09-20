import { apiRequest } from '@/shared/api/client'
import type {
  AutomationSettings,
  ProtocolDefinitionDraft,
  ProtocolVersion,
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
