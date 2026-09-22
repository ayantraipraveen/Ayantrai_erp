"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

export type Theme = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  resolvedTheme: ResolvedTheme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
  mounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = "ayantrai_theme";

export function ThemeProvider({
  children,
  defaultTheme = "dark",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  const [theme, setThemeState] = useState<Theme>(defaultTheme);
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("dark");
  const [mounted, setMounted] = useState(false);

  // Initialize theme from localStorage or system preference
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (savedTheme && (savedTheme === "light" || savedTheme === "dark" || savedTheme === "system")) {
        setThemeState(savedTheme);
      } else {
        setThemeState(defaultTheme);
      }
    } catch {
      setThemeState(defaultTheme);
    }
    setMounted(true);
  }, [defaultTheme]);

  // Update resolvedTheme and document classList whenever theme changes
  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const resolve = (currentTheme: Theme): ResolvedTheme => {
      if (currentTheme === "system") {
        return mediaQuery.matches ? "dark" : "light";
      }
      return currentTheme;
    };

    const currentResolved = resolve(theme);
    setResolvedTheme(currentResolved);

    // Apply or remove .dark class and data-theme attribute on <html>
    if (currentResolved === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
      root.setAttribute("data-theme", "dark");
      root.style.colorScheme = "dark";
    } else {
      root.classList.remove("dark");
      root.classList.add("light");
      root.setAttribute("data-theme", "light");
      root.style.colorScheme = "light";
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Ignore storage errors (e.g. incognito restrictions)
    }

    // Listener for OS system theme change
    const handleSystemChange = () => {
      if (theme === "system") {
        const sysResolved = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(sysResolved);
        if (sysResolved === "dark") {
          root.classList.add("dark");
          root.classList.remove("light");
          root.setAttribute("data-theme", "dark");
          root.style.colorScheme = "dark";
        } else {
          root.classList.remove("dark");
          root.classList.add("light");
          root.setAttribute("data-theme", "light");
          root.style.colorScheme = "light";
        }
      }
    };

    mediaQuery.addEventListener("change", handleSystemChange);
    return () => mediaQuery.removeEventListener("change", handleSystemChange);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const toggleTheme = () => {
    setThemeState((prev) => {
      const next = (resolvedTheme === "dark" ? "light" : "dark");
      return next;
    });
  };

  return (
    <ThemeContext.Provider
      value={{
        theme,
        resolvedTheme,
        setTheme,
        toggleTheme,
        mounted,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
