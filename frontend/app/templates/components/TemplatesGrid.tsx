"use client";

import React from "react";
import {
  Building,
  ShieldCheck,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useTemplates } from "./TemplatesContext";

/**
 * Grid Blueprint Cards view for Templates module.
 * 100% Pure Redux - takes ZERO props.
 */
export default function TemplatesGrid() {
  const {
    paginatedTemplates,
    totalFilteredCount,
    currentPage,
    setCurrentPage,
    pageSize,
    setPageSize,
    totalPages,
    activeRole,
    setSelectedTemplate,
    setReviewModalOpen,
    setDeleteConfirmId,
  } = useTemplates();

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFilteredCount);

  return (
    <div className="space-y-4">
      {/* Grid of cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {paginatedTemplates.map((template) => (
          <div
            key={template.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white/95 dark:bg-[#0c1017]/95 hover:border-purple-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div>
              {/* Card Header: Site & Status Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1">
                  <Building className="w-3 h-3 text-[#9D61FF]" />
                  {template.site_name}
                </span>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${
                    template.status === "active"
                      ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                      : template.status === "pending"
                      ? "bg-amber-950/60 text-amber-400 border-amber-500/50 animate-pulse"
                      : template.status === "rejected"
                      ? "bg-rose-950/60 text-rose-400 border-rose-500/40"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {template.status === "pending" ? "Pending Approval" : template.status}
                </span>
              </div>

              {/* Title & Description */}
              <div className="flex items-center gap-1.5 mb-1">
                <span className="font-mono text-[9px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold border border-slate-200 dark:border-zinc-700/60">
                  {template.id}
                </span>
                <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500">
                  {template.version}
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#9D61FF] transition-colors line-clamp-2">
                {template.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1 line-clamp-2">
                {template.description}
              </p>

              {/* Modules chips */}
              <div className="mt-3 flex flex-wrap gap-1">
                {template.blocks.map((blk) => (
                  <span
                    key={blk.id}
                    className="text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60"
                  >
                    {blk.title}
                  </span>
                ))}
              </div>
            </div>

            {/* Card Footer: Metadata & Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate max-w-[140px]">
                {template.created_by}
              </span>

              <div className="flex items-center gap-2">
                {activeRole === "superadmin" && template.status === "pending" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setReviewModalOpen(true);
                    }}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-sm transition-all cursor-pointer"
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Review</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedTemplate(template);
                      setReviewModalOpen(true);
                    }}
                    className="flex items-center gap-1 text-slate-600 dark:text-zinc-400 hover:text-[#9D61FF] transition-colors cursor-pointer font-medium"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Inspect</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setDeleteConfirmId(template.id)}
                  className="p-1.5 text-slate-400 hover:text-red-500 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pinned Bottom Pagination */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-sm select-none">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-500 dark:text-zinc-400">
            Showing <strong className="text-slate-900 dark:text-white">{totalFilteredCount > 0 ? startIndex + 1 : 0}</strong> to{" "}
            <strong className="text-slate-900 dark:text-white">{endIndex}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white">{totalFilteredCount}</strong> templates
          </span>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
            <span className="text-[11px]">Rows:</span>
            {[6, 9, 18, 36].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPageSize(size)}
                className={`h-6 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  pageSize === size
                    ? "bg-[#9D61FF] text-white font-bold shadow-sm"
                    : "hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1}
            className="h-8 w-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            className="h-8 w-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center gap-1 mx-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((page) => {
                if (totalPages <= 5) return true;
                if (page === 1 || page === totalPages) return true;
                return Math.abs(page - currentPage) <= 1;
              })
              .map((page, idx, arr) => {
                const prev = arr[idx - 1];
                const showEllipsis = prev && page - prev > 1;
                return (
                  <React.Fragment key={page}>
                    {showEllipsis && (
                      <span className="px-1 text-slate-400 dark:text-zinc-600 font-mono text-xs">...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`h-8 min-w-[32px] px-2 rounded-xl text-xs font-semibold transition-all cursor-pointer flex items-center justify-center ${
                        currentPage === page
                          ? "bg-[#9D61FF] text-white shadow-[0_0_12px_rgba(157,97,255,0.4)] font-bold"
                          : "border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      {page}
                    </button>
                  </React.Fragment>
                );
              })}
          </div>

          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages}
            className="h-8 w-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
