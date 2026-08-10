import config from '@/payload.config'
import { getPayload } from 'payload'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * Readiness proves that the actual Payload data path can answer a bounded
 * query. It intentionally returns only an operational status, never errors,
 * hostnames, credentials, or customer content.
 */
export async function GET() {
  try {
    const payload = await getPayload({ config })
    await payload.find({ collection: 'sites', limit: 1, depth: 0, overrideAccess: true })
    return NextResponse.json({ status: 'ready', service: 'cms' }, { headers: { 'cache-control': 'no-store' } })
  } catch {
    return NextResponse.json({ status: 'not_ready', service: 'cms' }, { status: 503, headers: { 'cache-control': 'no-store' } })
  }
}
