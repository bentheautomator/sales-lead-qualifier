# Security Hardening Implementation

## Overview

Comprehensive security hardening has been added to the Sales Lead Qualifier application. This document summarizes all security enhancements implemented.

## Implementation Summary

### 1. Security Headers (next.config.ts)

**File**: `next.config.ts`

Added `headers()` function with the following security headers on all routes:

- **Content-Security-Policy**: Restricts resource loading to same-origin with limited inline scripts/styles
- **X-Content-Type-Options: nosniff**: Prevents MIME type sniffing attacks
- **X-Frame-Options: DENY**: Prevents clickjacking by disallowing iframe embedding
- **X-XSS-Protection**: Enables browser XSS filtering
- **Referrer-Policy**: Controls information leaked in referer header
- **Permissions-Policy**: Disables camera, microphone, geolocation sensors
- **Strict-Transport-Security**: Enforces HTTPS with 1-year max age and subdomains

### 2. Request Middleware (src/middleware.ts)

**File**: `src/middleware.ts` (NEW)

Implements security at the middleware layer:

- **Request ID Generation**: Every request gets a unique UUID for tracking and logging
- **Rate Limiting**: In-memory store tracking requests by client IP
  - Max 20 form submissions per IP per hour for `/api/*` routes
  - Returns HTTP 429 (Too Many Requests) when exceeded
  - Includes automatic cleanup of expired entries
- **Fallback Security Headers**: Additional fallback security headers
- **Route Matcher**: Applies to all routes except static assets

### 3. Input Validation Utilities (src/lib/validation.ts)

**File**: `src/lib/validation.ts` (NEW)

Pure validation functions for input sanitization:

#### `isValidBreakdown(obj)`

- Validates breakdown object structure
- Max 10 keys
- Keys must match `/^[a-z_]{1,20}$/` (lowercase letters and underscores only)
- Values must be numbers between 0-100

#### `isValidScore(value)`

- Validates score parameter
- Must parse to integer between 0-100

#### `isValidQualified(value)`

- Validates qualified parameter
- Must be exactly "true" or "false"

#### `sanitizeString(input, maxLength)`

- Removes HTML tags and entities
- Trims whitespace
- Limits length (default 1000 chars)
- Returns empty string for non-string input

#### `isValidAnswers(answers)`

- Validates answers object for API
- Max 50 answers (typical quiz < 20 questions)
- Keys must be alphanumeric with hyphens/underscores
- Values must be strings under 50 characters

### 4. Server-Side Score Calculation API (src/app/api/score/route.ts)

**File**: `src/app/api/score/route.ts` (NEW)

New API endpoint for server-side score calculation:

**Endpoint**: `POST /api/score`

**Request**:

```json
{
  "answers": {
    "question-id-1": "answer-value",
    "question-id-2": "answer-value"
  }
}
```

**Response (200 OK)**:

```json
{
  "totalScore": 75,
  "qualified": true,
  "breakdown": {
    "budget": 80,
    "authority": 70,
    "need": 85,
    "timeline": 60
  }
}
```

**Error Responses**:

- `400 Bad Request`: Invalid JSON or invalid answers format
- `429 Too Many Requests`: Rate limit exceeded (from middleware)
- `500 Internal Server Error`: Server-side calculation error

**Features**:

- Input validation using `isValidAnswers()`
- Server-side score calculation (eliminates client-side logic abuse)
- Transforms breakdown from percentage objects to simple percentages
- Proper error handling and logging
- CORS support via OPTIONS handler

### 5. Result Page Validation (src/app/result/page.tsx)

**File**: `src/app/result/page.tsx` (UPDATED)

Enhanced with comprehensive input validation:

- **Score validation**: Uses `isValidScore()` before parsing
- **Qualified validation**: Uses `isValidQualified()`
- **Breakdown validation**: Uses `isValidBreakdown()` with strict parsing
- **Redirect on validation failure**: Redirects to "/" if any validation fails
- **Explicit error handling**: Try-catch block for JSON parsing with validation

