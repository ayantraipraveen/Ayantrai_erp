"use client";

import React from "react";
import { Layers } from "lucide-react";
import { useTemplates } from "./TemplatesContext";
import TemplatesTable from "./TemplatesTable";
import TemplatesGrid from "./TemplatesGrid";

/**
 * Main templates list container.
 * Takes ZERO props - handles empty state and switches between Table & Grid views based on context.
 */
export default function TemplatesList() {
  const { filteredTemplates, viewMode, resetFilters } = useTemplates();

  if (viewMode === "grid" && filteredTemplates.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-7">
        <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-zinc-800 bg-white/50 dark:bg-[#0c1017]/50 backdrop-blur-sm space-y-4">
          <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[#9D61FF] flex items-center justify-center mx-auto">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">No Templates Found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
              No safety report blueprints match your current filter or search criteria.
            </p>
          </div>
          <button
            type="button"
            onClick={resetFilters}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-800 dark:text-white transition-colors cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      </div>
    );
  }

  return viewMode === "table" ? (
    <TemplatesTable />
  ) : (
    <div className="px-4 sm:px-6 lg:px-7 flex-1 min-h-0 overflow-y-auto custom-scrollbar">
      <TemplatesGrid />
    </div>
  );
}
