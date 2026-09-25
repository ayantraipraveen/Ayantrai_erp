"use client";

import React from "react";
import {
  PaletteRamp,
  GraphType,
  CanvasCell,
  LibraryMetricCard,
  LibraryChartCard,
} from "@/lib/redux/slices/reportModuleSlice";
import {
  PALETTE_RAMPS,
  CHART_TYPE_OPTIONS,
} from "./constants/chartTypes";
import {
  Copy,
  Trash2,
  Sliders,
  Eye,
  Grid,
  Square,
  ArrowUp,
  ArrowDown,
  Maximize2,
  FileText,
  Activity,
  BarChart2,
  Lightbulb,
  AlignLeft,
  LayoutGrid,
  Minus,
  Sparkles,
} from "lucide-react";

export interface CanvasContextRibbonProps {
  selectedCell: CanvasCell | null;
  selectedRowId: string | null;
  sectionName: string;
  sectionEyebrow: string;
  onUpdateColSpan: (span: 1 | 2 | 3 | 4) => void;
  onUpdateMetricCard?: (card: LibraryMetricCard) => void;
  onUpdateChart?: (chart: LibraryChartCard) => void;
  onOpenChartEditor?: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  paperTone: "white" | "slate" | "paper";
  onSetPaperTone: (tone: "white" | "slate" | "paper") => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showGuides: boolean;
  onToggleGuides: () => void;
  isPreview: boolean;
  onTogglePreview: () => void;
}

const COLOR_RAMP_DOTS: { id: PaletteRamp; bg: string; label: string }[] = [
  { id: "blue",    bg: "bg-blue-500",    label: "Blue" },
  { id: "green",   bg: "bg-emerald-500", label: "Green" },
  { id: "purple",  bg: "bg-purple-500",  label: "Purple" },
  { id: "amber",   bg: "bg-amber-500",   label: "Amber" },
  { id: "cyan",    bg: "bg-cyan-500",    label: "Cyan" },
  { id: "red",     bg: "bg-rose-500",    label: "Rose" },
  { id: "slate",   bg: "bg-slate-500",   label: "Slate" },
];

