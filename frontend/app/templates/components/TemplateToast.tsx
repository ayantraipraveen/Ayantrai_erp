"use client";

import React from "react";
import { Sparkles } from "lucide-react";
import { useTemplates } from "./TemplatesContext";

/**
 * Toast feedback banner for Templates module.
 * Takes ZERO props - reads directly from TemplatesContext.
 */
export default function TemplateToast() {
  const { toastMessage } = useTemplates();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white border border-[#F6C72F]/60 shadow-[0_0_24px_rgba(246,199,47,0.3)] text-xs font-medium animate-slideUp">
      <Sparkles className="w-4 h-4 text-[#F6C72F]" />
      <span>{toastMessage}</span>
    </div>
  );
}
