import { NextRequest, NextResponse } from 'next/server'

/**
 * Alias route: /api/faq -> /api/faq-pages
 * Provides backward compatibility and cleaner API endpoints
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const searchParams = url.searchParams.toString()
  
  // Forward to the actual collection endpoint
  const targetUrl = `${url.origin}/api/faq-pages${searchParams ? `?${searchParams}` : ''}`
  
  const response = await fetch(targetUrl, {
    headers: {
      ...Object.fromEntries(request.headers.entries()),
    },
    cache: 'no-store',
  })

  const data = await response.json()
  return NextResponse.json(data, { status: response.status })
}
