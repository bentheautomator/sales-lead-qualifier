/**
 * Loading Skeleton for QuestionCard
 * Provides visual feedback while questions are loading
 */

export function QuestionCardSkeleton() {
  return (
    <div className="animate-pulse space-y-6">
      {/* Question Text Skeleton */}
      <div className="space-y-3">
        <div className="h-8 bg-gray-200 dark:bg-slate-700 rounded-lg w-4/5" />
        <div className="h-4 bg-gray-200 dark:bg-slate-700 rounded-lg w-3/4" />
      </div>

      {/* Option Cards Skeleton */}
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="p-4 bg-gray-100 dark:bg-slate-700/50 rounded-lg border border-gray-200 dark:border-slate-600 space-y-2"
          >
            <div className="flex items-center gap-3">
              {/* Radio Button Skeleton */}
              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-slate-600 flex-shrink-0" />
              {/* Label Skeleton */}
              <div className="flex-1 h-5 bg-gray-200 dark:bg-slate-600 rounded-lg w-2/3" />
            </div>
            {/* Optional description skeleton */}
            <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded-lg w-3/5 ml-9" />
          </div>
        ))}
      </div>

      {/* Bottom spacing */}
      <div className="h-4" />
    </div>
  );
}
