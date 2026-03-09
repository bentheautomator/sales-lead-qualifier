# AI-Powered Intelligence & Adaptive Scoring — The Alchemist

**Owner:** The Alchemist
**Estimated effort:** 2-3 days
**Phase:** 2 (concurrent with visual overhaul)
**Goal:** Add Claude API for smart qualification insights, adaptive scoring, and risk detection.

---

## Overview

Current state: Static scoring based on hardcoded config weights.

Target state: Intelligent system that explains weak BANT areas, suggests next steps, and identifies red flags.

---

## Three AI Features to Implement

### Feature 1: Adaptive Scoring (Intelligent Weight Adjustment)

**What it does:** Dynamically adjust dimension weights based on company size and industry hints.

**Example:**
```
Standard config: Budget(30%) + Authority(25%) + Need(30%) + Timeline(15%)

If company size is "Enterprise" (inferred from budget):
Adjust to: Budget(25%) + Authority(35%) + Need(30%) + Timeline(10%)
↳ Larger deals need more approval layers, longer timelines are OK

If company size is "Startup":
Adjust to: Budget(20%) + Authority(20%) + Need(40%) + Timeline(20%)
↳ Startups move fast, need is critical, budget constraints real
```

**Implementation:**

Create `src/lib/adaptive-scoring.ts`:

```typescript
import type { QualificationConfig, ScoreResult } from '@/types';

interface CompanyProfile {
  size: 'startup' | 'smb' | 'mid-market' | 'enterprise' | 'unknown';
  industry?: string;
  urgency: 'immediate' | 'quarter' | 'year' | 'someday';
}

/**
 * Infer company profile from answers
 */
export function inferCompanyProfile(
  answers: Record<string, string>
): CompanyProfile {
  const budget = answers['budget-range'];
  const urgency = answers['urgency'] || 'someday';

  let size: CompanyProfile['size'] = 'unknown';

  // Infer company size from budget
  if (budget === 'large') size = 'enterprise';
  else if (budget === 'medium') size = 'mid-market';
  else if (budget === 'small') size = 'smb';
  else if (budget === 'minimal') size = 'startup';

  return { size, urgency };
}

/**
 * Adjust dimension weights based on company profile
 */
export function getAdaptiveWeights(
  baseConfig: QualificationConfig,
  profile: CompanyProfile
): Record<string, number> {
  const baseWeights = {
    budget: baseConfig.dimensions.budget.weight,
    authority: baseConfig.dimensions.authority.weight,
    need: baseConfig.dimensions.need.weight,
    timeline: baseConfig.dimensions.timeline.weight,
  };

  let weights = { ...baseWeights };

  // Adjust for enterprise deals (longer sales cycles, more approval)
  if (profile.size === 'enterprise') {
    weights = {
      budget: 0.25,
      authority: 0.35, // More important for complex orgs
      need: 0.30,
      timeline: 0.10, // Less urgent
    };
  }
  // Adjust for startups (fast-moving, budget-constrained)
  else if (profile.size === 'startup') {
    weights = {
      budget: 0.20,
      authority: 0.20,
      need: 0.40, // Problem-solution fit is critical
      timeline: 0.20,
    };
  }
  // Adjust for SMBs (balanced, need-driven)
  else if (profile.size === 'smb') {
    weights = {
      budget: 0.25,
      authority: 0.25,
      need: 0.35,
      timeline: 0.15,
    };
  }

  // Adjust for immediate urgency (boost timeline weight)
  if (profile.urgency === 'immediate') {
    weights.timeline *= 1.3;
    weights.need *= 1.1;
  }

  // Normalize weights to sum to 1.0
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  Object.keys(weights).forEach((key) => {
    weights[key as keyof typeof weights] /= sum;
  });

  return weights;
}

/**
 * Calculate score with adaptive weights
 */
export function calculateAdaptiveScore(
  answers: Record<string, string>,
  baseConfig: QualificationConfig
): ScoreResult & { profile: CompanyProfile; weights: Record<string, number> } {
  const profile = inferCompanyProfile(answers);
  const adaptiveWeights = getAdaptiveWeights(baseConfig, profile);

  // Recalculate score using adaptive weights
  const breakdown: Record<string, any> = {};
  let weightedSum = 0;

  for (const [dimensionKey, dimension] of Object.entries(
    baseConfig.dimensions
  )) {
    let dimensionScore = 0;
    let maxDimensionScore = 0;

    for (const question of dimension.questions) {
      const answerValue = answers[question.id];
      const selectedOption = question.options.find(
        (opt) => opt.value === answerValue
      );
      const pointsForQuestion = selectedOption?.points ?? 0;
      const maxPointsForQuestion = Math.max(
        ...question.options.map((opt) => opt.points)
      );

      dimensionScore += pointsForQuestion;
      maxDimensionScore += maxPointsForQuestion;
    }

    const dimensionPercentage =
      maxDimensionScore > 0 ? (dimensionScore / maxDimensionScore) * 100 : 0;

    breakdown[dimensionKey] = {
      score: dimensionScore,
      maxScore: maxDimensionScore,
      percentage: Math.round(dimensionPercentage * 10) / 10,
    };

    // Use adaptive weight instead of base weight
    const adaptiveWeight = adaptiveWeights[dimensionKey] || 0;
    weightedSum += dimensionPercentage * adaptiveWeight;
  }

  const totalScore = Math.round(weightedSum * 10) / 10;
  const qualified = totalScore >= baseConfig.threshold;

  return {
    totalScore,
    qualified,
    breakdown,
    profile,
    weights: adaptiveWeights,
  };
}
```

