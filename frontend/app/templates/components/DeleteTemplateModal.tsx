"use client";

import React from "react";
import { AlertCircle } from "lucide-react";
import { useTemplates } from "./TemplatesContext";

/**
 * Confirmation modal for deleting a template blueprint.
 * Takes ZERO props - reads directly from TemplatesContext.
 */
export default function DeleteTemplateModal() {
  const { deleteConfirmId, setDeleteConfirmId, handleDelete } = useTemplates();

  if (!deleteConfirmId) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 flex-shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold">Delete Template Blueprint?</h4>
            <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
              This blueprint will be permanently removed from the system.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800">
          <button
            type="button"
            onClick={() => setDeleteConfirmId(null)}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleDelete(deleteConfirmId)}
            className="px-4 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors cursor-pointer shadow-sm"
          >
            Confirm Delete
          </button>
        </div>
      </div>
    </div>
  );
}
