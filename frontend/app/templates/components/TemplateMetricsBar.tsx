"use client";

import React from "react";
import { Layers, Clock, CheckCircle2, FileCheck2 } from "lucide-react";
import { useTemplates } from "./TemplatesContext";

/**
 * Summary KPI metrics strip for Templates module.
 * Takes ZERO props - reads directly from TemplatesContext / Redux.
 */
export default function TemplateMetricsBar() {
  const { totalCount, pendingCount, activeCount } = useTemplates();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Total Blueprints</div>
          <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{totalCount}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-[#F6C72F]">
          <Layers className="w-4 h-4" />
        </div>
      </div>

      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Pending Review</div>
          <div className="text-lg font-bold text-amber-500 mt-0.5">{pendingCount}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
          <Clock className="w-4 h-4" />
        </div>
      </div>

      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Active Templates</div>
          <div className="text-lg font-bold text-emerald-500 mt-0.5">{activeCount}</div>
        </div>
        <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="w-4 h-4" />
        </div>
      </div>

      <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0c1017]/90 backdrop-blur-md flex items-center justify-between shadow-sm">
        <div>
          <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Section Modules</div>
          <div className="text-lg font-bold text-[#F6C72F] mt-0.5">7 Core</div>
        </div>
        <div className="p-2.5 rounded-xl bg-[#F6C72F]/10 text-[#F6C72F]">
          <FileCheck2 className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
