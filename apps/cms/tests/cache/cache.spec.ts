import { afterEach, describe, expect, it, vi } from 'vitest'
import { cacheGet, cacheInvalidatePattern, cacheSet } from '@/payload/utils/cache'

describe('cache utility', () => {
  afterEach(async () => {
    await cacheInvalidatePattern('.*')
  })

  it('stores and retrieves cached values across tiers', async () => {
    await cacheSet('site:demo:locale:en:type:settings', { flag: true }, 5000)
    const cached = await cacheGet<{ flag: boolean }>('site:demo:locale:en:type:settings')
    expect(cached).toEqual({ flag: true })
  })

  it('invalidates entries by pattern', async () => {
    await cacheSet('site:demo:locale:en:type:navigation', { items: 3 }, 5000)
    await cacheSet('site:demo:locale:en:type:settings', { flag: true }, 5000)

    const removed = await cacheInvalidatePattern('type:navigation')
    expect(removed).toBeGreaterThan(0)

    const nav = await cacheGet('site:demo:locale:en:type:navigation')
    const settings = await cacheGet('site:demo:locale:en:type:settings')
    expect(nav).toBeUndefined()
    expect(settings).toEqual({ flag: true })
  })

  it('expires entries after TTL', async () => {
    vi.useFakeTimers()
    await cacheSet('site:demo:locale:en:type:categories', { categories: ['one'] }, 300_000)
    vi.advanceTimersByTime(300_001)
    const cached = await cacheGet('site:demo:locale:en:type:categories')
    expect(cached).toBeUndefined()
    vi.useRealTimers()
  })
})
