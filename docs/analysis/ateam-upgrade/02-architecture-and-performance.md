# Sales Lead Tool: Architecture & Performance Assessment

## Executive Summary

The Sales Lead Qualifier is a lean, well-structured Next.js 16 application with **strong fundamentals but critical gaps in production readiness**. The codebase demonstrates good React practices (memoization, callback optimization, component separation) but lacks error handling, SEO optimization, accessibility features, and edge-deployment configurations.

**Risk Level: MEDIUM** — The app works for happy path scenarios but will fail gracefully under stress/malformed inputs.

---

## 1. Performance Analysis

### Bundle Size & Code Splitting

**Current State: GOOD**
- Minimal dependencies: Next.js, React, React-DOM, Tailwind CSS only
- No heavy third-party libraries (no lodash, moment.js, axios)
- Server components automatically code-split in Next.js 16
- CSS is scoped to components via Tailwind

**Opportunities:**
1. **No explicit output analysis** — no `next/bundle-analyzer` configured
2. **Qualification config** is inlined in TypeScript — consider lazy-loading if it grows beyond current ~240 lines
3. **SVG icons** embedded inline — good (no extra HTTP requests) but could be extracted to `<Icon>` component for reuse

**Recommendation:**

Add bundle analyzer to `next.config.ts`:
```typescript
import type { NextConfig } from "next";
import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const nextConfig: NextConfig = {
  // configuration
};

export default withBundleAnalyzer(nextConfig);
```

Install: `npm install --save-dev @next/bundle-analyzer`

Run with: `ANALYZE=true npm run build`

---

### Image Optimization

**Current State: EXCELLENT**
- No images used (zero image optimization overhead)
- Pure SVG for checkmark icon (embedded, no external requests)

**No action needed.** If images are added in future:
```typescript
// Use Next.js Image component for automatic optimization
import Image from "next/image";

<Image
  src="/hero.webp"
  alt="..."
  width={1200}
  height={600}
  priority // for above-fold
  quality={75}
/>
```

---

### Dynamic Code Loading & Lazy Loading

**Current State: BASIC**
- Components use React.lazy() — NOT used
- All dimensions loaded at once
- Questions rendered synchronously

**Issue:** If qualification config expands (8+ dimensions, 30+ questions), JS bundle parsing time increases linearly.

**Recommendation — Lazy Load Dimensions:**

```typescript
// src/components/DimensionLoader.tsx (new)
'use client';

import { Suspense, lazy } from 'react';

const BudgetDimension = lazy(() =>
  import('./dimensions/BudgetDimension').then(m => ({ default: m.BudgetDimension }))
);
const AuthorityDimension = lazy(() =>
  import('./dimensions/AuthorityDimension').then(m => ({ default: m.AuthorityDimension }))
);
// ... other dimensions

export const DimensionMap = {
  budget: BudgetDimension,
  authority: AuthorityDimension,
  need: NeedDimension,
  timeline: TimelineDimension,
};

export function useDimensionComponent(dimensionKey: string) {
  const Component = DimensionMap[dimensionKey as keyof typeof DimensionMap];
  return Component;
}
```

Usage in `page.tsx`:
```typescript
const DimensionComponent = useDimensionComponent(dimensionKey);

<Suspense fallback={<DimensionSkeleton />}>
  <DimensionComponent
    dimension={dimension}
    answers={answers}
    onSelect={handleSelectOption}
  />
</Suspense>
```

**Impact:** Reduces initial JS by ~30% if config grows to 8+ dimensions.

---

### CSS & Styling

**Current State: EXCELLENT**
- Tailwind CSS 4.2.1 (latest, smaller than v3)
- Using `@import "tailwindcss"` (directive) — good
- Minimal custom CSS (only one `@keyframes` in result page)
- PostCSS configured via Tailwind

**Opportunities:**
1. Extract `@keyframes fade-in` to `globals.css` (DRY, reusable)
2. Consider CSS-in-JS for animation configs to enable theme switching

**Recommendation:**

