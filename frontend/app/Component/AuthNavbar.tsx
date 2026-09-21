"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";

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
 * Renders high-fidelity AyantrAI branding, dynamic ERP mode label, and responsive action toggles.
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
    <header className="sticky top-0 z-30 w-full border-b border-zinc-800/80 bg-[#0c1017]/95 backdrop-blur-md flex-shrink-0">
      <div className="max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 py-2.5 flex items-center justify-between">
        {/* Left: AyantrAI Logo & Sitesafe ERP Subtitle */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link href={resolvedLogoHref} className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative h-7 sm:h-8 md:h-9 w-28 sm:w-32 md:w-36 flex items-center">
              <Image
                src="/logo.png"
                alt="AyantrAI Sitesafe"
                width={150}
                height={42}
                className="object-contain filter brightness-110 drop-shadow-[0_0_16px_rgba(246,199,47,0.3)] transition-all group-hover:drop-shadow-[0_0_22px_rgba(246,199,47,0.5)]"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col border-l border-zinc-700/80 pl-2.5 sm:pl-3">
              <span className="text-[10px] tracking-widest text-[#F6C72F] font-mono uppercase font-bold drop-shadow-[0_0_8px_rgba(246,199,47,0.4)]">
                Sitesafe ERP
              </span>
              <span className="text-[11px] text-zinc-400 font-medium hidden md:inline">
                {resolvedSubtitle}
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Mode Switcher Action Link */}
        <div className="flex items-center gap-2 sm:gap-3">
          {resolvedActionPrompt && (
            <span className="hidden md:inline text-xs text-zinc-400">
              {resolvedActionPrompt}
            </span>
          )}
          <Link
            href={resolvedActionHref}
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 hover:text-white hover:border-[#F6C72F]/60 hover:shadow-[0_0_15px_rgba(246,199,47,0.2)] transition-all"
          >
            {resolvedActionText}
          </Link>
        </div>
      </div>
    </header>
  );
}
