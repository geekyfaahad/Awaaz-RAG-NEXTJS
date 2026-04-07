/**
 * Simple in-memory cache with TTL.
 * Prevents redundant AI calls for trending data.
 * For multi-instance: swap to Upstash Redis.
 */

interface CacheEntry<T> {
  data: T
  expiresAt: number
  createdAt: number
}

const store = new Map<string, CacheEntry<unknown>>()

/**
 * Get a cached value. Returns null if expired or not found.
 */
export function getCache<T>(key: string): T | null {
  const entry = store.get(key)
  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    store.delete(key)
    return null
  }

  return entry.data as T
}

/**
 * Set a cache value with a TTL in milliseconds.
 */
export function setCache<T>(key: string, data: T, ttlMs: number): void {
  store.set(key, {
    data,
    expiresAt: Date.now() + ttlMs,
    createdAt: Date.now(),
  })
}

/**
 * Invalidate a specific cache key.
 */
export function invalidateCache(key: string): boolean {
  return store.delete(key)
}

/**
 * Get cache age in seconds (for debugging/headers).
 */
export function getCacheAge(key: string): number | null {
  const entry = store.get(key)
  if (!entry) return null
  return Math.floor((Date.now() - entry.createdAt) / 1000)
}

/** Common TTLs */
export const TTL = {
  TRENDING: 10 * 60 * 1000,    // 10 minutes — news updates slowly
  VERIFICATION: 30 * 60 * 1000, // 30 minutes — same claim, same answer
} as const
