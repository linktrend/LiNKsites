import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { searchHelpArticles, trackArticleView } from '@/utils/helpSearch'

export async function GET(request: Request) {
  try {
    const payload = await getPayload({ config })
    
    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const siteId = searchParams.get('site') || ''
    const locale = searchParams.get('lang') || 'en'
    const limit = parseInt(searchParams.get('limit') || '10')

    // Validate required parameters
    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      )
    }

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site parameter "site" is required' },
        { status: 400 }
      )
    }

    // Perform search
    const results = await searchHelpArticles(
      {
        query,
        siteId,
        locale,
        limit,
      },
      payload
    )

    return NextResponse.json({
      success: true,
      query,
      results,
      total: results.length,
    })
  } catch (error) {
    console.error('Help search API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    
    // Track article view
    const body = await request.json()
    const { articleId } = body

    if (!articleId) {
      return NextResponse.json(
        { error: 'Article ID is required' },
        { status: 400 }
      )
    }

    await trackArticleView(articleId, payload)

    return NextResponse.json({
      success: true,
      message: 'Article view tracked',
    })
  } catch (error) {
    console.error('Help article tracking error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
