"use client";

import React, { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Error Boundary component to catch render errors
 * Displays a friendly error UI and logs errors to console
 */
export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error) {
    console.error("Error caught by boundary:", error);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 flex items-center justify-center px-4 py-8">
          <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-xl shadow-lg dark:shadow-xl dark:shadow-slate-900/50 p-8 border dark:border-slate-700/50">
            {/* Error Icon */}
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-600 dark:text-red-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4v2m0 4v2M6.343 3.665c-.256-.256-.672-.275-1.005-.048L2.817 5.198c-.334.227-.334.681 0 .908l3.521 2.581c.333.227.75.208 1.005-.048l.707-.707-.707-.707zm11.314 0l.707.707-.707.707c-.256.256-.672.275-1.005.048l-3.521-2.581c-.334-.227-.334-.681 0-.908l3.521-2.581c.333-.227.75-.208 1.005.048l.707.707zM6.343 20.335l-.707-.707.707-.707c.256-.256.672-.275 1.005-.048l3.521 2.581c.334.227.334.681 0 .908l-3.521 2.581c-.333.227-.75.208-1.005-.048l-.707-.707zm11.314 0l-.707-.707.707-.707c.256-.256.672-.275 1.005-.048l3.521 2.581c.334.227.334.681 0 .908l-3.521 2.581c-.333.227-.75.208-1.005-.048l-.707-.707z"
                  />
                </svg>
              </div>
            </div>

            {/* Error Title */}
            <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-3">
              Oops! Something went wrong
            </h2>

            {/* Error Message */}
            <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
              We encountered an unexpected error. Please try again or contact support if the problem
              persists.
            </p>

            {/* Error Details (Development) */}
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mb-6 p-3 bg-gray-50 dark:bg-slate-900 rounded border border-gray-200 dark:border-slate-700">
                <summary className="cursor-pointer font-mono text-sm text-gray-700 dark:text-gray-300 mb-2">
                  Error Details
                </summary>
                <pre className="font-mono text-xs text-gray-600 dark:text-gray-400 overflow-auto max-h-32">
                  {this.state.error.toString()}
                </pre>
              </details>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:bg-blue-800 transition-all duration-200"
              >
                Try Again
              </button>
              {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- Error boundary can't use Next Link reliably */}
              <a
                href="/"
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 active:bg-gray-300 dark:active:bg-slate-500 transition-all duration-200 text-center"
              >
                Return Home
              </a>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
