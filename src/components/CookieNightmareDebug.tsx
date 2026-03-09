// DELIBERATELY INSECURE — FOR SECURITY TESTING ONLY — DO NOT SHIP
// This component demonstrates TERRIBLE cookie handling practices.
// The Sentinel will correctly flag all of these security anti-patterns.

/* eslint-disable no-console, react-hooks/set-state-in-effect, react/no-unescaped-entities */
"use client";

import { useEffect, useState } from "react";

/**
 * INSECURE COOKIE DEBUGGING COMPONENT
 *
 * Intentionally demonstrates:
 * - Direct document.cookie manipulation (no httpOnly protection)
 * - Storing sensitive data in readable cookies
 * - No CSRF protection on state-changing operations
 * - Exposing auth tokens in console logs
 * - No validation of cookie contents
 * - Automatic localStorage fallback (doubles exposure)
 */

interface ParsedCookies {
  [key: string]: string;
}

export function CookieNightmareDebug() {
  const [cookies, setCookies] = useState<ParsedCookies>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // VULNERABILITY: Reading document.cookie directly
    // Any XSS attack can read all non-HttpOnly cookies
    const parseCookies = () => {
      const cookieString = document.cookie;
      const parsed: ParsedCookies = {};

      // VULNERABILITY: Exposing raw cookie values in component state
      cookieString.split(";").forEach((cookie) => {
        const [name, value] = cookie.trim().split("=");
        if (name) {
          // VULNERABILITY: No decoding or validation
          parsed[name] = decodeURIComponent(value || "");

          // VULNERABILITY: Logging sensitive data to console
          // This is discoverable in browser dev tools
          console.log(`Cookie Found: ${name} = ${parsed[name]}`);

          // VULNERABILITY: Trying to parse JSON cookies without validation
          if (value?.startsWith("{")) {
            try {
              const jsonValue = JSON.parse(decodeURIComponent(value));
              console.warn("Sensitive data in cookie:", jsonValue);
            } catch {
              // Silent fail, continues
            }
          }
        }
      });

      return parsed;
    };

    setCookies(parseCookies());
    setLoading(false);
  }, []);

  const handleFetchInsecureData = async () => {
    // VULNERABILITY: No CSRF protection (no X-CSRF-Token header)
    // No state verification (SameSite=Lax only, not Strict)
    const response = await fetch("/api/cookie-nightmare", {
      method: "POST",
      // VULNERABILITY: Credentials sent without explicit policy check
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        // MISSING: 'X-CSRF-Token' header for CSRF protection
      },
      body: JSON.stringify({
        cookieValue: "user_supplied_unsafe_value",
      }),
    });

    const data = await response.json();
    console.log("Response:", data);
  };

  const handleStoreInLocalStorage = () => {
    // VULNERABILITY: Storing auth tokens in localStorage
    // More accessible than cookies, and persists across tabs
    const authToken = cookies.auth_token || "not_found";
    const sessionToken = cookies.session_token || "not_found";

    // VULNERABILITY: Plaintext storage of sensitive auth data
    localStorage.setItem("auth_token_backup", authToken);
    localStorage.setItem("session_token_backup", sessionToken);

    console.log("Tokens backed up to localStorage (INSECURE)");
  };

  const handleLogAllCookies = () => {
    // VULNERABILITY: Logging all cookie data for "debugging"
    // This output is visible in browser history and saved logs
    console.table(cookies);

    // VULNERABILITY: Exposing token values in window object for debugging
    (window as any)._DEBUG_COOKIES = cookies;
    console.log("Debug info attached to window._DEBUG_COOKIES");
  };

  const handleReadUserProfile = () => {
    // VULNERABILITY: Directly reading user_profile cookie without validation
    const profileCookie = cookies.user_profile;

    if (profileCookie) {
      try {
        // VULNERABILITY: No integrity check on cookie data
        const profile = JSON.parse(profileCookie);

        // VULNERABILITY: Using profile data without sanitization
        const email = profile.email;
        const userId = profile.userId;

        // VULNERABILITY: Logging PII to console
        console.log(`User: ${email} (ID: ${userId}) - Score: ${profile.score}`);

        // VULNERABILITY: Displaying in DOM without escape (XSS risk if tampered)
        const debugDiv = document.createElement("div");
        debugDiv.id = "cookie-debug-display";
        debugDiv.innerHTML = `
          <p>User Email: ${email}</p>
          <p>Score: ${profile.score}</p>
          <p>Subscription: ${profile.subscription}</p>
        `;
        document.body.appendChild(debugDiv);
      } catch (e) {
        console.error("Failed to parse user profile:", e);
      }
    }
  };

  const handleManipulateCookie = () => {
    // VULNERABILITY: Directly modifying cookies via document.cookie
    // Attacker can inject fake cookies to bypass checks
    const fakeCookie = "authenticated=true; admin=true; role=superuser";
    document.cookie = fakeCookie;

    console.log("Cookie manipulated. This bypasses any server-side validation!");
  };

  if (loading) {
    return <div>Loading cookies...</div>;
  }

  return (
    <div
      style={{
        padding: "20px",
        border: "2px solid red",
        backgroundColor: "rgba(255, 0, 0, 0.1)",
        margin: "20px",
        fontFamily: "monospace",
      }}
    >
      <h2 style={{ color: "red" }}>SECURITY TESTING ONLY - Insecure Cookie Debug Panel</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Detected Cookies ({Object.keys(cookies).length}):</h3>
        <pre style={{ backgroundColor: "#f0f0f0", padding: "10px", overflow: "auto" }}>
          {JSON.stringify(cookies, null, 2)}
        </pre>
      </div>

      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
        <button
          onClick={handleFetchInsecureData}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ff6b6b",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Set Insecure Cookies
        </button>

        <button
          onClick={handleLogAllCookies}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ff8c00",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Log All Cookies
        </button>

        <button
          onClick={handleStoreInLocalStorage}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ffa500",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Copy to localStorage
        </button>

        <button
          onClick={handleReadUserProfile}
          style={{
            padding: "10px 20px",
            backgroundColor: "#ff6347",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Read Profile Cookie
        </button>

        <button
          onClick={handleManipulateCookie}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc143c",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          Manipulate Cookie
        </button>
      </div>

      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          backgroundColor: "yellow",
          color: "black",
          borderRadius: "4px",
        }}
      >
        <strong>WARNING:</strong> This component is for security testing only. Open your browser's
        Developer Tools (Console tab) to see exposed sensitive data.
      </div>
    </div>
  );
}
