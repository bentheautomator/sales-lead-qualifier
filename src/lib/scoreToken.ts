/**
 * Score Token — HMAC-signed cookie tokens for score results
 *
 * Prevents score spoofing by signing results server-side.
 * Token format: base64url(payload).base64url(HMAC-SHA256 signature)
 */

import { createHmac, timingSafeEqual } from "crypto";

const SIGNING_SECRET = process.env.SCORE_SIGNING_SECRET || "dev-only-not-for-production";

if (process.env.NODE_ENV === "production" && !process.env.SCORE_SIGNING_SECRET) {
  console.error(
    "[SECURITY] SCORE_SIGNING_SECRET is not set. Score tokens are signed with a weak default key.",
  );
}

export const SCORE_COOKIE_NAME = "score_token";
const TOKEN_TTL_MS = 3600000; // 1 hour

interface ScorePayload {
  totalScore: number;
  qualified: boolean;
  breakdown: Record<string, number>;
  exp: number;
}

export function getScoreCookieOptions(): {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
  maxAge: number;
} {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 3600,
  };
}

/**
 * Sign score data into an HMAC-verified token
 */
export function signScoreToken(payload: {
  totalScore: number;
  qualified: boolean;
  breakdown: Record<string, number>;
}): string {
  const fullPayload: ScorePayload = {
    ...payload,
    exp: Date.now() + TOKEN_TTL_MS,
  };

  const payloadStr = Buffer.from(JSON.stringify(fullPayload)).toString("base64url");
  const signature = createHmac("sha256", SIGNING_SECRET).update(payloadStr).digest("base64url");

  return `${payloadStr}.${signature}`;
}

/**
 * Verify and decode a signed score token
 * Returns null if signature is invalid or token is expired
 */
export function verifyScoreToken(token: string): Omit<ScorePayload, "exp"> | null {
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payloadStr, signature] = parts;

  // Recompute expected signature
  const expectedSignature = createHmac("sha256", SIGNING_SECRET)
    .update(payloadStr)
    .digest("base64url");

  // Timing-safe comparison
  const sigBuf = Buffer.from(signature);
  const expectedBuf = Buffer.from(expectedSignature);
  if (sigBuf.length !== expectedBuf.length) return null;
  if (!timingSafeEqual(sigBuf, expectedBuf)) return null;

  // Parse and validate payload
  try {
    const payload = JSON.parse(Buffer.from(payloadStr, "base64url").toString()) as ScorePayload;

    // Check expiry
    if (Date.now() > payload.exp) return null;

    // Validate shape
    if (
      typeof payload.totalScore !== "number" ||
      typeof payload.qualified !== "boolean" ||
      typeof payload.breakdown !== "object"
    ) {
      return null;
    }

    return {
      totalScore: payload.totalScore,
      qualified: payload.qualified,
      breakdown: payload.breakdown,
    };
  } catch {
    return null;
  }
}
