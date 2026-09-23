"use client";

import React from "react";
import {
  FileText,
  Building,
  ShieldCheck,
  Eye,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Tooltip } from "../../Component";
import { useTemplates } from "./TemplatesContext";

/**
 * Enterprise Table of Lists for Templates module.
 * 100% Pure Redux - takes ZERO props.
 * Features:
 * - Scroll strictly INSIDE the table (fixed/bounded container with sticky thead).
 * - Enterprise pagination pinned at the bottom with page sizes, range counter, and navigation.
 */
export default function TemplatesTable() {
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
    <div className="w-full border-y border-l border-r-0 border-slate-200 dark:border-zinc-800/90 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-xl shadow-sm flex flex-col overflow-hidden">
      {/* Scrollable table container - ONLY this container scrolls */}
      <div className="overflow-x-auto overflow-y-auto max-h-[620px] min-h-[380px] custom-scrollbar w-full">
        <table className="w-full text-left border-collapse">
          {/* Sticky Header */}
          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-[#0e1219] shadow-[0_1px_2px_rgba(0,0,0,0.06)] dark:shadow-[0_1px_2px_rgba(0,0,0,0.5)] border-b border-slate-200 dark:border-zinc-800/80 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 select-none backdrop-blur-md">
            <tr>
              <th className="py-3.5 px-6 font-semibold w-[28%] min-w-[280px]">Template & Blueprint</th>
              <th className="py-3.5 px-6 font-semibold w-[18%] min-w-[180px]">Target Site</th>
              <th className="py-3.5 px-6 font-semibold w-[22%] min-w-[220px]">Configured Modules</th>
              <th className="py-3.5 px-6 font-semibold w-[12%] min-w-[120px]">Status</th>
              <th className="py-3.5 px-6 font-semibold w-[12%] min-w-[140px]">Author / Created</th>
              <th className="py-3.5 px-6 font-semibold text-right w-[8%] min-w-[120px]">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 text-xs">
            {paginatedTemplates.map((template) => {
              const isPending = template.status === "pending";
              const isActive = template.status === "active";
              const isRejected = template.status === "rejected";

              return (
                <tr
                  key={template.id}
                  className="group hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Template & Blueprint */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-start gap-2.5">
                      <div className="p-2 rounded-xl bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="font-mono text-[10px] px-1.5 py-0.2 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold border border-slate-200 dark:border-zinc-700/60">
                            {template.id}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                            {template.version}
                          </span>
                        </div>
                        <div className="font-bold text-slate-900 dark:text-white group-hover:text-[#9D61FF] transition-colors mt-0.5 truncate">
                          {template.name}
                        </div>
                        <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1 mt-0.5">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Target Site */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Building className="w-3.5 h-3.5 text-[#9D61FF] flex-shrink-0" />
                      <span className="font-medium text-slate-800 dark:text-zinc-200 truncate">
                        {template.site_name}
                      </span>
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5">
                      {template.site_id}
                    </div>
                  </td>

                  {/* Configured Modules */}
                  <td className="py-3.5 px-6">
                    <div className="flex items-center gap-1 flex-wrap">
                      {template.blocks.slice(0, 3).map((blk) => (
                        <span
                          key={blk.id}
                          className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60 truncate max-w-[140px]"
                        >
                          {blk.title}
                        </span>
                      ))}
                      {template.blocks.length > 3 && (
                        <Tooltip
                          content={template.blocks.map((b) => b.title).join(", ")}
                          position="top"
                        >
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-700 dark:text-[#9D61FF] border border-purple-500/30 font-bold cursor-default">
                            +{template.blocks.length - 3} more
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-full border uppercase font-bold ${
                        isActive
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                          : isPending
                          ? "bg-amber-950/60 text-amber-400 border-amber-500/50"
                          : isRejected
                          ? "bg-rose-950/60 text-rose-400 border-rose-500/40"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isPending && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                      )}
                      {isActive && (
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      )}
                      <span>
                        {isPending ? "Pending Approval" : template.status}
                      </span>
                    </span>
                    {isRejected && template.rejection_reason && (
                      <div className="text-[10px] text-rose-500 dark:text-rose-400 mt-1 max-w-[160px] truncate">
                        Note: {template.rejection_reason}
                      </div>
                    )}
                  </td>

                  {/* Author / Created */}
                  <td className="py-3.5 px-6 whitespace-nowrap">
                    <div className="font-medium text-slate-800 dark:text-zinc-200">
                      {template.created_by}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5">
                      {template.created_at}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-6 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Superadmin Quick Approve */}
                      {activeRole === "superadmin" && isPending && (
                        <Tooltip content="Review and approve template" position="top">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplate(template);
                              setReviewModalOpen(true);
                            }}
                            className="h-8 px-2.5 rounded-lg bg-[#9D61FF] hover:bg-[#8B4CF0] text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Review</span>
                          </button>
                        </Tooltip>
                      )}

                      {/* Inspect Blueprint */}
                      <Tooltip content="Inspect blueprint sections" position="top">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTemplate(template);
                            setReviewModalOpen(true);
                          }}
                          className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF]/50 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-purple-500/10 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>

                      {/* Delete Blueprint */}
                      <Tooltip content="Delete template" position="top" variant="danger">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(template.id)}
                          className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-red-500/50 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center cursor-pointer shadow-sm"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </Tooltip>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pinned Pagination Bar at the bottom of the table card */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-[#0e1219]/90 px-6 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs select-none">
        {/* Left: Entries Counter & Rows Per Page */}
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-slate-500 dark:text-zinc-400">
            Showing <strong className="text-slate-900 dark:text-white">{totalFilteredCount > 0 ? startIndex + 1 : 0}</strong> to{" "}
            <strong className="text-slate-900 dark:text-white">{endIndex}</strong> of{" "}
            <strong className="text-slate-900 dark:text-white">{totalFilteredCount}</strong> templates
          </span>

          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400">
            <span className="text-[11px]">Rows:</span>
            {[5, 10, 20, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPageSize(size)}
                className={`h-6 px-2 rounded-lg text-[11px] font-medium transition-all cursor-pointer ${
                  pageSize === size
                    ? "bg-[#F6C72F] text-slate-950 font-bold shadow-sm"
                    : "hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Right: Page Navigation (First, Prev, Page Numbers, Next, Last) */}
        <div className="flex items-center gap-1">
          {/* First Page */}
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1}
            title="First Page"
            className="h-8 w-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronsLeft className="w-3.5 h-3.5" />
          </button>

          {/* Previous Page */}
          <button
            type="button"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
            title="Previous Page"
            className="h-8 w-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Page numbers */}
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

          {/* Next Page */}
          <button
            type="button"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
            title="Next Page"
            className="h-8 w-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Last Page */}
          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages}
            title="Last Page"
            className="h-8 w-8 rounded-xl border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
          >
            <ChevronsRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
