"use client";

import React, { useState } from "react";
import {
  X,
  Activity,
  Grid,
  TableProperties,
  SlidersHorizontal,
  Plus,
  Trash2,
  Sparkles,
  RotateCcw,
  Hash,
  Check,
} from "lucide-react";
import {
  LibraryChartCard,
  GraphType,
  ChartDataPoint,
  ChartAxisConfig,
  ChartCustomizationOptions,
} from "@/lib/redux/slices/reportModuleSlice";
import ChartRenderer from "./ChartRenderer";
import {
  CHART_TYPE_OPTIONS,
  PALETTE_COLORS,
  THEME_PRESETS,
  getChartSeriesConfig,
} from "./constants/chartTypes";

const PRESET_DATASETS: {
  name: string;
  unit: string;
  yMin: number;
  yMax: number;
  points: ChartDataPoint[];
}[] = [
  {
    name: "PPE Compliance",
    unit: "%",
    yMin: 0,
    yMax: 100,
    points: [
      { id: "p1", label: "Zone A (Welding)", value: 96, secondaryValue: 90 },
      { id: "p2", label: "Zone B (Assembly)", value: 92, secondaryValue: 88 },
      { id: "p3", label: "Zone C (Warehouse)", value: 85, secondaryValue: 80 },
      { id: "p4", label: "Zone D (Loading)", value: 98, secondaryValue: 95 },
      { id: "p5", label: "Zone E (Chemical)", value: 99, secondaryValue: 92 },
    ],
  },
  {
    name: "Hourly Telemetry",
    unit: "ppm",
    yMin: 0,
    yMax: 120,
    points: [
      { id: "p1", label: "08:00", value: 45, secondaryValue: 50 },
      { id: "p2", label: "10:00", value: 78, secondaryValue: 70 },
      { id: "p3", label: "12:00", value: 95, secondaryValue: 85 },
      { id: "p4", label: "14:00", value: 110, secondaryValue: 90 },
      { id: "p5", label: "16:00", value: 88, secondaryValue: 80 },
      { id: "p6", label: "18:00", value: 62, secondaryValue: 60 },
    ],
  },
  {
    name: "Weekly Workers",
    unit: "workers",
    yMin: 0,
    yMax: 200,
    points: [
      { id: "p1", label: "Mon", value: 142, secondaryValue: 130 },
      { id: "p2", label: "Tue", value: 156, secondaryValue: 140 },
      { id: "p3", label: "Wed", value: 168, secondaryValue: 150 },
      { id: "p4", label: "Thu", value: 162, secondaryValue: 145 },
      { id: "p5", label: "Fri", value: 150, secondaryValue: 135 },
      { id: "p6", label: "Sat", value: 85, secondaryValue: 80 },
    ],
  },
  {
    name: "Gas Sensors",
    unit: "ppm",
    yMin: 0,
    yMax: 50,
    points: [
      { id: "p1", label: "Sensor 01", value: 12, secondaryValue: 25 },
      { id: "p2", label: "Sensor 02", value: 18, secondaryValue: 25 },
      { id: "p3", label: "Sensor 03", value: 29, secondaryValue: 25 },
      { id: "p4", label: "Sensor 04", value: 15, secondaryValue: 25 },
      { id: "p5", label: "Sensor 05", value: 8, secondaryValue: 25 },
    ],
  },
  {
    name: "Safety Incidents",
    unit: "cases",
    yMin: 0,
    yMax: 10,
    points: [
      { id: "p1", label: "Q1", value: 4, secondaryValue: 6 },
      { id: "p2", label: "Q2", value: 2, secondaryValue: 5 },
      { id: "p3", label: "Q3", value: 1, secondaryValue: 4 },
      { id: "p4", label: "Q4", value: 0, secondaryValue: 3 },
    ],
  },
];