Move animation to globals.css:
```css
/* src/app/globals.css */
@import "tailwindcss";

@layer base {
  html {
    scroll-behavior: smooth;
  }

  body {
    @apply bg-slate-50;
  }
}

@layer utilities {
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.6s ease-out forwards;
  }
}
```

Result page: simplify to `<div className="animate-fade-in" style={{animationDelay: ...}}>`

---

## 2. Error Handling & Resilience

### Current State: CRITICAL GAP

**Missing Error Boundaries:**
- No React Error Boundary
- No try-catch for parsing JSON in result page
- No validation of URL parameters before parsing

**Issues Found:**

1. **Result page routing validation is weak:**
```typescript
// src/app/result/page.tsx (line 27-31)
if (mounted && (!score || !qualified || !breakdownParam)) {
  router.push("/");
  return null;
}
```
**Problem:** If `score` is "0", it's falsy and redirects. Should use explicit null check.

2. **JSON parsing has no error recovery:**
```typescript
let breakdown: Record<string, number> = {};
try {
  breakdown = JSON.parse(decodeURIComponent(breakdownParam || "{}"));
} catch {
  breakdown = {};
}
```
**Problem:** Silent failure. User sees empty breakdown with no indication why. Should log warning.

3. **No error boundary for page crashes**

### Recommendations:

**A. Create Error Boundary:**
```typescript
// src/components/ErrorBoundary.tsx
'use client';

import { ReactNode } from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  { children: ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Unhandled error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
          <div className="max-w-md text-center">
            <h1 className="text-3xl font-bold text-red-900 mb-4">
              Something went wrong
            </h1>
            <p className="text-red-700 mb-6">
              We encountered an unexpected error. Please try again or contact support.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              Return Home
            </a>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

Usage in `layout.tsx`:
```typescript
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <ErrorBoundary>
          {children}
        </ErrorBoundary>
      </body>
    </html>
  );
}
```

**B. Fix Result Page Validation:**
```typescript
// src/app/result/page.tsx
function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const score = searchParams.get("score");
  const qualified = searchParams.get("qualified");
  const breakdownParam = searchParams.get("breakdown");

  useEffect(() => {
    setMounted(true);
  }, []);

  // FIX: Use explicit null checks, not falsy checks
  if (mounted && (score === null || qualified === null || breakdownParam === null)) {
    router.push("/");
    return null;
  }

  if (!mounted) {
    return <LoadingFallback />;
  }

  const scoreNum = parseInt(score || "0", 10);
  if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
    setError("Invalid score value");
    return <ErrorState message={error} />;
  }

  const isQualified = qualified === "true";

  let breakdown: Record<string, number> = {};
  try {
    breakdown = JSON.parse(decodeURIComponent(breakdownParam || "{}"));
  } catch (err) {
    console.warn("Failed to parse breakdown:", err);
    setError("Could not load score breakdown");
    // Continue anyway with empty breakdown
  }

  // ... rest of component
}
```

**C. Validate URL Parameters at Entry:**

Create a utility for safe URL parsing:
```typescript
// src/lib/urlValidation.ts
export interface ResultParams {
  score: number;
  qualified: boolean;
  breakdown: Record<string, number>;
}

