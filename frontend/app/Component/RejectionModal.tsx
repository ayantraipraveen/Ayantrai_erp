"use client";

import React, { useState, useEffect } from "react";
import { X, XCircle, AlertTriangle } from "lucide-react";

export interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title?: string;
  subtitle?: string;
  itemIdentifier?: string;
  itemName?: string;
  placeholder?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  requireReason?: boolean;
}

/**
 * Common Reusable Rejection / Revision Request Modal
 * Usable across Templates, Reports, Approvals, Admin governance, and Workflows.
 */
export default function RejectionModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Reject Safety Item",
  subtitle,
  itemIdentifier,
  itemName,
  placeholder = "Specify the compliance gaps, missing blocks, or required modifications...",
  confirmLabel = "Confirm Rejection",
  cancelLabel = "Cancel",
  requireReason = true,
}: RejectionModalProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (isOpen) {
      setReason("");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const trimmed = reason.trim();
  const canConfirm = !requireReason || trimmed.length > 0;
  const charCount = trimmed.length;

  const handleConfirm = () => {
    if (!canConfirm) return;
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-rose-200/60 dark:border-rose-900/40 bg-white dark:bg-[#0c1017] shadow-2xl shadow-rose-900/10 overflow-hidden text-slate-900 dark:text-white">

        {/* Rose accent top bar */}
        <div className="h-1 w-full bg-gradient-to-r from-rose-500 via-rose-400 to-rose-600" />

        <div className="p-5 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
                <XCircle className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                  {title}
                </h3>
                {(itemIdentifier || itemName) && (
                  <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate max-w-[280px] mt-0.5">
                    {itemIdentifier}{itemName && ` • ${itemName}`}
                  </p>
                )}
                {subtitle && !itemIdentifier && !itemName && (
                  <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                    {subtitle}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Divider */}
          <div className="border-t border-slate-100 dark:border-zinc-800/80" />

          {/* Input */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1">
                Reason for Rejection
                {requireReason && <span className="text-rose-500">*</span>}
              </label>
              <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono">
                Required for audit trail
              </span>
            </div>
            <textarea
              rows={3}
              autoFocus
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-zinc-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-400 focus:ring-1 focus:ring-rose-400/30 transition-all placeholder:text-slate-400 dark:placeholder:text-zinc-600 resize-none"
            />
            {/* Char count + validation hint */}
            <div className="flex items-center justify-between px-0.5">
              {requireReason && charCount === 0 ? (
                <span className="flex items-center gap-1 text-[10px] text-amber-500">
                  <AlertTriangle className="w-3 h-3" />
                  A reason is required before confirming rejection.
                </span>
              ) : (
                <span />
              )}
              <span className={`text-[10px] font-mono ml-auto ${charCount > 0 ? "text-slate-400 dark:text-zinc-500" : "text-slate-300 dark:text-zinc-700"}`}>
                {charCount} chars
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-0.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700 hover:border-slate-300 dark:hover:border-zinc-600 hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              disabled={!canConfirm}
              onClick={handleConfirm}
              className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-md shadow-rose-600/25"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>{confirmLabel}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
