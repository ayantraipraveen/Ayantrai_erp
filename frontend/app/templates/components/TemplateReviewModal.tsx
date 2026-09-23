"use client";

import React, { useState } from "react";
import { X, XCircle, CheckCircle2 } from "lucide-react";
import { useTemplates } from "./TemplatesContext";

/**
 * Inspection and Superadmin Review/Approval Modal.
 * Takes ZERO props - reads directly from TemplatesContext.
 */
export default function TemplateReviewModal() {
  const {
    selectedTemplate,
    setSelectedTemplate,
    reviewModalOpen,
    setReviewModalOpen,
    activeRole,
    handleApprove,
    handleReject,
  } = useTemplates();

  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!reviewModalOpen || !selectedTemplate) return null;

  const handleClose = () => {
    setShowRejectInput(false);
    setRejectionReason("");
    setReviewModalOpen(false);
    setSelectedTemplate(null);
  };

  const handleConfirmReject = () => {
    handleReject(selectedTemplate, rejectionReason);
    setShowRejectInput(false);
    setRejectionReason("");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
          <div>
            <span className="text-[10px] font-mono text-[#9D61FF] uppercase font-bold tracking-wider">
              Template Blueprint • {selectedTemplate.id} ({selectedTemplate.version})
            </span>
            <h2 className="text-lg font-bold mt-1 text-slate-900 dark:text-white">{selectedTemplate.name}</h2>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              Site: {selectedTemplate.site_name} | Author: {selectedTemplate.created_by}
            </div>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Section Blocks Breakdown */}
        <div className="space-y-3">
          <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
            Ordered Report Sections ({selectedTemplate.blocks.length}):
          </div>
          <div className="space-y-2">
            {selectedTemplate.blocks.map((b, idx) => (
              <div
                key={b.id}
                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-[#9D61FF]/20 text-[#9D61FF] font-mono text-[10px] flex items-center justify-center font-bold">
                    {idx + 1}
                  </span>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">{b.title}</div>
                    <div className="text-[10px] text-slate-500 dark:text-zinc-400">{b.description}</div>
                  </div>
                </div>
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                  Included
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Superadmin Decision Controls */}
        {activeRole === "superadmin" && selectedTemplate.status === "pending" && (
          <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
            {showRejectInput ? (
              <div className="space-y-2 animate-fadeIn">
                <label className="text-xs font-semibold text-rose-500">
                  Reason for Rejection / Changes Requested:
                </label>
                <textarea
                  rows={3}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Please include supervisory insights and adjust permissible hours threshold..."
                  className="w-full p-2.5 rounded-xl border border-rose-500/40 bg-rose-500/5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-sm"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setShowRejectInput(true)}
                  className="px-4 py-2 rounded-xl border border-rose-500/50 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Reject & Request Revision</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleApprove(selectedTemplate)}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve & Auto-Generate Report</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
