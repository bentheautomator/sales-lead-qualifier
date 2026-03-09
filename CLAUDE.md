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
- On submit: calculates score and redirects to `/result?score=X&budget=Y&...`
- No server calls

### Result Page

**`src/app/result/page.tsx`** — Shows qualification outcome.

- Reads score and dimension scores from URL params
- Shows pass/fail messaging with CTA
- No database queries

### Components

**`src/components/`**

- `ProgressBar.tsx` — Visual progress indicator (step N of M)
- `QuestionCard.tsx` — Consistent card layout for each BANT question

## Key Design Decisions

1. **All scoring runs client-side** — No backend dependencies for MVP. Scoring is deterministic and instant.
2. **Score results passed via URL params** — Stateless result page. Easy to share/bookmark qualified leads.
3. **Config file is the API** — Product team can tweak thresholds without touching code. Version control captures changes.
4. **BANT framework** — Budget (30%), Authority (25%), Need (30%), Timeline (15%). Weights sum to 100%.
5. **Single-question-per-step UX** — Reduces cognitive load. Users understand exactly what we're asking.

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
│   └── scoring.ts          # Pure scoring function
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
- Result URL is shareable but stateless
