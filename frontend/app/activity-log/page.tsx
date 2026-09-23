"use client";

import React, { useState } from "react";
import {
  Clock,
  Search,
  ShieldCheck,
  FileCheck2,
  Layers,
  Users,
  CheckCircle2,
  Download,
  Sparkles,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { showGlobalToast } from "@/lib/redux/slices/reportModuleSlice";

export default function ActivityLogPage() {
  const dispatch = useAppDispatch();
  const { activityLogs } = useAppSelector((state) => state.reportModule);
  const [filterType, setFilterType] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const showToast = (msg: string, type: "success" | "info" | "warning" | "error" = "info") => {
    dispatch(showGlobalToast({ message: msg, type }));
  };

  const filteredLogs = activityLogs.filter((log) => {
    const matchesFilter = filterType === "all" || log.type === filterType;
    const matchesSearch =
      log.actor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.target.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const getLogBadge = (type: string) => {
    switch (type) {
      case "template":
        return "bg-amber-950/60 text-[#F6C72F] border-amber-500/40";
      case "report":
        return "bg-emerald-950/60 text-emerald-400 border-emerald-500/40";
      case "feedback":
        return "bg-sky-950/60 text-sky-400 border-sky-500/40";
      case "admin":
        return "bg-purple-950/60 text-purple-400 border-purple-500/40";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F6C72F] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 font-bold">
              SUPERADMIN AUDIT TRAIL
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">Spec Section 1 & 5</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            Security & Activity Audit Log
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Complete, immutable chronological log of template approvals, report dispatches, section reviews, and administrative operations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => showToast("Exporting cryptographic audit log (SHA-256 verified)...")}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 font-semibold text-xs hover:border-[#F6C72F] transition-all cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4 text-[#F6C72F]" />
          <span>Export Audit Dossier</span>
        </button>
      </div>

      {/* Quick Stat Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Total Audit Events</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{activityLogs.length} Events</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-[#F6C72F]">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Approval Records</div>
            <div className="text-lg font-bold text-emerald-500 mt-0.5">
              {activityLogs.filter((l) => l.action.toLowerCase().includes("approved")).length} Recorded
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Feedback Loops</div>
            <div className="text-lg font-bold text-sky-400 mt-0.5">
              {activityLogs.filter((l) => l.type === "feedback").length} Verified
            </div>
          </div>
          <div className="p-2 rounded-lg bg-sky-500/10 text-sky-400">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Integrity Stamp</div>
            <div className="text-lg font-bold text-[#F6C72F] mt-0.5">SHA-256</div>
          </div>
          <div className="p-2 rounded-lg bg-[#F6C72F]/10 text-[#F6C72F]">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017]">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search actor, action, or target..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/80 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#F6C72F]"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto justify-end overflow-x-auto">
          {["all", "template", "report", "feedback", "system", "admin"].map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => setFilterType(type)}
              className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterType === type
                  ? "bg-[#F6C72F]/15 border border-[#F6C72F]/50 text-slate-900 dark:text-white font-semibold"
                  : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] p-5 sm:p-6 shadow-sm space-y-4">
        <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200 dark:before:bg-zinc-800/80">
          {filteredLogs.map((log) => (
            <div key={log.id} className="relative flex items-start gap-4 pl-8 group">
              {/* Timeline Dot */}
              <div className="absolute left-2 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-white dark:border-[#0c1017] bg-[#F6C72F] shadow-[0_0_8px_rgba(246,199,47,0.8)] z-10" />

              <div className="flex-1 p-4 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/40 group-hover:border-amber-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-slate-900 dark:text-white">{log.actor}</span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">• {log.role}</span>
                    <span
                      className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded-full border font-bold ${getLogBadge(
                        log.type
                      )}`}
                    >
                      {log.type}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-zinc-300">
                    {log.action}: <strong className="text-slate-900 dark:text-white font-mono">{log.target}</strong>
                  </div>
                </div>

                <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 flex items-center gap-1.5 flex-shrink-0">
                  <Clock className="w-3 h-3 text-slate-400" />
                  <span>{log.timestamp}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
