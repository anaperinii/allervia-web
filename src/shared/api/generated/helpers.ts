import type { components, operations } from '@/shared/api/generated/openapi'

export type Schema<K extends keyof components['schemas']> =
  components['schemas'][K]

type JsonContent<T> = T extends { content: { 'application/json': infer Body } }
  ? Body
  : never

export type OperationResponse<
  O extends keyof operations,
  S extends keyof operations[O]['responses'],
> = JsonContent<operations[O]['responses'][S]>
