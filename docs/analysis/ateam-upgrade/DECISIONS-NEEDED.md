# Decisions Needed from Ben (The Vision Guy)

**This is your call to make before Phase 1 starts.**

Everything below is ready to go. The crew is standing by. But we need you to answer these 5 questions first.

---

## Question 1: AI Integration Approach

**The problem:** Claude API calls cost $. We need to decide where to call it.

**Option A: Client-Side (JavaScript SDK)**
- Pros: Simple, fast, no backend needed, user data stays on user's machine
- Cons: API key exposed to client (leaked easily), costs unclear to users
- Cost: ~$0.001 per insight, ~$100/mo at 10K leads
- Complexity: Low (1 week)

**Option B: Edge Function (Vercel Edge)**
- Pros: API key hidden, server-side, global CDN edge, fast
- Cons: Slightly more complex, requires environment variables
- Cost: Same ~$0.001 per insight, plus Vercel Edge compute (~$0.50/10K calls)
- Complexity: Medium (1.5 weeks)

**Option C: Full Backend API (Node.js)**
- Pros: Full control, can add auth/billing, most scalable
- Cons: Requires database, more infrastructure, slower iteration
- Cost: Same ~$0.001 per insight, plus database/server costs
- Complexity: High (2-3 weeks)

**My recommendation:** Option B (Edge Function). Sweet spot of simplicity + security.

**What you need to decide:** Pick A, B, or C.

---

## Question 2: Data Persistence

**The problem:** Do we store leads in a database or keep everything stateless (URL params only)?

**Option A: Stateless MVP (Keep Current Approach)**
- Results only in URL params (`/result?score=75&qualified=true&breakdown=...`)
- No database needed
- No lead history
- Can't build webhooks/integrations
- Pros: Simple, free, no ops burden
- Cons: Can't scale to business goals (APIs, CRM sync, analytics)

**Option B: Add Postgres Database (Recommended)**
- Store every qualified lead
- Build webhooks, CRM integrations, lead export
- Enable analytics ("How many qualified leads this week?")
- Required for business model (Pro tier needs this)
- Pros: Enables monetization, integrations, insights
- Cons: Need Neon account, Prisma setup, migrations
- Cost: Neon free tier (adequate for MVP), $30-100/mo at scale

**My recommendation:** Option B. You can't sell a product without lead history.

**What you need to decide:** Stateless (free, limited) or Database (costs $, enables business)?

---

## Question 3: Pricing Model at Launch

**The problem:** We need to know what to build into the UI/billing system.

**Option A: Free Forever (No Monetization Yet)**
- Launch free, figure out pricing later
- Pros: No billing complexity, maximize growth, viral
- Cons: Leaves money on table immediately
- Best for: Testing product-market fit first

**Option B: Freemium from Day 1**
- Free: Unlimited assessments, basic score, no API
- Pro: $99/mo, AI insights, API, integrations
- Pros: Start revenue immediately, clear upsell path
- Cons: Might reduce free tier signups (debate ongoing)
- Best for: Confident in value prop, want early revenue signals

**Option C: Wait Until Month 3**
- Launch free, build audience, then introduce Pro tier
- Pros: Maximize free user acquisition first, reduces churn risk
- Cons: Revenue delayed, billing system becomes retrofit
- Best for: Playing it safe, want product-market fit proof first

**My recommendation:** Option C (free launch, Pro tier Month 3). Get signups first, price based on usage data.

**What you need to decide:** Free only, Freemium from day 1, or Free then Freemium Month 3?

---

## Question 4: MVP Scope — What's "Sparkles" for Phase 1?

**The problem:** "10,000% better" is vague. Which features are table stakes for launch?

**Phase 1 (Weeks 1-2): Visual Wow + Core Functionality**
- [ ] Animations and glassmorphic cards (sparkles) — YES
- [ ] Dark mode toggle — YES
- [ ] Canvas-based confetti on qualification — YES
- [ ] Responsive mobile design — YES

**Phase 2 (Weeks 2-3): AI Intelligence**
- [ ] AI follow-up suggestions via Claude API — YES or defer?
- [ ] Adaptive scoring based on company size — YES or defer?
- [ ] Risk flag detection — YES or defer?

**Phase 3 (Week 3): Security**
- [ ] CSP headers, rate limiting, input validation — YES (non-negotiable)

**Phase 4 (Week 4): Infrastructure**
- [ ] Vercel Edge deployment, monitoring — YES (non-negotiable)

**Phase 5 (Week 5): APIs**
- [ ] Lead storage API — YES or defer?
- [ ] Webhook infrastructure — YES or defer?
- [ ] CSV export — YES or defer?
- [ ] CRM connectors — YES or defer to Phase 2?

**My recommendation:** YES for Phase 1-4 (visual + security + deployment). DEFER Phases 5 (APIs) to Month 2 unless business model demands it now.

**What you need to decide:** What's MUST-HAVE for launch? What can be Phase 2?

---

## Question 5: Go-to-Market Launch Strategy

**The problem:** Where and how do we tell the world about this?

**Option A: ProductHunt Launch (High Risk, High Reward)**
- Announce on day 1
- Target: #1 product of the day (5000+ upvotes)
- Pros: Huge visibility, potential viral growth, proves product quality
- Cons: Massive traffic spike (need stability), high expectations
- Effort: 2-week prep, marketing sprint
- Expected: 500-2000 signups in 48 hours

