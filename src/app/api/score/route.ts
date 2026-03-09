/**
 * Server-side Score Calculation API
 * POST /api/score
 *
 * Validates answers server-side and calculates qualification score
 * Returns total score, qualification status, and dimension breakdown
 */

import { NextRequest, NextResponse } from "next/server";
import { calculateScore } from "@/lib/scoring";
import { qualificationConfig } from "@/config/qualification";
import { isValidAnswers } from "@/lib/validation";
import { signScoreToken, SCORE_COOKIE_NAME, getScoreCookieOptions } from "@/lib/scoreToken";
import type { DimensionScore } from "@/types";

/**
 * POST handler for score calculation
 * Request body: { answers: Record<string, string> }
 * Response: { totalScore: number, qualified: boolean, breakdown: Record<string, number> }
 */
export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          error: "Invalid request body",
          message: "Request body must be valid JSON",
        },
        { status: 400 },
      );
    }

    // Validate that body is an object
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json(
        {
          error: "Invalid request format",
          message: "Request body must be a JSON object",
        },
        { status: 400 },
      );
    }

    const { answers } = body as Record<string, unknown>;

    // Validate answers object
    if (!isValidAnswers(answers)) {
      return NextResponse.json(
        {
          error: "Invalid answers",
          message:
            "Answers must be a record of question IDs to string values. Each value must be less than 50 characters.",
        },
        { status: 400 },
      );
    }

    // Calculate score using the scoring engine
    const result = calculateScore(answers, qualificationConfig);

    // Transform breakdown from DimensionScore objects to percentages
    const breakdownPercentages: Record<string, number> = {};
    for (const [dimensionKey, dimensionScore] of Object.entries(result.breakdown)) {
      breakdownPercentages[dimensionKey] = (dimensionScore as DimensionScore).percentage;
    }

    // Sign score data into an HMAC-verified cookie
    const token = signScoreToken({
      totalScore: result.totalScore,
      qualified: result.qualified,
      breakdown: breakdownPercentages,
    });

    // Return full score data in response body + signed cookie for result page
    const response = NextResponse.json({
      totalScore: result.totalScore,
      qualified: result.qualified,
      breakdown: breakdownPercentages,
    });
    response.cookies.set(SCORE_COOKIE_NAME, token, getScoreCookieOptions());
    return response;
  } catch (error) {
    // Log error for debugging
    console.error("Score calculation error:", error);

    // Return generic error response
    return NextResponse.json(
      {
        error: "Internal server error",
        message: "An error occurred while calculating your score.",
      },
      { status: 500 },
    );
  }
}

/**
 * OPTIONS handler for CORS preflight
 * Allows cross-origin requests with appropriate headers
 */
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": request.headers.get("origin") || "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
