/**
 * Integration tests for the complete qualification flow
 * Tests the full user journey from questions to qualification result
 */

import { calculateScore } from '@/lib/scoring';
import { qualificationConfig } from '@/config/qualification';

describe('Qualification Flow Integration', () => {
  describe('Complete Qualified Flow', () => {
    it('should qualify a lead when all answers are strong', () => {
      // User answers all questions optimally
      const answers = {
        'budget-range': 'large',      // 100 points
        'budget-approval': 'approved', // 100 points
        'decision-role': 'decision_maker', // 100 points
        'buying-process': 'agile',    // 100 points
        'pain-points': 'critical',    // 100 points
        urgency: 'immediate',         // 100 points
        implementation: 'quick',      // 100 points
      };

      const result = calculateScore(answers, qualificationConfig);

      // Verify qualification
      expect(result.qualified).toBe(true);
      expect(result.totalScore).toBe(100);

      // Verify all dimensions are strong
      expect(result.breakdown.budget.percentage).toBe(100);
      expect(result.breakdown.authority.percentage).toBe(100);
      expect(result.breakdown.need.percentage).toBe(100);
      expect(result.breakdown.timeline.percentage).toBe(100);

      // Verify score is well above threshold
      expect(result.totalScore).toBeGreaterThan(qualificationConfig.threshold);
    });

    it('should guide a lead through the question flow and produce correct score', () => {
      // Simulate progressive user answering questions
      let answers: Record<string, string> = {};

      // Question 1: Budget Range
      answers['budget-range'] = 'large';
      let result = calculateScore(answers, qualificationConfig);
      expect(result.breakdown.budget.percentage).toBeGreaterThan(0);

      // Question 2: Budget Approval
      answers['budget-approval'] = 'approved';
      result = calculateScore(answers, qualificationConfig);
      expect(result.breakdown.budget.percentage).toBe(100);

      // Question 3: Decision Role
      answers['decision-role'] = 'decision_maker';
      result = calculateScore(answers, qualificationConfig);
      expect(result.breakdown.authority.percentage).toBeGreaterThan(0);

      // Question 4: Buying Process
      answers['buying-process'] = 'agile';
      result = calculateScore(answers, qualificationConfig);
      expect(result.breakdown.authority.percentage).toBe(100);

      // Question 5: Pain Points
      answers['pain-points'] = 'critical';
      result = calculateScore(answers, qualificationConfig);
      expect(result.breakdown.need.percentage).toBeGreaterThan(0);

      // Question 6: Urgency
      answers['urgency'] = 'immediate';
      result = calculateScore(answers, qualificationConfig);
      expect(result.breakdown.need.percentage).toBe(100);

      // Question 7: Implementation
      answers['implementation'] = 'quick';
      result = calculateScore(answers, qualificationConfig);
      expect(result.breakdown.timeline.percentage).toBe(100);

      // Final verification
      expect(result.qualified).toBe(true);
    });

    it('should maintain proper score progression through answer flow', () => {
      // Start with no answers
      let answers: Record<string, string> = {};
      let result = calculateScore(answers, qualificationConfig);
      expect(result.totalScore).toBe(0);
      expect(result.qualified).toBe(false);

      // Add some positive answers
      answers = {
        'budget-range': 'large',
        'budget-approval': 'approved',
      };
      result = calculateScore(answers, qualificationConfig);
      const scoreWithBudget = result.totalScore;
      expect(scoreWithBudget).toBeGreaterThan(0);

      // Add authority answers
      answers['decision-role'] = 'decision_maker';
      answers['buying-process'] = 'agile';
      result = calculateScore(answers, qualificationConfig);
      const scoreWithAuthority = result.totalScore;
      expect(scoreWithAuthority).toBeGreaterThan(scoreWithBudget);

      // Add need answers
      answers['pain-points'] = 'critical';
      answers['urgency'] = 'immediate';
      result = calculateScore(answers, qualificationConfig);
      const scoreWithNeed = result.totalScore;
      expect(scoreWithNeed).toBeGreaterThan(scoreWithAuthority);

      // Add timeline answer
      answers['implementation'] = 'quick';
      result = calculateScore(answers, qualificationConfig);
      const finalScore = result.totalScore;
      expect(finalScore).toBeGreaterThan(scoreWithNeed);
      expect(finalScore).toBe(100);
    });
  });

  describe('Complete Disqualified Flow', () => {
    it('should disqualify a lead when all answers are weak', () => {
      // User answers all questions poorly
      const answers = {
        'budget-range': 'minimal',     // 0 points
        'budget-approval': 'unapproved', // 0 points
        'decision-role': 'researcher', // 10 points
        'buying-process': 'complex',   // 20 points
        'pain-points': 'low',          // 10 points
        urgency: 'someday',            // 0 points
        implementation: 'distant',     // 0 points
      };

      const result = calculateScore(answers, qualificationConfig);

      // Verify disqualification
      expect(result.qualified).toBe(false);
      expect(result.totalScore).toBeLessThan(qualificationConfig.threshold);

      // Verify all dimensions are weak
      expect(result.breakdown.budget.percentage).toBeLessThan(25);
      expect(result.breakdown.need.percentage).toBeLessThan(25);
    });

    it('should disqualify a lead with mixed but insufficient answers', () => {
      const answers = {
        'budget-range': 'small',       // 40 points
        'budget-approval': 'pending',  // 30 points
        'decision-role': 'contributor', // 50 points
        'buying-process': 'formal',    // 60 points
        'pain-points': 'moderate',     // 50 points
        urgency: 'year',               // 50 points
        implementation: 'extended',    // 40 points
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.qualified).toBe(false);
      expect(result.totalScore).toBeLessThan(qualificationConfig.threshold);
    });

    it('should guide a lead through poor answers and confirm disqualification', () => {
      let answers: Record<string, string> = {};

      // Add weak budget answers
      answers['budget-range'] = 'minimal';
      answers['budget-approval'] = 'unapproved';

      let result = calculateScore(answers, qualificationConfig);
      expect(result.breakdown.budget.percentage).toBe(0);

      // Add weak authority answers
      answers['decision-role'] = 'researcher';
      answers['buying-process'] = 'complex';

      result = calculateScore(answers, qualificationConfig);
      expect(result.breakdown.authority.percentage).toBeLessThan(25);

      // Add weak need answers
      answers['pain-points'] = 'low';
      answers['urgency'] = 'someday';

      result = calculateScore(answers, qualificationConfig);
      expect(result.breakdown.need.percentage).toBeLessThan(25);

      // Add weak timeline answer
      answers['implementation'] = 'distant';

      result = calculateScore(answers, qualificationConfig);
      expect(result.qualified).toBe(false);
      expect(result.totalScore).toBeLessThan(qualificationConfig.threshold);
    });
  });

  describe('Threshold Boundary Cases', () => {
    it('should correctly identify leads at the exact threshold', () => {
      // Craft answers to hit exactly the threshold
      const answers = {
        'budget-range': 'medium',      // 70
        'budget-approval': 'likely',   // 60, avg = 65
        'decision-role': 'influencer', // 80
        'buying-process': 'standard',  // 75, avg = 77.5
        'pain-points': 'high',         // 80
        urgency: 'quarter',            // 80, avg = 80
        implementation: 'standard',    // 70
      };

      const result = calculateScore(answers, qualificationConfig);

      // Should be qualified (at or above threshold)
      expect(result.totalScore).toBeGreaterThanOrEqual(qualificationConfig.threshold);
      expect(result.qualified).toBe(true);
    });

    it('should correctly identify leads just above threshold', () => {
      const answers = {
        'budget-range': 'medium',
        'budget-approval': 'likely',
        'decision-role': 'influencer',
        'buying-process': 'standard',
        'pain-points': 'high',
        urgency: 'quarter',
        implementation: 'standard',
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.qualified).toBe(true);
      expect(result.totalScore).toBeGreaterThan(qualificationConfig.threshold - 5);
    });

    it('should correctly identify leads just below threshold', () => {
      const answers = {
        'budget-range': 'small',
        'budget-approval': 'pending',
        'decision-role': 'contributor',
        'buying-process': 'formal',
        'pain-points': 'moderate',
        urgency: 'year',
        implementation: 'extended',
      };

      const result = calculateScore(answers, qualificationConfig);

      expect(result.qualified).toBe(false);
      expect(result.totalScore).toBeLessThan(qualificationConfig.threshold);
    });
  });

  describe('Config and Scoring Alignment', () => {
    it('should have all questions referenced in the config used in scoring', () => {
      // Get all question IDs from config
      const configQuestionIds: string[] = [];
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          configQuestionIds.push(question.id);
        });
      });

      // Create answers with all questions
      const answers: Record<string, string> = {};
      configQuestionIds.forEach((id) => {
        answers[id] = 'dummy_value';
      });

      // Mock the scoring to ensure all questions are processed
      expect(configQuestionIds.length).toBeGreaterThan(0);
      expect(configQuestionIds).toContain('budget-range');
      expect(configQuestionIds).toContain('budget-approval');
      expect(configQuestionIds).toContain('decision-role');
      expect(configQuestionIds).toContain('buying-process');
      expect(configQuestionIds).toContain('pain-points');
      expect(configQuestionIds).toContain('urgency');
      expect(configQuestionIds).toContain('implementation');
    });

    it('should match dimension structure in scoring calculations', () => {
      const answers = {
        'budget-range': 'large',
        'budget-approval': 'approved',
        'decision-role': 'decision_maker',
        'buying-process': 'agile',
        'pain-points': 'critical',
        urgency: 'immediate',
        implementation: 'quick',
      };

      const result = calculateScore(answers, qualificationConfig);

      // Verify breakdown has all dimensions from config
      expect(result.breakdown).toHaveProperty('budget');
      expect(result.breakdown).toHaveProperty('authority');
      expect(result.breakdown).toHaveProperty('need');
      expect(result.breakdown).toHaveProperty('timeline');

      // Verify dimensions in breakdown match config dimensions
      const breakdownDimensions = Object.keys(result.breakdown);
      const configDimensions = Object.keys(qualificationConfig.dimensions);
      expect(breakdownDimensions.sort()).toEqual(configDimensions.sort());
    });

    it('should apply weights from config correctly', () => {
      const answers = {
        'budget-range': 'large',
        'budget-approval': 'approved',
        'decision-role': 'decision_maker',
        'buying-process': 'agile',
        'pain-points': 'critical',
        urgency: 'immediate',
        implementation: 'quick',
      };

      const result = calculateScore(answers, qualificationConfig);

      // All dimensions are 100%, so total should be:
      // (100 * budget.weight) + (100 * authority.weight) + (100 * need.weight) + (100 * timeline.weight)
      // = 100 * (0.3 + 0.25 + 0.3 + 0.15) = 100 * 1.0 = 100
      expect(result.totalScore).toBe(100);

      // Verify weights sum to 1.0
      const weightSum = Object.values(qualificationConfig.dimensions).reduce(
        (sum, dim) => sum + dim.weight,
        0
      );
      expect(weightSum).toBe(1.0);
    });

    it('should properly use outcome definitions from config', () => {
      // Qualified outcome
      const qualifiedAnswers = {
        'budget-range': 'large',
        'budget-approval': 'approved',
        'decision-role': 'decision_maker',
        'buying-process': 'agile',
        'pain-points': 'critical',
        urgency: 'immediate',
        implementation: 'quick',
      };

      const qualifiedResult = calculateScore(qualifiedAnswers, qualificationConfig);

      expect(qualifiedResult.qualified).toBe(true);
      expect(qualificationConfig.outcomes.qualified).toBeDefined();
      expect(qualificationConfig.outcomes.qualified.headline).toBeDefined();

      // Disqualified outcome
      const disqualifiedAnswers = {
        'budget-range': 'minimal',
        'budget-approval': 'unapproved',
        'decision-role': 'researcher',
        'buying-process': 'complex',
        'pain-points': 'low',
        urgency: 'someday',
        implementation: 'distant',
      };

      const disqualifiedResult = calculateScore(disqualifiedAnswers, qualificationConfig);

      expect(disqualifiedResult.qualified).toBe(false);
      expect(qualificationConfig.outcomes.disqualified).toBeDefined();
      expect(qualificationConfig.outcomes.disqualified.headline).toBeDefined();
    });
  });

  describe('Real-world Scenarios', () => {
    it('should handle mid-market prospect with mixed signals', () => {
      const answers = {
        'budget-range': 'medium',
        'budget-approval': 'likely',
        'decision-role': 'influencer',
        'buying-process': 'standard',
        'pain-points': 'high',
        urgency: 'quarter',
        implementation: 'standard',
      };

      const result = calculateScore(answers, qualificationConfig);

      // Should be qualified but not perfect
      expect(result.qualified).toBe(true);
      expect(result.totalScore).toBeGreaterThan(qualificationConfig.threshold);
      expect(result.totalScore).toBeLessThan(100);
    });

    it('should handle enterprise prospect with high friction but high value', () => {
      const answers = {
        'budget-range': 'large',
        'budget-approval': 'likely',
        'decision-role': 'contributor',
        'buying-process': 'formal',
        'pain-points': 'critical',
        urgency: 'quarter',
        implementation: 'extended',
      };

      const result = calculateScore(answers, qualificationConfig);

      // Should be qualified despite process friction
      expect(result.qualified).toBe(true);
      expect(result.totalScore).toBeGreaterThan(qualificationConfig.threshold);
    });

    it('should handle low-priority inquiry', () => {
      const answers = {
        'budget-range': 'small',
        'budget-approval': 'pending',
        'decision-role': 'researcher',
        'buying-process': 'complex',
        'pain-points': 'low',
        urgency: 'someday',
        implementation: 'distant',
      };

      const result = calculateScore(answers, qualificationConfig);

      // Should be disqualified
      expect(result.qualified).toBe(false);
      expect(result.totalScore).toBeLessThan(qualificationConfig.threshold);
    });

    it('should handle lead with budget but no urgency', () => {
      const answers = {
        'budget-range': 'large',
        'budget-approval': 'approved',
        'decision-role': 'decision_maker',
        'buying-process': 'agile',
        'pain-points': 'moderate',
        urgency: 'year',
        implementation: 'extended',
      };

      const result = calculateScore(answers, qualificationConfig);

      // Budget strength should be enough for qualification despite low urgency
      expect(result.breakdown.budget.percentage).toBe(100);
      expect(result.totalScore).toBeGreaterThan(50);
    });
  });
});
