import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  acceptSession,
  apiRequest,
  clearSession,
  DEFAULT_REQUEST_TIMEOUT_MS,
} from '@/shared/api/client'
import { ApiError } from '@/shared/api/contracts/errors'
import {
  parseAccountContext,
  parseSessionEnvelope,
  parseStartSessionResult,
} from '@/shared/api/contracts/auth.schema'
import {
  parseAppointmentPage,
  parseDoseDetail,
  parseDoseRecords,
  parseImmunotherapyPage,
  parsePatientDetail,
} from '@/shared/api/contracts/clinical-workflow.schema'
import { accountContext, mfaChallenge, sessionEnvelope } from '../fixtures/account'
import { administeredDose, doseDetail, doseRecord, immunotherapyPage, patientDetail } from '../fixtures/clinical'
import { jsonResponse } from '../helpers/http'

function expectInvalidApiResponse(run: () => unknown): ApiError {
  try {
    run()
  } catch (error) {
    expect(error).toBeInstanceOf(ApiError)
    const apiError = error as ApiError
    expect(apiError.code).toBe('INVALID_API_RESPONSE')
    expect(apiError.statusCode).toBe(502)
    return apiError
  }
  throw new Error('A forma inválida deveria ter sido recusada.')
}

describe('matriz de payloads do contrato de runtime', () => {
  it('aceita o payload válido e também campos aditivos', () => {
    expect(parseDoseRecords([administeredDose(), doseRecord()])).toHaveLength(2)

    expect(
      parseDoseRecords([{ ...doseRecord(), campoNovoDoServidor: true }]),
    ).toHaveLength(1)
    expect(parsePatientDetail(patientDetail())).toMatchObject({ id: 'patient-1' })
    expect(parseImmunotherapyPage(immunotherapyPage())).toMatchObject({ total: 1 })
  })

  it('recusa campo obrigatório ausente', () => {
    const semRevisao: Record<string, unknown> = { ...doseRecord() }
    delete semRevisao.revision
    expectInvalidApiResponse(() => parseDoseRecords([semRevisao]))

    const semTerapias: Record<string, unknown> = { ...patientDetail() }
    delete semTerapias.therapies
    expectInvalidApiResponse(() => parsePatientDetail(semTerapias))
  })

  it('recusa null indevido e número inválido', () => {
    expectInvalidApiResponse(() =>
      parseDoseRecords([{ ...doseRecord(), scheduledAt: null }]),
    )
    expectInvalidApiResponse(() =>
      parseDoseRecords([{ ...doseRecord(), revision: -1 }]),
    )
    expectInvalidApiResponse(() =>
      parseDoseDetail({ ...doseDetail(), therapyRevision: 1.5 }),
    )
  })

  it('recusa enum desconhecido e objeto no lugar de lista', () => {
    expectInvalidApiResponse(() =>
      parseDoseRecords([{ ...doseRecord(), status: 'INVENTADO' }]),
    )

    expectInvalidApiResponse(() => parseDoseRecords({}))
    expectInvalidApiResponse(() =>
      parseAppointmentPage({ items: {}, page: 1, pageSize: 10, total: 0 }),
    )
  })

  it('recusa discriminador desconhecido na criação de sessão', () => {
    expect(parseStartSessionResult(sessionEnvelope())).toMatchObject({
      authenticated: true,
    })
    expect(parseStartSessionResult(mfaChallenge())).toMatchObject({
      status: 'MFA_REQUIRED',
    })
    expectInvalidApiResponse(() =>
      parseStartSessionResult({
        status: 'MFA_INVENTADO',
        challengeToken: 'x',
        expiresAt: '2026-01-01T00:00:00.000Z',
      }),
    )

    const envelope = sessionEnvelope()
    expectInvalidApiResponse(() =>
      parseSessionEnvelope({
        ...envelope,
        session: { ...envelope.session, organizationId: '' },
      }),
    )
  })

  it('mantém nome e conselho do profissional e recusa o bloco malformado sem vazar conteúdo', () => {
    const parsed = parseAccountContext(accountContext())
    expect(parsed.professional).toMatchObject({
      fullName: 'Dra. Karina Martins',
      councilNumber: '24815',
      councilUf: 'GO',
    })

    expect(parseAccountContext(accountContext({ professional: null })).professional).toBeNull()

    const error = expectInvalidApiResponse(() =>
      parseAccountContext(
        accountContext({
          professional: {
            id: 'professional-1',
            fullName: 'Dra. Karina Martins',
            phoneNumber: '62995571423',
            profession: 'PHYSICIAN',
            councilNumber: 24815 as unknown as string,
            councilUf: 'GO',
          },
        }),
      ),
    )
    expect(error.message).not.toContain('Karina')
    expect(error.message).not.toContain('24815')
  })
})

