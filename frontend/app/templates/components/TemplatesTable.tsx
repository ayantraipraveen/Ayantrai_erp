"use client";

import React from "react";
import {
  FileText,
  Building,
  ShieldCheck,
  Eye,
  Edit3,
  Copy,
  Trash2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { Tooltip } from "../../Component";
import { useTemplates } from "./TemplatesContext";

/**
 * Enterprise Table — all columns fit in viewport frame.
 * Uses table-fixed + truncate + Tooltip for overflow content.
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
    setEditingTemplate,
    handleDuplicate,
    setReviewModalOpen,
    setDeleteConfirmId,
  } = useTemplates();

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFilteredCount);

  return (
    <div className="w-full flex-1 min-h-0 border-y border-l border-r-0 border-slate-200 dark:border-zinc-800/90 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-xl shadow-sm flex flex-col overflow-hidden">
      {/* Scrollable tbody only */}
      <div className="overflow-x-hidden overflow-y-auto flex-1 min-h-0 custom-scrollbar w-full">
        <table className="w-full text-left border-collapse table-fixed">

          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-[#0e1219] border-b border-slate-200 dark:border-zinc-800/80 text-[10px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 select-none">
            <tr>
              <th className="py-2 px-3 font-semibold w-[25%]">Template &amp; Blueprint</th>
              <th className="py-2 px-3 font-semibold w-[16%]">Target Site</th>
              <th className="py-2 px-3 font-semibold w-[18%]">Configured Modules</th>
              <th className="py-2 px-3 font-semibold w-[13%]">Status</th>
              <th className="py-2 px-3 font-semibold w-[18%]">Author / Created</th>
              <th className="py-2 px-3 font-semibold w-[10%] text-right">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {paginatedTemplates.map((template) => {
              const isPending  = template.status === "pending";
              const isActive   = template.status === "active";
              const isRejected = template.status === "rejected";

              return (
                <tr
                  key={template.id}
                  className="group hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                >
                  {/* Template & Blueprint */}
                  <td className="py-2 px-3 overflow-hidden">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 flex-shrink-0 mt-0.5">
                        <FileText className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-1 mb-0.5">
                          <span className="font-mono text-[10px] px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 font-bold border border-slate-200 dark:border-zinc-700/60 flex-shrink-0">
                            {template.id}
                          </span>
                          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                            {template.version}
                          </span>
                        </div>
                        <Tooltip content={template.name} position="top">
                          <div className="font-semibold text-[11px] text-slate-900 dark:text-white group-hover:text-[#9D61FF] transition-colors truncate cursor-default">
                            {template.name}
                          </div>
                        </Tooltip>
                        <Tooltip content={template.description} position="bottom">
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate cursor-default">
                            {template.description}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </td>

                  {/* Target Site */}
                  <td className="py-2 px-3 overflow-hidden">
                    <Tooltip content={template.site_name} position="top">
                      <div className="flex items-center gap-1 min-w-0 cursor-default">
                        <Building className="w-3 h-3 text-[#9D61FF] flex-shrink-0" />
                        <span className="font-medium text-[11px] text-slate-800 dark:text-zinc-200 truncate">
                          {template.site_name}
                        </span>
                      </div>
                    </Tooltip>
                    <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
                      {template.site_id}
                    </div>
                  </td>

                  {/* Configured Modules */}
                  <td className="py-2 px-3 overflow-hidden">
                    <div className="flex flex-wrap gap-1">
                      {template.blocks.slice(0, 2).map((blk) => (
                        <Tooltip key={blk.id} content={blk.title} position="top">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60 truncate max-w-[90px] cursor-default">
                            {blk.title}
                          </span>
                        </Tooltip>
                      ))}
                      {template.blocks.length > 2 && (
                        <Tooltip
                          content={template.blocks.slice(2).map((b) => b.title).join(", ")}
                          position="top"
                        >
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-700 dark:text-[#9D61FF] border border-purple-500/30 font-bold cursor-default">
                            +{template.blocks.length - 2}
                          </span>
                        </Tooltip>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-2 px-3 overflow-hidden">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold whitespace-nowrap ${
                        isActive
                          ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                          : isPending
                          ? "bg-amber-950/60 text-amber-400 border-amber-500/50"
                          : isRejected
                          ? "bg-rose-950/60 text-rose-400 border-rose-500/40"
                          : "bg-slate-800 text-slate-300 border-slate-700"
                      }`}
                    >
                      {isPending && <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping flex-shrink-0" />}
                      {isActive  && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 flex-shrink-0" />}
                      <span className="truncate">
                        {isPending ? "Pending" : template.status}
                      </span>
                    </span>
                    {isRejected && template.rejection_reason && (
                      <Tooltip content={template.rejection_reason} position="bottom">
                        <div className="text-[10px] text-rose-500 dark:text-rose-400 mt-0.5 truncate cursor-default">
                          {template.rejection_reason}
                        </div>
                      </Tooltip>
                    )}
                  </td>

                  {/* Author / Created */}
                  <td className="py-2 px-3 overflow-hidden">
                    <Tooltip content={template.created_by} position="top">
                      <div className="font-medium text-[11px] text-slate-800 dark:text-zinc-200 truncate cursor-default">
                        {template.created_by}
                      </div>
                    </Tooltip>
                    <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
                      {template.created_at}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-2 px-3">
                    <div className="flex items-center justify-end gap-1">
                      {activeRole === "superadmin" && isPending && (
                        <Tooltip content="Review and approve" position="top">
                          <button
                            type="button"
                            onClick={() => { setSelectedTemplate(template); setReviewModalOpen(true); }}
                            className="h-6 px-1.5 rounded-md bg-[#9D61FF] hover:bg-[#8B4CF0] text-white font-bold text-[10px] flex items-center gap-0.5 transition-all cursor-pointer whitespace-nowrap"
                          >
                            <ShieldCheck className="w-3 h-3" />
                            <span>Review</span>
                          </button>
                        </Tooltip>
                      )}
                      <Tooltip content="Inspect blueprint" position="top">
                        <button
                          type="button"
                          onClick={() => { setSelectedTemplate(template); setReviewModalOpen(true); }}
                          className="h-6 w-6 rounded-md border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF]/50 text-slate-500 dark:text-zinc-400 hover:text-[#9D61FF] hover:bg-purple-500/10 transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Eye className="w-3 h-3" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Edit template" position="top">
                        <button
                          type="button"
                          onClick={() => setEditingTemplate(template)}
                          className="h-6 w-6 rounded-md border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF]/50 text-slate-500 dark:text-zinc-400 hover:text-[#9D61FF] hover:bg-purple-500/10 transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Edit3 className="w-3 h-3" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Duplicate template" position="top">
                        <button
                          type="button"
                          onClick={() => handleDuplicate(template.id)}
                          className="h-6 w-6 rounded-md border border-slate-200 dark:border-zinc-800 hover:border-blue-500/50 text-slate-500 dark:text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </Tooltip>
                      <Tooltip content="Delete template" position="top" variant="danger">
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(template.id)}
                          className="h-6 w-6 rounded-md border border-slate-200 dark:border-zinc-800 hover:border-red-500/50 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all flex items-center justify-center cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
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

      {/* Pinned Pagination */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-[#0e1219]/90 px-4 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs select-none">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-slate-500 dark:text-zinc-400 text-[11px]">
            Showing{" "}
            <strong className="text-slate-900 dark:text-white">{totalFilteredCount > 0 ? startIndex + 1 : 0}</strong>
            {" "}to{" "}
            <strong className="text-slate-900 dark:text-white">{endIndex}</strong>
            {" "}of{" "}
            <strong className="text-slate-900 dark:text-white">{totalFilteredCount}</strong>
            {" "}templates
          </span>
          <div className="flex items-center gap-1 text-slate-500 dark:text-zinc-400">
            <span className="text-[10px]">Rows:</span>
            {[5, 10, 20, 50].map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setPageSize(size)}
                className={`h-5 px-1.5 rounded text-[10px] font-medium transition-all cursor-pointer ${
                  pageSize === size
                    ? "bg-[#9D61FF] text-white font-bold"
                    : "hover:bg-slate-200 dark:hover:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button type="button" onClick={() => setCurrentPage(1)} disabled={currentPage <= 1}
            className="h-7 w-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer">
            <ChevronsLeft className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}
            className="h-7 w-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer">
            <ChevronLeft className="w-3 h-3" />
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
                return (
                  <React.Fragment key={page}>
                    {prev && page - prev > 1 && (
                      <span className="px-1 text-slate-400 dark:text-zinc-600 font-mono text-xs">...</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`h-7 min-w-[28px] px-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center ${
                        currentPage === page
                          ? "bg-[#9D61FF] text-white shadow-[0_0_10px_rgba(157,97,255,0.35)]"
                          : "border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >{page}</button>
                  </React.Fragment>
                );
              })}
          </div>

          <button type="button" onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage >= totalPages}
            className="h-7 w-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer">
            <ChevronRight className="w-3 h-3" />
          </button>
          <button type="button" onClick={() => setCurrentPage(totalPages)} disabled={currentPage >= totalPages}
            className="h-7 w-7 rounded-lg border border-slate-200 dark:border-zinc-800 flex items-center justify-center text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer">
            <ChevronsRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}
