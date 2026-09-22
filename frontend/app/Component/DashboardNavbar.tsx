"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Menu,
  MapPin,
  Bell,
  AlertTriangle,
  LogOut,
  Building,
} from "lucide-react";
import Tooltip from "./Tooltip";
import CustomDropdown, { DropdownOption } from "./CustomDropdown";
import ThemeToggle from "./ThemeToggle";

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
  /** Optional callback when selected site changes */
  onSiteChange?: (newSite: string) => void;
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

const siteOptions: DropdownOption[] = [
  {
    value: "Nx-One Tower Pilot Site (Greater Noida)",
    label: "Nx-One Tower Pilot Site",
    description: "Greater Noida • 142 Active Workers",
    badge: "PRIMARY PILOT",
    badgeColor: "bg-amber-950/80 text-[#F6C72F] border-amber-500/40",
    icon: Building,
  },
  {
    value: "Metro Line 4 Underground Tunnel (Mumbai)",
    label: "Metro Line 4 Tunnel",
    description: "Mumbai • 88 Active Workers",
    badge: "SUBTERRANEAN",
    badgeColor: "bg-sky-950/80 text-sky-400 border-sky-500/40",
    icon: Building,
  },
  {
    value: "High-Speed Rail Viaduct C-2 (Ahmedabad)",
    label: "HSR Viaduct C-2",
    description: "Ahmedabad • 215 Active Workers",
    badge: "INFRASTRUCTURE",
    badgeColor: "bg-purple-950/80 text-purple-400 border-purple-500/40",
    icon: Building,
  },
  {
    value: "Steel Plant Blast Furnace Revamp (Jamshedpur)",
    label: "Blast Furnace Revamp",
    description: "Jamshedpur • 64 Active Workers",
    badge: "HEAVY ENG",
    badgeColor: "bg-emerald-950/80 text-emerald-400 border-emerald-500/40",
    icon: Building,
  },
];

/**
 * Reusable DashboardNavbar (Command Bar) for Sitesafe ERP.
 * Features mobile/desktop sidebar triggers, interactive custom site dropdown,
 * real-time uplink indicator with tooltip, live telemetry alerts, and user profile badge.
 */
export default function DashboardNavbar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  activeSite = "Nx-One Tower Pilot Site (Greater Noida)",
  onSiteChange,
  currentUser,
  onLogout,
}: DashboardNavbarProps) {
  const [selectedSite, setSelectedSite] = useState(activeSite);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const handleSiteSelect = (site: string) => {
    setSelectedSite(site);
    if (onSiteChange) {
      onSiteChange(site);
    }
  };

  return (
    <header className="relative z-20 w-full h-16 border-b border-slate-200/90 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-md flex-shrink-0 flex items-center transition-colors">
      <div className="w-full px-4 sm:px-6 flex items-center justify-between gap-3">
        {/* Left Section: Mobile Menu Trigger + Mobile Logo + Desktop Site Selector */}
        <div className="flex items-center gap-3">
          {/* Mobile Drawer Trigger (< lg) */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Open navigation menu"
            className="lg:hidden p-1.5 rounded-lg border border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-zinc-700 transition-colors cursor-pointer"
          >
            <Menu className="w-4 h-4" />
          </button>

          {/* Mobile Brand Logo (< lg) */}
          <Link href="/dashboard" className="lg:hidden flex items-center gap-2 group">
            <div className="grid grid-cols-1 grid-rows-1 items-center h-7 w-24 flex-shrink-0">
              {/* Light Mode */}
              <Image
                src="/logo-light.png"
                alt="AyantrAI Sitesafe"
                width={100}
                height={28}
                className="col-start-1 row-start-1 object-contain logo-light-mode filter brightness-105 select-none"
                priority
              />
              {/* Dark Mode */}
              <Image
                src="/logo.png"
                alt="AyantrAI Sitesafe"
                width={100}
                height={28}
                className="col-start-1 row-start-1 object-contain logo-dark-mode filter brightness-110 drop-shadow-[0_0_12px_rgba(246,199,47,0.35)] select-none"
                priority
              />
            </div>
          </Link>
        </div>

        {/* Right: Live Connection, Theme Toggle, Alert Bell, User Profile, Logout */}
        <div className="flex items-center gap-2 sm:gap-3">

          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Alert Bell with Tooltip */}
          <div className="relative">
            <Tooltip content="Live Telemetry Safety Alerts" position="bottom" variant="amber">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 dark:hover:border-zinc-700 transition-colors cursor-pointer"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#F6C72F] animate-ping" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#F6C72F]" />
              </button>
            </Tooltip>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0f131c] p-3 shadow-2xl z-50 animate-fadeIn text-slate-800 dark:text-white">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-zinc-800">
                  <span className="text-xs font-bold text-slate-900 dark:text-white">Live Site Alerts</span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">1 Active</span>
                </div>
                <div className="py-2.5 space-y-2">
                  <div className="p-2 rounded-lg border border-amber-500/30 bg-amber-50 dark:bg-amber-950/30 text-xs">
                    <div className="font-semibold text-amber-600 dark:text-[#F6C72F] flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Zone 2 Geofence Warning
                    </div>
                    <div className="text-[10px] text-slate-600 dark:text-zinc-400 mt-0.5">
                      Worker Vikram S. entered Restricted Shaft Crane Radius (resolved in 4s).
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setNotificationsOpen(false)}
                  className="w-full py-1 text-center text-[10px] text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                >
                  Close
                </button>
              </div>
            )}
          </div>

          {/* Active Bearer Token Indicator */}
          <Tooltip content="Active Bearer Token Authenticated (sitesafe_token) • Role Permissions Verified" position="bottom">
            <div className="hidden md:flex items-center gap-1.5 px-2 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>TOKEN OK</span>
            </div>
          </Tooltip>

          {/* User Profile Badge with Reusable Tooltip */}
          <Tooltip
            content={`Signed in as ${currentUser.name} (${currentUser.email || currentUser.company || "Enterprise EHS"}) • Role: ${currentUser.role || "Operator"}`}
            position="bottom"
          >
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-zinc-800 bg-slate-100 dark:bg-[#0f131c]/90 cursor-default">
              <div className="h-7 w-7 rounded-lg bg-[#F6C72F]/20 border border-[#F6C72F]/50 flex items-center justify-center font-bold text-xs text-[#F6C72F]">
                {currentUser.name ? currentUser.name.charAt(0) : "U"}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                  {currentUser.name}
                </span>
                <span className={`text-[9px] font-mono font-bold uppercase tracking-wider px-1 py-0.2 rounded w-fit mt-0.5 border ${
                  (currentUser.role || "").toLowerCase().includes("superadmin")
                    ? "text-[#F6C72F] bg-amber-500/10 border-amber-500/30"
                    : "text-sky-400 bg-sky-500/10 border-sky-500/30"
                }`}>
                  {currentUser.role || "Operator"}
                </span>
              </div>
            </div>
          </Tooltip>

          {/* Logout Button with Reusable Tooltip */}
          <Tooltip content="Sign out of Sitesafe ERP session" position="bottom" variant="danger">
            <button
              onClick={onLogout}
              className="px-2.5 py-1.5 rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-zinc-900/80 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400 dark:hover:border-red-500/40 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
