import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/** Liveness is deliberately shallow: it reveals no configuration or database data. */
export function GET() {
  return NextResponse.json({ status: 'live', service: 'cms' }, { headers: { 'cache-control': 'no-store' } })
}
