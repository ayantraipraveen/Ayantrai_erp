"use client";

import React from "react";
import { Eye } from "lucide-react";

export interface PreviewRibbonProps {
  onTogglePreview: () => void;
}

export function PreviewRibbon({ onTogglePreview }: PreviewRibbonProps) {
  return (
    <div className="h-10 flex-shrink-0 flex items-center justify-between px-4 sm:px-6 bg-slate-900 text-white text-xs border-b border-zinc-800">
      <div className="flex items-center gap-2">
        <Eye className="w-3.5 h-3.5 text-[#9D61FF]" />
        <span className="font-bold">Live Clean Preview Mode</span>
        <span className="text-zinc-400 text-[11px]">— Presentation view without editing handles</span>
      </div>
      <button
        type="button"
        onClick={onTogglePreview}
        className="h-7 px-3 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs transition-colors cursor-pointer"
      >
        Exit Preview (Esc)
      </button>
    </div>
  );
}
