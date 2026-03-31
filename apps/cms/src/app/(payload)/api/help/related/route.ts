import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { getRelatedArticles } from '@/utils/helpSearch'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const articleId = searchParams.get('id') || ''
    const siteId = searchParams.get('site') || ''
    const locale = searchParams.get('lang') || 'en'
    const limit = parseInt(searchParams.get('limit') || '5')

    // Validate required parameters
    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID parameter "id" is required' },
        { status: 400 }
      )
    }

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site parameter "site" is required' },
        { status: 400 }
      )
    }

    // Get related articles
    const results = await getRelatedArticles(
      articleId,
      siteId,
      locale,
      payload,
      limit
    )

    return NextResponse.json({
      success: true,
      results,
      total: results.length,
    })
  } catch (error) {
    console.error('Related articles API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
