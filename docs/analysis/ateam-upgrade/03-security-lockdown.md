# Security Hardening — The Sentinel

**Owner:** The Sentinel
**Estimated effort:** 1-2 days
**Phase:** 3 (parallel with Phases 1-2)
**Goal:** Production-grade security. CSP headers, input validation, rate limiting, XSS prevention.

---

## Overview

Current state: Basic MVP. No security considerations.

Target state: Security headers, input validation, rate limiting, CSRF protection, secure redirects.

---

## Security Hardening Checklist

### 1. Content Security Policy (CSP) Headers

**What it does:** Prevents XSS attacks by controlling which scripts, styles, and resources can load.

**File:** `next.config.js` (add security headers middleware)

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Existing config...

  headers: async () => {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `
              default-src 'self';
              script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com https://vitals.vercel-analytics.com;
              style-src 'self' 'unsafe-inline';
              img-src 'self' data: https: blob:;
              font-src 'self' data:;
              connect-src 'self' https://api.anthropic.com https://vitals.vercel-analytics.com;
              frame-ancestors 'none';
              base-uri 'self';
              form-action 'self';
            `.replace(/\s+/g, ' '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'geolocation=(), microphone=(), camera=()',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
```

**Why:** CSP is the strongest defense against XSS. `frame-ancestors 'none'` prevents clickjacking. HSTS forces HTTPS.

---

### 2. Input Validation with Zod

**What it does:** Validate form inputs before processing. Prevent injection attacks.

**File:** `src/lib/validation.ts`

```typescript
import { z } from 'zod';

// Validation schemas for BANT answers
export const BantAnswerSchema = z.record(
  z.string().min(1).max(100), // Question ID
  z.string().min(1).max(100) // Answer value
);

// Validate search params from URL
export const ResultQuerySchema = z.object({
  score: z.string().pipe(z.coerce.number().min(0).max(100)),
  qualified: z.string().transform((v) => v === 'true'),
  breakdown: z.string().pipe(
    z.string().transform((json) => {
      try {
        return JSON.parse(decodeURIComponent(json));
      } catch {
        throw new Error('Invalid breakdown JSON');
      }
    })
  ),
});

// Sanitize user input
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .slice(0, 500) // Max length
    .replace(/[<>]/g, '') // Remove angle brackets
    .replace(/javascript:/gi, ''); // Remove javascript: protocol
}

// Validate and sanitize answer
export function validateAnswer(
  questionId: string,
  value: string
): { valid: boolean; sanitized: string; error?: string } {
  try {
    const sanitized = sanitizeInput(value);

    // Check against allowed values (should come from config)
    if (sanitized.length === 0) {
      return { valid: false, sanitized: '', error: 'Empty answer' };
    }

    return { valid: true, sanitized };
  } catch (error) {
    return { valid: false, sanitized: '', error: String(error) };
  }
}

export function validateResultQuery(
  query: Record<string, string | string[] | undefined>
) {
  return ResultQuerySchema.safeParse(query);
}
```

**Usage in result page:**

```typescript
'use client';

import { validateResultQuery } from '@/lib/validation';
import { useSearchParams } from 'next/navigation';

function ResultContent() {
  const searchParams = useSearchParams();

  // Validate query params
  const query = Object.fromEntries(searchParams);
  const validation = validateResultQuery(query);

  if (!validation.success) {
    // Invalid query params — redirect to home
    router.push('/');
    return null;
  }

  const { score, qualified, breakdown } = validation.data;
  // Safe to use validated data
}
```

**Why:** Zod provides runtime validation. Prevents malformed data from breaking the app or exposing vulnerabilities.

---

### 3. URL Parameter Sanitization

**What it does:** Prevent XSS through URL params. Sanitize before displaying.

**File:** `src/lib/sanitize.ts`

```typescript
import DOMPurify from 'dompurify';

/**
 * Sanitize HTML content to prevent XSS
 * Only use when displaying user-provided HTML content
 */
export function sanitizeHtml(dirty: string): string {
  if (typeof window === 'undefined') {
    // Server-side: use a simple approach
    return escapeHtml(dirty);
  }

  return DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: [], // No HTML tags allowed
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });
}

/**
 * Escape HTML entities
 * Use on server-side or for non-HTML text
 */
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Safe JSON stringify with sanitization
 */
export function safeJsonStringify(obj: unknown): string {
  try {
    return JSON.stringify(obj);
  } catch (error) {
    return '{}';
  }
}
```

**Install DOMPurify:**
```bash
npm install dompurify
npm install -D @types/dompurify
```

**Usage in result page:**

```typescript
import { sanitizeHtml } from '@/lib/sanitize';

