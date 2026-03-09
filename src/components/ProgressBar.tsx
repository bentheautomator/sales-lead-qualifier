"use client";

import { memo } from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressBar = memo(function ProgressBar({
  currentStep,
  totalSteps,
  stepLabels,
}: ProgressBarProps) {
  const progress = ((currentStep + 1) / totalSteps) * 100;

  return (
    <nav className="w-full space-y-4" aria-label="Progress">
      {/* Step indicators with labels */}
      <div className="flex justify-between items-center">
        {stepLabels.map((label, index) => (
          <div key={label} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                index <= currentStep
                  ? "bg-blue-600 dark:bg-blue-600 text-white shadow-lg shadow-blue-500/30"
                  : "bg-gray-200 dark:bg-slate-700 text-gray-600 dark:text-gray-400"
              }`}
              aria-current={index === currentStep ? "step" : undefined}
            >
              {index + 1}
            </div>
            <p
              className={`text-xs mt-2 text-center text-nowrap px-1 transition-colors duration-300 ${
                index === currentStep
                  ? "text-blue-600 dark:text-blue-400 font-semibold"
                  : "text-gray-500 dark:text-gray-400"
              }`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div
        className="w-full h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden"
        role="progressbar"
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter text */}
      <p className="text-sm text-gray-600 dark:text-gray-400 text-center" aria-live="polite">
        Step {currentStep + 1} of {totalSteps}
      </p>
    </nav>
  );
});
