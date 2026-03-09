"use client";

import { memo } from "react";
import type { Question, Option } from "@/types";

interface QuestionCardProps {
  question: Question;
  selectedValue: string | undefined;
  onSelect: (questionId: string, value: string) => void;
}

export const QuestionCard = memo(function QuestionCard({
  question,
  selectedValue,
  onSelect,
}: QuestionCardProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{question.text}</h3>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {question.options.map((option: Option) => (
          <button
            key={option.value}
            onClick={() => onSelect(question.id, option.value)}
            className={`p-4 text-left rounded-lg border-2 transition-all duration-200 active:scale-95 ${
              selectedValue === option.value
                ? "border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-400 dark:ring-blue-500 shadow-lg shadow-blue-500/20"
                : "border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-slate-700 hover:shadow-md"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex-shrink-0 w-5 h-5 mt-0.5 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                  selectedValue === option.value
                    ? "border-blue-500 dark:border-blue-400 bg-blue-500 dark:bg-blue-600"
                    : "border-gray-300 dark:border-slate-500"
                }`}
              >
                {selectedValue === option.value && (
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100">{option.label}</p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
});
