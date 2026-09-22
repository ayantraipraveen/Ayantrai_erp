"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  BarChart3,
  Users,
  FileCheck2,
  Clock,
  Settings,
  X,
  PanelLeftClose,
  PanelLeftOpen,
  Layers,
  Building2,
  Sliders,
  LogOut,
} from "lucide-react";
import { useAppSelector } from "@/lib/redux/hooks";
import Tooltip from "./Tooltip";
import { RoleType } from "@/lib/redux/slices/reportModuleSlice";

export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string | null;
  badgeColor?: string;
  description?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export interface SidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>> | ((open: boolean) => void);
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

// Exported standard nav lists for compatibility
export const superadminNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Multi-site live telemetry & KPIs",
  },
  {
    name: "Templates",
    href: "/templates",
    icon: Layers,
    description: "Template inspection & review queue",
  },
  {
    name: "Reports",
    href: "/report",
    icon: BarChart3,
    description: "Safety compliance & executive audit reports",
  },
  {
    name: "Sites",
    href: "/sites",
    icon: Building2,
    description: "Monitored sites directory & assigned leads",
  },
  {
    name: "Admins",
    href: "/admins",
    icon: Users,
    description: "Manage site-scoped admin accounts",
  },
  {
    name: "Activity Log",
    href: "/activity-log",
    icon: Clock,
    description: "Cryptographic system audit trail",
  },
  {
    name: "Settings",
    href: "/settings",
    icon: Settings,
    description: "Approval thresholds & dispatch configs",
  },
];


export const adminNavItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Site operations & telemetry summary",
  },
  {
    name: "Templates",
    href: "/templates",
    icon: Layers,
    description: "Create & submit template blocks",
  },
  {
    name: "Reports",
    href: "/report",
    icon: BarChart3,
    description: "Report history, edit & send",
  },
  {
    name: "Sites Setting",
    href: "/settings",
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
    description: "Interactive report & section commenting",
  },
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    description: "Project telemetry overview",
  },
];

