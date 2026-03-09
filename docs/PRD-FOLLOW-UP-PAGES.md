# PRD: Follow-Up Pages & Lead Magnet

## Overview

Two high-value pages that capture intent post-qualification and convert leads into conversations or nurture sequences.

---

## `/book` — Strategy Call Booking Page

**Purpose:** Convert QUALIFIED leads (score >= 70) into scheduled strategy calls.

**Hero Section:**

- Headline: "Let's Discuss Your Path to Success"
- Subheadline: "Schedule a 30-minute strategy call with our team to explore how we can help you achieve your goals."
- Visual: Emerald gradient header (matches qualified badge), with subtle sparkle animations on load

**Form Fields:**

- Full Name (required)
- Email (required)
- Company Name (required)
- Phone (optional)
- Best Time to Call (dropdown: Morning, Afternoon, Next Week)

**CTA Button:**

- Text: "Schedule My Call"
- Action: POST to `/api/schedule-call` → returns confirmation + Calendly iframe embed

**Post-Submit Behavior:**

- Show inline confirmation card with Calendly iframe (embedded calendar widget)
- Display: "Your calendar will appear below. Pick a time that works."
- Fallback: "We'll send you calendar options at [email]. Check your inbox shortly."

**Design:**

- Full-width card with emerald accent border at top
- Gradient background matches result page (emerald-50 to teal-50)
- Form inputs: white cards with slate border, focus ring in emerald
- Button: Solid emerald, scales on click, shadow glows on hover
- Dark mode: emerald-900/30 background, slate border

---

## `/guide` — Lead Magnet Download Page

**Purpose:** Nurture DISQUALIFIED leads (score < 70) with valuable content. Capture email for future outreach.

**Hero Section:**

- Headline: "The Automation & Efficiency Playbook"
- Subheadline: "Even if now isn't the right time, this free guide will show you how to identify quick wins and prepare for your next investment."
- Visual: Amber gradient header (matches disqualified badge), PDF icon preview showing cover

**Form Fields:**

- First Name (required)
- Email (required)
- Company (optional)
- What's your biggest challenge? (textarea, optional)

**CTA Button:**

- Text: "Download My Free Guide"
- Action: POST to `/api/download-guide` → webhooks to email service → streams PDF download

**Post-Submit Behavior:**

- Trigger: email sent to user + webhook sent to backend (CRM/email service)
- PDF downloads immediately (browser download or opens in new tab)
- Show inline confirmation: "Check your inbox! Guide is on the way."

**Design:**

- Full-width card with amber accent border at top
- Gradient background matches result page (amber-50 to orange-50)
- Form inputs: white cards with slate border, focus ring in amber
- Button: Solid amber, scales on click, shadow glows on hover
- Dark mode: amber-900/30 background, slate border
- PDF preview thumbnail in header

---

## Lead Magnet PDF: "The Automation & Efficiency Playbook"

**Specs:**

- Format: PDF (downloadable)
- Target Length: 24-28 pages
- Tone: Professional, approachable, practical (no fluff)
- Design: Branded covers, consistent layout, readable typography

**Table of Contents:**

1. **Introduction** — Why automation matters, who this guide is for (2 pages)
2. **Chapter 1: Assess Your Baseline** — How to audit current workflows, identify 3 quick wins (4 pages)
3. **Chapter 2: The Low-Hanging Fruit Toolkit** — 5 automation patterns for immediate ROI (5 pages)
4. **Chapter 3: Building the Case** — ROI calculation, cost-benefit templates, stakeholder buy-in (4 pages)
5. **Chapter 4: Implementation Roadmap** — Phased approach, success metrics, common pitfalls (4 pages)
6. **Chapter 5: Beyond the Quick Wins** — Scaling automation, platform selection criteria (4 pages)
7. **Conclusion & Next Steps** — Resources, free audit offer, contact CTA (2 pages)

**Key Features:**

- Checklists at end of each chapter
- Real-world case study callout boxes (1-2 per chapter)
- ROI calculator template (downloadable companion)
- Branded footer on every page
- CTA at end: "Ready to explore your automation potential? Schedule a free 15-minute audit."

---

## API Endpoints

**POST /api/schedule-call**

- Body: `{ name, email, company, phone?, timeSlot }`
- Returns: `{ success: true, calendlyUrl, confirmationToken }`
- Side effect: Webhook to Calendly + CRM

**POST /api/download-guide**

- Body: `{ firstName, email, company?, challenge? }`
- Returns: `{ success: true, downloadUrl, emailSent: true }`
- Side effect: Email dispatch + CRM webhook
- Download: PDF served from `/public/guides/automation-playbook.pdf`

---

## Implementation Priority

1. **Phase 1:** `/book` page + Calendly integration (3 days)
2. **Phase 2:** `/guide` page + email webhook (2 days)
3. **Phase 3:** PDF creation + design (4 days)
4. **Phase 4:** Email template + webhook testing (2 days)

**Total: ~11 days to full launch**