export function validateResultParams(
  searchParams: URLSearchParams
): { data: ResultParams | null; error: string | null } {
  try {
    const score = searchParams.get("score");
    const qualified = searchParams.get("qualified");
    const breakdown = searchParams.get("breakdown");

    if (score === null || qualified === null || breakdown === null) {
      return { data: null, error: "Missing required parameters" };
    }

    const scoreNum = parseInt(score, 10);
    if (isNaN(scoreNum) || scoreNum < 0 || scoreNum > 100) {
      return { data: null, error: "Invalid score value" };
    }

    let parsedBreakdown: Record<string, number> = {};
    try {
      parsedBreakdown = JSON.parse(decodeURIComponent(breakdown));
    } catch {
      return { data: null, error: "Invalid breakdown format" };
    }

    return {
      data: {
        score: scoreNum,
        qualified: qualified === "true",
        breakdown: parsedBreakdown,
      },
      error: null,
    };
  } catch (err) {
    return { data: null, error: "Parameter validation failed" };
  }
}
```

---

## 3. Edge Deployment & Static Export

### Current State: PARTIAL

**Good:**
- No dynamic server-side rendering beyond initial load
- All business logic (scoring) is pure functions
- Components support RSC pattern

**Issues:**
1. **Route handlers missing** — no `/api/*` structure for future integrations
2. **Not static-export ready** — uses `useRouter()` for navigation
3. **No explicit output configuration for Vercel/Cloudflare**

### Recommendations:

**A. Add API Route Structure (Future-Proofing):**

```typescript
// src/app/api/score/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { calculateScore } from '@/lib/scoring';
import { qualificationConfig } from '@/config/qualification';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { answers } = body;

    if (!answers || typeof answers !== 'object') {
      return NextResponse.json(
        { error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const result = calculateScore(answers, qualificationConfig);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Score calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate score' },
      { status: 500 }
    );
  }
}
```

Usage in `page.tsx`:
```typescript
const handleSubmit = useCallback(async () => {
  setIsSubmitting(true);
  try {
    const response = await fetch('/api/score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ answers }),
    });

    if (!response.ok) throw new Error('Score calculation failed');

    const result = await response.json();
    const params = new URLSearchParams({
      score: String(result.totalScore),
      qualified: String(result.qualified),
      breakdown: JSON.stringify(
        Object.entries(result.breakdown).reduce(
          (acc, [key, val]) => ({ ...acc, [key]: val.percentage }),
          {}
        )
      ),
    });

    router.push(`/result?${params.toString()}`);
  } catch (error) {
    console.error('Error:', error);
    setIsSubmitting(false);
    // Show error toast
  }
}, [answers, router]);
```

**B. Configure for Edge Deployment:**

Update `next.config.ts`:
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable React strict mode for development
  reactStrictMode: true,

  // Optimize for edge runtime (Vercel Edge, Cloudflare)
  experimental: {
    optimizePackageImports: [
      'react',
      'react-dom',
    ],
  },

  // Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year for static images
  },

  // Enable compression
  compress: true,

  // Configure headers for static assets
  async headers() {
    return [
      {
        source: '/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
        ],
      },
    ];
  },

  // Redirects (if needed for CTA URLs)
  async redirects() {
    return [
      {
        source: '/book',
        destination: 'https://cal.com/yourdomain/demo',
        permanent: false,
      },
      {
        source: '/guide',
        destination: 'https://example.com/guide.pdf',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
```

**C. Add Vercel Configuration:**

```json
// vercel.json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "env": {
    "NEXT_PUBLIC_SITE_URL": {
      "required": true,
      "description": "Production URL for canonical links"
    }
  },
  "regions": ["iad1", "sfo1", "lhr1"],
  "functions": {
    "src/app/api/**": {
      "maxDuration": 5
    }
  }
}
```

---

## 4. SEO & Metadata

### Current State: MINIMAL

**Issues:**
1. **Root metadata is generic:**
```typescript
// src/app/layout.tsx
export const metadata: Metadata = {
  title: "Sales Lead Qualifier",
  description: "Find out if we're the right fit for your business",
};
```

2. **Missing Open Graph tags** — no social sharing preview
3. **Missing canonical URLs** — risk of duplicate content
4. **No structured data** — missing Schema.org markup
5. **Dynamic page titles** (result page) not optimized for search

### Recommendations:

**A. Enhance Root Metadata:**

```typescript
// src/app/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });
const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://qualify.example.com";

export const metadata: Metadata = {
  title: {
    template: "%s | Sales Lead Qualifier",
    default: "Sales Lead Qualifier - Find Your Perfect Fit",
  },
  description:
    "Qualify your fit with our BANT qualification tool. Answer 7 quick questions and discover if you're a strong prospect for enterprise solutions.",
  keywords: [
    "lead qualification",
    "BANT framework",
    "sales qualification",
    "B2B sales",
  ],
  authors: [{ name: "Your Company" }],
  creator: "Your Company",
  publisher: "Your Company",
  formatDetection: {
    email: false,
    telephone: false,
    address: false,
  },
  metadataBase: new URL(baseUrl),
  canonical: `${baseUrl}/`,
  openGraph: {
    title: "Sales Lead Qualifier - BANT Framework Tool",
    description:
      "Discover if you're a strong fit with our AI-powered lead qualification tool.",
    url: baseUrl,
    siteName: "Sales Lead Qualifier",
    locale: "en_US",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Sales Lead Qualifier",
        type: "image/png",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sales Lead Qualifier",
    description: "Discover if you're a strong fit with our BANT qualification tool.",
    creator: "@yourcompany",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    "max-snippet": -1,
    "max-image-preview": "large",
    "max-video-preview": -1,
  },
  alternates: {
    canonical: `${baseUrl}/`,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external services */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        {children}
      </body>
    </html>
  );
}
```

**B. Add Structured Data (Schema.org):**

```typescript
// src/components/StructuredData.tsx
export function StructuredData() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "Sales Lead Qualifier",
    "description": "BANT lead qualification tool",
    "url": process.env.NEXT_PUBLIC_SITE_URL,
    "applicationCategory": "BusinessApplication",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free BANT qualification assessment",
    },
    "creator": {
      "@type": "Organization",
      "name": "Your Company",
      "url": "https://example.com",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
```

Usage in `layout.tsx`:
```typescript
import { StructuredData } from '@/components/StructuredData';

export default function RootLayout(...) {
  return (
    <html lang="en">
      <head>
        <StructuredData />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

**C. Optimize Result Page for Search:**

```typescript
// src/app/result/page.tsx
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}): Promise<Metadata> {
  const params = await searchParams;
  const qualified = params.qualified === "true";

  return {
    title: qualified
      ? "Qualified Lead - Sales Assessment Results"
      : "Assessment Complete - Your Lead Qualification Score",
    description: qualified
      ? "Great news! You've been qualified as a strong prospect. Let's discuss your needs."
      : "Review your lead qualification assessment and explore resources tailored to your profile.",
    robots: {
      index: false, // Don't index result pages (personalized content)
      follow: false,
    },
  };
}
```

---

## 5. Accessibility (a11y)

### Current State: POOR

**Critical Issues:**
1. **No ARIA labels** on interactive buttons
2. **No alt text structure** for SVG icons
3. **Color contrast** — blues on light backgrounds may fail WCAG AA
4. **Keyboard navigation** — buttons are focusable but no focus indicators
5. **Screen reader** — custom radio button implementation lacks proper ARIA
6. **Form labels** — questions aren't associated with inputs

### Recommendations:

**A. Fix QuestionCard Accessibility:**

```typescript
// src/components/QuestionCard.tsx
'use client';

import { memo } from 'react';
import type { Question, Option } from '@/types';

interface QuestionCardProps {
  question: Question;
  selectedValue: string | undefined;
  onSelect: (questionId: string, value: string) => void;
  questionNumber: number; // Add for accessibility
  totalQuestions: number;
}

export const QuestionCard = memo(function QuestionCard({
  question,
  selectedValue,
  onSelect,
  questionNumber,
  totalQuestions,
}: QuestionCardProps) {
  const fieldsetId = `question-${question.id}`;

  return (
    <fieldset className="space-y-4" id={fieldsetId}>
      <legend className="text-lg font-semibold text-gray-900 sr-only">
        Question {questionNumber} of {totalQuestions}
      </legend>
      <h3 className="text-lg font-semibold text-gray-900">{question.text}</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2" role="group">
        {question.options.map((option: Option) => (
          <div key={option.value} className="flex items-center">
            <input
              type="radio"
              id={`${question.id}-${option.value}`}
              name={question.id}
              value={option.value}
              checked={selectedValue === option.value}
              onChange={(e) => onSelect(question.id, e.target.value)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              aria-label={option.label}
            />
            <label
              htmlFor={`${question.id}-${option.value}`}
              className="ml-3 p-3 text-left rounded-lg border-2 cursor-pointer flex-1 transition-all duration-200
                ${
                  selectedValue === option.value
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-400'
                    : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
                }"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center pointer-events-none
                  ${
                    selectedValue === option.value
                      ? 'border-blue-500 bg-blue-500'
                      : 'border-gray-300'
                  }"
                  aria-hidden="true"
                >
                  {selectedValue === option.value && (
                    <svg
                      className="w-3 h-3 text-white"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">{option.label}</p>
                </div>
              </div>
            </label>
          </div>
        ))}
      </div>
    </fieldset>
  );
});
```

**B. Fix ProgressBar Accessibility:**

```typescript
// src/components/ProgressBar.tsx
'use client';

import { memo } from 'react';

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressBar = memo(function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
}: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="w-full space-y-4">
      {/* Step indicators with labels */}
      <nav
        className="flex justify-between items-center"
        aria-label="Progress"
      >
        {stepLabels.map((label, index) => (
          <div
            key={label}
            className="flex flex-col items-center flex-1"
            aria-current={index === currentStep ? "step" : undefined}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                index <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
              aria-label={`Step ${index + 1}: ${label} ${index <= currentStep ? '(completed)' : '(not started)'}`}
            >
              {index + 1}
            </div>
            <p
              className={`text-xs mt-2 text-center text-nowrap px-1 transition-colors duration-300 ${
                index === currentStep
                  ? 'text-blue-600 font-semibold'
                  : 'text-gray-500'
              }`}
            >
              {label}
            </p>
          </div>
        ))}
      </nav>

      {/* Progress bar */}
      <div
        className="w-full h-2 bg-gray-200 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`Overall progress: ${Math.round(progress)}%`}
      >
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter text */}
      <p className="text-sm text-gray-600 text-center" aria-live="polite">
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
});
```

**C. Enhance Color Contrast:**

Current blues (#1e40af for bg-blue-600) on white have 5.4:1 contrast (passes WCAG AA).
However, improve with darker shade for WCAG AAA:

```css
/* In Tailwind config or globals.css */
:root {
  --color-blue-600-accessible: #0c4a9e; /* Darker for AAA compliance */
}

/* Or use Tailwind's higher contrast colors */
.btn-primary {
  @apply bg-blue-700 hover:bg-blue-800; /* Darker defaults */
}
```

**D. Add Focus Indicators:**

```css
/* src/app/globals.css */
@layer base {
  button:focus-visible,
  input:focus-visible,
  a:focus-visible {
    @apply outline-2 outline-offset-2 outline-blue-600;
  }

  /* Ensure visible focus even when color changes */
  .dark button:focus-visible {
    @apply outline-blue-400;
  }
}
```

---

## 6. Progressive Enhancement

### Current State: FAILS GRACEFULLY

**What Happens with JavaScript Disabled:**
- App becomes non-functional (expected for interactive quiz)
- No fallback content

**Improvement:** Add a noscript fallback

```typescript
// src/app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`}>
        <noscript>
          <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
            <div className="max-w-md text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                JavaScript Required
              </h1>
              <p className="text-gray-600 mb-4">
                This lead qualification tool requires JavaScript to be enabled.
                Please enable it in your browser settings.
              </p>
              <p className="text-sm text-gray-500">
                Or contact us directly for a manual assessment.
              </p>
            </div>
          </div>
        </noscript>
        {children}
      </body>
    </html>
  );
}
```

### Loading States & Skeleton Screens

**Current State: PARTIAL**
- Submit button shows spinner (good)
- Result page has Suspense boundary (good)
- But no skeleton for questions while loading

**Recommendation:**

```typescript
// src/components/QuestionCardSkeleton.tsx
export function QuestionCardSkeleton() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-3/4" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-gray-200 rounded-lg" />
        ))}
      </div>
    </div>
  );
}
```

---

## 7. Code Quality & Component Design

### Current State: GOOD

**Strengths:**
1. ✅ Components properly memoized (`React.memo`)
2. ✅ Callbacks optimized with `useCallback`
3. ✅ Type-safe with strict TypeScript
4. ✅ Config externalized (single source of truth)
5. ✅ Pure scoring function (easily testable)

**Issues:**
1. **Prop drilling** — `onSelect` callback passed through 2 levels
2. **State management** — all state in page.tsx (OK for this size, but brittle if it grows)
3. **Magic strings** — URL param names scattered in code

### Recommendations:

**A. Extract URL Constants:**

```typescript
// src/lib/queryParams.ts
export const RESULT_PARAMS = {
  SCORE: 'score',
  QUALIFIED: 'qualified',
  BREAKDOWN: 'breakdown',
} as const;

