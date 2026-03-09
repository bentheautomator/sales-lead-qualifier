# Cookie Security Quick Reference

## Endpoint

`GET /api/cookie-nightmare` — Sets 7 secure cookies with full protection flags.
`POST /api/cookie-nightmare` — Sets user preference cookie with CSRF validation.

## Quick Test

```bash
curl -v http://localhost:4200/api/cookie-nightmare 2>&1 | grep Set-Cookie
```

Expected: Every `Set-Cookie` header contains `HttpOnly`, `Secure`, and `SameSite=Strict`.

## Security Checklist

- [x] All sensitive cookies have `HttpOnly` flag
- [x] All cookies have `Secure` flag (HTTPS-only)
- [x] All sensitive cookies use `SameSite=Strict`
- [x] All sensitive cookies use `__Host-` prefix
- [x] No PII stored in cookie values (UUIDs only)
- [x] Session tokens use `crypto.randomUUID()` (cryptographic randomness)
- [x] CSRF token validated on POST requests
- [x] Input validated and sanitized before cookie storage
- [x] Short expiration times (15min to 24h for sensitive, 1y for preferences)
- [x] Path restrictions where appropriate (`/api` scope)
- [x] No `Domain` attribute (prevents subdomain cookie tossing)
- [x] Client component redacts tokens in display
- [x] No sensitive data logged to console
- [x] No auth tokens in localStorage

## Client Component

`CookieNightmareDebug` demonstrates secure client-side cookie handling:

- Only visible (non-HttpOnly) cookies shown
- Token values redacted in display
- CSRF token sent with POST requests
- No innerHTML usage (XSS prevention)
- `useSyncExternalStore` pattern (React best practice)
