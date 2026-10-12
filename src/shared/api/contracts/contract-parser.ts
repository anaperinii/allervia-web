import type { z } from 'zod'
import { API_ERROR_CODES, ApiError } from '@/shared/api/contracts/errors'

export function createContractParser<T>(
  schema: z.ZodType,
  message: string,
): (payload: unknown) => T {
  return (payload) => {
    if (!schema.safeParse(payload).success) {
      throw new ApiError({
        statusCode: 502,
        code: API_ERROR_CODES.invalidApiResponse,
        message,
      })
    }
    return payload as T
  }
}
