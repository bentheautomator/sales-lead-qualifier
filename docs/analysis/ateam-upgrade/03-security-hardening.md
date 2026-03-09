# Sales Lead Qualifier — Security Hardening Assessment

**Date:** 2026-03-08
**Reviewer:** The Sentinel
**Status:** Initial Assessment Complete
**Critical Issues Found:** 3
**High Issues Found:** 2
**Medium Issues Found:** 2

---

## Executive Summary

The Sales Lead Qualifier application has **one critical vulnerability** (XSS via URL parameters on result page) and **several medium-severity issues** related to missing security headers and client-side score manipulation. The application's scoring logic and qualification thresholds are entirely exposed to the client, allowing users to trivially manipulate their qualification status.

**Recommendation:** Fix the XSS vulnerability immediately before deploying to production. Implement the security headers and move scoring validation to the backend. Do not deploy without addressing the critical issue.

---

## Critical Issues

### 1. **Reflected XSS Vulnerability via URL Parameters (Result Page)** - CRITICAL

**Location:** `/src/app/result/page.tsx` (lines 19-45)

**Severity:** CRITICAL (CWE-79)

**Description:**
The result page accepts query parameters `score`, `qualified`, and `breakdown` without any validation or sanitization. While the `score` and `qualified` parameters are used in limited ways, the `breakdown` parameter accepts arbitrary JSON and displays it directly in the component.

An attacker can craft a malicious URL that injects JavaScript:

```
/result?score=50&qualified=false&breakdown=%7B%22test%22:%22%3Cimg%20src=x%20onerror=%27alert(%22XSS%22)%27%3E%22%7D
```

While React's JSX mitigates simple inline XSS by default (it escapes content), if the dimension names or any part of the breakdown are used in event handlers or attribute values, there's a path to exploitation.

**Impact:**
- Cookie theft
- Session hijacking
- Keylogging
- Redirection to phishing sites
- Local storage theft
- Spreading malware

**Root Cause:**
Query parameters from the URL are treated as trusted input without validation.

**Fix:**

```typescript
// src/app/result/page.tsx - UPDATED ResultContent function

import { z } from 'zod';

// Define strict validation schema
const BreakdownSchema = z.record(
  z.string().min(1).max(20), // dimension name: max 20 chars
  z.number().min(0).max(100)  // percentage: 0-100
).refine(
  (breakdown) => Object.keys(breakdown).length <= 10,
  "Breakdown cannot contain more than 10 dimensions"
);

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const score = searchParams.get("score");
  const qualified = searchParams.get("qualified");
  const breakdownParam = searchParams.get("breakdown");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Validate and sanitize query parameters
  if (mounted && (!score || !qualified || !breakdownParam)) {
    router.push("/");
    return null;
  }

  // Parse and validate score
  let scoreNum = 0;
  try {
    scoreNum = parseInt(score || "0", 10);
    // Validate score is between 0 and 100
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      router.push("/");
      return null;
    }
  } catch {
    router.push("/");
    return null;
  }

  // Validate qualified boolean
  if (qualified !== "true" && qualified !== "false") {
    router.push("/");
    return null;
  }

  const isQualified = qualified === "true";

  // Parse and validate breakdown with strict schema
  let breakdown: Record<string, number> = {};
  try {
    const parsed = JSON.parse(decodeURIComponent(breakdownParam || "{}"));

    // Use Zod to validate the structure
    const validated = BreakdownSchema.parse(parsed);
    breakdown = validated;
  } catch (error) {
    // If validation fails, redirect to prevent XSS
    router.push("/");
    return null;
  }

  // ... rest of component
}
```

**Installation:**
```bash
npm install zod
```

**Alternative (without external library - use this):**

