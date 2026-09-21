import React from "react";

export default function AuthSkeleton({ isSignUp = false }: { isSignUp?: boolean }) {
  return (
    <div className="relative min-h-screen lg:h-screen w-full bg-[#080a0e] text-slate-100 flex flex-col justify-between overflow-y-auto lg:overflow-hidden industrial-grid">
      {/* Ambient background lighting */}
      <div className="ambient-lighting-layer">
        <div className="amber-spotlight opacity-50" />
        <div className="cyan-rim-light opacity-40" />
      </div>

      {/* Header Skeleton */}
      <header className="relative z-10 w-full border-b border-zinc-800/80 bg-[#0c1017]/90 backdrop-blur-md flex-shrink-0">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-32 rounded-lg skeleton-box" />
            <div className="hidden sm:block h-6 w-24 rounded skeleton-box" />
          </div>
          <div className="h-8 w-28 rounded-lg skeleton-box" />
        </div>
      </header>

      {/* Main Grid Skeleton */}
      <main className="relative z-10 flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 flex items-center justify-center py-6 lg:py-2 overflow-visible lg:overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-12 items-center">
          
          {/* Left Column Skeleton (7 cols) */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center space-y-4 lg:space-y-3.5 xl:space-y-4 order-2 lg:order-1">
            {/* Tagline & Headline */}
            <div className="space-y-2.5">
              <div className="h-6 w-56 rounded-md skeleton-box" />
              <div className="h-10 sm:h-12 w-3/4 rounded-xl skeleton-box" />
              <div className="h-4 w-5/6 rounded skeleton-box" />
            </div>

            {/* 3-Device Telemetry Hub Skeleton */}
            <div className="rounded-2xl border border-zinc-800/80 bg-[#0f131c]/85 p-4 sm:p-5 backdrop-blur-xl shadow-2xl space-y-3">
              <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800/80">
                <div className="h-4 w-48 rounded skeleton-box" />
                <div className="h-5 w-28 rounded skeleton-box" />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="rounded-xl border border-zinc-800/90 bg-[#090c12]/90 p-3 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="h-7 w-7 rounded-lg skeleton-box" />
                      <div className="h-4 w-12 rounded skeleton-box" />
                    </div>
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-24 rounded skeleton-box" />
                      <div className="h-3 w-16 rounded skeleton-box" />
                    </div>
                    <div className="pt-2 border-t border-zinc-800/80 flex items-center justify-between">
                      <div className="h-3 w-14 rounded skeleton-box" />
                      <div className="h-3 w-12 rounded skeleton-box" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2.5 border-t border-zinc-800/80 flex items-center justify-between">
                <div className="h-3.5 w-60 rounded skeleton-box" />
                <div className="h-3.5 w-40 rounded skeleton-box" />
              </div>
            </div>

            {/* 4 Metrics Strip Skeleton */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="rounded-xl border border-zinc-800/80 bg-[#0e1219]/80 p-2.5 xl:p-3 space-y-1.5">
                  <div className="h-7 w-20 rounded skeleton-box" />
                  <div className="h-3 w-16 rounded skeleton-box" />
                  <div className="h-2.5 w-12 rounded skeleton-box" />
                </div>
              ))}
            </div>
          </div>

          {/* Right Column Form Skeleton (5 cols) */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end w-full order-1 lg:order-2">
            <div className="w-full max-w-md xl:max-w-lg rounded-2xl border border-[#F6C72F]/20 bg-[#111520]/95 p-5 sm:p-6 xl:p-7 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.65)] space-y-4">
              
              {/* Form Title */}
              <div className="space-y-1.5">
                <div className="h-6 w-36 rounded-lg skeleton-box" />
                <div className="h-3.5 w-64 rounded skeleton-box" />
              </div>

              {!isSignUp ? (
                <>
                  {/* Persona Chips */}
                  <div className="rounded-xl border border-zinc-800/90 bg-[#0a0d13]/80 p-2.5 space-y-2">
                    <div className="h-3 w-32 rounded skeleton-box" />
                    <div className="grid grid-cols-2 gap-1.5">
                      {[1, 2, 3, 4].map((i) => (
                        <div key={i} className="h-8 rounded-lg skeleton-box" />
                      ))}
                    </div>
                  </div>

                  {/* Input Fields */}
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="h-3 w-28 rounded skeleton-box" />
                      <div className="h-9 w-full rounded-xl skeleton-box" />
                    </div>
                    <div className="space-y-1">
                      <div className="h-3 w-24 rounded skeleton-box" />
                      <div className="h-9 w-full rounded-xl skeleton-box" />
                    </div>
                  </div>

                  {/* Remember Me */}
                  <div className="h-4 w-44 rounded skeleton-box" />

                  {/* Submit Button */}
                  <div className="h-10 w-full rounded-xl skeleton-box" />

                  {/* SSO Options */}
                  <div className="space-y-2 pt-1">
                    <div className="h-3 w-28 mx-auto rounded skeleton-box" />
                    <div className="grid grid-cols-3 gap-2">
                      <div className="h-8 rounded-lg skeleton-box" />
                      <div className="h-8 rounded-lg skeleton-box" />
                      <div className="h-8 rounded-lg skeleton-box" />
                    </div>
                  </div>
                </>
              ) : (
                /* Sign Up Form Fields Skeleton */
                <div className="space-y-2.5">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 rounded-xl skeleton-box" />
                    <div className="h-8 rounded-xl skeleton-box" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 rounded-xl skeleton-box" />
                    <div className="h-8 rounded-xl skeleton-box" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 rounded-xl skeleton-box" />
                    <div className="h-8 rounded-xl skeleton-box" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="h-8 rounded-xl skeleton-box" />
                    <div className="h-8 rounded-xl skeleton-box" />
                  </div>
                  <div className="h-4 w-full rounded skeleton-box" />
                  <div className="h-10 w-full rounded-xl skeleton-box" />
                </div>
              )}

              {/* Bottom Link */}
              <div className="pt-2 border-t border-zinc-800/80">
                <div className="h-3 w-48 mx-auto rounded skeleton-box" />
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer Skeleton */}
      <footer className="relative z-10 w-full border-t border-zinc-800/80 bg-[#0c1017]/90 flex-shrink-0">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 py-2 flex items-center justify-between">
          <div className="h-3.5 w-64 rounded skeleton-box" />
          <div className="h-3.5 w-40 rounded skeleton-box" />
        </div>
      </footer>
    </div>
  );
}
