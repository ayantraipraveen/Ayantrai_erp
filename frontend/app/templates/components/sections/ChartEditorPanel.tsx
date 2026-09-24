"use client";

import React, { useState } from "react";
import { X, Activity } from "lucide-react";
import { LibraryChartCard, GraphType } from "@/lib/redux/slices/reportModuleSlice";
import ChartRenderer from "./ChartRenderer";
import {
  CHART_TYPE_OPTIONS,
  PALETTE_COLORS,
  THEME_PRESETS,
  getChartSeriesConfig,
} from "./constants/chartTypes";

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
  chartColors: string[];
  setChartColors: React.Dispatch<React.SetStateAction<string[]>>;
  onSave: () => void;
  onClose: () => void;
}

/**
 * Dedicated Fullscreen/Inline Editor Panel for Telemetry Charts.
 * Includes metadata configuration, 25 visualization types selection, multi-series color theming, and real-time live preview.
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
  chartColors,
  setChartColors,
  onSave,
  onClose,
}: ChartEditorPanelProps) {
  const seriesConfig = getChartSeriesConfig(chartType, chartColor);
  const [activeSeriesIndex, setActiveSeriesIndex] = useState(0);

  // Keep active series within valid range when chartType changes
  const safeActiveIndex = activeSeriesIndex >= seriesConfig.length ? 0 : activeSeriesIndex;
  const currentSeries = seriesConfig[safeActiveIndex];
  const activeColor = chartColors[safeActiveIndex] || currentSeries?.defaultColor || chartColor;

  const handleSelectColor = (newColor: string) => {
    if (seriesConfig.length <= 1) {
      setChartColor(newColor);
      setChartColors([newColor]);
    } else {
      setChartColors((prev) => {
        const next = [...prev];
        // Populate defaults for all series if not already set
        seriesConfig.forEach((s, idx) => {
          if (!next[idx]) next[idx] = s.defaultColor;
        });
        next[safeActiveIndex] = newColor;
        if (safeActiveIndex === 0) {
          setChartColor(newColor);
        }
        return next;
      });
    }
  };

  const handleApplyTheme = (themeColors: string[]) => {
    const newColors = seriesConfig.map(
      (s, idx) => themeColors[idx % themeColors.length] || s.defaultColor
    );
    setChartColors(newColors);
    if (newColors[0]) {
      setChartColor(newColors[0]);
    }
  };

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
        {/* Left Column: Chart Type Grid */}
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
                    onClick={() => {
                      setChartType(t.id);
                      setActiveSeriesIndex(0);
                    }}
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

        {/* Right Column: Live Preview Area (Clean, Borderless, Spaciously Proportioned) */}
        <div className="flex-1 flex flex-col min-h-0 bg-transparent px-6 py-4 overflow-y-auto">
          {/* Preview Toolbar */}
          <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800/80 flex-shrink-0">
            {/* Top row: Live Preview badge + Active color swatch palette */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                  Chart Live Preview
                </span>
                <span className="text-[10px] font-mono uppercase text-slate-400 bg-slate-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md font-bold">
                  {chartType}
                </span>
              </div>

              {/* Swatch palette for the active element/series */}
              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50/90 dark:bg-zinc-900/60 border border-slate-200/70 dark:border-zinc-800 shadow-2xs">
                <span className="text-[10px] font-semibold text-slate-500 dark:text-zinc-400 mr-1">
                  {seriesConfig.length > 1
                    ? `Color for ${currentSeries?.label || "Selected"}:`
                    : "Color:"}
                </span>
                {PALETTE_COLORS.map((swatch) => (
                  <button
                    key={swatch.color}
                    type="button"
                    title={swatch.label}
                    onClick={() => handleSelectColor(swatch.color)}
                    className="w-4.5 h-4.5 rounded-full border-2 transition-all hover:scale-115 flex-shrink-0 cursor-pointer"
                    style={{
                      backgroundColor: swatch.color,
                      borderColor: activeColor === swatch.color ? "white" : "transparent",
                      boxShadow: activeColor === swatch.color ? `0 0 0 2px ${swatch.color}` : "none",
                    }}
                  />
                ))}
                {/* Custom color picker */}
                <label
                  title="Custom color"
                  className="w-4.5 h-4.5 rounded-full border-2 border-dashed border-slate-300 dark:border-zinc-600 flex items-center justify-center cursor-pointer hover:scale-115 transition-all overflow-hidden flex-shrink-0 relative"
                >
                  <input
                    type="color"
                    value={activeColor}
                    onChange={(e) => handleSelectColor(e.target.value)}
                    className="w-8 h-8 opacity-0 absolute cursor-pointer"
                  />
                  <span className="text-[9px] text-slate-400 font-bold">+</span>
                </label>
              </div>
            </div>

            {/* If more than 1 line/series: show series selector pills + quick theme presets */}
            {seriesConfig.length > 1 && (
              <div className="flex items-center justify-between gap-2 flex-wrap pt-0.5">
                {/* Series Tabs */}
                <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
                    Select Line / Series:
                  </span>
                  {seriesConfig.map((s, idx) => {
                    const isSelected = safeActiveIndex === idx;
                    const sColor = chartColors[idx] || s.defaultColor;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setActiveSeriesIndex(idx)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer border ${
                          isSelected
                            ? "bg-purple-50 dark:bg-purple-950/40 border-[#9D61FF] text-[#9D61FF] font-bold shadow-2xs"
                            : "bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 font-medium hover:border-slate-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <span
                          className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-black/15 shadow-2xs"
                          style={{ backgroundColor: sColor }}
                        />
                        <span>{s.label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Harmonized Theme Presets for all series at once */}
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-medium mr-1">
                    All-Series Themes:
                  </span>
                  {THEME_PRESETS.map((theme) => (
                    <button
                      key={theme.name}
                      type="button"
                      title={`Apply ${theme.name} palette to all series`}
                      onClick={() => handleApplyTheme(theme.colors)}
                      className="flex items-center gap-1 px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 text-[10px] font-medium text-slate-600 dark:text-zinc-400 hover:border-[#9D61FF] hover:text-[#9D61FF] bg-white dark:bg-zinc-900 transition-colors cursor-pointer"
                    >
                      <div className="flex -space-x-1">
                        {theme.colors.slice(0, seriesConfig.length).map((c, i) => (
                          <span
                            key={i}
                            className="w-2 h-2 rounded-full border border-white dark:border-zinc-900"
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                      <span>{theme.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Full Chart Display (No inner border, no inner bg, zero clipping) */}
          <div className="flex-1 min-h-0 flex items-center justify-center py-6 px-2 overflow-visible">
            <div className="w-full">
              <ChartRenderer
                chart={{
                  id: "preview",
                  title: chartTitle || "Preview Chart",
                  chartType: chartType,
                  dataSourceField: "custom_telemetry_feed",
                  description: chartDesc || "Chart description preview",
                  color: chartColor,
                  colors: chartColors,
                }}
                color={chartColor}
                colors={chartColors}
              />
            </div>
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