describe('transporte com prazo e identidade', () => {
  afterEach(() => {
    clearSession()
    vi.useRealTimers()
  })

  it('sucesso com corpo ilegível vira INVALID_API_RESPONSE sem citar o corpo', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        new Response('{"paciente":"Carla Mendes","cpf":"529.982', {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    )

    const error = await apiRequest('/patients/patient-1').catch((cause) => cause)
    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe('INVALID_API_RESPONSE')
    expect((error as ApiError).message).not.toContain('Carla')
    expect((error as ApiError).message).not.toContain('529.982')
  })

  it('204 é ausência de corpo, não resposta inválida', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 204 })))
    await expect(apiRequest('/auth/logout', { method: 'POST' })).resolves.toBeUndefined()
  })

  it('request pendurada termina no deadline com resultado indeterminado', async () => {
    vi.useFakeTimers()
    const fetchMock = vi.fn(
      (_input: RequestInfo | URL, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError')),
          )
        }),
    )
    vi.stubGlobal('fetch', fetchMock)

    const pending = apiRequest('/doses/dose-1/administer', {
      method: 'POST',
      body: { ok: true },
    }).catch((error: unknown) => error)

    await vi.advanceTimersByTimeAsync(DEFAULT_REQUEST_TIMEOUT_MS + 10)
    const error = await pending

    expect(error).toBeInstanceOf(ApiError)
    expect((error as ApiError).code).toBe('RESULT_INDETERMINATE')

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('cancelamento do chamador não vira erro de rede nem deixa timer pendente', async () => {
    vi.useFakeTimers()
    const controller = new AbortController()
    const addSpy = vi.spyOn(controller.signal, 'addEventListener')
    const removeSpy = vi.spyOn(controller.signal, 'removeEventListener')
    vi.stubGlobal(
      'fetch',
      vi.fn(
        (_input: RequestInfo | URL, init?: RequestInit) =>
          new Promise<Response>((_resolve, reject) => {
            init?.signal?.addEventListener('abort', () =>
              reject(new DOMException('Aborted', 'AbortError')),
            )
          }),
      ),
    )

    const pending = apiRequest('/patients', { signal: controller.signal }).catch(
      (error: unknown) => error,
    )
    controller.abort()
    const error = await pending

    expect(error).toBeInstanceOf(DOMException)
    expect((error as DOMException).name).toBe('AbortError')
    expect(addSpy).toHaveBeenCalled()
    expect(removeSpy).toHaveBeenCalled()
    expect(vi.getTimerCount()).toBe(0)
  })

  it('logout entre headers e corpo descarta a resposta antiga', async () => {
    acceptSession('session-1', 'csrf-1')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        const response = jsonResponse(patientDetail())

        clearSession()
        return response
      }),
    )

    const error = await apiRequest('/patients/patient-1').catch((cause) => cause)
    expect(error).toBeInstanceOf(DOMException)
    expect((error as DOMException).name).toBe('AbortError')
  })
})
