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

/**
 * Validate email format
 * Basic check for email validity
 */
export function isValidEmail(email: string): boolean {
  if (typeof email !== "string") {
    return false;
  }

  const sanitized = sanitizeString(email, 255);
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(sanitized) && sanitized.length >= 5;
}

/**
 * Validate phone number (optional, but if provided should be reasonable)
 * Accepts common formats
 */
export function isValidPhone(phone: string | null | undefined): boolean {
  if (!phone) {
    return true; // Phone is optional
  }

  if (typeof phone !== "string") {
    return false;
  }

  const sanitized = sanitizeString(phone, 20);
  const phoneRegex = /^[\d\s\-\+\(\)\.]+$/;
  return phoneRegex.test(sanitized) && sanitized.length >= 10;
}

/**
 * Validate booking form data
 */
export function isValidBookingData(data: unknown): data is {
  name: string;
  email: string;
  company: string;
  phone?: string;
  preferredTime: string;
} {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  const record = data as Record<string, unknown>;

  // Validate required fields
  if (typeof record.name !== "string" || !record.name.trim()) {
    return false;
  }

  if (typeof record.email !== "string" || !isValidEmail(record.email)) {
    return false;
  }

  if (typeof record.company !== "string" || !record.company.trim()) {
    return false;
  }

  if (
    typeof record.preferredTime !== "string" ||
    !["morning", "afternoon", "evening"].includes(record.preferredTime)
  ) {
    return false;
  }

  // Validate optional phone
  const phone = record.phone as string | undefined;
  if (phone && !isValidPhone(phone)) {
    return false;
  }

  return true;
}

/**
 * Validate guide signup form data
 */
export function isValidGuideData(data: unknown): data is {
  name: string;
  email: string;
  company?: string;
} {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return false;
  }

  const record = data as Record<string, unknown>;

  // Validate required fields
  if (typeof record.name !== "string" || !record.name.trim()) {
    return false;
  }

  if (typeof record.email !== "string" || !isValidEmail(record.email)) {
    return false;
  }

  // Validate optional company
  const company = record.company as string | undefined;
  if (company && (typeof company !== "string" || !company.trim())) {
    return false;
  }

  return true;
}