const COMMON_UNITS = ["%", "workers", "ppm", "hrs", "pts", "deg", "cases", "dB", "None"];

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
  gridRows?: number;
  setGridRows?: (val: number) => void;
  gridCols?: number;
  setGridCols?: (val: number) => void;
  // Dynamic Chart Values & Axis
  chartDataPoints?: ChartDataPoint[];
  setChartDataPoints?: React.Dispatch<React.SetStateAction<ChartDataPoint[]>>;
  chartXAxis?: ChartAxisConfig;
  setChartXAxis?: React.Dispatch<React.SetStateAction<ChartAxisConfig>>;
  chartYAxis?: ChartAxisConfig;
  setChartYAxis?: React.Dispatch<React.SetStateAction<ChartAxisConfig>>;
  chartOptions?: ChartCustomizationOptions;
  setChartOptions?: React.Dispatch<React.SetStateAction<ChartCustomizationOptions>>;
  onSave?: () => void;
  onClose?: () => void;
  hideTitleAndCaption?: boolean;
  hideFooter?: boolean;
}

/**
 * Dedicated Fullscreen/Inline Editor Panel for Telemetry Charts.
 * Includes metadata configuration, 25 visualization types selection, spreadsheet data point editor,
 * dynamic X/Y axis scaling, unit customizer, multi-series color theming, and real-time live preview.
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
  gridRows,
  setGridRows,
  gridCols,
  setGridCols,
  chartDataPoints,
  setChartDataPoints,
  chartXAxis,
  setChartXAxis,
  chartYAxis,
  setChartYAxis,
  chartOptions,
  setChartOptions,
  onSave,
  onClose,
  hideTitleAndCaption = false,
  hideFooter = false,
}: ChartEditorPanelProps) {
  const [activeTab, setActiveTab] = useState<"type" | "data" | "axis">("type");

  const [internalGridRows, setInternalGridRows] = useState(
    editingChart?.gridRows || (chartType === "table" ? 4 : 4)
  );
  const [internalGridCols, setInternalGridCols] = useState(
    editingChart?.gridCols || (chartType === "table" ? 4 : 7)
  );

  const currentRows = gridRows !== undefined ? gridRows : internalGridRows;
  const currentCols = gridCols !== undefined ? gridCols : internalGridCols;
  const changeRows = setGridRows || setInternalGridRows;
  const changeCols = setGridCols || setInternalGridCols;

  const [inputRowsText, setInputRowsText] = useState<string | null>(null);
  const [inputColsText, setInputColsText] = useState<string | null>(null);

  // Dynamic Data Points State (external or internal fallback)
  const [internalDataPoints, setInternalDataPoints] = useState<ChartDataPoint[]>(
    editingChart?.dataPoints && editingChart.dataPoints.length > 0
      ? editingChart.dataPoints
      : [
          { id: "p1", label: "Zone A", value: 92, secondaryValue: 85 },
          { id: "p2", label: "Zone B", value: 88, secondaryValue: 80 },
          { id: "p3", label: "Zone C", value: 96, secondaryValue: 90 },
          { id: "p4", label: "Zone D", value: 78, secondaryValue: 75 },
          { id: "p5", label: "Zone E", value: 84, secondaryValue: 82 },
        ]
  );
  const currentDataPoints = chartDataPoints !== undefined ? chartDataPoints : internalDataPoints;
  const changeDataPoints = setChartDataPoints || setInternalDataPoints;

  // Dynamic Axis State
  const [internalXAxis, setInternalXAxis] = useState<ChartAxisConfig>(
    editingChart?.xAxis || { title: "" }
  );
  const currentXAxis = chartXAxis !== undefined ? chartXAxis : internalXAxis;
  const changeXAxis = setChartXAxis || setInternalXAxis;

  const [internalYAxis, setInternalYAxis] = useState<ChartAxisConfig>(
    editingChart?.yAxis || { title: "", unit: "%", min: 0, max: 100 }
  );
  const currentYAxis = chartYAxis !== undefined ? chartYAxis : internalYAxis;
  const changeYAxis = setChartYAxis || setInternalYAxis;

  // Customization Options
  const [internalOptions, setInternalOptions] = useState<ChartCustomizationOptions>(
    editingChart?.options || { showValues: true, showGridLines: true, showLegend: true }
  );
  const currentOptions = chartOptions !== undefined ? chartOptions : internalOptions;
  const changeOptions = setChartOptions || setInternalOptions;

  const handleUpdateRows = (newRows: number) => {
    const clamped = Math.max(1, Math.min(50, newRows));
    changeRows(clamped);
    setInputRowsText(null);
  };

  const handleUpdateCols = (newCols: number) => {
    const clamped = Math.max(1, Math.min(30, newCols));
    changeCols(clamped);
    setInputColsText(null);
  };

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

  // ── Data Point Handlers ──────────────────────────────────────────────────
  const handleAddPoint = () => {
    const nextIdx = currentDataPoints.length + 1;
    const newPoint: ChartDataPoint = {
      id: `pt_${Date.now()}`,
      label: `Category ${nextIdx}`,
      value: 60,
      secondaryValue: 50,
    };
    changeDataPoints([...currentDataPoints, newPoint]);
  };

  const handleUpdatePoint = (
    index: number,
    field: keyof ChartDataPoint,
    val: string | number | undefined
  ) => {
    const updated = [...currentDataPoints];
    updated[index] = {
      ...updated[index],
      [field]: val,
    };
    changeDataPoints(updated);
  };

  const handleDeletePoint = (index: number) => {
    if (currentDataPoints.length <= 1) return;
    const updated = currentDataPoints.filter((_, i) => i !== index);
    changeDataPoints(updated);
  };

  const handleApplyPreset = (preset: typeof PRESET_DATASETS[0]) => {
    changeDataPoints(preset.points);
    changeYAxis({
      ...currentYAxis,
      unit: preset.unit,
      min: preset.yMin,
      max: preset.yMax,
    });
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fadeIn text-slate-900 dark:text-white bg-transparent h-full">
      {/* Title & Caption Row */}
      {!hideTitleAndCaption && (
        <div className="flex-shrink-0 flex gap-4 px-6 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/30">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">
              Chart Title *
            </label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="e.g. PPE Compliance by Work Zone"
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-[#9D61FF]"
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
              placeholder="e.g. Comparative sensor telemetry across zones"
              className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:border-[#9D61FF]"
            />
          </div>
        </div>
      )}

      <div className="flex flex-1 min-h-0 h-full overflow-hidden bg-transparent">
        {/* Left Column: Tabbed Configuration Studio */}
        <div className="w-[430px] lg:w-[470px] xl:w-[500px] flex-shrink-0 border-r border-slate-200/80 dark:border-zinc-800/80 flex flex-col min-h-0 h-full bg-slate-50/25 dark:bg-zinc-950/20">
          {/* Studio Tab Switcher */}
          <div className="flex border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 pt-2.5 gap-1.5 flex-shrink-0 shadow-2xs">
            <button
              type="button"
              onClick={() => setActiveTab("type")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                activeTab === "type"
                  ? "border-[#9D61FF] text-[#9D61FF] bg-purple-50/40 dark:bg-purple-950/20 shadow-2xs"
                  : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Type & Style</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("data")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                activeTab === "data"
                  ? "border-[#9D61FF] text-[#9D61FF] bg-purple-50/40 dark:bg-purple-950/20 shadow-2xs"
                  : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              <TableProperties className="w-3.5 h-3.5" />
              <span>Data & Values</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-purple-500/10 text-[#9D61FF] font-bold">
                {currentDataPoints.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("axis")}
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${
                activeTab === "axis"
                  ? "border-[#9D61FF] text-[#9D61FF] bg-purple-50/40 dark:bg-purple-950/20 shadow-2xs"
                  : "border-transparent text-slate-500 dark:text-zinc-400 hover:text-slate-800 dark:hover:text-zinc-200"
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Axis & Display</span>
            </button>
          </div>

          {/* TAB 1: Visualization Type Selection & Grid Dimensions */}
          {activeTab === "type" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              <div className="px-4 pt-3 pb-2 flex-shrink-0 flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                  Visualization Type
                </span>
                <span className="text-[10px] font-mono text-[#9D61FF] font-bold bg-purple-500/10 border border-purple-500/20 px-2 py-0.5 rounded-md">
                  25 Available
                </span>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar px-3.5 pb-3.5 pt-1">
                <div className="grid grid-cols-5 gap-2 auto-rows-fr">
                  {CHART_TYPE_OPTIONS.map((t) => {
                    const Icon = t.icon;
                    const isSelected = chartType === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => {
                          setChartType(t.id);
                          setActiveSeriesIndex(0);
                        }}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${
                          isSelected
                            ? "border-[#9D61FF] bg-[#9D61FF]/15 text-[#9D61FF] font-bold shadow-[0_0_14px_rgba(157,97,255,0.25)] scale-[1.02]"
                            : "border-slate-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/40 text-slate-600 dark:text-zinc-400 hover:border-[#9D61FF]/50 hover:text-[#9D61FF] hover:bg-purple-500/5"
                        }`}
                      >
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                        <span className="text-[9px] sm:text-[10px] text-center leading-tight font-medium">
                          {t.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Dynamic Data Points & Spreadsheet Value Editor */}
          {activeTab === "data" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
              {/* Preset Telemetry Datasets */}
              <div className="px-4 py-2.5 border-b border-slate-200/80 dark:border-zinc-800/80 flex-shrink-0 bg-white dark:bg-zinc-900/50">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#9D61FF]" />
                    Quick Presets
                  </span>
                  <span className="text-[10px] text-slate-400">Click to autofill data</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {PRESET_DATASETS.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-600 dark:text-zinc-300 hover:border-[#9D61FF] hover:text-[#9D61FF] bg-slate-50 dark:bg-zinc-800/60 transition-colors whitespace-nowrap cursor-pointer"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Table / List */}
              <div className="flex-1 overflow-auto custom-scrollbar p-3.5 space-y-2">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                  <span className="col-span-1 text-center">#</span>
                  <span className="col-span-5">Label / Category</span>
                  <span className="col-span-3">Value</span>
                  <span className="col-span-2">Target</span>
                  <span className="col-span-1 text-center"></span>
                </div>

                <div className="space-y-1.5">
                  {currentDataPoints.map((pt, idx) => (
                    <div
                      key={pt.id || idx}
                      className="grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-2xs hover:border-[#9D61FF]/40 transition-colors"
                    >
                      <span className="col-span-1 text-center text-xs font-mono font-bold text-slate-400">
                        {idx + 1}
                      </span>
                      <div className="col-span-5">
                        <input
                          type="text"
                          value={pt.label}
                          onChange={(e) => handleUpdatePoint(idx, "label", e.target.value)}
                          placeholder="Label"
                          className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium focus:outline-none focus:border-[#9D61FF]"
                        />
                      </div>
                      <div className="col-span-3">
                        <input
                          type="number"
                          value={pt.value}
                          onChange={(e) =>
                            handleUpdatePoint(idx, "value", parseFloat(e.target.value) || 0)
                          }
                          placeholder="0"
                          className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-bold font-mono text-[#9D61FF] dark:text-[#a78bfa] focus:outline-none focus:border-[#9D61FF]"
                        />
                      </div>
                      <div className="col-span-2">
                        <input
                          type="number"
                          value={pt.secondaryValue ?? ""}
                          onChange={(e) =>
                            handleUpdatePoint(
                              idx,
                              "secondaryValue",
                              e.target.value === "" ? undefined : parseFloat(e.target.value) || 0
                            )
                          }
                          placeholder="Opt."
                          className="w-full px-1.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-slate-500 focus:outline-none focus:border-[#9D61FF]"
                        />
                      </div>
                      <div className="col-span-1 flex items-center justify-center">
                        <button
                          type="button"
                          disabled={currentDataPoints.length <= 1}
                          onClick={() => handleDeletePoint(idx)}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors disabled:opacity-30 cursor-pointer"
                          title="Delete row"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Add Data Point Button */}
                <button
                  type="button"
                  onClick={handleAddPoint}
                  className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Data Point</span>
                </button>
              </div>

              {/* Data Summary Stats */}
              <div className="px-4 py-2 border-t border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 text-[11px] font-mono text-slate-500 dark:text-zinc-400 flex items-center justify-between flex-shrink-0">
                <span>Total Items: {currentDataPoints.length}</span>
                <span>
                  Max: {Math.max(...currentDataPoints.map((p) => p.value), 0)} | Min:{" "}
                  {Math.min(...currentDataPoints.map((p) => p.value), 0)}
                </span>
              </div>
            </div>
          )}

          {/* TAB 3: Dynamic Axis & Display Customization */}
          {activeTab === "axis" && (
            <div className="flex-1 flex flex-col min-h-0 overflow-auto custom-scrollbar p-4 space-y-4">
              {/* X-Axis Card */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Horizontal (X) Axis
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Categories</span>
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    X-Axis Title
                  </label>
                  <input
                    type="text"
                    value={currentXAxis.title || ""}
                    onChange={(e) => changeXAxis({ ...currentXAxis, title: e.target.value })}
                    placeholder="e.g. Work Zones, Inspection Dates"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
              </div>

              {/* Y-Axis Card */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-2xs">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Vertical (Y) Axis & Scale
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 uppercase">Numerical</span>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Y-Axis Title
                  </label>
                  <input
                    type="text"
                    value={currentYAxis.title || ""}
                    onChange={(e) => changeYAxis({ ...currentYAxis, title: e.target.value })}
                    placeholder="e.g. Compliance Rate, Worker Count, Gas Concentration"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs font-medium focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Min Value
                    </label>
                    <input
                      type="number"
                      value={currentYAxis.min ?? 0}
                      onChange={(e) =>
                        changeYAxis({
                          ...currentYAxis,
                          min: e.target.value === "" ? 0 : parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs font-mono font-bold focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Max Value
                    </label>
                    <input
                      type="number"
                      value={currentYAxis.max ?? 100}
                      onChange={(e) =>
                        changeYAxis({
                          ...currentYAxis,
                          max: e.target.value === "" ? 100 : parseFloat(e.target.value) || 100,
                        })
                      }
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs font-mono font-bold focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Unit Suffix
                  </label>
                  <input
                    type="text"
                    value={currentYAxis.unit || ""}
                    onChange={(e) => changeYAxis({ ...currentYAxis, unit: e.target.value })}
                    placeholder="e.g. %, workers, ppm, hrs"
                    className="w-full px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-xs font-mono font-bold text-[#9D61FF] focus:outline-none focus:border-[#9D61FF] mb-2"
                  />
                  {/* Quick Unit Pills */}
                  <div className="flex flex-wrap gap-1">
                    {COMMON_UNITS.map((u) => (
                      <button
                        key={u}
                        type="button"
                        onClick={() =>
                          changeYAxis({ ...currentYAxis, unit: u === "None" ? "" : u })
                        }
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer ${
                          (currentYAxis.unit || "") === (u === "None" ? "" : u)
                            ? "border-[#9D61FF] bg-[#9D61FF]/10 text-[#9D61FF]"
                            : "border-slate-200 dark:border-zinc-800 text-slate-500 hover:border-slate-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        {u}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Display & Telemetry Toggles Card */}
              <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-2xs">
                <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 block">
                  Display Options
                </span>

                <label className="flex items-center justify-between cursor-pointer py-1">
                  <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    Show Values on Chart
                  </span>
                  <input
                    type="checkbox"
                    checked={currentOptions.showValues ?? true}
                    onChange={(e) =>
                      changeOptions({ ...currentOptions, showValues: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#9D61FF] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1 border-t border-slate-100 dark:border-zinc-800/80">
                  <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    Show Grid Lines
                  </span>
                  <input
                    type="checkbox"
                    checked={currentOptions.showGridLines ?? true}
                    onChange={(e) =>
                      changeOptions({ ...currentOptions, showGridLines: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#9D61FF] rounded cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer py-1 border-t border-slate-100 dark:border-zinc-800/80">
                  <span className="text-xs text-slate-600 dark:text-zinc-300 font-medium">
                    Show Legend
                  </span>
                  <input
                    type="checkbox"
                    checked={currentOptions.showLegend ?? true}
                    onChange={(e) =>
                      changeOptions({ ...currentOptions, showLegend: e.target.checked })
                    }
                    className="w-4 h-4 accent-[#9D61FF] rounded cursor-pointer"
                  />
                </label>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Live Preview Area */}
        <div className="flex-1 min-w-0 min-h-0 flex flex-col bg-transparent px-6 py-3 overflow-hidden">
          {/* Preview Toolbar */}
          <div className="flex flex-col gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800/80 flex-shrink-0">
            {/* Top row: Live Preview badge + Active color swatch palette */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide">
                  Live Preview
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-[#9D61FF] font-bold border border-purple-500/20 uppercase">
                  {chartType}
                </span>
                {currentYAxis.unit && (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 font-semibold border border-slate-200 dark:border-zinc-700">
                    Unit: {currentYAxis.unit}
                  </span>
                )}
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

            {/* Grid & Table Row/Column Dimension Controls */}
            {(chartType === "heatmap" || chartType === "table") && (
              <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl bg-slate-50/90 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800 text-xs shadow-2xs animate-fadeIn mt-1 flex-wrap">
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-zinc-200">
                    <Grid className="w-3.5 h-3.5 text-[#9D61FF]" />
                    <span>{chartType === "heatmap" ? "Heatmap Grid:" : "Table Dimensions:"}</span>
                  </div>

                  {/* Row count buttons + Custom Stepper */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Rows:
                    </span>
                    <div className="flex items-center gap-1">
                      {[2, 3, 4, 5, 6].map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleUpdateRows(num)}
                          className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            currentRows === num
                              ? "bg-[#9D61FF] text-white shadow-2xs scale-105"
                              : "bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-purple-300"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    {/* Custom Row Stepper & Direct Input */}
                    <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 overflow-hidden h-6 ml-0.5 shadow-2xs focus-within:border-[#9D61FF] transition-all">
                      <button
                        type="button"
                        onClick={() => handleUpdateRows(currentRows - 1)}
                        className="w-5 h-full flex items-center justify-center font-bold text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
                        title="Decrease rows"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={inputRowsText !== null ? inputRowsText : currentRows}
                        onFocus={() => setInputRowsText(String(currentRows))}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setInputRowsText(raw);
                          const parsed = parseInt(raw, 10);
                          if (!isNaN(parsed) && parsed >= 1 && parsed <= 50) {
                            changeRows(parsed);
                          }
                        }}
                        onBlur={() => {
                          if (inputRowsText !== null) {
                            const parsed = parseInt(inputRowsText, 10);
                            if (isNaN(parsed) || parsed < 1) {
                              handleUpdateRows(1);
                            } else if (parsed > 50) {
                              handleUpdateRows(50);
                            } else {
                              handleUpdateRows(parsed);
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-8 h-full text-center text-xs font-mono font-bold text-[#9D61FF] dark:text-[#a78bfa] bg-transparent outline-none p-0"
                        title="Custom row count (1-50)"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateRows(currentRows + 1)}
                        className="w-5 h-full flex items-center justify-center font-bold text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
                        title="Increase rows"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="w-[1px] h-4 bg-slate-200 dark:bg-zinc-800 hidden sm:block" />

                  {/* Column count buttons + Custom Stepper */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                      Columns:
                    </span>
                    <div className="flex items-center gap-1">
                      {(chartType === "heatmap" ? [3, 4, 5, 6, 7] : [2, 3, 4, 5, 6]).map((num) => (
                        <button
                          key={num}
                          type="button"
                          onClick={() => handleUpdateCols(num)}
                          className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${
                            currentCols === num
                              ? "bg-[#9D61FF] text-white shadow-2xs scale-105"
                              : "bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-800 hover:border-purple-300"
                          }`}
                        >
                          {num}
                        </button>
                      ))}
                    </div>

                    {/* Custom Column Stepper & Direct Input */}
                    <div className="flex items-center border border-slate-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 overflow-hidden h-6 ml-0.5 shadow-2xs focus-within:border-[#9D61FF] transition-all">
                      <button
                        type="button"
                        onClick={() => handleUpdateCols(currentCols - 1)}
                        className="w-5 h-full flex items-center justify-center font-bold text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
                        title="Decrease columns"
                      >
                        -
                      </button>
                      <input
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        value={inputColsText !== null ? inputColsText : currentCols}
                        onFocus={() => setInputColsText(String(currentCols))}
                        onChange={(e) => {
                          const raw = e.target.value.replace(/\D/g, "");
                          setInputColsText(raw);
                          const parsed = parseInt(raw, 10);
                          if (!isNaN(parsed) && parsed >= 1 && parsed <= 30) {
                            changeCols(parsed);
                          }
                        }}
                        onBlur={() => {
                          if (inputColsText !== null) {
                            const parsed = parseInt(inputColsText, 10);
                            if (isNaN(parsed) || parsed < 1) {
                              handleUpdateCols(1);
                            } else if (parsed > 30) {
                              handleUpdateCols(30);
                            } else {
                              handleUpdateCols(parsed);
                            }
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            (e.target as HTMLInputElement).blur();
                          }
                        }}
                        className="w-8 h-full text-center text-xs font-mono font-bold text-[#9D61FF] dark:text-[#a78bfa] bg-transparent outline-none p-0"
                        title="Custom column count (1-30)"
                      />
                      <button
                        type="button"
                        onClick={() => handleUpdateCols(currentCols + 1)}
                        className="w-5 h-full flex items-center justify-center font-bold text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer text-xs"
                        title="Increase columns"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Badge showing current dimensions */}
                <span className="text-[11px] font-mono font-bold text-[#9D61FF] bg-purple-500/10 px-2.5 py-0.5 rounded-md border border-purple-500/20 flex-shrink-0">
                  {currentRows} Rows × {currentCols} Cols
                </span>
              </div>
            )}
          </div>

          {/* Full Chart Display with Real-Time Data & Axis Scaling */}
          <div className="flex-1 min-w-0 min-h-0 flex items-center justify-center py-2 px-1 overflow-auto custom-scrollbar w-full h-full">
            <div className="w-full h-full min-w-0 min-h-0 flex items-center justify-center">
              <ChartRenderer
                chart={{
                  id: editingChart?.id || "preview",
                  title: chartTitle || "Preview Chart",
                  chartType: chartType,
                  dataSourceField: editingChart?.dataSourceField || "custom_telemetry_feed",
                  description: chartDesc || "Chart description preview",
                  color: chartColor,
                  colors: chartColors,
                  gridRows: currentRows,
                  gridCols: currentCols,
                  dataPoints: currentDataPoints,
                  xAxis: currentXAxis,
                  yAxis: currentYAxis,
                  options: currentOptions,
                }}
                color={chartColor}
                colors={chartColors}
                gridRows={currentRows}
                gridCols={currentCols}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      {!hideFooter && (
        <div className="flex items-center justify-end gap-2 p-4 border-t border-slate-200 dark:border-zinc-800 flex-shrink-0 bg-white dark:bg-[#0c1017]">
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-sm font-semibold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cancel
            </button>
          )}
          {onSave && (
            <button
              type="button"
              onClick={onSave}
              disabled={!chartTitle.trim()}
              className="px-5 py-2.5 rounded-xl bg-[#9D61FF] text-white text-sm font-bold disabled:opacity-50 hover:bg-purple-600 transition-colors cursor-pointer shadow-md shadow-purple-500/20"
            >
              Save Chart
            </button>
          )}
        </div>
      )}
    </div>
  );
}
