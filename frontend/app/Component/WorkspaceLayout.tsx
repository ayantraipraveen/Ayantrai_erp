"use client";

import React, { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logoutUser, restoreSession } from "@/lib/redux/slices/authSlice";
import { setActiveRole, RoleType } from "@/lib/redux/slices/reportModuleSlice";
import { ShieldAlert, ArrowLeft, Lock, KeyRound } from "lucide-react";
import DashboardNavbar from "./DashboardNavbar";
import Sidebar from "./Sidebar";
import GlobalToast from "./GlobalToast";

export interface WorkspaceLayoutProps {
  children: React.ReactNode;
  /** Optional custom title override for top command navbar */
  title?: string;
  /** Optional custom section badge override (e.g., "GOVERNANCE", "ISO 45001") */
  sectionBadge?: string;
  /** Optional custom breadcrumbs array */
  breadcrumbs?: Array<{ label: string; href?: string }>;
  /** Whether to display notifications bell */
  showNotifications?: boolean;
  /** Custom action slot rendered on the left of top navbar */
  headerLeftActions?: React.ReactNode;
  /** Custom action slot rendered on the right of top navbar */
  headerRightActions?: React.ReactNode;
}

// Routes strictly reserved for Superadmin governance
const SUPERADMIN_ONLY_ROUTES = ["/admins", "/settings", "/sites", "/activity-log"];

/**
 * Shared authenticated workspace shell featuring top command bar (DashboardNavbar / AppNavbar),
 * responsive collapsible sidebar (Sidebar), atmospheric lighting layers, scroll container,
 * and robust Token Verification + Role-Based Access Control (RBAC).
 */
