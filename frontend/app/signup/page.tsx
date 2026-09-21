"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthSkeleton from "../Component/AuthSkeleton";
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
  Radio,
  Clock,
  FileCheck2,
  Cpu,
  Boxes,
  CheckCircle,
} from "lucide-react";

export default function SignUpPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const [mounted, setMounted] = useState(false);
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

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <AuthSkeleton isSignUp={true} />;
  }

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

      dispatch(
        registerSuccess({
          user: newProfile,
          token: "jwt_sitesafe_" + Math.random().toString(36).substring(2),
        })
      );

      setFeedback(
        `Workspace provisioned for ${company}! Redux profile created. You can now access your portal.`
      );
    }, 1000);
  };

  return (
    <div className="relative min-h-screen lg:h-screen w-full bg-[#080a0e] text-slate-100 flex flex-col justify-between overflow-y-auto lg:overflow-hidden industrial-grid">
      
      {/* Dynamic Ambient Lighting Orbs */}
      <div className="ambient-lighting-layer">
        <div className="amber-spotlight" />
        <div className="cyan-rim-light" />
      </div>

      {/* Top Header - Consistent Across App */}
      <header className="relative z-10 w-full border-b border-zinc-800/80 bg-[#0c1017]/90 backdrop-blur-md flex-shrink-0">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/signup" className="flex items-center gap-2.5 sm:gap-3 group">
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
                <span className="text-[11px] text-zinc-400 font-medium hidden md:inline">Enterprise Onboarding</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline text-xs text-zinc-400">Already registered?</span>
            <Link
              href="/signin"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 hover:text-white hover:border-[#F6C72F]/60 hover:shadow-[0_0_15px_rgba(246,199,47,0.2)] transition-all"
            >
              Sign In to Portal
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 flex items-center justify-center py-6 lg:py-2 overflow-visible lg:overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-12 items-center">
          
          {/* ================= LEFT COLUMN: Architecture & Pilot Program (7 Cols) ================= */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center space-y-4 lg:space-y-3.5 xl:space-y-4 order-2 lg:order-1">
            
            {/* Headline */}
            <div className="space-y-1.5 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#F6C72F]/40 bg-[#F6C72F]/10 text-[#F6C72F] text-[11px] font-mono tracking-wide uppercase shadow-[0_0_15px_rgba(246,199,47,0.15)]">
                <Sparkles className="w-3 h-3 text-[#F6C72F] animate-pulse" />
                Pilot Site Onboarding — Launching Feb 2027
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Register Your Site for{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6C72F] via-[#FFD027] to-amber-200 drop-shadow-[0_0_20px_rgba(246,199,47,0.35)]">
                  Sitesafe ERP.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Equip your industrial crews with connected PPE chipsets. Seamlessly track workforce presence, real-time safety compliance,
                and zone telemetrics.
              </p>
            </div>

            {/* Benefits Cards - Consistent Glassmorphism and Shimmer with Sign In */}
            <div className="rounded-2xl border border-zinc-800/90 bg-[#0f131c]/85 p-4 sm:p-5 backdrop-blur-xl neon-glow-card relative overflow-hidden group space-y-3">
              <div className="absolute top-0 left-0 right-0 shimmer-line opacity-75" />
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#F6C72F]/8 rounded-bl-full pointer-events-none filter blur-xl" />

              <div className="flex flex-wrap items-center justify-between pb-2.5 mb-1 border-b border-zinc-800/80 gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#F6C72F] beacon-active" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                    Enterprise Pilot Program Inclusions
                  </span>
                </div>
                <span className="text-[10px] font-mono text-amber-400 bg-amber-950/70 border border-amber-500/40 px-2.5 py-0.5 rounded font-semibold badge-glow-amber">
                  EARLY ACCESS OPEN
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-800/90 bg-[#090c12]/90 hover:border-zinc-700 transition-all">
                  <div className="h-7 w-7 rounded-lg bg-[#F6C72F]/15 border border-[#F6C72F]/40 flex items-center justify-center flex-shrink-0 text-[#F6C72F] mt-0.5 shadow-[0_0_10px_rgba(246,199,47,0.2)]">
                    <Boxes className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Priority Hardware Allocation</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                      Pre-paired smart PPE kits (Helmet, Vest Hub, Boot chipsets) dispatched first.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-800/90 bg-[#090c12]/90 hover:border-zinc-700 transition-all">
                  <div className="h-7 w-7 rounded-lg bg-[#F6C72F]/15 border border-[#F6C72F]/40 flex items-center justify-center flex-shrink-0 text-[#F6C72F] mt-0.5 shadow-[0_0_10px_rgba(246,199,47,0.2)]">
                    <FileCheck2 className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">ISO 45001 Compliance Logs</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                      Continuous digital logs satisfying EHS audits and regulatory inspections automatically.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-800/90 bg-[#090c12]/90 hover:border-zinc-700 transition-all">
                  <div className="h-7 w-7 rounded-lg bg-[#F6C72F]/15 border border-[#F6C72F]/40 flex items-center justify-center flex-shrink-0 text-[#F6C72F] mt-0.5 shadow-[0_0_10px_rgba(246,199,47,0.2)]">
                    <Cpu className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Zero Equipment Replacement</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                      Non-invasive clip and strap modules attaching directly onto existing crew PPE.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl border border-zinc-800/90 bg-[#090c12]/90 hover:border-zinc-700 transition-all">
                  <div className="h-7 w-7 rounded-lg bg-[#F6C72F]/15 border border-[#F6C72F]/40 flex items-center justify-center flex-shrink-0 text-[#F6C72F] mt-0.5 shadow-[0_0_10px_rgba(246,199,47,0.2)]">
                    <Clock className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-zinc-100">Free Integrated Attendance</h4>
                    <p className="text-[10px] text-zinc-400 mt-0.5 leading-relaxed">
                      Presence and shift duration stream automatically with telemetry readings.
                    </p>
                  </div>
                </div>
              </div>

              {/* Status Bar */}
              <div className="pt-2 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <Sparkles className="w-3 h-3 text-[#F6C72F]" />
                  <span className="text-zinc-300">Founding-site terms available during pilot onboarding</span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-emerald-400">● Live Prototype Tested</span>
                </div>
              </div>
            </div>

            {/* Industrial Metric Highlights - 4 Consistent Cards Matching Sign In */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              <div className="rounded-xl border border-zinc-800/80 bg-[#0e1219]/80 p-2.5 xl:p-3 hover:border-amber-500/40 hover:shadow-[0_0_18px_rgba(246,199,47,0.12)] transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-[#F6C72F] drop-shadow-[0_0_10px_rgba(246,199,47,0.35)]">100%</div>
                <div className="text-[11px] text-zinc-300 font-medium">Standard PPE</div>
                <div className="text-[9px] text-emerald-400 font-mono">Zero gear replacement</div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-[#0e1219]/80 p-2.5 xl:p-3 hover:border-zinc-700 transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-white">1,480+</div>
                <div className="text-[11px] text-zinc-300 font-medium">Active Kits</div>
                <div className="text-[9px] text-zinc-500 font-mono">6 site deployments</div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-[#0e1219]/80 p-2.5 xl:p-3 hover:border-emerald-500/40 hover:shadow-[0_0_18px_rgba(16,185,129,0.12)] transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]">ISO 45001</div>
                <div className="text-[11px] text-zinc-300 font-medium">Audit Ready</div>
                <div className="text-[9px] text-emerald-400 font-mono">CE applied & in progress</div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-[#0e1219]/80 p-2.5 xl:p-3 hover:border-sky-500/40 hover:shadow-[0_0_18px_rgba(6,182,212,0.12)] transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-sky-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.35)]">Feb 2027</div>
                <div className="text-[11px] text-zinc-300 font-medium">Pilot Launch</div>
                <div className="text-[9px] text-sky-400 font-mono">Founding terms active</div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Registration Form Card (100% Consistent with Sign In) ================= */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end w-full order-1 lg:order-2">
            <div className="w-full max-w-md xl:max-w-lg rounded-2xl border border-[#F6C72F]/35 bg-[#111520]/95 p-5 sm:p-6 xl:p-7 backdrop-blur-2xl neon-glow-amber-lg relative overflow-hidden">
              
              {/* Shimmering Animated Top Line */}
              <div className="absolute top-0 left-0 right-0 shimmer-line" />

              <div className="mb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Register Your Site</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F6C72F] animate-pulse" />
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Configure your enterprise details to set up your Sitesafe telemetry account.
                </p>
              </div>

              {/* Feedback toast */}
              {feedback && (
                <div className="mb-2.5 rounded-lg border border-[#F6C72F]/40 bg-[#F6C72F]/10 p-2.5 text-xs text-[#F6C72F] flex items-center gap-2 animate-fadeIn badge-glow-amber">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              {/* Sign Up Form */}
              <form onSubmit={handleRegister} className="space-y-2.5 sm:space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-300">Full Name</label>
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
                        className="w-full rounded-xl border border-zinc-800/90 bg-[#080b10] pl-9 pr-3 py-2 text-sm sm:text-xs text-white placeholder-zinc-500 transition-all focus-glow-amber"
                      />
                    </div>
                  </div>

                  {/* Email */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-300">Work Email</label>
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
                        className="w-full rounded-xl border border-zinc-800/90 bg-[#080b10] pl-9 pr-3 py-2 text-sm sm:text-xs text-white placeholder-zinc-500 transition-all focus-glow-amber"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Company Name */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-300">Company / Entity</label>
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
                        className="w-full rounded-xl border border-zinc-800/90 bg-[#080b10] pl-9 pr-3 py-2 text-sm sm:text-xs text-white placeholder-zinc-500 transition-all focus-glow-amber"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-300">Industry Sector</label>
                    <select
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800/90 bg-[#080b10] px-3 py-2 text-sm sm:text-xs text-white transition-all focus-glow-amber"
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Primary Role */}
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-300">Your Primary Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800/90 bg-[#080b10] px-3 py-2 text-sm sm:text-xs text-white transition-all focus-glow-amber"
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
                    <label className="text-[11px] font-medium text-zinc-300">Target Fleet Size</label>
                    <select
                      value={fleetSize}
                      onChange={(e) => setFleetSize(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800/90 bg-[#080b10] px-3 py-2 text-sm sm:text-xs text-white transition-all focus-glow-amber"
                    >
                      <option>Pilot Trial (10-50 kits)</option>
                      <option>Standard Site (50-250 kits)</option>
                      <option>Large Project (250-1,000 kits)</option>
                      <option>Enterprise (1,000+ kits)</option>
                    </select>
                  </div>
                </div>

                {/* Passwords */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-300">Security Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-zinc-800/90 bg-[#080b10] px-3 py-2 text-sm sm:text-xs text-white placeholder-zinc-500 transition-all focus-glow-amber"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] font-medium text-zinc-300">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-zinc-800/90 bg-[#080b10] px-3 py-2 text-sm sm:text-xs text-white placeholder-zinc-500 transition-all focus-glow-amber"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-0.5">
                    <div className="flex items-center justify-between text-[10px] text-zinc-400">
                      <span>Password Strength:</span>
                      <span className="font-semibold text-zinc-200">{strengthLabels[strengthScore]}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1 h-1 w-full">
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
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-[#F6C72F] accent-[#F6C72F] focus:ring-0"
                    />
                    <span className="text-[11px] text-zinc-400">
                      I agree to the Sitesafe Telemetry Policy & EHS audit terms
                    </span>
                  </label>
                </div>

                {/* Submit Glowing Button */}
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-xl py-2.5 px-4 text-xs font-bold text-zinc-950 glow-btn-amber flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {submitting ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Creating Redux Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Provision Enterprise Account</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

              {/* Bottom Link to Sign In */}
              <div className="mt-3.5 pt-3 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
                Already have an active account?{" "}
                <Link href="/signin" className="font-semibold text-[#F6C72F] hover:underline">
                  Sign in to portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-zinc-800/80 bg-[#0c1017]/90 flex-shrink-0">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 py-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-1 text-center sm:text-left">
          <div>
            <span>© 2026 AyantrAI. Sitesafe Connected Industrial Infrastructure.</span>
            <span className="hidden md:inline mx-2 text-zinc-700">|</span>
            <span className="hidden md:inline text-zinc-400">Pursuing ISO 45001 & CE Certifications</span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <span className="font-mono text-zinc-500">Kanpur & Greater Noida</span>
            <a href="mailto:info@ayantrai.com" className="text-zinc-400 hover:text-[#F6C72F] transition-colors">
              info@ayantrai.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
