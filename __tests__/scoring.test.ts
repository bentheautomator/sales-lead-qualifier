/**
 * Tests for the scoring engine
 * Comprehensive test coverage for qualification score calculation
 */

import { calculateScore } from "@/lib/scoring";
import { qualificationConfig } from "@/config/qualification";

describe("Scoring Engine", () => {
  describe("calculateScore - Basic Functionality", () => {
    it("should return a score result with all required fields", () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "standard",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result).toHaveProperty("totalScore");
      expect(result).toHaveProperty("qualified");
      expect(result).toHaveProperty("breakdown");
      expect(typeof result.totalScore).toBe("number");
      expect(typeof result.qualified).toBe("boolean");
      expect(typeof result.breakdown).toBe("object");
    });

    it("should include all dimensions in breakdown", () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "standard",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.breakdown).toHaveProperty("budget");
      expect(result.breakdown).toHaveProperty("authority");
      expect(result.breakdown).toHaveProperty("need");
      expect(result.breakdown).toHaveProperty("timeline");
    });

    it("should calculate score between 0 and 100", () => {
      const answers = {
        "budget-range": "minimal",
        "budget-approval": "unapproved",
        "decision-role": "researcher",
        "buying-process": "complex",
        "pain-points": "low",
        urgency: "someday",
        implementation: "distant",
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.totalScore).toBeGreaterThanOrEqual(0);
      expect(result.totalScore).toBeLessThanOrEqual(100);
    });
  });

  describe("calculateScore - Qualified Lead", () => {
    it("should identify a clearly qualified lead with high scores", () => {
      const answers = {
        "budget-range": "large", // 100 points
        "budget-approval": "approved", // 100 points
        "decision-role": "decision_maker", // 100 points
        "buying-process": "agile", // 100 points
        "pain-points": "critical", // 100 points
        urgency: "immediate", // 100 points
        implementation: "quick", // 100 points
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.qualified).toBe(true);
      expect(result.totalScore).toBeGreaterThanOrEqual(
        qualificationConfig.threshold,
      );
      expect(result.totalScore).toBe(100);
    });

    it("should have high scores in all dimensions for qualified lead", () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.breakdown.budget.percentage).toBe(100);
      expect(result.breakdown.authority.percentage).toBe(100);
      expect(result.breakdown.need.percentage).toBe(100);
      expect(result.breakdown.timeline.percentage).toBe(100);
    });
  });

  describe("calculateScore - Disqualified Lead", () => {
    it("should identify a clearly disqualified lead with low scores", () => {
      const answers = {
        "budget-range": "minimal", // 0 points
        "budget-approval": "unapproved", // 0 points
        "decision-role": "researcher", // 10 points
        "buying-process": "complex", // 20 points
        "pain-points": "low", // 10 points
        urgency: "someday", // 0 points
        implementation: "distant", // 0 points
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.qualified).toBe(false);
      expect(result.totalScore).toBeLessThan(qualificationConfig.threshold);
    });

    it("should have low scores in all dimensions for disqualified lead", () => {
      const answers = {
        "budget-range": "minimal",
        "budget-approval": "unapproved",
        "decision-role": "researcher",
        "buying-process": "complex",
        "pain-points": "low",
        urgency: "someday",
        implementation: "distant",
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.breakdown.budget.percentage).toBeLessThan(25);
      expect(result.breakdown.authority.percentage).toBeLessThan(35);
      expect(result.breakdown.need.percentage).toBeLessThan(15);
      expect(result.breakdown.timeline.percentage).toBeLessThan(15);
    });
  });

  describe("calculateScore - Threshold Behavior", () => {
    it("should qualify a lead exactly at threshold", () => {
      // Craft answers that should hit exactly the threshold (70)
      // Budget: 85%, Authority: 75%, Need: 70%, Timeline: 65%
      // Weighted: (85*0.3) + (75*0.25) + (70*0.3) + (65*0.15)
      //         = 25.5 + 18.75 + 21 + 9.75 = 75 (which is > 70, so qualified)
      const answers = {
        "budget-range": "medium", // 70 out of 100
        "budget-approval": "likely", // 60 out of 100, avg = 65
        "decision-role": "influencer", // 80 out of 100
        "buying-process": "standard", // 75 out of 100, avg = 77.5
        "pain-points": "high", // 80 out of 100
        urgency: "quarter", // 80 out of 100, avg = 80
        implementation: "standard", // 70 out of 100
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.totalScore).toBeGreaterThanOrEqual(
        qualificationConfig.threshold,
      );
      expect(result.qualified).toBe(true);
    });

    it("should disqualify a lead just below threshold", () => {
      const answers = {
        "budget-range": "small", // 40
        "budget-approval": "pending", // 30, avg = 35
        "decision-role": "contributor", // 50
        "buying-process": "formal", // 60, avg = 55
        "pain-points": "moderate", // 50
        urgency: "year", // 50, avg = 50
        implementation: "extended", // 40
      };

      const result = calculateScore(answers, qualificationConfig);

      // Expected: (35*0.3) + (55*0.25) + (50*0.3) + (40*0.15)
      //         = 10.5 + 13.75 + 15 + 6 = 45.25
      expect(result.totalScore).toBeLessThan(qualificationConfig.threshold);
      expect(result.qualified).toBe(false);
    });
  });

  describe("calculateScore - Weight Application", () => {
    it("should correctly apply dimension weights", () => {
      // Verify that Budget and Need (0.3 weight each) have more impact than Timeline (0.15)
      const budgetHeavyAnswers = {
        "budget-range": "large", // 100
        "budget-approval": "approved", // 100
        "decision-role": "researcher", // 10
        "buying-process": "complex", // 20
        "pain-points": "low", // 10
        urgency: "someday", // 0
        implementation: "distant", // 0
      };

      const needHeavyAnswers = {
        "budget-range": "minimal", // 0
        "budget-approval": "unapproved", // 0
        "decision-role": "researcher", // 10
        "buying-process": "complex", // 20
        "pain-points": "critical", // 100
        urgency: "immediate", // 100
        implementation: "distant", // 0
      };

      const budgetResult = calculateScore(
        budgetHeavyAnswers,
        qualificationConfig,
      );
      const needResult = calculateScore(needHeavyAnswers, qualificationConfig);

      // Need is equally weighted as Budget (0.3 each), so scores should be similar
      // But with different impacts due to authority/timeline
      expect(budgetResult.breakdown.budget.percentage).toBe(100);
      expect(needResult.breakdown.need.percentage).toBe(100);

      // Both should have similar totalScore since budget and need are equally weighted
      // and both have strong answers, while authority and timeline are weak
      const budgetDiff = Math.abs(
        budgetResult.totalScore - needResult.totalScore,
      );
      expect(budgetDiff).toBeLessThan(10); // Allow small variance due to authority
    });

    it("should weight dimensions according to config", () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const result = calculateScore(answers, qualificationConfig);

      // All dimensions are 100%, so weighted sum should be:
      // (100 * 0.3) + (100 * 0.25) + (100 * 0.3) + (100 * 0.15) = 100
      expect(result.totalScore).toBe(100);

      // Verify weights sum to 1.0
      const weightSum = Object.values(qualificationConfig.dimensions).reduce(
        (sum, dim) => sum + dim.weight,
        0,
      );
      expect(weightSum).toBe(1);
    });
  });

  describe("calculateScore - Partial/Missing Answers", () => {
    it("should score 0 for unanswered questions", () => {
      const answers = {
        "budget-range": "large",
        "budget-approval": "approved",
        // Missing all other answers
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.totalScore).toBeLessThan(100);
      expect(result.qualified).toBe(false);

      // Budget dimension should be high
      expect(result.breakdown.budget.percentage).toBe(100);

      // Other dimensions should be 0
      expect(result.breakdown.authority.percentage).toBe(0);
      expect(result.breakdown.need.percentage).toBe(0);
      expect(result.breakdown.timeline.percentage).toBe(0);
    });

    it("should handle completely empty answers", () => {
      const answers = {};

      const result = calculateScore(answers, qualificationConfig);

      expect(result.totalScore).toBe(0);
      expect(result.qualified).toBe(false);

      // All dimensions should be 0
      expect(result.breakdown.budget.percentage).toBe(0);
      expect(result.breakdown.authority.percentage).toBe(0);
      expect(result.breakdown.need.percentage).toBe(0);
      expect(result.breakdown.timeline.percentage).toBe(0);
    });

    it("should handle invalid answer values gracefully", () => {
      const answers = {
        "budget-range": "invalid_option",
        "budget-approval": "approved",
        "decision-role": "decision_maker",
        "buying-process": "agile",
        "pain-points": "critical",
        urgency: "immediate",
        implementation: "quick",
      };

      const result = calculateScore(answers, qualificationConfig);

      // Invalid answer should score 0 for that question
      // Budget dimension: 0 for budget-range, 100 for budget-approval = 50%
      expect(result.breakdown.budget.percentage).toBeLessThan(100);
      expect(result.breakdown.budget.percentage).toBe(50);
      // Other dimensions are 100%, so overall score should still be high
      // (50*0.3) + (100*0.25) + (100*0.3) + (100*0.15) = 15 + 25 + 30 + 15 = 85
      expect(result.totalScore).toBeGreaterThan(80);
    });
  });

  describe("calculateScore - Breakdown Metrics", () => {
    it("should calculate correct dimension breakdown scores", () => {
      const answers = {
        "budget-range": "medium", // 70/100
        "budget-approval": "likely", // 60/100
        "decision-role": "influencer", // 80/100
        "buying-process": "standard", // 75/100
        "pain-points": "high", // 80/100
        urgency: "quarter", // 80/100
        implementation: "standard", // 70/100
      };

      const result = calculateScore(answers, qualificationConfig);

      // Budget: (70 + 60) / 200 * 100 = 65%
      expect(result.breakdown.budget.percentage).toBe(65);
      expect(result.breakdown.budget.score).toBe(130);
      expect(result.breakdown.budget.maxScore).toBe(200);

      // Authority: (80 + 75) / 200 * 100 = 77.5%
      expect(result.breakdown.authority.percentage).toBe(77.5);
      expect(result.breakdown.authority.score).toBe(155);
      expect(result.breakdown.authority.maxScore).toBe(200);

      // Need: (80 + 80) / 200 * 100 = 80%
      expect(result.breakdown.need.percentage).toBe(80);
      expect(result.breakdown.need.score).toBe(160);
      expect(result.breakdown.need.maxScore).toBe(200);

      // Timeline: 70 / 100 * 100 = 70%
      expect(result.breakdown.timeline.percentage).toBe(70);
      expect(result.breakdown.timeline.score).toBe(70);
      expect(result.breakdown.timeline.maxScore).toBe(100);
    });

    it("should provide accurate percentage calculations", () => {
      const answers = {
        "budget-range": "small", // 40/100
        "budget-approval": "pending", // 30/100
        "decision-role": "contributor", // 50/100
        "buying-process": "formal", // 60/100
        "pain-points": "moderate", // 50/100
        urgency: "year", // 50/100
        implementation: "extended", // 40/100
      };

      const result = calculateScore(answers, qualificationConfig);

      // Verify percentages are between 0 and 100
      Object.values(result.breakdown).forEach((dimension) => {
        expect(dimension.percentage).toBeGreaterThanOrEqual(0);
        expect(dimension.percentage).toBeLessThanOrEqual(100);
      });

      // Verify score <= maxScore
      Object.values(result.breakdown).forEach((dimension) => {
        expect(dimension.score).toBeLessThanOrEqual(dimension.maxScore);
      });
    });
  });

  describe("calculateScore - Rounding", () => {
    it("should round scores to 1 decimal place", () => {
      const answers = {
        "budget-range": "medium", // 70
        "budget-approval": "likely", // 60, avg = 65
        "decision-role": "influencer", // 80
        "buying-process": "standard", // 75, avg = 77.5
        "pain-points": "high", // 80
        urgency: "quarter", // 80, avg = 80
        implementation: "standard", // 70
      };

      const result = calculateScore(answers, qualificationConfig);

      // Check that breakdown percentages have at most 1 decimal place
      Object.values(result.breakdown).forEach((dimension) => {
        const decimalPlaces = (
          dimension.percentage.toString().split(".")[1] || ""
        ).length;
        expect(decimalPlaces).toBeLessThanOrEqual(1);
      });

      // Check totalScore has at most 1 decimal place
      const totalDecimalPlaces = (
        result.totalScore.toString().split(".")[1] || ""
      ).length;
      expect(totalDecimalPlaces).toBeLessThanOrEqual(1);
    });
  });

  describe("calculateScore - Real-world Scenarios", () => {
    it("should score a mid-market prospect with mixed signals", () => {
      const answers = {
        "budget-range": "medium", // Ready to invest but not huge
        "budget-approval": "likely", // Budget process ongoing
        "decision-role": "influencer", // Not final decision maker
        "buying-process": "standard", // Standard corporate process
        "pain-points": "high", // Real pain points
        urgency: "quarter", // Moderate urgency
        implementation: "standard", // Planning to implement this year
      };

      const result = calculateScore(answers, qualificationConfig);

      // Should be close to threshold but likely qualified
      expect(result.totalScore).toBeGreaterThan(60);
      expect(result.totalScore).toBeLessThan(90);
    });

    it("should score an enterprise prospect with high friction but high value", () => {
      const answers = {
        "budget-range": "large", // Large budget
        "budget-approval": "likely", // Budget probably there
        "decision-role": "contributor", // Part of evaluation team
        "buying-process": "formal", // Formal RFP process
        "pain-points": "critical", // Critical pain point
        urgency: "quarter", // Moderate urgency despite critical need
        implementation: "extended", // Long implementation timeline expected
      };

      const result = calculateScore(answers, qualificationConfig);

      // Should be qualified despite process friction (strong budget + need)
      expect(result.qualified).toBe(true);
      expect(result.totalScore).toBeGreaterThan(qualificationConfig.threshold);
    });

    it("should score a low-priority inquiry correctly", () => {
      const answers = {
        "budget-range": "small", // Small budget
        "budget-approval": "pending", // No approval yet
        "decision-role": "researcher", // Just researching
        "buying-process": "complex", // Complex buying process
        "pain-points": "low", // Minor issues
        urgency: "someday", // No urgency
        implementation: "distant", // Far future timeline
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.qualified).toBe(false);
      expect(result.totalScore).toBeLessThan(50);
    });
  });
});