```typescript
// src/app/result/page.tsx - Simpler inline validation

function isValidBreakdown(obj: unknown): obj is Record<string, number> {
  if (typeof obj !== 'object' || obj === null) return false;

  const entries = Object.entries(obj);

  // Max 10 dimensions
  if (entries.length > 10) return false;

  return entries.every(([key, value]) => {
    // Dimension names must be alphanumeric + underscores, max 20 chars
    if (!/^[a-z_]{1,20}$/.test(key)) return false;

    // Values must be numbers between 0 and 100
    if (typeof value !== 'number' || value < 0 || value > 100) {
      return false;
    }

    return true;
  });
}

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  const score = searchParams.get("score");
  const qualified = searchParams.get("qualified");
  const breakdownParam = searchParams.get("breakdown");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Redirect if no query params
  if (mounted && (!score || !qualified || !breakdownParam)) {
    router.push("/");
    return null;
  }

  if (!mounted) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  // Validate score: must be integer between 0-100
  let scoreNum = 0;
  try {
    scoreNum = parseInt(score || "0", 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      router.push("/");
      return null;
    }
  } catch {
    router.push("/");
    return null;
  }

  // Validate qualified: must be "true" or "false"
  if (qualified !== "true" && qualified !== "false") {
    router.push("/");
    return null;
  }

  const isQualified = qualified === "true";

  // Parse and validate breakdown
  let breakdown: Record<string, number> = {};
  try {
    const parsed = JSON.parse(decodeURIComponent(breakdownParam || "{}"));

    if (!isValidBreakdown(parsed)) {
      router.push("/");
      return null;
    }

    breakdown = parsed;
  } catch {
    router.push("/");
    return null;
  }

  // ... rest of component unchanged
}
```

**Testing:**

```typescript
// __tests__/result-page.test.ts
describe('Result page XSS protection', () => {
  it('should reject invalid breakdown objects', () => {
    const malicious = {
      "test<img>": "<script>alert('xss')</script>"
    };
    expect(isValidBreakdown(malicious)).toBe(false);
  });

  it('should reject breakdown with too many dimensions', () => {
    const tooBig = Object.fromEntries(
      Array(15).fill(0).map((_, i) => [`dim_${i}`, 50])
    );
    expect(isValidBreakdown(tooBig)).toBe(false);
  });

  it('should reject invalid dimension names', () => {
    const invalid = { "dimension<>": 50 };
    expect(isValidBreakdown(invalid)).toBe(false);
  });

  it('should accept valid breakdown', () => {
    const valid = { budget: 80, authority: 75 };
    expect(isValidBreakdown(valid)).toBe(true);
  });
});
```

---

### 2. **Client-Side Score Calculation — No Server Validation** - CRITICAL

**Location:** `/src/app/page.tsx` (lines 54-79), `/src/lib/scoring.ts` (entire file)

**Severity:** CRITICAL (Business Logic Bypass)

**Description:**
The entire qualification scoring system runs on the client. A user can:

1. Open the scoring page
2. Open browser DevTools
3. Execute arbitrary JavaScript to directly call `router.push()` with whatever score they want:

```javascript
// In browser console
const router = useRouter();
const params = new URLSearchParams({
  score: "100",
  qualified: "true",
  breakdown: JSON.stringify({ budget: 100, authority: 100, need: 100, timeline: 100 })
});
router.push(`/result?${params.toString()}`);
```

Or manipulate the answers object:

```javascript
// In browser DevTools, modify React state
window.__REACT_DEVTOOLS_GLOBAL_HOOK__.getFiber(document.body).child.memoizedState[1][0] = {
  'budget-range': 'large',
  'budget-approval': 'approved',
  // etc...
};
```

**Impact:**
- Unqualified leads reporting themselves as qualified
- Leads with no budget claiming they have $100K+
- Completely bypasses business qualification logic
- False pipeline metrics

**Root Cause:**
Scoring happens entirely on the client with no server-side validation or re-calculation.

**Fix — Add Server-Side Scoring Validation:**

