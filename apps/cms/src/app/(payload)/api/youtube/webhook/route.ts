import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { verifySignature } from '@/payload/utils/verifySignature'
import { fetchYouTubeVideoMetadata, parseDuration } from '@/utils/youtube'

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    
    // Verify webhook signature
    const signature = request.headers.get('x-webhook-signature') || ''
    const secret = process.env.YOUTUBE_WEBHOOK_SECRET || process.env.WEBHOOK_SECRET || ''
    
    const body = await request.text()
    
    if (secret && !verifySignature(body, signature, secret)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    // Parse webhook payload
    const data = JSON.parse(body)
    const { videoId, siteId } = data

    if (!videoId || !siteId) {
      return NextResponse.json(
        { error: 'Video ID and Site ID are required' },
        { status: 400 }
      )
    }

    // Fetch site configuration
    const site = await payload.findByID({
      collection: 'sites',
      id: siteId,
      depth: 2,
    })

    if (!site?.youtubeApiKey) {
      return NextResponse.json(
        { error: 'YouTube API key not configured for site' },
        { status: 400 }
      )
    }

    // Fetch video metadata
    const metadata = await fetchYouTubeVideoMetadata(videoId, site.youtubeApiKey)

    if (!metadata) {
      return NextResponse.json(
        { error: 'Failed to fetch video metadata' },
        { status: 404 }
      )
    }

    const resolveLocaleFromSite = (): string => {
      const defaultLang = site.defaultLanguage
      if (typeof defaultLang === 'string') return defaultLang
      if (defaultLang && typeof defaultLang === 'object') {
        if ('code' in defaultLang && typeof defaultLang.code === 'string') return defaultLang.code
        if ('id' in defaultLang && typeof defaultLang.id === 'string') return defaultLang.id
      }

      const languages = Array.isArray(site.languages)
        ? site.languages
            .map((lang) => {
              if (!lang) return null
              if (typeof lang === 'string') return lang
              if (typeof lang === 'object' && 'code' in lang && typeof lang.code === 'string') return lang.code
              if (typeof lang === 'object' && 'id' in lang && typeof lang.id === 'string') return lang.id
              return null
            })
            .filter((value): value is string => Boolean(value))
        : []

      return languages[0] || 'en'
    }

    const locale = resolveLocaleFromSite()
    const siteIdValue = Number(siteId)
    if (Number.isNaN(siteIdValue)) {
      return NextResponse.json(
        { error: 'Invalid site ID' },
        { status: 400 },
      )
    }

    // Check if video already exists
    const existing = await payload.find({
      collection: 'video-pages',
      where: {
        and: [
          { youtubeId: { equals: videoId } },
          { site: { equals: siteIdValue } },
          { locale: { equals: locale } },
        ],
      },
      limit: 1,
    })

    const defaultCategory =
      typeof site.defaultVideoCategory === 'object' && site.defaultVideoCategory
        ? site.defaultVideoCategory.id
        : site.defaultVideoCategory

    const videoData = {
      title: metadata.title,
      slug: metadata.id,
      youtubeId: metadata.id,
      description: metadata.description,
      thumbnail: metadata.thumbnail,
      duration: parseDuration(metadata.duration),
      publishedAt: metadata.publishedAt,
      site: siteIdValue,
      locale,
      category: defaultCategory ?? undefined,
      tags: metadata.tags || [],
      viewCount: metadata.viewCount,
      autoIngested: true,
      status: 'published' as const,
      approvalStatus: 'approved' as const,
    }

    let video
    const existingDoc = existing.docs[0] as { id?: string } | undefined
    if (existing.docs.length > 0 && existingDoc?.id) {
      // Update existing video
      video = await payload.update({
        collection: 'video-pages',
        id: existingDoc.id,
        data: videoData,
        draft: false,
      })
    } else {
      // Create new video page
      video = await payload.create({
        collection: 'video-pages',
        data: videoData,
        draft: false,
      })
    }

    const videoResult = 'id' in video ? video : null

    return NextResponse.json({
      success: true,
      message: 'Video ingested successfully',
      video: videoResult ? {
        id: videoResult.id,
        title: videoResult.title,
      } : null,
    })
  } catch (error) {
    console.error('YouTube webhook error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
