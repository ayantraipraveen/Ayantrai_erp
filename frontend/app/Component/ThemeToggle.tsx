"use client";

import React from "react";
import { Sun, Moon, Monitor } from "lucide-react";
import { useTheme } from "./ThemeProvider";
import Tooltip from "./Tooltip";

export interface ThemeToggleProps {
  /** Visual variant: icon-only pill or full button with label */
  variant?: "icon" | "full" | "dropdown";
  /** Optional custom class name */
  className?: string;
}

export default function ThemeToggle({
  variant = "icon",
  className = "",
}: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme, mounted } = useTheme();

  if (!mounted) {
    return (
      <div
        className={`h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-100/80 dark:bg-zinc-900/60 animate-pulse ${className}`}
      />
    );
  }

  const isDark = resolvedTheme === "dark";

  if (variant === "full") {
    return (
      <div className={`flex items-center gap-1 p-1 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-100/90 dark:bg-[#0c1017] ${className}`}>
        <Tooltip content="Light Mode" position="bottom">
          <button
            type="button"
            onClick={() => setTheme("light")}
            aria-label="Activate light mode"
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              theme === "light"
                ? "bg-white text-amber-600 shadow-sm border border-slate-200 font-bold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sun className="w-3.5 h-3.5 text-amber-500" />
            <span>Light</span>
          </button>
        </Tooltip>

        <Tooltip content="Dark Cyber Mode" position="bottom">
          <button
            type="button"
            onClick={() => setTheme("dark")}
            aria-label="Activate dark mode"
            className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer ${
              theme === "dark"
                ? "bg-[#141923] text-[#F6C72F] shadow-[0_0_12px_rgba(246,199,47,0.25)] border border-[#F6C72F]/40 font-bold"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Moon className="w-3.5 h-3.5 text-[#F6C72F]" />
            <span>Dark</span>
          </button>
        </Tooltip>

        <Tooltip content="Match System OS" position="bottom">
          <button
            type="button"
            onClick={() => setTheme("system")}
            aria-label="Match system theme"
            className={`p-1.5 rounded-lg text-xs font-medium flex items-center transition-all cursor-pointer ${
              theme === "system"
                ? "bg-white dark:bg-[#141923] text-sky-500 dark:text-sky-400 border border-slate-200 dark:border-zinc-700"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
          </button>
        </Tooltip>
      </div>
    );
  }

  // Icon-only compact toggle
  return (
    <Tooltip
      content={isDark ? "Switch to Light Mode" : "Switch to Cyber Dark Mode"}
      position="bottom"
    >
      <button
        type="button"
        onClick={toggleTheme}
        aria-label={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        className={`relative h-9 w-9 rounded-xl border transition-all duration-300 flex items-center justify-center cursor-pointer ${
          isDark
            ? "border-zinc-800/90 bg-[#0e1219]/90 text-[#F6C72F] hover:border-[#F6C72F]/60 hover:shadow-[0_0_14px_rgba(246,199,47,0.3)] hover:bg-[#131924]"
            : "border-slate-200 bg-slate-50/80 text-amber-600 hover:border-amber-500/60 hover:shadow-[0_0_12px_rgba(217,119,6,0.25)] hover:bg-slate-100 shadow-sm"
        } ${className}`}
      >
        <div className="relative w-4 h-4 flex items-center justify-center">
          <Sun
            className={`w-4 h-4 text-amber-500 transition-all duration-300 transform absolute ${
              isDark ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
            }`}
          />
          <Moon
            className={`w-4 h-4 text-[#F6C72F] transition-all duration-300 transform absolute ${
              isDark ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-0 opacity-0"
            }`}
          />
        </div>
      </button>
    </Tooltip>
  );
}
