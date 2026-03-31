import type { Payload } from 'payload'
import { fetchPlaylistVideos, fetchYouTubeVideoMetadata, parseDuration } from '@/utils/youtube'

export interface PlaylistSyncResult {
  success: boolean
  videosProcessed: number
  videosCreated: number
  videosUpdated: number
  errors: string[]
}

/**
 * Sync a YouTube playlist to VideoPage collection
 */
export async function syncPlaylist(
  playlistId: string,
  siteId: string,
  categoryId: string | null,
  payload: Payload,
  apiKey: string,
  locale: string,
): Promise<PlaylistSyncResult> {
  const siteIdValue = Number(siteId)
  const categoryValue = categoryId ? Number(categoryId) : undefined
  const result: PlaylistSyncResult = {
    success: true,
    videosProcessed: 0,
    videosCreated: 0,
    videosUpdated: 0,
    errors: [],
  }

  try {
    // Fetch all videos from playlist
    const playlistVideos = await fetchPlaylistVideos(playlistId, apiKey)

    for (const video of playlistVideos) {
      result.videosProcessed++

      try {
        // Fetch detailed metadata
        const metadata = await fetchYouTubeVideoMetadata(video.videoId, apiKey)
        if (!metadata) {
          result.errors.push(`Failed to fetch metadata for video: ${video.videoId}`)
          continue
        }

        // Check if video already exists
        const existing = await payload.find({
          collection: 'video-pages',
          where: {
            and: [
              { youtubeId: { equals: video.videoId } },
              { site: { equals: siteIdValue } },
              { locale: { equals: locale } },
            ],
          },
          limit: 1,
        })

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
          category: categoryValue,
          tags: metadata.tags || [],
          viewCount: metadata.viewCount,
          autoIngested: true,
          status: 'published' as const,
          approvalStatus: 'approved' as const,
        }

        const existingDoc = existing.docs[0] as { id?: string } | undefined

        if (existing.docs.length > 0 && existingDoc?.id) {
          // Update existing video
          await payload.update({
            collection: 'video-pages',
            id: existingDoc.id,
            data: videoData,
            draft: false,
          })
          result.videosUpdated++
        } else {
          // Create new video page
          await payload.create({
            collection: 'video-pages',
            data: videoData,
            draft: false,
          })
          result.videosCreated++
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        result.errors.push(`Error processing video ${video.videoId}: ${errorMessage}`)
      }
    }
  } catch (error) {
    result.success = false
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    result.errors.push(`Playlist sync failed: ${errorMessage}`)
  }

  return result
}

/**
 * Sync all playlists for a site
 */
export async function syncSitePlaylists(
  siteId: string,
  payload: Payload,
): Promise<PlaylistSyncResult> {
  const aggregateResult: PlaylistSyncResult = {
    success: true,
    videosProcessed: 0,
    videosCreated: 0,
    videosUpdated: 0,
    errors: [],
  }

  try {
    // Fetch site configuration
    const site = await payload.findByID({
      collection: 'sites',
      id: siteId,
      depth: 2,
    })

    if (!site.youtubeApiKey) {
      aggregateResult.success = false
      aggregateResult.errors.push('YouTube API key not configured for site')
      return aggregateResult
    }

    if (!site.youtubePlaylistIds || site.youtubePlaylistIds.length === 0) {
      aggregateResult.errors.push('No playlists configured for site')
      return aggregateResult
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

    // Sync each playlist
    for (const playlistItem of site.youtubePlaylistIds) {
      const playlistId = typeof playlistItem === 'string' ? playlistItem : playlistItem.playlistId
      const result = await syncPlaylist(
        playlistId,
        siteId,
        site.defaultVideoCategory ? String(site.defaultVideoCategory) : null,
        payload,
        site.youtubeApiKey,
        locale,
      )

      aggregateResult.videosProcessed += result.videosProcessed
      aggregateResult.videosCreated += result.videosCreated
      aggregateResult.videosUpdated += result.videosUpdated
      aggregateResult.errors.push(...result.errors)

      if (!result.success) {
        aggregateResult.success = false
      }
    }

    // Update last synced timestamp
    await payload.update({
      collection: 'sites',
      id: siteId,
      data: {
        lastSyncedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    aggregateResult.success = false
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    aggregateResult.errors.push(`Site playlist sync failed: ${errorMessage}`)
  }

  return aggregateResult
}