**Usage in result page:**
```typescript
const { profile, weights } = scoreResult; // From calculateAdaptiveScore

// Display to user:
// "Your company profile: {size} | Adjusted scoring weights: Authority 35% (up from 25%)"
```

---

### Feature 2: AI-Powered Follow-Up Suggestions

**What it does:** Use Claude API to generate smart next steps based on weak BANT areas.

**Example output:**
```
Based on your answers:
- Your Need score is strong (85%)
- Your Authority score is 45% — WATCH OUT 👁️
- Your Budget is solid (75%)

Recommendation:
"Your pain point is clear and urgent, but we need to identify the right approver.
Before your next call, find out who owns the budget for this initiative. If it's not
you, recommend connecting with them first."
```

Create `src/app/api/insights/route.ts` (Vercel Edge Function):

```typescript
import { Anthropic } from '@anthropic-ai/sdk';

interface InsightRequest {
  score: number;
  breakdown: Record<string, number>;
  qualified: boolean;
  profile: {
    size: string;
    urgency: string;
  };
}

const client = new Anthropic();

export async function POST(request: Request) {
  const body = (await request.json()) as InsightRequest;

  const prompt = `You are a B2B sales qualification expert. Analyze this lead's BANT assessment:

Score: ${body.score}/100 (${body.qualified ? 'Qualified' : 'Not Qualified'})
Breakdown:
- Budget: ${body.breakdown.budget}%
- Authority: ${body.breakdown.authority}%
- Need: ${body.breakdown.need}%
- Timeline: ${body.breakdown.timeline}%

Company Profile: ${body.profile.size} | Urgency: ${body.profile.urgency}

Provide 2-3 specific, actionable insights for the sales rep:
1. What's the biggest risk flag in this lead?
2. What should they focus on in the next conversation?
3. Is this worth pursuing, or should they move on?

Keep it concise (3-4 sentences max per insight). Be direct and practical.`;

  try {
    const stream = await client.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 300,
      stream: true,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Return a streaming response
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const event of stream) {
          if (
            event.type === 'content_block_delta' &&
            event.delta.type === 'text_delta'
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
        controller.close();
      },
    });

    return new Response(readable, {
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  } catch (error) {
    console.error('AI insights error:', error);
    return new Response('Failed to generate insights', { status: 500 });
  }
}
```

**Usage in result page:**

```typescript
function AIInsights({ score, breakdown, qualified }: Props) {
  const [insights, setInsights] = useState('');
  const [loading, setLoading] = useState(false);

  const generateInsights = async () => {
    setLoading(true);
    const response = await fetch('/api/insights', {
      method: 'POST',
      body: JSON.stringify({ score, breakdown, qualified }),
    });

    const reader = response.body?.getReader();
    if (!reader) return;

    const decoder = new TextDecoder();
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const text = decoder.decode(value);
      setInsights((prev) => prev + text);
    }

    setLoading(false);
  };

  return (
    <div className="mt-12 pt-8 border-t border-gray-200 dark:border-slate-700">
      <h2 className="text-xl font-semibold mb-4">AI-Powered Insights</h2>

      {!insights && (
        <button
          onClick={generateInsights}
          disabled={loading}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
        >
          {loading ? 'Generating...' : 'Get AI Insights'}
        </button>
      )}

      {insights && (
        <div className="bg-purple-50 dark:bg-purple-950/30 p-4 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="whitespace-pre-wrap text-gray-700 dark:text-gray-300">
            {insights}
          </div>
        </div>
      )}
    </div>
  );
}
```

