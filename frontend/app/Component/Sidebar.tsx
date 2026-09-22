"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
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
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Building,
  Sliders,
} from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
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

export const superadminNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Activity,
    badge: "LIVE",
    badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-500/40",
    description: "System KPIs & pending approvals",
  },
  {
    name: "Templates",
    href: "/templates",
    icon: Layers,
    badge: "APPROVALS",
    badgeColor: "bg-amber-950 text-[#F6C72F] border-amber-500/40",
    description: "All templates & review queue",
  },
  {
    name: "Admins",
    href: "/admins",
    icon: Users,
    badge: "4 Active",
    badgeColor: "bg-sky-950 text-sky-400 border-sky-500/40",
    description: "Manage site-scoped admin accounts",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    badge: null,
    description: "System-wide approval & dispatch configs",
  },
  {
    name: "Sites",
    href: "/sites",
    icon: Building,
    badge: "4 Sites",
    badgeColor: "bg-purple-950 text-purple-400 border-purple-500/40",
    description: "Sites directory & assigned leads",
  },
  {
    name: "Activity Log",
    href: "/activity-log",
    icon: Clock,
    badge: "AUDIT",
    badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-500/40",
    description: "Full cryptographic audit trail",
  },
];

export const adminNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: Activity,
    badge: "SITE",
    badgeColor: "bg-emerald-950 text-emerald-400 border-emerald-500/40",
    description: "Site operations & telemetry summary",
  },
  {
    name: "Templates",
    href: "/templates",
    icon: Layers,
    badge: "BUILDER",
    badgeColor: "bg-amber-950 text-[#F6C72F] border-amber-500/40",
    description: "Create & submit template blocks",
  },
  {
    name: "Report",
    href: "/report",
    icon: BarChart3,
    badge: "ISO 45001",
    badgeColor: "bg-amber-950 text-[#F6C72F] border-amber-500/40",
    description: "Report history, edit & send to project head",
  },
  {
    name: "Sites Setting",
    href: "/sites-setting",
    icon: Sliders,
    badge: null,
    description: "Project Head contact & PDF dispatch",
  },
];

