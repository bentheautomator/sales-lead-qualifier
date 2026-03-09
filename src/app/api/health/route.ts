import { NextResponse } from "next/server";

/**
 * Health Check Endpoint
 * GET /api/health
 * Returns application status and version information
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "0.1.0",
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    },
  );
}