**Why:** Sales reps want prescriptive guidance, not just scores. This makes the tool valuable.

---

### Feature 3: Risk Scoring & Red Flags

**What it does:** Identify combinations that predict churn/poor fit.

Create `src/lib/risk-detection.ts`:

```typescript
interface RiskFlag {
  level: 'warning' | 'caution' | 'info';
  message: string;
  recommendation: string;
}

/**
 * Detect red flags based on answer patterns
 */
export function detectRiskFlags(
  answers: Record<string, string>,
  breakdown: Record<string, number>
): RiskFlag[] {
  const flags: RiskFlag[] = [];

  // Red flag: High need but low budget = affordability risk
  if (breakdown.need > 75 && breakdown.budget < 40) {
    flags.push({
      level: 'warning',
      message: 'High need, low budget — This is painful but not fundable.',
      recommendation:
        'Focus conversation on ROI. Can solving this problem save money elsewhere?',
    });
  }

  // Red flag: Low authority + formal buying process = long sales cycle
  if (breakdown.authority < 50 && answers['buying-process'] === 'formal') {
    flags.push({
      level: 'caution',
      message: 'Complex buying process with unclear decision-maker.',
      recommendation: 'Ask: "Who else needs to be involved in this decision?"',
    });
  }

  // Red flag: Low urgency + long timeline = low priority
  if (answers['urgency'] === 'someday' && answers['implementation'] === 'distant') {
    flags.push({
      level: 'caution',
      message: 'This is not a priority. Lead may deprioritize after demo.',
      recommendation:
        'Set expectations: "When would this need to be solved?" Get a hard date.',
    });
  }

  // Good sign: High need + strong authority + short timeline = quick deal
  if (
    breakdown.need > 80 &&
    breakdown.authority > 75 &&
    answers['urgency'] === 'immediate'
  ) {
    flags.push({
      level: 'info',
      message: '🚀 Fast-track opportunity. High urgency, clear authority, urgent need.',
      recommendation: 'Schedule product demo ASAP. Momentum is your friend.',
    });
  }

  return flags;
}
```

**Display risk flags in result page:**

```typescript
{riskFlags.length > 0 && (
  <div className="mt-8">
    <h3 className="text-lg font-semibold mb-4">Risk Assessment</h3>
    <div className="space-y-3">
      {riskFlags.map((flag, idx) => (
        <div
          key={idx}
          className={`p-4 rounded-lg border-l-4 ${
            flag.level === 'warning'
              ? 'bg-red-50 dark:bg-red-950/30 border-red-500'
              : flag.level === 'caution'
                ? 'bg-yellow-50 dark:bg-yellow-950/30 border-yellow-500'
                : 'bg-green-50 dark:bg-green-950/30 border-green-500'
          }`}
        >
          <p className="font-semibold">{flag.message}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {flag.recommendation}
          </p>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## Configuration for LLM Prompts

**File:** `src/config/qualification.ts` (additions)

Add to the config:

```typescript
aiPrompts: {
  insightSystemPrompt: `You are a B2B sales qualification expert with 10+ years of experience.
Your job is to help sales reps understand what makes a lead strong or weak, and give
them specific actions to move the deal forward.`,

  insightUserPromptTemplate: `Analyze this BANT qualification:
Score: {score}/100 | Status: {status}
Budget: {budget}% | Authority: {authority}% | Need: {need}% | Timeline: {timeline}%

Company: {companySize} | Urgency: {urgency}

Give 2-3 actionable insights for the sales rep. Be direct.`,

  riskDetectionRules: [
    {
      name: 'affordability-risk',
      condition: (b: any) => b.need > 75 && b.budget < 40,
      message: 'High need, low budget — affordability risk',
    },
    {
      name: 'authority-risk',
      condition: (b: any) => b.authority < 50,
      message: 'Authority unclear — may encounter approver delays',
    },
    {
      name: 'low-priority',
      condition: (b: any, a: any) => a.urgency === 'someday',
      message: 'Low priority — lead may deprioritize after initial interest',
    },
  ],
},
```

---

## Testing

Create `__tests__/ai-intelligence.test.ts`:

```typescript
import { inferCompanyProfile, getAdaptiveWeights, detectRiskFlags } from '@/lib/ai-intelligence';
import { qualificationConfig } from '@/config/qualification';

