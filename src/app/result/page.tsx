"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { qualificationConfig } from "@/config/qualification";

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const score = searchParams.get("score");
  const qualified = searchParams.get("qualified");
  const breakdownParam = searchParams.get("breakdown");

  // Redirect if no query params
  if (!score || !qualified || !breakdownParam) {
    router.push("/");
    return null;
  }

  const scoreNum = parseInt(score || "0", 10);
  const isQualified = qualified === "true";

  let breakdown: Record<string, number> = {};
  try {
    breakdown = JSON.parse(decodeURIComponent(breakdownParam || "{}"));
  } catch {
    breakdown = {};
  }

  const outcome = isQualified
    ? qualificationConfig.outcomes.qualified
    : qualificationConfig.outcomes.disqualified;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Main Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          {/* Header with conditional background */}
          <div
            className={`px-8 py-12 text-center ${
              isQualified
                ? "bg-gradient-to-r from-emerald-50 to-teal-50 border-b-4 border-emerald-200"
                : "bg-gradient-to-r from-amber-50 to-orange-50 border-b-4 border-amber-200"
            }`}
          >
            <h1
              className={`text-4xl md:text-5xl font-bold mb-6 ${
                isQualified ? "text-emerald-900" : "text-amber-900"
              }`}
            >
              {outcome.headline || outcome.title}
            </h1>

            <p className="text-lg text-gray-700 leading-relaxed max-w-xl mx-auto">
              {outcome.description || outcome.message}
            </p>
          </div>

          {/* Score Section */}
          <div className="px-8 py-12">
            <div className="flex flex-col items-center mb-12">
              <div className="relative w-40 h-40 mb-6">
                {/* Circular progress background */}
                <svg className="absolute inset-0 w-full h-full" viewBox="0 0 160 160">
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke="#e2e8f0"
                    strokeWidth="8"
                  />
                  {/* Animated progress circle */}
                  <circle
                    cx="80"
                    cy="80"
                    r="70"
                    fill="none"
                    stroke={isQualified ? "#10b981" : "#f59e0b"}
                    strokeWidth="8"
                    strokeDasharray={`${Math.PI * 140 * (scoreNum / 100)} ${
                      Math.PI * 140
                    }`}
                    strokeLinecap="round"
                    className="transition-all duration-1000 ease-out"
                    transform="rotate(-90 80 80)"
                  />
                </svg>

                {/* Score text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div
                    className={`text-5xl font-bold ${
                      isQualified ? "text-emerald-600" : "text-amber-600"
                    }`}
                  >
                    {scoreNum}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">/ 100</div>
                </div>
              </div>

              <p className="text-center text-gray-600">
                {isQualified ? (
                  <span className="text-emerald-700 font-semibold">
                    You qualify as a strong prospect
                  </span>
                ) : (
                  <span className="text-amber-700 font-semibold">
                    Keep exploring options that better match your profile
                  </span>
                )}
              </p>
            </div>

            {/* Score Breakdown */}
            {Object.keys(breakdown).length > 0 && (
              <div className="mb-12 pt-8 border-t border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800 mb-8">
                  Your BANT Breakdown
                </h2>

                <div className="space-y-8">
                  {Object.entries(breakdown).map(([dimension, score], index) => (
                    <div key={dimension} className="animate-fade-in" style={{
                      animationDelay: `${index * 100}ms`,
                    }}>
                      <div className="flex items-end justify-between mb-2">
                        <h3 className="font-semibold text-gray-700 capitalize">
                          {dimension}
                        </h3>
                        <span className="text-sm font-medium text-gray-600">
                          {score}%
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-1000 ease-out ${
                            isQualified
                              ? "bg-gradient-to-r from-emerald-400 to-teal-500"
                              : "bg-gradient-to-r from-amber-400 to-orange-500"
                          }`}
                          style={{
                            width: `${score}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* CTA Button */}
            {outcome.cta && outcome.ctaUrl && (
              <div className="mb-6">
                <a
                  href={outcome.ctaUrl}
                  className={`block w-full py-4 px-6 rounded-lg font-semibold text-lg text-white text-center transition-all duration-200 hover:shadow-lg active:scale-95 ${
                    isQualified
                      ? "bg-emerald-600 hover:bg-emerald-700 shadow-md"
                      : "bg-amber-600 hover:bg-amber-700 shadow-md"
                  }`}
                >
                  {outcome.cta}
                </a>
              </div>
            )}

            {/* Start Over Link */}
            <div className="text-center">
              <Link
                href="/"
                className="inline-flex items-center text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                ← Start Over
              </Link>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Questions? Reach out to our team anytime.</p>
        </div>
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
}

export default function ResultPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-gray-500">Loading results...</div>
        </div>
      }
    >
      <ResultContent />
    </Suspense>
  );
}
