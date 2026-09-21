"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  MapPin,
  ChevronDown,
  Bell,
  AlertTriangle,
  LogOut,
} from "lucide-react";

export interface DashboardNavbarProps {
  /** Current desktop sidebar collapsed/expanded state */
  sidebarOpen: boolean;
  /** Setter for desktop sidebar state */
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Current mobile drawer open state */
  mobileMenuOpen: boolean;
  /** Setter for mobile drawer state */
  setMobileMenuOpen: React.Dispatch<React.SetStateAction<boolean>>;
  /** Currently active industrial site name */
  activeSite?: string;
  /** Authenticated user profile information */
  currentUser: {
    id?: string;
    name: string;
    role?: string;
    company?: string;
    email?: string;
  };
  /** Logout callback */
  onLogout: () => void | Promise<void>;
}

/**
 * Reusable DashboardNavbar (Command Bar) for Sitesafe ERP.
 * Features mobile/desktop sidebar triggers, active site switcher, real-time uplink indicator,
 * live telemetry alert dropdown, user profile badge, and Redux session signout.
 */
export default function DashboardNavbar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  activeSite = "Nx-One Tower Pilot Site (Greater Noida)",
  currentUser,
  onLogout,
}: DashboardNavbarProps) {
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  return (
    <header className="relative z-30 w-full border-b border-zinc-800/80 bg-[#0b0e14]/95 backdrop-blur-md flex-shrink-0 sticky top-0">
      <div className="max-w-[1780px] mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3">
        {/* Left: Brand Logo & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              if (typeof window !== "undefined" && window.innerWidth < 1024) {
                setMobileMenuOpen(!mobileMenuOpen);
              } else {
                setSidebarOpen(!sidebarOpen);
              }
            }}
            className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900/80 text-zinc-400 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
            title="Toggle Navigation"
          >
            <Menu className="w-4 h-4" />
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5 sm:gap-3 group">
            <div className="relative h-7 sm:h-8 w-28 sm:w-32 flex items-center">
              <Image
                src="/logo.png"
                alt="AyantrAI Sitesafe"
                width={140}
                height={38}
                className="object-contain filter brightness-110 drop-shadow-[0_0_14px_rgba(246,199,47,0.35)]"
                priority
              />
            </div>
            <div className="hidden sm:flex flex-col border-l border-zinc-700/80 pl-2.5">
              <span className="text-[10px] tracking-widest text-[#F6C72F] font-mono uppercase font-bold drop-shadow-[0_0_8px_rgba(246,199,47,0.4)]">
                Sitesafe ERP
              </span>
              <span className="text-[11px] text-zinc-400 font-medium">Enterprise Telemetry</span>
            </div>
          </Link>

          {/* Active Site Selector */}
          <div className="hidden md:flex items-center gap-2 ml-3 px-3 py-1.5 rounded-xl border border-zinc-800/90 bg-[#0e1219]/90 text-xs">
            <MapPin className="w-3.5 h-3.5 text-[#F6C72F] flex-shrink-0" />
            <span className="font-mono text-zinc-300 truncate max-w-[240px] xl:max-w-none">
              {activeSite}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-500" />
          </div>
        </div>

        {/* Right: Live Connection, Alert Bell, User Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-3.5">
          {/* Live Gateway Pill */}
          <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg border border-emerald-500/30 bg-emerald-950/40 text-[11px] font-mono text-emerald-300">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>4G LTE-M Uplink Live</span>
          </div>

          {/* Alert Bell */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="relative p-2 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#F6C72F] animate-ping" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#F6C72F]" />
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-zinc-800 bg-[#0f131c] p-3 shadow-2xl z-50 animate-fadeIn">
                <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                  <span className="text-xs font-bold text-white">Live Site Alerts</span>
                  <span className="text-[10px] font-mono text-emerald-400">1 Active</span>
                </div>
                <div className="py-2.5 space-y-2">
                  <div className="p-2 rounded-lg border border-amber-500/30 bg-amber-950/30 text-xs">
                    <div className="font-semibold text-[#F6C72F] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Zone 2 Geofence Warning
                    </div>
                    <div className="text-[10px] text-zinc-400 mt-0.5">
                      Worker Vikram S. entered Restricted Shaft Crane Radius (resolved in 4s).
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="w-full py-1 text-center text-[10px] text-zinc-400 hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* User Profile Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl border border-zinc-800 bg-[#0f131c]/90">
            <div className="h-7 w-7 rounded-lg bg-[#F6C72F]/20 border border-[#F6C72F]/50 flex items-center justify-center font-bold text-xs text-[#F6C72F]">
              {currentUser.name ? currentUser.name.charAt(0) : "U"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">
                {currentUser.name}
              </span>
              <span className="text-[10px] font-mono text-zinc-400 leading-none">
                {currentUser.role || "Operator"}
              </span>
            </div>
          </div>

          {/* Logout Button */}
          <button
            onClick={onLogout}
            className="px-2.5 py-1.5 rounded-xl border border-zinc-800 bg-zinc-900/80 text-zinc-300 hover:text-red-400 hover:border-red-500/40 hover:bg-red-950/20 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            title="Sign Out from Sitesafe"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
