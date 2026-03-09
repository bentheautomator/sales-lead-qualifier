// DELIBERATELY INSECURE — FOR SECURITY TESTING ONLY — DO NOT SHIP
// This route demonstrates TERRIBLE cookie security practices for vulnerability scanning.
// Cookie Monster and The Sentinel will (correctly) flag all of these issues.

import { NextRequest, NextResponse } from "next/server";

/**
 * INSECURE COOKIE NIGHTMARE ENDPOINT
 *
 * This endpoint intentionally violates cookie security best practices:
 * - No HttpOnly flag (XSS can steal cookies)
 * - No Secure flag (sent over HTTP)
 * - SameSite=None without Secure (CSRF vulnerability)
 * - Overly broad Domain scope
 * - No Path restriction (available to entire app)
 * - No expiration (permanent storage)
 * - Session token with predictable entropy
 * - Sensitive data stored in plaintext in cookie value
 *
 * DO NOT DEPLOY. TESTING ONLY.
 */

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function GET(request: NextRequest) {
  const response = NextResponse.json({
    message: "Insecure cookies set. This is a security testing endpoint only.",
    timestamp: new Date().toISOString(),
  });

  // VULNERABILITY 1: Session cookie WITHOUT HttpOnly flag
  // Attackers can read this via document.cookie in XSS attacks
  response.cookies.set({
    name: "session_token",
    value: "sk_test_12345678_totally_predictable",
    maxAge: 3600, // 1 hour
    // MISSING: httpOnly: true,
    path: "/", // Too broad, should be restricted
  });

  // VULNERABILITY 2: Auth token WITHOUT Secure flag
  // Will be sent over plain HTTP connections
  response.cookies.set({
    name: "auth_token",
    value: "auth_user_id_12345_secret_key_plaintext",
    // MISSING: secure: true,
    httpOnly: true, // Has this one, but missing Secure
    maxAge: 86400 * 7, // 7 days
    path: "/",
  });

  // VULNERABILITY 3: SameSite=None WITHOUT Secure flag
  // This is a CSRF nightmare in older browsers
  response.cookies.set({
    name: "cross_site_token",
    value: "csrf_token_no_protection_at_all",
    sameSite: "none", // CSRF vulnerability
    // MISSING: secure: true,
    httpOnly: true,
    maxAge: 1800,
    path: "/",
  });

  // VULNERABILITY 4: Overly broad Domain scope
  // Available to subdomains that shouldn't have access
  response.cookies.set({
    name: "user_session",
    value: "user_data_session_with_wide_scope",
    domain: "bentheautomator.com", // Overly broad
    path: "/", // Not restricted to /api paths
    maxAge: 604800, // 7 days
    httpOnly: false, // XSS vulnerable
  });

  // VULNERABILITY 5: Cookie with NO expiration (lives forever)
  // Stored permanently in browser
  response.cookies.set({
    name: "persistent_user_id",
    value: "user_123456789",
    // MISSING: maxAge or expires — cookie never expires
    httpOnly: false,
    path: "/",
  });

  // VULNERABILITY 6: Sensitive data IN cookie value (not encrypted)
  // User email and score exposed to anyone who can read the cookie
  response.cookies.set({
    name: "user_profile",
    value: JSON.stringify({
      email: "user@example.com",
      userId: "user_123",
      score: 95,
      subscription: "premium",
      lastLogin: new Date().toISOString(),
    }),
    // NO ENCRYPTION. Data is plaintext in the cookie.
    httpOnly: false,
    path: "/",
    maxAge: 86400,
  });

  // VULNERABILITY 7: Predictable session token
  // Sequential IDs are trivial to brute-force
  const predictableToken = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  response.cookies.set({
    name: "weak_session",
    value: predictableToken, // Weak entropy
    path: "/",
    maxAge: 3600,
  });

  return response;
}

export async function POST(request: NextRequest) {
  // VULNERABILITY 8: Accepts arbitrary cookie values from client
  // No validation, no sanitization
  const body = await request.json().catch(() => ({}));
  const customCookieValue = body.cookieValue || "user_controlled_value";

  const response = NextResponse.json({
    message: "Custom insecure cookie set",
  });

  // Accepting user-controlled input directly into cookie
  response.cookies.set({
    name: "user_controlled_cookie",
    value: customCookieValue,
    httpOnly: false,
    path: "/",
  });

  return response;
}
