"use client";

import React, { useState, useEffect } from "react";
import { X, XCircle, AlertCircle } from "lucide-react";

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

  const handleConfirm = () => {
    const trimmed = reason.trim();
    if (requireReason && !trimmed) return;
    onConfirm(trimmed);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20">
              <XCircle className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {title}
              </h3>
              {(itemIdentifier || itemName) && (
                <p className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate max-w-[280px]">
                  {itemIdentifier} {itemName && `• ${itemName}`}
                </p>
              )}
              {subtitle && !itemIdentifier && !itemName && (
                <p className="text-[10px] text-slate-500 dark:text-zinc-400">
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

        {/* Input */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[11px] font-medium text-slate-700 dark:text-zinc-300">
              Reason for Rejection {requireReason && <span className="text-rose-500">*</span>}
            </label>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500">
              Required for audit trail
            </span>
          </div>
          <textarea
            rows={3}
            autoFocus
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={placeholder}
            className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500/80 transition-all placeholder:text-slate-400 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            disabled={requireReason && !reason.trim()}
            onClick={handleConfirm}
            className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-rose-600/20"
          >
            <X className="w-3.5 h-3.5" />
            <span>{confirmLabel}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
