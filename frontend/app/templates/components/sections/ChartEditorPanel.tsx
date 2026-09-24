"use client";

import React from "react";
import { X } from "lucide-react";
import { LibraryChartCard, GraphType } from "@/lib/redux/slices/reportModuleSlice";
import ChartRenderer from "./ChartRenderer";
import { CHART_TYPE_OPTIONS, PALETTE_COLORS } from "./constants/chartTypes";

interface ChartEditorPanelProps {
  editingChart: LibraryChartCard | null;
  chartTitle: string;
  setChartTitle: (val: string) => void;
  chartType: GraphType;
  setChartType: (val: GraphType) => void;
  chartDesc: string;
  setChartDesc: (val: string) => void;
  chartColor: string;
  setChartColor: (val: string) => void;
  onSave: () => void;
  onClose: () => void;
}

/**
 * Dedicated Fullscreen/Inline Editor Panel for Telemetry Charts.
 * Includes metadata configuration, 25 visualization types selection, color theming, and real-time live preview.
 */
export default function ChartEditorPanel({
  editingChart,
  chartTitle,
  setChartTitle,
  chartType,
  setChartType,
  chartDesc,
  setChartDesc,
  chartColor,
  setChartColor,
  onSave,
  onClose,
}: ChartEditorPanelProps) {
  return (
    <div className="flex-1 min-h-0 bg-white dark:bg-[#0c1017] flex flex-col overflow-hidden animate-fadeIn text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 p-6 flex-shrink-0">
        <h3 className="text-lg font-bold">
          {editingChart ? "Edit Telemetry Chart" : "Add Telemetry Chart"}
        </h3>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Compact inputs row - no wasted vertical space */}
      <div className="flex-shrink-0 flex gap-4 px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/30 dark:bg-zinc-900/20">
        <div className="flex-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">
            Chart Title *
          </label>
          <input
            type="text"
            value={chartTitle}
            onChange={(e) => setChartTitle(e.target.value)}
            placeholder="e.g. PPE Compliance by Work Zone"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-[#9D61FF]"
          />
        </div>
        <div className="flex-1">
          <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">
            Caption / Description
          </label>
          <input
            type="text"
            value={chartDesc}
            onChange={(e) => setChartDesc(e.target.value)}
            placeholder="e.g. Comparative gauge across contractors"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-[#9D61FF]"
          />
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Left Column: Chart Type Grid — fills all remaining height */}
        <div className="w-[42%] border-r border-slate-200 dark:border-zinc-800 flex flex-col min-h-0">
          <div className="px-4 pt-3 pb-2 flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
              Visualization Type
            </span>
          </div>
          <div className="flex-1 overflow-hidden px-3 pb-3">
            <div className="grid grid-cols-5 gap-1.5 h-full content-start">
              {CHART_TYPE_OPTIONS.map((t) => {
                const Icon = t.icon;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setChartType(t.id)}
                    className={`p-1.5 rounded-lg border flex flex-col items-center justify-center gap-0.5 cursor-pointer transition-all ${
                      chartType === t.id
                        ? "border-[#9D61FF] bg-purple-500/10 text-[#9D61FF] font-bold"
                        : "border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:border-[#9D61FF]/50 hover:text-[#9D61FF]"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                    <span className="text-[8px] text-center leading-tight">{t.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Live Preview — fills all remaining height */}
        <div className="flex-1 flex flex-col min-h-0 bg-slate-50/50 dark:bg-zinc-900/30">
          {/* Preview header: label + color badge + color palette */}
          <div className="px-6 pt-3 pb-2 flex-shrink-0 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                Chart Live Preview
              </span>
              <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-200 dark:bg-zinc-800 px-2 py-0.5 rounded-lg">
                {chartType}
              </span>
            </div>
            {/* Color Palette */}
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-semibold text-slate-400 mr-1">Color:</span>
              {PALETTE_COLORS.map((swatch) => (
                <button
                  key={swatch.color}
                  type="button"
                  title={swatch.label}
                  onClick={() => setChartColor(swatch.color)}
                  className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110 flex-shrink-0 cursor-pointer"
                  style={{
                    backgroundColor: swatch.color,
                    borderColor: chartColor === swatch.color ? "white" : "transparent",
                    boxShadow: chartColor === swatch.color ? `0 0 0 2px ${swatch.color}` : "none",
                  }}
                />
              ))}
              {/* Custom color picker */}
              <label
                title="Custom color"
                className="w-5 h-5 rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-600 flex items-center justify-center cursor-pointer hover:scale-110 transition-all overflow-hidden flex-shrink-0 relative"
              >
                <input
                  type="color"
                  value={chartColor}
                  onChange={(e) => setChartColor(e.target.value)}
                  className="w-8 h-8 opacity-0 absolute cursor-pointer"
                />
                <span className="text-[9px] text-slate-400">+</span>
              </label>
            </div>
          </div>
          <div className="flex-1 min-h-0 px-6 pb-6">
            <ChartRenderer
              chart={{
                id: "preview",
                title: chartTitle || "Preview Chart",
                chartType: chartType,
                dataSourceField: "custom_telemetry_feed",
                description: chartDesc || "Chart description preview",
              }}
              color={chartColor}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-[#0c1017]">
        <button
          type="button"
          onClick={onClose}
          className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!chartTitle.trim()}
          className="px-5 py-2.5 rounded-xl bg-[#9D61FF] text-white text-sm font-bold disabled:opacity-50 hover:bg-purple-600 transition-colors cursor-pointer"
        >
          Save Chart
        </button>
      </div>
    </div>
  );
}
