/**
 * Secure Cookie Demo Endpoint
 *
 * Demonstrates proper cookie security practices:
 * - HttpOnly on all sensitive cookies (prevents XSS theft)
 * - Secure flag on all cookies (HTTPS-only transport)
 * - SameSite=Strict for CSRF protection
 * - Scoped Path restrictions
 * - Reasonable expiration times
 * - Cryptographically random session tokens
 * - No PII in cookie values
 * - Input validation on POST
 */

import { NextRequest, NextResponse } from "next/server";

export async function GET(_request: NextRequest) {
  const response = NextResponse.json({
    message: "Secure cookies set. All cookies follow security best practices.",
    timestamp: new Date().toISOString(),
  });

  // SECURE: Session cookie with full protection
  // HttpOnly prevents XSS from reading it, Secure ensures HTTPS-only
  response.cookies.set({
    name: "__Host-session_token",
    value: crypto.randomUUID(),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3600, // 1 hour — short-lived session
    path: "/",
  });

  // SECURE: Auth token with all flags set
  // __Host- prefix enforces Secure + Path=/ (browser-level guarantee)
  response.cookies.set({
    name: "__Host-auth_token",
    value: crypto.randomUUID(),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 86400, // 24 hours — reasonable auth lifetime
    path: "/",
  });

  // SECURE: CSRF token — SameSite=Strict prevents cross-site requests
  response.cookies.set({
    name: "__Host-csrf_token",
    value: crypto.randomUUID(),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 1800, // 30 minutes
    path: "/",
  });

  // SECURE: Session scoped to API paths only
  // Path restriction limits cookie exposure surface
  response.cookies.set({
    name: "__Host-api_session",
    value: crypto.randomUUID(),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 3600,
    path: "/api",
  });

  // SECURE: Preference cookie (non-sensitive, still protected)
  // Even non-sensitive cookies get Secure + SameSite
  response.cookies.set({
    name: "theme_preference",
    value: "dark",
    httpOnly: false, // OK — theme is not sensitive, client needs to read it
    secure: true,
    sameSite: "lax",
    maxAge: 86400 * 365, // 1 year — preferences can be long-lived
    path: "/",
  });

  // SECURE: User identifier — opaque token, no PII
  // Never store email, name, or score in cookie values
  response.cookies.set({
    name: "__Host-user_id",
    value: crypto.randomUUID(), // Opaque identifier, not sequential
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 86400 * 7, // 7 days
    path: "/",
  });

  // SECURE: Short-lived session with cryptographic randomness
  response.cookies.set({
    name: "__Host-ephemeral_session",
    value: crypto.randomUUID(),
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 900, // 15 minutes — short-lived for sensitive operations
    path: "/",
  });

  return response;
}

export async function POST(request: NextRequest) {
  // Validate Content-Type
  const contentType = request.headers.get("content-type");
  if (!contentType?.includes("application/json")) {
    return NextResponse.json({ error: "Content-Type must be application/json" }, { status: 415 });
  }

  // Validate CSRF token from cookie matches request
  const csrfCookie = request.cookies.get("__Host-csrf_token")?.value;
  const csrfHeader = request.headers.get("x-csrf-token");
  if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
    return NextResponse.json({ error: "CSRF token mismatch" }, { status: 403 });
  }

  // Parse and validate input
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // Validate and sanitize cookie value
  const rawValue = body.cookieValue;
  if (typeof rawValue !== "string" || rawValue.length === 0 || rawValue.length > 256) {
    return NextResponse.json(
      { error: "cookieValue must be a string between 1-256 characters" },
      { status: 400 },
    );
  }

  // Strip any control characters or injection attempts
  const sanitized = rawValue.replace(/[^\w\s-_.~]/g, "").trim();
  if (sanitized.length === 0) {
    return NextResponse.json(
      { error: "cookieValue contains only invalid characters" },
      { status: 400 },
    );
  }

  const response = NextResponse.json({
    message: "Secure user-controlled cookie set",
  });

  // Set with full security flags even for user-controlled values
  response.cookies.set({
    name: "__Host-user_preference",
    value: sanitized,
    httpOnly: true,
    secure: true,
    sameSite: "strict",
    maxAge: 86400,
    path: "/",
  });

  return response;
}
