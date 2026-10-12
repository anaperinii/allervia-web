import { expect } from 'vitest'
import { ApiError, API_ERROR_CODES } from '@/shared/api/contracts/errors'

export function expectContractViolation(run: () => unknown): ApiError {
  let caught: unknown
  try {
    run()
  } catch (error) {
    caught = error
  }
  expect(caught).toBeInstanceOf(ApiError)
  const violation = caught as ApiError
  expect(violation.code).toBe(API_ERROR_CODES.invalidApiResponse)
  expect(violation.statusCode).toBe(502)
  return violation
}