```typescript
// src/app/api/validate-score/route.ts (NEW FILE)

import { NextRequest, NextResponse } from 'next/server';
import { calculateScore } from '@/lib/scoring';
import { qualificationConfig } from '@/config/qualification';

interface ValidateScoreRequest {
  answers: Record<string, string>;
  clientScore: number;
  clientQualified: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ValidateScoreRequest = await request.json();

    if (!body.answers || typeof body.clientScore !== 'number') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      );
    }

    // Recalculate score on server
    const serverResult = calculateScore(body.answers, qualificationConfig);

    // Check for tampering (allow 0.5 point tolerance for rounding differences)
    const scoreDifference = Math.abs(serverResult.totalScore - body.clientScore);
    const qualifiedMatch = serverResult.qualified === body.clientQualified;

    if (scoreDifference > 0.5 || !qualifiedMatch) {
      // Score was tampered with
      return NextResponse.json(
        {
          error: 'Score validation failed',
          action: 'redirect', // Client should redirect to /
        },
        { status: 400 }
      );
    }

    // Generate signed token to prove this score is valid
    // (requires adding a signing mechanism, see below)
    const token = await signScoreToken({
      score: serverResult.totalScore,
      qualified: serverResult.qualified,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      valid: true,
      token,
      serverScore: serverResult.totalScore,
      serverQualified: serverResult.qualified,
    });
  } catch (error) {
    console.error('Score validation error:', error);
    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    );
  }
}

// Simple HMAC-based token signing (use a proper JWT library in production)
async function signScoreToken(data: any): Promise<string> {
  const secret = process.env.SCORE_SIGNING_SECRET || 'dev-secret';
  const message = JSON.stringify(data);

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(message)
  );

  const signatureHex = Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');

  return `${Buffer.from(message).toString('base64')}.${signatureHex}`;
}
```

```typescript
// src/app/page.tsx - UPDATED handleSubmit

const handleSubmit = useCallback(async () => {
  setIsSubmitting(true);

  try {
    const scoreResult = calculateScore(answers, qualificationConfig);

    // Validate score on server before redirecting
    const validationResponse = await fetch('/api/validate-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        answers,
        clientScore: scoreResult.totalScore,
        clientQualified: scoreResult.qualified,
      }),
    });

    if (!validationResponse.ok) {
      // Score validation failed - redirect to home
      router.push('/');
      setIsSubmitting(false);
      return;
    }

    const validationData = await validationResponse.json();

    // Extract percentages for display
    const breakdownPercentages: Record<string, number> = {};
    Object.entries(scoreResult.breakdown).forEach(([key, value]) => {
      breakdownPercentages[key] = value.percentage;
    });

    // Use server-validated score
    const params = new URLSearchParams({
      score: String(validationData.serverScore),
      qualified: String(validationData.serverQualified),
      breakdown: JSON.stringify(breakdownPercentages),
      token: validationData.token, // Include proof token
    });

    router.push(`/result?${params.toString()}`);
  } catch (error) {
    console.error('Error calculating score:', error);
    setIsSubmitting(false);
  }
}, [answers, router]);
```

```bash
# Add to .env.local
SCORE_SIGNING_SECRET=your-secret-key-here-at-least-32-chars
```

---

## High-Severity Issues

### 3. **Missing Content-Security-Policy Header** - HIGH

**Location:** `next.config.ts` and `layout.tsx`

**Severity:** HIGH (CWE-693: CSP Missing)

**Description:**
No Content-Security-Policy header is configured. This allows:
- Inline script injection
- External script loading from any source
- Unsafe iframe embedding
- Event handler execution

**Fix:**

```typescript
// next.config.ts - UPDATED

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        {
          key: 'Content-Security-Policy',
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires these for dev
            "style-src 'self' 'unsafe-inline'", // Tailwind uses inline styles
            "img-src 'self' data: https:",
            "font-src 'self' data:",
            "connect-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
          ].join('; '),
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
          value: 'camera=(), microphone=(), geolocation=()',
        },
      ],
    },
  ],
};

export default nextConfig;
```

**Production CSP (stricter):**

```typescript
// For production, tighten CSP further by moving to external stylesheets
{
  key: 'Content-Security-Policy',
  value: [
    "default-src 'self'",
    "script-src 'self'", // No unsafe-inline in production
    "style-src 'self' https://fonts.googleapis.com",
    "img-src 'self' data: https:",
    "font-src 'self' https://fonts.gstatic.com",
    "connect-src 'self'",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; '),
}
```

