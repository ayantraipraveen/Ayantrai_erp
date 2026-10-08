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
  TrendingUp,
  PieChart,
  Grid,
  Table as TableIcon,
  Activity,
  Filter,
  CheckCircle2,
  Clock,
  Eye,
  Sliders,
} from "lucide-react";
import { LibraryChartCard, GraphType, ChartDataPoint } from "@/lib/redux/slices/reportModuleSlice";
import { CHART_TYPE_OPTIONS, PALETTE_RAMPS, MULTI_SERIES_CHART_CONFIG } from "../../constants/chartTypes";
import {
  getChartEditorMode,
  getChartTypePresets,
  ChartEditorMode,
} from "../../constants/chartDataPresets";
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
  const chartType = chart.chartType || "bar";
  const editorMode = getChartEditorMode(chartType);
  const dataPoints = chart.dataPoints || [];
  const currentChartTypeMeta = CHART_TYPE_OPTIONS.find((c) => c.id === chartType);
  const seriesConfigList = MULTI_SERIES_CHART_CONFIG[chartType];

  // Helper to update individual data points
  const handleUpdatePoint = (idx: number, patch: Partial<ChartDataPoint>) => {
    const updated = [...dataPoints];
    updated[idx] = { ...updated[idx], ...patch };
    onUpdateChart({ dataPoints: updated });
  };

  // Helper to add a new point tailored to chart type
  const handleAddPoint = () => {
    const count = dataPoints.length + 1;
    const hasSec = dataPoints.some((p) => p.secondaryValue !== undefined);
    let newPt: ChartDataPoint;

    if (editorMode === "donut") {
      newPt = {
        id: `dp-${Date.now()}`,
        label: `Slice ${count}`,
        value: 20,
        color: PALETTE_RAMPS[count % PALETTE_RAMPS.length].accent,
      };
    } else if (editorMode === "scatter" || editorMode === "bubble") {
      newPt = {
        id: `dp-${Date.now()}`,
        label: `Point ${count}`,
        value: 50,
        x: 40 + count * 10,
        y: 50,
        size: 16,
      };
    } else if (editorMode === "radar") {
      newPt = {
        id: `dp-${Date.now()}`,
        label: `Dimension ${count}`,
        value: 80,
        secondaryValue: hasSec ? 70 : undefined,
      };
    } else if (editorMode === "funnel") {
      newPt = {
        id: `dp-${Date.now()}`,
        label: `Stage ${count}`,
        value: Math.max(100, 1000 - count * 180),
      };
    } else if (editorMode === "table") {
      newPt = {
        id: `dp-${Date.now()}`,
        label: `Row ${count}`,
        value: count,
        rowValues: [`Item ${count}`, "Zone 1", "Optimal", "98%"],
      };
    } else if (editorMode === "heatmap") {
      newPt = {
        id: `dp-${Date.now()}`,
        label: `Zone ${String.fromCharCode(64 + count)}`,
        value: 85,
        rowValues: [85, 90, 88, 92, 95, 80, 82],
      };
    } else {
      newPt = {
        id: `dp-${Date.now()}`,
        label: `Item ${count}`,
        value: 75,
        secondaryValue: hasSec ? 60 : undefined,
      };
    }

    onUpdateChart({ dataPoints: [...dataPoints, newPt] });
  };

  const handleDeletePoint = (idx: number) => {
    const updated = dataPoints.filter((_, i) => i !== idx);
    onUpdateChart({ dataPoints: updated });
  };

  // Load industry preset tailored specifically to the active chart type
  const handleApplyPresetTemplate = (presetIndex = 0) => {
    const presets = getChartTypePresets(chartType, chart.color || "#9D61FF");
    const chosen = presets[presetIndex] || presets[0];
    if (chosen) {
      onUpdateChart({
        yAxis: {
          ...(chart.yAxis || {}),
          unit: chosen.unit,
          min: chosen.yMin,
          max: chosen.yMax,
        },
        dataPoints: chosen.points,
      });
    }
  };

  // Switching chart types intelligently applies defaults
  const handleSelectChartType = (newType: GraphType) => {
    const patch: Partial<LibraryChartCard> = { chartType: newType };
    if (newType === "table" || newType === "heatmap") {
      patch.gridRows = chart.gridRows || 4;
      patch.gridCols = chart.gridCols || (newType === "table" ? 4 : 7);
    }
    onUpdateChart(patch);
  };

  // Dynamic Tab 2 Label based on chart mode
  const dataTabLabel =
    editorMode === "donut"
      ? "Data & Slices"
      : editorMode === "gauge"
      ? "Value & Target"
      : editorMode === "table"
      ? "Table Grid"
      : editorMode === "heatmap"
      ? "Heatmap Matrix"
      : editorMode === "radar"
      ? "Audit Dimensions"
      : editorMode === "funnel"
      ? "Funnel Stages"
      : "Data & Points";

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
          <span>{dataTabLabel}</span>
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
        <span className="text-[9px] font-mono font-bold text-[#9D61FF] capitalize px-1.5 py-0.5 bg-[#9D61FF]/10 rounded">
          {currentChartTypeMeta?.label || chartType}
        </span>
        {onOpenFullEditor && (
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenFullEditor();
            }}
            className="text-[9px] text-[#9D61FF] hover:underline flex items-center gap-0.5 font-medium cursor-pointer"
          >
            <ExternalLink className="w-2.5 h-2.5" />
            <span>Full Data Editor</span>
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onClose}
        className="px-2.5 py-0.5 rounded-md bg-[#9D61FF] text-white text-[10px] font-bold hover:bg-purple-600 transition-colors cursor-pointer shadow-xs"
      >
        Done
      </button>
    </div>
  );

  // Compute total for donut/pie slices
  const totalSliceValue = dataPoints.reduce((acc, p) => acc + (p.value || 0), 0);

  return (
    <DraggablePopoverShell
      title={`${currentChartTypeMeta?.label || "Telemetry Chart"} Inspector`}
      subtitle="Live editing • Direct canvas effect"
      isOpen={isOpen}
      anchorRect={anchorRect}
      onClose={onClose}
      width={360}
      popoverClassName="portal-chart-inspector"
      ignoreClickSelectors={[
        ".canvas-coordinate-stamp",
        ".portal-chart-topbar",
        "[class*='portal-']",
        ".color-swatch-picker",
      ]}
      pinnedSubHeader={tabsSubHeader}
      footer={footer}
    >
      {activeTab === "chart" ? (
        /* Tab 1: Type & Colors */
        <div className="space-y-3">
          {/* Chart Header Details */}
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
                Chart Visualization Type
              </label>
              <span className="text-[8.5px] font-mono text-[#9D61FF] font-semibold">
                {CHART_TYPE_OPTIONS.length} options
              </span>
            </div>
            <div className="grid grid-cols-4 gap-1 max-h-36 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(157,97,255,0.3)_transparent] p-0.5 border border-slate-200 dark:border-zinc-800 rounded-lg bg-slate-50 dark:bg-zinc-900">
              {CHART_TYPE_OPTIONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = chartType === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => handleSelectChartType(opt.id as GraphType)}
                    className={`flex flex-col items-center justify-center p-1 rounded-md text-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#9D61FF] text-white shadow-xs font-bold ring-1 ring-white/20"
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
                  Primary Accent Color
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

            {/* Multi-Series / Multi-Category Palette Swatches tailored to Chart Type */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                  {editorMode === "donut"
                    ? "Slice Palette Colors"
                    : editorMode === "heatmap"
                    ? "Heatmap Intensity Ramp"
                    : editorMode === "waterfall"
                    ? "Waterfall Step Colors"
                    : "Multi-Series Palette Colors"}
                </label>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[0, 1, 2, 3].map((sIdx) => {
                  const fallbackColors = [chart.color || "#3B82F6", "#10B981", "#F59E0B", "#F43F5E"];
                  const curColor = chart.colors?.[sIdx] || fallbackColors[sIdx];
                  const seriesLabel =
                    seriesConfigList && seriesConfigList[sIdx]
                      ? seriesConfigList[sIdx].label
                      : editorMode === "donut"
                      ? `Slice ${sIdx + 1}`
                      : `Series ${sIdx + 1}`;

                  return (
                    <div
                      key={sIdx}
                      className="flex flex-col items-center gap-0.5 p-1 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800"
                    >
                      <span className="text-[7.5px] font-bold text-slate-500 dark:text-zinc-400 truncate w-full text-center">
                        {seriesLabel}
                      </span>
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
        /* Tab 2: Data & Points (100% Based on Chart Type) */
        <div className="space-y-3">
          {/* ── A. DISPLAY FEATURES (Tailored by Chart Type) ── */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                Display Features
              </label>
              <span className="text-[8px] font-mono text-slate-400">
                Mode: {editorMode}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {/* Show Data Numbers / Values: relevant for all charts except purely tabular */}
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
                  {editorMode === "donut"
                    ? "Show Slice %"
                    : editorMode === "table"
                    ? "Show Cell Data"
                    : "Show Numbers"}
                </span>
              </label>

              {/* Show Legend: relevant for charts with categories/series, not gauge */}
              {editorMode !== "gauge" && (
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
              )}

              {/* Show Grid Lines: ONLY for Cartesian charts */}
              {(editorMode === "standard" ||
                editorMode === "multi-series" ||
                editorMode === "scatter" ||
                editorMode === "bubble" ||
                editorMode === "sparkline" ||
                editorMode === "waterfall") && (
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
              )}

              {/* Smooth Curve: ONLY for continuous line/area charts */}
              {(chartType === "line" ||
                chartType === "multi-line" ||
                chartType === "area" ||
                chartType === "sparkline") && (
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
              )}

              {/* Table specifics */}
              {editorMode === "table" && (
                <>
                  <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                    <input
                      type="checkbox"
                      checked={chart.options?.showHeader ?? true}
                      onChange={(e) =>
                        onUpdateChart({
                          options: { ...chart.options, showHeader: e.target.checked },
                        })
                      }
                      className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                      Header Row
                    </span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                    <input
                      type="checkbox"
                      checked={chart.options?.striped ?? true}
                      onChange={(e) =>
                        onUpdateChart({
                          options: { ...chart.options, striped: e.target.checked },
                        })
                      }
                      className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3 cursor-pointer"
                    />
                    <span className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                      Striped Rows
                    </span>
                  </label>
                </>
              )}

              {/* Gauge specifics */}
              {editorMode === "gauge" && (
                <label className="flex items-center gap-1.5 cursor-pointer p-1.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800">
                  <input
                    type="checkbox"
                    checked={chart.options?.showTarget ?? true}
                    onChange={(e) =>
                      onUpdateChart({
                        options: { ...chart.options, showTarget: e.target.checked },
                      })
                    }
                    className="rounded text-[#9D61FF] focus:ring-0 w-3 h-3 cursor-pointer"
                  />
                  <span className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                    Show Target Arc
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* ── B. AXIS & GRID DIMENSIONS (Tailored by Chart Type) ── */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-1.5">
            {editorMode === "table" || editorMode === "heatmap" ? (
              /* Grid Rows & Columns Controls for Table / Heatmap */
              <div>
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  {editorMode === "table" ? "Table Grid Dimensions" : "Heatmap Matrix Dimensions"}
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-1.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-400 block font-mono">ROWS</span>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                        {chart.gridRows || 4}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateChart({ gridRows: Math.max(2, (chart.gridRows || 4) - 1) })
                        }
                        className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs hover:bg-slate-300 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateChart({ gridRows: Math.min(10, (chart.gridRows || 4) + 1) })
                        }
                        className="w-5 h-5 rounded bg-[#9D61FF] text-white flex items-center justify-center font-bold text-xs hover:bg-purple-600 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="p-1.5 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between">
                    <div>
                      <span className="text-[8px] text-slate-400 block font-mono">COLUMNS</span>
                      <span className="text-[11px] font-bold text-slate-800 dark:text-zinc-200">
                        {chart.gridCols || (editorMode === "table" ? 4 : 7)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateChart({
                            gridCols: Math.max(2, (chart.gridCols || (editorMode === "table" ? 4 : 7)) - 1),
                          })
                        }
                        className="w-5 h-5 rounded bg-slate-200 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs hover:bg-slate-300 cursor-pointer"
                      >
                        -
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateChart({
                            gridCols: Math.min(12, (chart.gridCols || (editorMode === "table" ? 4 : 7)) + 1),
                          })
                        }
                        className="w-5 h-5 rounded bg-[#9D61FF] text-white flex items-center justify-center font-bold text-xs hover:bg-purple-600 cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : editorMode === "gauge" ? (
              /* Gauge Min, Target & Unit */
              <div>
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Gauge Range & Units
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">Unit Symbol</label>
                    <input
                      type="text"
                      value={chart.yAxis?.unit ?? "%"}
                      onChange={(e) =>
                        onUpdateChart({
                          yAxis: { ...(chart.yAxis || {}), unit: e.target.value },
                        })
                      }
                      placeholder="%, ppm, psi"
                      className="w-full px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">Dial Minimum</label>
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
                    <label className="text-[8px] text-slate-400 block mb-0.5">Target / Maximum</label>
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
            ) : editorMode === "donut" ? (
              /* Donut Slices Unit */
              <div>
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Circular Slice Metric
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1">
                    <label className="text-[8px] text-slate-400 block mb-0.5">Unit Symbol</label>
                    <input
                      type="text"
                      value={chart.yAxis?.unit ?? "%"}
                      onChange={(e) =>
                        onUpdateChart({
                          yAxis: { ...(chart.yAxis || {}), unit: e.target.value },
                        })
                      }
                      placeholder="%, units, items"
                      className="w-full px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>
                  <div className="px-2.5 py-1 rounded-md bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800/50 text-[9px] font-mono font-bold text-[#9D61FF]">
                    Total: {totalSliceValue} {chart.yAxis?.unit || "%"}
                  </div>
                </div>
              </div>
            ) : (
              /* Cartesian Standard Y-Axis & Scale */
              <div>
                <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Axis & Units Configuration
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">Unit Symbol</label>
                    <input
                      type="text"
                      value={chart.yAxis?.unit ?? "%"}
                      onChange={(e) =>
                        onUpdateChart({
                          yAxis: { ...(chart.yAxis || {}), unit: e.target.value },
                        })
                      }
                      placeholder="%, hrs, pts"
                      className="w-full px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[10px] font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">Min Value</label>
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
                    <label className="text-[8px] text-slate-400 block mb-0.5">Max Value</label>
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
            )}
          </div>

          {/* ── C. DATA POINTS / SLICES / ROWS MANAGER (Tailored by Chart Type) ── */}
          <div className="pt-1 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[9.5px] font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1">
                <Database className="w-2.5 h-2.5 text-[#9D61FF]" />
                <span>
                  {editorMode === "donut"
                    ? `Slices (${dataPoints.length})`
                    : editorMode === "gauge"
                    ? "Gauge Telemetry Value"
                    : editorMode === "table"
                    ? `Table Rows (${dataPoints.length})`
                    : editorMode === "heatmap"
                    ? `Heatmap Rows (${dataPoints.length})`
                    : editorMode === "radar"
                    ? `Audit Dimensions (${dataPoints.length})`
                    : editorMode === "funnel"
                    ? `Stages (${dataPoints.length})`
                    : `Data Points (${dataPoints.length})`}
                </span>
              </span>

              <div className="flex items-center gap-1.5">
                {/* 1-Click Load Chart Preset Template Button */}
                <button
                  type="button"
                  onClick={() => handleApplyPresetTemplate(0)}
                  className="text-[8px] font-bold text-[#9D61FF] bg-[#9D61FF]/10 hover:bg-[#9D61FF]/20 px-1.5 py-0.5 rounded flex items-center gap-0.5 transition-colors cursor-pointer"
                  title="Load industry preset dataset for this chart type"
                >
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>Preset Data</span>
                </button>

                {/* Series 2 toggle for Cartesian multi-series */}
                {dataPoints.length > 0 &&
                  (editorMode === "standard" || editorMode === "multi-series") && (
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
                  )}

                {/* Add Point / Slice Button (not for single gauge) */}
                {editorMode !== "gauge" && (
                  <button
                    type="button"
                    onClick={handleAddPoint}
                    className="flex items-center gap-0.5 text-[8.5px] font-bold text-[#9D61FF] hover:underline cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5" />
                    <span>
                      {editorMode === "donut" ? "Add Slice" : "Add Point"}
                    </span>
                  </button>
                )}
              </div>
            </div>

            {/* ── SPECIALIZED GAUGE VIEW ── */}
            {editorMode === "gauge" ? (
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[9px] font-semibold text-slate-700 dark:text-zinc-300">
                    Gauge Telemetry Label
                  </label>
                  <span className="text-[8px] font-mono text-purple-600 dark:text-purple-400 font-bold">
                    Target: {chart.dataPoints?.[0]?.target ?? chart.yAxis?.max ?? 100}
                  </span>
                </div>
                <input
                  type="text"
                  value={chart.dataPoints?.[0]?.label || chart.title || "Safety Compliance"}
                  onChange={(e) => {
                    const val = chart.dataPoints?.[0]?.value ?? 85;
                    const target = chart.dataPoints?.[0]?.target ?? 100;
                    onUpdateChart({
                      dataPoints: [{ id: "g1", label: e.target.value, value: val, target }],
                    });
                  }}
                  placeholder="e.g. Overall Safety Index"
                  className="w-full px-2 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[10px] font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">Current Value</label>
                    <input
                      type="number"
                      value={chart.dataPoints?.[0]?.value ?? 85}
                      onChange={(e) => {
                        const lbl = chart.dataPoints?.[0]?.label || "Safety Compliance";
                        const target = chart.dataPoints?.[0]?.target ?? 100;
                        onUpdateChart({
                          dataPoints: [
                            { id: "g1", label: lbl, value: Number(e.target.value), target },
                          ],
                        });
                      }}
                      className="w-full px-2 py-1 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold font-mono text-purple-600 dark:text-purple-400 text-center focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>

                  <div>
                    <label className="text-[8px] text-slate-400 block mb-0.5">Target Value</label>
                    <input
                      type="number"
                      value={chart.dataPoints?.[0]?.target ?? 100}
                      onChange={(e) => {
                        const lbl = chart.dataPoints?.[0]?.label || "Safety Compliance";
                        const val = chart.dataPoints?.[0]?.value ?? 85;
                        onUpdateChart({
                          dataPoints: [
                            { id: "g1", label: lbl, value: val, target: Number(e.target.value) },
                          ],
                        });
                      }}
                      className="w-full px-2 py-1 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-bold font-mono text-slate-700 dark:text-zinc-300 text-center focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>
                </div>

                {/* Visual Progress Bar preview */}
                <div className="pt-1">
                  <div className="h-2 w-full bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden flex">
                    <div
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(
                            0,
                            ((chart.dataPoints?.[0]?.value ?? 85) /
                              (chart.dataPoints?.[0]?.target ?? 100)) *
                              100
                          )
                        )}%`,
                        backgroundColor: chart.color || "#9D61FF",
                      }}
                      className="h-full rounded-full transition-all duration-300"
                    />
                  </div>
                  <div className="flex justify-between text-[8px] font-mono text-slate-400 mt-0.5">
                    <span>{chart.yAxis?.min ?? 0}</span>
                    <span>
                      {Math.round(
                        ((chart.dataPoints?.[0]?.value ?? 85) /
                          (chart.dataPoints?.[0]?.target ?? 100)) *
                          100
                      )}
                      % Completed
                    </span>
                    <span>{chart.dataPoints?.[0]?.target ?? 100}</span>
                  </div>
                </div>
              </div>
            ) : dataPoints.length > 0 ? (
              /* ── DATA POINTS LIST ── */
              <div className="space-y-1.5 max-h-44 overflow-y-auto [scrollbar-width:thin] [scrollbar-color:rgba(157,97,255,0.3)_transparent] pr-0.5">
                {dataPoints.map((pt, idx) => {
                  const showSec =
                    dataPoints.some((p) => p.secondaryValue !== undefined) ||
                    Boolean(chart.series && chart.series.length > 1);

                  // Computed slice percentage for donut / pie
                  const slicePct =
                    totalSliceValue > 0
                      ? Math.round(((pt.value || 0) / totalSliceValue) * 100)
                      : 0;

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
                        placeholder={
                          editorMode === "donut"
                            ? "Slice Name"
                            : editorMode === "radar"
                            ? "Audit Dimension"
                            : editorMode === "funnel"
                            ? "Stage Name"
                            : "Category / Label"
                        }
                        className="flex-1 min-w-[70px] px-1.5 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[10px] text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                      />

                      {/* Primary Numerical Value Input */}
                      <input
                        type="number"
                        value={pt.value}
                        onChange={(e) => handleUpdatePoint(idx, { value: Number(e.target.value) })}
                        placeholder="Val"
                        title={editorMode === "donut" ? "Slice Proportion" : "Primary Value"}
                        className="w-12 px-1 py-0.5 rounded border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-[10px] font-mono text-slate-800 dark:text-zinc-200 text-right focus:outline-none focus:border-[#9D61FF]"
                      />

                      {/* Donut Slice % Badge */}
                      {editorMode === "donut" && (
                        <span className="text-[8px] font-mono font-bold text-purple-600 dark:text-purple-400 min-w-[28px] text-right">
                          {slicePct}%
                        </span>
                      )}

                      {/* Secondary Value Input for Multi-Series */}
                      {showSec && editorMode !== "donut" && (
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

                      {/* Point / Slice Color Swatch */}
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
                  onClick={() => handleApplyPresetTemplate(0)}
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
