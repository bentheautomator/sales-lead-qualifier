/**
 * Next.js Middleware for Security
 * Adds request IDs, security headers, and rate limiting
 */

import { NextRequest, NextResponse } from "next/server";
// Note: crypto.randomUUID is available in Edge runtime

// In-memory rate limiting store
// IP address -> array of request timestamps
const rateLimitStore = new Map<string, number[]>();

// Configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_MAX_REQUESTS = 20; // Max 20 requests per hour

/**
 * Get client IP address from request
 */
function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0] : "unknown";
  return ip.trim();
}

/**
 * Check rate limit for an IP address
 * Returns true if request should be allowed, false if rate limited
 */
function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  let timestamps = rateLimitStore.get(ip) || [];

  // Remove timestamps outside the window
  timestamps = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);

  // Check if limit exceeded
  if (timestamps.length >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  // Add current timestamp
  timestamps.push(now);
  rateLimitStore.set(ip, timestamps);

  return true;
}

/**
 * Clean up old entries periodically (runs every hour)
 */
function cleanupRateLimitStore() {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitStore.entries()) {
    const filtered = timestamps.filter((ts) => now - ts < RATE_LIMIT_WINDOW_MS);
    if (filtered.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, filtered);
    }
  }
}

// Run cleanup every hour
if (typeof setInterval !== "undefined") {
  setInterval(cleanupRateLimitStore, 60 * 60 * 1000);
}

export function middleware(request: NextRequest) {
  // Generate unique request ID
  const requestId = crypto.randomUUID();

  // Create a response with security headers as fallback
  const response = NextResponse.next();

  // Add request ID header
  response.headers.set("X-Request-ID", requestId);

  // Add security headers (fallback, also in next.config.ts)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // Apply rate limiting to API routes only
  if (request.nextUrl.pathname.startsWith("/api/")) {
    const clientIp = getClientIp(request);

    if (!checkRateLimit(clientIp)) {
      return new NextResponse(
        JSON.stringify({
          error: "Too many requests",
          message: "Rate limit exceeded. Please try again later.",
        }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": requestId,
            "Retry-After": "3600",
          },
        },
      );
    }
  }

  return response;
}

// Configure which routes the middleware applies to
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
