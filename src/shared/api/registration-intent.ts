import { ApiError, API_ERROR_CODES } from './contracts/errors'


export class RegistrationIntent {
  private fingerprint: string | null = null
  private key = crypto.randomUUID()
  private unresolved = false

  prepare(body: unknown): string {
    const next = JSON.stringify(body)
    if (this.fingerprint !== null && next !== this.fingerprint) {
      if (this.unresolved) {
        throw new ApiError({
          statusCode: 0,
          code: API_ERROR_CODES.indeterminate,
          message: 'A tentativa anterior ainda tem resultado desconhecido. Repita os mesmos dados para recuperar o recibo antes de alterar a operação clínica.',
        })
      }
      this.key = crypto.randomUUID()
    }
    this.fingerprint = next
    this.unresolved = true
    return this.key
  }

  failed(definitelyRejected: boolean): void {
    this.unresolved = !definitelyRejected
  }
}
