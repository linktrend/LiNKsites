import { getPayload } from 'payload'
import config from '@payload-config'
import { NextResponse } from 'next/server'
import { hasPermission } from '@/utils/resolvePermissions'
import { PermissionFlag } from '@/utils/permissions'
import { syncSitePlaylists } from '@/utils/playlistSync'

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    
    // Get user from request (requires authentication)
    const { user } = await payload.auth({ headers: request.headers })
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user has permission to trigger sync
    if (!hasPermission(user, PermissionFlag.MANAGE_SITES)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      )
    }

    // Get site ID from request body
    const body = await request.json()
    const { siteId } = body

    if (!siteId) {
      return NextResponse.json(
        { error: 'Site ID is required' },
        { status: 400 }
      )
    }

    // Trigger sync
    const result = await syncSitePlaylists(siteId, payload)

    return NextResponse.json({
      success: result.success,
      message: 'YouTube sync completed',
      stats: {
        videosProcessed: result.videosProcessed,
        videosCreated: result.videosCreated,
        videosUpdated: result.videosUpdated,
        errors: result.errors,
      },
    })
  } catch (error) {
    console.error('YouTube sync API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
