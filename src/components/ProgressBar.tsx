'use client';

import { memo } from 'react';

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
    <div className="w-full space-y-4">
      {/* Step indicators with labels */}
      <div className="flex justify-between items-center">
        {stepLabels.map((label, index) => (
          <div key={label} className="flex flex-col items-center flex-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all duration-300 ${
                index <= currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            <p
              className={`text-xs mt-2 text-center text-nowrap px-1 transition-colors duration-300 ${
                index === currentStep ? 'text-blue-600 font-semibold' : 'text-gray-500'
              }`}
            >
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step counter text */}
      <p className="text-sm text-gray-600 text-center">
        Step {currentStep + 1} of {totalSteps}
      </p>
    </div>
  );
});
