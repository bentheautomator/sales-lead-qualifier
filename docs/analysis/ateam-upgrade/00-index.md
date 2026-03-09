# Sales Lead Qualifier: 10,000% Upgrade Plan

**Vision:** Transform the Sales Lead Qualifier from a bootcamp MVP into a premium SaaS-grade lead qualification engine with enterprise security, AI-powered intelligence, visual polish that stuns, and CRM integration readiness.

**Current State:** Multi-step BANT form, config-driven scoring, 20 passing tests, basic UI.

**Target State:** Premium product with real-time AI insights, adaptive scoring, sparkly animations, production-grade security, and webhook infrastructure for CRM/automation platforms.

---

## Executive Summary

This plan coordinates The Automators' specialized expertise to elevate the qualifier:

1. **Ben (Vision Lead)** — Orchestrates the upgrade across crew, validates business strategy
2. **The Alchemist (@ai)** — AI-powered scoring insights, adaptive qualification logic
3. **The Architect (@devops)** — Edge deployment, performance optimization, scalability
4. **The Catalyst (@automation)** — Webhook infrastructure, Zapier/Make integration, API endpoints
5. **The Sentinel (@sec)** — Security hardening, CSP headers, input validation, rate limiting
6. **Lord Business (@biz)** — Business model validation, pricing considerations, ROI positioning

**Estimated effort:** 5-7 days (balanced execution mode)

---

## Crew Assignments (Click to expand)

### 1. Visual & UX Excellence (The Alchemist Lead)

**File:** `01-visual-ux-overhaul.md`

Transform the boring form into a $50K SaaS landing page experience:

- Sparkle animations (canvas-based particle effects)
- Glassmorphism cards with backdrop blur
- Gradient backgrounds with animated SVG accents
- Micro-interactions: button hover states, selection feedback
- Smooth page transitions with Framer Motion
- Dark mode support (toggle in header)
- Loading states that delight
- Confetti/celebration effect on qualification

**Key files to create/modify:**

- `src/app/globals.css` — Tailwind v4 custom keyframes, animation library
- `src/components/SparkleEffect.tsx` — Canvas-based particle emitter
- `src/components/AnimatedGradient.tsx` — SVG background animations
- `src/app/layout.tsx` — Dark mode provider, animation setup
- `src/app/page.tsx` — Enhanced styling with Glassmorphic cards
- `src/app/result/page.tsx` — Celebration effects, better score visualization

**Dependencies to add:**

- `framer-motion` (v11+) for animation orchestration
- `tailwindcss-animate` (built-in to Tailwind v4)
- `lucide-react` for beautiful SVG icons

---

### 2. AI-Powered Intelligence & Adaptive Scoring (The Alchemist)

**File:** `02-ai-intelligence.md`

Add smart, adaptive qualification logic:

- **AI follow-up suggestions** — After submission, suggest talking points based on weak BANT areas
- **Adaptive scoring** — Dynamically adjust weights based on industry/company size hints
- **Risk scoring** — Identify red flags (low need + low budget = churn risk)
- **Qualification insights** — "Your Authority score is 45%. Recommend: Find the CFO before next call."
- **Historical scoring** — Compare this lead to past qualified/disqualified patterns (if backend exists)

**Architecture:**

- Client-side prompt engineering (use Claude API in edge function or client)
- Config-driven LLM prompts (extract from qualification.ts)
- Stream responses to UI for real-time feel
- Structured output via tool_use for consistent JSON

**Key files to create/modify:**

- `src/lib/ai-insights.ts` — Prompt engineering, formatting logic
- `src/app/api/insights/route.ts` — Edge function (Vercel Edge) or API route for Claude API calls
- `src/app/result/page.tsx` — Display AI suggestions panel
- `src/config/qualification.ts` — Add `aiPrompts` section for LLM instructions

**Models:** Claude 3.5 Sonnet (fast, cheap) or Haiku for real-time streaming

---

### 3. Security Hardening (The Sentinel)

**File:** `03-security-lockdown.md`

Production-grade security:

