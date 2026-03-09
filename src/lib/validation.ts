/**
 * Input Validation Utilities
 * Pure functions for validating and sanitizing user input
 */

/**
 * Validate a breakdown object
 * Ensures it's a valid Record<string, number> with reasonable constraints
 */
export function isValidBreakdown(obj: unknown): obj is Record<string, number> {
  // Must be a non-null object
  if (obj === null || typeof obj !== "object" || Array.isArray(obj)) {
    return false;
  }

  const record = obj as Record<string, unknown>;

  // Max 10 keys
  if (Object.keys(record).length > 10) {
    return false;
  }

  // Validate each key-value pair
  for (const [key, value] of Object.entries(record)) {
    // Keys must match /^[a-z_]{1,20}$/
    if (!/^[a-z_]{1,20}$/.test(key)) {
      return false;
    }

    // Values must be numbers between 0 and 100
    if (typeof value !== "number" || value < 0 || value > 100) {
      return false;
    }
  }

  return true;
}

/**
 * Validate a score parameter
 * Must parse to integer 0-100
 */
export function isValidScore(value: string | null): boolean {
  if (!value) {
    return false;
  }

  const parsed = parseInt(value, 10);
  return !isNaN(parsed) && parsed >= 0 && parsed <= 100;
}

/**
 * Validate a qualified parameter
 * Must be "true" or "false"
 */
export function isValidQualified(value: string | null): boolean {
  return value === "true" || value === "false";
}

/**
 * Sanitize a string by removing HTML, trimming, and limiting length
 * @param input The input string to sanitize
 * @param maxLength Maximum allowed length (default 1000)
 * @returns Sanitized string
 */
export function sanitizeString(input: string, maxLength: number = 1000): string {
  if (typeof input !== "string") {
    return "";
  }

  // Remove HTML tags and entities
  let sanitized = input
    .replace(/<[^>]*>/g, "") // Remove HTML tags
    .replace(/&[a-z]+;/gi, "") // Remove HTML entities
    .trim();

  // Limit length
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength);
  }

  return sanitized;
}

/**
 * Validate answer values for API scoring
 * Answers should be a record of question IDs to string values
 */
export function isValidAnswers(answers: unknown): answers is Record<string, string> {
  // Must be a non-null object
  if (answers === null || typeof answers !== "object" || Array.isArray(answers)) {
    return false;
  }

  const record = answers as Record<string, unknown>;

  // Reasonable limit on number of answers (typical quiz has < 20 questions)
  if (Object.keys(record).length > 50) {
    return false;
  }

  // Validate each answer
  for (const [key, value] of Object.entries(record)) {
    // Keys should be question IDs (alphanumeric, hyphens, underscores)
    if (!/^[a-zA-Z0-9_-]+$/.test(key)) {
      return false;
    }

    // Values should be strings
    if (typeof value !== "string") {
      return false;
    }

    // Values should not be excessively long (option values are typically short)
    if (value.length > 50) {
      return false;
    }
  }

  return true;
}