// When displaying user-provided data:
<div className="text-gray-700">
  {sanitizeHtml(userProvidedString)}
</div>
```

**Why:** Even validated data can be displayed as HTML. Double protection against XSS.

---

### 4. Rate Limiting

**What it does:** Prevent form spam and API abuse. Max N requests per IP per time window.

**File:** `src/middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour
const RATE_LIMIT_REQUESTS = 10; // Max 10 form submissions per hour
const RATE_LIMIT_MAP = new Map<string, { count: number; resetTime: number }>();

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const record = RATE_LIMIT_MAP.get(ip);

  if (!record || now > record.resetTime) {
    // New window
    RATE_LIMIT_MAP.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (record.count >= RATE_LIMIT_REQUESTS) {
    return true;
  }

  record.count += 1;
  return false;
}

export function middleware(request: NextRequest) {
  // Apply rate limiting to form submission endpoints
  if (request.nextUrl.pathname === '/api/insights') {
    const clientIp = getClientIp(request);

    if (isRateLimited(clientIp)) {
      return new NextResponse('Too many requests', { status: 429 });
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/result'],
};
```

**Alternative (Vercel Edge Config):**

For production, use Vercel's KV + Edge Config for distributed rate limiting:

```typescript
// src/app/api/insights/route.ts (improved)
import { Ratelimit } from '@vercel/edge-config';

const ratelimit = new Ratelimit({
  key: 'insights-api',
  limit: 5, // 5 requests
  window: '1h', // per hour
  analytics: true,
});

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const { success } = await ratelimit.limit(ip);

  if (!success) {
    return new Response('Rate limited', { status: 429 });
  }

  // ... process request
}
```

**Why:** Prevents malicious actors from flooding the form or API. Protects against bot attacks.

---

### 5. CSRF Protection (If Adding Backend)

**Note:** Current MVP has no backend form handlers. If adding `/api/leads` endpoint later:

**File:** `src/lib/csrf.ts`

```typescript
import crypto from 'crypto';

/**
 * Generate CSRF token
 * Store in session/cookie
 */
export function generateCsrfToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Verify CSRF token
 * Called on server-side before processing form
 */
export function verifyCsrfToken(token: string, sessionToken: string): boolean {
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(sessionToken));
}
```

**Usage (when backend form handler is added):**

```typescript
// In form component
const [csrfToken, setCsrfToken] = useState('');

useEffect(() => {
  // Fetch CSRF token on mount
  fetch('/api/csrf-token')
    .then((r) => r.json())
    .then((d) => setCsrfToken(d.token));
}, []);

// Include in form submission:
const handleSubmit = async () => {
  await fetch('/api/leads', {
    method: 'POST',
    headers: { 'X-CSRF-Token': csrfToken },
    body: JSON.stringify(formData),
  });
};
```

---

### 6. Secure Redirects

**What it does:** Prevent open redirect attacks. Only allow redirects to known domains.

**File:** `src/lib/redirects.ts`

```typescript
/**
 * Safe redirect validation
 * Prevents open redirect vulnerabilities
 */
export function isSafeRedirect(url: string): boolean {
  try {
    // Parse URL
    const parsed = new URL(url);

    // Only allow same-origin redirects
    if (parsed.origin !== typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_BASE_URL) {
      return false;
    }

    // Whitelist allowed paths
    const allowedPaths = ['/result', '/book', '/guide', '/'];
    return allowedPaths.some((path) => parsed.pathname.startsWith(path));
  } catch {
    return false;
  }
}

export function safeRedirect(router: any, url: string, fallback = '/') {
  if (isSafeRedirect(url)) {
    router.push(url);
  } else {
    router.push(fallback);
  }
}
```

**Usage in page.tsx:**

```typescript
const scoreResult = calculateScore(answers, qualificationConfig);

// Safe redirect to result page
const resultUrl = `/result?score=${scoreResult.totalScore}&qualified=${scoreResult.qualified}&breakdown=${encodeURIComponent(JSON.stringify(breakdown))}`;

if (isSafeRedirect(resultUrl)) {
  router.push(resultUrl);
}
```

**Why:** Prevents attackers from embedding malicious redirect links.

---

### 7. Dependency Vulnerability Scanning

**Add to package.json scripts:**

```json
{
  "scripts": {
    "audit": "npm audit",
    "audit:fix": "npm audit fix",
    "security-check": "npm audit && npx snyk test"
  }
}
```

**CI/CD integration:**

Add to GitHub Actions (`.github/workflows/security.yml`):

```yaml
name: Security Audit