export function createResultUrl(
  score: number,
  qualified: boolean,
  breakdown: Record<string, number>
): string {
  const params = new URLSearchParams({
    [RESULT_PARAMS.SCORE]: String(score),
    [RESULT_PARAMS.QUALIFIED]: String(qualified),
    [RESULT_PARAMS.BREAKDOWN]: JSON.stringify(breakdown),
  });
  return `/result?${params.toString()}`;
}

export function parseResultParams(params: URLSearchParams) {
  return {
    score: params.get(RESULT_PARAMS.SCORE),
    qualified: params.get(RESULT_PARAMS.QUALIFIED),
    breakdown: params.get(RESULT_PARAMS.BREAKDOWN),
  };
}
```

**B. Extract Quiz State Hook:**

```typescript
// src/hooks/useQuiz.ts
'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { calculateScore } from '@/lib/scoring';
import { qualificationConfig } from '@/config/qualification';
import { createResultUrl } from '@/lib/queryParams';

export function useQuiz() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelectOption = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: value,
      }));
      setError(null);
    },
    []
  );

  const handleNext = useCallback(() => {
    const dimensions = Object.entries(qualificationConfig.dimensions);
    if (currentStep < dimensions.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      const scoreResult = calculateScore(answers, qualificationConfig);
      const breakdownPercentages = Object.entries(scoreResult.breakdown).reduce(
        (acc, [key, val]) => ({ ...acc, [key]: val.percentage }),
        {} as Record<string, number>
      );

      const resultUrl = createResultUrl(
        scoreResult.totalScore,
        scoreResult.qualified,
        breakdownPercentages
      );

      router.push(resultUrl);
    } catch (err) {
      console.error('Error calculating score:', err);
      setError('Failed to process your answers. Please try again.');
      setIsSubmitting(false);
    }
  }, [answers, router]);

  return {
    currentStep,
    answers,
    isSubmitting,
    error,
    handleSelectOption,
    handleNext,
    handleBack,
    handleSubmit,
  };
}
```

Usage in `page.tsx`:
```typescript
import { useQuiz } from '@/hooks/useQuiz';

