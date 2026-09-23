"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Menu,
  Bell,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  LogOut,
  ChevronRight,
  Shield,
  X,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logoutUser } from "@/lib/redux/slices/authSlice";
import Tooltip from "./Tooltip";
import ThemeToggle from "./ThemeToggle";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface NavbarNotification {
  id: string;
  title: string;
  message: string;
  time?: string;
  severity?: "warning" | "danger" | "info" | "success";
  read?: boolean;
}

export interface DashboardNavbarProps {
  /** Optional custom section title (auto-detected from route if omitted) */
  title?: string;
  /** Optional custom section subtitle */
  subtitle?: string;
  /** Optional custom section badge tag (e.g., "GOVERNANCE", "ISO 45001") */
  sectionBadge?: string;
  /** Optional custom badge style override classes */
  sectionBadgeStyle?: string;
  /** Optional breadcrumbs array */
  breadcrumbs?: BreadcrumbItem[];
  /** Whether to show the section breadcrumb / title area (default: true) */
  showBreadcrumbs?: boolean;

  /** Desktop sidebar collapsed/expanded state */
  sidebarOpen?: boolean;
  /** Setter for desktop sidebar state */
  setSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
  /** Current mobile drawer open state */
  mobileMenuOpen?: boolean;
  /** Setter for mobile drawer state */
  setMobileMenuOpen?: React.Dispatch<React.SetStateAction<boolean>>;

  /** Whether to show notification bell (default: true) */
  showNotifications?: boolean;
  /** Notification alert items list */
  notifications?: NavbarNotification[];
  /** Callback when notification dismissed */
  onDismissNotification?: (id: string) => void;
  /** Callback when all notifications dismissed */
  onDismissAllNotifications?: () => void;

  /** Whether to show theme mode toggle (default: true) */
  showThemeToggle?: boolean;

  /** Whether to show user profile pill (default: true) */
  showUserProfile?: boolean;
  /** Authenticated user profile information (falls back to Redux / local storage) */
  currentUser?: {
    id?: string;
    name?: string;
    role?: string;
    company?: string;
    email?: string;
  };

  /** Whether to show logout button (default: true) */
  showLogout?: boolean;
  /** Logout callback (falls back to Redux logoutUser + redirect to /signin) */
  onLogout?: () => void | Promise<void>;

  /** Custom action slot rendered on the left (after breadcrumbs) */
  leftActions?: React.ReactNode;
  /** Custom action slot rendered on the right (before theme / profile controls) */
  rightActions?: React.ReactNode;
  /** Children rendered in flexible center area */
  children?: React.ReactNode;

  /** Additional container class names */
  className?: string;

  /** @deprecated Retained for backwards compatibility */
  activeSite?: string;
  /** @deprecated Retained for backwards compatibility */
  onSiteChange?: (newSite: string) => void;
  /** @deprecated Retained for backwards compatibility */
  showSiteSelector?: boolean;
}

/** Default active safety alerts for Sitesafe ERP */
const initialDefaultAlerts: NavbarNotification[] = [
  {
    id: "alert-1",
    title: "Zone 2 Geofence Warning",
    message: "Worker Vikram S. entered Restricted Shaft Crane Radius (automatically resolved in 4s).",
    time: "2m ago",
    severity: "warning",
  },
  {
    id: "alert-2",
    title: "PPE Sensor Anomaly Detected",
    message: "Hardhat sensor unlatched on Level 4 Excavation Zone (supervisor notified).",
    time: "11m ago",
    severity: "danger",
  },
];

/** Route registry for automatic section title & badge resolution */
interface SectionRegistryMeta {
  title: string;
  shortTitle: string;
  badge: string;
  badgeStyle: string;
}