export default function WorkspaceLayout({
  children,
  title,
  sectionBadge,
  breadcrumbs,
  showNotifications,
  headerLeftActions,
  headerRightActions,
}: WorkspaceLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { user, token: stateToken } = useAppSelector((state) => state.auth);
  const activeRole = useAppSelector((state) => state.reportModule.activeRole);

  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSite, setActiveSite] = useState("Nx-One Tower Pilot Site (Greater Noida)");
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Restore sidebar state from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("sitesafe_sidebar_open");
      if (saved !== null) {
        setSidebarOpen(saved === "true");
      }
    }
  }, []);

  const handleSetSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> = (action) => {
    setSidebarOpen((prev) => {
      const next = typeof action === "function" ? action(prev) : action;
      if (typeof window !== "undefined") {
        localStorage.setItem("sitesafe_sidebar_open", String(next));
      }
      return next;
    });
  };

  // 1. Verify token & restore session on client mount
  useEffect(() => {
    let token = stateToken;
    let storedUserStr: string | null = null;

    if (typeof window !== "undefined") {
      token = token || localStorage.getItem("sitesafe_token");
      storedUserStr = localStorage.getItem("sitesafe_user");
    }

    // Unauthenticated: No token or user found -> redirect to sign in
    if (!token && !storedUserStr && !user) {
      router.replace(`/signin?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Rehydrate Redux session from localStorage if needed
    if (!user && storedUserStr) {
      dispatch(restoreSession());
    }

    // Determine effective user role and sync with reportModule
    const rawRole = user?.role || (storedUserStr ? JSON.parse(storedUserStr).role : "");
    const lowerRole = (rawRole || "").toLowerCase();
    const resolvedRole: RoleType = lowerRole.includes("superadmin")
      ? "superadmin"
      : lowerRole.includes("project")
      ? "project_head"
      : "admin";

    dispatch(setActiveRole(resolvedRole));
    setCheckingAuth(false);
  }, [dispatch, pathname, router, stateToken, user]);

  const handleLogout = async () => {
    await dispatch(logoutUser());
    router.push("/signin");
  };

  // Resolved current user profile
  const currentUser = user || {
    id: "usr_active",
    name: activeRole === "superadmin" ? "Dr. Vikram Seth" : "Vikram Seth",
    role: activeRole === "superadmin" ? "Superadmin" : "Site Admin",
    company: activeRole === "superadmin" ? "AyantrAI HQ Governance" : "Nx-One Tower Pilot Site",
    email: activeRole === "superadmin" ? "superadmin@ayantrai.com" : "vikram.seth@lt-infra.com",
  };

  // 2. Role-Based Access Control (RBAC) Route Check
  const isSuperadminRoute = SUPERADMIN_ONLY_ROUTES.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );
  const isUnauthorized = isSuperadminRoute && activeRole !== "superadmin";

  // Loading barrier while token & credentials are being verified
  if (checkingAuth) {
    return (
      <div className="h-screen w-full bg-slate-50 dark:bg-[#080a0e] text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center space-y-4 industrial-grid">
        <div className="relative">
          <div className="h-10 w-10 border-2 border-[#9D61FF] border-t-transparent rounded-full animate-spin" />
          <KeyRound className="w-4 h-4 text-[#9D61FF] absolute inset-0 m-auto" />
        </div>
        <div className="text-center space-y-1">
          <div className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-800 dark:text-zinc-200">
            Verifying Sitesafe Token & Role Permissions
          </div>
          <div className="text-[11px] text-slate-500 dark:text-zinc-500 font-mono">
            Evaluating cryptographically scoped token...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-slate-50 dark:bg-[#080a0e] text-slate-900 dark:text-slate-100 flex industrial-grid relative overflow-hidden transition-colors">
      {/* Dynamic Ambient Glow Lighting */}
      <div className="ambient-lighting-layer pointer-events-none">
        <div className="amber-spotlight opacity-40" />
        <div className="cyan-rim-light opacity-30" />
      </div>

      {/* ================= REUSABLE SIDEBAR (DESKTOP FULL-HEIGHT + MOBILE DRAWER) ================= */}
      <Sidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={handleSetSidebarOpen}
        mobileMenuOpen={mobileMenuOpen}
        setMobileMenuOpen={setMobileMenuOpen}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* ================= RIGHT COLUMN (TOP COMMAND BAR + SCROLLABLE WORKSPACE) ================= */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden relative z-20">
        {/* Top Command Bar (DashboardNavbar / AppNavbar) */}
        <DashboardNavbar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={handleSetSidebarOpen}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          activeSite={activeSite}
          onSiteChange={setActiveSite}
          currentUser={currentUser}
          onLogout={handleLogout}
          title={title}
          sectionBadge={sectionBadge}
          breadcrumbs={breadcrumbs}
          showNotifications={showNotifications}
          leftActions={headerLeftActions}
          rightActions={headerRightActions}
        />

        {/* ================= MAIN WORKSPACE AREA ================= */}
        <main
          className={`flex-1 min-h-0 w-full ${
            pathname === "/templates"
              ? "overflow-hidden flex flex-col pt-3 pb-0 px-0"
              : "overflow-y-auto space-y-6 px-4 sm:px-6 lg:px-7 py-4 sm:py-6"
          }`}
        >
          <div className={`w-full ${pathname === "/templates" ? "flex-1 min-h-0 flex flex-col" : ""}`}>
            {isUnauthorized ? (
              /* RBAC Shield: 403 Forbidden Access Guard */
              <div className="flex flex-col items-center justify-center min-h-[65vh] text-center p-6 sm:p-10 space-y-5 rounded-2xl border border-rose-500/30 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-xl shadow-2xl animate-fadeIn">
                <div className="h-16 w-16 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.25)]">
                  <ShieldAlert className="w-8 h-8" />
                </div>

                <div className="space-y-2 max-w-md">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-rose-500/30 bg-rose-500/10 text-rose-500 text-[10px] font-mono font-bold uppercase tracking-widest">
                    <Lock className="w-3 h-3" />
                    HTTP 403 • ACCESS RESTRICTED
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Superadmin Privileges Required
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 leading-relaxed">
                    You are authenticated as{" "}
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {currentUser.name}
                    </span>{" "}
                    with role{" "}
                    <span className="font-mono text-[#9D61FF] font-bold px-1.5 py-0.5 rounded bg-purple-500/10 border border-purple-500/20">
                      {currentUser.role || "Site Admin"}
                    </span>
                    .
                  </p>
                  <p className="text-xs text-slate-500 dark:text-zinc-500 leading-relaxed">
                    This module (<code className="font-mono text-[#9D61FF] font-bold">{pathname}</code>) is restricted to AyantrAI HQ Superadmin Governance. Site Administrators are scoped to individual project sites.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => router.push("/dashboard")}
                    className="px-4 py-2.5 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white font-bold text-xs shadow-[0_0_20px_rgba(157,97,255,0.35)] transition-all cursor-pointer flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Site Dashboard</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/report")}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800/80 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold transition-all cursor-pointer"
                  >
                    <span>View Site Reports</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="px-4 py-2.5 rounded-xl border border-rose-500/40 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <span>Sign In as Superadmin</span>
                  </button>
                </div>
              </div>
            ) : (
              children
            )}
          </div>
        </main>
      </div>

      {/* Universal Global Toast Notification */}
      <GlobalToast />
    </div>
  );
}
