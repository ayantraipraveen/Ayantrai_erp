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
  Layers,
  MessageSquare,
  X,
  Check,
  History,
  RotateCcw,
} from "lucide-react";
import { Tooltip, RejectionModal } from "../../Component";
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
    resetFilters,
    handleApprove,
    handleReject,
    handleResubmit,
    handleUpdateRemark,
  } = useTemplates();

  const [remarkModalTemplate, setRemarkModalTemplate] = React.useState<any | null>(null);
  const [remarkText, setRemarkText] = React.useState("");

  const [rejectModalTemplate, setRejectModalTemplate] = React.useState<any | null>(null);
  const [customRejectReason, setCustomRejectReason] = React.useState("");

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFilteredCount);

  return (
    <div className="w-full flex-1 min-h-0 border-y border-l border-r-0 border-slate-200 dark:border-zinc-800/90 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-xl shadow-sm flex flex-col overflow-hidden">
      {/* Scrollable tbody only */}
      <div className="overflow-x-hidden overflow-y-auto flex-1 min-h-0 custom-scrollbar w-full">
        <table className="w-full text-left border-collapse table-fixed">

          <thead className="sticky top-0 z-10 bg-slate-50 dark:bg-[#0e1219] border-b border-slate-200 dark:border-zinc-800/80 text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-zinc-400 select-none">
            <tr>
              <th className="py-2.5 px-2.5 font-semibold w-[21%]">Template &amp; Blueprint</th>
              <th className="py-2.5 px-2.5 font-semibold w-[16%]">Target Site</th>
              <th className="py-2.5 px-2.5 font-semibold w-[12%]">Configured Sections</th>
              <th className="py-2.5 px-2.5 font-semibold w-[15%]">Author / Created</th>
              <th className="py-2.5 px-2.5 font-semibold w-[9%]">Status</th>
              <th className="py-2.5 px-2.5 font-semibold w-[13%]">Review Info</th>
              <th className="py-2.5 px-2.5 font-semibold w-[14%] text-center">Actions</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {paginatedTemplates.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 max-w-sm mx-auto">
                    <div className="h-10 w-10 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-[#9D61FF] flex items-center justify-center">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        No Templates Available
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                        No safety report blueprints match your current filter or search criteria.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={resetFilters}
                      className="px-3.5 py-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 text-xs font-semibold text-slate-800 dark:text-white transition-colors cursor-pointer"
                    >
                      Reset All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedTemplates.map((template) => {
                const isPending  = template.status === "pending";
                const isActive   = template.status === "active";
                const isRejected = template.status === "rejected";

                return (
                  <tr
                    key={template.id}
                    className="group hover:bg-slate-50/80 dark:hover:bg-zinc-800/30 transition-colors"
                  >
                  {/* Template & Blueprint */}
                  <td className="py-2.5 px-2 overflow-hidden">
                    <div className="flex items-start gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 flex-shrink-0 mt-0.5">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700/60 flex-shrink-0">
                            {template.id}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                            {template.version}
                          </span>
                          <Tooltip content={`Version History (${template.version})`} position="top">
                            <span className="cursor-pointer text-slate-400 hover:text-[#9D61FF] transition-colors p-0.5">
                              <History className="w-3 h-3" />
                            </span>
                          </Tooltip>
                        </div>
                        <Tooltip content={template.name} position="top" maxWidth="max-w-[320px]">
                          <div className="font-semibold text-[12.5px] leading-snug text-slate-900 dark:text-white group-hover:text-[#9D61FF] transition-colors truncate cursor-default">
                            {template.name}
                          </div>
                        </Tooltip>
                        <Tooltip content={template.description} position="bottom" maxWidth="max-w-[340px]">
                          <div className="text-[11px] text-slate-500 dark:text-zinc-400 truncate cursor-default mt-0.5">
                            {template.description}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </td>

                  {/* Target Site */}
                  <td className="py-2.5 px-2 overflow-hidden">
                    <Tooltip content={template.site_name} position="top" maxWidth="max-w-[260px]">
                      <div className="flex items-center gap-1.5 min-w-0 cursor-default">
                        <Building className="w-3.5 h-3.5 text-[#9D61FF] flex-shrink-0" />
                        <span className="font-medium text-[12px] text-slate-800 dark:text-zinc-200 truncate">
                          {template.site_name}
                        </span>
                      </div>
                    </Tooltip>
                    <div className="text-[11px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
                      {template.site_id}
                    </div>
                  </td>

                  {/* Configured Sections — Compact Chip with Tooltip */}
                  <td className="py-2.5 px-2 overflow-hidden">
                    <Tooltip
                      content={
                        <div className="max-w-xs space-y-1">
                          <div className="font-bold text-[11px] text-purple-300 border-b border-purple-400/20 pb-0.5 flex items-center justify-between">
                            <span>{template.blocks.length} Configured Sections:</span>
                            <span className="text-[9px] font-mono text-purple-200">
                              {template.blocks.reduce((acc, b) => acc + (b.graphs?.length || 0), 0)} graphs
                            </span>
                          </div>
                          <div className="text-[10px] leading-relaxed space-y-0.5">
                            {template.blocks.map((b, i) => (
                              <div key={b.id || i} className="flex items-center justify-between gap-2">
                                <span className="truncate">• {b.title}</span>
                                {b.graphs && b.graphs.length > 0 && (
                                  <span className="text-[9px] font-mono text-purple-300 flex-shrink-0">
                                    ({b.graphs.length} {b.graphs.length === 1 ? "graph" : "graphs"})
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      }
                      position="top"
                    >
                      <span className="inline-flex items-center gap-1 font-mono text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 cursor-default hover:border-[#9D61FF]/40 transition-colors">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#9D61FF]" />
                        {template.blocks.length} {template.blocks.length === 1 ? "section" : "sections"}
                      </span>
                    </Tooltip>
                  </td>

                  {/* Author / Created */}
                  <td className="py-2.5 px-2 overflow-hidden">
                    <Tooltip content={template.created_by} position="top" maxWidth="max-w-[220px]">
                      <div className="font-medium text-[12px] text-slate-800 dark:text-zinc-200 truncate cursor-default">
                        {template.created_by}
                      </div>
                    </Tooltip>
                    <div className="text-[10.5px] font-mono text-slate-400 dark:text-zinc-500 mt-0.5 truncate">
                      {template.created_at}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="py-2.5 px-2 overflow-hidden">
                    <span
                      className={`inline-flex items-center gap-1.5 text-[12px] font-medium capitalize whitespace-nowrap ${
                        isActive
                          ? "text-emerald-600 dark:text-emerald-400"
                          : isPending
                          ? "text-amber-600 dark:text-amber-400"
                          : isRejected
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-600 dark:text-zinc-400"
                      }`}
                    >
                      {isPending && <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-ping flex-shrink-0" />}
                      {isActive  && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 flex-shrink-0" />}
                      {isRejected && <span className="h-1.5 w-1.5 rounded-full bg-rose-500 flex-shrink-0" />}
                      {!isPending && !isActive && !isRejected && <span className="h-1.5 w-1.5 rounded-full bg-slate-400 flex-shrink-0" />}
                      <span className="truncate">
                        {isPending
                          ? "Pending"
                          : isActive
                          ? "Active"
                          : isRejected
                          ? "Rejected"
                          : "Draft"}
                      </span>
                    </span>
                  </td>

                  {/* Review Info */}
                  <td className="py-2.5 px-2 overflow-hidden text-[11px]">
                    {isActive && (
                      <div className="truncate">
                        <span className="text-emerald-600 dark:text-emerald-400 font-medium">Approved</span>
                        {template.approved_by && (
                          <div className="text-slate-500 dark:text-zinc-400 truncate">
                            by {template.approved_by}
                          </div>
                        )}
                      </div>
                    )}
                    {isRejected && (
                      <Tooltip
                        content={template.rejection_reason || "Rejected by Superadmin"}
                        position="top"
                        variant="danger"
                        maxWidth="max-w-[280px]"
                      >
                        <div className="text-rose-500 dark:text-rose-400 cursor-default truncate">
                          <span className="font-semibold">Reason:</span>{" "}
                          <span>{template.rejection_reason || "Changes requested"}</span>
                        </div>
                      </Tooltip>
                    )}
                    {isPending && (
                      <div className="text-amber-600 dark:text-amber-400 italic font-mono truncate">
                        Awaiting review
                      </div>
                    )}
                    {!isActive && !isRejected && !isPending && (
                      <div className="text-slate-400 dark:text-zinc-500 truncate">
                        Draft saved
                      </div>
                    )}
                  </td>

                  {/* Actions (Fixed position aligned icon slots) */}
                  <td className="py-2.5 px-2">
                    <div className="flex items-center justify-center gap-1.5">
                      {/* Fixed Workflow Action Slot (Approve, Reject, or Resubmit) */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {activeRole === "superadmin" && isPending ? (
                          <>
                            <Tooltip content="Quick Approve" position="top">
                              <button
                                type="button"
                                onClick={() => handleApprove(template)}
                                className="h-6 w-6 rounded-md bg-emerald-500/10 hover:bg-emerald-500 text-emerald-600 hover:text-white border border-emerald-500/30 transition-all flex items-center justify-center cursor-pointer"
                              >
                                <Check className="w-3 h-3" />
                              </button>
                            </Tooltip>
                            <Tooltip content="Reject with Reason" position="top">
                              <button
                                type="button"
                                onClick={() => {
                                  setRejectModalTemplate(template);
                                  setCustomRejectReason("");
                                }}
                                className="h-6 w-6 rounded-md bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/30 transition-all flex items-center justify-center cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Tooltip>
                          </>
                        ) : isRejected ? (
                          <>
                            <Tooltip content="Resubmit for Superadmin Review" position="top">
                              <button
                                type="button"
                                onClick={() => handleResubmit(template.id)}
                                className="h-6 w-6 rounded-md bg-purple-500/10 hover:bg-[#9D61FF] text-[#9D61FF] hover:text-white border border-purple-500/30 transition-all flex items-center justify-center cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            </Tooltip>
                            {/* Empty spacer slot to keep fixed column alignment */}
                            <div className="w-6 h-6" />
                          </>
                        ) : (
                          /* 2 Empty spacer slots so active/draft templates stay perfectly aligned */
                          <>
                            <div className="w-6 h-6" />
                            <div className="w-6 h-6" />
                          </>
                        )}
                      </div>

                      {/* Fixed Standard Actions (Inspect, Remark, Edit, Duplicate, Delete) */}
                      <div className="flex items-center gap-1 flex-shrink-0">
                        {/* Inspect blueprint */}
                        <Tooltip content="Inspect blueprint" position="top">
                          <button
                            type="button"
                            onClick={() => { setSelectedTemplate(template); setReviewModalOpen(true); }}
                            className="h-6 w-6 rounded-md border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF]/50 text-slate-500 dark:text-zinc-400 hover:text-[#9D61FF] hover:bg-purple-500/10 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                        </Tooltip>

                        {/* Remark */}
                        <Tooltip
                          content={template.remarks ? `Remark: "${template.remarks}"` : "Add remark"}
                          position="top"
                          variant={template.remarks ? "amber" : "default"}
                          maxWidth="max-w-[260px]"
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setRemarkModalTemplate(template);
                              setRemarkText(template.remarks || "");
                            }}
                            className={`h-6 w-6 rounded-md border transition-all flex items-center justify-center cursor-pointer relative ${
                              template.remarks
                                ? "border-amber-500/50 text-amber-500 bg-amber-500/10 hover:bg-amber-500/20"
                                : "border-slate-200 dark:border-zinc-800 hover:border-amber-500/50 text-slate-500 dark:text-zinc-400 hover:text-amber-500 hover:bg-amber-500/10"
                            }`}
                          >
                            <MessageSquare className="w-3 h-3" />
                            {template.remarks && (
                              <span className="absolute -top-0.5 -right-0.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
                            )}
                          </button>
                        </Tooltip>

                        {/* Edit */}
                        <Tooltip content="Edit template" position="top">
                          <button
                            type="button"
                            onClick={() => setEditingTemplate(template)}
                            className="h-6 w-6 rounded-md border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF]/50 text-slate-500 dark:text-zinc-400 hover:text-[#9D61FF] hover:bg-purple-500/10 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </button>
                        </Tooltip>

                        {/* Duplicate */}
                        <Tooltip content="Duplicate template" position="top">
                          <button
                            type="button"
                            onClick={() => handleDuplicate(template.id)}
                            className="h-6 w-6 rounded-md border border-slate-200 dark:border-zinc-800 hover:border-blue-500/50 text-slate-500 dark:text-zinc-400 hover:text-blue-500 hover:bg-blue-500/10 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </Tooltip>

                        {/* Delete */}
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
                    </div>
                  </td>
                </tr>
                );
              })
            )}
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

      {/* Remark Modal Dialog */}
      {remarkModalTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                    Template Remark
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                    {remarkModalTemplate.id} • {remarkModalTemplate.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setRemarkModalTemplate(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
                Operational Notes / Remarks
              </label>
              <textarea
                rows={3}
                value={remarkText}
                onChange={(e) => setRemarkText(e.target.value)}
                placeholder="Enter remarks, audit notes, or compliance reminders for this template..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-amber-500/80 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center justify-between pt-1">
              {remarkModalTemplate.remarks ? (
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateRemark(remarkModalTemplate.id, "");
                    setRemarkModalTemplate(null);
                  }}
                  className="text-[11px] text-rose-500 hover:underline cursor-pointer"
                >
                  Clear remark
                </button>
              ) : <div />}

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setRemarkModalTemplate(null)}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleUpdateRemark(remarkModalTemplate.id, remarkText.trim());
                    setRemarkModalTemplate(null);
                  }}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Save Remark</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Common Reusable Rejection Reason Modal */}
      <RejectionModal
        isOpen={!!rejectModalTemplate}
        onClose={() => setRejectModalTemplate(null)}
        onConfirm={(reason) => {
          if (rejectModalTemplate) {
            handleReject(rejectModalTemplate, reason);
            setRejectModalTemplate(null);
          }
        }}
        title="Reject Safety Template"
        itemIdentifier={rejectModalTemplate?.id}
        itemName={rejectModalTemplate?.name}
        placeholder="Specify the compliance gaps, missing blocks, or required modifications..."
        confirmLabel="Confirm Rejection"
      />
    </div>
  );
}