All three parameters must pass validation, or the page redirects to home.

## Security Vulnerabilities Addressed

### 1. Unvalidated URL Parameters

**Before**: Result page accepted score, qualified, breakdown without validation
**After**: All parameters validated with type-safe functions; invalid values cause redirect

### 2. Client-Side Scoring Abuse

**Before**: Scoring was entirely client-side, anyone could craft arbitrary results
**After**: New `/api/score` endpoint provides server-side scoring (client can still score locally for UX, but server is authoritative)

### 3. Missing Security Headers

**Before**: No security headers configured
**After**: Comprehensive headers prevent XSS, clickjacking, MIME sniffing

### 4. No Rate Limiting

**Before**: No protection against brute force or DoS attacks
**After**: Middleware enforces 20 requests/hour per IP on API routes

### 5. No Request Tracking

**Before**: Requests had no unique identifiers for logging/debugging
**After**: Each request gets X-Request-ID header for full audit trail

## Implementation Notes

### No External Dependencies

All validation is implemented by hand without external packages:

- No zod, no dompurify, no helmet
- Pure TypeScript functions
- Zero additional npm dependencies

### Existing Functionality Preserved

- All existing tests should pass
- Scoring logic unchanged
- Types and configuration unchanged
- Result page UI/UX unchanged

### Rate Limiting Scope

- Only applies to `/api/*` routes
- In-memory implementation (suitable for single server; use Redis in distributed systems)
- Automatically cleans up expired entries every hour

### Validation Strategy

- Type-safe functions with TypeScript type guards
- Consistent validation across client and server
- Redirects (not errors) for invalid data to provide good UX
- Server-side validation prevents bypass via local modification

## Testing Recommendations

### Unit Tests

```typescript
// Validation functions
expect(isValidScore("50")).toBe(true);
expect(isValidScore("150")).toBe(false);
expect(isValidScore(null)).toBe(false);
expect(isValidBreakdown({ budget: 80, authority: 70 })).toBe(true);
expect(isValidBreakdown({ BUDGET: 80 })).toBe(false); // uppercase
```

### Integration Tests

```typescript
// Result page
- Valid params should render results
- Invalid score should redirect
- Invalid qualified should redirect
- Invalid breakdown should redirect

// API endpoint
- Valid answers should return 200
- Invalid answers should return 400
- Rate limiting should return 429
```

### Security Tests

- Attempt to send `<script>` tags in parameters (should fail validation)
- Attempt to send very large JSON objects (should fail validation)
- Attempt to send invalid key names in breakdown (should fail validation)
- Verify security headers present in response

## Future Enhancements

### Short Term

- Add logging for validation failures and rate limit hits
- Implement distributed rate limiting (Redis) for multi-server deployments
- Add metrics collection for security events

### Medium Term

- Add CSRF protection tokens if forms are added
- Implement request signing for sensitive operations
- Add WAF-style rules for pattern-based attacks

### Long Term

- Implement API authentication/authorization if needed
- Add encryption for sensitive data in transit
- Implement database encryption at rest
- Set up comprehensive security monitoring and alerting

## File Manifest

```
src/lib/validation.ts             - Input validation utilities (NEW)
src/middleware.ts                 - Request middleware with rate limiting (NEW)
src/app/api/score/route.ts        - Server-side scoring API (NEW)
next.config.ts                    - Security headers configuration (UPDATED)
src/app/result/page.tsx           - Result page with validation (UPDATED)
```

## Security Checklist

- [x] Security headers implemented
- [x] Input validation on all user-controlled parameters
- [x] Server-side validation (not relying on client)
- [x] Rate limiting on API routes
- [x] Request tracking/audit trail
- [x] No hardcoded secrets
- [x] No external security dependencies
- [x] Type-safe validation functions
- [x] Proper error handling
- [x] HTTPS recommended (configured via HSTS header)
