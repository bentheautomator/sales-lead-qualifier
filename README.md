# Sales Lead Qualifier

A config-driven BANT sales qualification tool that tells you in under two minutes whether a prospect is worth pursuing. Built with Next.js, TypeScript, and Tailwind CSS.

## What It Does

The Sales Lead Qualifier walks prospects through a short questionnaire covering four dimensions:

- **Budget** (30%) - Can they afford the solution? Is funding approved?
- **Authority** (25%) - Are they the decision maker? How complex is approval?
- **Need** (30%) - How critical and urgent are their pain points?
- **Timeline** (15%) - When do they plan to implement?

Prospects scoring 70+ out of 100 are directed to **book a strategy call**. Those below 70 are offered a **free qualification playbook PDF** to nurture the relationship.

## Features

- **Step-by-step BANT quiz** with progress bar and animated transitions
- **Instant scoring** with visual breakdown per dimension
- **Strategy call booking** form with time slot selection and confirmation
- **Free guide download** with automatic PDF delivery and manual fallback button
- **Embeddable HTML version** (`/embed.html`) for GoHighLevel, ClickFunnels, or any iframe
- **Dark mode** toggle on every page
- **Celebration effects** (sparkles and glitter) - toggleable via env var
- **Rate limiting** on all API endpoints (20 requests/hour per IP)
- **Webhook integration** for forwarding form submissions to your CRM or automation tool
- **Config-driven** - change questions, weights, thresholds, and CTAs without touching code

## What Works Out of the Box

The quiz, scoring, results, PDF download, dark mode, visual effects, rate limiting, security headers, embeddable version, and score verification all work immediately with zero configuration.

**Requires your setup (expansion points):**

| Feature             | Status                    | What You Need                                             |
| ------------------- | ------------------------- | --------------------------------------------------------- |
| Lead capture        | Plumbed but not connected | Set `WEBHOOK_URL` to receive form submissions in your CRM |
| Email notifications | Not built in              | Wire through your webhook tool (n8n, Zapier, etc.)        |
| Calendar invites    | Not built in              | Wire through your webhook tool after receiving bookings   |

Without `WEBHOOK_URL`, form submissions succeed for the user but data is only logged to the server console. **Set this before going live to avoid losing leads.**

## Pages

| Page        | URL           | Description                            |
| ----------- | ------------- | -------------------------------------- |
| Qualifier   | `/`           | The main BANT questionnaire            |
| Results     | `/result`     | Score display with dimension breakdown |
| Book a Call | `/book`       | Strategy call booking form             |
| Free Guide  | `/guide`      | PDF download with email capture        |
| Embed       | `/embed.html` | Standalone HTML for external embedding |

## Quick Start

```bash
# Install dependencies
npm install

# Start development server (runs on port 4200)
npm run dev

# Build for production
npm run build

# Run tests
npm test
```

## Configuration

All qualification logic lives in a single file:

```
src/config/qualification.ts
```

Change questions, answer options, point values, dimension weights, the qualifying threshold, or outcome CTAs here. Redeploy - no code changes needed elsewhere.

### Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable                     | Required | Default | Description                                               |
| ---------------------------- | -------- | ------- | --------------------------------------------------------- |
| `WEBHOOK_URL`                | No       | Not set | URL to receive form submissions as JSON POST requests     |
| `NEXT_PUBLIC_ENABLE_GLITTER` | No       | `true`  | Set to `false` to disable the floating glitter background |

### Webhook

Set `WEBHOOK_URL` to forward booking and guide form submissions to your CRM, n8n, Zapier, or automation platform:

```bash
WEBHOOK_URL=https://your-webhook-endpoint.com/lead
```

Form data is sent as JSON with a `type` field (`"booking"` or `"guide_signup"`). See the [user guide](docs/guides/user-guide.md#how-the-webhook-works) for full payload examples.

## Embedding on External Sites

Copy the HTML from `public/embed.html` into any custom HTML block, or use an iframe:

```html
<iframe src="https://yourdomain.com/embed.html" width="100%" height="700" frameborder="0"></iframe>
```

The embed version is fully self-contained with zero external dependencies. Update the CTA links (`/book`, `/guide`) to full URLs if hosting on a different domain.

## Generating the PDF Guide

The Sales Qualification Playbook PDF is generated from HTML using Playwright:

```bash
npm run generate-pdf
```

This creates both `public/sales-qualification-playbook.pdf` and `public/sales-qualification-playbook.html` from a single HTML source.

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS v4
- **Testing**: Jest + Testing Library
- **PDF Generation**: Playwright (HTML-to-PDF)
- **Hooks**: Lefthook (lint, format, test gates)

## Documentation

See [docs/guides/user-guide.md](docs/guides/user-guide.md) for a comprehensive non-technical user guide covering every feature, page, and workflow.

## Project Structure

```
src/
  app/           # Pages and API routes
  components/    # UI components (ProgressBar, QuestionCard, ThemeToggle, etc.)
  config/        # BANT qualification rules (single source of truth)
  lib/           # Scoring engine, validation, rate limiting
  types/         # TypeScript interfaces
public/
  embed.html     # Standalone embeddable qualifier
  *.pdf / *.html # Generated playbook files
docs/
  guides/        # User documentation
```
