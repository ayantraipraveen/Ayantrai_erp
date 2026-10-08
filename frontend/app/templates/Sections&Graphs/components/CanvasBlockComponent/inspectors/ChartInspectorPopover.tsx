import React from "react";
import {
  BarChart2,
  SlidersHorizontal,
  ExternalLink,
  Sparkles,
  Layers,
  Palette,
} from "lucide-react";
import { LibraryChartCard, GraphType } from "@/lib/redux/slices/reportModuleSlice";
import { CHART_TYPE_OPTIONS, PALETTE_RAMPS } from "../../constants/chartTypes";
import { ColorSwatchPicker } from "../common/ColorSwatchPicker";
import { DraggablePopoverShell } from "./DraggablePopoverShell";
import { CardDimensionControls } from "./CardDimensionControls";

export interface ChartInspectorPopoverProps {
  chart: LibraryChartCard;
  activeTab: "chart" | "layout";
  onTabChange: (tab: "chart" | "layout") => void;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onUpdateChart: (patch: Partial<LibraryChartCard>) => void;
  onOpenFullEditor?: () => void;
}

export function ChartInspectorPopover({
  chart,
  activeTab,
  onTabChange,
  isOpen,
  anchorRect,
  onClose,
  onUpdateChart,
  onOpenFullEditor,
}: ChartInspectorPopoverProps) {
  const tabsSubHeader = (
    <div className="shrink-0 px-3 pt-1 pb-0.5">
      <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-800/80 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
        <button
          type="button"
          onClick={() => onTabChange("chart")}
          className={`flex-1 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "chart"
              ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <BarChart2 className="w-2.5 h-2.5" />
          <span>Type & Colors</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("layout")}
          className={`flex-1 py-0.5 text-[10px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "layout"
              ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <SlidersHorizontal className="w-2.5 h-2.5" />
          <span>Layout & Frame</span>
        </button>
      </div>
    </div>
  );

  const footer = (
    <div className="shrink-0 flex items-center justify-between px-3 py-1.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70">
      <div className="flex items-center gap-1.5">
        <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-zinc-400 capitalize">
          {chart.chartType}
        </span>
        {onOpenFullEditor && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullEditor();
            }}
            className="flex items-center gap-0.5 px-2 py-0.5 rounded text-[8.5px] font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors cursor-pointer"
            title="Open comprehensive dataset & axis modal editor"
          >
            <ExternalLink className="w-2.5 h-2.5" />
            <span>Full Data Editor</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="px-3.5 py-1 rounded-lg bg-[#9D61FF] hover:bg-[#8B4CF0] text-white text-[10.5px] font-bold transition-all cursor-pointer shadow-xs"
      >
        Done
      </button>
    </div>
  );

  return (
    <DraggablePopoverShell
      isOpen={isOpen}
      anchorRect={anchorRect}
      onClose={onClose}
      title="Telemetry Chart Inspector"
      headerIcon={<BarChart2 className="w-3 h-3 text-[#9D61FF]" />}
      popoverClassName="portal-chart-inspector"
      ignoreClickSelectors={[".portal-chart-topbar", ".group\\/chart"]}
      pinnedSubHeader={tabsSubHeader}
      footer={footer}
    >
      {activeTab === "chart" ? (
        <div className="space-y-3">
          {/* Chart Title & Caption */}
          <div className="space-y-1.5">
            <div>
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">
                Chart Title
              </label>
              <input
                type="text"
                value={chart.title || ""}
                onChange={(e) => onUpdateChart({ title: e.target.value })}
                placeholder="e.g. Safety Incident Trend (Monthly)"
                className="w-full px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10.5px] font-bold text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
            <div>
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">
                Description / Caption
              </label>
              <input
                type="text"
                value={chart.description || ""}
                onChange={(e) => onUpdateChart({ description: e.target.value })}
                placeholder="Brief explanatory note below chart"
                className="w-full px-2 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] text-slate-700 dark:text-zinc-300 focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
          </div>

          {/* Quick Chart Visualization Type Grid */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Chart Type
              </label>
              <span className="text-[8.5px] font-mono text-slate-400">
                {CHART_TYPE_OPTIONS.length} options
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 max-h-36 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(157,97,255,0.3)_transparent] p-0.5 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900">
              {CHART_TYPE_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = chart.chartType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onUpdateChart({ chartType: opt.id as GraphType })}
                    className={`flex flex-col items-center justify-center p-1 rounded-md text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#9D61FF] text-white shadow-xs font-bold"
                        : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200/80 dark:hover:bg-zinc-800 hover:text-slate-900"
                    }`}
                    title={opt.label}
                  >
                    <IconComp className="w-3.5 h-3.5 mb-0.5 opacity-90" />
                    <span className="text-[8px] leading-tight truncate w-full">
                      {opt.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Ramps & Accent Swatch */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                  Palette Ramp Presets
                </label>
              </div>
              <div className="grid grid-cols-3 gap-1">
                {PALETTE_RAMPS.map((ramp) => {
                  const isSelected =
                    chart.color === ramp.accent ||
                    (chart.colors && chart.colors[0] === ramp.accent);
                  return (
                    <button
                      key={ramp.id}
                      type="button"
                      onClick={() =>
                        onUpdateChart({
                          color: ramp.accent,
                          colors: [ramp.accent, "#3b82f6", "#10b981", "#f59e0b"],
                        })
                      }
                      className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md border text-[9px] transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#9D61FF]/10 border-[#9D61FF] text-[#9D61FF] font-bold"
                          : "bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:border-slate-300"
                      }`}
                    >
                      <span
                        style={{ backgroundColor: ramp.accent }}
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      />
                      <span className="truncate">{ramp.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Accent Color Swatch */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                  Custom Primary Accent Color
                </label>
                {chart.color && (
                  <button
                    type="button"
                    onClick={() => onUpdateChart({ color: undefined })}
                    className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer"
                  >
                    Reset
                  </button>
                )}
              </div>
              <div className="flex items-center gap-1">
                <ColorSwatchPicker
                  value={chart.color || "#3b82f6"}
                  onChange={(hex) => onUpdateChart({ color: hex })}
                />
                <input
                  type="text"
                  value={chart.color || ""}
                  onChange={(e) => onUpdateChart({ color: e.target.value })}
                  placeholder="Auto (#3B82F6)"
                  className="flex-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            {/* Display Feature Toggles */}
            <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 grid grid-cols-3 gap-1">
              <label className="flex items-center gap-1 cursor-pointer p-1 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800">
                <input
                  type="checkbox"
                  checked={chart.options?.showLegend ?? true}
                  onChange={(e) =>
                    onUpdateChart({
                      options: { ...chart.options, showLegend: e.target.checked },
                    })
                  }
                  className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3"
                />
                <span className="text-[8.5px] font-medium text-slate-700 dark:text-zinc-300">
                  Legend
                </span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer p-1 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800">
                <input
                  type="checkbox"
                  checked={chart.options?.showGridLines ?? true}
                  onChange={(e) =>
                    onUpdateChart({
                      options: { ...chart.options, showGridLines: e.target.checked },
                    })
                  }
                  className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3"
                />
                <span className="text-[8.5px] font-medium text-slate-700 dark:text-zinc-300">
                  Grid Lines
                </span>
              </label>

              <label className="flex items-center gap-1 cursor-pointer p-1 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-200/70 dark:border-zinc-800">
                <input
                  type="checkbox"
                  checked={chart.options?.smoothCurve ?? true}
                  onChange={(e) =>
                    onUpdateChart({
                      options: { ...chart.options, smoothCurve: e.target.checked },
                    })
                  }
                  className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3"
                />
                <span className="text-[8.5px] font-medium text-slate-700 dark:text-zinc-300">
                  Smooth
                </span>
              </label>
            </div>
          </div>
        </div>
      ) : (
        /* Tab 2: Layout & Frame */
        <div className="space-y-3">
          {/* Dimension Controls */}
          <div>
            <CardDimensionControls
              customHeight={chart.customHeight}
              customWidth={chart.customWidth}
              onUpdateHeight={(val) => onUpdateChart({ customHeight: val })}
              onUpdateWidth={(val) => onUpdateChart({ customWidth: val })}
              titlePrefix="Chart Card Dimensions"
              minHeight={100}
              maxHeight={500}
              defaultHeight={240}
              minWidth={160}
              maxWidth={900}
              defaultWidth={450}
            />
          </div>

          {/* Container Background & Borders */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold text-slate-800 dark:text-zinc-200">
                Card Background & Frame
              </span>
              <label className="flex items-center gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={Boolean(chart.isTransparent)}
                  onChange={(e) => onUpdateChart({ isTransparent: e.target.checked })}
                  className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span className="text-[8.5px] text-slate-500 font-medium">Transparent</span>
              </label>
            </div>

            {!chart.isTransparent && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                      Background Color
                    </label>
                    {chart.backgroundColor && (
                      <button
                        type="button"
                        onClick={() => onUpdateChart({ backgroundColor: undefined })}
                        className="text-[8.5px] text-[#9D61FF] hover:underline cursor-pointer"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <ColorSwatchPicker
                      value={chart.backgroundColor || "#ffffff"}
                      onChange={(hex) => onUpdateChart({ backgroundColor: hex })}
                    />
                    <input
                      type="text"
                      value={chart.backgroundColor || ""}
                      onChange={(e) => onUpdateChart({ backgroundColor: e.target.value })}
                      placeholder="Auto (#ffffff)"
                      className="flex-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5">
                      Border Color
                    </label>
                    <div className="flex items-center gap-1">
                      <ColorSwatchPicker
                        value={chart.borderColor || "#e2e8f0"}
                        onChange={(hex) => onUpdateChart({ borderColor: hex })}
                      />
                      <input
                        type="text"
                        value={chart.borderColor || ""}
                        onChange={(e) => onUpdateChart({ borderColor: e.target.value })}
                        placeholder="#e2e8f0"
                        className="flex-1 px-1.5 py-0.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                        Border Radius
                      </label>
                      <span className="text-[9px] font-mono font-bold text-[#9D61FF]">
                        {chart.borderRadius ?? 16}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="32"
                      step="2"
                      value={chart.borderRadius ?? 16}
                      onChange={(e) => onUpdateChart({ borderRadius: Number(e.target.value) })}
                      className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </DraggablePopoverShell>
  );
}
