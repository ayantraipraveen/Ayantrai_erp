"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { logoutUser } from "@/lib/redux/slices/authSlice";
import DashboardNavbar from "./DashboardNavbar";
import Sidebar from "./Sidebar";

export interface WorkspaceLayoutProps {
  children: React.ReactNode;
}

/**
 * Shared authenticated workspace shell featuring top command bar (DashboardNavbar),
 * responsive collapsible sidebar (Sidebar), atmospheric lighting layers, and scroll container.
 * Used for /dashboard, /report, and future top-level authenticated workspace routes.
 */
export default function WorkspaceLayout({ children }: WorkspaceLayoutProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);

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
        {/* Reusable Modular Sidebar (Desktop Collapsible + Mobile Drawer) */}
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
          currentUser={currentUser}
          onLogout={handleLogout}
        />

        {/* ================= MAIN WORKSPACE AREA ================= */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-7 space-y-6">
          {children}
        </main>
      </div>
    </div>
  );
}