export const projectHeadNavItems: NavItem[] = [
  {
    name: "Report Review",
    href: "/report",
    icon: FileCheck2,
    badge: "FEEDBACK",
    badgeColor: "bg-sky-950 text-sky-400 border-sky-500/40",
    description: "Interactive report & section commenting",
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
  const activeRole = useAppSelector((state) => state.reportModule.activeRole);

  const navItems =
    activeRole === "superadmin"
      ? superadminNavItems
      : activeRole === "admin"
      ? adminNavItems
      : projectHeadNavItems;

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
      {navItems.map((item) => {
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
                ? "bg-amber-500/15 border border-[#F6C72F]/50 text-slate-900 dark:text-white shadow-[0_0_16px_rgba(246,199,47,0.18)]"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/60 border border-transparent hover:border-slate-200 dark:hover:border-zinc-800/80"
            }`}
          >
            {/* Active Left Pill Accent */}
            {active && (
              <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#F6C72F] shadow-[0_0_8px_rgba(246,199,47,0.8)]" />
            )}

            <Icon
              className={`w-4 h-4 flex-shrink-0 transition-colors ${
                active ? "text-[#F6C72F]" : "text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-200"
              }`}
            />

            {(isMobile || sidebarOpen) && (
              <div className="flex-1 flex items-center justify-between overflow-hidden">
                <span className={`truncate ${active ? "font-semibold text-slate-900 dark:text-white" : ""}`}>
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
        className={`hidden lg:flex flex-col border-r border-slate-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0a0d13]/95 backdrop-blur-xl transition-all duration-300 ease-in-out flex-shrink-0 relative z-30 h-full ${
          sidebarOpen ? "w-64" : "w-16"
        }`}
      >
        {/* ================= DESKTOP HEADER (BRAND LOGO + CLOSE / OPEN TOGGLE) ================= */}
        <div className="h-16 flex items-center border-b border-slate-200/90 dark:border-zinc-800/80 px-3.5 flex-shrink-0 overflow-hidden">
          {sidebarOpen ? (
            <div className="w-full flex items-center justify-between gap-2">
              <Link href="/dashboard" className="flex items-center gap-2 group overflow-hidden min-w-0">
                <div className="relative h-7 w-28 flex items-center flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt="AyantrAI Sitesafe"
                    width={112}
                    height={30}
                    className="object-contain filter brightness-110 drop-shadow-[0_0_12px_rgba(246,199,47,0.3)]"
                    priority
                  />
                </div>
                <div className="flex flex-col border-l border-slate-300 dark:border-zinc-700/80 pl-2 flex-shrink-0">
                  <span className="text-[9px] tracking-wider text-[#F6C72F] font-mono uppercase font-bold whitespace-nowrap">
                    Sitesafe
                  </span>
                  <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-medium whitespace-nowrap">
                    ERP
                  </span>
                </div>
              </Link>

              <Tooltip content="Collapse sidebar" position="right">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Collapse sidebar"
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-[#F6C72F]/50 dark:hover:border-[#F6C72F]/50 hover:bg-amber-500/10 transition-all cursor-pointer flex-shrink-0"
                >
                  <PanelLeftClose className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="w-full flex items-center justify-center">
              <Tooltip content="Expand sidebar" position="right" variant="amber">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Expand sidebar"
                  className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:text-[#F6C72F] hover:border-[#F6C72F]/50 hover:bg-amber-500/10 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(246,199,47,0.25)] flex items-center justify-center"
                >
                  <PanelLeftOpen className="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* Navigation Links Scrollable Area */}
        <div className="flex-1 overflow-y-auto">
          {renderNavLinks(false)}
        </div>

        {/* Desktop Bottom Telemetry Widget */}
        {sidebarOpen ? (
          <div className="p-3 m-2 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50 dark:bg-[#0e1219]/90 space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
              <span className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 beacon-active" />
                Mesh Uplink:
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Active (4G LTE)</span>
            </div>
            <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
              <span>Compliance Standard:</span>
              <span className="text-[#F6C72F] font-semibold">ISO 45001</span>
            </div>
            <div className="pt-1.5 border-t border-slate-200 dark:border-zinc-800/80 flex items-center justify-between text-[9px] text-slate-400 dark:text-zinc-500 font-mono">
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
          <div className="py-3 flex justify-center border-t border-slate-200 dark:border-zinc-800/80">
            <Tooltip content="Telemetry Mesh Active • ISO 45001" position="right" variant="emerald">
              <div className="h-2.5 w-2.5 rounded-full bg-emerald-500 dark:bg-emerald-400 beacon-active cursor-help" />
            </Tooltip>
          </div>
        )}
      </aside>

      {/* ================= MOBILE DRAWER OVERLAY ================= */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 dark:bg-black/80 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="fixed inset-y-0 left-0 w-72 max-w-[80vw] bg-white dark:bg-[#0a0d13] border-r border-slate-200 dark:border-zinc-800 p-4 flex flex-col justify-between shadow-2xl z-10 animate-fadeIn">
            <div>
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 mb-2 border-b border-slate-200 dark:border-zinc-800">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 group"
                >
                  <div className="relative h-7 w-28 flex items-center">
                    <Image
                      src="/logo.png"
                      alt="AyantrAI Sitesafe"
                      width={112}
                      height={30}
                      className="object-contain filter brightness-110 drop-shadow-[0_0_12px_rgba(246,199,47,0.3)]"
                      priority
                    />
                  </div>
                  <div className="flex flex-col border-l border-slate-300 dark:border-zinc-700/80 pl-2">
                    <span className="text-[9px] tracking-wider text-[#F6C72F] font-mono uppercase font-bold">
                      Sitesafe
                    </span>
                    <span className="text-[9px] text-slate-500 dark:text-zinc-400 font-medium">
                      ERP
                    </span>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close menu"
                  className="p-1.5 rounded-lg border border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Drawer Links */}
              {renderNavLinks(true)}
            </div>

            {/* Drawer User Footer */}
            {currentUser && (
              <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80">
                <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">{currentUser.name}</div>
                <div className="text-[10px] text-slate-600 dark:text-zinc-400 truncate">{currentUser.role}</div>
                <div className="text-[9px] font-mono text-[#F6C72F] truncate mt-0.5">{currentUser.company}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
