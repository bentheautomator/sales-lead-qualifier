# Cookie Security Implementation

## Overview

The `/api/cookie-nightmare` endpoint demonstrates **proper cookie security practices**. All 7 cookies follow industry best practices for secure cookie handling.

## Cookie Security Matrix

| Cookie                     | HttpOnly | Secure | SameSite | Path   | MaxAge | Prefix    |
| -------------------------- | -------- | ------ | -------- | ------ | ------ | --------- |
| `__Host-session_token`     | Yes      | Yes    | Strict   | `/`    | 1h     | `__Host-` |
| `__Host-auth_token`        | Yes      | Yes    | Strict   | `/`    | 24h    | `__Host-` |
| `__Host-csrf_token`        | Yes      | Yes    | Strict   | `/`    | 30m    | `__Host-` |
| `__Host-api_session`       | Yes      | Yes    | Strict   | `/api` | 1h     | `__Host-` |
| `theme_preference`         | No       | Yes    | Lax      | `/`    | 1y     | None      |
| `__Host-user_id`           | Yes      | Yes    | Strict   | `/`    | 7d     | `__Host-` |
| `__Host-ephemeral_session` | Yes      | Yes    | Strict   | `/`    | 15m    | `__Host-` |

## Security Features

### `__Host-` Cookie Prefix

All sensitive cookies use the `__Host-` prefix, which browsers enforce:

- Cookie MUST have `Secure` flag
- Cookie MUST have `Path=/`
- Cookie MUST NOT have `Domain` attribute
- Prevents cookie tossing attacks from subdomains

### CSRF Protection

- POST endpoint validates `X-CSRF-Token` header matches `__Host-csrf_token` cookie
- Returns 403 on mismatch
- SameSite=Strict prevents cross-site request forgery

### Input Validation on POST

- Content-Type must be `application/json`
- Cookie values validated: string, 1-256 chars
- Control characters and injection attempts stripped
- Empty values after sanitization rejected

### No PII in Cookies

- All identifiers are opaque UUIDs (`crypto.randomUUID()`)
- No email, name, score, or subscription data in cookie values
- User profile data stays server-side

### Client Component Security

- Uses `useSyncExternalStore` (no setState-in-effect)
- Redacts token values in display
- Never logs sensitive data to console
- Uses `textContent` patterns (no innerHTML)
- No localStorage fallback for auth tokens
- CSRF token included in all POST requests

## Testing

```bash
# Set all secure cookies
curl -v http://localhost:4200/api/cookie-nightmare

# Verify flags in response headers
# Expected: Set-Cookie with HttpOnly; Secure; SameSite=Strict

# Test CSRF protection (should return 403)
curl -X POST http://localhost:4200/api/cookie-nightmare \
  -H "Content-Type: application/json" \
  -d '{"cookieValue":"test"}'

# Test input validation (should return 400)
curl -X POST http://localhost:4200/api/cookie-nightmare \
  -H "Content-Type: application/json" \
  -H "X-CSRF-Token: matching-token" \
  -d '{"cookieValue":""}'
```
