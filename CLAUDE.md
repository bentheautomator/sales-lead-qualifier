# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Sales Lead Qualifier** — A config-driven BANT qualification tool that determines if a prospect is a good fit for our services. Uses Next.js 15, TypeScript, and Tailwind CSS v4.

The entire qualification logic lives in a single config file. Change the criteria there, redeploy — no code changes needed.

## Commands

```bash
npm run dev          # Start dev server on port 4200
npm run build        # Build for production
npm run lint         # Run ESLint
npm test             # Run Jest suite once
npm run test:watch   # Watch mode for tests
```

## Architecture

### Config-Driven Scoring

**`src/config/qualification.ts`** — Single source of truth for all qualification rules.

Each BANT dimension has weighted questions with point values (0-100 per option). The config defines dimensions, weights, threshold, and outcome CTAs. To adjust: change question options/points, dimension weights, or the qualification threshold. Redeploy.

### Scoring Engine

**`src/lib/scoring.ts`** — Pure function that evaluates answers against config.

`calculateScore(answers, config)` returns `{ totalScore, qualified, breakdown }`. Pure function — no side effects, no API calls, entirely client-side.

### Multi-Step Form

**`src/app/page.tsx`** — Walks prospect through BANT dimensions, one question at a time.

- Uses React state to track answers across form steps
- Collects user responses for Budget, Authority, Need, Timeline
- On submit: POSTs answers to `/api/score`, which validates, scores server-side, sets a signed HttpOnly cookie, and redirects to `/result`

### Result Page

**`src/app/result/page.tsx`** — Shows qualification outcome.

- Fetches score from `/api/result` (reads signed HttpOnly cookie server-side)
- Shows pass/fail messaging with CTA
- No database queries — score data lives in HMAC-signed cookie

### Components

**`src/components/`**

- `ProgressBar.tsx` — Visual progress indicator (step N of M)
- `QuestionCard.tsx` — Consistent card layout for each BANT question

## Key Design Decisions

1. **Server-side scoring with signed cookies** — Answers are POST'd to `/api/score`, scored server-side, and results stored in an HMAC-signed HttpOnly cookie. No sensitive data in URLs.
2. **Config file is the API** — Product team can tweak thresholds without touching code. Version control captures changes.
3. **BANT framework** — Budget (30%), Authority (25%), Need (30%), Timeline (15%). Weights sum to 100%.
4. **Single-question-per-step UX** — Reduces cognitive load. Users understand exactly what we're asking.

## Testing

Jest + ts-jest configuration. Tests in `__tests__/`.

**Run specific test:**

```bash
npx jest __tests__/scoring.test.ts
```

**Watch mode:**

```bash
npm run test:watch
```

Focus on:

- Scoring logic (`scoring.test.ts`) — edge cases, boundary thresholds, weight calculations
- Component rendering (`ProgressBar.test.tsx`, `QuestionCard.test.tsx`)
- Config validation (if qualificationConfig changes, tests should catch invalid thresholds)

## File Structure

```
src/
├── app/
│   ├── layout.tsx          # Root layout, metadata, fonts
│   ├── globals.css         # Tailwind v4 + custom styles
│   ├── page.tsx            # Multi-step form
│   └── result/
│       └── page.tsx        # Result display
├── components/
│   ├── ProgressBar.tsx
│   └── QuestionCard.tsx
├── config/
│   └── qualification.ts    # BANT rules & thresholds
├── lib/
│   ├── scoring.ts          # Pure scoring function
│   └── scoreToken.ts       # HMAC-signed score cookie tokens
└── types/
    └── index.ts            # Shared TypeScript types
__tests__/
├── scoring.test.ts
├── components.test.tsx
└── ...
```

## Notes

- Tailwind v4 syntax: `@import "tailwindcss"` in globals.css
- No external API integrations in MVP
- All form state local (React state, not Context API or Zustand)
- Result URL is clean — no query params. Score data verified server-side via signed cookie.
- `SCORE_SIGNING_SECRET` env var required in production for HMAC signing

## Security Rules

**These rules are mandatory for all contributors and AI agents working in this repository.**

1. **NEVER pass sensitive data via URL query parameters.** Scores, qualification status, user answers, and any business logic results must use server-side storage (signed cookies, sessions, or database). URL params are logged in browser history, server logs, analytics, and leaked via Referrer headers.
2. **NEVER calculate scores or make qualification decisions client-side.** All scoring must go through `/api/score` server-side. Client-side scoring is trivially spoofable via browser DevTools.
3. **Sign all server-set cookies with HMAC.** Use `src/lib/scoreToken.ts` pattern — payload + HMAC-SHA256 signature, verified before trust.
4. **HttpOnly + SameSite on all cookies carrying business data.** No JavaScript access to score cookies.
5. **Validate all inputs server-side.** Client-side validation is UX only — never trust it for security.
