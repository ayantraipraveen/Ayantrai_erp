"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AuthSkeleton from "../Component/AuthSkeleton";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  loginStart,
  loginSuccess,
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
  MapPin,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { signInSchema } from "@/lib/validations/auth";

export default function SignInPage() {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated, isLoading } = useAppSelector(
    (state) => state.auth
  );

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activePersona, setActivePersona] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <AuthSkeleton isSignUp={false} />;
  }

  // Quick Demo Personas
  const demoPersonas = [
    {
      role: "Safety Head / EHS",
      name: "Dr. Vikram Seth",
      email: "ehs.director@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      company: "L&T Heavy Civil Infra",
      badge: "Full Audit",
      icon: ShieldCheck,
    },
    {
      role: "Site Manager",
      name: "Rajesh Sharma",
      email: "site.manager@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      company: "Afcons Infrastructure",
      badge: "Zone Ops",
      icon: Building2,
    },
    {
      role: "Field Supervisor",
      name: "Amit Verma",
      email: "supervisor.zone4@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      company: "Tata Projects",
      badge: "Field Triage",
      icon: Activity,
    },
    {
      role: "Device Admin",
      name: "Pooja Mehta",
      email: "fleet.admin@ayantrai-demo.com",
      pass: "Sitesafe@2026",
      company: "AyantrAI Operations",
      badge: "Hardware & Kits",
      icon: Cpu,
    },
  ];

  const handleApplyPersona = (persona: (typeof demoPersonas)[0]) => {
    setActivePersona(persona.role);
    setEmail(persona.email);
    setPassword(persona.pass);
    setErrors({});
    setFeedback(`Loaded credentials for ${persona.role}`);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();

    // Zod Schema Validation
    const validationResult = signInSchema.safeParse({ email, password, rememberMe });
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {};
      for (const issue of validationResult.error.issues) {
        const key = issue.path[0] as string;
        if (key && !fieldErrors[key]) {
          fieldErrors[key] = issue.message;
        }
      }
      setErrors(fieldErrors);
      return;
    }
    setErrors({});

    dispatch(loginStart());

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
      setFeedback(`Welcome back, ${userProfile.name}! Redux session active.`);
    }, 750);
  };

  const handleLogout = () => {
    dispatch(logout());
    setFeedback("Signed out from Redux session.");
    setTimeout(() => setFeedback(null), 3000);
  };

  return (
    <div className="relative min-h-screen lg:h-screen w-full bg-[#080a0e] text-slate-100 flex flex-col justify-between overflow-y-auto lg:overflow-hidden industrial-grid">
      
      {/* Ambient Lighting Orbs */}
      <div className="ambient-lighting-layer">
        <div className="amber-spotlight" />
        <div className="cyan-rim-light" />
      </div>

      {/* Top Header - Consistent Across App */}
      <header className="relative z-10 w-full border-b border-zinc-800/80 bg-[#0c1017]/90 backdrop-blur-md flex-shrink-0">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/signin" className="flex items-center gap-2.5 sm:gap-3 group">
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
                <span className="text-[11px] text-zinc-400 font-medium hidden md:inline">Connected Site Portal</span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden md:inline text-xs text-zinc-400">Need a new site account?</span>
            <Link
              href="/signup"
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-zinc-800/90 border border-zinc-700/80 text-zinc-200 hover:text-white hover:border-[#F6C72F]/60 hover:shadow-[0_0_15px_rgba(246,199,47,0.2)] transition-all"
            >
              Register Site
            </Link>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main className="relative z-10 flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 flex items-center justify-center py-6 lg:py-2 overflow-visible lg:overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-12 items-center">
          
          {/* ================= LEFT COLUMN: Telemetry Command View ================= */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center space-y-4 lg:space-y-3.5 xl:space-y-4 order-2 lg:order-1">
            
            {/* Headline */}
            <div className="space-y-1.5 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#F6C72F]/40 bg-[#F6C72F]/10 text-[#F6C72F] text-[11px] font-mono tracking-wide uppercase shadow-[0_0_15px_rgba(246,199,47,0.15)]">
                <Sparkles className="w-3 h-3 text-[#F6C72F] animate-pulse" />
                Connected Industrial Safety Infrastructure
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
                Sign In to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F6C72F] via-[#FFD027] to-amber-200 drop-shadow-[0_0_20px_rgba(246,199,47,0.35)]">
                  Sitesafe Portal.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Access real-time continuous compliance telemetry from every helmet, vest hub, and boot deployed across your industrial sites.
              </p>
            </div>

            {/* 3-Chipset Telemetry Hub Card */}
            <div className="rounded-2xl border border-zinc-800/90 bg-[#0f131c]/85 p-4 sm:p-5 backdrop-blur-xl neon-glow-card relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 shimmer-line opacity-75" />
              <div className="absolute top-0 right-0 h-32 w-32 bg-[#F6C72F]/8 rounded-bl-full pointer-events-none filter blur-xl" />

              <div className="flex flex-wrap items-center justify-between pb-2.5 mb-3 border-b border-zinc-800/80 gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#F6C72F] beacon-active" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-zinc-200">
                    Live Telemetry Stream • Sample Kit AY-9024
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] font-mono text-zinc-400">
                    Sync: <span className="text-zinc-200 font-semibold">1.2s ago</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded font-semibold badge-glow-emerald">
                    100% COMPLIANT
                  </span>
                </div>
              </div>

              {/* 3 Chipset Devices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                
                {/* Device 01: Helmet */}
                <div className="rounded-xl border border-zinc-800/90 bg-[#090c12]/90 p-3 flex flex-col justify-between hover:border-zinc-700 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F6C72F] shadow-[0_0_10px_rgba(246,199,47,0.15)]">
                        <HardHat className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" /> WORN
                      </span>
                    </div>
                    <div className="text-xs font-bold text-zinc-200">Device 01: Helmet</div>
                    <div className="text-[10px] text-zinc-400 font-mono">BLE Mesh → Vest</div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Battery 98%</span>
                    <span className="text-emerald-400 font-semibold">-46 dBm</span>
                  </div>
                </div>

                {/* Device 02: Vest Hub */}
                <div className="rounded-xl border border-[#F6C72F]/50 bg-[#0d111a]/95 p-3 flex flex-col justify-between shadow-[0_0_25px_rgba(246,199,47,0.12),inset_0_1px_1px_rgba(246,199,47,0.2)] relative">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-7 w-7 rounded-lg bg-[#F6C72F]/20 border border-[#F6C72F]/50 flex items-center justify-center text-[#F6C72F] shadow-[0_0_12px_rgba(246,199,47,0.3)]">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-amber-300 bg-amber-950/70 border border-amber-500/40 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 badge-glow-amber">
                        <Wifi className="w-2.5 h-2.5 text-[#F6C72F]" /> CELLULAR
                      </span>
                    </div>
                    <div className="text-xs font-bold text-white">Device 02: Vest Hub</div>
                    <div className="text-[10px] text-[#F6C72F] font-mono font-medium">IoT 4G LTE-M + GPS</div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Sector 4 Yard C</span>
                    <span className="text-emerald-400 font-semibold">-58 dBm</span>
                  </div>
                </div>

                {/* Device 03: Boot */}
                <div className="rounded-xl border border-zinc-800/90 bg-[#090c12]/90 p-3 flex flex-col justify-between hover:border-zinc-700 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#F6C72F] shadow-[0_0_10px_rgba(246,199,47,0.15)]">
                        <Footprints className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" /> GROUNDED
                      </span>
                    </div>
                    <div className="text-xs font-bold text-zinc-200">Device 03: Boot</div>
                    <div className="text-[10px] text-zinc-400 font-mono">BLE Mesh → Vest</div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-zinc-400">
                    <span>Battery 95%</span>
                    <span className="text-emerald-400 font-semibold">-52 dBm</span>
                  </div>
                </div>
              </div>

              {/* Active Site Zone Status Bar */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3 h-3 text-[#F6C72F] drop-shadow-[0_0_6px_rgba(246,199,47,0.5)]" />
                  <span className="truncate text-zinc-300">Nx-One Tower Pilot Site (Greater Noida)</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px]">
                  <span className="text-emerald-400">● 48 Zone 1</span>
                  <span className="text-sky-400">● 64 Zone 2</span>
                  <span className="text-amber-400">● 32 Zone 3</span>
                </div>
              </div>
            </div>

            {/* Industrial Metric Highlights - 4 Glowing Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              <div className="rounded-xl border border-zinc-800/80 bg-[#0e1219]/80 p-2.5 xl:p-3 hover:border-amber-500/40 hover:shadow-[0_0_18px_rgba(246,199,47,0.12)] transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-[#F6C72F] drop-shadow-[0_0_10px_rgba(246,199,47,0.35)]">99.4%</div>
                <div className="text-[11px] text-zinc-300 font-medium">Compliance</div>
                <div className="text-[9px] text-emerald-400 font-mono">+1.8% vs manual</div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-[#0e1219]/80 p-2.5 xl:p-3 hover:border-zinc-700 transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-white">1,480+</div>
                <div className="text-[11px] text-zinc-300 font-medium">Active Kits</div>
                <div className="text-[9px] text-zinc-500 font-mono">6 site deployments</div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-[#0e1219]/80 p-2.5 xl:p-3 hover:border-emerald-500/40 hover:shadow-[0_0_18px_rgba(16,185,129,0.12)] transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]">0</div>
                <div className="text-[11px] text-zinc-300 font-medium">Hazards</div>
                <div className="text-[9px] text-emerald-400 font-mono">Zero open escalations</div>
              </div>

              <div className="rounded-xl border border-zinc-800/80 bg-[#0e1219]/80 p-2.5 xl:p-3 hover:border-sky-500/40 hover:shadow-[0_0_18px_rgba(6,182,212,0.12)] transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-sky-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.35)]">24/7</div>
                <div className="text-[11px] text-zinc-300 font-medium">IoT Uplink</div>
                <div className="text-[9px] text-sky-400 font-mono">Audit timestamped</div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Form Card (Identical Width & Styling) ================= */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end w-full order-1 lg:order-2">
            <div className="w-full max-w-md xl:max-w-lg rounded-2xl border border-[#F6C72F]/35 bg-[#111520]/95 p-5 sm:p-6 xl:p-7 backdrop-blur-2xl neon-glow-amber-lg relative overflow-hidden">
              
              {/* Shimmering Animated Top Line */}
              <div className="absolute top-0 left-0 right-0 shimmer-line" />

              <div className="mb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span>Portal Access</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F6C72F] animate-pulse" />
                </h2>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Enter your registered enterprise credentials to access your site dashboard.
                </p>
              </div>

              {/* Redux Authenticated State Indicator */}
              {isAuthenticated && user && (
                <div className="mb-3 rounded-xl border border-emerald-500/40 bg-emerald-950/40 p-2.5 text-xs text-emerald-300 flex items-center justify-between badge-glow-emerald">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <div className="text-[11px]">
                      <span className="font-semibold text-white">{user.name}</span> • {user.role}
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="px-2 py-0.5 text-[10px] rounded border border-emerald-800/80 bg-emerald-900/50 text-emerald-200 hover:bg-emerald-800 transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-2.5 h-2.5" />
                    Logout
                  </button>
                </div>
              )}

              {/* Feedback toast */}
              {feedback && (
                <div className="mb-3 rounded-lg border border-[#F6C72F]/40 bg-[#F6C72F]/10 p-2.5 text-xs text-[#F6C72F] flex items-center gap-2 animate-fadeIn badge-glow-amber">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              {/* Quick Demo Personas Bar */}
              <div className="rounded-xl border border-zinc-800/90 bg-[#0a0d13]/80 p-2.5 mb-3">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1 font-semibold">
                    <Fingerprint className="w-3 h-3 text-[#F6C72F]" />
                    Quick Demo Personas:
                  </span>
                  <span className="text-[9px] text-zinc-500">Tap to autofill</span>
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
                        className={`p-1.5 sm:p-2 rounded-lg text-left transition-all flex items-center gap-1.5 sm:gap-2 border cursor-pointer ${
                          isSelected
                            ? "bg-[#F6C72F]/20 border-[#F6C72F] text-white shadow-[0_0_12px_rgba(246,199,47,0.3)]"
                            : "bg-zinc-800/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700"
                        }`}
                      >
                        <Icon className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#F6C72F]" : "text-zinc-400"}`} />
                        <span className="truncate font-medium text-[10px] sm:text-[11px]">{persona.role}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSignIn} className="space-y-2.5 sm:space-y-3">
                {/* Email / ID */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-zinc-300 flex items-center justify-between">
                    <span>Work Email or Operator ID</span>
                    <span className="text-[9px] font-mono text-zinc-500">SSO Ready</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                      <Mail className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type="text"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      placeholder="name@company.com or EMP-1092"
                      className={`w-full rounded-xl bg-[#080b10] pl-9 pr-3 py-2 text-sm sm:text-xs text-white placeholder-zinc-500 transition-all ${
                        errors.email
                          ? "border border-amber-500/80 shadow-[0_0_10px_rgba(246,199,47,0.25)]"
                          : "border border-zinc-800/90 focus-glow-amber"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5 animate-fadeIn">
                      <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-zinc-300">Security Password</label>
                    <button
                      type="button"
                      onClick={() => alert("Password reset instructions sent to your registered email.")}
                      className="text-[10px] text-[#F6C72F] hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                      <Lock className="h-3.5 w-3.5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      placeholder="••••••••••••"
                      className={`w-full rounded-xl bg-[#080b10] pl-9 pr-9 py-2 text-sm sm:text-xs text-white placeholder-zinc-500 transition-all ${
                        errors.password
                          ? "border border-amber-500/80 shadow-[0_0_10px_rgba(246,199,47,0.25)]"
                          : "border border-zinc-800/90 focus-glow-amber"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-amber-400 font-mono flex items-center gap-1 mt-0.5 animate-fadeIn">
                      <AlertCircle className="w-2.5 h-2.5 flex-shrink-0" />
                      <span>{errors.password}</span>
                    </p>
                  )}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-0.5">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-3.5 w-3.5 rounded border-zinc-700 bg-zinc-900 text-[#F6C72F] accent-[#F6C72F] focus:ring-0"
                    />
                    <span className="text-[11px] text-zinc-400">Keep session active on this workstation</span>
                  </label>
                </div>

                {/* Submit Glowing Sign In Button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full rounded-xl py-2.5 px-4 text-xs font-bold text-zinc-950 glow-btn-amber flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {isLoading ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Verifying in Redux Store...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Sitesafe Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* SSO Separator */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-zinc-800/90" />
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase font-mono">
                    <span className="bg-[#111520] px-2 text-zinc-500">Or Enterprise SSO</span>
                  </div>
                </div>

                {/* SSO Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to Microsoft Azure Active Directory...")}
                    className="flex items-center justify-center py-1.5 px-2 rounded-lg border border-zinc-800/80 bg-zinc-900/60 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                  >
                    Azure AD
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to Okta Identity...")}
                    className="flex items-center justify-center py-1.5 px-2 rounded-lg border border-zinc-800/80 bg-zinc-900/60 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                  >
                    Okta
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to Google Workspace...")}
                    className="flex items-center justify-center py-1.5 px-2 rounded-lg border border-zinc-800/80 bg-zinc-900/60 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 hover:text-white hover:border-zinc-700 transition-all cursor-pointer"
                  >
                    Google
                  </button>
                </div>
              </form>

              {/* Bottom Link to Sign Up */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/80 text-center text-xs text-zinc-400">
                Don&apos;t have an enterprise account?{" "}
                <Link href="/signup" className="font-semibold text-[#F6C72F] hover:underline">
                  Register your site
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
            <span className="font-mono text-zinc-500">Kanpur & Greater Noida, India</span>
            <a href="mailto:info@ayantrai.com" className="text-zinc-400 hover:text-[#F6C72F] transition-colors">
              info@ayantrai.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
