"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShieldCheck,
  Radio,
  HardHat,
  Footprints,
  Activity,
  Lock,
  Mail,
  User,
  Building2,
  Briefcase,
  Layers,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Sparkles,
  Wifi,
  BatteryCharging,
  Cpu,
  Fingerprint
} from "lucide-react";

interface AuthPortalProps {
  initialMode?: "signin" | "signup";
}

export default function AuthPortal({ initialMode = "signin" }: AuthPortalProps) {
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<string | null>(null);

  // Sign In Form state
  const [signInEmail, setSignInEmail] = useState("");
  const [signInPassword, setSignInPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  // Sign Up Form state
  const [signUpName, setSignUpName] = useState("");
  const [signUpEmail, setSignUpEmail] = useState("");
  const [signUpCompany, setSignUpCompany] = useState("");
  const [signUpIndustry, setSignUpIndustry] = useState("Construction");
  const [signUpRole, setSignUpRole] = useState("Safety Head / EHS Manager");
  const [signUpFleetSize, setSignUpFleetSize] = useState("50-250 kits");
  const [signUpPassword, setSignUpPassword] = useState("");
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);

  // Quick Demo Roles for easy pairing & review
  const demoPersonas = [
    {
      role: "Safety Head / EHS",
      email: "ehs.director@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      desc: "Full audit access, violation escalation, live matrix",
      icon: ShieldCheck,
    },
    {
      role: "Site Manager",
      email: "site.manager@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      desc: "Zone oversight, workforce roster, GPS locator",
      icon: Building2,
    },
    {
      role: "Field Supervisor",
      email: "supervisor.zone4@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      desc: "Instant worker triage, BLE kit alerts",
      icon: Activity,
    },
    {
      role: "Device Admin",
      email: "fleet.admin@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      desc: "Chipset inventory, battery & kit pairing",
      icon: Cpu,
    },
  ];

  const handleApplyPersona = (persona: typeof demoPersonas[0]) => {
    setActivePersona(persona.role);
    setSignInEmail(persona.email);
    setSignInPassword(persona.pass);
    setSuccessMsg(`Loaded credentials for ${persona.role}`);
    setTimeout(() => setSuccessMsg(null), 3500);
  };

  const handleSignInSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccessMsg(null);

    // Simulate enterprise auth handshake
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg("Authentication verified. Loading Sitesafe telemetry workspace...");
    }, 1200);
  };

  const handleSignUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreeTerms) {
      alert("Please accept the Sitesafe Telemetry Data and Privacy Policy to register.");
      return;
    }
    if (signUpPassword !== signUpConfirmPassword) {
      alert("Passwords do not match. Please verify.");
      return;
    }

    setIsLoading(true);
    setSuccessMsg(null);

    // Simulate registration
    setTimeout(() => {
      setIsLoading(false);
      setSuccessMsg("Organization workspace provisioned! You can now sign in with your enterprise credentials.");
      setMode("signin");
    }, 1400);
  };

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

  const strengthScore = getPasswordStrength(signUpPassword);
  const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Enterprise Grade"];
  const strengthColors = ["bg-zinc-700", "bg-red-500", "bg-amber-500", "bg-blue-500", "bg-emerald-500"];

  return (
    <div className="relative min-h-screen w-full bg-[#0a0d12] text-slate-100 flex flex-col justify-between industrial-grid">
      {/* Radial ambient glow */}
      <div className="pointer-events-none absolute inset-0 amber-glow-radial z-0" />

      {/* Top Bar / Branding */}
      <header className="relative z-10 w-full border-b border-zinc-800/80 bg-[#0d1117]/85 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 group">
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
              <span className="text-xs text-zinc-400 font-medium">Enterprise Portal</span>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setMode("signin")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === "signin"
                ? "bg-[#F6C72F] text-zinc-950 shadow-[0_0_15px_rgba(246,199,47,0.35)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode("signup")}
            className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
              mode === "signup"
                ? "bg-[#F6C72F] text-zinc-950 shadow-[0_0_15px_rgba(246,199,47,0.35)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60"
            }`}
          >
            Register Site
          </button>
        </div>
      </header>

      {/* Main Split Section */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Left Side: AyantrAI Smart PPE Industrial Showcase */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#F6C72F]/30 bg-[#F6C72F]/10 text-[#F6C72F] text-xs font-mono tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Connected Industrial Safety Infrastructure
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Every helmet, vest and boot on site —{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6C72F] via-[#FFD027] to-amber-200">
                reporting in real time.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              Sitesafe connects standard PPE into unified telemetry. Three body chipsets report continuous compliance,
              presence, and on-demand GPS directly to your central ERP portal.
            </p>
          </div>

          {/* Live 3-Chipset Telemetry Demonstration Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-28 w-28 bg-[#F6C72F]/5 rounded-bl-full pointer-events-none" />
            
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-[#F6C72F] animate-pulse" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Live PPE Telemetry Hub (Sample Kit: AY-9024)
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                100% COMPLIANT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Chipset 1: Helmet */}
              <div className="rounded-xl border border-zinc-800 bg-[#0d1017]/80 p-3 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F6C72F]">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    WORN
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-zinc-300">Device 01: Helmet</div>
                  <div className="text-[10px] text-zinc-500 font-mono">BLE Link → Vest</div>
                  <div className="mt-2 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>Battery</span>
                    <span className="text-zinc-200">98%</span>
                  </div>
                </div>
              </div>

              {/* Chipset 2: Vest Hub */}
              <div className="rounded-xl border border-[#F6C72F]/30 bg-[#0d1017]/90 p-3 flex flex-col justify-between shadow-[0_0_15px_rgba(246,199,47,0.06)]">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-[#F6C72F]/15 border border-[#F6C72F]/40 flex items-center justify-center text-[#F6C72F]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-amber-300 flex items-center gap-1">
                    <Wifi className="w-3 h-3 text-[#F6C72F]" />
                    HUB
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-white">Device 02: Vest Hub</div>
                  <div className="text-[10px] text-[#F6C72F] font-mono">IoT Uplink + GPS</div>
                  <div className="mt-2 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>Signal</span>
                    <span className="text-emerald-400">-58 dBm</span>
                  </div>
                </div>
              </div>

              {/* Chipset 3: Boots */}
              <div className="rounded-xl border border-zinc-800 bg-[#0d1017]/80 p-3 flex flex-col justify-between hover:border-zinc-700 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F6C72F]">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    GROUNDED
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-zinc-300">Device 03: Boot</div>
                  <div className="text-[10px] text-zinc-500 font-mono">BLE Link → Vest</div>
                  <div className="mt-2 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>Battery</span>
                    <span className="text-zinc-200">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Industrial Metric Highlights */}
          <div className="grid grid-cols-3 gap-3 pt-2">
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3">
              <div className="text-2xl font-bold font-mono text-[#F6C72F]">99.4%</div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Shift Compliance</div>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3">
              <div className="text-2xl font-bold font-mono text-white">1,480+</div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Active Kits Live</div>
            </div>
            <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-3">
              <div className="text-2xl font-bold font-mono text-emerald-400">0</div>
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Critical Violations</div>
            </div>
          </div>

          <div className="text-xs text-zinc-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-zinc-400" />
            <span>Built for Construction, Manufacturing, Energy & Industrial Infrastructure</span>
          </div>
        </div>

        {/* Right Side: Tabbed Sign In / Sign Up Form Card */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-[#12161f]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative">
            {/* Top gold bar accent */}
            <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#F6C72F] to-transparent rounded-full opacity-80" />

            {/* Mode Switcher Tabs */}
            <div className="flex rounded-xl bg-zinc-900/90 p-1 border border-zinc-800 mb-6">
              <button
                type="button"
                onClick={() => setMode("signin")}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  mode === "signin"
                    ? "bg-[#F6C72F] text-zinc-950 shadow-md font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Lock className="w-3.5 h-3.5" />
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setMode("signup")}
                className={`flex-1 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  mode === "signup"
                    ? "bg-[#F6C72F] text-zinc-950 shadow-md font-bold"
                    : "text-zinc-400 hover:text-white"
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Register Site
              </button>
            </div>

            {/* Toast / Feedback notification */}
            {successMsg && (
              <div className="mb-4 rounded-lg border border-[#F6C72F]/40 bg-[#F6C72F]/10 p-3 text-xs text-[#F6C72F] flex items-center gap-2.5 animate-fadeIn">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* ----------------- SIGN IN FORM ----------------- */}
            {mode === "signin" ? (
              <form onSubmit={handleSignInSubmit} className="space-y-4">
                {/* Demo Persona Quick Autofill Bar */}
                <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Fingerprint className="w-3.5 h-3.5 text-[#F6C72F]" />
                      Quick Demo Personas:
                    </span>
                    <span className="text-[10px] text-zinc-500">Click to autofill</span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {demoPersonas.map((persona) => {
                      const Icon = persona.icon;
                      const isSelected = activePersona === persona.role;
                      return (
                        <button
                          key={persona.role}
                          type="button"
                          onClick={() => handleApplyPersona(persona)}
                          className={`px-2.5 py-1.5 rounded-lg text-left text-[11px] font-medium transition-all flex items-center gap-2 border ${
                            isSelected
                              ? "bg-[#F6C72F]/20 border-[#F6C72F] text-white"
                              : "bg-zinc-800/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                          }`}
                        >
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-[#F6C72F]" : "text-zinc-400"}`} />
                          <span className="truncate">{persona.role}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Email / Employee ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                    <span>Work Email or Operator ID</span>
                    <span className="text-[10px] font-mono text-zinc-500">SSO Enabled</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                      <Mail className="h-4 w-4" />
                    </div>
                    <input
                      type="text"
                      required
                      value={signInEmail}
                      onChange={(e) => setSignInEmail(e.target.value)}
                      placeholder="name@company.com or EMP-1092"
                      className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] pl-10 pr-4 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition-colors focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-medium text-zinc-300">Security Password</label>
                    <button
                      type="button"
                      onClick={() => alert("Password reset link will be sent to your registered work email.")}
                      className="text-[11px] text-[#F6C72F] hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={signInPassword}
                      onChange={(e) => setSignInPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] pl-10 pr-10 py-2.5 text-xs sm:text-sm text-white placeholder-zinc-500 transition-colors focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-zinc-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-[#F6C72F] accent-[#F6C72F] focus:ring-0"
                    />
                    <span className="text-xs text-zinc-400">Keep session active on this device</span>
                  </label>
                </div>

                {/* Submit Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-[#F6C72F] py-3 px-4 text-xs sm:text-sm font-bold text-zinc-950 transition-all hover:bg-[#FFD338] hover:shadow-[0_0_20px_rgba(246,199,47,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Authenticating Portal Access...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Sitesafe Portal</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                {/* Single Sign On Separator */}
                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800" />
                  </div>
                  <div className="relative flex justify-center text-[10px] uppercase font-mono">
                    <span className="bg-[#12161f] px-2 text-zinc-500">Or Enterprise SSO</span>
                  </div>
                </div>

                {/* Enterprise SSO Options */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to Microsoft Azure Active Directory...")}
                    className="flex items-center justify-center py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Azure AD
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to Okta Identity...")}
                    className="flex items-center justify-center py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Okta
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to Google Workspace...")}
                    className="flex items-center justify-center py-2 px-3 rounded-lg border border-zinc-800 bg-zinc-900/60 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white transition-colors"
                  >
                    Google
                  </button>
                </div>
              </form>
            ) : (
              /* ----------------- SIGN UP / ONBOARDING FORM ----------------- */
              <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
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
                        value={signUpName}
                        onChange={(e) => setSignUpName(e.target.value)}
                        placeholder="John Smith"
                        className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                      />
                    </div>
                  </div>

                  {/* Work Email */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Work Email</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                        <Mail className="h-3.5 w-3.5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={signUpEmail}
                        onChange={(e) => setSignUpEmail(e.target.value)}
                        placeholder="john@contractor.com"
                        className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Company */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Company / Entity</label>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                        <Building2 className="h-3.5 w-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={signUpCompany}
                        onChange={(e) => setSignUpCompany(e.target.value)}
                        placeholder="L&T Heavy Infra"
                        className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] pl-9 pr-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                      />
                    </div>
                  </div>

                  {/* Industry Sector */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Industry Sector</label>
                    <select
                      value={signUpIndustry}
                      onChange={(e) => setSignUpIndustry(e.target.value)}
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
                  {/* Role */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Primary Role</label>
                    <select
                      value={signUpRole}
                      onChange={(e) => setSignUpRole(e.target.value)}
                      className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] px-3 py-2 text-xs text-white focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                    >
                      <option>Safety Head / EHS Manager</option>
                      <option>Project & Site Head</option>
                      <option>Site Supervisor</option>
                      <option>Procurement & Operations</option>
                      <option>Auditor / Executive</option>
                    </select>
                  </div>

                  {/* Planned Fleet */}
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Active Kits Fleet</label>
                    <select
                      value={signUpFleetSize}
                      onChange={(e) => setSignUpFleetSize(e.target.value)}
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
                    <label className="text-xs font-medium text-zinc-300">Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={signUpPassword}
                        onChange={(e) => setSignUpPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-zinc-300">Confirm</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        required
                        value={signUpConfirmPassword}
                        onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full rounded-xl border border-zinc-800 bg-[#0d1017] px-3 py-2 text-xs text-white placeholder-zinc-500 focus:border-[#F6C72F] focus:outline-none focus:ring-1 focus:ring-[#F6C72F]"
                      />
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {signUpPassword && (
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
                    I agree to the Sitesafe Telemetry Data Handling Policy & ISO 45001 EHS audit standards.
                  </span>
                </label>

                {/* Submit Sign Up Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl bg-[#F6C72F] py-3 px-4 text-xs sm:text-sm font-bold text-zinc-950 transition-all hover:bg-[#FFD338] hover:shadow-[0_0_20px_rgba(246,199,47,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Provisioning Site Workspace...</span>
                    </>
                  ) : (
                    <>
                      <span>Provision Enterprise Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Bottom Toggle Note */}
            <div className="mt-5 text-center text-xs text-zinc-400">
              {mode === "signin" ? (
                <span>
                  New to AyantrAI Sitesafe?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signup")}
                    className="font-semibold text-[#F6C72F] hover:underline"
                  >
                    Register your site
                  </button>
                </span>
              ) : (
                <span>
                  Already have an active workspace?{" "}
                  <button
                    type="button"
                    onClick={() => setMode("signin")}
                    className="font-semibold text-[#F6C72F] hover:underline"
                  >
                    Sign in to portal
                  </button>
                </span>
              )}
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
