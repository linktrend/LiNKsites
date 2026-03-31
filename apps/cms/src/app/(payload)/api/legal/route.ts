import { NextRequest, NextResponse } from 'next/server'

/**
 * API alias: /api/legal
 * Combines terms-pages and privacy-pages into unified legal endpoint
 * Matches website's expectation for legal document queries
 */
export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const searchParams = url.searchParams
  
  try {
    // Fetch both collections in parallel
    const baseUrl = `${url.protocol}//${url.host}`
    const queryString = searchParams.toString()
    
    const [termsRes, privacyRes] = await Promise.all([
      fetch(`${baseUrl}/api/terms-pages${queryString ? `?${queryString}` : ''}`, {
        headers: Object.fromEntries(request.headers.entries()),
        cache: 'no-store',
      }),
      fetch(`${baseUrl}/api/privacy-pages${queryString ? `?${queryString}` : ''}`, {
        headers: Object.fromEntries(request.headers.entries()),
        cache: 'no-store',
      }),
    ])

    if (!termsRes.ok || !privacyRes.ok) {
      return NextResponse.json(
        { error: 'Failed to fetch legal documents' },
        { status: 500 }
      )
    }

    const [termsData, privacyData] = await Promise.all([
      termsRes.json(),
      privacyRes.json(),
    ])

    // Combine results
    const combinedDocs = [
      ...(termsData.docs || []),
      ...(privacyData.docs || []),
    ]

    return NextResponse.json({
      docs: combinedDocs,
      totalDocs: combinedDocs.length,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 10,
      totalPages: 1,
      page: 1,
      pagingCounter: 1,
      hasPrevPage: false,
      hasNextPage: false,
      prevPage: null,
      nextPage: null,
    })
  } catch (error) {
    console.error('[Legal API Alias] Error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