**Option B: Quiet Organic Launch (Low Risk, Steady Growth)**
- Soft launch via your network, no press
- HubSpot app marketplace, IndieHackers, Reddit, Twitter
- Pros: Sustainable growth, less pressure, time to fix bugs
- Cons: Slower, no viral moment, harder to get attention
- Effort: 1 week prep
- Expected: 50-200 signups in first week

**Option C: Both (Phased)**
- Soft launch Week 1 to friends + product communities
- ProductHunt launch Week 2 after feedback & fixes
- Pros: Best of both, lessons from soft launch inform ProductHunt
- Cons: Requires patience, split attention
- Effort: 2-3 weeks prep

**My recommendation:** Option C (soft launch Week 1, ProductHunt Week 2). De-risks both.

**What you need to decide:** ProductHunt launch or organic growth or phased approach?

---

## The Bundle: What Gets Built (Depends on Answers Above)

### Definite Build (Non-Negotiable)
- Visual overhaul (Phase 1) — **Required for "sparkles"**
- Security hardening (Phase 3) — **Required for production**
- Deployment infrastructure (Phase 4) — **Required for scaling**

### Conditional Build (Depends on Q1)
- AI insights → **If budget for Claude API, build it**
- Adaptive scoring → **If we want "intelligence" differentiator**
- Risk detection → **If sales teams ask for it in beta**

### Conditional Build (Depends on Q2)
- Database storage → **If we're monetizing (Phase 5 needs this)**

### Phase 2 Build (Never in MVP)
- Zapier/CRM integrations → **Nice-to-have, not core**
- Admin dashboard → **Phase 2 feature**
- White-label option → **Phase 2 feature**

---

## Timeline (Ben's Approval Gate)

**Monday morning:** You answer 5 questions above.
**Monday afternoon:** The Alchemist starts Phase 1 (visual).
**By EOW:** Phase 1-3 done (visual + AI + security).
**By next Monday:** Full product ready for soft launch.
**By Friday Week 2:** ProductHunt launch (if you choose it).

---

## Template: Your Decisions

Copy this and fill it out:

```
SALES LEAD QUALIFIER: UPGRADE DECISIONS
========================================

Q1. AI Integration Approach:
   [ ] A - Client-side SDK
   [ ] B - Vercel Edge Function (RECOMMENDED)
   [ ] C - Full backend API

Q2. Data Persistence:
   [ ] A - Stateless only
   [ ] B - Add Postgres database (RECOMMENDED)

Q3. Pricing at Launch:
   [ ] A - Free forever
   [ ] B - Freemium from day 1
   [ ] C - Free launch, Freemium Month 3 (RECOMMENDED)

Q4. MVP Scope:
   [ ] Include AI insights in Phase 2 (YES/NO)
   [ ] Include adaptive scoring in Phase 2 (YES/NO)
   [ ] Include risk detection in Phase 2 (YES/NO)
   [ ] Defer all APIs to Phase 2 (YES/NO)

Q5. Go-to-Market:
   [ ] A - ProductHunt launch Week 1
   [ ] B - Quiet organic launch
   [ ] C - Soft launch Week 1, ProductHunt Week 2 (RECOMMENDED)

Timeline Preference:
   [ ] ASAP (start Phase 1 today)
   [ ] Start Monday morning (give me the weekend)
   [ ] Other: ________________

Notes/Constraints:
[Your thoughts, concerns, constraints]
```

---

## What Happens When You Decide

**Once you send answers:**

1. **The Alchemist** gets green light on Phase 1 (visual). Starts immediately.
2. **The Sentinel** gets green light on Phase 3 (security). Preps in parallel.
3. **The Architect** stages Phase 4 (deployment). Ready to ship.
4. **The Catalyst** preps Phase 5 specs (APIs). Waits for database decision.
5. **Lord Business** finalizes positioning + pricing page. Schedules launch.
6. **Ben** coordinates daily standups, unblocks bottlenecks, owns business decisions.

---

## The Ask

**Ben, you're the vision guy. Make these 5 calls:**

1. **AI approach:** Which Claude integration strategy?
2. **Data:** Do we build a database or stay stateless?
3. **Pricing:** Free only, Freemium day 1, or Freemium month 3?
4. **Scope:** What's core MVP vs. Phase 2?
5. **Launch:** ProductHunt or organic or both?

**Then:** Forward this filled template to the crew + we ship.

---

## Quick Reference: The Crew Stands Ready

| Person | Role | Phase | Decision Gate |
|--------|------|-------|---------------|
| **The Alchemist** | Visual + AI | 1-2 | Q1, Q4 (AI scope) |
| **The Architect** | Deployment + perf | 4 | None (go) |
| **The Catalyst** | APIs + integrations | 5 | Q2 (database) |
| **The Sentinel** | Security | 3 | None (go) |
| **Lord Business** | Positioning + pricing | All | Q3, Q5 |
| **Ben** | Coordination + blocking | All | All 5 Qs |

---

**The clock is ticking. The crew is ready. What's the call?**

---

**Next: Once decisions are made, this becomes the active roadmap. Crew meets daily at 10am. Ben runs the standup.**
