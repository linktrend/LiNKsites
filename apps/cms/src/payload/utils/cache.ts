type CacheEntry<T> = {
  value: T
  expiresAt: number
}

const clampTtl = (ttlMs?: number): number => {
  const fallback = Number.parseInt(process.env.PAYLOAD_CACHE_TTL_MS || `${10 * 60 * 1000}`, 10)
  const min = 5 * 60 * 1000
  const max = 15 * 60 * 1000
  if (!Number.isFinite(ttlMs ?? NaN)) return Math.min(Math.max(fallback, min), max)
  return Math.min(Math.max(ttlMs as number, min), max)
}

class LRUCache<T> {
  private readonly capacity: number
  private readonly store: Map<string, CacheEntry<T>>
  private readonly defaultTtlMs: number

  constructor(capacity: number, defaultTtlMs: number) {
    this.capacity = Math.max(10, capacity)
    this.defaultTtlMs = defaultTtlMs
    this.store = new Map()
  }

  get(key: string): T | undefined {
    const entry = this.store.get(key)
    if (!entry) return undefined
    if (entry.expiresAt <= Date.now()) {
      this.store.delete(key)
      return undefined
    }
    // refresh recency
    this.store.delete(key)
    this.store.set(key, entry)
    return entry.value
  }

  set(key: string, value: T, ttlMs?: number): void {
    const resolvedTtl = clampTtl(ttlMs ?? this.defaultTtlMs)
    if (this.store.has(key)) {
      this.store.delete(key)
    }
    this.store.set(key, { value, expiresAt: Date.now() + resolvedTtl })
    if (this.store.size > this.capacity) {
      const oldestKey = this.store.keys().next().value
      if (oldestKey) {
        this.store.delete(oldestKey)
      }
    }
  }

  delete(key: string): void {
    this.store.delete(key)
  }

  deleteMatching(regex: RegExp): number {
    let removed = 0
    for (const key of this.store.keys()) {
      if (regex.test(key)) {
        this.store.delete(key)
        removed += 1
      }
    }
    return removed
  }
}

const memoryCapacity = Number.parseInt(process.env.PAYLOAD_CACHE_CAPACITY || '200', 10)
const memoryTtl = clampTtl()
const memoryCache = new LRUCache<unknown>(memoryCapacity, memoryTtl)

const getExternalStore = (): Map<string, CacheEntry<unknown>> => {
  const globalObj = globalThis as typeof globalThis & { __payloadExternalCache?: Map<string, CacheEntry<unknown>> }
  if (!globalObj.__payloadExternalCache) {
    globalObj.__payloadExternalCache = new Map()
  }
  return globalObj.__payloadExternalCache
}

const externalStore = getExternalStore()

const getPatternRegex = (pattern: string | RegExp): RegExp => {
  if (pattern instanceof RegExp) return pattern
  const escaped = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\\\*/g, '.*')
  return new RegExp(escaped)
}

/**
 * Two-tier cache getter. Memory LRU first, then external (Map fallback).
 */
export async function cacheGet<T = unknown>(key: string): Promise<T | undefined> {
  const fast = memoryCache.get(key)
  if (fast !== undefined) return fast as T

  const external = externalStore.get(key)
  if (!external) return undefined
  if (external.expiresAt <= Date.now()) {
    externalStore.delete(key)
    return undefined
  }

  memoryCache.set(key, external.value, external.expiresAt - Date.now())
  return external.value as T
}

/**
 * Two-tier cache setter. Writes through to both caches.
 */
export async function cacheSet<T = unknown>(key: string, data: T, ttlMs?: number): Promise<void> {
  const resolvedTtl = clampTtl(ttlMs)
  memoryCache.set(key, data, resolvedTtl)
  externalStore.set(key, { value: data, expiresAt: Date.now() + resolvedTtl })
}

/**
 * Invalidate keys matching the provided pattern across both caches.
 */
export async function cacheInvalidatePattern(pattern: string | RegExp): Promise<number> {
  const regex = getPatternRegex(pattern)
  let removed = memoryCache.deleteMatching(regex)

  for (const key of externalStore.keys()) {
    if (regex.test(key)) {
      externalStore.delete(key)
      removed += 1
    }
  }
  return removed
}

export const CacheKeys = {
  siteSettings: (site: string, locale: string) => `site:${site}:locale:${locale}:type:settings`,
  navigation: (site: string, locale: string) => `site:${site}:locale:${locale}:type:navigation`,
  categories: (site: string, locale: string) => `site:${site}:locale:${locale}:type:categories`,
  publishedList: (site: string, locale: string, collection: string, hash: string) =>
    `site:${site}:locale:${locale}:type:${collection}:hash:${hash}`,
}
