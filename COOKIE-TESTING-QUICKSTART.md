# Cookie Security Testing - Quick Start

**TESTING ONLY - DO NOT SHIP TO PRODUCTION**

## Files Created

```
src/app/api/cookie-nightmare/route.ts        # API endpoint (7 insecure cookies)
src/components/CookieNightmareDebug.tsx      # Debug component (client-side vulnerabilities)
SECURITY-TEST-COOKIES.md                     # Full documentation
COOKIE-TESTING-QUICKSTART.md                 # This file
```

## Quick Test

### 1. Start the dev server

```bash
cd /Users/automator/git/bentheautomator/Sales\ Lead\ Tool
npm run dev
```

### 2. Trigger insecure cookies

```bash
curl http://localhost:4200/api/cookie-nightmare
```

### 3. Inspect in browser

- Open `http://localhost:4200/api/cookie-nightmare` in your browser
- Press F12 (DevTools)
- Go to **Application** → **Cookies**
- Look for these cookies (all with security issues):
  - `session_token` (no HttpOnly)
  - `auth_token` (no Secure)
  - `cross_site_token` (SameSite=None without Secure)
  - `user_session` (overly broad domain)
  - `persistent_user_id` (no expiration)
  - `user_profile` (PII in plaintext)
  - `weak_session` (predictable entropy)

### 4. Check Console Logs

- **Console** tab in DevTools
- You'll see sensitive data logged:
  ```
  Cookie Found: auth_token = auth_user_id_12345_secret_key_plaintext
  Cookie Found: user_profile = {...email...userId...score...}
  ```

## What Security Tools Will Find

| Tool               | Should Detect                                                           |
| ------------------ | ----------------------------------------------------------------------- |
| **Cookie Monster** | 7 cookie anti-patterns (HttpOnly, Secure, SameSite, Domain, Expiration) |
| **The Sentinel**   | Client-side XSS risks, console logging, localStorage misuse, CSRF       |
| **CodeQL**         | Insecure DOM manipulation, unvalidated input                            |
| **Semgrep**        | Credential exposure, authentication flaws                               |

## Integration with Debug Component

To add the debug panel to the app:

**Edit `src/app/page.tsx`:**

```typescript
import { CookieNightmareDebug } from '@/components/CookieNightmareDebug';

export default function Home() {
  return (
    <div>
      {/* ... existing code ... */}

      {/* Add debug panel (testing only) */}
      <CookieNightmareDebug />
    </div>
  );
}
```

Now you can:

- Click "Set Insecure Cookies" to populate all 7 cookies
- Click "Log All Cookies" to expose them in DevTools console
- Click "Copy to localStorage" to demonstrate localStorage risks
- Click "Read Profile Cookie" to parse and display PII
- Click "Manipulate Cookie" to forge auth status client-side

## Manual Testing Checklist

### API Route Tests

- [ ] GET `/api/cookie-nightmare` sets all 7 cookies
- [ ] POST `/api/cookie-nightmare` with `{"cookieValue": "..."}` sets custom cookie
- [ ] Cookies persist across page reloads
- [ ] DevTools shows cookies without HttpOnly/Secure flags

### Client Component Tests (if integrated)

- [ ] Debug panel renders with red border (warning styling)
- [ ] "Set Insecure Cookies" button fetches endpoint
- [ ] "Log All Cookies" button outputs to console
- [ ] "Copy to localStorage" stores tokens in localStorage
- [ ] "Read Profile Cookie" parses and logs user email/ID
- [ ] "Manipulate Cookie" adds fake auth cookies

### Security Scanner Tests

- [ ] Cookie Monster detects missing security flags
- [ ] The Sentinel flags client-side auth handling
- [ ] Browser console shows sensitive data exposure
- [ ] DevTools Security tab shows warnings

## Cleanup

When you're done testing:

```bash
# Remove the three test files
rm src/app/api/cookie-nightmare/route.ts
rm src/components/CookieNightmareDebug.tsx
rm SECURITY-TEST-COOKIES.md
rm COOKIE-TESTING-QUICKSTART.md

# If you added to page.tsx, remove the CookieNightmareDebug import and usage
```

Then verify:

```bash
git status  # Should show 4 deleted files
git diff --cached  # Verify deletions
```

## Key Vulnerabilities Tested

### Server-Side (API Route)

1. **No HttpOnly** → XSS can steal session via `document.cookie`
2. **No Secure** → MITM attacks on HTTP connections
3. **SameSite=None without Secure** → CSRF in older browsers
4. **Overly broad domain** → Subdomain takeover risks
5. **No expiration** → Permanent tracking, no logout
6. **PII in plaintext** → Email/ID/score exposed
7. **Weak entropy** → Session hijacking via prediction

### Client-Side (Debug Component)

1. **Direct document.cookie access** → XSS vulnerability
2. **Sensitive logging** → Browser history exposure
3. **localStorage usage** → More accessible than cookies
4. **No CSRF tokens** → State-changing ops unprotected
5. **Unescaped innerHTML** → DOM injection
6. **Global window pollution** → Accessible to all scripts
7. **Client-side forgery** → Can create fake auth

## Why This Matters

These aren't hypothetical vulnerabilities. Real apps ship with:

- Forgotten `httpOnly` flags (copy-paste errors)
- Missing `secure` on apps in transition to HTTPS
- Expired testing code left in production
- PII in cookies because "it's just this once"
- weak entropy in token generation
- localStorage auth tokens because they're easier than httpOnly

This test scaffold helps security tools validate they catch these patterns.

---

**For more details, see:** `SECURITY-TEST-COOKIES.md`
