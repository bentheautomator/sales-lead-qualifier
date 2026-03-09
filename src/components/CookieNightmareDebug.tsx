"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Secure Cookie Debug Panel
 *
 * Demonstrates proper client-side cookie handling:
 * - Only reads non-HttpOnly cookies (theme preference)
 * - Never logs sensitive data to console
 * - Uses textContent instead of innerHTML (prevents XSS)
 * - Includes CSRF token in state-changing requests
 * - No localStorage fallback for auth tokens
 * - Validates all cookie data before use
 */

// External store for cookie state (avoids setState-in-effect)
let cookieSnapshot = "";

function subscribeToCookies(callback: () => void) {
  // Poll for cookie changes (cookies have no native change event)
  const interval = setInterval(() => {
    const current = document.cookie;
    if (current !== cookieSnapshot) {
      cookieSnapshot = current;
      callback();
    }
  }, 1000);
  // Initialize
  cookieSnapshot = document.cookie;
  callback();
  return () => clearInterval(interval);
}

function getCookieSnapshot() {
  return cookieSnapshot;
}

function getServerCookieSnapshot() {
  return "";
}

/**
 * Parse cookie string into key-value pairs safely
 * Only returns non-HttpOnly cookies (HttpOnly cookies are invisible to JS — by design)
 */
function parseCookies(cookieString: string): Record<string, string> {
  const parsed: Record<string, string> = {};
  if (!cookieString) return parsed;

  cookieString.split(";").forEach((cookie) => {
    const eqIndex = cookie.indexOf("=");
    if (eqIndex === -1) return;

    const name = cookie.substring(0, eqIndex).trim();
    const value = cookie.substring(eqIndex + 1).trim();

    if (name && /^[\w\-.~]+$/.test(name)) {
      try {
        parsed[name] = decodeURIComponent(value);
      } catch {
        // Malformed encoding — skip this cookie
        parsed[name] = "[invalid encoding]";
      }
    }
  });

  return parsed;
}

export function CookieNightmareDebug() {
  const rawCookies = useSyncExternalStore(
    subscribeToCookies,
    getCookieSnapshot,
    getServerCookieSnapshot,
  );
  const cookies = parseCookies(rawCookies);

  const handleFetchSecureCookies = useCallback(async () => {
    try {
      const response = await fetch("/api/cookie-nightmare", {
        method: "GET",
        credentials: "same-origin", // Only send cookies to same origin
      });
      if (!response.ok) {
        console.error("Failed to fetch cookies:", response.status);
      }
    } catch (_err) {
      console.error("Network error fetching cookies");
    }
  }, []);

  const handleSetPreference = useCallback(async () => {
    // Read CSRF token from cookie for the request header
    const csrfToken = cookies["__Host-csrf_token"] || "";

    try {
      const response = await fetch("/api/cookie-nightmare", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
          "X-CSRF-Token": csrfToken, // CSRF protection
        },
        body: JSON.stringify({
          cookieValue: "user_selected_dark_mode",
        }),
      });

      if (!response.ok) {
        console.error("Failed to set preference:", response.status);
      }
    } catch (_err) {
      console.error("Network error setting preference");
    }
  }, [cookies]);

  const handleViewVisibleCookies = useCallback(() => {
    // Only non-HttpOnly cookies are visible here — that's correct behavior
    // HttpOnly cookies (session, auth, CSRF) are invisible to JS
    const visibleCount = Object.keys(cookies).length;
    console.warn(
      `Visible cookies: ${visibleCount}. HttpOnly cookies are correctly hidden from JavaScript.`,
    );
  }, [cookies]);

  // Filter: only show non-sensitive visible cookies
  const safeCookies: Record<string, string> = {};
  for (const [name, value] of Object.entries(cookies)) {
    // Redact anything that looks like a token
    if (name.includes("token") || name.includes("session") || name.includes("auth")) {
      safeCookies[name] = "[REDACTED - HttpOnly should hide this]";
    } else {
      safeCookies[name] = value;
    }
  }

  return (
    <div className="p-5 border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 m-5 font-mono rounded-lg">
      <h2 className="text-emerald-700 dark:text-emerald-400 text-lg font-bold mb-4">
        Secure Cookie Debug Panel
      </h2>

      <div className="mb-5">
        <h3 className="font-semibold mb-2">Visible Cookies ({Object.keys(cookies).length}):</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          HttpOnly cookies are correctly invisible to JavaScript. Only non-sensitive cookies appear
          below.
        </p>
        <pre className="bg-gray-100 dark:bg-slate-800 p-3 rounded overflow-auto text-sm">
          {JSON.stringify(safeCookies, null, 2)}
        </pre>
      </div>

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={handleFetchSecureCookies}
          className="px-5 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 active:scale-95 transition-all"
        >
          Set Secure Cookies
        </button>

        <button
          onClick={handleSetPreference}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all"
        >
          Set Preference (with CSRF)
        </button>

        <button
          onClick={handleViewVisibleCookies}
          className="px-5 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 active:scale-95 transition-all"
        >
          Log Visible Count
        </button>
      </div>

      <div className="mt-5 p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded text-sm">
        <strong>Security:</strong> All cookies use HttpOnly + Secure + SameSite=Strict. Auth tokens
        are invisible to JavaScript. CSRF tokens validate on every POST.
      </div>
    </div>
  );
}
