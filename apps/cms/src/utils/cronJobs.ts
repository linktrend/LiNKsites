import type { Payload } from 'payload'
import { syncSitePlaylists } from './playlistSync'

const jobTimers = new Map<string, NodeJS.Timeout>()

export interface CronJobConfig {
  name: string
  schedule: string
  handler: (payload: Payload) => Promise<void>
}

/**
 * YouTube sync cron job handler
 */
export async function youtubeSync(payload: Payload): Promise<void> {
  console.log('Starting YouTube sync cron job...')

  try {
    // Find all sites with auto-sync enabled
    const sites = await payload.find({
      collection: 'sites',
      where: {
        autoSyncEnabled: { equals: true },
      },
    })

    console.log(`Found ${sites.docs.length} sites with auto-sync enabled`)

    for (const site of sites.docs) {
      console.log(`Syncing playlists for site: ${site.name}`)
      
      const result = await syncSitePlaylists(String(site.id), payload)
      
      console.log(`Sync completed for ${site.name}:`, {
        processed: result.videosProcessed,
        created: result.videosCreated,
        updated: result.videosUpdated,
        errors: result.errors.length,
      })

      if (result.errors.length > 0) {
        console.error(`Errors during sync for ${site.name}:`, result.errors)
      }
    }

    console.log('YouTube sync cron job completed')
  } catch (error) {
    console.error('YouTube sync cron job failed:', error)
  }
}

/**
 * Register all cron jobs
 */
export function registerCronJobs(payload: Payload): void {
  const youtubeSyncJob: CronJobConfig = {
    name: 'youtube-sync',
    schedule: '0 */6 * * *',
    handler: youtubeSync,
  }

  scheduleJob(youtubeSyncJob, payload)
}

function scheduleJob(job: CronJobConfig, payload: Payload): void {
  const interval = cronPatternToMs(job.schedule)

  if (!interval) {
    console.warn(
      `Unable to schedule cron job "${job.name}" due to unsupported pattern: ${job.schedule}`,
    )
    return
  }

  if (jobTimers.has(job.name)) {
    clearInterval(jobTimers.get(job.name) as NodeJS.Timeout)
  }

  const executeJob = async (): Promise<void> => {
    try {
      await job.handler(payload)
    } catch (error) {
      console.error(`Cron job "${job.name}" failed:`, error)
    }
  }

  void executeJob()

  const timer = setInterval(() => {
    void executeJob()
  }, interval)

  jobTimers.set(job.name, timer)

  const intervalLabel =
    interval % 3600000 === 0
      ? `${interval / 3600000}h`
      : `${interval / 60000}m`

  console.log(
    `Cron job "${job.name}" scheduled to run every ${intervalLabel}`,
  )
}

function cronPatternToMs(pattern: string): number | null {
  const parts = pattern.trim().split(/\s+/)

  if (parts.length !== 5) {
    return null
  }

  const [minute, hour] = parts
  if (!minute || !hour) {
    return null
  }

  if (minute.startsWith('*/') && hour === '*') {
    const minutes = Number(minute.slice(2))
    return Number.isFinite(minutes) && minutes > 0 ? minutes * 60000 : null
  }

  if (minute === '0' && hour.startsWith('*/')) {
    const hours = Number(hour.slice(2))
    return Number.isFinite(hours) && hours > 0 ? hours * 3600000 : null
  }

  if (minute === '0' && hour === '*') {
    return 3600000
  }

  if (minute === '0' && hour === '0') {
    return 86400000
  }

  return null
}

/**
 * Manual trigger for YouTube sync
 */
export async function triggerYouTubeSync(
  payload: Payload,
  siteId?: string,
): Promise<void> {
  if (siteId) {
    console.log(`Manually triggering YouTube sync for site: ${siteId}`)
    await syncSitePlaylists(siteId, payload)
  } else {
    console.log('Manually triggering YouTube sync for all sites')
    await youtubeSync(payload)
  }
}