const SECTION_REGISTRY: Record<string, SectionRegistryMeta> = {
  "/dashboard": {
    title: "Executive Dashboard",
    shortTitle: "Dashboard",
    badge: "REAL-TIME TELEMETRY",
    badgeStyle: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/30",
  },
  "/templates": {
    title: "Safety Templates",
    shortTitle: "Templates",
    badge: "GOVERNANCE",
    badgeStyle: "bg-purple-500/10 text-purple-700 dark:text-[#9D61FF] border-purple-500/30",
  },
  "/sections-and-graphs": {
    title: "Sections & Graphs Library",
    shortTitle: "Sections & Graphs",
    badge: "LIBRARY",
    badgeStyle: "bg-purple-500/10 text-purple-700 dark:text-[#9D61FF] border-purple-500/30",
  },
  "/report": {
    title: "Compliance Reports",
    shortTitle: "Reports",
    badge: "ISO 45001",
    badgeStyle: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  },
  "/reports": {
    title: "Compliance Reports",
    shortTitle: "Reports",
    badge: "ISO 45001",
    badgeStyle: "bg-sky-500/10 text-sky-700 dark:text-sky-400 border-sky-500/30",
  },
  "/sites": {
    title: "Industrial Sites",
    shortTitle: "Sites",
    badge: "INFRASTRUCTURE",
    badgeStyle: "bg-purple-500/10 text-purple-700 dark:text-purple-400 border-purple-500/30",
  },
  "/admins": {
    title: "Administrator Governance",
    shortTitle: "Admins",
    badge: "RBAC SHIELD",
    badgeStyle: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/30",
  },
  "/activity-log": {
    title: "Audit Activity Log",
    shortTitle: "Audit Log",
    badge: "AUDIT TRAIL",
    badgeStyle: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/30",
  },
  "/settings": {
    title: "System Settings",
    shortTitle: "Settings",
    badge: "CONFIGURATION",
    badgeStyle: "bg-slate-500/10 text-slate-700 dark:text-slate-400 border-slate-500/30",
  },
};

/**
 * Universal Reusable Application Navbar (Command Bar) for Sitesafe ERP.
 * Works seamlessly across all modules (/dashboard, /templates, /report, /sites, /admins, /settings, etc.)
 * Standardized with consistent 36px (h-9) controls, exact bottom alignment across all elements,
 * dynamic section breadcrumbs, alert notifications, and user profile badge.
 */
