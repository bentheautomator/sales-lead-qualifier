/**
 * Server-side Score Result API
 * GET /api/result
 *
 * Reads and verifies the signed score cookie set by /api/score.
 * Returns score data only if the HMAC signature is valid and token is not expired.
 */

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { verifyScoreToken, SCORE_COOKIE_NAME } from "@/lib/scoreToken";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SCORE_COOKIE_NAME)?.value;

  if (!token) {
    return NextResponse.json({ error: "No score data found" }, { status: 404 });
  }

  const payload = verifyScoreToken(token);

  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired score data" }, { status: 403 });
  }

  return NextResponse.json({
    totalScore: payload.totalScore,
    qualified: payload.qualified,
    breakdown: payload.breakdown,
  });
}
