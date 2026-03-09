/**
 * Simple in-memory rate limiter
 * Tracks requests per IP address
 */

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

const WINDOW_MS = 60000; // 1 minute
const MAX_REQUESTS = 5; // Max requests per window

export function rateLimit(ip: string): { success: boolean; remaining: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  // Clean up old entries
  if (entry && now > entry.resetAt) {
    rateLimitStore.delete(ip);
  }

  const current = rateLimitStore.get(ip);

  if (!current) {
    // New entry
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + WINDOW_MS,
    });
    return { success: true, remaining: MAX_REQUESTS - 1 };
  }

  if (current.count < MAX_REQUESTS) {
    current.count++;
    return { success: true, remaining: MAX_REQUESTS - current.count };
  }

  return { success: false, remaining: 0 };
}

export function getClientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";
  return ip;
}
