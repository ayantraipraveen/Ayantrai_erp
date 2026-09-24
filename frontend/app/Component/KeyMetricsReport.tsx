"use client";

import React from "react";
import {
  Users,
  ShieldCheck,
  Package,
  AlertTriangle,
  Clock,
  UserCog,
  Settings,
  History,
  CalendarDays,
  Building2,
} from "lucide-react";

// Triangle caret icons for trends
const CaretUp = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="1em" height="1em">
    <path d="M12 4l-8 12h16z" />
  </svg>
);

const CaretDown = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="1em" height="1em">
    <path d="M12 20l8-12H4z" />
  </svg>
);

const Dash = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} width="1em" height="1em">
    <path d="M5 11h14v2H5z" />
  </svg>
);

export default function KeyMetricsReport() {
  return (
    <div className="w-full bg-white dark:bg-[#0c1017] p-8 sm:p-10 rounded-[2rem] font-sans">
      {/* Header Section */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center mb-10 gap-6">
        <div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#1a2b4b] dark:text-white tracking-tight flex flex-wrap items-center gap-x-3 gap-y-1 mb-2">
            Key Metrics <span className="text-[#3b82f6]">This Month</span>
          </h1>
          <p className="text-slate-500 dark:text-zinc-400 text-lg">
            A snapshot of your site's safety, compliance and device performance.
          </p>
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-3 bg-blue-50/50 dark:bg-blue-900/10 px-5 py-3 rounded-2xl text-[#1a2b4b] dark:text-blue-100 border border-blue-100 dark:border-blue-900/30">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-sm tracking-wide">ABC Infrastructure Project</span>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-zinc-800/30 px-5 py-3 rounded-2xl text-[#1a2b4b] dark:text-zinc-300 border border-slate-100 dark:border-zinc-800/80">
            <CalendarDays className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-zinc-500 tracking-wider">
                Reporting Period
              </span>
              <span className="font-bold text-sm">01 Sept 2025 - 30 Sept 2025</span>
            </div>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {/* Card 1: Monthly Attendance Rate */}
        <div className="bg-[#f0f7ff] dark:bg-blue-900/10 p-6 rounded-3xl flex flex-col justify-between min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-[#dbeafe] dark:bg-blue-900/40 flex items-center justify-center mb-6">
            <Users className="w-6 h-6 text-[#1d4ed8] dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#1e293b] dark:text-slate-300 mb-1.5">
              Monthly Attendance Rate
            </h3>
            <div className="text-[34px] font-extrabold text-[#0f172a] dark:text-white mb-2 leading-tight">
              92.4%
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <CaretUp className="w-3.5 h-3.5 text-[#16a34a]" />
              <span className="text-[#16a34a] font-bold">+2.1%</span>
              <span className="text-[#64748b] dark:text-slate-400">vs. last month</span>
            </div>
          </div>
        </div>

        {/* Card 2: Monthly Compliance Rate */}
        <div className="bg-[#f0fdf4] dark:bg-emerald-900/10 p-6 rounded-3xl flex flex-col justify-between min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-[#dcfce7] dark:bg-emerald-900/40 flex items-center justify-center mb-6">
            <ShieldCheck className="w-6 h-6 text-[#15803d] dark:text-emerald-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#1e293b] dark:text-slate-300 mb-1.5">
              Monthly Compliance Rate
            </h3>
            <div className="text-[34px] font-extrabold text-[#0f172a] dark:text-white mb-2 leading-tight">
              96.8%
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <CaretUp className="w-3.5 h-3.5 text-[#16a34a]" />
              <span className="text-[#16a34a] font-bold">+3.6%</span>
              <span className="text-[#64748b] dark:text-slate-400">vs. last month</span>
            </div>
          </div>
        </div>

        {/* Card 3: Total Devices Sent to Site */}
        <div className="bg-[#f5f3ff] dark:bg-indigo-900/10 p-6 rounded-3xl flex flex-col justify-between min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-[#ede9fe] dark:bg-indigo-900/40 flex items-center justify-center mb-6">
            <Package className="w-6 h-6 text-[#4338ca] dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#1e293b] dark:text-slate-300 mb-1.5">
              Total Devices Sent to Site
            </h3>
            <div className="text-[34px] font-extrabold text-[#0f172a] dark:text-white mb-2 leading-tight">
              300
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <Dash className="w-4 h-4 text-[#64748b]" />
              <span className="text-[#334155] dark:text-slate-300 font-bold">No change</span>
              <span className="text-[#64748b] dark:text-slate-400">vs. last month</span>
            </div>
          </div>
        </div>

        {/* Card 4: Damaged Devices This Month */}
        <div className="bg-[#fef2f2] dark:bg-red-900/10 p-6 rounded-3xl flex flex-col justify-between min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-[#fee2e2] dark:bg-red-900/40 flex items-center justify-center mb-6">
            <AlertTriangle className="w-6 h-6 text-[#b91c1c] dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#1e293b] dark:text-slate-300 mb-1.5">
              Damaged Devices This Month
            </h3>
            <div className="text-[34px] font-extrabold text-[#0f172a] dark:text-white mb-2 leading-tight">
              5
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <CaretUp className="w-3.5 h-3.5 text-[#dc2626]" />
              <span className="text-[#dc2626] font-bold">+2</span>
              <span className="text-[#64748b] dark:text-slate-400">vs. last month</span>
            </div>
          </div>
        </div>

        {/* Card 5: Risk-Free Working Hours */}
        <div className="bg-[#ecfdf5] dark:bg-green-900/10 p-6 rounded-3xl flex flex-col justify-between min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-[#d1fae5] dark:bg-green-900/40 flex items-center justify-center mb-6">
            <Clock className="w-6 h-6 text-[#047857] dark:text-green-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#1e293b] dark:text-slate-300 mb-1.5">
              Risk-Free Working Hours
            </h3>
            <div className="text-[34px] font-extrabold text-[#0f172a] dark:text-white mb-2 leading-tight">
              18,450 <span className="text-xl font-bold">hrs</span>
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <CaretUp className="w-3.5 h-3.5 text-[#16a34a]" />
              <span className="text-[#16a34a] font-bold">+12%</span>
              <span className="text-[#64748b] dark:text-slate-400">vs. last month</span>
            </div>
          </div>
        </div>

        {/* Card 6: Monthly Supervisory Efficiency */}
        <div className="bg-[#fffbeb] dark:bg-amber-900/10 p-6 rounded-3xl flex flex-col justify-between min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-[#fef3c7] dark:bg-amber-900/40 flex items-center justify-center mb-6">
            <UserCog className="w-6 h-6 text-[#b45309] dark:text-amber-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#1e293b] dark:text-slate-300 mb-1.5">
              Monthly Supervisory Efficiency
            </h3>
            <div className="text-[34px] font-extrabold text-[#0f172a] dark:text-white mb-2 leading-tight">
              89.2%
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <CaretUp className="w-3.5 h-3.5 text-[#16a34a]" />
              <span className="text-[#16a34a] font-bold">+4.5%</span>
              <span className="text-[#64748b] dark:text-slate-400">vs. last month</span>
            </div>
          </div>
        </div>

        {/* Card 7: Total Runtime of Devices */}
        <div className="bg-[#eff6ff] dark:bg-blue-900/10 p-6 rounded-3xl flex flex-col justify-between min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-[#dbeafe] dark:bg-blue-900/40 flex items-center justify-center mb-6">
            <Settings className="w-6 h-6 text-[#1d4ed8] dark:text-blue-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#1e293b] dark:text-slate-300 mb-1.5">
              Total Runtime of Devices
            </h3>
            <div className="text-[34px] font-extrabold text-[#0f172a] dark:text-white mb-2 leading-tight">
              26,340 <span className="text-xl font-bold">hrs</span>
            </div>
            <div className="flex items-center gap-2 text-[13px]">
              <CaretUp className="w-3.5 h-3.5 text-[#16a34a]" />
              <span className="text-[#16a34a] font-bold">+8%</span>
              <span className="text-[#64748b] dark:text-slate-400">vs. last month</span>
            </div>
          </div>
        </div>

        {/* Card 8: Overtime of Devices */}
        <div className="bg-[#faf5ff] dark:bg-purple-900/10 p-6 rounded-3xl flex flex-col justify-between min-h-[220px]">
          <div className="w-12 h-12 rounded-full bg-[#f3e8ff] dark:bg-purple-900/40 flex items-center justify-center mb-6">
            <History className="w-6 h-6 text-[#7e22ce] dark:text-purple-400" />
          </div>
          <div>
            <h3 className="text-[13px] font-bold text-[#1e293b] dark:text-slate-300 mb-1.5">
              Overtime of Devices
            </h3>
            <div className="text-[34px] font-extrabold text-[#0f172a] dark:text-white mb-2 leading-tight">
              320 <span className="text-xl font-bold">hrs</span>
            </div>
            <div className="flex flex-col gap-0.5">
              <div className="flex items-center gap-2 text-[13px]">
                <CaretDown className="w-3.5 h-3.5 text-[#16a34a]" />
                <span className="text-[#16a34a] font-bold">-28%</span>
                <span className="text-[#64748b] dark:text-slate-400">vs. last month</span>
              </div>
              <div className="text-[11px] text-[#94a3b8] dark:text-slate-500 font-medium pl-[22px]">
                (Lower is better)
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
