"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import Tooltip from "./Tooltip";
import ThemeToggle from "./ThemeToggle";

export interface AuthNavbarProps {
  /**
   * Preset mode for authentication pages:
   * - 'signin': Defaults toggle button to '/signup' ("Register Site")
   * - 'signup': Defaults toggle button to '/signin' ("Sign In to Portal")
   */
  mode?: "signin" | "signup";
  /** Optional custom subtitle (e.g., "Connected Site Portal", "Enterprise Onboarding") */
  subtitle?: string;
  /** Optional custom prompt text displayed before the action button on md+ screens */
  actionPrompt?: string;
  /** Optional custom action button text */
  actionText?: string;
  /** Optional custom destination href for the action button */
  actionHref?: string;
  /** Optional custom destination href for the logo link */
  logoHref?: string;
}

/**
 * Reusable AuthNavbar component for Sitesafe ERP authentication flows.
 * Renders high-fidelity AyantrAI branding, dynamic ERP mode label, ThemeToggle, and responsive action toggles with industrial tooltips.
 */
export default function AuthNavbar({
  mode = "signin",
  subtitle,
  actionPrompt,
  actionText,
  actionHref,
  logoHref,
}: AuthNavbarProps) {
  const isSignIn = mode === "signin";

  const resolvedSubtitle =
    subtitle ?? (isSignIn ? "Connected Site Portal" : "Enterprise Onboarding");
  const resolvedActionPrompt =
    actionPrompt ?? (isSignIn ? "Need a new site account?" : "Already registered?");
  const resolvedActionText =
    actionText ?? (isSignIn ? "Register Site" : "Sign In to Portal");
  const resolvedActionHref =
    actionHref ?? (isSignIn ? "/signup" : "/signin");
  const resolvedLogoHref =
    logoHref ?? (isSignIn ? "/signin" : "/signup");

  return (
    <header className="sticky top-0 z-30 w-full border-b border-slate-200/90 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md flex-shrink-0 transition-colors">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 py-2.5 flex items-center justify-between">
        {/* Left: AyantrAI Logo & Sitesafe ERP Subtitle with Tooltip */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href={resolvedLogoHref} className="flex items-center gap-2.5 sm:gap-3 group">
            {/* Logo image - proportional height, auto width */}
            <Tooltip content="AyantrAI • Connected Industrial Intelligence" position="bottom">
              <div className="grid grid-cols-1 grid-rows-1 flex-shrink-0 h-10 w-auto">
                <Image
                  src="/logo-light.png"
                  alt="AyantrAI"
                  width={90}
                  height={40}
                  className="col-start-1 row-start-1 h-10 w-auto object-contain logo-light-mode select-none"
                  priority
                />
                <Image
                  src="/icon.png"
                  alt="AyantrAI"
                  width={90}
                  height={40}
                  className="col-start-1 row-start-1 h-10 w-auto object-contain logo-dark-mode drop-shadow-[0_0_10px_rgba(157,97,255,0.5)] group-hover:drop-shadow-[0_0_16px_rgba(157,97,255,0.7)] transition-all select-none"
                  priority
                />
              </div>
            </Tooltip>
            {/* Brand name + subtitle */}
            <div className="flex flex-col">
              <span className="text-[14px] sm:text-[15px] font-bold text-slate-900 dark:text-white leading-tight tracking-tight">
                AyantrAI
              </span>
              <Tooltip content="Sitesafe Industrial Safety Cloud v2.4" position="bottom" variant="amber">
                <span className="text-[9px] sm:text-[10px] tracking-widest text-[#9D61FF] font-mono uppercase font-bold drop-shadow-[0_0_8px_rgba(157,97,255,0.4)] cursor-help leading-tight">
                  Sitesafe ERP
                </span>
              </Tooltip>
            </div>
          </Link>
        </div>

        {/* Right: Theme Toggle & Mode Switcher Action Link with Tooltip */}
        <div className="flex items-center gap-2 sm:gap-3">
          <ThemeToggle />

          {resolvedActionPrompt && (
            <span className="hidden md:inline text-xs text-slate-500 dark:text-zinc-400">
              {resolvedActionPrompt}
            </span>
          )}
          <Tooltip
            content={isSignIn ? "Onboard a new project or pilot site" : "Access existing telemetry dashboard"}
            position="bottom"
          >
            <Link
              href={resolvedActionHref}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-zinc-800/90 border border-slate-300 dark:border-zinc-700/80 text-slate-700 dark:text-zinc-200 hover:text-purple-600 dark:hover:text-[#9D61FF] hover:border-[#9D61FF]/60 hover:shadow-[0_0_15px_rgba(157,97,255,0.2)] transition-all cursor-pointer"
            >
              {resolvedActionText}
            </Link>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
