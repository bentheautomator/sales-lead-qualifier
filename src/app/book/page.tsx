"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { ThemeToggle } from "@/components/ThemeToggle";
import { sanitizeString } from "@/lib/validation";

export default function BookPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    company: "",
    phone: "",
    preferredTime: "morning",
  });
  const [submittedData, setSubmittedData] = useState({
    name: "",
    email: "",
    preferredTime: "morning",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
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
        const response = await fetch("/api/book", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const data = await response.json();
          setError(data.error || "Failed to submit booking request");
          setIsSubmitting(false);
          return;
        }

        setSubmittedData({
          name: formData.name,
          email: formData.email,
          preferredTime: formData.preferredTime,
        });
        setIsSuccess(true);
        setIsSubmitting(false);
        setFormData({
          name: "",
          email: "",
          company: "",
          phone: "",
          preferredTime: "morning",
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 py-12 px-4 transition-colors">
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
            <div className="px-8 py-12 text-center bg-gradient-to-r from-emerald-50 dark:from-emerald-900/30 to-teal-50 dark:to-teal-900/30 border-b-4 border-emerald-200 dark:border-emerald-800">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 rounded-full flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-emerald-600 dark:text-emerald-400"
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

              <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-emerald-900 dark:text-emerald-200">
                Request Received!
              </h1>

              <p className="text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
                Thank you,{" "}
                <span className="font-semibold">{sanitizeString(submittedData.name, 255)}</span>!
              </p>
            </div>

            <div className="px-8 py-12">
              <div className="space-y-6 mb-8">
                <p className="text-lg text-gray-700 dark:text-gray-300">
                  We&apos;ve received your strategy call booking request for the{" "}
                  <span className="font-semibold">
                    {submittedData.preferredTime === "morning"
                      ? "Morning (9 AM - 12 PM)"
                      : submittedData.preferredTime === "afternoon"
                        ? "Afternoon (12 PM - 5 PM)"
                        : "Evening (5 PM - 8 PM)"}
                  </span>{" "}
                  time slot. We&apos;ll be in touch within 24 hours to confirm and discuss how we
                  can help you close more deals.
                </p>

                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-lg p-6">
                  <h3 className="font-semibold text-emerald-900 dark:text-emerald-200 mb-3">
                    What happens next:
                  </h3>
                  <ul className="space-y-2 text-gray-700 dark:text-gray-300 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">1.</span>
                      <span>
                        We&apos;ll send a calendar invite to confirm your preferred time slot
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">2.</span>
                      <span>
                        Our team will review your qualification profile to prepare for the call
                      </span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold">3.</span>
                      <span>
                        We&apos;ll discuss your needs and show you exactly how we can help
                      </span>
                    </li>
                  </ul>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-400">
                  📧 We&apos;ve sent a confirmation to{" "}
                  <span className="font-mono font-medium">
                    {sanitizeString(submittedData.email, 255)}
                  </span>
                </p>
              </div>

              <div className="flex gap-4 flex-col sm:flex-row">
                <Link
                  href="/"
                  className="flex-1 py-3 px-6 rounded-lg font-medium text-white text-center bg-blue-600 dark:bg-blue-600 hover:bg-blue-700 dark:hover:bg-blue-700 transition-all duration-200 active:scale-95 shadow-md hover:shadow-lg hover:shadow-blue-500/30"
                >
                  Run Qualifier Again
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Form State
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl dark:shadow-slate-900/50 overflow-hidden border dark:border-slate-700/50 animate-float-in">
            {/* Header */}
            <div className="px-8 py-12 text-center bg-gradient-to-r from-emerald-50 dark:from-emerald-900/30 to-teal-50 dark:to-teal-900/30 border-b-4 border-emerald-200 dark:border-emerald-800">
              <h1 className="text-3xl sm:text-4xl font-bold mb-4 text-emerald-900 dark:text-emerald-200">
                Book a Strategy Call
              </h1>

              <p className="text-lg text-gray-700 dark:text-gray-300 max-w-xl mx-auto">
                Congratulations on qualifying as a strong prospect! Let&apos;s discuss how we can
                help you close more deals and build a repeatable qualification process.
              </p>
            </div>

            {/* Form */}
            <div className="px-8 py-12">
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
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
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                  />
                </div>

                {/* Company Field */}
                <div>
                  <label
                    htmlFor="company"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Acme Corp"
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                  />
                </div>

                {/* Phone Field */}
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Phone Number <span className="text-gray-500">(optional)</span>
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 (555) 123-4567"
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                  />
                </div>

                {/* Preferred Time Field */}
                <div>
                  <label
                    htmlFor="preferredTime"
                    className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
                  >
                    Preferred Meeting Time <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="preferredTime"
                    name="preferredTime"
                    value={formData.preferredTime}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:border-emerald-500 dark:focus:border-emerald-400 transition-colors"
                  >
                    <option value="morning">Morning (9 AM - 12 PM)</option>
                    <option value="afternoon">Afternoon (12 PM - 5 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                  </select>
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
                  className={`w-full py-4 px-6 rounded-lg font-semibold text-lg text-white text-center transition-all duration-200 active:scale-95 ${
                    isSubmitting
                      ? "bg-emerald-400 dark:bg-emerald-900 text-gray-700 cursor-not-allowed"
                      : "bg-emerald-600 dark:bg-emerald-600 hover:bg-emerald-700 dark:hover:bg-emerald-700 shadow-md hover:shadow-lg hover:shadow-emerald-500/30"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Booking...
                    </span>
                  ) : (
                    "Schedule Strategy Call"
                  )}
                </button>

                <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                  We&apos;ll contact you within 24 hours. No spam, ever.
                </p>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
