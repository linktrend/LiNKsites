import type { CollectionAfterChangeHook, PayloadRequest } from 'payload'
import type { VideoPage } from '@/payload-types'
import type { WorkflowRequest } from '@/types/PayloadRequestExtended'
import { extractVideoId, fetchYouTubeVideoMetadata, parseDuration } from '@/utils/youtube'

export const videoIngestion: CollectionAfterChangeHook = async ({
  doc,
  req,
  operation,
}: {
  doc: VideoPage
  req: PayloadRequest
  operation: string
}): Promise<VideoPage> => {
  const workflowReq = req as WorkflowRequest
  // Only process if autoIngest is enabled and we have a YouTube ID
  if (!doc.autoIngest || !doc.youtubeId) {
    return doc
  }

  // Skip if metadata already fetched (check if we have duration)
  if (operation === 'update' && doc.duration) {
    return doc
  }

  try {
    // Get YouTube API key from site settings
    const siteValue = doc.site as string | number | { id?: unknown } | undefined
    const siteId =
      typeof siteValue === 'string' || typeof siteValue === 'number'
        ? siteValue
        : siteValue?.id
    const siteResult = await workflowReq.payload.findByID({
      collection: 'sites',
      id: siteId,
    } as unknown as Parameters<typeof workflowReq.payload.findByID>[0])
    const site = siteResult as { youtubeApiKey?: string } | null

    if (!site?.youtubeApiKey) {
      console.error('YouTube API key not configured for site')
      return doc
    }

    // Extract video ID if a URL was provided
    const videoId = extractVideoId(doc.youtubeId) || doc.youtubeId

    // Fetch metadata from YouTube
    const metadata = await fetchYouTubeVideoMetadata(videoId, site.youtubeApiKey)

    if (!metadata) {
      console.error('Failed to fetch YouTube metadata for video:', videoId)
      return doc
    }

    // Update document with fetched metadata
    const updatedDoc = (await workflowReq.payload.update({
      collection: 'video-pages',
      id: doc.id,
      data: {
        title: metadata.title,
        description: metadata.description,
        thumbnail: metadata.thumbnail,
        duration: parseDuration(metadata.duration),
        publishedAt: metadata.publishedAt,
        tags: metadata.tags,
        youtubeId: videoId,
      },
    } as unknown as Parameters<typeof workflowReq.payload.update>[0])) as VideoPage

    return updatedDoc
  } catch (error) {
    console.error('Video ingestion error:', error)
    return doc
  }
}