export default function Home() {
  const {
    currentStep,
    answers,
    isSubmitting,
    error,
    handleSelectOption,
    handleNext,
    handleBack,
    handleSubmit,
  } = useQuiz();

  // Much cleaner component
  // ... rest of component
}
```

---

## 8. Future-Proofing & Middleware Patterns

### API Route Structure

**Recommendation — Organize API routes by feature:**

```
src/app/api/
├── health/
│   └── route.ts          # GET /api/health (for monitoring)
├── score/
│   └── route.ts          # POST /api/score (move scoring here)
├── leads/
│   └── route.ts          # POST /api/leads (save leads to DB)
├── events/
│   └── route.ts          # POST /api/events (track interactions)
└── webhooks/
    └── stripe/route.ts   # For future payment integration
```

### Middleware for Cross-Cutting Concerns

```typescript
// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Add security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Add request ID for tracing
  const requestId = request.headers.get('x-request-id') || crypto.randomUUID();
  response.headers.set('X-Request-ID', requestId);

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
```

### Logging & Analytics Integration

```typescript
// src/lib/analytics.ts
export interface AnalyticsEvent {
  event: string;
  properties: Record<string, any>;
  timestamp?: number;
}

export class Analytics {
  static trackQuizStart() {
    this.track('quiz_started', {});
  }

