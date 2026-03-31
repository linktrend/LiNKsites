export interface YouTubeVideoMetadata {
  id: string
  title: string
  description: string
  thumbnail: string
  duration: string
  publishedAt: string
  channelId: string
  channelTitle: string
  tags?: string[]
  viewCount?: number
  likeCount?: number
}

export interface YouTubePlaylistItem {
  videoId: string
  title: string
  description: string
  thumbnail: string
  position: number
  publishedAt: string
}

/**
 * Fetch video metadata from YouTube Data API v3
 */
export async function fetchYouTubeVideoMetadata(
  videoId: string,
  apiKey: string,
): Promise<YouTubeVideoMetadata | null> {
  try {
    const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails,statistics&key=${apiKey}`
    
    const response = await fetch(url)
    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const video = data.items[0]
    const snippet = video.snippet
    const contentDetails = video.contentDetails
    const statistics = video.statistics

    return {
      id: videoId,
      title: snippet.title,
      description: snippet.description,
      thumbnail: snippet.thumbnails?.maxres?.url || snippet.thumbnails?.high?.url || '',
      duration: contentDetails.duration,
      publishedAt: snippet.publishedAt,
      channelId: snippet.channelId,
      channelTitle: snippet.channelTitle,
      tags: snippet.tags || [],
      viewCount: parseInt(statistics?.viewCount || '0'),
      likeCount: parseInt(statistics?.likeCount || '0'),
    }
  } catch (error) {
    console.error('Error fetching YouTube video metadata:', error)
    return null
  }
}

/**
 * Fetch all videos from a YouTube playlist
 */
export async function fetchPlaylistVideos(
  playlistId: string,
  apiKey: string,
  maxResults: number = 50,
): Promise<YouTubePlaylistItem[]> {
  try {
    const videos: YouTubePlaylistItem[] = []
    let pageToken = ''

    type PlaylistItemResponse = {
      snippet: {
        resourceId: { videoId: string }
        title: string
        description: string
        thumbnails?: { high?: { url?: string } }
        position: number
        publishedAt: string
      }
    }

    do {
      const url = `https://www.googleapis.com/youtube/v3/playlistItems?playlistId=${playlistId}&part=snippet&maxResults=${maxResults}&pageToken=${pageToken}&key=${apiKey}`
      
      const response = await fetch(url)
      const data = await response.json()

      if (Array.isArray(data.items)) {
        ;(data.items as PlaylistItemResponse[]).forEach((item) => {
          videos.push({
            videoId: item.snippet.resourceId.videoId,
            title: item.snippet.title,
            description: item.snippet.description,
            thumbnail: item.snippet.thumbnails?.high?.url || '',
            position: item.snippet.position,
            publishedAt: item.snippet.publishedAt,
          })
        })
      }

      pageToken = data.nextPageToken || ''
    } while (pageToken)

    return videos
  } catch (error) {
    console.error('Error fetching playlist videos:', error)
    return []
  }
}

/**
 * Fetch all videos from a YouTube channel
 */
export async function fetchChannelVideos(
  channelId: string,
  apiKey: string,
  maxResults: number = 50,
): Promise<YouTubePlaylistItem[]> {
  try {
    // First, get the channel's uploads playlist ID
    const channelUrl = `https://www.googleapis.com/youtube/v3/channels?id=${channelId}&part=contentDetails&key=${apiKey}`
    const channelResponse = await fetch(channelUrl)
    const channelData = await channelResponse.json()

    if (!channelData.items || channelData.items.length === 0) {
      return []
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads

    // Fetch videos from uploads playlist
    return await fetchPlaylistVideos(uploadsPlaylistId, apiKey, maxResults)
  } catch (error) {
    console.error('Error fetching channel videos:', error)
    return []
  }
}

/**
 * Parse YouTube video ID from various URL formats
 */
export function extractVideoId(url: string): string | null {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      const [, videoId] = match
      if (videoId) {
        return videoId
      }
    }
  }

  return null
}

/**
 * Convert ISO 8601 duration to seconds
 */
export function parseDuration(duration: string): number {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/)
  if (!match) return 0

  const hours = parseInt(match[1]?.replace('H', '') || '0')
  const minutes = parseInt(match[2]?.replace('M', '') || '0')
  const seconds = parseInt(match[3]?.replace('S', '') || '0')

  return hours * 3600 + minutes * 60 + seconds
}

/**
 * Format duration in seconds to readable format (HH:MM:SS or MM:SS)
 */
export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`
}
