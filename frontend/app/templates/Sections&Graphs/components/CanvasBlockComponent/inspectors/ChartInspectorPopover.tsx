import React from "react";
import {
  BarChart2,
  SlidersHorizontal,
  ExternalLink,
  Layers,
  Plus,
  Trash2,
  RotateCcw,
  Sparkles,
  Database,
} from "lucide-react";
import { LibraryChartCard, GraphType, ChartDataPoint } from "@/lib/redux/slices/reportModuleSlice";
import { CHART_TYPE_OPTIONS, PALETTE_RAMPS } from "../../constants/chartTypes";
import { ColorSwatchPicker } from "../common/ColorSwatchPicker";
import { DraggablePopoverShell } from "./DraggablePopoverShell";
import { CardDimensionControls } from "./CardDimensionControls";

export interface ChartInspectorPopoverProps {
  chart: LibraryChartCard;
  activeTab: "chart" | "data" | "layout";
  onTabChange: (tab: "chart" | "data" | "layout") => void;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onUpdateChart: (patch: Partial<LibraryChartCard>) => void;
  onOpenFullEditor?: () => void;
}

const DEFAULT_SAMPLE_POINTS: ChartDataPoint[] = [
  { id: "dp-1", label: "08:00", value: 88 },
  { id: "dp-2", label: "12:00", value: 94 },
  { id: "dp-3", label: "16:00", value: 96 },
  { id: "dp-4", label: "20:00", value: 99 },
  { id: "dp-5", label: "24:00", value: 100 },
];

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
  const dataPoints = chart.dataPoints || [];

  const handleUpdatePoint = (idx: number, patch: Partial<ChartDataPoint>) => {
    const updated = [...dataPoints];
    updated[idx] = { ...updated[idx], ...patch };
    onUpdateChart({ dataPoints: updated });
  };

  const handleAddPoint = () => {
    const count = dataPoints.length + 1;
    const hasSec = dataPoints.some((p) => p.secondaryValue !== undefined);
    const newPt: ChartDataPoint = {
      id: `dp-${Date.now()}`,
      label: `Item ${count}`,
      value: 75,
      secondaryValue: hasSec ? 60 : undefined,
    };
    onUpdateChart({ dataPoints: [...dataPoints, newPt] });
  };

  const handleDeletePoint = (idx: number) => {
    const updated = dataPoints.filter((_, i) => i !== idx);
    onUpdateChart({ dataPoints: updated });
  };

  const handleInitializeDataPoints = () => {
    if (chart.series && chart.series.length > 0 && chart.series[0]?.data && chart.series[0].data.length > 0) {
      const labels = chart.xAxis?.labels || [];
      const s0 = chart.series[0].data;
      const s1 = chart.series[1]?.data;
      const pts: ChartDataPoint[] = s0.map((val, idx) => ({
        id: `dp-${Date.now()}-${idx}`,
        label: labels[idx] || `Item ${idx + 1}`,
        value: typeof val === "number" ? val : parseFloat(val) || 0,
        secondaryValue:
          s1 && s1[idx] !== undefined
            ? typeof s1[idx] === "number"
              ? s1[idx]
              : parseFloat(s1[idx]) || 0
            : undefined,
      }));
      onUpdateChart({ dataPoints: pts });
    } else if (chart.xAxis?.labels && chart.xAxis.labels.length > 0) {
      const labels = chart.xAxis.labels;
      const pts: ChartDataPoint[] = labels.map((lbl, idx) => ({
        id: `dp-${Date.now()}-${idx}`,
        label: lbl,
        value: 50 + idx * 10,
      }));
      onUpdateChart({ dataPoints: pts });
    } else {
      onUpdateChart({ dataPoints: DEFAULT_SAMPLE_POINTS });
    }
  };

  const tabsSubHeader = (
    <div className="shrink-0 px-3 pt-1 pb-0.5">
      <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-800/80 rounded-lg border border-slate-200/60 dark:border-zinc-700/60">
        <button
          type="button"
          onClick={() => onTabChange("chart")}
          className={`flex-1 py-0.5 text-[9.5px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
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
          onClick={() => onTabChange("data")}
          className={`flex-1 py-0.5 text-[9.5px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
            activeTab === "data"
              ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
              : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
          }`}
        >
          <Layers className="w-2.5 h-2.5" />
          <span>Data & Points</span>
        </button>

        <button
          type="button"
          onClick={() => onTabChange("layout")}
          className={`flex-1 py-0.5 text-[9.5px] font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1 ${
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
        /* Tab 1: Type & Colors */
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

            {/* Multi-Series Accent Palette Swatches */}
            <div>
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Multi-Series Palette Colors
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((sIdx) => {
                  const fallbackColors = [chart.color || "#3B82F6", "#10B981", "#F59E0B", "#F43F5E"];
                  const curColor = chart.colors?.[sIdx] || fallbackColors[sIdx];
                  return (
                    <div key={sIdx} className="flex flex-col items-center gap-0.5 p-1 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                      <span className="text-[8px] font-bold text-slate-400">Series {sIdx + 1}</span>
                      <ColorSwatchPicker
                        value={curColor}
                        onChange={(hex) => {
                          const newColors = [...(chart.colors || fallbackColors)];
                          newColors[sIdx] = hex;
                          onUpdateChart({ colors: newColors });
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      ) : activeTab === "data" ? (
        /* Tab 2: Data & Points */
        <div className="space-y-3">
          {/* Display Feature Toggles */}
          <div>
            <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
              Display Features
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <input
                  type="checkbox"
                  checked={chart.options?.showValues ?? true}
                  onChange={(e) =>
                    onUpdateChart({
                      options: { ...chart.options, showValues: e.target.checked },
                    })
                  }
                  className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                  Show Data Numbers
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <input
                  type="checkbox"
                  checked={chart.options?.showLegend ?? true}
                  onChange={(e) =>
                    onUpdateChart({
                      options: { ...chart.options, showLegend: e.target.checked },
                    })
                  }
                  className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                  Show Legend
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <input
                  type="checkbox"
                  checked={chart.options?.showGridLines ?? true}
                  onChange={(e) =>
                    onUpdateChart({
                      options: { ...chart.options, showGridLines: e.target.checked },
                    })
                  }
                  className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                  Show Grid Lines
                </span>
              </label>

              <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                <input
                  type="checkbox"
                  checked={chart.options?.smoothCurve ?? true}
                  onChange={(e) =>
                    onUpdateChart({
                      options: { ...chart.options, smoothCurve: e.target.checked },
                    })
                  }
                  className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                  Smooth Curve
                </span>
              </label>
            </div>
          </div>

          {/* Y-Axis Unit & Scale */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-1.5">
            <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block">
              Axis & Units Configuration
            </label>
            <div className="grid grid-cols-3 gap-1.5">
              <div>
                <label className="text-[8.5px] text-slate-500 block mb-0.5">Unit Symbol</label>
                <input
                  type="text"
                  value={chart.yAxis?.unit ?? "%"}
                  onChange={(e) =>
                    onUpdateChart({
                      yAxis: { ...(chart.yAxis || {}), unit: e.target.value },
                    })
                  }
                  placeholder="e.g. %, hrs, pts"
                  className="w-full px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div>
                <label className="text-[8.5px] text-slate-500 block mb-0.5">Min Value</label>
                <input
                  type="number"
                  value={chart.yAxis?.min ?? 0}
                  onChange={(e) =>
                    onUpdateChart({
                      yAxis: { ...(chart.yAxis || {}), min: Number(e.target.value) },
                    })
                  }
                  placeholder="0"
                  className="w-full px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div>
                <label className="text-[8.5px] text-slate-500 block mb-0.5">Max Value</label>
                <input
                  type="number"
                  value={chart.yAxis?.max ?? 100}
                  onChange={(e) =>
                    onUpdateChart({
                      yAxis: { ...(chart.yAxis || {}), max: Number(e.target.value) },
                    })
                  }
                  placeholder="100"
                  className="w-full px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-mono text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>
          </div>

          {/* Data Points Manager */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                <Database className="w-2.5 h-2.5 text-[#9D61FF]" />
                <span>Data Points ({dataPoints.length})</span>
              </span>

              {dataPoints.length > 0 && (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const hasSec = dataPoints.some((p) => p.secondaryValue !== undefined);
                      const updated = dataPoints.map((p) => ({
                        ...p,
                        secondaryValue: hasSec
                          ? undefined
                          : p.secondaryValue ?? Math.round((p.value ?? 50) * 0.75),
                      }));
                      onUpdateChart({ dataPoints: updated });
                    }}
                    className="text-[8.5px] font-semibold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    title="Toggle multi-series secondary values"
                  >
                    {dataPoints.some((p) => p.secondaryValue !== undefined)
                      ? "- Series 2"
                      : "+ Series 2"}
                  </button>
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="flex items-center gap-0.5 text-[8.5px] font-bold text-[#9D61FF] hover:underline cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>Add Point</span>
                  </button>
                </div>
              )}
            </div>

            {dataPoints.length > 0 ? (
              <div className="space-y-1.5 max-h-44 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(157,97,255,0.3)_transparent] pr-0.5">
                {dataPoints.map((pt, idx) => {
                  const showSec =
                    dataPoints.some((p) => p.secondaryValue !== undefined) ||
                    Boolean(chart.series && chart.series.length > 1);
                  return (
                    <div
                      key={pt.id || idx}
                      className="flex items-center gap-1.5 p-1 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800"
                    >
                      <span className="text-[8px] font-mono font-bold text-slate-400 w-3 text-center">
                        {idx + 1}
                      </span>

                      {/* Category Label Input */}
                      <input
                        type="text"
                        value={pt.label}
                        onChange={(e) => handleUpdatePoint(idx, { label: e.target.value })}
                        placeholder="Category / Label"
                        className="flex-1 min-w-[70px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[10px] text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                      />

                      {/* Primary Numerical Value Input */}
                      <input
                        type="number"
                        value={pt.value}
                        onChange={(e) => handleUpdatePoint(idx, { value: Number(e.target.value) })}
                        placeholder="Val 1"
                        title="Series 1 Value"
                        className="w-12 px-1 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[10px] font-mono text-slate-800 dark:text-zinc-200 text-right focus:outline-none focus:border-[#9D61FF]"
                      />

                      {/* Optional Secondary Numerical Value Input */}
                      {showSec && (
                        <input
                          type="number"
                          value={pt.secondaryValue ?? 0}
                          onChange={(e) =>
                            handleUpdatePoint(idx, { secondaryValue: Number(e.target.value) })
                          }
                          placeholder="Val 2"
                          title="Series 2 Value"
                          className="w-12 px-1 py-0.5 rounded border border-blue-200 dark:border-blue-900/60 bg-blue-50/50 dark:bg-blue-950/30 text-[10px] font-mono text-blue-700 dark:text-blue-300 text-right focus:outline-none focus:border-[#9D61FF]"
                        />
                      )}

                    {/* Point Color Swatch */}
                    <ColorSwatchPicker
                      value={pt.color || chart.color || "#3B82F6"}
                      onChange={(hex) => handleUpdatePoint(idx, { color: hex })}
                    />

                    {/* Delete Point Button */}
                    <button
                      type="button"
                      onClick={() => handleDeletePoint(idx)}
                      className="p-1 text-slate-400 hover:text-rose-500 cursor-pointer transition-colors"
                      title="Delete data point"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                );
              })}
              </div>
            ) : (
              <div className="p-3 rounded-lg border border-dashed border-purple-200 dark:border-purple-900/50 bg-purple-50/40 dark:bg-purple-950/20 text-center space-y-1.5">
                <p className="text-[9.5px] text-slate-600 dark:text-zinc-400">
                  Currently displaying standard template telemetry data.
                </p>
                <button
                  type="button"
                  onClick={handleInitializeDataPoints}
                  className="px-2.5 py-1 rounded-md bg-[#9D61FF] text-white text-[9.5px] font-bold hover:bg-purple-600 transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Customize Live Data Points</span>
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tab 3: Layout & Frame */
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
