import { NextRequest, NextResponse } from 'next/server'

/**
 * Alias route: /api/faq -> /api/faq-pages
 * Provides backward compatibility and cleaner API endpoints
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const searchParams = url.searchParams.toString()
  const internalApiBase = process.env.PAYLOAD_PUBLIC_SERVER_URL

  if (!internalApiBase) {
    return NextResponse.json({ error: 'Server misconfigured (missing PAYLOAD_PUBLIC_SERVER_URL)' }, { status: 500 })
  }

  // Forward to the actual collection endpoint.
  const targetUrl = new URL(`/api/faq-pages${searchParams ? `?${searchParams}` : ''}`, internalApiBase).toString()
  
  const response = await fetch(targetUrl, {
    headers: {
      cookie: request.headers.get('cookie') ?? '',
      authorization: request.headers.get('authorization') ?? '',
      'accept-language': request.headers.get('accept-language') ?? '',
    },
    cache: 'no-store',
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