export function CanvasContextRibbon({
  selectedCell,
  selectedRowId,
  sectionName,
  sectionEyebrow,
  onUpdateColSpan,
  onUpdateMetricCard,
  onUpdateChart,
  onOpenChartEditor,
  onDuplicate,
  onDelete,
  paperTone,
  onSetPaperTone,
  showGrid,
  onToggleGrid,
  showGuides,
  onToggleGuides,
  isPreview,
  onTogglePreview,
}: CanvasContextRibbonProps) {
  if (isPreview) {
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

  // ── Render Block Context Ribbon ─────────────────────────────────────────────
  if (selectedCell) {
    const card = selectedCell.metricCard;
    const chart = selectedCell.chart;

    return (
      <div className="h-10 flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 bg-slate-50/95 dark:bg-[#090d14]/95 border-b border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-md overflow-x-auto select-none animate-fadeIn">
        <div className="flex items-center gap-2.5 flex-nowrap">
          {/* Active Block Type Tag */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#9D61FF]/15 text-[#9D61FF] border border-[#9D61FF]/30 text-xs font-bold font-mono">
            {selectedCell.blockType === "metric-card" && <Activity className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "chart"       && <BarChart2 className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "insight"     && <Lightbulb className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "text"        && <AlignLeft className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "badge-strip" && <LayoutGrid className="w-3.5 h-3.5" />}
            {selectedCell.blockType === "divider"     && <Minus className="w-3.5 h-3.5" />}
            <span className="capitalize">{selectedCell.blockType.replace("-", " ")}</span>
          </div>

          <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800" />

          {/* Metric Card Context Controls */}
          {selectedCell.blockType === "metric-card" && card && onUpdateMetricCard && (
            <>
              {/* Color Ramp Dots */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-0.5">Tint:</span>
                {COLOR_RAMP_DOTS.map((dot) => (
                  <button
                    key={dot.id}
                    type="button"
                    onClick={() => onUpdateMetricCard({ ...card, tintColor: dot.id })}
                    title={dot.label}
                    className={`w-4 h-4 rounded-full ${dot.bg} transition-transform cursor-pointer ${
                      card.tintColor === dot.id ? "ring-2 ring-offset-1 ring-[#9D61FF] scale-110" : "opacity-70 hover:opacity-100"
                    }`}
                  />
                ))}
              </div>

              <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800" />

              {/* Trend Direction Picker */}
              <div className="flex items-center gap-1">
                <span className="text-[10px] uppercase font-bold text-slate-400 mr-0.5">Trend:</span>
                <button
                  type="button"
                  onClick={() => onUpdateMetricCard({ ...card, trendDirection: "up" })}
                  className={`h-6 px-1.5 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    card.trendDirection === "up" ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-black" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <ArrowUp className="w-3 h-3" /> Up
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateMetricCard({ ...card, trendDirection: "down" })}
                  className={`h-6 px-1.5 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    card.trendDirection === "down" ? "bg-rose-500/20 text-rose-600 dark:text-rose-400 font-black" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  <ArrowDown className="w-3 h-3" /> Down
                </button>
                <button
                  type="button"
                  onClick={() => onUpdateMetricCard({ ...card, trendDirection: "no-change" })}
                  className={`h-6 px-1.5 rounded text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors ${
                    card.trendDirection === "no-change" ? "bg-blue-500/20 text-blue-600 dark:text-blue-400 font-black" : "text-slate-400 hover:text-slate-700"
                  }`}
                >
                  Neutral
                </button>
              </div>

              <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800" />
            </>
          )}

          {/* Chart Context Controls */}
          {selectedCell.blockType === "chart" && chart && (
            <>
              {/* Chart Type Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-400">Type:</span>
                <select
                  value={chart.chartType}
                  onChange={(e) => onUpdateChart && onUpdateChart({ ...chart, chartType: e.target.value as GraphType })}
                  className="h-6 rounded-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 px-2 text-[11px] font-bold text-slate-800 dark:text-zinc-200 outline-none cursor-pointer"
                >
                  {CHART_TYPE_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {onOpenChartEditor && (
                <button
                  type="button"
                  onClick={onOpenChartEditor}
                  className="h-6 px-2 rounded-md bg-[#9D61FF]/10 hover:bg-[#9D61FF]/20 text-[#9D61FF] text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer border border-[#9D61FF]/30"
                  title="Open Fullscreen Telemetry Studio"
                >
                  <Sliders className="w-3 h-3" /> Full Designer
                </button>
              )}

              <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800" />
            </>
          )}

          {/* ColSpan Width Selector (Common to all) */}
          <div className="flex items-center gap-1">
            <span className="text-[10px] uppercase font-bold text-slate-400 mr-0.5">Width:</span>
            {([1, 2, 3, 4] as const).map((span) => (
              <button
                key={span}
                type="button"
                onClick={() => onUpdateColSpan(span)}
                className={`h-6 px-2 rounded text-[11px] font-bold transition-all cursor-pointer ${
                  selectedCell.colSpan === span
                    ? "bg-[#9D61FF] text-white shadow-sm"
                    : "text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800"
                }`}
              >
                {span === 1 && "¼"}
                {span === 2 && "½"}
                {span === 3 && "¾"}
                {span === 4 && "Full"}
              </button>
            ))}
          </div>
        </div>

        {/* Right Action Icons: Duplicate, Delete */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onDuplicate}
            className="h-7 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Duplicate Block (Ctrl+D)"
          >
            <Copy className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden sm:inline">Duplicate</span>
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="h-7 px-2.5 rounded-lg border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-900/20 text-rose-600 dark:text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Delete Block (Del)"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </button>
        </div>
      </div>
    );
  }

  // ── Render Global Canvas Ribbon (Nothing selected) ──────────────────────────
  return (
    <div className="h-10 flex-shrink-0 flex items-center justify-between gap-3 px-4 sm:px-6 bg-slate-50/95 dark:bg-[#090d14]/95 border-b border-slate-200/80 dark:border-zinc-800/80 backdrop-blur-md overflow-x-auto select-none">
      <div className="flex items-center gap-3">
        {/* Section info badge */}
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
          <span className="text-[10px] font-mono uppercase font-bold text-sky-600 dark:text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded-md border border-sky-500/20">{sectionEyebrow}</span>
          <span className="font-semibold text-slate-800 dark:text-zinc-200 truncate max-w-[200px]">{sectionName}</span>
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Paper tone selector */}
        <div className="flex items-center gap-1">
          <span className="text-[10px] uppercase font-bold text-slate-400 hidden sm:inline mr-1">Paper:</span>
          <button
            type="button"
            onClick={() => onSetPaperTone("white")}
            className={`h-6 px-2 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              paperTone === "white"
                ? "bg-white text-slate-900 border-slate-300 dark:bg-zinc-800 dark:text-white dark:border-zinc-600 shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            White
          </button>
          <button
            type="button"
            onClick={() => onSetPaperTone("slate")}
            className={`h-6 px-2 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              paperTone === "slate"
                ? "bg-slate-100 text-slate-900 border-slate-300 dark:bg-zinc-900 dark:text-white dark:border-zinc-700 shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Slate
          </button>
          <button
            type="button"
            onClick={() => onSetPaperTone("paper")}
            className={`h-6 px-2 rounded text-[10px] font-bold border transition-all cursor-pointer ${
              paperTone === "paper"
                ? "bg-[#faf8f5] text-amber-900 border-amber-300 dark:bg-[#15130f] dark:text-amber-200 dark:border-amber-800 shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-700"
            }`}
          >
            Cream
          </button>
        </div>

        <div className="w-px h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

        {/* Grid and Guides Toggles */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={onToggleGrid}
            className={`h-6 px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showGrid ? "bg-purple-500/15 text-[#9D61FF] border border-purple-500/30" : "text-slate-400 hover:text-slate-700"
            }`}
            title="Toggle Matrix Dot Grid"
          >
            <Grid className="w-3 h-3" />
            <span className="hidden sm:inline">Grid</span>
          </button>
          <button
            type="button"
            onClick={onToggleGuides}
            className={`h-6 px-2 rounded text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
              showGuides ? "bg-purple-500/15 text-[#9D61FF] border border-purple-500/30" : "text-slate-400 hover:text-slate-700"
            }`}
            title="Toggle Printable A4 Margins"
          >
            <Square className="w-3 h-3" />
            <span className="hidden sm:inline">Margins</span>
          </button>
        </div>
      </div>

      {/* Right controls: Clean preview */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onTogglePreview}
          className="h-7 px-3 rounded-lg border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF]/50 hover:bg-[#9D61FF]/10 text-slate-700 dark:text-zinc-200 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
          title="Toggle Clean Executive Report Preview"
        >
          <Eye className="w-3.5 h-3.5 text-[#9D61FF]" />
          <span>Preview Report</span>
        </button>
      </div>
    </div>
  );
}
