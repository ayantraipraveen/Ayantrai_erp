"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logoutUser } from "@/lib/redux/slices/authSlice";
import DashboardNavbar from "../Component/DashboardNavbar";
import {
  ShieldCheck,
  HardHat,
  Footprints,
  Radio,
  Activity,
  Users,
  AlertTriangle,
  FileCheck2,
  Clock,
  Settings,
  LogOut,
  Bell,
  MapPin,
  ChevronDown,
  Menu,
  X,
  Sparkles,
  Wifi,
  Cpu,
  Boxes,
  ExternalLink,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSite, setActiveSite] = useState("Nx-One Tower Pilot Site (Greater Noida)");

  // Fallback demo user if accessed directly in development
  const currentUser = user || {
    id: "usr_demo",
    name: "Dr. Vikram Seth",
    role: "Safety Head / EHS",
    company: "L&T Heavy Civil Infra",
    email: "ehs.director@ayantrai-demo.com",
  };

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/signin");
  };

  const navigationItems = [
    {
      name: "Live Telemetry Hub",
      href: "/dashboard",
      icon: Activity,
      badge: "LIVE",
      badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-500/40",
    },
    {
      name: "Workers & Crews",
      href: "#workers",
      icon: Users,
      badge: "142 Active",
      badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
    },
    {
      name: "Hardware & Kits",
      href: "#hardware",
      icon: Cpu,
      badge: "150 Paired",
      badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
    },
    {
      name: "Violation Triage",
      href: "#alerts",
      icon: AlertTriangle,
      badge: "0 Open",
      badgeColor: "bg-amber-950 text-[#F6C72F] border-amber-500/40",
    },
    {
      name: "ISO 45001 Audits",
      href: "#compliance",
      icon: FileCheck2,
      badge: "Compliant",
      badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-500/40",
    },
    {
      name: "Shift Attendance",
      href: "#attendance",
      icon: Clock,
      badge: "Day Shift",
      badgeColor: "bg-zinc-800 text-zinc-400 border-zinc-700",
    },
    {
      name: "Gateway & Settings",
      href: "#settings",
      icon: Settings,
      badge: null,
      badgeColor: "",
    },
  ];

  return (
    <div className="min-h-screen w-full bg-[#080a0e] text-slate-100 flex flex-col industrial-grid relative overflow-x-hidden">
      
      {/* Dynamic Ambient Glow Lighting */}
      <div className="ambient-lighting-layer">
        <div className="amber-spotlight opacity-40" />
        <div className="cyan-rim-light opacity-30" />
      </div>

      {/* ================= TOP COMMAND BAR (REUSABLE COMPONENT) ================= */}
      <DashboardNavbar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        activeSite={activeSite}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* ================= BODY WRAPPER (SIDEBAR + CONTENT) ================= */}
      <div className="relative z-20 flex-1 flex w-full max-w-[1780px] mx-auto overflow-hidden">
        
        {/* Desktop Sidebar */}
        <aside
          className={`hidden lg:flex flex-col border-r border-zinc-800/80 bg-[#0a0d13]/90 transition-all duration-300 ease-in-out flex-shrink-0 ${
            sidebarOpen ? "w-64" : "w-16"
          }`}
        >
          {/* Navigation Links */}
          <div className="flex-1 py-4 px-2 space-y-1.5 overflow-y-auto">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                    isActive
                      ? "bg-[#F6C72F]/15 border border-[#F6C72F]/50 text-white shadow-[0_0_15px_rgba(246,199,47,0.2)]"
                      : "text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent"
                  }`}
                >
                  <Icon
                    className={`w-4 h-4 flex-shrink-0 ${
                      isActive ? "text-[#F6C72F]" : "text-zinc-400 group-hover:text-white"
                    }`}
                  />
                  {sidebarOpen && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden">
                      <span className="truncate">{item.name}</span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Sidebar Footer Info Widget */}
          {sidebarOpen && (
            <div className="p-3 m-2 rounded-xl border border-zinc-800/90 bg-[#0e1219]/90 space-y-2">
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>Telemetry Node:</span>
                <span className="text-emerald-400 font-semibold">Active Mesh</span>
              </div>
              <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
                <span>ISO 45001 Logs:</span>
                <span className="text-[#F6C72F]">Continuous</span>
              </div>
              <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
                <span>AyantrAI v2.4</span>
                <a
                  href="https://www.ayantrai.com"
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-zinc-300 flex items-center gap-1"
                >
                  Docs <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-[#0a0d13] border-r border-zinc-800 p-4 flex flex-col justify-between z-10">
              <div className="space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
                  <div className="text-xs font-mono font-bold text-[#F6C72F]">
                    SITESAFE MODULES
                  </div>
                  <button
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-1 rounded text-zinc-400 hover:text-white"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className="flex items-center justify-between px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-zinc-800/80 border border-zinc-800/60"
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon className="w-4 h-4 text-[#F6C72F]" />
                          <span>{item.name}</span>
                        </div>
                        {item.badge && (
                          <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded border ${item.badgeColor}`}>
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl border border-red-500/30 bg-red-950/30 text-red-300 flex items-center justify-center gap-2 text-xs font-semibold"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}

        {/* ================= MAIN DASHBOARD WORKSPACE ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
