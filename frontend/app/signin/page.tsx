"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AuthSkeleton from "../Component/AuthSkeleton";
import AuthNavbar from "../Component/AuthNavbar";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  loginUser,
  logoutUser,
  loginSuccess,
} from "@/lib/redux/slices/authSlice";
import { setActiveRole } from "@/lib/redux/slices/reportModuleSlice";
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
  const router = useRouter();
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
      role: "Superadmin",
      name: "Dr. Vikram Seth",
      email: "superadmin@ayantrai.com",
      pass: "Sitesafe@2026",
      company: "AyantrAI HQ Governance",
      badge: "Full System Control",
      icon: ShieldCheck,
    },
    {
      role: "Site Admin",
      name: "Vikram Seth",
      email: "vikram.seth@lt-infra.com",
      pass: "Sitesafe@2026",
      company: "Nx-One Tower Pilot Site",
      badge: "Site-Scoped Admin",
      icon: Building2,
    },
    {
      role: "Site Manager",
      name: "Anita Sharma",
      email: "anita.sharma@mumbai-metro.in",
      pass: "Sitesafe@2026",
      company: "Metro Line 4 Underground Tunnel",
      badge: "Tunnel Lead",
      icon: Activity,
    },
    {
      role: "Device Admin",
      name: "Rajesh Gupta",
      email: "rajesh.gupta@hsr-infra.gov.in",
      pass: "Sitesafe@2026",
      company: "High-Speed Rail Viaduct C-2",
      badge: "Hardware & Kits",
      icon: Cpu,
    },
  ];

  const handleApplyPersona = (persona: (typeof demoPersonas)[0]) => {
    setActivePersona(persona.role);
    setEmail(persona.email);
    setPassword(persona.pass);
    setErrors({});
    setFeedback(`Selected ${persona.role} (${persona.email}) • Password auto-filled`);
    setTimeout(() => setFeedback(null), 3500);
  };

  const handleSignIn = async (e: React.FormEvent) => {
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

    try {
      // Dispatches centralized authentication through Redux and validates token & role
      const result = await dispatch(loginUser({ email, password, rememberMe })).unwrap();

      // Synchronize role state
      const lowerRole = (result.user.role || "").toLowerCase();
      if (lowerRole.includes("superadmin")) {
        dispatch(setActiveRole("superadmin"));
      } else if (lowerRole.includes("project")) {
        dispatch(setActiveRole("project_head"));
      } else {
        dispatch(setActiveRole("admin"));
      }

      setFeedback(`Authenticated as ${result.user.name} (${result.user.role}) with active security token. Redirecting...`);

      let targetRedirect = "/dashboard";
      if (typeof window !== "undefined") {
        const params = new URLSearchParams(window.location.search);
        const redirectParam = params.get("redirect");
        if (redirectParam && redirectParam.startsWith("/")) {
          targetRedirect = redirectParam;
        }
      }

      setTimeout(() => {
        router.push(targetRedirect);
      }, 500);
    } catch (err: any) {
      setFeedback(typeof err === "string" ? err : "Failed to sign in. Please verify credentials.");
    }
  };


  return (
    <div className="relative min-h-screen lg:h-screen w-full bg-slate-50 dark:bg-[#080a0e] text-slate-900 dark:text-slate-100 flex flex-col justify-between overflow-y-auto lg:overflow-hidden industrial-grid transition-colors">
      
      {/* Ambient Lighting Orbs */}
      <div className="ambient-lighting-layer">
        <div className="amber-spotlight" />
        <div className="cyan-rim-light" />
      </div>

      {/* Top Header - Reusable Modular AuthNavbar */}
      <AuthNavbar mode="signin" />

      {/* Main View Area */}
      <main className="relative z-10 flex-1 w-full max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 flex items-center justify-center py-6 lg:py-2 overflow-visible lg:overflow-hidden">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 xl:gap-12 items-center">
          
          {/* ================= LEFT COLUMN: Telemetry Command View ================= */}
          <div className="lg:col-span-7 xl:col-span-7 flex flex-col justify-center space-y-4 lg:space-y-3.5 xl:space-y-4 order-2 lg:order-1">
            
            {/* Headline */}
            <div className="space-y-1.5 text-center lg:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md border border-[#F6C72F]/40 bg-[#F6C72F]/10 text-amber-700 dark:text-[#F6C72F] text-[11px] font-mono tracking-wide uppercase shadow-[0_0_15px_rgba(246,199,47,0.15)]">
                <Sparkles className="w-3 h-3 text-[#F6C72F] animate-pulse" />
                Connected Industrial Safety Infrastructure
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl xl:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
                Sign In to{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-700 dark:from-[#F6C72F] dark:via-[#FFD027] dark:to-amber-200 drop-shadow-[0_0_20px_rgba(246,199,47,0.35)]">
                  Sitesafe Portal.
                </span>
              </h1>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed max-w-xl mx-auto lg:mx-0">
                Access real-time continuous compliance telemetry from every helmet, vest hub, and boot deployed across your industrial sites.
              </p>
            </div>

            {/* 3-Chipset Telemetry Hub Card */}
            <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white/90 dark:bg-[#0f131c]/85 p-4 sm:p-5 backdrop-blur-xl neon-glow-card relative overflow-hidden group shadow-lg dark:shadow-none">
              <div className="absolute top-0 left-0 right-0 shimmer-line opacity-75" />
              <div className="absolute top-0 right-0 h-32 w-32 bg-amber-500/10 dark:bg-[#F6C72F]/8 rounded-bl-full pointer-events-none filter blur-xl" />

              <div className="flex flex-wrap items-center justify-between pb-2.5 mb-3 border-b border-slate-200 dark:border-zinc-800/80 gap-2">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-[#F6C72F] beacon-active" />
                  <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
                    Live Telemetry Stream • Sample Kit AY-9024
                  </span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                    Sync: <span className="text-slate-800 dark:text-zinc-200 font-semibold">1.2s ago</span>
                  </span>
                  <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded font-semibold badge-glow-emerald">
                    100% COMPLIANT
                  </span>
                </div>
              </div>

              {/* 3 Chipset Devices Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 sm:gap-3">
                
                {/* Device 01: Helmet */}
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/90 dark:bg-[#090c12]/90 p-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-[#F6C72F] shadow-[0_0_10px_rgba(246,199,47,0.15)]">
                        <HardHat className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400/40 dark:border-emerald-800/60 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" /> WORN
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-zinc-200">Device 01: Helmet</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">BLE Mesh → Vest</div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                    <span>Battery 98%</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">-46 dBm</span>
                  </div>
                </div>

                {/* Device 02: Vest Hub */}
                <div className="rounded-xl border border-amber-400/60 dark:border-[#F6C72F]/50 bg-amber-50/50 dark:bg-[#0d111a]/95 p-3 flex flex-col justify-between shadow-[0_0_25px_rgba(246,199,47,0.12),inset_0_1px_1px_rgba(246,199,47,0.2)] relative">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-600 dark:text-[#F6C72F] shadow-[0_0_12px_rgba(246,199,47,0.3)]">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/70 border border-amber-500/40 px-1.5 py-0.5 rounded font-medium flex items-center gap-1 badge-glow-amber">
                        <Wifi className="w-2.5 h-2.5 text-amber-600 dark:text-[#F6C72F]" /> CELLULAR
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white">Device 02: Vest Hub</div>
                    <div className="text-[10px] text-amber-700 dark:text-[#F6C72F] font-mono font-medium">IoT 4G LTE-M + GPS</div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-amber-200 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                    <span>Sector 4 Yard C</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">-58 dBm</span>
                  </div>
                </div>

                {/* Device 03: Boot */}
                <div className="rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/90 dark:bg-[#090c12]/90 p-3 flex flex-col justify-between hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-[#F6C72F] shadow-[0_0_10px_rgba(246,199,47,0.15)]">
                        <Footprints className="w-4 h-4" />
                      </div>
                      <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-400/40 dark:border-emerald-800/60 px-1.5 py-0.5 rounded font-medium flex items-center gap-1">
                        <CheckCircle className="w-2.5 h-2.5" /> GROUNDED
                      </span>
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-zinc-200">Device 03: Boot</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono">BLE Mesh → Vest</div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                    <span>Battery 95%</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">-52 dBm</span>
                  </div>
                </div>
              </div>

              {/* Active Site Zone Status Bar */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-800/80 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5 font-mono">
                  <MapPin className="w-3 h-3 text-amber-600 dark:text-[#F6C72F] drop-shadow-[0_0_6px_rgba(246,199,47,0.5)]" />
                  <span className="truncate text-slate-700 dark:text-zinc-300">Nx-One Tower Pilot Site (Greater Noida)</span>
                </div>
                <div className="flex items-center gap-2 sm:gap-3 font-mono text-[10px]">
                  <span className="text-emerald-600 dark:text-emerald-400">● 48 Zone 1</span>
                  <span className="text-sky-600 dark:text-sky-400">● 64 Zone 2</span>
                  <span className="text-amber-600 dark:text-amber-400">● 32 Zone 3</span>
                </div>
              </div>
            </div>

            {/* Industrial Metric Highlights - 4 Glowing Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0e1219]/80 p-2.5 xl:p-3 shadow-sm dark:shadow-none hover:border-amber-500/40 hover:shadow-[0_0_18px_rgba(246,199,47,0.12)] transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-amber-600 dark:text-[#F6C72F] drop-shadow-[0_0_10px_rgba(246,199,47,0.35)]">99.4%</div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-300 font-medium">Compliance</div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">+1.8% vs manual</div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0e1219]/80 p-2.5 xl:p-3 shadow-sm dark:shadow-none hover:border-slate-300 dark:hover:border-zinc-700 transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-slate-900 dark:text-white">1,480+</div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-300 font-medium">Active Kits</div>
                <div className="text-[9px] text-slate-500 dark:text-zinc-500 font-mono">6 site deployments</div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0e1219]/80 p-2.5 xl:p-3 shadow-sm dark:shadow-none hover:border-emerald-500/40 hover:shadow-[0_0_18px_rgba(16,185,129,0.12)] transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-emerald-600 dark:text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.35)]">0</div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-300 font-medium">Hazards</div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400 font-mono">Zero open escalations</div>
              </div>

              <div className="rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0e1219]/80 p-2.5 xl:p-3 shadow-sm dark:shadow-none hover:border-sky-500/40 hover:shadow-[0_0_18px_rgba(6,182,212,0.12)] transition-all">
                <div className="text-xl xl:text-2xl font-bold font-mono text-sky-600 dark:text-sky-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.35)]">24/7</div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-300 font-medium">IoT Uplink</div>
                <div className="text-[9px] text-sky-600 dark:text-sky-400 font-mono">Audit timestamped</div>
              </div>
            </div>
          </div>

          {/* ================= RIGHT COLUMN: Form Card (Identical Width & Styling) ================= */}
          <div className="lg:col-span-5 xl:col-span-5 flex justify-center lg:justify-end w-full order-1 lg:order-2">
            <div className="w-full max-w-md xl:max-w-lg rounded-2xl border border-slate-200 dark:border-[#F6C72F]/35 bg-white/95 dark:bg-[#111520]/95 p-5 sm:p-6 xl:p-7 backdrop-blur-2xl neon-glow-amber-lg relative overflow-hidden shadow-2xl dark:shadow-none">
              
              {/* Shimmering Animated Top Line */}
              <div className="absolute top-0 left-0 right-0 shimmer-line" />

              <div className="mb-3">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <span>Portal Access</span>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#F6C72F] animate-pulse" />
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Enter your registered enterprise credentials to access your site dashboard.
                </p>
              </div>

              {/* Feedback toast */}
              {feedback && (
                <div className="mb-3 rounded-lg border border-[#F6C72F]/40 bg-[#F6C72F]/10 p-2.5 text-xs text-amber-700 dark:text-[#F6C72F] flex items-center gap-2 animate-fadeIn badge-glow-amber">
                  <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                  <span>{feedback}</span>
                </div>
              )}

              {/* Quick Persona Demo Selector */}
              <div className="mb-3.5 space-y-2 p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/40">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#F6C72F]" />
                    <span>Quick Demo Credentials</span>
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                    Click to auto-fill
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {/* Superadmin Quick-Fill Card */}
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPersona(demoPersonas[0])
                    }
                    className={`group p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      activePersona === "Superadmin"
                        ? "border-[#F6C72F] bg-amber-500/15 shadow-[0_0_15px_rgba(246,199,47,0.25)] ring-1 ring-[#F6C72F]"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] hover:border-amber-500/50 dark:hover:border-amber-500/40 hover:bg-amber-500/5 dark:hover:bg-amber-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-[#F6C72F] px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 group-hover:bg-amber-500/20 transition-colors">
                        SUPERADMIN
                      </span>
                      <ShieldCheck className="w-3.5 h-3.5 text-[#F6C72F] group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-[#F6C72F] transition-colors truncate">
                      Dr. Vikram Seth
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors truncate">
                      superadmin@ayantrai.com
                    </div>
                  </button>

                  {/* Site Admin Quick-Fill Card */}
                  <button
                    type="button"
                    onClick={() =>
                      handleApplyPersona(demoPersonas[1])
                    }
                    className={`group p-2.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                      activePersona === "Site Admin"
                        ? "border-[#F6C72F] bg-amber-500/15 shadow-[0_0_15px_rgba(246,199,47,0.25)] ring-1 ring-[#F6C72F]"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] hover:border-sky-500/50 dark:hover:border-sky-500/40 hover:bg-sky-500/5 dark:hover:bg-sky-500/10"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-sky-400 px-1.5 py-0.5 rounded bg-sky-500/10 border border-sky-500/30 group-hover:bg-sky-500/20 transition-colors">
                        SITE ADMIN
                      </span>
                      <Building2 className="w-3.5 h-3.5 text-sky-400 group-hover:scale-110 transition-transform" />
                    </div>
                    <div className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors truncate">
                      Vikram Seth
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono group-hover:text-slate-800 dark:group-hover:text-zinc-200 transition-colors truncate">
                      vikram.seth@lt-infra.com
                    </div>
                  </button>
                </div>

                <div className="flex items-center gap-1.5 pt-1 text-[10px] text-slate-500 dark:text-zinc-400 font-mono">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
                  <span className="truncate">
                    LocalStorage synced: Custom admins created in <span className="text-[#F6C72F]">/admins</span> can sign in directly.
                  </span>
                </div>
              </div>

              {/* Sign In Form */}
              <form onSubmit={handleSignIn} className="space-y-2.5 sm:space-y-3">
                {/* Email / ID */}
                <div className="space-y-1">
                  <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300 flex items-center justify-between">
                    <span>Work Email or Operator ID</span>
                    <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500">SSO Ready</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
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
                      className={`w-full rounded-xl bg-white dark:bg-[#080b10] pl-9 pr-3 py-2 text-sm sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all ${
                        errors.email
                          ? "input-error border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.25)] focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border border-slate-300 dark:border-zinc-800/90 hover:border-slate-400 dark:hover:border-zinc-700 focus-glow-amber"
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-red-500 font-mono flex items-center gap-1 mt-0.5 animate-fadeIn">
                      <AlertCircle className="w-2.5 h-2.5 text-red-500 flex-shrink-0" />
                      <span>{errors.email}</span>
                    </p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">Security Password</label>
                    <button
                      type="button"
                      onClick={() => alert("Password reset instructions sent to your registered email.")}
                      className="text-[10px] text-amber-600 dark:text-[#F6C72F] hover:text-amber-700 dark:hover:text-amber-300 hover:underline cursor-pointer transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-zinc-500">
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
                      className={`w-full rounded-xl bg-white dark:bg-[#080b10] pl-9 pr-9 py-2 text-sm sm:text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 transition-all ${
                        errors.password
                          ? "input-error border border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.25)] focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          : "border border-slate-300 dark:border-zinc-800/90 hover:border-slate-400 dark:hover:border-zinc-700 focus-glow-amber"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-[#F6C72F] cursor-pointer transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[10px] text-red-500 font-mono flex items-center gap-1 mt-0.5 animate-fadeIn">
                      <AlertCircle className="w-2.5 h-2.5 text-red-500 flex-shrink-0" />
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
                      className="h-3.5 w-3.5 rounded border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-amber-600 dark:text-[#F6C72F] accent-[#F6C72F] focus:ring-0"
                    />
                    <span className="text-[11px] text-slate-600 dark:text-zinc-400">Keep session active on this workstation</span>
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
                      <span>Login...</span>
                    </>
                  ) : (
                    <>
                      <span>Login</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>

                {/* SSO Separator */}
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200 dark:border-zinc-800/90" />
                  </div>
                  <div className="relative flex justify-center text-[9px] uppercase font-mono">
                    <span className="bg-white dark:bg-[#111520] px-2 text-slate-500 dark:text-zinc-500">Or Enterprise SSO</span>
                  </div>
                </div>

                {/* SSO Buttons */}
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to Microsoft Azure Active Directory...")}
                    className="flex items-center justify-center py-1.5 px-2 rounded-xl border border-slate-300 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/60 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#0d111a] hover:text-amber-600 dark:hover:text-[#F6C72F] hover:border-[#F6C72F]/50 hover:shadow-[0_0_12px_rgba(246,199,47,0.2)] focus:border-[#F6C72F] focus:shadow-[0_0_0_1.5px_#f6c72f,0_0_12px_rgba(246,199,47,0.4)] outline-none transition-all cursor-pointer"
                  >
                    Azure AD
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to Okta Identity...")}
                    className="flex items-center justify-center py-1.5 px-2 rounded-xl border border-slate-300 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/60 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#0d111a] hover:text-amber-600 dark:hover:text-[#F6C72F] hover:border-[#F6C72F]/50 hover:shadow-[0_0_12px_rgba(246,199,47,0.2)] focus:border-[#F6C72F] focus:shadow-[0_0_0_1.5px_#f6c72f,0_0_12px_rgba(246,199,47,0.4)] outline-none transition-all cursor-pointer"
                  >
                    Okta
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Redirecting to Google Workspace...")}
                    className="flex items-center justify-center py-1.5 px-2 rounded-xl border border-slate-300 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/60 text-[11px] font-medium text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-[#0d111a] hover:text-amber-600 dark:hover:text-[#F6C72F] hover:border-[#F6C72F]/50 hover:shadow-[0_0_12px_rgba(246,199,47,0.2)] focus:border-[#F6C72F] focus:shadow-[0_0_0_1.5px_#f6c72f,0_0_12px_rgba(246,199,47,0.4)] outline-none transition-all cursor-pointer"
                  >
                    Google
                  </button>
                </div>
              </form>

              {/* Bottom Link to Sign Up */}
              <div className="mt-3 pt-2.5 border-t border-slate-200 dark:border-zinc-800/80 text-center text-xs text-slate-600 dark:text-zinc-400">
                Don&apos;t have an enterprise account?{" "}
                <Link href="/signup" className="font-semibold text-amber-600 dark:text-[#F6C72F] hover:text-amber-700 dark:hover:text-amber-300 hover:underline transition-colors">
                  Register your site
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 w-full border-t border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c1017]/90 flex-shrink-0 transition-colors">
        <div className="max-w-[1680px] mx-auto px-4 sm:px-8 xl:px-14 py-2 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 dark:text-zinc-500 gap-1 text-center sm:text-left">
          <div>
            <span>© 2026 AyantrAI. Sitesafe Connected Industrial Infrastructure.</span>
            <span className="hidden md:inline mx-2 text-slate-300 dark:text-zinc-700">|</span>
            <span className="hidden md:inline text-slate-600 dark:text-zinc-400">Pursuing ISO 45001 & CE Certifications</span>
          </div>
          <div className="flex items-center justify-center sm:justify-end gap-3 sm:gap-4">
            <span className="font-mono text-slate-500 dark:text-zinc-500">Kanpur & Greater Noida, India</span>
            <a href="mailto:info@ayantrai.com" className="text-slate-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-[#F6C72F] transition-colors">
              info@ayantrai.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
