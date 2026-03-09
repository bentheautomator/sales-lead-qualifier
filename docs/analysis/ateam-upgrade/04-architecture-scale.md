# Architecture & Deployment — The Architect

**Owner:** The Architect
**Estimated effort:** 1-2 days
**Phase:** 4 (parallel with Phases 1-3)
**Goal:** Production-ready infrastructure, global deployment, monitoring, performance optimization.

---

## Overview

Current state: Local Next.js dev server. No deployment infrastructure.

Target state: Vercel Edge deployment, Core Web Vitals green, error tracking, analytics.

---

## 1. Vercel Deployment Configuration

**File:** `vercel.json`

```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev -- --port 4200",
  "installCommand": "npm install",
  "env": {
    "NEXT_PUBLIC_BASE_URL": {
      "type": "string",
      "description": "Base URL for the application",
      "default": "https://qualifier.example.com"
    },
    "ANTHROPIC_API_KEY": {
      "type": "string",
      "description": "Anthropic API key for Claude API calls",
      "required": true
    }
  },
  "functions": {
    "api/insights/route.ts": {
      "memory": 1024,
      "maxDuration": 10,
      "runtime": "edge"
    },
    "middleware.ts": {
      "runtime": "edge"
    }
  },
  "regions": ["iad1", "sfo1", "arn1"],
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  }
}
```

**Why:** Explicit configuration ensures consistent deployments. Edge functions run at CDN edge for low latency. Multi-region for global availability.

---

## 2. Next.js Configuration Optimization

**File:** `next.config.js` (comprehensive)

```javascript
// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Enable SWR caching for images
  images: {
    remotePatterns: [],
    formats: ["image/avif", "image/webp"],
    cacheControl: "public, max-age=31536000, immutable",
  },

  // Compression
  compress: true,

  // Security headers
  headers: async () => {
    return [
      {
        source: "/(.*)",
        headers: [
          // CSP (from security section)
          {
            key: "Content-Security-Policy",
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.vercel-insights.com https://vitals.vercel-analytics.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https: blob:; font-src 'self' data:; connect-src 'self' https://api.anthropic.com https://vitals.vercel-analytics.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`,
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },

  // Redirects (if needed)
  redirects: async () => {
    return [
      {
        source: "/old-url",
        destination: "/",
        permanent: true,
      },
    ];
  },

  // Rewrites (if needed)
  rewrites: async () => {
    return {
      beforeFiles: [],
      afterFiles: [],
      fallback: [],
    };
  },

  // Environment variables validation
  env: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:4200",
  },

  // Experimental features
  experimental: {
    // Optimized font loading
    optimizeFonts: true,
  },

  // Production source maps (for error tracking)
  productionBrowserSourceMaps: true,

  // Output mode for edge deployment
  outputFileTracing: true,
};

