"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { qualificationConfig } from "@/config/qualification";
import { ProgressBar } from "@/components/ProgressBar";
import { QuestionCard } from "@/components/QuestionCard";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { Dimension } from "@/types";

const DIMENSIONS = Object.entries(qualificationConfig.dimensions);

export default function Home() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentDimension = DIMENSIONS[currentStep];
  const [, dimension] = currentDimension as [string, Dimension];

  // Check if all questions in current dimension are answered
  const allQuestionsAnswered = dimension.questions.every((question) => answers[question.id]);

  const handleSelectOption = useCallback((questionId: string, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  }, []);

  const handleNext = useCallback(() => {
    if (currentStep < DIMENSIONS.length - 1) {
      setCurrentStep((prev) => prev + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [currentStep]);

  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);

    try {
      // POST answers to server for scoring (server sets signed cookie)
      const response = await fetch("/api/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });

      if (!response.ok) {
        console.error("Score calculation failed");
        setIsSubmitting(false);
        return;
      }

      // Server has set a signed HttpOnly cookie with the score
      // Redirect to result page (no sensitive data in URL)
      router.push("/result");
    } catch (error) {
      console.error("Error submitting answers:", error);
      setIsSubmitting(false);
    }
  }, [answers, router]);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-8 px-4 sm:py-12 transition-colors">
      <div className="max-w-2xl mx-auto">
        {/* Theme Toggle */}
        <div className="absolute top-8 right-4 sm:right-8 animate-float-in">
          <ThemeToggle />
        </div>

        {/* Header */}
        <div className="mb-8 text-center animate-float-in">
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent mb-2">
            Sales Lead Qualifier
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Let&apos;s find out if we&apos;re the right fit for your business
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12 animate-float-in" style={{ animationDelay: "100ms" }}>
          <ProgressBar
            currentStep={currentStep}
            totalSteps={DIMENSIONS.length}
            stepLabels={DIMENSIONS.map(([, dim]) => dim.name)}
          />
        </div>

        {/* Question Card */}
        <div
          className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl dark:shadow-slate-900/50 p-8 mb-8 backdrop-blur-sm border dark:border-slate-700/50 animate-float-in"
          style={{ animationDelay: "200ms" }}
        >
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
        <div
          className="flex gap-4 justify-between animate-float-in"
          style={{ animationDelay: "300ms" }}
        >
          {/* Back Button */}
          <button
            onClick={handleBack}
            disabled={currentStep === 0}
            className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
              currentStep === 0
                ? "text-gray-400 bg-gray-100 dark:bg-slate-700 dark:text-gray-500 cursor-not-allowed"
                : "text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 active:bg-gray-300 dark:active:bg-slate-800"
            }`}
          >
            Back
          </button>

          {/* Next/Submit Button */}
          {currentStep < DIMENSIONS.length - 1 ? (
            <button
              onClick={handleNext}
              disabled={!allQuestionsAnswered}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 active:scale-95 ${
                !allQuestionsAnswered
                  ? "bg-blue-300 dark:bg-blue-900 text-white cursor-not-allowed"
                  : "bg-blue-600 dark:bg-blue-600 text-white hover:bg-blue-700 dark:hover:bg-blue-700 active:bg-blue-800 dark:active:bg-blue-800 shadow-md hover:shadow-lg hover:shadow-blue-500/30"
              }`}
            >
              Next
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!allQuestionsAnswered || isSubmitting}
              className={`px-8 py-3 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 active:scale-95 ${
                !allQuestionsAnswered || isSubmitting
                  ? "bg-green-300 dark:bg-green-900 text-white cursor-not-allowed"
                  : "bg-green-600 dark:bg-green-600 text-white hover:bg-green-700 dark:hover:bg-green-700 active:bg-green-800 dark:active:bg-green-800 shadow-md hover:shadow-lg hover:shadow-green-500/30"
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
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          {currentStep + 1} of {DIMENSIONS.length} steps completed
        </p>
      </div>
    </div>
  );
}
