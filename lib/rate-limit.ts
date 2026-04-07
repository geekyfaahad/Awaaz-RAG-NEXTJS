/**
 * In-memory sliding-window rate limiter.
 * Works for single-instance deployments (Vercel, Node).
 * For multi-instance, swap to Redis-based (Upstash).
 */

interface RateLimitEntry {
  timestamps: number[]
}

const store = new Map<string, RateLimitEntry>()

// Cleanup stale entries every 5 minutes
const CLEANUP_INTERVAL = 5 * 60 * 1000
let lastCleanup = Date.now()

function cleanup(windowMs: number) {
  const now = Date.now()
  if (now - lastCleanup < CLEANUP_INTERVAL) return
  lastCleanup = now

  const cutoff = now - windowMs
  for (const [key, entry] of store.entries()) {
    entry.timestamps = entry.timestamps.filter(t => t > cutoff)
    if (entry.timestamps.length === 0) {
      store.delete(key)
    }
  }
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetInMs: number
}

/**
 * Check if a request is within the rate limit.
 * @param key - Unique identifier (usually IP address)
 * @param windowMs - Time window in milliseconds
 * @param maxRequests - Maximum requests allowed in the window
 */
export function checkRateLimit(
  key: string,
  windowMs: number = 60_000,
  maxRequests: number = 10
): RateLimitResult {
  cleanup(windowMs)

  const now = Date.now()
  const windowStart = now - windowMs

  const entry = store.get(key) || { timestamps: [] }
  entry.timestamps = entry.timestamps.filter(t => t > windowStart)

  if (entry.timestamps.length >= maxRequests) {
    const oldestInWindow = entry.timestamps[0]
    return {
      allowed: false,
      remaining: 0,
      resetInMs: oldestInWindow + windowMs - now,
    }
  }

  entry.timestamps.push(now)
  store.set(key, entry)

  return {
    allowed: true,
    remaining: maxRequests - entry.timestamps.length,
    resetInMs: windowMs,
  }
}

/**
 * Extract client IP from Next.js request headers.
 */
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for")
  const realIp = req.headers.get("x-real-ip")
  return forwarded?.split(",")[0]?.trim() || realIp || "unknown"
}
