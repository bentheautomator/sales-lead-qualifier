/**
 * URL Query Parameter Utilities
 * Helpers for encoding/decoding result page parameters
 */

export const RESULT_PARAMS = {
  SCORE: "score",
  QUALIFIED: "qualified",
  BREAKDOWN: "breakdown",
} as const;

/**
 * Create a result page URL with encoded parameters
 *
 * @param score - The total qualification score (0-100)
 * @param qualified - Whether the lead is qualified
 * @param breakdown - Object with dimension scores as percentages
 * @returns Full URL path for the result page
 */
export function createResultUrl(
  score: number,
  qualified: boolean,
  breakdown: Record<string, number>,
): string {
  const params = new URLSearchParams({
    [RESULT_PARAMS.SCORE]: String(score),
    [RESULT_PARAMS.QUALIFIED]: String(qualified),
    [RESULT_PARAMS.BREAKDOWN]: JSON.stringify(breakdown),
  });

  return `/result?${params.toString()}`;
}

/**
 * Parse result page query parameters
 *
 * @param searchParams - URLSearchParams or object with query parameters
 * @returns Parsed result data or null if parameters are missing/invalid
 */
export function parseResultParams(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams,
): {
  score: number;
  qualified: boolean;
  breakdown: Record<string, number>;
} | null {
  try {
    // Handle both URLSearchParams and plain object
    let scoreStr: string | null = null;
    let qualifiedStr: string | null = null;
    let breakdownStr: string | null = null;

    if (searchParams instanceof URLSearchParams) {
      scoreStr = searchParams.get(RESULT_PARAMS.SCORE);
      qualifiedStr = searchParams.get(RESULT_PARAMS.QUALIFIED);
      breakdownStr = searchParams.get(RESULT_PARAMS.BREAKDOWN);
    } else {
      const scoreVal = searchParams[RESULT_PARAMS.SCORE];
      const qualifiedVal = searchParams[RESULT_PARAMS.QUALIFIED];
      const breakdownVal = searchParams[RESULT_PARAMS.BREAKDOWN];

      scoreStr = Array.isArray(scoreVal) ? scoreVal[0] : scoreVal || null;
      qualifiedStr = Array.isArray(qualifiedVal) ? qualifiedVal[0] : qualifiedVal || null;
      breakdownStr = Array.isArray(breakdownVal) ? breakdownVal[0] : breakdownVal || null;
    }

    // Validate required parameters
    if (!scoreStr || !qualifiedStr || !breakdownStr) {
      return null;
    }

    // Parse score
    const score = parseFloat(scoreStr);
    if (isNaN(score) || score < 0 || score > 100) {
      return null;
    }

    // Parse qualified
    const qualified = qualifiedStr === "true";

    // Parse breakdown
    const breakdown = JSON.parse(breakdownStr);
    if (typeof breakdown !== "object" || breakdown === null) {
      return null;
    }

    return { score, qualified, breakdown };
  } catch (error) {
    console.error("Failed to parse result parameters:", error);
    return null;
  }
}
