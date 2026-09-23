"use client";

import React from "react";

export interface AuthFooterProps {
  /** Optional custom container maximum width class (default: "max-w-[1680px]") */
  maxWidthClassName?: string;
  /** Optional custom styling for the outer <footer> container */
  className?: string;
  /** Optional override for certification badge text */
  certificationText?: string;
  /** Optional override for location text */
  locationText?: string;
  /** Optional override for support email address */
  supportEmail?: string;
  /** Optional custom copyright year (default: 2026) */
  copyrightYear?: number;
}

/**
 * Reusable Common Footer component for Sitesafe ERP.
 * Provides unified enterprise branding, ISO 45001 & CE certification tags,
 * corporate location, and theme-adaptive contact links across all authentication and portal pages.
 */
export default function AuthFooter({
  maxWidthClassName = "max-w-[1680px]",
  className = "",
  certificationText = "Pursuing ISO 45001 & CE Certifications",
  locationText = "Noida, India",
  supportEmail = "info@ayantrai.com",
  copyrightYear = 2026,
}: AuthFooterProps) {
  return (
    <footer
      className={`relative z-10 w-full border-t border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c1017]/90 flex-shrink-0 transition-colors ${className}`}
    >
      <div
        className={`${maxWidthClassName} mx-auto px-4 sm:px-8 xl:px-14 py-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-zinc-500 gap-1 text-center sm:text-left`}
      >
        <div className="flex flex-wrap items-center justify-center sm:justify-start">
          <span>
            © {copyrightYear} AyantrAI. Sitesafe Connected Industrial Infrastructure.
          </span>
          {certificationText && (
            <>
              <span className="hidden md:inline mx-2 text-slate-300 dark:text-zinc-700">
                |
              </span>
              <span className="hidden md:inline text-slate-600 dark:text-zinc-400">
                {certificationText}
              </span>
            </>
          )}
        </div>
        <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4">
          <span className="font-mono text-slate-500 dark:text-zinc-500">
            {locationText}
          </span>
          <a
            href={`mailto:${supportEmail}`}
            className="text-slate-600 dark:text-zinc-400 hover:text-purple-600 dark:hover:text-[#9D61FF] transition-colors"
          >
            {supportEmail}
          </a>
        </div>
      </div>
    </footer>
  );
}

// Re-export as Footer for universal usage
export { AuthFooter as Footer };