on: [push, pull_request]

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm audit --audit-level=moderate
```

**Why:** Catches vulnerable dependencies before deployment.

---

### 8. Environment Variable Protection

**File:** `.env.local` (never commit)

```
# API Keys (server-side only)
ANTHROPIC_API_KEY=sk-ant-...

# Public variables (safe for client)
NEXT_PUBLIC_BASE_URL=https://qualifier.example.com
```

**File:** `.env.example` (commit this, not .env.local)

```
ANTHROPIC_API_KEY=your_key_here
NEXT_PUBLIC_BASE_URL=https://qualifier.example.com
```

**.gitignore:**
```
.env.local
.env.*.local
```

**Why:** API keys must never be exposed in client-side code or version control.

---

### 9. Logging & Monitoring

**File:** `src/lib/monitoring.ts`

```typescript
import { captureException } from '@sentry/nextjs';

/**
 * Log security event
 */
export function logSecurityEvent(
  event: string,
  details: Record<string, any>
): void {
  console.warn(`[SECURITY] ${event}`, details);

  // Send to monitoring service
  if (typeof window === 'undefined') {
    // Server-side
    // TODO: Send to Sentry/DataDog/etc
  }
}

/**
 * Report validation error
 */
export function reportValidationError(
  error: string,
  context: Record<string, any>
): void {
  logSecurityEvent('validation_error', { error, context });

  // Don't expose internal error details to user
  // Show generic message instead
}

/**
 * Report rate limit hit
 */
export function reportRateLimitHit(ip: string, endpoint: string): void {
  logSecurityEvent('rate_limit_exceeded', { ip, endpoint });
}
```

**Why:** Detect attacks in progress. Monitor for suspicious patterns.

---

## Testing Security

Create `__tests__/security.test.ts`:

```typescript
import { sanitizeInput, validateResultQuery } from '@/lib/validation';
import { sanitizeHtml } from '@/lib/sanitize';

describe('Security', () => {
  describe('Input Validation', () => {
    it('rejects XSS attempts in input', () => {
      const malicious = '<img src=x onerror="alert(\'xss\')">';
      const { valid } = sanitizeInput(malicious);
      expect(valid).toBe(false);
    });

    it('removes angle brackets', () => {
      const input = 'hello<script>alert</script>';
      const result = sanitizeInput(input);
      expect(result).not.toContain('<');
    });
  });

  describe('URL Parameter Validation', () => {
    it('rejects invalid query params', () => {
      const query = { score: 'not-a-number', qualified: 'maybe' };
      const result = validateResultQuery(query);
      expect(result.success).toBe(false);
    });

    it('accepts valid query params', () => {
      const query = { score: '75', qualified: 'true', breakdown: '{}' };
      const result = validateResultQuery(query);
      expect(result.success).toBe(true);
    });
  });

  describe('HTML Sanitization', () => {
    it('removes script tags', () => {
      const dirty = 'Hello <script>alert(1)</script> world';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('<script>');
    });

    it('removes event handlers', () => {
      const dirty = '<div onclick="alert(1)">Click</div>';
      const clean = sanitizeHtml(dirty);
      expect(clean).not.toContain('onclick');
    });
  });
});
```

---

## Production Checklist

- [ ] CSP headers configured and tested
- [ ] Input validation on all form inputs
- [ ] URL parameter validation before display
- [ ] Rate limiting enabled on API endpoints
- [ ] DOMPurify integrated for HTML sanitization
- [ ] Environment variables not exposed client-side
- [ ] HSTS headers enabled
- [ ] X-Frame-Options set to DENY
- [ ] X-Content-Type-Options set to nosniff
- [ ] Referrer-Policy configured
- [ ] npm audit runs in CI/CD
- [ ] Security headers validated with securityheaders.com
- [ ] OWASP Top 10 checklist completed
- [ ] Penetration testing scheduled (if high-value product)

---

## Dependencies to Add

```bash
npm install zod dompurify
npm install -D @types/dompurify
```

---

## Security Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Best Practices](https://nextjs.org/docs/basic-features/security)
- [CSP Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- [Zod Documentation](https://zod.dev/)

---

## Next Steps

1. Add Zod to package.json and install
2. Create validation and sanitization modules
3. Update next.config.js with security headers
4. Implement rate limiting middleware
5. Add DOMPurify for HTML sanitization
6. Test CSP headers with browser dev tools
7. Run npm audit and fix vulnerabilities
8. Test validation with malicious payloads
9. Add security headers validator to CI/CD
10. Document security policies in README

---

**Owner:** The Sentinel
**Next review:** After Phase 3 completion (Day 3)
