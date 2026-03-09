'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { qualificationConfig } from '@/config/qualification';
import { calculateScore } from '@/lib/scoring';
import { ProgressBar } from '@/components/ProgressBar';
import { QuestionCard } from '@/components/QuestionCard';
import type { Dimension } from '@/types';

const DIMENSIONS = Object.entries(qualificationConfig.dimensions);

export default function Home() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDimension = DIMENSIONS[currentStep];
  const [, dimension] = currentDimension as [
    string,
    Dimension,
  ];

  // Check if all questions in current dimension are answered
  const allQuestionsAnswered = dimension.questions.every(
    (question) => answers[question.id]
  );

  const handleSelectOption = useCallback(
    (questionId: string, value: string) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: value,
      }));
    },
    []
  );

  const handleNext = useCallback(() => {
    if (currentStep < DIMENSIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const scoreResult = calculateScore(answers, qualificationConfig);

      // Extract percentages from breakdown for simpler query params
      const breakdownPercentages: Record<string, number> = {};
      Object.entries(scoreResult.breakdown).forEach(([key, value]) => {
        breakdownPercentages[key] = value.percentage;
      });

      // Prepare query parameters
      const params = new URLSearchParams({
        score: String(scoreResult.totalScore),
        qualified: String(scoreResult.qualified),
        breakdown: JSON.stringify(breakdownPercentages),
      });

      // Redirect to result page
      router.push(`/result?${params.toString()}`);
    } catch (error) {
      console.error('Error calculating score:', error);
      setIsSubmitting(false);
    }
  }, [answers, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 py-8 px-4 sm:py-12">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
            Sales Lead Qualifier
          </h1>
          <p className="text-lg text-gray-600">
            Let&apos;s find out if we&apos;re the right fit for your business
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <ProgressBar
            currentStep={currentStep}
            totalSteps={DIMENSIONS.length}
            stepLabels={DIMENSIONS.map(([, dim]) => dim.name)}
          />
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="space-y-6">
            {dimension.questions.map((question) => (
              <QuestionCard
                key={question.id}
                question={question}
                selectedValue={answers[question.id]}
                onSelect={handleSelectOption}
              />
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 justify-between">
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
              currentStep === 0
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
            }`}
          >
            Back
          </button>

          {/* Next/Submit Button */}
          {currentStep < DIMENSIONS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!allQuestionsAnswered}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 ${
                !allQuestionsAnswered
                  ? 'bg-blue-300 text-white cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 shadow-md hover:shadow-lg'
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 ${
                !allQuestionsAnswered || isSubmitting
                  ? 'bg-green-300 text-white cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 active:bg-green-800 shadow-md hover:shadow-lg'
              }`}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </>
              ) : (
                <>
                  Submit
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7l5 5m0 0l-5 5m5-5H6"
                    />
                  </svg>
                </>
              )}
            </button>
          )}
        </div>

        {/* Progress Text */}
        <p className="text-center text-sm text-gray-500 mt-6">
          {currentStep + 1} of {DIMENSIONS.length} steps completed
        </p>
      </div>
    </div>
  );
}
