/**
 * Scoring Engine for Lead Qualification
 * Pure function that calculates qualification scores based on answers
 */

import type { QualificationConfig, ScoreResult, DimensionScore } from "@/types";

/**
 * Calculate the qualification score for a lead based on their answers
 *
 * @param answers - Record of questionId -> selectedOptionValue
 * @param config - The qualification configuration
 * @returns ScoreResult with total score, qualification status, and breakdown
 */
export function calculateScore(
  answers: Record<string, string>,
  config: QualificationConfig
): ScoreResult {
  const breakdown: Record<string, DimensionScore> = {};
  let weightedSum = 0;

  // Process each dimension
  for (const [dimensionKey, dimension] of Object.entries(config.dimensions)) {
    let dimensionScore = 0;
    let maxDimensionScore = 0;

    // Process each question in the dimension
    for (const question of dimension.questions) {
      const answerValue = answers[question.id];

      // Find the selected option or default to 0 points if no answer
      const selectedOption = question.options.find(
        (option) => option.value === answerValue
      );
      const pointsForQuestion = selectedOption?.points ?? 0;

      // Find the maximum points available for this question
      const maxPointsForQuestion = Math.max(
        ...question.options.map((option) => option.points)
      );

      dimensionScore += pointsForQuestion;
      maxDimensionScore += maxPointsForQuestion;
    }

    // Calculate percentage for this dimension (0-100)
    const dimensionPercentage =
      maxDimensionScore > 0 ? (dimensionScore / maxDimensionScore) * 100 : 0;

    // Store the breakdown
    breakdown[dimensionKey] = {
      score: dimensionScore,
      maxScore: maxDimensionScore,
      percentage: Math.round(dimensionPercentage * 10) / 10, // Round to 1 decimal place
    };

    // Add weighted contribution to total
    weightedSum += dimensionPercentage * dimension.weight;
  }

  const totalScore = Math.round(weightedSum * 10) / 10; // Round to 1 decimal place
  const qualified = totalScore >= config.threshold;

  return {
    totalScore,
    qualified,
    breakdown,
  };
}