export default function Sidebar({
  sidebarOpen,
  setSidebarOpen,
  mobileMenuOpen,
  setMobileMenuOpen,
  currentUser,
  onLogout,
}: SidebarProps) {
  const pathname = usePathname();
  const authUser = useAppSelector((state) => state.auth.user);
  const reduxActiveRole = useAppSelector((state) => state.reportModule.activeRole);
  const isCollapsed = !sidebarOpen;

  // Determine effective user role (prioritizing currentUser and authUser)
  const roleString = (currentUser?.role || authUser?.role || reduxActiveRole || "superadmin").toLowerCase();
  const effectiveRole: RoleType = roleString.includes("superadmin")
    ? "superadmin"
    : roleString.includes("project")
      ? "project_head"
      : "admin";

  // Standard Organized Navigation Groups for Superadmin
  const superadminGroups: NavGroup[] = [
    {
      label: "Operations",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          description: "Multi-site live telemetry & KPIs",
        },
        {
          name: "Templates",
          href: "/templates",
          icon: Layers,
          badge: "APPROVALS",
          badgeColor: "bg-amber-500/15 text-amber-700 dark:text-[#F6C72F] border-amber-500/40",
          description: "Template inspection & review queue",
        },
        {
          name: "Reports",
          href: "/report",
          icon: BarChart3,
          description: "Safety compliance & executive audit reports",
        },
      ],
    },
    {
      label: "Governance",
      items: [
        {
          name: "Sites",
          href: "/sites",
          icon: Building2,
          badge: `${0} SITES`,
          badgeColor: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/40",
          description: "Monitored sites directory & assigned leads",
        },
        {
          name: "Admins",
          href: "/admins",
          icon: Users,
          badge: `${0} ACTIVE`,
          badgeColor: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/40",
          description: "Manage site-scoped admin accounts",
        },
      ],
    },
    {
      label: "System",
      items: [
        {
          name: "Activity Log",
          href: "/activity-log",
          icon: Clock,
          badge: "AUDIT",
          badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40",
          description: "Cryptographic system audit trail",
        },
        {
          name: "Settings",
          href: "/settings",
          icon: Settings,
          badge: null,
          description: "Approval thresholds & dispatch configs",
        },
      ],
    },
  ];

  // Site Admin Groups
  const adminGroups: NavGroup[] = [
    {
      label: "Operations",
      items: [
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          badge: "SITE",
          badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40",
          description: "Site operations & telemetry summary",
        },
        {
          name: "Templates",
          href: "/templates",
          icon: Layers,
          badge: "BUILDER",
          badgeColor: "bg-amber-500/15 text-amber-700 dark:text-[#F6C72F] border-amber-500/40",
          description: "Create & submit template blocks",
        },
        {
          name: "Reports",
          href: "/report",
          icon: BarChart3,
          badge: "ISO 45001",
          badgeColor: "bg-amber-500/15 text-amber-700 dark:text-[#F6C72F] border-amber-500/40",
          description: "Report history, edit & send",
        },
      ],
    },
    {
      label: "Configuration",
      items: [
        {
          name: "Site Settings",
          href: "/settings",
          icon: Sliders,
          badge: null,
          description: "Project Head contact & PDF dispatch",
        },
      ],
    },
  ];

  // Project Head Groups
  const projectHeadGroups: NavGroup[] = [
    {
      label: "Review Portal",
      items: [
        {
          name: "Report Review",
          href: "/report",
          icon: FileCheck2,
          badge: "FEEDBACK",
          badgeColor: "bg-sky-500/15 text-sky-700 dark:text-sky-400 border-sky-500/40",
          description: "Interactive report & section commenting",
        },
        {
          name: "Dashboard",
          href: "/dashboard",
          icon: LayoutDashboard,
          badge: "OVERVIEW",
          badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/40",
          description: "Project telemetry overview",
        },
      ],
    },
  ];

  const currentGroups =
    effectiveRole === "superadmin"
      ? superadminGroups
      : effectiveRole === "admin"
        ? adminGroups
        : projectHeadGroups;

  // Active state matching helper
  const isItemActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    if (href === "/report") {
      return pathname === "/report" || pathname.startsWith("/report/");
    }
    return pathname.startsWith(href);
  };

  // Authenticated user credentials
  const userName = currentUser?.name || authUser?.name || "";
  const userRole = currentUser?.role || authUser?.role || "";
  const userCompany = currentUser?.company || authUser?.company || "";
  const userInitials =
    userName
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "SA";

  // Standard Navigation Renderer (supports grouped categories + responsive tooltips)
  const renderNavLinks = (isMobile: boolean = false) => {
    const isCollapsed = !isMobile && !sidebarOpen;

    return (
      <nav aria-label="Sidebar navigation" className="py-2 px-2 space-y-3">
        {currentGroups.map((group, groupIdx) => (
          <div key={group.label} className="space-y-1">
            {/* Section Category Label */}
            {!isCollapsed ? (
              <div className="px-3 pt-2 pb-1 text-[10px] font-mono uppercase tracking-widest text-slate-400 dark:text-zinc-500 font-bold select-none flex items-center justify-between">
                <span>{group.label}</span>
              </div>
            ) : (
              groupIdx > 0 && (
                <div className="my-2 border-t border-slate-200/80 dark:border-zinc-800/80 mx-2" />
              )
            )}

            {/* Group Items */}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isItemActive(item.href);

              const linkContent = (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => {
                    if (isMobile) setMobileMenuOpen(false);
                  }}
                  className={`relative rounded-xl text-xs font-medium transition-all group select-none flex items-center ${isCollapsed
                    ? "justify-center w-10 h-10 mx-auto"
                    : "gap-3 px-3 py-2.5 w-full"
                    } ${active
                      ? "bg-amber-500/15 border border-[#F6C72F]/50 text-slate-950 dark:text-white shadow-[0_0_16px_rgba(246,199,47,0.18)] font-semibold"
                      : "text-slate-600 dark:text-zinc-400 hover:text-amber-950 dark:hover:text-white hover:bg-amber-500/10 dark:hover:bg-[#F6C72F]/10 border border-transparent hover:border-amber-500/25 dark:hover:border-[#F6C72F]/30"
                    }`}
                >
                  {/* Active Left Pill Accent (Expanded mode) */}
                  {active && !isCollapsed && (
                    <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-[#F6C72F] shadow-[0_0_8px_rgba(246,199,47,0.8)]" />
                  )}

                  {/* Icon */}
                  <div className="relative flex-shrink-0">
                    <Icon
                      className={`w-4 h-4 transition-all duration-200 ${active
                        ? "text-amber-600 dark:text-[#F6C72F] drop-shadow-[0_0_6px_rgba(246,199,47,0.4)]"
                        : "text-slate-500 dark:text-zinc-400 group-hover:text-amber-600 dark:group-hover:text-[#F6C72F] group-hover:scale-110"
                        }`}
                    />
                  </div>

                  {/* Expanded Item Label & Badge */}
                  {!isCollapsed && (
                    <div className="flex-1 flex items-center justify-between overflow-hidden min-w-0">
                      <span
                        className={`truncate ${active
                          ? "font-bold text-slate-950 dark:text-white"
                          : ""
                          }`}
                      >
                        {item.name}
                      </span>
                      {item.badge && (
                        <span
                          className={`text-[9px] font-mono px-1.5 py-0.5 rounded border uppercase font-bold tracking-wider flex-shrink-0 ${item.badgeColor}`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );

              // Collapsed Desktop Tooltip
              if (isCollapsed) {
                return (
                  <Tooltip
                    key={item.name}
                    content={
                      item.badge
                        ? `${item.name} • ${item.badge} (${item.description || ""})`
                        : `${item.name} — ${item.description || ""}`
                    }
                    position="right"
                    variant={active ? "amber" : "default"}
                    className="w-full flex justify-center"
                  >
                    {linkContent}
                  </Tooltip>
                );
              }

              return linkContent;
            })}
          </div>
        ))}
      </nav>
    );
  };

  return (
    <>
      {/* ================= DESKTOP SIDEBAR ================= */}
      <aside
        className={`hidden lg:flex flex-col border-r border-slate-200 dark:border-zinc-800/80 bg-white/95 dark:bg-[#0a0d13]/95 backdrop-blur-xl transition-all duration-300 ease-in-out flex-shrink-0 relative z-30 h-full select-none ${sidebarOpen ? "w-64" : "w-16"
          }`}
      >
        {/* ================= DESKTOP HEADER (BRAND LOGO + EXPAND / COLLAPSE TOGGLE) ================= */}
        <div className="h-16 flex items-center border-b border-slate-200/90 dark:border-zinc-800/80 px-3.5 flex-shrink-0 overflow-hidden">
          {sidebarOpen ? (
            <div className="w-full flex items-center justify-between gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 group overflow-hidden min-w-0"
              >
                <div className="relative h-7 w-28 flex items-center flex-shrink-0">
                  <Image
                    src="/logo.png"
                    alt="AyantrAI Sitesafe"
                    width={112}
                    height={30}
                    className="w-[120px] object-contain filter brightness-110 drop-shadow-[0_0_12px_rgba(246,199,47,0.3)]"
                    priority
                  />
                </div>
              </Link>

              <Tooltip content="Collapse sidebar (Ctrl+B)" position="right">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  aria-label="Collapse sidebar"
                  className="p-1.5 rounded-lg border border-[#F6C72F]/30 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:border-[#F6C72F]/50 dark:hover:border-[#F6C72F]/50 hover:bg-amber-500/10 transition-all cursor-pointer flex-shrink-0"
                >
                  <PanelLeftClose className="w-4 h-4 text-[#F6C72F]" />
                </button>
              </Tooltip>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center justify-center">
              <Tooltip content="Expand sidebar (Ctrl+B)" position="right" variant="amber">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(true)}
                  aria-label="Expand sidebar"
                  className="group relative h-9 w-9 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 flex items-center justify-center hover:border-[#F6C72F]/50 hover:bg-amber-500/10 transition-all cursor-pointer shadow-sm hover:shadow-[0_0_12px_rgba(246,199,47,0.25)]"
                >
                  <Image
                    src="/icon.png"
                    alt="AyantrAI"
                    width={22}
                    height={22}
                    className="object-contain filter brightness-110 group-hover:scale-105 transition-transform"
                    priority
                  />
                  <span className="absolute -bottom-1 -right-1 p-1.25 rounded-full bg-amber-500 text-slate-950 shadow-sm">
                    {/* <PanelLeftOpen className="w-2.5 h-2.5" /> */}
                  </span>
                </button>
              </Tooltip>
            </div>
          )}
        </div>

        {/* ================= NAVIGATION LINKS SCROLLABLE BODY ================= */}
        <div
          className={`flex-1 custom-scrollbar ${sidebarOpen ? "overflow-y-auto" : "overflow-x-hidden overflow-y-auto"
            }`}
        >
          {renderNavLinks(false)}
        </div>
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
          <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-white dark:bg-[#0a0d13] border-r border-slate-200 dark:border-zinc-800 p-4 flex flex-col justify-between shadow-2xl z-10 animate-fadeIn select-none">
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
            <div className="pt-3 border-t border-slate-200 dark:border-zinc-800/80">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center shadow-sm flex-shrink-0">
                    {userInitials}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                      {userName}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate">
                      {userRole}{userCompany ? ` • ${userCompany}` : ""}
                    </div>
                  </div>
                </div>

                {onLogout && (
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onLogout();
                    }}
                    aria-label="Sign out"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
