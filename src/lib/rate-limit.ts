import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = process.env.UPSTASH_REDIS_REST_URL
  ? new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    })
  : null

// Strict rate limit for signup and password reset (3 per hour)
export const strictRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(3, '1 h'),
      analytics: true,
      prefix: '@upstash/ratelimit/strict',
    })
  : null

// Auth rate limit for signin (5 per 10 minutes)
export const authRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/auth',
    })
  : null

// General API rate limit (100 per minute)
export const apiRateLimit = redis
  ? new Ratelimit({
      redis,
      limiter: Ratelimit.slidingWindow(100, '1 m'),
      analytics: true,
      prefix: '@upstash/ratelimit/api',
    })
  : null

/**
 * Check rate limit for a request
 * Returns { success: boolean, limit: number, remaining: number, reset: number }
 */
export async function checkRateLimit(
  identifier: string,
  type: 'strict' | 'auth' | 'api' = 'api'
) {
  const limiter =
    type === 'strict'
      ? strictRateLimit
      : type === 'auth'
      ? authRateLimit
      : apiRateLimit

  if (!limiter) {
    // If Redis not configured, allow all requests (dev mode)
    console.warn('Rate limiting not configured. Allowing all requests.')
    return {
      success: true,
      limit: 999999,
      remaining: 999999,
      reset: Date.now() + 60000,
    }
  }

  const { success, limit, remaining, reset } = await limiter.limit(identifier)

  return {
    success,
    limit,
    remaining,
    reset,
  }
}

/**
 * Get identifier from request (IP address or fallback)
 */
export function getIdentifier(request: Request): string {
  // Try to get real IP from headers (for proxies/load balancers)
  const forwardedFor = request.headers.get('x-forwarded-for')
  const realIp = request.headers.get('x-real-ip')

  const ip = forwardedFor?.split(',')[0] || realIp || 'anonymous'

  return ip
}
