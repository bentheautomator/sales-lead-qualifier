"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { qualificationConfig } from "@/config/qualification";
import { calculateScore } from "@/lib/scoring";
import type { Dimension } from "@/types";

const DIMENSIONS = Object.entries(qualificationConfig.dimensions);

interface UseQuizReturn {
  currentStep: number;
  answers: Record<string, string>;
  isSubmitting: boolean;
  error: string | null;
  currentDimension: [string, Dimension];
  allQuestionsAnswered: boolean;
  handleSelectOption: (questionId: string, value: string) => void;
  handleNext: () => void;
  handleBack: () => void;
  handleSubmit: () => Promise<void>;
}

/**
 * Custom hook for managing quiz state and logic
 * Encapsulates all state and handlers for the quiz form
 */
export function useQuiz(): UseQuizReturn {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentDimension = DIMENSIONS[currentStep];
  const [, dimension] = currentDimension as [string, Dimension];

  // Check if all questions in current dimension are answered
  const allQuestionsAnswered = dimension.questions.every((question) => answers[question.id]);

  const handleSelectOption = useCallback((questionId: string, value: string) => {
    setError(null);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < DIMENSIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      setError(null);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setError(null);

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
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to submit quiz";
      console.error("Error calculating score:", err);
      setError(errorMessage);
      setIsSubmitting(false);
    }
  }, [answers, router]);

  return {
    currentStep,
    answers,
    isSubmitting,
    error,
    currentDimension,
    allQuestionsAnswered,
    handleSelectOption,
    handleNext,
    handleBack,
    handleSubmit,
  };
}
