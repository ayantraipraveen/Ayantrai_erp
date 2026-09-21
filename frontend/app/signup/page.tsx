"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { registerSuccess } from "@/lib/redux/slices/authSlice";
import {
  ShieldCheck,
  Building2,
  Lock,
  Mail,
  User,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Layers,
  Award,
  Calendar,
  Check,
} from "lucide-react";

export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [industry, setIndustry] = useState("Construction & Civil");
  const [role, setRole] = useState("Safety Head / EHS Manager");
  const [fleetSize, setFleetSize] = useState("50-250 kits");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;
    return score;
  };

  const strengthScore = getPasswordStrength(password);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Enterprise Grade"];
  const strengthColors = ["bg-zinc-700", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please accept the Sitesafe Telemetry Data Handling Policy to proceed.");
      return;
    }
    if (password !== confirmPassword) {
      alert("Passwords do not match. Please re-check.");
      return;
    }

    setSubmitting(true);
    setFeedback(null);

    setTimeout(() => {
      setSubmitting(false);
      const newProfile = {
        id: `usr_${Date.now()}`,
        name,
        email,
        company,
        industry,
        role,
        fleetSize,
      };

      // Dispatch to Redux store
      dispatch(
        registerSuccess({
          user: newProfile,
          token: "jwt_sitesafe_" + Math.random().toString(36).substring(2),
        })
      );

      setFeedback(
        `Workspace provisioned for ${company}! Redux profile created. You can now access your portal.`
      );
    }, 1200);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0d12] text-slate-100 flex flex-col justify-between industrial-grid">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 amber-glow-radial z-0" />

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-zinc-800/80 bg-[#0d1117]/85 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/signup" className="flex items-center gap-3">
            <div className="relative h-10 w-32 md:w-36 flex items-center">
              <Image
                src="/logo.png"
                alt="AyantrAI Sitesafe"
                width={160}
                height={48}
                className="object-contain filter brightness-110 drop-shadow-[0_0_12px_rgba(246,199,47,0.15)]"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col border-l border-zinc-700 pl-3">
              <span className="text-[10px] tracking-widest text-[#F6C72F] font-mono uppercase font-semibold">
                Sitesafe ERP
              </span>
              <span className="text-xs text-zinc-400 font-medium">Enterprise Onboarding</span>
            </div>
          </Link>
        </div>

        {/* Link to Sign In */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-zinc-400">Already registered?</span>
          <Link
            href="/signin"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#F6C72F] text-zinc-950 hover:bg-[#FFD338] shadow-[0_0_15px_rgba(246,199,47,0.3)] transition-all font-bold"
          >
            Sign In to Portal
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Left Side: Onboarding & Value Proposition */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#F6C72F]/30 bg-[#F6C72F]/10 text-[#F6C72F] text-xs font-mono tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Pilot Site Onboarding — Launching Feb 2027
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Register Your Site for{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6C72F] via-[#FFD027] to-amber-200">
                Sitesafe ERP.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              Equip your crews with connected PPE chipsets. Seamlessly track workforce presence, real-time safety compliance,
              and zone telemetrics.
            </p>
          </div>

          {/* Onboarding Benefits Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-5 backdrop-blur-xl shadow-2xl space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-zinc-800">
              <Layers className="w-4 h-4 text-[#F6C72F]" />
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                Enterprise Pilot Benefits
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#F6C72F]/15 border border-[#F6C72F]/30 flex items-center justify-center flex-shrink-0 text-[#F6C72F] mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Priority Hardware Provisioning</h4>
                  <p className="text-[11px] text-zinc-400">
                    Get pre-configured smart PPE kits (Helmet, Vest Hub, Boot chipsets) dispatched first.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#F6C72F]/15 border border-[#F6C72F]/30 flex items-center justify-center flex-shrink-0 text-[#F6C72F] mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Continuous ISO 45001 Compliance Logs</h4>
                  <p className="text-[11px] text-zinc-400">
                    Replace manual spot-checks with timestamped audit-ready telemetry records.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-[#F6C72F]/15 border border-[#F6C72F]/30 flex items-center justify-center flex-shrink-0 text-[#F6C72F] mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h4 className="text-xs font-semibold text-white">Zero Equipment Replacement</h4>
                  <p className="text-[11px] text-zinc-400">
                    Chipsets strap securely to the standard PPE your team already wears.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Info Grid */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3 flex items-center gap-3">
              <Award className="w-5 h-5 text-[#F6C72F]" />
              <div>
                <div className="text-xs font-semibold text-zinc-200">ISO 45001 & CE</div>
                <div className="text-[10px] text-zinc-400">Applied & In Progress</div>
              </div>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3 flex items-center gap-3">
              <Calendar className="w-5 h-5 text-emerald-400" />
              <div>
                <div className="text-xs font-semibold text-zinc-200">Pilot Launch</div>
                <div className="text-[10px] text-zinc-400">February 2027</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Dedicated Sign Up Form Card */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-[#12161f]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative">
            <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#F6C72F] to-transparent rounded-full opacity-80" />

            <div className="mb-5">
              <h2 className="text-2xl font-bold text-white tracking-tight">Register Your Site</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Configure your company details to set up your Sitesafe telemetry account.
              </p>
            </div>

            {/* Feedback notification */}
            {feedback && (
              <div className="mb-4 rounded-lg border border-[#F6C72F]/40 bg-[#F6C72F]/10 p-3 text-xs text-[#F6C72F] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleRegister} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Full Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Full Name</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                      <User className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Vikram Seth"
                      className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Work Email</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="vikram@company.com"
                      className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Company Name */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Company / Entity</label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      required
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="L&T Heavy Infra"
                      className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                    />
                  </div>
                </div>

                {/* Industry */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Industry Sector</label>
                  <select
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] px-3 py-2 text-xs text-white focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                  >
                    <option>Construction & Civil</option>
                    <option>Infrastructure & Metro</option>
                    <option>Manufacturing & Heavy Eng</option>
                    <option>Oil & Gas / Refinery</option>
                    <option>Mining & Tunneling</option>
                    <option>Warehousing & Logistics</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Primary Role */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Your Primary Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] px-3 py-2 text-xs text-white focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                  >
                    <option>Safety Head / EHS Manager</option>
                    <option>Project & Site Head</option>
                    <option>Field Supervisor</option>
                    <option>Procurement & Operations</option>
                    <option>Auditor / Executive</option>
                  </select>
                </div>

                {/* Planned Fleet */}
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Target Fleet Size</label>
                  <select
                    value={fleetSize}
                    onChange={(e) => setFleetSize(e.target.value)}
                    className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] px-3 py-2 text-xs text-white focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                  >
                    <option>Pilot Trial (10-50 kits)</option>
                    <option>Standard Site (50-250 kits)</option>
                    <option>Large Project (250-1,000 kits)</option>
                    <option>Enterprise (1,000+ kits)</option>
                  </select>
                </div>
              </div>

              {/* Passwords */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Security Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-zinc-300">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                    />
                  </div>
                </div>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Password Strength:</span>
                    <span className="font-medium text-zinc-300">{strengthLabels[strengthScore]}</span>
                  </div>
                  <div className="grid grid-cols-4 gap-1 h-1.5 w-full">
                    {[1, 2, 3, 4].map((step) => (
                      <div
                        key={step}
                        className={`rounded-full h-full ${
                          strengthScore >= step ? strengthColors[strengthScore] : "bg-zinc-800"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Consent Checkbox */}
              <label className="flex items-start gap-2.5 pt-1 text-xs text-zinc-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-[#F6C72F] accent-[#F6C72F]"
                />
                <span className="text-[11px] leading-snug">
                  I agree to the Sitesafe Telemetry Data Handling Policy & ISO 45001 EHS audit terms.
                </span>
              </label>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-xl bg-[#F6C72F] py-3 px-4 text-xs sm:text-sm font-bold text-zinc-950 transition-all hover:bg-[#FFD338] hover:shadow-[0_0_20px_rgba(246,199,47,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Creating Redux Account...</span>
                  </>
                ) : (
                  <>
                    <span>Provision Enterprise Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Link to Sign In */}
            <div className="mt-5 pt-4 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
              Already have an active account?{" "}
              <Link href="/signin" className="font-semibold text-[#F6C72F] hover:underline">
                Sign in to portal
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-zinc-800/60 bg-[#0d1117]/80 px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
        <div>
          <span>© 2026 AyantrAI. Sitesafe Connected Industrial Infrastructure.</span>
          <span className="hidden md:inline mx-2 text-zinc-700">|</span>
          <span className="hidden md:inline text-zinc-400">Pursuing ISO 45001 & CE Certifications</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-zinc-500">Kanpur & Greater Noida, India</span>
          <a href="mailto:info@ayantrai.com" className="text-zinc-400 hover:text-[#F6C72F] transition-colors">
            info@ayantrai.com
          </a>
        </div>
      </footer>
    </div>
  );
}
