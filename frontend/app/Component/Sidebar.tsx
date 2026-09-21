"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Users,
  Cpu,
  AlertTriangle,
  FileCheck2,
  Clock,
  Settings,
  X,
  ExternalLink,
  ShieldCheck,
  Radio,
  FileText,
  ChevronRight,
} from "lucide-react";
import Tooltip from "./Tooltip";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  badgeColor?: string;
  description?: string;
}

export interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
  currentUser?: {
    name: string;
    role: string;
    company: string;
    email: string;
  };
  onLogout?: () => void;
}

export const defaultNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Activity,
    badge: "LIVE",
    badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-500/40",
    description: "Real-time telemetry & site status",
  },
  {
    name: "Reports",
    href: "/report",
    icon: BarChart3,
    badge: "ISO 45001",
    badgeColor: "bg-amber-950 text-[#F6C72F] border-amber-500/40",
    description: "Compliance audits & telemetry logs",
  },
  {
    name: "Workers & Crews",
    href: "/dashboard#workers",
    icon: Users,
    badge: "142 Active",
    badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
    description: "Workforce presence & assignments",
  },
  {
    name: "Hardware & Kits",
    href: "/dashboard#hardware",
    icon: Cpu,
    badge: "150 Paired",
    badgeColor: "bg-zinc-800 text-zinc-300 border-zinc-700",
    description: "Smart helmet, vest & boot sensors",
  },
  {
    name: "Violation Triage",
    href: "/dashboard#alerts",
    icon: AlertTriangle,
    badge: "0 Open",
    badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-500/40",
    description: "Automated PPE alert escalations",
  },
  {
    name: "ISO 45001 Audits",
    href: "/dashboard#compliance",
    icon: FileCheck2,
    badge: "Compliant",
    badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-500/40",
    description: "Continuous digital compliance audit trails",
  },
  {
    name: "Shift Attendance",
    href: "/dashboard#attendance",
    icon: Clock,
    badge: "Day Shift",
    badgeColor: "bg-zinc-800 text-zinc-400 border-zinc-700",
    description: "Geofenced muster roll attendance",
  },
  {
    name: "Gateway & Settings",
    href: "/dashboard#settings",
    icon: Settings,
    badge: null,
    badgeColor: "",
    description: "IoT hubs, BLE mesh & credentials",
  },
];

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentUser,
}: SidebarProps) {
  const pathname = usePathname();

  // Helper to check active state
  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/report") {
      return pathname === "/report" || pathname.startsWith("/report");
    }
    return pathname.startsWith(href);
  };

  const renderNavLinks = (isMobile: boolean = false) => (
    <div className="space-y-1 py-3 px-2">
      {/* Primary Section Header */}
      {(isMobile || sidebarOpen) && (
        <div className="px-2.5 pb-1.5 pt-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider text-zinc-500 flex items-center justify-between">
          <span>Main Navigation</span>
          <span className="h-1 w-1 rounded-full bg-[#F6C72F]" />
        </div>
      )}

      {defaultNavItems.map((item) => {
        const Icon = item.icon;
        const active = isItemActive(item.href);

        const linkContent = (
          <Link
            key={item.name}
            href={item.href}
            onClick={() => {
              if (isMobile) setMobileMenuOpen(false);
            }}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all group relative ${
              active
                ? "bg-[#F6C72F]/15 border border-[#F6C72F]/50 text-white shadow-[0_0_16px_rgba(246,199,47,0.22)]"
                : "text-zinc-400 hover:text-white hover:bg-zinc-800/60 border border-transparent hover:border-zinc-800/80"
            }`}
          >
            {/* Active Left Pill Accent */}
            {active && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#F6C72F] shadow-[0_0_8px_rgba(246,199,47,0.8)]" />
            )}

            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                active ? "text-[#F6C72F]" : "text-zinc-400 group-hover:text-zinc-200"
              }`}
            />

            {(isMobile || sidebarOpen) && (
              <div className="flex-1 flex items-center justify-between overflow-hidden">
                <span className={`truncate ${active ? "font-semibold text-white" : ""}`}>
                  {item.name}
                </span>
                {item.badge && (
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-semibold ${item.badgeColor}`}
                  >
                    {item.badge}
                  </span>
                )}
              </div>
            )}
          </Link>
        );

        // When collapsed on desktop, wrap in Tooltip for accessibility
        if (!isMobile && !sidebarOpen) {
          return (
            <Tooltip key={item.name} content={item.name} position="right" variant={active ? "amber" : "default"}>
              <div>{linkContent}</div>
            </Tooltip>
          );
        }

        return linkContent;
      })}
    </div>
  );

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className={`hidden lg:flex flex-col border-r border-zinc-800/80 bg-[#0a0d13]/95 backdrop-blur-xl transition-all duration-300 ease-in-out flex-shrink-0 relative z-20 ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          {renderNavLinks(false)}
        </div>

        {/* Desktop Bottom Telemetry Widget */}
        {sidebarOpen ? (
          <div className="p-3 m-2 rounded-xl border border-zinc-800/90 bg-[#0e1219]/90 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 beacon-active" />
                Mesh Uplink:
              </span>
              <span className="text-emerald-400 font-semibold">Active (4G LTE)</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400">
              <span>Compliance Standard:</span>
              <span className="text-[#F6C72F] font-semibold">ISO 45001</span>
            </div>
            <div className="pt-1.5 border-t border-zinc-800/80 flex items-center justify-between text-[9px] text-zinc-500 font-mono">
              <span>AyantrAI ERP v2.4</span>
              <a
                href="https://www.ayantrai.com"
                target="_blank"
                rel="noreferrer"
                className="hover:text-[#F6C72F] flex items-center gap-1 transition-colors"
              >
                Docs <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
          </div>
        ) : (
          <div className="py-3 flex justify-center border-t border-zinc-800/80">
            <Tooltip content="Telemetry Mesh Active • ISO 45001" position="right" variant="emerald">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 beacon-active cursor-help" />
            </Tooltip>
          </div>
        )}
      </aside>

      {/* ================= MOBILE DRAWER OVERLAY ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-[#0a0d13] border-r border-zinc-800 p-4 flex flex-col justify-between shadow-2xl z-10 animate-fadeIn">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-zinc-800">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-[#F6C72F]/20 border border-[#F6C72F]/40 flex items-center justify-center text-[#F6C72F]">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Sitesafe ERP</div>
                    <div className="text-[9px] font-mono text-zinc-500">Navigation Hub</div>
                  </div>
                </div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg border border-zinc-800 text-zinc-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Links */}
              {renderNavLinks(true)}
            </div>

            {/* Drawer User Footer */}
            {currentUser && (
              <div className="pt-3 border-t border-zinc-800/80">
                <div className="text-xs font-semibold text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-zinc-400 truncate">{currentUser.role}</div>
                <div className="text-[9px] font-mono text-[#F6C72F] truncate mt-0.5">{currentUser.company}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
