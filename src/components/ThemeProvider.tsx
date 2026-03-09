"use client";

import React, { createContext, useContext, useCallback, useSyncExternalStore } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// External store for theme to avoid setState-in-effect lint error
let darkMode = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return darkMode;
}

function getServerSnapshot() {
  return false;
}

function initTheme() {
  if (typeof window === "undefined") return;
  const stored = localStorage.getItem("theme-dark");
  if (stored !== null) {
    darkMode = stored === "true";
  } else {
    darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  applyTheme();
}

function applyTheme() {
  if (typeof document === "undefined") return;
  if (darkMode) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

// Initialize on module load (client-side only)
if (typeof window !== "undefined") {
  initTheme();
}

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isDark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    darkMode = !darkMode;
    localStorage.setItem("theme-dark", String(darkMode));
    applyTheme();
    notifyListeners();
  }, []);

  return <ThemeContext.Provider value={{ isDark, toggleTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
