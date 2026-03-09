"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { sanitizeString } from "@/lib/validation";

export default function GuidePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      setError(null);
      setIsSubmitting(true);

      try {
        const response = await fetch("/api/guide", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Failed to submit request");
          setIsSubmitting(false);
          return;
        }

        // Trigger PDF download if content-type is PDF
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/pdf")) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = "sales-qualification-playbook.pdf";
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        }

        setIsSuccess(true);
        setFormData({
          name: "",
          email: "",
          company: "",
        });
      } catch (err) {
        setError("An error occurred. Please try again.");
        console.error(err);
        setIsSubmitting(false);
      }
    },
    [formData],
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-amber-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 transition-colors">
      {/* Theme Toggle */}
      <div className="absolute top-8 right-4 sm:right-8 animate-float-in">
        <ThemeToggle />
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Back Link */}
        <div className="mb-8 animate-float-in">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium transition-colors"
          >
            ← Back to Qualifier
          </Link>
        </div>

        {isSuccess ? (
          // Success State
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl dark:shadow-slate-900/50 overflow-hidden border dark:border-slate-700/50 animate-float-in">
            <div className="px-8 py-12 text-center bg-gradient-to-r from-amber-50 dark:from-amber-900/30 to-orange-50 dark:to-orange-900/30 border-b-4 border-amber-200 dark:border-amber-800">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/50 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-amber-600 dark:text-amber-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-amber-900 dark:text-amber-200">
                Your Guide is Ready!
              </h1>

              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Thanks for your interest,{" "}
                <span className="font-semibold">{sanitizeString(formData.name, 255)}</span>!
              </p>
            </div>

            <div className="px-8 py-12">
              <div className="space-y-6 mb-8">
                <div className="bg-gradient-to-br from-amber-50 dark:from-amber-900/20 to-orange-50 dark:to-orange-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-8 text-center">
                  <div className="mb-4 text-4xl">📄</div>
                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    Your PDF should download automatically. If it doesn&apos;t, you can find the
                    guide in your downloads.
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    &quot;The Sales Qualification Playbook: A Practical Guide to Closing More
                    Deals&quot;
                  </p>
                </div>

                <p className="text-lg text-gray-700 dark:text-gray-300">
                  This guide contains 8 comprehensive sections covering the BANT framework, real
                  qualification questions, common mistakes, and a step-by-step process you can
                  implement immediately.
                </p>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-6">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-200 mb-3">
                    What&apos;s Inside:
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">✓</span>
                      <span>Deep dive into the BANT framework and each dimension</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">✓</span>
                      <span>Real conversation starters and qualifying questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">✓</span>
                      <span>Common qualification mistakes to avoid</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">✓</span>
                      <span>How to build a repeatable qualification process</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400">✓</span>
                      <span>Practical next steps to implement immediately</span>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📧 We&apos;ve also sent the guide to{" "}
                  <span className="font-mono font-medium">
                    {sanitizeString(formData.email, 255)}
                  </span>
                </p>
              </div>

              <div className="flex gap-4 flex-col sm:flex-row">
                <Link
                  href="/"
                  className="flex-1 py-3 px-6 rounded-lg font-medium text-white text-center bg-amber-600 dark:bg-amber-600 hover:bg-amber-700 dark:hover:bg-amber-700 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg hover:shadow-amber-500/30"
                >
                  Try the Qualifier
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Form State
          <div className="grid md:grid-cols-2 gap-8">
            {/* Guide Preview */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl dark:shadow-slate-900/50 overflow-hidden border dark:border-slate-700/50 animate-float-in h-fit">
              <div className="aspect-square bg-gradient-to-br from-amber-100 dark:from-amber-900/30 to-orange-100 dark:to-orange-900/30 flex flex-col items-center justify-center p-8 relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-200/20 via-orange-200/20 to-red-200/20 dark:from-amber-900/20 dark:via-orange-900/20 dark:to-red-900/20" />
                <div className="relative z-10 text-center">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-xl font-bold text-amber-900 dark:text-amber-200 mb-2">
                    The Sales Qualification Playbook
                  </h3>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    A Practical Guide to Closing More Deals
                  </p>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div className="border-b border-gray-200 dark:border-slate-700 pb-4">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm uppercase tracking-wide mb-3">
                    8 Sections
                  </h4>
                  <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-1">→</span>
                      <span>Why qualification matters</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-1">→</span>
                      <span>BANT framework deep dive</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-1">→</span>
                      <span>Real qualification questions</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-amber-600 dark:text-amber-400 mt-1">→</span>
                      <span>Proven qualification process</span>
                    </li>
                  </ul>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Instantly downloaded PDF • 8 pages • Professional design • Implementation ready
                </p>
              </div>
            </div>

            {/* Signup Form */}
            <div className="space-y-8">
              <div className="animate-float-in" style={{ animationDelay: "100ms" }}>
                <h1 className="text-3xl sm:text-4xl font-bold mb-4 bg-gradient-to-r from-amber-600 to-orange-600 dark:from-amber-400 dark:to-orange-400 bg-clip-text text-transparent">
                  Download Your Free Guide
                </h1>

                <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                  Master the BANT qualification framework with real conversation starters, practical
                  questions, and a step-by-step process you can implement immediately.
                </p>
              </div>

              <div
                className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl dark:shadow-slate-900/50 overflow-hidden border dark:border-slate-700/50 p-8 animate-float-in"
                style={{ animationDelay: "200ms" }}
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Field */}
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                    />
                  </div>

                  {/* Email Field */}
                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="john@company.com"
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                    />
                  </div>

                  {/* Company Field */}
                  <div>
                    <label
                      htmlFor="company"
                      className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                    >
                      Company <span className="text-gray-500">(optional)</span>
                    </label>
                    <input
                      type="text"
                      id="company"
                      name="company"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Acme Corp"
                      className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-400 transition-colors"
                    />
                  </div>

                  {/* Error Message */}
                  {error && (
                    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                      <p className="text-red-700 dark:text-red-200 text-sm">{error}</p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`w-full py-4 px-6 rounded-lg font-semibold text-lg text-white text-center transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 ${
                      isSubmitting
                        ? "bg-amber-400 dark:bg-amber-900 text-gray-700 cursor-not-allowed"
                        : "bg-amber-600 dark:bg-amber-600 hover:bg-amber-700 dark:hover:bg-amber-700 shadow-md hover:shadow-lg hover:shadow-amber-500/30"
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
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
                            d="M4 16v8a2 2 0 002 2h12a2 2 0 002-2v-8m-4-4l-4-4m0 0L8 8m4-4v12"
                          />
                        </svg>
                        Download Free Guide
                      </>
                    )}
                  </button>

                  <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                    No credit card required • Instant download • No spam
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
