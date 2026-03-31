import type { Dispatch, SetStateAction } from 'react'

export type FormattedError = {
  message: string
  status?: number
  requestId?: string
  raw?: unknown
}

const parseJSON = async (response: Response): Promise<Record<string, unknown> | null> => {
  try {
    return (await response.clone().json()) as Record<string, unknown>
  } catch {
    return null
  }
}

const normalizeMessage = (value: unknown): string | undefined => {
  if (!value) return undefined
  if (typeof value === 'string') return value
  if (Array.isArray(value) && value[0]) return normalizeMessage(value[0])
  if (typeof value === 'object') {
    const maybeError = value as Record<string, unknown>
    if (typeof maybeError.message === 'string') return maybeError.message
    if (Array.isArray(maybeError.errors) && maybeError.errors[0]) {
      const nested = normalizeMessage(maybeError.errors[0])
      if (nested) return nested
    }
  }
  return undefined
}

const readRequestId = (
  response: Response | undefined,
  body: Record<string, unknown> | null,
): string | undefined => {
  const headerId = response?.headers.get('x-request-id') ?? response?.headers.get('x-requestid')
  if (headerId) return headerId
  if (body && typeof body.requestId === 'string') return body.requestId
  if (body && typeof body.request_id === 'string') return body.request_id
  return undefined
}

export const formatError = async (error: unknown, response?: Response): Promise<FormattedError> => {
  if (response) {
    const parsed = await parseJSON(response)
    const message =
      normalizeMessage(parsed) ||
      normalizeMessage(error) ||
      (!response.ok ? response.statusText : undefined) ||
      'Something went wrong'

    return {
      message,
      status: response.status,
      requestId: readRequestId(response, parsed),
      raw: parsed ?? error,
    }
  }

  if (error instanceof Error) {
    return { message: error.message || 'Unexpected error', raw: error }
  }

  if (typeof error === 'string') {
    return { message: error }
  }

  return { message: 'Unexpected error', raw: error }
}

export const isTransientError = (status?: number): boolean =>
  typeof status === 'number' && status >= 500 && status < 600

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: { retries?: number; delayMs?: number } = {},
): Promise<T> => {
  const retries = options.retries ?? 2
  const delayMs = options.delayMs ?? 450
  let attempt = 0
  while (true) {
    try {
      return await operation()
    } catch (error) {
      attempt += 1
      if (attempt > retries) {
        throw error
      }
      await sleep(delayMs * attempt)
    }
  }
}

export const setErrorState = <T extends { message: string; requestId?: string }>(
  setter: Dispatch<SetStateAction<T | null>>,
  formatted: FormattedError,
) => {
  setter({
    message: formatted.requestId
      ? `${formatted.message} (requestId: ${formatted.requestId})`
      : formatted.message,
    requestId: formatted.requestId,
  } as T)
}
