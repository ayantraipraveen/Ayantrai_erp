"use client";

import React from "react";
import {
  ChevronUp,
  ChevronDown,
  ZoomOut,
  ZoomIn,
  Grid,
  Square,
  Ruler,
  Eye,
} from "lucide-react";

export interface CanvasViewportDockProps {
  pagesCount: number;
  activeViewPageIndex: number;
  onNavigatePage: (index: number) => void;
  activeZoom: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetZoom: () => void;
  activeShowGrid: boolean;
  onToggleGrid: () => void;
  activeShowGuides: boolean;
  onToggleGuides: () => void;
  activeShowRulers: boolean;
  onToggleRulers: () => void;
  activeIsPreview: boolean;
  onTogglePreview: () => void;
}

export function CanvasViewportDock({
  pagesCount,
  activeViewPageIndex,
  onNavigatePage,
  activeZoom,
  onZoomIn,
  onZoomOut,
  onResetZoom,
  activeShowGrid,
  onToggleGrid,
  activeShowGuides,
  onToggleGuides,
  activeShowRulers,
  onToggleRulers,
  activeIsPreview,
  onTogglePreview,
}: CanvasViewportDockProps) {
  return (
    <div className="fixed bottom-4 right-8 z-40 flex items-center gap-1.5 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-2xl px-3 py-1.5 shadow-2xl backdrop-blur-md select-none text-xs">
      {/* Page Navigator when multi-page */}
      {pagesCount > 1 && (
        <>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-zinc-800 rounded-xl px-2 py-0.5 font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-200">
            <button
              type="button"
              onClick={() => onNavigatePage(Math.max(0, activeViewPageIndex - 1))}
              disabled={activeViewPageIndex === 0}
              className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
              title="Previous Page"
            >
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <span className="px-1 text-[#8B3DFF]">
              Page {activeViewPageIndex + 1} / {pagesCount}
            </span>
            <button
              type="button"
              onClick={() => onNavigatePage(Math.min(pagesCount - 1, activeViewPageIndex + 1))}
              disabled={activeViewPageIndex === pagesCount - 1}
              className="p-1 rounded hover:bg-white dark:hover:bg-zinc-700 disabled:opacity-30 cursor-pointer"
              title="Next Page"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />
        </>
      )}

      {/* Zoom Out */}
      <button
        type="button"
        onClick={onZoomOut}
        disabled={activeZoom <= 0.5}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 cursor-pointer"
        title="Zoom Out"
      >
        <ZoomOut className="w-3.5 h-3.5" />
      </button>

      {/* Zoom Percentage Label */}
      <button
        type="button"
        onClick={onResetZoom}
        className="px-2 py-0.5 rounded-md font-mono text-[11px] font-bold text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
        title="Reset Zoom to 100%"
      >
        {Math.round(activeZoom * 100)}%
      </button>

      {/* Zoom In */}
      <button
        type="button"
        onClick={onZoomIn}
        disabled={activeZoom >= 2.5}
        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white disabled:opacity-30 cursor-pointer"
        title="Zoom In"
      >
        <ZoomIn className="w-3.5 h-3.5" />
      </button>

      <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />

      {/* Grid Toggle */}
      <button
        type="button"
        onClick={onToggleGrid}
        className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
          activeShowGrid ? "text-[#8B3DFF] bg-purple-500/15" : "text-slate-400 hover:text-slate-700"
        }`}
        title="Toggle Background Grid"
      >
        <Grid className="w-3.5 h-3.5" />
      </button>

      {/* Margin Guides Toggle */}
      <button
        type="button"
        onClick={onToggleGuides}
        className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
          activeShowGuides ? "text-[#8B3DFF] bg-purple-500/15" : "text-slate-400 hover:text-slate-700"
        }`}
        title="Toggle Margin Guides"
      >
        <Square className="w-3.5 h-3.5" />
      </button>

      {/* Dimensions & Position Rulers Toggle */}
      <button
        type="button"
        onClick={onToggleRulers}
        className={`p-1.5 rounded-lg cursor-pointer transition-colors ${
          activeShowRulers ? "text-[#8B3DFF] bg-purple-500/15" : "text-slate-400 hover:text-slate-700"
        }`}
        title="Toggle Dimensions & Position Rulers (Shift+R)"
      >
        <Ruler className="w-3.5 h-3.5" />
      </button>

      {/* Fixed Standard PDF Page Indicator */}
      <div
        className="px-2 py-0.5 rounded-md font-mono text-[10px] font-bold text-purple-600 dark:text-purple-300 bg-purple-500/10 border border-purple-500/20 select-none"
        title="Fixed Standard ISO PDF Page (595 × 842 px)"
      >
        PDF 595×842
      </div>

      <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 mx-1" />

      {/* Preview Button */}
      <button
        type="button"
        onClick={onTogglePreview}
        className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all ${
          activeIsPreview ? "bg-[#8B3DFF] text-white shadow-sm" : "text-slate-600 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800"
        }`}
        title="Toggle Clean Preview Mode"
      >
        <Eye className="w-3.5 h-3.5" />
        <span>{activeIsPreview ? "Exit" : "Preview"}</span>
      </button>
    </div>
  );
}