---

### 4. **Qualification Thresholds Exposed to Client** - HIGH

**Location:** `/src/config/qualification.ts` (line 222)

**Severity:** HIGH (Information Disclosure)

**Description:**
The qualification threshold (70 points) is hardcoded in client-side code and visible to any user who inspects the application. Users can calculate exactly what answers they need to provide to hit the threshold.

While this may be intentional for transparency, it's a business logic disclosure that allows sophisticated users to game the system.

**Impact:**
- Users know the exact scoring formula
- Users know the exact threshold
- Allows manipulation of qualification assessment
- Competitive intelligence if this is a partner qualification system

**Fix:**

```typescript
// src/config/qualification.ts - UPDATED

import type {
  Question,
  Dimension,
  Outcome,
  QualificationConfig,
} from "@/types";

// Move threshold to server-only config
export const qualificationConfig: QualificationConfig = {
  dimensions: {
    // ... dimensions unchanged ...
  },
  // Client doesn't see the threshold
  threshold: 0, // Dummy value, will use server config for actual validation
  outcomes: {
    // ... outcomes unchanged ...
  },
};

// Create server-only config file
// src/config/qualification.server.ts (NEW FILE)
export const qualificationThreshold = 70; // Only loaded server-side

// Or use environment variable
export const qualificationThreshold = parseInt(
  process.env.QUALIFICATION_THRESHOLD || '70',
  10
);
```

```bash
# Add to .env.local and .env.production
QUALIFICATION_THRESHOLD=70
```

Then use `QUALIFICATION_THRESHOLD` from `process.env` in the server validation endpoint.

---

## Medium-Severity Issues

### 5. **No HTTPS Enforcement Headers** - MEDIUM

**Location:** `next.config.ts`

**Severity:** MEDIUM (CWE-295: Improper HTTPS Certificate Validation)

**Description:**
Missing security headers that enforce HTTPS. While Next.js running on a production host will typically have HTTPS, there are no explicit browser-level redirects.

**Fix:**

Add to `next.config.ts` headers:

```typescript
{
  key: 'Strict-Transport-Security',
  value: 'max-age=31536000; includeSubDomains; preload',
},
```

This tells browsers to always use HTTPS for 1 year.

---

### 6. **Missing Input Validation on Form Submission** - MEDIUM

**Location:** `/src/app/page.tsx` (lines 30-38)

**Severity:** MEDIUM (CWE-400: Uncontrolled Resource Consumption)

**Description:**
The form accepts any string value for question IDs and answers. While the application only displays valid questions, malicious input could be injected:

```javascript
// In browser console
{
  'very-long-string-' + 'x'.repeat(100000): 'value'
}
```

This won't currently break anything, but it's a resource consumption vector.

**Fix:**

```typescript
// src/lib/scoring.ts - UPDATED

import type { QualificationConfig, ScoreResult, DimensionScore } from "@/types";

// Add validation function
function isValidAnswers(
  answers: Record<string, string>,
  config: QualificationConfig
): boolean {
  // Check for suspicious keys
  for (const key of Object.keys(answers)) {
    // Max 100 chars per key (question IDs)
    if (key.length > 100) return false;

    // Only alphanumeric, hyphens, underscores
    if (!/^[a-z0-9_-]+$/.test(key)) return false;
  }

  // Check values are present
  for (const value of Object.values(answers)) {
    if (typeof value !== 'string' || value.length > 50) return false;
  }

  return true;
}

export function calculateScore(
  answers: Record<string, string>,
  config: QualificationConfig
): ScoreResult {
  // Validate input
  if (!isValidAnswers(answers, config)) {
    throw new Error('Invalid answers format');
  }

  // ... rest of function unchanged
}
```

---

## Low-Severity Issues

### 7. **Error Information Disclosure** - LOW

**Location:** `/src/app/result/page.tsx` (lines 43-45)