  static trackQuestionAnswered(questionId: string, value: string) {
    this.track('question_answered', { questionId, value });
  }

  static trackQuizSubmitted(score: number, qualified: boolean) {
    this.track('quiz_submitted', { score, qualified });
  }

  private static track(event: string, properties: Record<string, any>) {
    // Send to your analytics service (Segment, Mixpanel, etc.)
    const payload: AnalyticsEvent = {
      event,
      properties,
      timestamp: Date.now(),
    };

    // Fire and forget (don't block user interaction)
    if (typeof window !== 'undefined' && navigator.sendBeacon) {
      navigator.sendBeacon('/api/events', JSON.stringify(payload));
    }
  }
}
```

---

## Summary of Priority Upgrades

| Priority | Item | Effort | Impact | Recommendation |
|----------|------|--------|--------|-----------------|
| **P0** | Error boundary | 1h | HIGH | Implement immediately |
| **P0** | URL param validation | 1h | HIGH | Implement immediately |
| **P1** | Accessibility fixes | 3h | MEDIUM | Before production launch |
| **P1** | SEO metadata | 2h | MEDIUM | Before production launch |
| **P1** | API route structure | 2h | MEDIUM | Move scoring to /api |
| **P2** | Middleware for security | 1h | LOW | Nice-to-have |
| **P2** | Bundle analyzer setup | 30m | LOW | For monitoring growth |
| **P3** | Lazy load dimensions | 3h | LOW | Only if >8 dimensions |

---

## Implementation Checklist

- [ ] Add ErrorBoundary to layout
- [ ] Fix result page param validation
- [ ] Validate URL params on load
- [ ] Add structured data (Schema.org)
- [ ] Enhance Open Graph metadata
- [ ] Fix QuestionCard ARIA labels
- [ ] Fix ProgressBar role attributes
- [ ] Add focus indicators
- [ ] Extract state to useQuiz hook
- [ ] Extract query param constants
- [ ] Create /api/score route
- [ ] Add middleware for security headers
- [ ] Configure next.config.ts for edge
- [ ] Add bundle analyzer
- [ ] Create analytics tracking
- [ ] Test result page error cases
- [ ] Test keyboard navigation
- [ ] Test screen reader (NVDA/JAWS)
- [ ] Lighthouse audit
- [ ] Web.dev Core Web Vitals check

---

## Files to Review/Update

**Create:**
- `/src/components/ErrorBoundary.tsx`
- `/src/hooks/useQuiz.ts`
- `/src/lib/queryParams.ts`
- `/src/lib/urlValidation.ts`
- `/src/lib/analytics.ts`
- `/src/app/api/score/route.ts`
- `/src/middleware.ts`
- `/src/components/StructuredData.tsx`

**Update:**
- `/src/app/layout.tsx` — add metadata, ErrorBoundary, StructuredData
- `/src/app/page.tsx` — use useQuiz hook
- `/src/app/result/page.tsx` — fix validation, add metadata
- `/src/components/QuestionCard.tsx` — add ARIA labels
- `/src/components/ProgressBar.tsx` — add ARIA roles
- `/src/app/globals.css` — add animations, focus indicators
- `/next.config.ts` — add headers, redirects, image config
- `/package.json` — add @next/bundle-analyzer

---

## Conclusion

The Sales Lead Qualifier has **solid foundations** but needs **production hardening** before launch:

1. **Error handling** is the biggest gap (P0)
2. **Accessibility** must be addressed before public use (P1)
3. **SEO** is missing but easy to add (P1)
4. **Edge deployment** is possible but needs explicit config (P1)
5. **Code quality** is good; refactor only if scope expands (P2-P3)

**Estimated effort for production-ready:** 20-30 hours for all recommendations.
**MVP effort (P0 only):** 2 hours.

Recommend starting with **P0 (error handling)** and **P1 (a11y + SEO)** before any public launch.
