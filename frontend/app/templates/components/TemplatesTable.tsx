"use client";

import React from "react";
import Link from "next/link";
import {
  FileText,
  Eye,
  Edit3,
  Copy,
  Trash2,
  Layers,
  MessageSquare,
  X,
  Check,
  RotateCcw,
  Building,
} from "lucide-react";
import { Tooltip, RejectionModal } from "../../Component";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  selectPaginatedTemplatesInfo,
  selectTemplateCurrentPage,
  selectTemplatePageSize,
  setCurrentPage,
  setPageSize,
  setSelectedTemplateId,
  setReviewModalOpen,
  setDeleteConfirmId,
  resetFilters,
  duplicateTemplateAsync,
  approveTemplateAsync,
  rejectTemplateAsync,
  resubmitTemplateAsync,
  updateTemplateRemarkAsync,
} from "@/lib/redux/slices/templatesSlice";
import TemplatePagination from "./TemplatePagination";
import TemplateRemarkModal from "./TemplateRemarkModal";

/**
 * Enterprise Table — all columns fit in viewport frame.
 * Uses table-fixed + truncate + Tooltip for overflow content.
 */
export default function TemplatesTable() {
  const dispatch = useAppDispatch();
  const { paginatedTemplates, totalFilteredCount, totalPages } = useAppSelector(
    selectPaginatedTemplatesInfo
  );
  const currentPage = useAppSelector(selectTemplateCurrentPage);
  const pageSize = useAppSelector(selectTemplatePageSize);
  const activeRole = useAppSelector((state) => state.reportModule.activeRole);

  const [remarkModalTemplate, setRemarkModalTemplate] = React.useState<any | null>(null);
  const [rejectModalTemplate, setRejectModalTemplate] = React.useState<any | null>(null);

  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalFilteredCount);

  const handleDuplicate = (id: string) => dispatch(duplicateTemplateAsync(id));
  const handleApprove = (tpl: any) => dispatch(approveTemplateAsync({ template: tpl }));
  const handleReject = (tpl: any, reason: string) => dispatch(rejectTemplateAsync({ template: tpl, reason }));
  const handleResubmit = (id: string) => dispatch(resubmitTemplateAsync(id));
  const handleUpdateRemark = (id: string, remarks: string) =>
    dispatch(updateTemplateRemarkAsync({ templateId: id, remarks }));

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
              <th className="py-2.5 pl-2.5 pr-6 font-semibold w-[14%] text-center">Actions</th>
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
                      onClick={()=>dispatch(resetFilters())}
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
                  {/* Template & Blueprint (Code and Name only) */}
                  <td className="py-2.5 px-2 overflow-hidden">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="p-1.5 rounded-lg bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 flex-shrink-0">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1 overflow-hidden">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="font-mono text-[11px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 font-bold border border-slate-200 dark:border-zinc-700/60 flex-shrink-0">
                            {template.id}
                          </span>
                        </div>
                        <Tooltip content={template.name} position="top" maxWidth="max-w-[320px]" className="w-full min-w-0 block">
                          <div className="w-full block truncate font-semibold text-[12.5px] leading-snug text-slate-900 dark:text-white group-hover:text-[#9D61FF] transition-colors cursor-default">
                            {template.name}
                          </div>
                        </Tooltip>
                      </div>
                    </div>
                  </td>

                  {/* Target Site */}
                  <td className="py-2.5 px-2 overflow-hidden">
                    <Tooltip content={template.site_name} position="top" maxWidth="max-w-[260px]" className="w-full min-w-0 block">
                      <div className="flex items-center gap-1.5 w-full min-w-0 cursor-default">
                        <Building className="w-3.5 h-3.5 text-[#9D61FF] flex-shrink-0" />
                        <span className="font-medium text-[12px] text-slate-800 dark:text-zinc-200 truncate flex-1 min-w-0">
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

                  {/* Actions (Fixed position aligned icon slots with right padding) */}
                  <td className="py-2.5 pl-2 pr-6">
                    <div className="flex items-center justify-end gap-1.5">
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
                                }}
                                className="h-6 w-6 rounded-md bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white border border-rose-500/30 transition-all flex items-center justify-center cursor-pointer"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Tooltip>
                          </>
                        ) : isRejected ? (
                          <>
                          {/* Empty spacer slot to keep fixed column alignment */}
                          <div className="w-6 h-6" />
                            <Tooltip content="Resubmit for Superadmin Review" position="top">
                              <button
                                type="button"
                                onClick={() => handleResubmit(template.id)}
                                className="h-6 w-6 rounded-md bg-purple-500/10 hover:bg-[#9D61FF] text-[#9D61FF] hover:text-white border border-purple-500/30 transition-all flex items-center justify-center cursor-pointer"
                              >
                                <RotateCcw className="w-3 h-3" />
                              </button>
                            </Tooltip>
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
                            onClick={() => {
                              dispatch(setSelectedTemplateId(template.id));
                              dispatch(setReviewModalOpen(true));
                            }}
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
                          <Link
                            href={`/templates/create?templateId=${template.id}`}
                            className="h-6 w-6 rounded-md border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF]/50 text-slate-500 dark:text-zinc-400 hover:text-[#9D61FF] hover:bg-purple-500/10 transition-all flex items-center justify-center cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                          </Link>
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
                            onClick={() => dispatch(setDeleteConfirmId(template.id))}
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

      {/* Pinned Reusable Pagination */}
      <TemplatePagination
        currentPage={currentPage}
        setCurrentPage={(p) => dispatch(setCurrentPage(p))}
        pageSize={pageSize}
        setPageSize={(s) => dispatch(setPageSize(s))}
        totalPages={totalPages}
        totalFilteredCount={totalFilteredCount}
        startIndex={startIndex}
        endIndex={endIndex}
        className="flex-shrink-0 border-t border-slate-200 dark:border-zinc-800/80 bg-slate-50/60 dark:bg-[#0e1219]/90 px-4 sm:px-6 lg:px-7 py-2.5 select-none"
      />

      {/* Reusable Remark Modal */}
      <TemplateRemarkModal
        isOpen={!!remarkModalTemplate}
        template={remarkModalTemplate}
        onClose={() => setRemarkModalTemplate(null)}
        onSave={handleUpdateRemark}
      />

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
