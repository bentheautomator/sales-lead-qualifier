# Cookie Security Testing Scaffold

**STATUS:** DELIBERATELY INSECURE - FOR TESTING ONLY - DO NOT SHIP

This document describes the intentionally vulnerable cookie implementations created for security testing purposes.

## Overview

Two files have been created to demonstrate TERRIBLE cookie security practices:

1. **`src/app/api/cookie-nightmare/route.ts`** — API endpoint that sets insecure cookies
2. **`src/components/CookieNightmareDebug.tsx`** — Client component that reads cookies insecurely

## Vulnerabilities Demonstrated

### API Route (`cookie-nightmare/route.ts`)

The GET endpoint sets 7 deliberately insecure cookies:

#### 1. **session_token** — No HttpOnly Flag

- **Vulnerability:** XSS attacks can steal via `document.cookie`
- **Flag Missing:** `httpOnly: true`
- **Impact:** Session hijacking after XSS

#### 2. **auth_token** — No Secure Flag

- **Vulnerability:** Sent over HTTP (not just HTTPS)
- **Flag Missing:** `secure: true`
- **Impact:** Man-in-the-middle attack on unencrypted connections

#### 3. **cross_site_token** — SameSite=None Without Secure

- **Vulnerability:** CSRF attack vector
- **Flag Missing:** `secure: true` (required with SameSite=None)
- **Impact:** Cross-site request forgery in older browsers

#### 4. **user_session** — Overly Broad Domain Scope

- **Vulnerability:** Available to all subdomains
- **Domain:** `bentheautomator.com` (too broad)
- **Impact:** Subdomain takeover could steal tokens

#### 5. **persistent_user_id** — No Expiration

- **Vulnerability:** Lives forever in browser storage
- **Missing:** `maxAge` or `expires`
- **Impact:** Permanent tracking, no logout mechanism

#### 6. **user_profile** — Sensitive Data Plaintext

- **Vulnerability:** Email, user ID, score stored unencrypted in cookie
- **Issue:** No encryption, readable by XSS
- **Data Exposed:** `email`, `userId`, `score`, `subscription`, `lastLogin`
- **Impact:** PII disclosure, privacy violation

#### 7. **weak_session** — Predictable Entropy

- **Vulnerability:** Brute-forceable session tokens
- **Pattern:** `session_{timestamp}_{random}`
- **Impact:** Session hijacking via prediction

The POST endpoint accepts arbitrary user-controlled cookie values without validation.

### Client Component (`CookieNightmareDebug.tsx`)

The debug component demonstrates client-side insecure practices:

#### 1. Direct `document.cookie` Access

```typescript
const cookieString = document.cookie;
```

- **Vulnerability:** Reads ALL non-HttpOnly cookies
- **Impact:** XSS can steal auth tokens

#### 2. Sensitive Data in Console Logs

```javascript
console.log(`Cookie Found: ${name} = ${parsed[name]}`);
console.warn("Sensitive data in cookie:", jsonValue);
```

- **Vulnerability:** Browser console history saved
- **Impact:** Auth tokens exposed in dev tools

#### 3. localStorage Fallback Storage

```typescript
localStorage.setItem("auth_token_backup", authToken);
```

- **Vulnerability:** More accessible than cookies, persists across tabs
- **Impact:** Easier for XSS to steal

#### 4. No CSRF Protection

```typescript
await fetch("/api/cookie-nightmare", {
  credentials: "include",
  // Missing: 'X-CSRF-Token' header
});
```

- **Vulnerability:** No state verification
- **Impact:** CSRF attacks possible

#### 5. Insecure DOM Manipulation

```typescript
debugDiv.innerHTML = `<p>User Email: ${email}</p>`;
```

- **Vulnerability:** No HTML escaping on untrusted data
- **Impact:** DOM-based XSS if cookie is tampered

#### 6. window Object Pollution

```typescript
(window as any)._DEBUG_COOKIES = cookies;
```

- **Vulnerability:** Exposes auth data to global scope
- **Impact:** Accessible to any script on the page

#### 7. Cookie Manipulation

```typescript
const fakeCookie = "authenticated=true; admin=true; role=superuser";
document.cookie = fakeCookie;
```

- **Vulnerability:** Client can forge auth status
- **Impact:** Complete authentication bypass

## Testing Instructions

### 1. Set Up the Vulnerabilities

```bash
cd /Users/automator/git/bentheautomator/Sales\ Lead\ Tool
npm run dev
```

### 2. Trigger the Insecure Cookies

Visit: `http://localhost:4200/api/cookie-nightmare`

Or use curl:

```bash
curl http://localhost:4200/api/cookie-nightmare
```

### 3. Import Debug Component (Optional)

Add to `src/app/page.tsx`:

```typescript
import { CookieNightmareDebug } from '@/components/CookieNightmareDebug';

// Inside the component:
<CookieNightmareDebug />
```

### 4. Run Security Scanners

- **Cookie Monster** will detect: missing HttpOnly, Secure, SameSite flags
- **The Sentinel** will flag: client-side auth handling, localStorage usage, console logs
- **CodeQL/Semgrep** will find: DOM injection, unvalidated input, credential exposure

## Expected Security Reports

### Cookie Monster Should Detect:

- [ ] session_token: Missing HttpOnly
- [ ] auth_token: Missing Secure
- [ ] cross_site_token: SameSite=None without Secure
- [ ] user_session: Overly broad domain
- [ ] persistent_user_id: No expiration
- [ ] user_profile: PII in plaintext cookie
- [ ] weak_session: Weak entropy

### The Sentinel Should Flag:

- [ ] XSS exposure via document.cookie
- [ ] Sensitive data in console.log()
- [ ] localStorage usage for auth tokens
- [ ] Missing CSRF tokens
- [ ] Unescaped innerHTML assignment
- [ ] Global window object pollution
- [ ] Client-side cookie forgery capability

## Cleanup Instructions

When testing is complete:

```bash
# Remove the insecure files
rm src/app/api/cookie-nightmare/route.ts
rm src/components/CookieNightmareDebug.tsx
rm SECURITY-TEST-COOKIES.md

# Verify removal
git status
```

## Why These Anti-Patterns?

Each vulnerability represents real-world security mistakes:

- **No HttpOnly**: Developers forget the flag, XSS becomes session stealing
- **No Secure**: HTTP-only apps don't set it, credentials leak on networks
- **Overly Broad Domain**: Copy-paste from old code, unintended scope creep
- **No Expiration**: "Logout doesn't matter, we have other auth" — then tokens persist
- **PII in Cookies**: "It's just the user ID... oh wait, we added email"
- **Weak Entropy**: PRNG isn't cryptographically secure, sequence is guessable
- **localStorage**: "More convenient than cookies" — yes, and more vulnerable
- **Console Logs**: Debugging in production, forgot to remove logs
- **No CSRF**: "We have SameSite=Lax" — not enough for state-changing ops
- **innerHTML**: "Just this once" — now we have DOM injection

## References

- [OWASP: Secure Cookie Attributes](https://owasp.org/www-community/controls/Cookie_Security)
- [MDN: Set-Cookie](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Set-Cookie)
- [Google Cloud Security: Web Security Best Practices](https://cloud.google.com/docs/authentication/cookie-security)

---

**Created by:** Lord Business (The Automators)
**Date:** 2026-03-08
**Purpose:** Security testing and vulnerability detection validation