export default function DashboardNavbar({
  title,
  subtitle,
  sectionBadge,
  sectionBadgeStyle,
  breadcrumbs,
  showBreadcrumbs = true,

  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen = false,
  setMobileMenuOpen,

  showNotifications = true,
  notifications,
  onDismissNotification,
  onDismissAllNotifications,

  showThemeToggle = true,
  showUserProfile = true,
  currentUser: propUser,
  showLogout = true,
  onLogout,

  leftActions,
  rightActions,
  children,
  className = "",
}: DashboardNavbarProps) {
  const router = useRouter();
  const pathname = usePathname() || "/dashboard";
  const dispatch = useAppDispatch();
  const reduxAuthUser = useAppSelector((state) => state.auth.user);

  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [activeAlerts, setActiveAlerts] = useState<NavbarNotification[]>(
    notifications || initialDefaultAlerts
  );
  const [localMobileOpen, setLocalMobileOpen] = useState(mobileMenuOpen);
  const notificationRef = useRef<HTMLDivElement>(null);

  // Sync external notifications if passed
  useEffect(() => {
    if (notifications) {
      setActiveAlerts(notifications);
    }
  }, [notifications]);

  // Auto-detect route section metadata
  const detectedSection = useMemo(() => {
    // Find matching prefix in registry
    const matchedKey = Object.keys(SECTION_REGISTRY).find(
      (key) => pathname === key || pathname.startsWith(`${key}/`)
    );

    if (matchedKey) {
      return SECTION_REGISTRY[matchedKey];
    }

    // Dynamic formatting for custom or nested paths
    const segments = pathname.split("/").filter(Boolean);
    const firstSegment = segments[0] || "Dashboard";
    const formatted = firstSegment
      .split("-")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");

    return {
      title: formatted,
      shortTitle: formatted,
      badge: "WORKSPACE",
      badgeStyle: "bg-purple-500/10 text-purple-700 dark:text-[#9D61FF] border-purple-500/30",
    };
  }, [pathname]);

  // Effective display values (Props take precedence over route auto-detection)
  const resolvedTitle = title || detectedSection.title;
  const resolvedBadge = sectionBadge !== undefined ? sectionBadge : detectedSection.badge;
  const resolvedBadgeStyle =
    sectionBadgeStyle ||
    detectedSection.badgeStyle ||
    "bg-purple-500/10 text-purple-700 dark:text-[#9D61FF] border-purple-500/30";

  // Resolve user info gracefully
  const effectiveUser = useMemo(() => {
    if (propUser) return propUser;
    if (reduxAuthUser) return reduxAuthUser;

    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("sitesafe_user");
        if (stored) {
          return JSON.parse(stored);
        }
      } catch (e) {
        // Fall through
      }
    }

    return {
      id: "usr_active",
      name: "Dr. Vikram Seth",
      role: "Superadmin",
      company: "AyantrAI HQ Governance",
      email: "vikram.seth@ayantrai.com",
    };
  }, [propUser, reduxAuthUser]);

  const userName = effectiveUser?.name || "Dr. Vikram Seth";
  const userRole = effectiveUser?.role || "Superadmin";
  const isSuperadmin = (userRole || "").toLowerCase().includes("superadmin");
  const userInitials =
    (userName || "SA")
      .split(" ")
      .filter(Boolean)
      .map((n: string) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SA";

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

  const handleToggleMobileMenu = () => {
    if (setMobileMenuOpen) {
      setMobileMenuOpen(!mobileMenuOpen);
    } else {
      setLocalMobileOpen(!localMobileOpen);
    }
  };

  const handleLogout = async () => {
    if (onLogout) {
      await onLogout();
    } else {
      try {
        await dispatch(logoutUser()).unwrap();
      } catch (err) {
        // Safe fallback
      }
      if (typeof window !== "undefined") {
        localStorage.removeItem("sitesafe_token");
        localStorage.removeItem("sitesafe_user");
      }
      router.push("/signin");
    }
  };

  const handleDismissNotification = (id: string) => {
    setActiveAlerts((prev) => prev.filter((item) => item.id !== id));
    if (onDismissNotification) {
      onDismissNotification(id);
    }
  };

  const handleDismissAll = () => {
    setActiveAlerts([]);
    setNotificationsOpen(false);
    if (onDismissAllNotifications) {
      onDismissAllNotifications();
    }
  };

  return (
    <header
      className={`relative z-20 w-full h-16 border-b border-slate-200/90 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0b0e14]/95 backdrop-blur-md flex-shrink-0 flex items-center transition-colors select-none ${className}`}
    >
      <div className="w-full px-4 sm:px-6 lg:px-7 flex items-center justify-between gap-3">
        {/* ================= LEFT SECTION (BREADCRUMBS & ACTIONS) ================= */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          {/* Mobile Drawer Trigger (< lg) */}
          <Tooltip content="Open navigation menu" position="bottom">
            <button
              type="button"
              onClick={handleToggleMobileMenu}
              aria-label="Open navigation menu"
              className="lg:hidden h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-[#9D61FF]/50 dark:hover:border-[#9D61FF]/50 hover:bg-purple-500/10 transition-all flex items-center justify-center cursor-pointer shadow-sm flex-shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
          </Tooltip>

          {/* Mobile Brand Logo (< lg) */}
          <Link
            href="/dashboard"
            className="lg:hidden flex items-center gap-2 group flex-shrink-0 h-9"
          >
            <div className="grid grid-cols-1 grid-rows-1 items-center h-10 w-auto flex-shrink-0">
              {/* Light Mode */}
              <Image
                src="/logo-light.png"
                alt="AyantrAI Sitesafe"
                width={72}
                height={44}
                className="col-start-1 row-start-1 h-10 w-auto max-w-[80px] object-contain logo-light-mode select-none"
                priority
              />
              {/* Dark Mode */}
              <Image
                src="/logo.png"
                alt="AyantrAI Sitesafe"
                width={72}
                height={44}
                className="col-start-1 row-start-1 h-10 w-auto max-w-[80px] object-contain logo-dark-mode drop-shadow-[0_0_12px_rgba(157,97,255,0.4)] select-none"
                priority
              />
            </div>
          </Link>

          {/* Desktop Section Identity & Breadcrumbs (Standardized h-9 container) */}
          {showBreadcrumbs && (
            <div className="hidden lg:flex items-center gap-2 h-9 min-w-0">
              {breadcrumbs && breadcrumbs.length > 0 ? (
                // Custom Breadcrumbs List
                <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 min-w-0">
                  {breadcrumbs.map((crumb, idx) => {
                    const isLast = idx === breadcrumbs.length - 1;
                    return (
                      <React.Fragment key={crumb.label + idx}>
                        {idx > 0 && (
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 flex-shrink-0" />
                        )}
                        {crumb.href && !isLast ? (
                          <Link
                            href={crumb.href}
                            className="text-xs font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors truncate max-w-[140px]"
                          >
                            {crumb.label}
                          </Link>
                        ) : (
                          <span
                            className={`text-xs truncate max-w-[180px] ${
                              isLast
                                ? "font-bold text-slate-900 dark:text-white"
                                : "font-medium text-slate-500 dark:text-zinc-400"
                            }`}
                          >
                            {crumb.label}
                          </span>
                        )}
                      </React.Fragment>
                    );
                  })}
                  {resolvedBadge && (
                    <span
                      className={`text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-md border uppercase flex-shrink-0 select-none ml-1 ${resolvedBadgeStyle}`}
                    >
                      {resolvedBadge}
                    </span>
                  )}
                </nav>
              ) : (
                // Default Section Context: Sitesafe / [Section Title] [Badge]
                <div className="flex items-center gap-2 min-w-0">
                  <Link
                    href="/dashboard"
                    className="text-xs font-semibold text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0"
                  >
                    <Shield className="w-3.5 h-3.5 text-[#9D61FF]" />
                    <span>Sitesafe</span>
                  </Link>

                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 dark:text-zinc-600 flex-shrink-0" />

                  <div className="flex items-center gap-2 min-w-0">
                    <span className="text-xs font-bold text-slate-900 dark:text-white tracking-wide truncate max-w-[220px] xl:max-w-[320px]">
                      {resolvedTitle}
                    </span>
                    {resolvedBadge && (
                      <span
                        className={`text-[9px] font-mono font-bold tracking-wider px-1.5 py-0.5 rounded-md border uppercase flex-shrink-0 select-none ${resolvedBadgeStyle}`}
                      >
                        {resolvedBadge}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Optional Left Action Slot (Standardized h-9) */}
          {leftActions && (
            <div className="flex items-center gap-2 h-9 flex-shrink-0">{leftActions}</div>
          )}
        </div>

        {/* ================= CENTER / CHILDREN SLOT ================= */}
        {children && <div className="hidden md:flex items-center gap-2 h-9 flex-1 justify-center">{children}</div>}

        {/* ================= RIGHT SECTION (ALL CONTROLS STANDARDIZED TO h-9) ================= */}
        <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">
          {/* Optional Right Actions (e.g. Export, Filter, New Button) */}
          {rightActions && (
            <div className="flex items-center gap-2 h-9 flex-shrink-0">{rightActions}</div>
          )}

          {/* Theme Toggle Button (Standardized h-9 w-9) */}
          {showThemeToggle && <ThemeToggle className="h-9 w-9 flex-shrink-0" />}

          {/* Notification Alert Bell (Standardized h-9 w-9) */}
          {showNotifications && (
            <div className="relative h-9 flex items-center flex-shrink-0" ref={notificationRef}>
              <Tooltip
                content={
                  activeAlerts.length > 0
                    ? `${activeAlerts.length} Safety Alert${activeAlerts.length > 1 ? "s" : ""}`
                    : "No Unread Alerts"
                }
                position="bottom"
                variant="amber"
              >
                <button
                  type="button"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  aria-label="View safety notifications"
                  className={`group relative h-9 w-9 rounded-xl border transition-all flex items-center justify-center cursor-pointer shadow-sm flex-shrink-0 ${
                    notificationsOpen
                      ? "border-[#9D61FF] bg-purple-500/15 text-slate-900 dark:text-white shadow-[0_0_12px_rgba(157,97,255,0.25)]"
                      : "border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-[#9D61FF]/50 dark:hover:border-[#9D61FF]/50 hover:bg-purple-500/10 dark:hover:bg-[#9D61FF]/10"
                  }`}
                >
                  <Bell className="w-4 h-4 transition-transform group-hover:rotate-12" />
                  {activeAlerts.length > 0 && (
                    <>
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#9D61FF] animate-ping" />
                      <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-[#9D61FF]" />
                    </>
                  )}
                </button>
              </Tooltip>

              {/* Notification Dropdown Panel */}
              {notificationsOpen && (
                <div className="absolute right-0 top-11 w-80 sm:w-88 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0f131c]/95 backdrop-blur-2xl p-3.5 shadow-2xl z-50 animate-fadeIn text-slate-800 dark:text-white">
                  <div className="flex items-center justify-between pb-2.5 border-b border-slate-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        Safety Telemetry Alerts
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-[#9D61FF] border border-purple-500/30 font-bold">
                        {activeAlerts.length} Active
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      LIVE STREAM
                    </span>
                  </div>

                  <div className="py-2.5 space-y-2 max-h-64 overflow-y-auto pr-0.5">
                    {activeAlerts.length === 0 ? (
                      <div className="p-4 text-center text-xs text-slate-500 dark:text-zinc-400 flex flex-col items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span>All telemetry alerts acknowledged</span>
                      </div>
                    ) : (
                      activeAlerts.map((alert) => {
                        const isWarning = alert.severity === "warning";
                        const isDanger = alert.severity === "danger";
                        const isSuccess = alert.severity === "success";

                        return (
                          <div
                            key={alert.id}
                            className={`p-2.5 rounded-xl border text-xs relative group transition-colors ${
                              isDanger
                                ? "border-rose-500/30 bg-rose-500/10 dark:bg-rose-950/20"
                                : isWarning
                                ? "border-amber-500/30 bg-amber-500/10 dark:bg-amber-950/20"
                                : isSuccess
                                ? "border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-950/20"
                                : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40"
                            }`}
                          >
                            <div className="flex items-start justify-between gap-1.5">
                              <div
                                className={`font-semibold flex items-center gap-1.5 ${
                                  isDanger
                                    ? "text-rose-600 dark:text-rose-400"
                                    : isWarning
                                    ? "text-purple-700 dark:text-[#9D61FF]"
                                    : isSuccess
                                    ? "text-emerald-600 dark:text-emerald-400"
                                    : "text-slate-800 dark:text-zinc-200"
                                }`}
                              >
                                {isDanger ? (
                                  <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                                ) : isWarning ? (
                                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                                ) : (
                                  <Info className="w-3.5 h-3.5 flex-shrink-0" />
                                )}
                                <span>{alert.title}</span>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleDismissNotification(alert.id)}
                                title="Dismiss"
                                className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                            <div className="text-[11px] text-slate-600 dark:text-zinc-400 mt-1 leading-relaxed">
                              {alert.message}
                            </div>
                            {alert.time && (
                              <div className="text-[9px] font-mono text-slate-400 dark:text-zinc-500 mt-1">
                                {alert.time}
                              </div>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>

                  {activeAlerts.length > 0 && (
                    <button
                      type="button"
                      onClick={handleDismissAll}
                      className="w-full py-1.5 text-center text-[11px] font-medium text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer border-t border-slate-100 dark:border-zinc-800/80 pt-2"
                    >
                      Dismiss All Alerts
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* User Profile Badge (Standardized h-9) */}
          {showUserProfile && (
            <Tooltip content={`Signed in as ${userName}`} position="bottom">
              <div className="group flex items-center gap-2 h-9 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 hover:border-slate-300 dark:hover:border-zinc-700 transition-colors cursor-default shadow-sm select-none flex-shrink-0">
                <div className="h-6 w-6 rounded-lg bg-gradient-to-br from-[#b07dff] to-[#7938e3] text-white font-bold text-[10px] flex items-center justify-center shadow-sm flex-shrink-0">
                  {userInitials}
                </div>
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight truncate max-w-[110px] lg:max-w-[130px]">
                    {userName}
                  </span>
                  <span
                    className={`text-[8px] font-mono font-bold uppercase tracking-wider px-1 py-0.2 rounded w-fit mt-0.5 leading-none ${
                      isSuperadmin
                        ? "text-purple-700 dark:text-[#9D61FF] bg-purple-500/10"
                        : "text-sky-700 dark:text-sky-400 bg-sky-500/10"
                    }`}
                  >
                    {userRole}
                  </span>
                </div>
              </div>
            </Tooltip>
          )}

          {/* Logout Button (Standardized h-9) */}
          {showLogout && (
            <Tooltip content="Sign out" position="bottom" variant="danger">
              <button
                type="button"
                onClick={handleLogout}
                className="group h-9 px-2.5 sm:px-3 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/80 dark:bg-[#0e1219]/90 text-slate-700 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-400/80 dark:hover:border-red-500/50 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center gap-1.5 text-xs font-medium cursor-pointer shadow-sm flex-shrink-0"
              >
                <LogOut className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400 group-hover:text-red-500 transition-colors" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </Tooltip>
          )}
        </div>
      </div>
    </header>
  );
}

/** Export aliases for flexible semantic imports across ERP sections */
export const AppNavbar = DashboardNavbar;
export const CommonNavbar = DashboardNavbar;
export type AppNavbarProps = DashboardNavbarProps;
export type CommonNavbarProps = DashboardNavbarProps;
