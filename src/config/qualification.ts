/**
 * BANT Qualification Configuration
 * Single source of truth for lead qualification scoring
 */

import type {
  Question,
  Dimension,
  Outcome,
  QualificationConfig,
} from "@/types";

export const qualificationConfig: QualificationConfig = {
  dimensions: {
    budget: {
      name: "Budget",
      weight: 0.3,
      questions: [
        {
          id: "budget-range",
          text: "What's your annual budget for solutions in this area?",
          options: [
            {
              label: "$100K+",
              value: "large",
              points: 100,
            },
            {
              label: "$25K - $100K",
              value: "medium",
              points: 70,
            },
            {
              label: "$10K - $25K",
              value: "small",
              points: 40,
            },
            {
              label: "Under $10K or unsure",
              value: "minimal",
              points: 0,
            },
          ],
        },
        {
          id: "budget-approval",
          text: "Is budget already approved for this initiative?",
          options: [
            {
              label: "Yes, fully approved",
              value: "approved",
              points: 100,
            },
            {
              label: "Likely to be approved",
              value: "likely",
              points: 60,
            },
            {
              label: "Still needs review",
              value: "pending",
              points: 30,
            },
            {
              label: "Not approved yet",
              value: "unapproved",
              points: 0,
            },
          ],
        },
      ],
    },
    authority: {
      name: "Authority",
      weight: 0.25,
      questions: [
        {
          id: "decision-role",
          text: "What's your role in the purchasing decision?",
          options: [
            {
              label: "Final decision maker",
              value: "decision_maker",
              points: 100,
            },
            {
              label: "Key influencer/evaluator",
              value: "influencer",
              points: 80,
            },
            {
              label: "Contributor to evaluation",
              value: "contributor",
              points: 50,
            },
            {
              label: "Just gathering information",
              value: "researcher",
              points: 10,
            },
          ],
        },
        {
          id: "buying-process",
          text: "How formal is your buying process?",
          options: [
            {
              label: "Quick decision, minimal approval",
              value: "agile",
              points: 100,
            },
            {
              label: "Standard process with clear steps",
              value: "standard",
              points: 75,
            },
            {
              label: "Formal RFP and evaluation",
              value: "formal",
              points: 60,
            },
            {
              label: "Extended, complex approval",
              value: "complex",
              points: 20,
            },
          ],
        },
      ],
    },
    need: {
      name: "Need",
      weight: 0.3,
      questions: [
        {
          id: "pain-points",
          text: "How critical are your current pain points?",
          options: [
            {
              label: "Causing significant business impact",
              value: "critical",
              points: 100,
            },
            {
              label: "Creating real productivity challenges",
              value: "high",
              points: 80,
            },
            {
              label: "Noticeable inefficiencies",
              value: "moderate",
              points: 50,
            },
            {
              label: "Minor issues or exploring options",
              value: "low",
              points: 10,
            },
          ],
        },
        {
          id: "urgency",
          text: "When do you need to solve this?",
          options: [
            {
              label: "Immediate (next 30 days)",
              value: "immediate",
              points: 100,
            },
            {
              label: "This quarter",
              value: "quarter",
              points: 80,
            },
            {
              label: "This year",
              value: "year",
              points: 50,
            },
            {
              label: "Someday or exploring",
              value: "someday",
              points: 0,
            },
          ],
        },
      ],
    },
    timeline: {
      name: "Timeline",
      weight: 0.15,
      questions: [
        {
          id: "implementation",
          text: "What's your target implementation timeline?",
          options: [
            {
              label: "Within 60 days",
              value: "quick",
              points: 100,
            },
            {
              label: "Within 6 months",
              value: "standard",
              points: 70,
            },
            {
              label: "Within 1 year",
              value: "extended",
              points: 40,
            },
            {
              label: "More than 1 year or undecided",
              value: "distant",
              points: 0,
            },
          ],
        },
      ],
    },
  },
  threshold: 70,
  outcomes: {
    qualified: {
      headline: "Great news — you're a strong fit!",
      description:
        "Based on your answers, you meet our qualification criteria and we believe we can deliver significant value. Let's discuss how we can help you achieve your goals.",
      cta: "Book a Strategy Call",
      ctaUrl: "/book",
    },
    disqualified: {
      headline: "Thanks for your interest",
      description:
        "While your needs may not be the right fit right now, we've prepared some helpful resources that might be valuable as you continue your evaluation. Feel free to reach out when your priorities change.",
      cta: "Download Our Free Guide",
      ctaUrl: "/guide",
    },
  },
};
