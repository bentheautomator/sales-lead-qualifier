/**
 * Tests for qualification config validation
 * Ensures config integrity and consistency
 */

import { qualificationConfig } from '@/config/qualification';

describe('Qualification Config Validation', () => {
  describe('Dimension Weights', () => {
    it('should have dimension weights that sum to 1.0', () => {
      const weightSum = Object.values(qualificationConfig.dimensions).reduce(
        (sum, dimension) => sum + dimension.weight,
        0
      );

      expect(weightSum).toBe(1.0);
    });

    it('should have all dimensions with valid weight values', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        expect(dimension.weight).toBeGreaterThan(0);
        expect(dimension.weight).toBeLessThanOrEqual(1);
      });
    });

    it('should have weights that are numbers', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        expect(typeof dimension.weight).toBe('number');
      });
    });
  });

  describe('Questions', () => {
    it('should have all questions with IDs', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          expect(question.id).toBeDefined();
          expect(typeof question.id).toBe('string');
          expect(question.id.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have all questions with text', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          expect(question.text).toBeDefined();
          expect(typeof question.text).toBe('string');
          expect(question.text.length).toBeGreaterThan(0);
        });
      });
    });

    it('should have at least 2 options per question', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          expect(question.options.length).toBeGreaterThanOrEqual(2);
        });
      });
    });

    it('should have no duplicate question IDs across config', () => {
      const allQuestionIds: string[] = [];

      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          allQuestionIds.push(question.id);
        });
      });

      const uniqueIds = new Set(allQuestionIds);
      expect(uniqueIds.size).toBe(allQuestionIds.length);
    });
  });

  describe('Options', () => {
    it('should have all options with labels', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          question.options.forEach((option) => {
            expect(option.label).toBeDefined();
            expect(typeof option.label).toBe('string');
            expect(option.label.length).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should have all options with values', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          question.options.forEach((option) => {
            expect(option.value).toBeDefined();
            expect(typeof option.value).toBe('string');
            expect(option.value.length).toBeGreaterThan(0);
          });
        });
      });
    });

    it('should have all options with points', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          question.options.forEach((option) => {
            expect(option.points).toBeDefined();
            expect(typeof option.points).toBe('number');
          });
        });
      });
    });

    it('should have point values between 0 and 100', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          question.options.forEach((option) => {
            expect(option.points).toBeGreaterThanOrEqual(0);
            expect(option.points).toBeLessThanOrEqual(100);
          });
        });
      });
    });

    it('should have no duplicate option values within a question', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          const optionValues = question.options.map((o) => o.value);
          const uniqueValues = new Set(optionValues);
          expect(uniqueValues.size).toBe(optionValues.length);
        });
      });
    });

    it('should have at least one option with maximum points (100)', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        dimension.questions.forEach((question) => {
          const maxPoints = Math.max(...question.options.map((o) => o.points));
          expect(maxPoints).toBe(100);
        });
      });
    });
  });

  describe('Threshold', () => {
    it('should have a threshold defined', () => {
      expect(qualificationConfig.threshold).toBeDefined();
      expect(typeof qualificationConfig.threshold).toBe('number');
    });

    it('should have threshold between 0 and 100', () => {
      expect(qualificationConfig.threshold).toBeGreaterThanOrEqual(0);
      expect(qualificationConfig.threshold).toBeLessThanOrEqual(100);
    });

    it('should have a reasonable threshold value', () => {
      // Threshold should be somewhere in the middle to upper range
      expect(qualificationConfig.threshold).toBeGreaterThan(50);
      expect(qualificationConfig.threshold).toBeLessThan(100);
    });
  });

  describe('Outcomes', () => {
    it('should have qualified and disqualified outcomes', () => {
      expect(qualificationConfig.outcomes.qualified).toBeDefined();
      expect(qualificationConfig.outcomes.disqualified).toBeDefined();
    });

    it('should have required fields in qualified outcome', () => {
      const qualified = qualificationConfig.outcomes.qualified;
      expect(qualified.headline).toBeDefined();
      expect(typeof qualified.headline).toBe('string');
      expect(qualified.cta).toBeDefined();
      expect(typeof qualified.cta).toBe('string');
      expect(qualified.ctaUrl).toBeDefined();
      expect(typeof qualified.ctaUrl).toBe('string');
    });

    it('should have required fields in disqualified outcome', () => {
      const disqualified = qualificationConfig.outcomes.disqualified;
      expect(disqualified.headline).toBeDefined();
      expect(typeof disqualified.headline).toBe('string');
      expect(disqualified.cta).toBeDefined();
      expect(typeof disqualified.cta).toBe('string');
      expect(disqualified.ctaUrl).toBeDefined();
      expect(typeof disqualified.ctaUrl).toBe('string');
    });

    it('should have non-empty CTA URLs', () => {
      expect(qualificationConfig.outcomes.qualified.ctaUrl!.length).toBeGreaterThan(0);
      expect(qualificationConfig.outcomes.disqualified.ctaUrl!.length).toBeGreaterThan(0);
    });

    it('should have non-empty headlines', () => {
      expect(qualificationConfig.outcomes.qualified.headline!.length).toBeGreaterThan(0);
      expect(qualificationConfig.outcomes.disqualified.headline!.length).toBeGreaterThan(0);
    });

    it('should have non-empty CTAs', () => {
      expect(qualificationConfig.outcomes.qualified.cta!.length).toBeGreaterThan(0);
      expect(qualificationConfig.outcomes.disqualified.cta!.length).toBeGreaterThan(0);
    });
  });

  describe('Structure', () => {
    it('should have dimensions object', () => {
      expect(qualificationConfig.dimensions).toBeDefined();
      expect(typeof qualificationConfig.dimensions).toBe('object');
    });

    it('should have at least 2 dimensions', () => {
      const dimensionCount = Object.keys(qualificationConfig.dimensions).length;
      expect(dimensionCount).toBeGreaterThanOrEqual(2);
    });

    it('should have dimension names', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        expect(dimension.name).toBeDefined();
        expect(typeof dimension.name).toBe('string');
        expect(dimension.name.length).toBeGreaterThan(0);
      });
    });

    it('should have no empty dimensions', () => {
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        expect(dimension.questions.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Consistency', () => {
    it('should have correct number of questions for budget dimension', () => {
      expect(qualificationConfig.dimensions.budget.questions.length).toBe(2);
    });

    it('should have correct number of questions for authority dimension', () => {
      expect(qualificationConfig.dimensions.authority.questions.length).toBe(2);
    });

    it('should have correct number of questions for need dimension', () => {
      expect(qualificationConfig.dimensions.need.questions.length).toBe(2);
    });

    it('should have correct number of questions for timeline dimension', () => {
      expect(qualificationConfig.dimensions.timeline.questions.length).toBe(1);
    });

    it('should have exactly 7 total questions', () => {
      let totalQuestions = 0;
      Object.values(qualificationConfig.dimensions).forEach((dimension) => {
        totalQuestions += dimension.questions.length;
      });
      expect(totalQuestions).toBe(7);
    });
  });

  describe('Business Rules', () => {
    it('should have budget dimension with higher weight than timeline', () => {
      expect(qualificationConfig.dimensions.budget.weight).toBeGreaterThan(
        qualificationConfig.dimensions.timeline.weight
      );
    });

    it('should have need dimension with equal or higher weight than authority', () => {
      expect(qualificationConfig.dimensions.need.weight).toBeGreaterThanOrEqual(
        qualificationConfig.dimensions.authority.weight
      );
    });

    it('should have authority dimension with higher weight than timeline', () => {
      expect(qualificationConfig.dimensions.authority.weight).toBeGreaterThan(
        qualificationConfig.dimensions.timeline.weight
      );
    });

    it('should have timeline as lowest weight dimension', () => {
      const timelineWeight = qualificationConfig.dimensions.timeline.weight;
      const allWeights = Object.values(qualificationConfig.dimensions).map((d) => d.weight);
      expect(timelineWeight).toBeLessThanOrEqual(Math.min(...allWeights));
    });
  });

  describe('Outcome Messages', () => {
    it('should have descriptive messages for outcomes', () => {
      expect(qualificationConfig.outcomes.qualified.description).toBeDefined();
      expect(qualificationConfig.outcomes.qualified.description!.length).toBeGreaterThan(0);
      expect(qualificationConfig.outcomes.disqualified.description).toBeDefined();
      expect(qualificationConfig.outcomes.disqualified.description!.length).toBeGreaterThan(0);
    });

    it('should have different headlines for qualified and disqualified', () => {
      expect(qualificationConfig.outcomes.qualified.headline).not.toBe(
        qualificationConfig.outcomes.disqualified.headline
      );
    });

    it('should have different CTAs for qualified and disqualified', () => {
      expect(qualificationConfig.outcomes.qualified.cta).not.toBe(
        qualificationConfig.outcomes.disqualified.cta
      );
    });

    it('should have different CTA URLs for qualified and disqualified', () => {
      expect(qualificationConfig.outcomes.qualified.ctaUrl).not.toBe(
        qualificationConfig.outcomes.disqualified.ctaUrl
      );
    });
  });
});
