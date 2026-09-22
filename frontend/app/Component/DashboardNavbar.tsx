"use client";

import React, { useState, useEffect, useRef } from "react";
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
 * Standardized with consistent 36px (h-9) controls, active site selector,
 * real-time telemetry mesh indicator, alert notifications, and user profile badge.
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
  const notificationRef = useRef<HTMLDivElement>(null);

  // Sync external activeSite prop updates
  useEffect(() => {
    if (activeSite) {
      setSelectedSite(activeSite);
    }
  }, [activeSite]);

  // Click-outside listener for safety notifications dropdown
  useEffect(() => {
    if (!notificationsOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [notificationsOpen]);

  const handleSiteSelect = (site: string) => {
    setSelectedSite(site);
    if (onSiteChange) {
      onSiteChange(site);
    }
  };

  const userName = currentUser?.name || "Dr. Vikram Seth";
  const userRole = currentUser?.role || "Superadmin";
  const isSuperadmin = (userRole || "").toLowerCase().includes("superadmin");
  const userInitials =
    (currentUser?.name || "SA")
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SA";

  return (
    <header className="relative z-20 w-full h-16 border-b border-slate-200/90 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-md flex-shrink-0 flex items-center transition-colors select-none">
      <div className="w-full px-4 sm:px-6 lg:px-7 flex items-center justify-between gap-3">
        {/* ================= LEFT SECTION ================= */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Mobile Drawer Trigger (< lg) */}
          <Tooltip content="Open navigation menu" position="bottom">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Open navigation menu"
              className="lg:hidden h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-[#F6C72F]/50 dark:hover:border-[#F6C72F]/50 hover:bg-amber-500/10 transition-all flex items-center justify-center cursor-pointer shadow-sm flex-shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* Mobile Brand Logo (< lg) */}
          <Link href="/dashboard" className="lg:hidden flex items-center gap-2 group flex-shrink-0 h-9">
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

          {/* Desktop Active Site Selector */}
          <div className="hidden lg:flex items-center gap-2.5 h-9">
            <div className="w-56 lg:w-64 xl:w-72 h-9">
              <CustomDropdown
                options={siteOptions}
                value={selectedSite}
                onChange={handleSiteSelect}
                icon={MapPin}
                size="sm"
                placeholder="Select active site..."
                className="h-9"
              />
            </div>

            {/* Real-time Telemetry Mesh Status Indicator */}
            <div className="hidden xl:flex items-center gap-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 text-[10px] font-mono text-slate-500 dark:text-zinc-400 select-none shadow-sm h-9 flex-shrink-0">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span className="font-semibold text-slate-700 dark:text-zinc-300">MESH ACTIVE</span>
              <span className="text-slate-400 dark:text-zinc-600">•</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">100%</span>
            </div>
          </div>
        </div>

        {/* ================= RIGHT SECTION (ALL CONTROLS STANDARDIZED TO h-9) ================= */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">

          {/* Theme Toggle Button (Standardized h-9 w-9) */}
          <ThemeToggle className="h-9 w-9 flex-shrink-0" />

          {/* Notification Alert Bell (Standardized h-9 w-9) */}
          <div className="relative h-9 flex items-center flex-shrink-0" ref={notificationRef}>
            <Tooltip content="Live Telemetry Safety Alerts" position="bottom" variant="amber">
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                aria-label="View safety notifications"
                className={`group relative h-9 w-9 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm flex-shrink-0 ${
                  notificationsOpen
                    ? "border-[#F6C72F] bg-amber-500/15 text-slate-900 dark:text-white shadow-[0_0_12px_rgba(246,199,47,0.25)]"
                    : "border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-[#F6C72F]/50 dark:hover:border-[#F6C72F]/50 hover:bg-amber-500/10 dark:hover:bg-[#F6C72F]/10"
                }`}
              >
                <Bell className="w-4 h-4 transition-transform group-hover:rotate-12" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F6C72F] animate-ping" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#F6C72F]" />
              </button>
            </Tooltip>

            {/* Notification Dropdown Panel */}
            {notificationsOpen && (
              <div className="absolute right-0 top-11 w-80 sm:w-88 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0f131c]/95 backdrop-blur-2xl p-3.5 shadow-2xl z-50 animate-fadeIn text-slate-800 dark:text-white">
                <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Safety Telemetry Alerts</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-700 dark:text-[#F6C72F] border border-amber-500/30 font-bold">
                      1 Active
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    LIVE STREAM
                  </span>
                </div>
                <div className="py-2.5 space-y-2">
                  <div className="p-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20 text-xs">
                    <div className="font-semibold text-amber-700 dark:text-[#F6C72F] flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Zone 2 Geofence Warning</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                      Worker Vikram S. entered Restricted Shaft Crane Radius (automatically resolved in 4s).
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(false)}
                  className="w-full py-1.5 text-center text-[11px] font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-t border-slate-100 dark:border-zinc-800/80 pt-2"
                >
                  Dismiss Alerts
                </button>
              </div>
            )}
          </div>

         

          {/* User Profile Badge (Standardized h-9) */}
          <Tooltip
            content={`Signed in as ${userName} (${currentUser.email || currentUser.company || "Enterprise EHS"}) • Role: ${userRole}`}
            position="bottom"
          >
            <div className="group flex items-center gap-2 h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-default shadow-sm select-none flex-shrink-0">
              <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold text-[10px] flex items-center justify-center shadow-sm flex-shrink-0">
                {userInitials}
              </div>
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[110px] lg:max-w-[130px]">
                  {userName}
                </span>
                <span className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1 py-0.2 rounded w-fit mt-0.5 border leading-none ${
                  isSuperadmin
                    ? "text-amber-700 dark:text-[#F6C72F] bg-amber-500/10 border-amber-500/30"
                    : "text-sky-700 dark:text-sky-400 bg-sky-500/10 border-sky-500/30"
                }`}>
                  {userRole}
                </span>
              </div>
            </div>
          </Tooltip>

          {/* Logout Button (Standardized h-9) */}
          <Tooltip content="Sign out of Sitesafe ERP session" position="bottom" variant="danger">
            <button
              type="button"
              onClick={onLogout}
              className="group h-9 px-2.5 sm:px-3 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400/80 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-sm flex-shrink-0"
            >
              <LogOut className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 group-hover:text-red-500 transition-colors" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          </Tooltip>
        </div>
      </div>
    </header>
  );
}