describe('AI Intelligence', () => {
  describe('Company Profile Inference', () => {
    it('infers enterprise profile from large budget', () => {
      const answers = { 'budget-range': 'large' };
      const profile = inferCompanyProfile(answers);
      expect(profile.size).toBe('enterprise');
    });

    it('infers startup profile from minimal budget', () => {
      const answers = { 'budget-range': 'minimal' };
      const profile = inferCompanyProfile(answers);
      expect(profile.size).toBe('startup');
    });
  });

  describe('Adaptive Weights', () => {
    it('increases authority weight for enterprise', () => {
      const profile = { size: 'enterprise' as const, urgency: 'quarter' as const };
      const weights = getAdaptiveWeights(qualificationConfig, profile);
      expect(weights.authority).toBeGreaterThan(0.3);
    });

    it('increases need weight for startups', () => {
      const profile = { size: 'startup' as const, urgency: 'immediate' as const };
      const weights = getAdaptiveWeights(qualificationConfig, profile);
      expect(weights.need).toBeGreaterThan(0.3);
    });
  });

  describe('Risk Detection', () => {
    it('flags high need + low budget combination', () => {
      const breakdown = { need: 85, budget: 30, authority: 50, timeline: 60 };
      const flags = detectRiskFlags({}, breakdown);
      expect(flags.some((f) => f.message.includes('High need'))).toBe(true);
    });

    it('flags low urgency + long timeline', () => {
      const breakdown = { need: 60, budget: 60, authority: 60, timeline: 60 };
      const answers = { urgency: 'someday', implementation: 'distant' };
      const flags = detectRiskFlags(answers, breakdown);
      expect(flags.some((f) => f.message.includes('not a priority'))).toBe(true);
    });
  });
});
```

---

## Environment Variables

**`.env.local`:**
```
ANTHROPIC_API_KEY=sk-ant-...
```

**`next.config.js`:**
```javascript
module.exports = {
  env: {
    // Note: API key should NOT be in env.* files for client-side
    // Use server routes only
  },
};
```

**Security:** Claude API key stays server-side in `/api/insights/route.ts`. Client never sees it.

---

## Implementation Checklist

- [ ] Create `src/lib/adaptive-scoring.ts` with weight adjustment logic
- [ ] Create `src/lib/risk-detection.ts` with flag detection
- [ ] Create `src/app/api/insights/route.ts` with Claude streaming
- [ ] Update `src/config/qualification.ts` with AI prompts
- [ ] Add AI insights component to `src/app/result/page.tsx`
- [ ] Add risk flags display to result page
- [ ] Test adaptive scoring with different company profiles
- [ ] Test AI API calls with mocked responses (unit tests)
- [ ] Test streaming response in browser
- [ ] Add rate limiting to `/api/insights` (max 5 calls per session)
- [ ] Update CLAUDE.md with new AI features documentation
- [ ] Add ANTHROPIC_API_KEY to production environment

---

## Cost Considerations

- Claude API: ~$0.003 per 1K input tokens, ~$0.015 per 1K output tokens
- ~300 input tokens per request → ~$0.001 per insight
- At 1000 leads/month, cost = ~$1/month (negligible)

**Budget:** Include in pricing tier. Free tier: max 3 AI insights. Pro tier: unlimited.

---

## Performance Notes

- Streaming responses feel interactive (vs. waiting for full response)
- Keep AI prompt under 500 tokens (input efficiency)
- Cache insights per session (don't re-generate for same lead twice)
- Timeout: 5 seconds max (fallback to generic message if slower)

---

## Next Steps

1. Create adaptive scoring module and test with multiple profiles
2. Implement Claude API integration with streaming
3. Build risk detection logic
4. Integrate AI insights into result page UI
5. Test end-to-end with different BANT combinations
6. Get sales team feedback on insight quality
7. Iterate on prompts based on feedback
8. Document AI feature in user guide

---

**Owner:** The Alchemist
**Next review:** After Phase 2 completion (Day 3)
