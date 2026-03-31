import { createHmac, timingSafeEqual } from 'node:crypto'

const HEADER_KEYS = ['x-signature', 'signature', 'x-webhook-signature']

const normalizeSignature = (signature?: string | null): Buffer | null => {
  if (!signature) return null
  const cleaned = signature.startsWith('sha256=') ? signature.slice(7) : signature
  try {
    return Buffer.from(cleaned, 'hex')
  } catch {
    return null
  }
}

export const verifySignature = (
  payload: string | Buffer,
  signature: string | null | undefined,
  secret = process.env.WEBHOOK_SECRET,
): boolean => {
  if (!secret) return false
  const provided = normalizeSignature(signature)
  if (!provided) return false

  const digest = createHmac('sha256', secret).update(payload).digest()
  if (digest.length !== provided.length) {
    return false
  }

  try {
    return timingSafeEqual(digest, provided)
  } catch {
    return false
  }
}

export const verifyRequestSignature = async (
  req: { headers?: { get: (key: string) => string | null }; clone?: () => unknown },
  rawBody?: string,
): Promise<boolean> => {
  const secret = process.env.WEBHOOK_SECRET
  if (!secret) return false

  const headerGetter = req.headers?.get?.bind(req.headers)
  const signature =
    (headerGetter && HEADER_KEYS.map((key) => headerGetter(key)).find(Boolean)) || undefined

  const body = rawBody ?? ''
  return verifySignature(body, signature, secret)
}
