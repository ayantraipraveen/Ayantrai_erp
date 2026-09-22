"use client";

import React, { useEffect } from "react";
import { Sparkles, CheckCircle2, AlertCircle, AlertTriangle, X } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearGlobalToast } from "@/lib/redux/slices/reportModuleSlice";

/**
 * Universal Global Toast Notification Component.
 * Connected directly to Redux store so any page, component, or action across the ERP can trigger it.
 */
export default function GlobalToast() {
  const dispatch = useAppDispatch();
  const toast = useAppSelector((state) => state.reportModule.globalToast);

  useEffect(() => {
    if (!toast) return;

    const timer = setTimeout(() => {
      dispatch(clearGlobalToast());
    }, toast.duration || 3500);

    return () => clearTimeout(timer);
  }, [toast, dispatch]);

  if (!toast) return null;

  const type = toast.type || "info";

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed bottom-6 right-6 z-50 max-w-md animate-slideUp pointer-events-auto select-none"
    >
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl shadow-2xl transition-all ${
          type === "success"
            ? "bg-slate-950/95 border-emerald-500/50 text-emerald-200 shadow-[0_0_30px_rgba(16,185,129,0.3)]"
            : type === "error"
            ? "bg-slate-950/95 border-rose-500/50 text-rose-200 shadow-[0_0_30px_rgba(244,63,94,0.3)]"
            : type === "warning"
            ? "bg-slate-950/95 border-amber-500/50 text-amber-200 shadow-[0_0_30px_rgba(245,158,11,0.3)]"
            : "bg-slate-950/95 border-[#F6C72F]/60 text-white shadow-[0_0_30px_rgba(246,199,47,0.3)]"
        }`}
      >
        {/* Type Icon */}
        <div className="flex-shrink-0">
          {type === "success" && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
          {type === "error" && <AlertCircle className="w-4 h-4 text-rose-400" />}
          {type === "warning" && <AlertTriangle className="w-4 h-4 text-amber-400" />}
          {type === "info" && <Sparkles className="w-4 h-4 text-[#F6C72F]" />}
        </div>

        {/* Message content */}
        <div className="text-xs font-medium text-slate-100 flex-1 leading-relaxed pr-1">
          {toast.message}
        </div>

        {/* Dismiss action */}
        <button
          type="button"
          onClick={() => dispatch(clearGlobalToast())}
          aria-label="Close notification"
          className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer flex-shrink-0"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