- **CSP headers** (Content Security Policy) — Prevent XSS, script injection
- **Input validation** — Sanitize form inputs, URL params (query string injection)
- **Rate limiting** — Prevent form spam, API abuse (per IP or device fingerprint)
- **CSRF protection** — If adding backend, implement tokens
- **Secure headers** — X-Frame-Options, X-Content-Type-Options, Strict-Transport-Security
- **Data sanitization** — Strip HTML from URL params before displaying
- **Cookie security** — If tracking session state, HttpOnly + Secure flags

**Key files to create/modify:**

- `next.config.js` — Add security headers middleware
- `src/middleware.ts` — Request validation, rate limiting check
- `src/app/layout.tsx` — CSP meta tag
- `src/app/result/page.tsx` — Sanitize URL params with DOMPurify
- `src/lib/validation.ts` — Input schema validation (Zod)

**Dependencies to add:**

- `zod` (lightweight schema validation)
- `dompurify` (HTML sanitization)
- `rate-limit` or `Ratelimit` from `@vercel/edge-config` (edge-deployed rate limiting)

---

### 4. Architecture & Deployment (The Architect)

**File:** `04-architecture-scale.md`

Production-ready infrastructure:

- **Edge deployment** (Vercel, Cloudflare) — Global CDN, instant cold starts
- **Performance optimization** — Image optimization, font strategy, bundle analysis
- **Error boundaries** — Graceful fallbacks, user-friendly error messages
- **Analytics & monitoring** — Web Vitals, error tracking, conversion funnel
- **Environment management** — Dev/staging/prod configs
- **Database considerations** — If adding persistence (lead storage, historical data)

**Key files to create/modify:**

- `next.config.js` — Edge functions, image optimization, bundle analysis
- `src/middleware.ts` — Global request/response transformation
- `src/app/layout.tsx` — Script tags for analytics (Vercel Web Analytics, Sentry)
- `src/lib/monitoring.ts` — Custom error reporting
- `vercel.json` (if needed) — Environment variables, deployment config

**Infrastructure:**

- Vercel Edge Functions for rate limiting + AI insights
- Vercel KV for rate limiting state (if needed)
- Sentry for error tracking
- Vercel Analytics for Core Web Vitals

---

### 5. Integration Readiness (The Catalyst)

**File:** `05-api-integrations.md`

Prepare webhooks and CRM APIs:

- **Webhook endpoints** — POST `/api/webhooks/qualified` with full lead data
- **Zapier/Make.com templates** — Pre-built automation recipes
- **CRM connectors** — HubSpot, Salesforce, Pipedrive SDK prep
- **Lead export** — Download CSV of qualified leads
- **Lead management UI** — Simple dashboard to view past submissions
- **Idempotency** — Prevent duplicate leads via request ID headers

**Key files to create/modify:**

- `src/app/api/leads/route.ts` — POST/GET for lead storage and retrieval
- `src/app/api/webhooks/route.ts` — External system integration endpoints
- `src/app/api/export/route.ts` — CSV/JSON export of leads
- `src/db/schema.ts` — Prisma schema for lead storage (optional, Neon Postgres)
- `src/lib/integrations/` — Adapter modules for HubSpot, Salesforce, etc.

**Database:** Neon (serverless Postgres) for lead persistence. Optional for MVP, required for scale.

---

### 6. Business & Positioning (Lord Business)

**File:** `06-business-strategy.md`

Validate commercial viability:

- **Positioning** — Is this a freemium tool? White-label? Enterprise product?
- **Pricing** — Usage-based? Seat-based? Per-qualified-lead? Free with optional AI insights?
- **Conversion funnel** — Where does money enter? (Qualified CTA → demo booking → sales)
- **Competitive analysis** — How do Clearbit, ZoomInfo, LeadIQ position their qual tools?
- **ROI narrative** — "Reduce disqualified lead spend by 40%" or "Book 3x more qualified demos"
- **Feature prioritization** — MVP features vs. Phase 2 nice-to-haves

**Considerations:**

- Free tier: Basic BANT form, no AI insights
- Pro tier: AI follow-ups, historical comparison, custom thresholds
- Enterprise: White-label, custom integrations, dedicated support

