import { Component, useEffect, useState, type ReactNode } from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { apiRequest } from '@/shared/api/client'
import {
  assertDiagnostics,
  capturedDiagnostics,
  expectRenderErrors,
  installDiagnostics,
} from '../helpers/diagnostics'
import { assertNoUnexpectedRequests, jsonResponse, stubApi } from '../helpers/http'









function Exploding(): ReactNode {
  throw new Error('sentinela: componente quebrado')
}


class Boundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  render() {
    return this.state.failed ? <p>Falha tratada</p> : this.props.children
  }
}


function SwallowsRequestFailure(): ReactNode {
  const [state, setState] = useState('carregando')
  useEffect(() => {
    apiRequest('/rota-nao-declarada')
      .then(() => setState('ok'))
      .catch(() => setState('indisponível'))
  }, [])
  return <p>{state}</p>
}

describe('harness de deteção', () => {
  it('detecta componente que lança dentro de um boundary', async () => {
    expectRenderErrors(/sentinela: componente quebrado/)
    render(
      <Boundary>
        <Exploding />
      </Boundary>,
    )


    expect(await screen.findByText('Falha tratada')).toBeInTheDocument()
    await waitFor(() => {
      expect(capturedDiagnostics()).toHaveLength(1)
    })
    expect(capturedDiagnostics()[0].kind).toBe('react-error')
  })

  it('denuncia a regressão se o guard de erros for retirado', () => {

    installDiagnostics()
    render(
      <Boundary>
        <Exploding />
      </Boundary>,
    )
    expect(() => assertDiagnostics()).toThrowError(
      /Erro de render capturado sem declaração/,
    )


    installDiagnostics()
  })

  it('falha em request sem stub mesmo quando o componente captura a rejeição', async () => {
    stubApi([{ path: '/declarada', handler: jsonResponse({ ok: true }) }])
    render(<SwallowsRequestFailure />)


    expect(await screen.findByText('indisponível')).toBeInTheDocument()
    expect(() => assertNoUnexpectedRequests()).toThrowError(
      /Request sem stub declarado[\s\S]*GET \/rota-nao-declarada/,
    )
  })
})
