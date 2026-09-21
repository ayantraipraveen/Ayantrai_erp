"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  loginStart,
  loginSuccess,
  loginFailure,
  logout,
} from "@/lib/redux/slices/authSlice";
import {
  ShieldCheck,
  Radio,
  HardHat,
  Footprints,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  Sparkles,
  Wifi,
  Cpu,
  Building2,
  Activity,
  Fingerprint,
  LogOut,
  UserCheck,
} from "lucide-react";

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading, error } = useAppSelector(
    (state) => state.auth
  );

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<string | null>(null);

  // Quick Demo Personas
  const demoPersonas = [
    {
      role: "Safety Head / EHS",
      name: "Dr. Vikram Seth",
      email: "ehs.director@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      company: "L&T Heavy Civil Infra",
      icon: ShieldCheck,
    },
    {
      role: "Site Manager",
      name: "Rajesh Sharma",
      email: "site.manager@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      company: "Afcons Infrastructure",
      icon: Building2,
    },
    {
      role: "Field Supervisor",
      name: "Amit Verma",
      email: "supervisor.zone4@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      company: "Tata Projects",
      icon: Activity,
    },
    {
      role: "Device Admin",
      name: "Pooja Mehta",
      email: "fleet.admin@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      company: "AyantrAI Operations",
      icon: Cpu,
    },
  ];

  const handleApplyPersona = (persona: (typeof demoPersonas)[0]) => {
    setActivePersona(persona.role);
    setEmail(persona.email);
    setPassword(persona.pass);
    setFeedback(`Selected demo persona: ${persona.role}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    dispatch(loginStart());

    // Simulate authentication and Redux dispatch
    setTimeout(() => {
      const selected = demoPersonas.find((p) => p.email === email);
      const userProfile = {
        id: `usr_${Date.now()}`,
        name: selected ? selected.name : email.split("@")[0],
        email: email,
        role: selected ? selected.role : "Safety Head / EHS",
        company: selected ? selected.company : "Industrial Site Operator",
      };

      dispatch(
        loginSuccess({
          user: userProfile,
          token: "jwt_sitesafe_" + Math.random().toString(36).substring(2),
        })
      );
      setFeedback(`Welcome back, ${userProfile.name}! Redux session initialized.`);
    }, 1000);
  };

  const handleLogout = () => {
    dispatch(logout());
    setFeedback("Signed out from Redux session.");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0a0d12] text-slate-100 flex flex-col justify-between industrial-grid">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 amber-glow-radial z-0" />

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-zinc-800/80 bg-[#0d1117]/85 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/signin" className="flex items-center gap-3">
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

        {/* Link to Sign Up */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline text-xs text-zinc-400">Need a new site account?</span>
          <Link
            href="/signup"
            className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800/70 border border-zinc-700 text-zinc-200 hover:text-white hover:bg-zinc-800 hover:border-zinc-600 transition-all"
          >
            Register Site
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12">
        {/* Left Side: Industrial Telemetry Showcase */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center space-y-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md border border-[#F6C72F]/30 bg-[#F6C72F]/10 text-[#F6C72F] text-xs font-mono tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5" />
              Connected Industrial Safety Infrastructure
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white leading-tight">
              Sign In to{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6C72F] via-[#FFD027] to-amber-200">
                Sitesafe Portal.
              </span>
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 leading-relaxed max-w-xl">
              Access real-time continuous compliance telemetry from every helmet, vest hub, and boot deployed on your site.
            </p>
          </div>

          {/* 3-Chipset Telemetry Demonstration Card */}
          <div className="rounded-2xl border border-zinc-800/80 bg-zinc-900/70 p-5 backdrop-blur-xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 h-28 w-28 bg-[#F6C72F]/5 rounded-bl-full pointer-events-none" />

            <div className="flex items-center justify-between pb-3 mb-4 border-b border-zinc-800">
              <div className="flex items-center gap-2.5">
                <Radio className="w-4 h-4 text-[#F6C72F] animate-pulse" />
                <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-300">
                  Live Telemetry Stream (Kit #AY-9024)
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-2 py-0.5 rounded">
                100% COMPLIANT
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Helmet */}
              <div className="rounded-xl border border-zinc-800 bg-[#0d1017]/80 p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F6C72F]">
                    <HardHat className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">WORN</span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-zinc-300">Device 01: Helmet</div>
                  <div className="text-[10px] text-zinc-500 font-mono">BLE → Vest</div>
                  <div className="mt-2 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>Battery</span>
                    <span className="text-zinc-200">98%</span>
                  </div>
                </div>
              </div>

              {/* Vest Hub */}
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

              {/* Boot */}
              <div className="rounded-xl border border-zinc-800 bg-[#0d1017]/80 p-3 flex flex-col justify-between">
                <div className="flex items-center justify-between mb-2">
                  <div className="h-8 w-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F6C72F]">
                    <Footprints className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400">GROUNDED</span>
                </div>
                <div>
                  <div className="text-[11px] font-semibold text-zinc-300">Device 03: Boot</div>
                  <div className="text-[10px] text-zinc-500 font-mono">BLE → Vest</div>
                  <div className="mt-2 text-[10px] font-mono text-zinc-400 flex items-center justify-between">
                    <span>Battery</span>
                    <span className="text-zinc-200">95%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
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
              <div className="text-[11px] text-zinc-400 font-medium mt-0.5">Critical Incidents</div>
            </div>
          </div>
        </div>

        {/* Right Side: Dedicated Sign In Card */}
        <div className="w-full lg:w-1/2 max-w-md">
          <div className="rounded-2xl border border-zinc-800 bg-[#12161f]/90 p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_60px_rgba(0,0,0,0.6)] relative">
            <div className="absolute -top-px left-8 right-8 h-1 bg-gradient-to-r from-transparent via-[#F6C72F] to-transparent rounded-full opacity-80" />

            <div className="mb-6">
              <h2 className="text-2xl font-bold text-white tracking-tight">Portal Access</h2>
              <p className="text-xs text-zinc-400 mt-1">
                Enter your registered enterprise credentials to access your site dashboard.
              </p>
            </div>

            {/* Redux Authenticated State Indicator */}
            {isAuthenticated && user && (
              <div className="mb-5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-3.5 text-xs text-emerald-300 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-5 h-5 text-emerald-400" />
                  <div>
                    <div className="font-semibold text-white">Logged in via Redux</div>
                    <div className="text-[11px] text-emerald-400">
                      {user.name} ({user.role})
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="px-2.5 py-1 text-[11px] rounded border border-emerald-800/80 bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800 transition-colors flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            )}

            {/* Feedback notification */}
            {feedback && (
              <div className="mb-4 rounded-lg border border-[#F6C72F]/40 bg-[#F6C72F]/10 p-3 text-xs text-[#F6C72F] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                <span>{feedback}</span>
              </div>
            )}

            {/* Quick Demo Persona Bar */}
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/50 p-3 mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-[#F6C72F]" />
                  Quick Demo Roles:
                </span>
                <span className="text-[10px] text-zinc-500">Auto-fills credentials</span>
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

            {/* Sign In Form */}
            <form onSubmit={handleSignIn} className="space-y-4">
              {/* Email / ID */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-zinc-300 flex items-center justify-between">
                  <span>Work Email or Operator ID</span>
                  <span className="text-[10px] font-mono text-zinc-500">SSO Ready</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-zinc-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                    onClick={() => alert("Password reset instructions sent to your registered email.")}
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
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
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

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-[#F6C72F] accent-[#F6C72F] focus:ring-0"
                  />
                  <span className="text-xs text-zinc-400">Keep session active on this workstation</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-[#F6C72F] py-3 px-4 text-xs sm:text-sm font-bold text-zinc-950 transition-all hover:bg-[#FFD338] hover:shadow-[0_0_20px_rgba(246,199,47,0.4)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <div className="h-4 w-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Verifying in Redux Store...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Sitesafe Portal</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* SSO Separator */}
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-mono">
                  <span className="bg-[#12161f] px-2 text-zinc-500">Or Enterprise Single Sign-On</span>
                </div>
              </div>

              {/* SSO Buttons */}
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

            {/* Bottom Link to Sign Up */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
              Don&apos;t have an enterprise account?{" "}
              <Link href="/signup" className="font-semibold text-[#F6C72F] hover:underline">
                Register your site
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