---

## Implementation Timeline

### Phase 1: Visual Wow (Days 1-2) — The Alchemist

- Add Framer Motion, animate components
- Sparkle effects, gradient backgrounds
- Dark mode toggle
- Confetti on qualification
- Button micro-interactions

### Phase 2: AI Intelligence (Days 2-3) — The Alchemist + Catalyst

- Add Claude API calls for insights
- Stream AI follow-ups to result page
- Adaptive scoring logic
- Risk flagging

### Phase 3: Security Lock (Day 3) — The Sentinel

- CSP headers
- Input validation (Zod)
- Rate limiting middleware
- Secure URL param sanitization

### Phase 4: Architecture & Monitoring (Day 4) — The Architect

- Vercel Edge deployment
- Sentry error tracking
- Web Vitals monitoring
- Performance optimization

### Phase 5: API & Webhooks (Days 4-5) — The Catalyst

- Lead storage endpoint
- Webhook infrastructure
- Zapier integration template
- CSV export

### Phase 6: Business Validation (Day 5) — Lord Business + Ben

- Finalize positioning
- Update CTAs based on business model
- Create case study narrative
- Plan Phase 2 feature roadmap

---

## Key Decisions Ben Must Make

1. **AI Integration Approach**
   - Option A: Client-side Claude SDK (simple, fast, privacy-focused)
   - Option B: Edge Function API (more secure API keys, centralized)
   - Option C: Backend API (requires infrastructure, more control)

2. **Data Persistence**
   - Store qualified leads in database? (Neon Postgres)
   - Or stateless MVP (results only in URL)?

3. **Pricing Model**
   - Freemium (basic BANT free, AI insights paid)?
   - White-label licensing?
   - Lead quota-based (free 100 leads/month)?

4. **CRM Focus**
   - HubSpot first? (most popular for SMBs)
   - Salesforce? (enterprise)
   - All via generic webhooks?

5. **MVP vs. Scale**
   - Launch Phase 1-3 as MVP (visual + AI + security)?
   - Or wait for full Phase 1-6?

---

## Success Criteria

- [ ] Page loads in <1.5s (Core Web Vitals: LCP, FID, CLS all green)
- [ ] Visual design indistinguishable from $50K SaaS product
- [ ] AI insights stream in <2s after form submission
- [ ] 100% of XSS/injection attack vectors blocked (CSP + input validation)
- [ ] Rate limiting prevents abuse (max 10 form submissions per IP per hour)
- [ ] Webhook infrastructure ready for Zapier templates
- [ ] Dark mode works flawlessly across all pages
- [ ] All 20 existing tests still pass + 15+ new tests for AI/security/UX
- [ ] Business model clearly defined, CTAs optimized
- [ ] Deployment ready on Vercel with edge functions

---

## Detailed Sub-Plans

- **[01-visual-ux-overhaul.md](01-visual-ux-overhaul.md)** — Sparkles, animations, glassmorphism
- **[02-ai-intelligence.md](02-ai-intelligence.md)** — Claude API integration, adaptive scoring
- **[03-security-lockdown.md](03-security-lockdown.md)** — CSP, rate limiting, input validation
- **[04-architecture-scale.md](04-architecture-scale.md)** — Edge deployment, monitoring, optimization
- **[05-api-integrations.md](05-api-integrations.md)** — Webhooks, CRM connectors, lead storage
- **[06-business-strategy.md](06-business-strategy.md)** — Positioning, pricing, ROI narrative

---

## Start Here

1. **Ben** reads this index and decides on AI integration approach, data persistence, and pricing model
2. **The Alchemist** starts Phase 1 (visual overhaul) in parallel with Phase 2 prep
3. **The Sentinel** prepares Phase 3 security specs in parallel
4. **The Architect** stages Phase 4 infrastructure
5. **The Catalyst** designs Phase 5 API contracts
6. **Lord Business** validates competitive positioning

Next step: Daily standups, one crew member per day presenting progress.

---

**Last updated:** 2026-03-08
**Version:** 1.0 (Planning phase complete)
