"use client";

import React, { useState, useEffect } from "react";
import { MessageSquare, X, Check } from "lucide-react";

export interface TemplateRemarkModalProps {
  template: { id: string; name: string; remarks?: string } | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (templateId: string, remark: string) => void;
}

/**
 * Reusable Remark Modal for Template audits and operational notes.
 */
export default function TemplateRemarkModal({
  template,
  isOpen,
  onClose,
  onSave,
}: TemplateRemarkModalProps) {
  const [remarkText, setRemarkText] = useState("");

  useEffect(() => {
    if (template) {
      setRemarkText(template.remarks || "");
    } else {
      setRemarkText("");
    }
  }, [template]);

  if (!isOpen || !template) return null;

  const handleSave = () => {
    onSave(template.id, remarkText.trim());
    onClose();
  };

  const handleClear = () => {
    onSave(template.id, "");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white">
        {/* Header */}
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
                {template.id} • {template.name}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Textarea */}
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

        {/* Actions */}
        <div className="flex items-center justify-between pt-1">
          {template.remarks ? (
            <button
              type="button"
              onClick={handleClear}
              className="text-[11px] text-rose-500 hover:underline cursor-pointer"
            >
              Clear remark
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save Remark</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
