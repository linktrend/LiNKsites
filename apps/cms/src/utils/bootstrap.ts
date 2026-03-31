import type { Payload, PayloadRequest } from 'payload'
import { getPayload } from 'payload'
import payloadConfig from '@/payload.config'

const BOOTSTRAP_CACHE_KEY = 'bootstrapUsersEmpty'
const EMPTY_CACHE_TTL_MS = 2000

let processCache: { value: boolean; timestamp: number } | null = null

const now = () => Date.now()

const getPayloadInstance = async (req?: PayloadRequest): Promise<Payload> => {
  if (req?.payload) return req.payload
  return getPayload({ config: payloadConfig })
}

export const isBootstrapMode = async (req: PayloadRequest): Promise<boolean> => {
  // Per-request cache to avoid duplicate queries within the same request
  const cached = (req.context as Record<string, unknown> | undefined)?.[BOOTSTRAP_CACHE_KEY]
  if (typeof cached === 'boolean') return cached

  // Process-level cache: trusted when we already know users exist.
  if (processCache) {
    const age = now() - processCache.timestamp
    if (age < EMPTY_CACHE_TTL_MS) {
      return processCache.value
    }
  }

  try {
    const payload = await getPayloadInstance(req)
    const result = await payload.find({
      collection: 'users',
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const isEmpty = (result?.totalDocs ?? 0) === 0
    if (!req.context) {
      req.context = {}
    }
    ;(req.context as Record<string, unknown>)[BOOTSTRAP_CACHE_KEY] = isEmpty
    processCache = { value: isEmpty, timestamp: now() }
    return isEmpty
  } catch {
    // Fail safe: assume not bootstrap to avoid opening access if the check fails
    return false
  }
}