**Severity:** LOW (CWE-209: Information Exposure)

**Description:**
The breakdown parsing silently falls back to an empty object if JSON parsing fails. While not a major issue, it could hide tampering attempts.

**Fix:**

```typescript
let breakdown: Record<string, number> = {};
try {
  breakdown = JSON.parse(decodeURIComponent(breakdownParam || "{}"));
} catch (error) {
  // Instead of silent failure, redirect
  if (mounted) {
    router.push("/");
  }
}
```

---

## Dependency Audit Results

**Status:** PASS
**Command:** `npm audit`
**Result:** `found 0 vulnerabilities`

**Checked Packages:**
- next@16.1.6 (Current)
- react@19.2.4 (Current)
- react-dom@19.2.4 (Current)
- typescript@5.9.3 (Current)
- tailwindcss@4.2.1 (Current)
- All dev dependencies (Current)

**Recommendation:** Set up `npm audit` in CI/CD to catch vulnerabilities early.

---

## Summary of Fixes by Priority

| Severity | Issue | Fix Time | Risk if Not Fixed |
|----------|-------|----------|-------------------|
| CRITICAL | XSS via URL params | 2 hours | Account takeover, data theft |
| CRITICAL | Client-side scoring | 4 hours | Business logic bypass, false qualifications |
| HIGH | Missing CSP header | 1 hour | Script injection, malware |
| HIGH | Threshold disclosure | 1 hour | Qualified lead manipulation |
| MEDIUM | HTTPS enforcement | 15 min | Man-in-the-middle attacks |
| MEDIUM | Input validation | 1 hour | Resource exhaustion |
| LOW | Error disclosure | 15 min | Information leakage |

**Total Estimated Fix Time:** 9 hours 15 minutes

---

## Implementation Checklist

### Phase 1: Critical Fixes (Do First)
- [ ] Add URL parameter validation to `/result` page
- [ ] Create `/api/validate-score` endpoint with server-side recalculation
- [ ] Update submit handler to call validation endpoint
- [ ] Test XSS payloads against all URL parameters
- [ ] Test score manipulation attempts

### Phase 2: High-Priority Fixes (Deploy With Phase 1)
- [ ] Add CSP headers to `next.config.ts`
- [ ] Move threshold to environment variable
- [ ] Test CSP doesn't break styling or fonts

### Phase 3: Medium-Priority Fixes (Next Sprint)
- [ ] Add HTTPS enforcement header
- [ ] Validate form input before scoring
- [ ] Set up Sentry/error logging to track tampering attempts

### Phase 4: Hardening (Optional But Recommended)
- [ ] Add rate limiting to `/api/validate-score`
- [ ] Log suspicious qualification submissions
- [ ] Add CAPTCHA to form submission
- [ ] Implement JWT token for score proof
- [ ] Add browser fingerprinting to detect multiple submissions from same machine

---

## Testing Commands

```bash
# Check CSP headers in development
curl -i http://localhost:3000 | grep -i content-security

# Run security audit
npm audit

# Type check
npm run build

# Run tests (if you add them)
npm test
```

---

## References

- [CWE-79: Improper Neutralization of Input During Web Page Generation (XSS)](https://cwe.mitre.org/data/definitions/79.html)
- [CWE-693: Protection Mechanism Failure (Missing CSP)](https://cwe.mitre.org/data/definitions/693.html)
- [OWASP Top 10 2021 - A06:2021 Vulnerable and Outdated Components](https://owasp.org/Top10/A06_2021-Vulnerable_and_Outdated_Components/)
- [Next.js Security Best Practices](https://nextjs.org/learn/foundations/how-nextjs-works/security)
- [Content Security Policy (CSP) Reference](https://content-security-policy.com/)

---

## Deployment Requirements

**Do not deploy to production without:**

1. ✅ XSS validation on result page
2. ✅ Server-side score recalculation
3. ✅ CSP headers configured
4. ✅ All tests passing
5. ✅ Security review sign-off

---

**Assessment Complete**
The Sentinel
2026-03-08