module.exports = nextConfig;
```

**Why:** Optimization flags improve Core Web Vitals. Source maps help with error tracking.

---

## 3. Performance Monitoring

**File:** `src/app/layout.tsx` (add monitoring)

```typescript
import { Suspense } from 'react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Other head content */}
      </head>
      <body>
        {children}

        {/* Vercel Analytics - Core Web Vitals tracking */}
        <Suspense fallback={null}>
          <Analytics />
          <SpeedInsights />
        </Suspense>
      </body>
    </html>
  );
}
```

**Install:**

```bash
npm install @vercel/analytics @vercel/speed-insights
```

**Why:** Monitor LCP, FID, CLS, and other Core Web Vitals in production.

---

## 4. Error Tracking with Sentry

**File:** `sentry.client.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  integrations: [
    new Sentry.Replay({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Performance Monitoring
  tracesSampleRate: 1.0,
  // Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

**File:** `sentry.server.config.ts`

```typescript
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  integrations: [new Sentry.Prisma()],
  tracesSampleRate: 1.0,
  environment: process.env.NODE_ENV,
});
```

**Install:**

```bash
npm install @sentry/nextjs
npx @sentry/wizard@latest -i nextjs
```

**Usage in components:**

```typescript
import * as Sentry from "@sentry/nextjs";

try {
  // Code that might throw
} catch (error) {
  Sentry.captureException(error);
}
```

**Environment variables:**

```
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project
SENTRY_DSN=https://key@sentry.io/project
SENTRY_AUTH_TOKEN=token_for_release_tracking
```

**Why:** Automatic error tracking, performance monitoring, user session replays.

---

## 5. Database Setup (Optional for Phase 2)

If adding lead persistence, use Neon (serverless Postgres):

**Install:**

```bash
npm install @prisma/client
npm install -D prisma
npx prisma init
```

**File:** `prisma/schema.prisma`

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

generator client {
  provider = "prisma-client-js"
}

model Lead {
  id        String   @id @default(cuid())
  score     Float    @db.Float
  qualified Boolean
  breakdown Json     // Dimension scores
  answers   Json     // Full answers
  profile   Json     // Company profile
  source    String?  // referrer, utm_source, etc
  email     String?  @db.VarChar(255)
  company   String?  @db.VarChar(255)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  // Webhooks
  webhooks  Webhook[]

  // Indexes for querying
  @@index([createdAt])
  @@index([qualified])
  @@index([score])
}

model Webhook {
  id        String   @id @default(cuid())
  leadId    String
  lead      Lead     @relation(fields: [leadId], references: [id], onDelete: Cascade)
  endpoint  String   @db.VarChar(500)
  status    String   @default("pending") // pending, sent, failed
  response  String?  @db.Text
  sentAt    DateTime?
  createdAt DateTime @default(now())

  @@index([status])
  @@index([createdAt])
}

// For session state if needed
model Session {
  id        String   @id @default(cuid())
  answers   Json     // Partial form answers
  step      Int      @default(0)
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([expiresAt])
}
```

**Migrations:**

```bash
npx prisma migrate dev --name init
```

**Why:** Serverless Postgres scales automatically. Prisma provides type-safe queries.

---

## 6. Middleware for Cross-Cutting Concerns

**File:** `src/middleware.ts` (comprehensive)

```typescript
import { NextRequest, NextResponse } from "next/server";

const ALLOWED_HOSTS = ["localhost:4200", "localhost:3000", "qualifier.example.com"];

export function middleware(request: NextRequest) {
  const { pathname, hostname } = request.nextUrl;

  // Host validation (prevent host header attacks)
  if (!ALLOWED_HOSTS.includes(hostname)) {
    return new NextResponse("Invalid host", { status: 403 });
  }

  // Rate limiting for API routes
  if (pathname.startsWith("/api/")) {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    const key = `rate-limit:${ip}`;

    // TODO: Check rate limit from KV store
    // If rate limited: return new NextResponse('Too many requests', { status: 429 })
  }

  // Add security headers
  const response = NextResponse.next();
  response.headers.set("X-Request-ID", crypto.randomUUID());
  response.headers.set("X-Forwarded-Proto", "https");

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
```

**Why:** Centralized request handling. Rate limiting, host validation, request ID tracking.

---

## 7. Environment Configuration

**File:** `.env.example`

```
# Application
NEXT_PUBLIC_BASE_URL=https://qualifier.example.com
NODE_ENV=production

# API Keys
ANTHROPIC_API_KEY=sk-ant-...

# Database (optional)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Monitoring
NEXT_PUBLIC_SENTRY_DSN=https://key@sentry.io/project
SENTRY_DSN=https://key@sentry.io/project
SENTRY_AUTH_TOKEN=...

# Analytics
NEXT_PUBLIC_GA_ID=G-...
```

**Why:** Centralized config. Clear which variables are public vs. private.

---

## 8. Build Optimization

**File:** `tsconfig.json` (ensure optimization flags)

```json
{
  "compilerOptions": {
    "strict": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "noEmit": true,
    "jsx": "react-jsx",
    "types": ["node", "jest", "@testing-library/jest-dom"]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

**Analyze bundle size:**

```bash
npm install -D @next/bundle-analyzer
```

**File:** `next.config.js` (add analyzer)

```javascript
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

module.exports = withBundleAnalyzer(nextConfig);
```

**Run analysis:**

```bash
ANALYZE=true npm run build
```

**Why:** Identify and eliminate unused dependencies. Reduce bundle size.

---

## 9. Deployment Strategy

**Staging environment (develop branch):**

```yaml
# .github/workflows/deploy-staging.yml
name: Deploy to Staging

on:
  push:
    branches: [develop]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          environment-url: https://staging.qualifier.example.com
```

**Production environment (main branch):**

```yaml
# .github/workflows/deploy-prod.yml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: "20"
      - run: npm ci && npm run test && npm run lint

  deploy:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: vercel/action@v4
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          scope: ${{ secrets.VERCEL_ORG_ID }}
          production: true
```

**Why:** Automated deployments on every commit. Tests run before prod deployment.

---

## 10. Monitoring & Alerting

**Vercel Dashboard:**

- Monitor deployments
- View analytics
- Set up alerts for errors, performance degradation

**Sentry Dashboard:**

- Error tracking
- Performance monitoring
- Session replays

**Custom Dashboards:**

Create `src/app/admin/dashboard/page.tsx` (if adding admin):

```typescript
// Example: Show recent qualified leads, error rate, API latency
export default function Dashboard() {
  return (
    <div className="grid grid-cols-4 gap-4 p-8">
      <Card title="Qualified Leads (24h)" value={42} />
      <Card title="Conversion Rate" value="18.5%" />
      <Card title="Avg Response Time" value="245ms" />
      <Card title="Error Rate" value="0.02%" />
    </div>
  );
}
```

---

## Performance Targets

| Metric                         | Target      | Current | Action                       |
| ------------------------------ | ----------- | ------- | ---------------------------- |
| LCP (Largest Contentful Paint) | <2.5s       | TBD     | Optimize fonts, images       |
| FID (First Input Delay)        | <100ms      | TBD     | Code splitting               |
| CLS (Cumulative Layout Shift)  | <0.1        | TBD     | Fixed sizes on animations    |
| TTFB (Time to First Byte)      | <200ms      | TBD     | Edge caching                 |
| Bundle Size                    | <100KB (JS) | TBD     | Tree-shaking, code splitting |

**Monitoring:**

- Run Lighthouse after each deploy
- Track Core Web Vitals in production
- Set up alerts for regressions

---

## Scaling Considerations

**Current:** Single Next.js app on Vercel.

**Phase 2 (if needed):**

- Add Neon Postgres database
- Implement Redis caching layer (Vercel KV)
- Set up CDN for static assets (included with Vercel)

**Phase 3 (if needed):**

- Separate frontend and API
- GraphQL API layer
- Dedicated monitoring infrastructure

---

## Testing Deployment

**Local:**

```bash
npm run build
npm start
```

**Staging (Vercel):**

- Deploy from develop branch
- Run smoke tests against staging
- Verify error tracking works

**Production (Vercel):**

- Require PR approvals
- Run full test suite
- Automated performance checks
- Rollback plan if needed

---

## Rollback Plan

**If production deployment breaks:**

```bash
# Vercel automatically keeps previous deployments
# Rollback via Vercel dashboard or CLI:
vercel rollback
```

**Automatic rollback triggers:**

- Critical error rate threshold (>1%)
- Performance regression (LCP >3.5s)
- Unhandled exceptions

---

## Infrastructure Checklist

- [ ] Vercel project created and configured
- [ ] Environment variables set in Vercel
- [ ] GitHub repository connected
- [ ] CI/CD workflows configured
- [ ] Sentry project created and configured
- [ ] Analytics enabled (Vercel Analytics + Sentry)
- [ ] Custom domain DNS configured
- [ ] SSL certificate verified
- [ ] Backups configured (if using database)
- [ ] Monitoring alerts set up
- [ ] Error tracking dashboard accessible
- [ ] Performance monitoring enabled
- [ ] Documentation updated with deployment steps

---

## Deployment Commands

```bash
# Local development
npm run dev

# Build for production
npm run build

# Test production build locally
npm start

# Deploy to Vercel (via git)
git push origin main

# Deploy specific branch to Vercel
vercel --prod --scope=your-org

# Rollback to previous deployment
vercel rollback

# View logs
vercel logs --follow

# Check environment variables
vercel env pull
```

---

## Next Steps

1. Set up Vercel project and connect GitHub
2. Configure environment variables
3. Add Sentry integration
4. Enable Vercel Analytics
5. Create GitHub Actions workflows
6. Test deployment to staging
7. Run Lighthouse audit
8. Monitor production metrics
9. Set up alerting
10. Document deployment process

---

**Owner:** The Architect
**Next review:** After Phase 4 completion (Day 4)
