"use client";

import React from "react";
import { Layers, Clock, CheckCircle2, FileCheck2 } from "lucide-react";
import { useTemplates } from "./TemplatesContext";

/**
 * Summary KPI metrics strip for Templates module.
 * Takes ZERO props - reads directly from TemplatesContext / Redux.
 */
export default function TemplateMetricsBar() {
  const { totalCount, pendingCount, activeCount, globalSections, setSectionsModalOpen } = useTemplates();

  const totalSectionsCount = globalSections.length;
  const customSectionsCount = globalSections.filter((s) => s.isCustom).length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
      <div className="py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md flex items-center justify-between shadow-sm hover:border-[#9D61FF]/40 hover:shadow-[0_0_20px_rgba(157,97,255,0.12)] transition-all">
        <div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400">Total Blueprints</div>
          <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
        </div>
        <div className="p-2 rounded-lg bg-purple-500/10 text-[#9D61FF] shadow-[0_0_12px_rgba(157,97,255,0.2)]">
          <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      <div className="py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md flex items-center justify-between shadow-sm hover:border-amber-500/40 hover:shadow-[0_0_20px_rgba(245,158,11,0.12)] transition-all">
        <div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400">Pending Review</div>
          <div className="text-base sm:text-lg font-bold text-amber-500 mt-0.5">{pendingCount}</div>
        </div>
        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
          <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      <div className="py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md flex items-center justify-between shadow-sm hover:border-emerald-500/40 hover:shadow-[0_0_20px_rgba(16,185,129,0.12)] transition-all">
        <div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400">Active Templates</div>
          <div className="text-base sm:text-lg font-bold text-emerald-500 mt-0.5">{activeCount}</div>
        </div>
        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
          <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>

      <div
        onClick={() => setSectionsModalOpen(true)}
        className="py-2 px-3 sm:py-2.5 sm:px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md flex items-center justify-between shadow-sm hover:border-[#9D61FF]/60 hover:shadow-[0_0_20px_rgba(157,97,255,0.18)] transition-all cursor-pointer group"
      >
        <div>
          <div className="text-[10px] sm:text-[11px] font-medium text-slate-500 dark:text-zinc-400 group-hover:text-[#9D61FF] transition-colors">
            Configured Sections
          </div>
          <div className="text-base sm:text-lg font-bold text-[#9D61FF] mt-0.5 flex items-center gap-1.5">
            <span>{totalSectionsCount} Total</span>
            {customSectionsCount > 0 && (
              <span className="text-[10px] font-mono font-medium text-amber-500">
                (+{customSectionsCount} custom)
              </span>
            )}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-purple-500/10 text-[#9D61FF] shadow-[0_0_12px_rgba(157,97,255,0.2)] group-hover:scale-110 transition-transform">
          <FileCheck2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        </div>
      </div>
    </div>
  );
}
