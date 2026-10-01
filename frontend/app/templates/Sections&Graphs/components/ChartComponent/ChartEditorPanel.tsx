"use client";

import React, { useState, useMemo } from "react";
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
  ArrowUp,
  ArrowDown,
  Layers,
  Gauge,
  Percent,
} from "lucide-react";
import {
  LibraryChartCard,
  GraphType,
  ChartDataPoint,
  ChartAxisConfig,
  ChartCustomizationOptions,
  ChartSeriesConfig,
} from "@/lib/redux/slices/reportModuleSlice";
import ChartRenderer from "./ChartRenderer";
import {
  CHART_TYPE_OPTIONS,
  PALETTE_COLORS,
  THEME_PRESETS,
  getChartSeriesConfig,
} from "../constants/chartTypes";
import {
  getChartEditorMode,
  getChartTypePresets,
  getInitialDataForChartType,
  ChartEditorMode,
  ChartPresetDefinition,
} from "../constants/chartDataPresets";

const COMMON_UNITS = ["%", "workers", "ppm", "hrs", "pts", "deg", "cases", "dB", "None"];

const DEFAULT_SERIES_PALETTE = [
  "#9D61FF",
  "#10B981",
  "#F59E0B",
  "#F43F5E",
  "#06B6D4",
  "#3B82F6",
  "#8B5CF6",
  "#EC4899",
  "#14B8A6",
  "#F97316",
];

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
  chartSeries?: ChartSeriesConfig[];
  setChartSeries?: React.Dispatch<React.SetStateAction<ChartSeriesConfig[]>>;
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
  chartSeries,
  setChartSeries,
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

  const editorMode = getChartEditorMode(chartType);
  const defaultBaseConfig = getChartSeriesConfig(chartType, chartColor);

  // Dynamic Series Configuration State (for multi-series charts like grouped-bar, multi-line, etc.)
  const [internalSeries, setInternalSeries] = useState<ChartSeriesConfig[]>(() => {
    if (editingChart?.series && editingChart.series.length > 0) {
      return editingChart.series;
    }
    return defaultBaseConfig.map((s, idx) => ({
      id: s.id || `s-${idx + 1}`,
      name: s.label || `Series ${idx + 1}`,
      color: chartColors[idx] || s.defaultColor,
      data: [],
    }));
  });

  const currentSeriesList: ChartSeriesConfig[] =
    chartSeries !== undefined && chartSeries.length > 0 ? chartSeries : internalSeries;

  const changeSeriesList = (next: ChartSeriesConfig[] | ((prev: ChartSeriesConfig[]) => ChartSeriesConfig[])) => {
    if (typeof next === "function") {
      setInternalSeries((prev) => {
        const resolved = next(prev);
        if (setChartSeries) setChartSeries(resolved);
        return resolved;
      });
    } else {
      setInternalSeries(next);
      if (setChartSeries) setChartSeries(next);
    }
  };

  // Harmonized series config combining default metadata with dynamic series items
  const seriesConfig = useMemo(() => {
    if (currentSeriesList.length > 0 && (editorMode === "multi-series" || currentSeriesList.length > 1)) {
      return currentSeriesList.map((s, idx) => ({
        id: s.id || `s-${idx + 1}`,
        label: s.name || `Series ${idx + 1}`,
        defaultColor: s.color || chartColors[idx] || DEFAULT_SERIES_PALETTE[idx % DEFAULT_SERIES_PALETTE.length],
      }));
    }
    return defaultBaseConfig;
  }, [currentSeriesList, editorMode, defaultBaseConfig, chartColors]);

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
      // Also update color in currentSeriesList
      changeSeriesList((prev) =>
        prev.map((s, idx) => (idx === safeActiveIndex ? { ...s, color: newColor } : s))
      );
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
    changeSeriesList((prev) =>
      prev.map((s, idx) => ({
        ...s,
        color: newColors[idx] || s.color,
      }))
    );
  };

  const getPointSeriesValue = (pt: ChartDataPoint, sIdx: number): number => {
    if (sIdx === 0) return pt.value ?? 0;
    if (sIdx === 1) return pt.secondaryValue ?? 0;
    if (sIdx === 2) return pt.tertiaryValue ?? 0;
    if (sIdx === 3) return pt.quaternaryValue ?? 0;
    if (pt.rowValues && pt.rowValues[sIdx] !== undefined) {
      const v = pt.rowValues[sIdx];
      return typeof v === "number" ? v : parseFloat(v as string) || 0;
    }
    return 0;
  };

  const handleUpdatePointSeries = (pointIdx: number, sIdx: number, val: number) => {
    const updated = [...currentDataPoints];
    const pt = { ...updated[pointIdx] };
    if (sIdx === 0) pt.value = val;
    else if (sIdx === 1) pt.secondaryValue = val;
    else if (sIdx === 2) pt.tertiaryValue = val;
    else if (sIdx === 3) pt.quaternaryValue = val;

    const rowVals = pt.rowValues ? [...pt.rowValues] : [];
    while (rowVals.length <= sIdx) {
      rowVals.push(0);
    }
    rowVals[sIdx] = val;
    pt.rowValues = rowVals;
    updated[pointIdx] = pt;
    changeDataPoints(updated);
  };

  const handleAddSeries = () => {
    const newIdx = currentSeriesList.length;
    const newColor = DEFAULT_SERIES_PALETTE[newIdx % DEFAULT_SERIES_PALETTE.length];
    const newSeries: ChartSeriesConfig = {
      id: `series_${Date.now()}`,
      name:
        chartType === "multi-line"
          ? `Line ${newIdx + 1}`
          : chartType === "stacked-bar"
          ? `Stack ${newIdx + 1}`
          : chartType === "combo"
          ? `Trend ${newIdx} (Line)`
          : `Series ${newIdx + 1}`,
      color: newColor,
      data: currentDataPoints.map((pt) => getPointSeriesValue(pt, newIdx)),
    };
    const nextSeriesList = [...currentSeriesList, newSeries];
    changeSeriesList(nextSeriesList);

    // Add color to chartColors
    setChartColors((prev) => {
      const next = [...prev];
      next[newIdx] = newColor;
      return next;
    });

    // Initialize values for all existing data points for this series
    const updatedPts = currentDataPoints.map((pt) => {
      const rowVals = pt.rowValues ? [...pt.rowValues] : [];
      while (rowVals.length < newIdx) {
        rowVals.push(0);
      }
      rowVals[newIdx] = 0;
      const updatedPt = { ...pt, rowValues: rowVals };
      if (newIdx === 1 && updatedPt.secondaryValue === undefined) updatedPt.secondaryValue = 0;
      if (newIdx === 2 && updatedPt.tertiaryValue === undefined) updatedPt.tertiaryValue = 0;
      if (newIdx === 3 && updatedPt.quaternaryValue === undefined) updatedPt.quaternaryValue = 0;
      return updatedPt;
    });
    changeDataPoints(updatedPts);
    setActiveSeriesIndex(newIdx);
  };

  const handleRemoveSeries = (sIdx: number) => {
    if (currentSeriesList.length <= 1) return;
    const nextSeriesList = currentSeriesList.filter((_, i) => i !== sIdx);
    changeSeriesList(nextSeriesList);

    // Remove from chartColors
    setChartColors((prev) => prev.filter((_, i) => i !== sIdx));

    // Update data points row values
    const updatedPts = currentDataPoints.map((pt) => {
      const oldVals: number[] = [];
      for (let i = 0; i < currentSeriesList.length; i++) {
        oldVals.push(getPointSeriesValue(pt, i));
      }
      const newVals = oldVals.filter((_, i) => i !== sIdx);
      const updatedPt: ChartDataPoint = {
        ...pt,
        value: newVals[0] ?? 0,
        secondaryValue: newVals[1],
        tertiaryValue: newVals[2],
        quaternaryValue: newVals[3],
        rowValues: newVals,
      };
      return updatedPt;
    });
    changeDataPoints(updatedPts);

    if (activeSeriesIndex >= nextSeriesList.length) {
      setActiveSeriesIndex(Math.max(0, nextSeriesList.length - 1));
    }
  };

  const handleRenameSeries = (sIdx: number, newName: string) => {
    const nextSeriesList = currentSeriesList.map((s, i) => (i === sIdx ? { ...s, name: newName } : s));
    changeSeriesList(nextSeriesList);
  };

  // ── Data Point Handlers ──────────────────────────────────────────────────
  const handleAddPoint = () => {
    const nextIdx = currentDataPoints.length + 1;
    const initialRowVals = currentSeriesList.map((_, i) => (i === 0 ? 60 : i === 1 ? 50 : 40));
    const newPoint: ChartDataPoint = {
      id: `pt_${Date.now()}`,
      label: `Category ${nextIdx}`,
      value: initialRowVals[0] ?? 60,
      secondaryValue: initialRowVals[1] ?? 50,
      tertiaryValue: initialRowVals[2],
      quaternaryValue: initialRowVals[3],
      rowValues: initialRowVals,
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

  const handleApplyPreset = (preset: ChartPresetDefinition) => {
    changeDataPoints(preset.points);
    changeYAxis({
      ...currentYAxis,
      unit: preset.unit !== undefined ? preset.unit : currentYAxis.unit,
      min: preset.yMin !== undefined ? preset.yMin : currentYAxis.min,
      max: preset.yMax !== undefined ? preset.yMax : currentYAxis.max,
      title: preset.yAxisTitle !== undefined ? preset.yAxisTitle : currentYAxis.title,
    });
    if (preset.xAxisTitle) {
      changeXAxis({
        ...currentXAxis,
        title: preset.xAxisTitle,
      });
    }
  };

  // ── Mode-Specific Handlers ───────────────────────────────────────────────
  const chartPresets = getChartTypePresets(chartType, chartColor);

  // Heatmap Matrix Handlers
  const handleUpdateHeatmapCell = (rowIdx: number, colIdx: number, val: number) => {
    const updated = [...currentDataPoints];
    const row = updated[rowIdx]
      ? { ...updated[rowIdx] }
      : { id: `r_${rowIdx + 1}`, label: `Week ${rowIdx + 1}`, value: val };
    const rowVals = row.rowValues ? [...row.rowValues] : Array(currentCols).fill(row.value ?? 90);
    rowVals[colIdx] = val;
    row.rowValues = rowVals;
    row.value = Number(rowVals[0]) || val;
    updated[rowIdx] = row;
    changeDataPoints(updated);
  };

  const handleUpdateHeatmapRowLabel = (rowIdx: number, label: string) => {
    const updated = [...currentDataPoints];
    if (updated[rowIdx]) {
      updated[rowIdx] = { ...updated[rowIdx], label };
      changeDataPoints(updated);
    }
  };

  const handleAddHeatmapRow = () => {
    const nextIdx = currentDataPoints.length + 1;
    const newRow: ChartDataPoint = {
      id: `r_${Date.now()}`,
      label: `Week ${nextIdx}`,
      value: 92,
      rowValues: Array(currentCols).fill(92),
    };
    changeDataPoints([...currentDataPoints, newRow]);
  };

  const handleDeleteHeatmapRow = (rowIdx: number) => {
    if (currentDataPoints.length <= 1) return;
    changeDataPoints(currentDataPoints.filter((_, i) => i !== rowIdx));
  };

  const handleBatchHeatmap = (type: "all95" | "weekday" | "random") => {
    const updated = currentDataPoints.map((pt) => {
      let rowValues: number[] = [];
      if (type === "all95") {
        rowValues = Array(currentCols).fill(95);
      } else if (type === "weekday") {
        rowValues = Array.from({ length: currentCols }, (_, c) => (c >= 5 ? 78 : 96));
      } else {
        rowValues = Array.from({ length: currentCols }, () => Math.floor(Math.random() * 20 + 78));
      }
      return {
        ...pt,
        value: rowValues[0] ?? 90,
        rowValues,
      };
    });
    changeDataPoints(updated);
  };

  // KPI Card Handlers
  const handleUpdateKpi = (
    idx: number,
    field: keyof ChartDataPoint,
    val: string | number | undefined
  ) => {
    const updated = [...currentDataPoints];
    if (updated[idx]) {
      updated[idx] = { ...updated[idx], [field]: val };
      changeDataPoints(updated);
    }
  };

  const handleAddKpi = () => {
    if (currentDataPoints.length >= 4) return;
    const nextIdx = currentDataPoints.length + 1;
    const newKpi: ChartDataPoint = {
      id: `kpi_${Date.now()}`,
      label: `Metric ${nextIdx}`,
      value: 100,
      status: "100%",
      trend: "+0%",
      trendDirection: "up",
      color: chartColors[nextIdx % chartColors.length] || chartColor,
    };
    changeDataPoints([...currentDataPoints, newKpi]);
  };

  const handleDeleteKpi = (idx: number) => {
    if (currentDataPoints.length <= 1) return;
    changeDataPoints(currentDataPoints.filter((_, i) => i !== idx));
  };

  // Two-Segment Handlers
  const handleBalanceTwoSegment = () => {
    if (currentDataPoints.length < 2) return;
    const seg1 = currentDataPoints[0]?.value ?? 50;
    const seg2 = Math.max(0, 100 - seg1);
    const updated = [...currentDataPoints];
    updated[1] = { ...updated[1], value: seg2 };
    changeDataPoints(updated);
  };

  // Gauge Handlers
  const handleUpdateGaugeValue = (val: number) => {
    const updated = [...currentDataPoints];
    if (updated[0]) {
      updated[0] = { ...updated[0], value: val };
    } else {
      updated[0] = { id: "gauge_1", label: "Gauge Reading", value: val, status: "Optimal" };
    }
    changeDataPoints(updated);
  };

  const handleUpdateGaugeStatus = (status: string) => {
    const updated = [...currentDataPoints];
    if (updated[0]) {
      updated[0] = { ...updated[0], status };
    } else {
      updated[0] = { id: "gauge_1", label: "Gauge Reading", value: 85, status };
    }
    changeDataPoints(updated);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden animate-fadeIn text-slate-900 dark:text-white bg-transparent h-full">
      {/* Title & Caption Row */}
      {!hideTitleAndCaption && (
        <div className="flex-shrink-0 flex gap-4 px-6 py-3.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/40 dark:bg-zinc-900/30">
          <div className="flex-1">
            <label className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wide block mb-1">
              Chart Title (Optional)
            </label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => setChartTitle(e.target.value)}
              placeholder="e.g. PPE Compliance by Work Zone (Optional)"
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
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${activeTab === "type"
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
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${activeTab === "data"
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
              className={`flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-t-lg transition-all border-b-2 cursor-pointer ${activeTab === "axis"
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
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition-all ${isSelected
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
                    Quick Presets ({editorMode})
                  </span>
                  <span className="text-[10px] text-slate-400">Click to autofill data</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                  {chartPresets.map((preset) => (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() => handleApplyPreset(preset)}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-[11px] font-medium text-slate-600 dark:text-zinc-300 hover:border-[#9D61FF] hover:text-[#9D61FF] bg-slate-50 dark:bg-zinc-800/60 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
                    >
                      {preset.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Mode-Specific Data Editor Container */}
              <div className="flex-1 overflow-auto custom-scrollbar p-3.5 space-y-3">
                {/* 1. HEATMAP MATRIX EDITOR */}
                {editorMode === "heatmap" && (
                  <div className="space-y-3">
                    {/* Quick batch tools */}
                    <div className="flex items-center justify-between p-2 rounded-xl bg-purple-50/60 dark:bg-purple-950/20 border border-purple-200/60 dark:border-purple-900/40">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                        <Grid className="w-3.5 h-3.5 text-[#9D61FF]" />
                        {currentDataPoints.length} Rows × {currentCols} Days Matrix
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleBatchHeatmap("all95")}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100/50 cursor-pointer"
                        >
                          Fill 95%
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBatchHeatmap("weekday")}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100/50 cursor-pointer"
                        >
                          Weekday Pattern
                        </button>
                        <button
                          type="button"
                          onClick={() => handleBatchHeatmap("random")}
                          className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-100/50 cursor-pointer"
                        >
                          Randomize
                        </button>
                      </div>
                    </div>

                    {/* Matrix Spreadsheet Grid */}
                    <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 p-2 shadow-2xs">
                      <div
                        className="grid gap-1.5 items-center mb-2 pb-1.5 border-b border-slate-200/70 dark:border-zinc-800 text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                        style={{
                          gridTemplateColumns: `minmax(75px, 90px) repeat(${currentCols}, minmax(42px, 1fr)) 28px`,
                        }}
                      >
                        <span>Week / Shift</span>
                        {["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"]
                          .slice(0, currentCols)
                          .map((day, dIdx) => (
                            <span key={dIdx} className="text-center font-mono">
                              {day}
                            </span>
                          ))}
                        <span className="text-center"></span>
                      </div>

                      <div className="space-y-1.5">
                        {currentDataPoints.map((pt, rIdx) => {
                          const rowVals = pt.rowValues && pt.rowValues.length > 0
                            ? pt.rowValues
                            : Array(currentCols).fill(pt.value || 90);

                          return (
                            <div
                              key={pt.id || rIdx}
                              className="grid gap-1.5 items-center hover:bg-purple-50/20 dark:hover:bg-purple-950/10 p-1 rounded-lg transition-colors"
                              style={{
                                gridTemplateColumns: `minmax(75px, 90px) repeat(${currentCols}, minmax(42px, 1fr)) 28px`,
                              }}
                            >
                              <input
                                type="text"
                                value={pt.label}
                                onChange={(e) => handleUpdateHeatmapRowLabel(rIdx, e.target.value)}
                                placeholder={`Row ${rIdx + 1}`}
                                className="w-full px-1.5 py-1 text-xs rounded-md border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-medium focus:outline-none focus:border-[#9D61FF]"
                              />
                              {Array.from({ length: currentCols }, (_, cIdx) => {
                                const val = Number(rowVals[cIdx] ?? 90);
                                const isHigh = val >= 90;
                                const isMed = val >= 80 && val < 90;

                                return (
                                  <input
                                    key={cIdx}
                                    type="number"
                                    value={val}
                                    onChange={(e) =>
                                      handleUpdateHeatmapCell(
                                        rIdx,
                                        cIdx,
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    className={`w-full py-1 text-center text-xs font-mono font-bold rounded-md border transition-all focus:outline-none focus:ring-1 focus:ring-[#9D61FF] ${isHigh
                                        ? "bg-purple-500/15 text-[#9D61FF] dark:text-[#a78bfa] border-purple-500/30"
                                        : isMed
                                          ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                                          : "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30"
                                      }`}
                                  />
                                );
                              })}
                              <div className="flex items-center justify-center">
                                <button
                                  type="button"
                                  disabled={currentDataPoints.length <= 1}
                                  onClick={() => handleDeleteHeatmapRow(rIdx)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                                  title="Delete row"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddHeatmapRow}
                      className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Matrix Row</span>
                    </button>
                  </div>
                )}

                {/* 2. GAUGE EDITOR */}
                {editorMode === "gauge" && (
                  <div className="space-y-4">
                    {/* Primary Hero Gauge Reading */}
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                          <Gauge className="w-4 h-4 text-[#9D61FF]" />
                          Current Telemetry Reading
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-purple-500/10 text-[#9D61FF] font-bold">
                          Unit: {currentYAxis.unit || "%"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <input
                          type="number"
                          value={currentDataPoints[0]?.value ?? 85}
                          onChange={(e) => handleUpdateGaugeValue(parseFloat(e.target.value) || 0)}
                          className="flex-1 px-4 py-2.5 text-2xl font-black font-mono rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 text-[#9D61FF] dark:text-[#a78bfa] focus:outline-none focus:border-[#9D61FF]"
                          placeholder="85"
                        />
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">
                            Sensor Label
                          </span>
                          <input
                            type="text"
                            value={currentDataPoints[0]?.label || "Live Telemetry Gauge"}
                            onChange={(e) => handleUpdatePoint(0, "label", e.target.value)}
                            placeholder="Gauge Label"
                            className="px-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-medium focus:outline-none focus:border-[#9D61FF]"
                          />
                        </div>
                      </div>

                      {/* Quick Shortcut Pills */}
                      <div className="flex items-center gap-1.5 pt-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">
                          Quick Set:
                        </span>
                        {[25, 50, 75, 85, 95].map((val) => (
                          <button
                            key={val}
                            type="button"
                            onClick={() => handleUpdateGaugeValue(val)}
                            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-[10px] font-bold font-mono text-slate-600 dark:text-zinc-300 hover:border-[#9D61FF] hover:text-[#9D61FF] bg-slate-50 dark:bg-zinc-800/60 cursor-pointer"
                          >
                            {val}
                            {currentYAxis.unit || "%"}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Status & Scale Card */}
                    <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-3 shadow-2xs">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 block">
                        Status & Health Alert
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {["Optimal", "Normal", "Warning", "Critical"].map((st) => {
                          const currentSt = currentDataPoints[0]?.status || "Optimal";
                          const isSel = currentSt === st;
                          return (
                            <button
                              key={st}
                              type="button"
                              onClick={() => handleUpdateGaugeStatus(st)}
                              className={`py-1.5 px-2 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center ${isSel
                                  ? st === "Optimal"
                                    ? "bg-emerald-500/15 text-emerald-600 border-emerald-500 shadow-2xs"
                                    : st === "Normal"
                                      ? "bg-blue-500/15 text-blue-600 border-blue-500 shadow-2xs"
                                      : st === "Warning"
                                        ? "bg-amber-500/15 text-amber-600 border-amber-500 shadow-2xs"
                                        : "bg-rose-500/15 text-rose-600 border-rose-500 shadow-2xs"
                                  : "border-slate-200 dark:border-zinc-800 text-slate-500 hover:border-slate-300"
                                }`}
                            >
                              {st}
                            </button>
                          );
                        })}
                      </div>

                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-zinc-800/80">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                            Min Scale
                          </label>
                          <input
                            type="number"
                            value={currentYAxis.min ?? 0}
                            onChange={(e) =>
                              changeYAxis({
                                ...currentYAxis,
                                min: parseFloat(e.target.value) || 0,
                              })
                            }
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                            Max Scale
                          </label>
                          <input
                            type="number"
                            value={currentYAxis.max ?? 100}
                            onChange={(e) =>
                              changeYAxis({
                                ...currentYAxis,
                                max: parseFloat(e.target.value) || 100,
                              })
                            }
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-center"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                            Target Alert
                          </label>
                          <input
                            type="number"
                            value={currentDataPoints[0]?.target ?? 85}
                            onChange={(e) =>
                              handleUpdatePoint(0, "target", parseFloat(e.target.value) || 0)
                            }
                            className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-center text-amber-500 font-bold"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* 3. KPI CARDS EDITOR */}
                {editorMode === "kpi-card" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700 dark:text-zinc-200">
                        Executive KPI Metrics ({currentDataPoints.length}/4)
                      </span>
                    </div>

                    <div className="space-y-2.5">
                      {currentDataPoints.slice(0, 4).map((kpi, idx) => (
                        <div
                          key={kpi.id || idx}
                          className="p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-2xs space-y-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-[#9D61FF] uppercase tracking-wider">
                              Card #{idx + 1}
                            </span>
                            <button
                              type="button"
                              disabled={currentDataPoints.length <= 1}
                              onClick={() => handleDeleteKpi(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">
                                Metric Title
                              </label>
                              <input
                                type="text"
                                value={kpi.label}
                                onChange={(e) => handleUpdateKpi(idx, "label", e.target.value)}
                                placeholder="e.g. PPE Compliance"
                                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">
                                Display Value / Status
                              </label>
                              <input
                                type="text"
                                value={kpi.status || String(kpi.value)}
                                onChange={(e) => {
                                  handleUpdateKpi(idx, "status", e.target.value);
                                  const num = parseFloat(e.target.value.replace(/[^0-9.]/g, ""));
                                  if (!isNaN(num)) handleUpdateKpi(idx, "value", num);
                                }}
                                placeholder="e.g. 97.4% or 18,750"
                                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-bold font-mono text-[#9D61FF]"
                              />
                            </div>
                          </div>

                          <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
                            <div className="flex-1">
                              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">
                                Trend Delta
                              </label>
                              <input
                                type="text"
                                value={kpi.trend || "+0%"}
                                onChange={(e) => handleUpdateKpi(idx, "trend", e.target.value)}
                                placeholder="+2.1%"
                                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono font-medium"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">
                                Direction
                              </label>
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleUpdateKpi(idx, "trendDirection", "up")}
                                  className={`p-1 rounded-lg border cursor-pointer ${kpi.trendDirection !== "down"
                                      ? "bg-emerald-500/15 border-emerald-500 text-emerald-600"
                                      : "border-slate-200 dark:border-zinc-800 text-slate-400"
                                    }`}
                                  title="Trending Up"
                                >
                                  <ArrowUp className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleUpdateKpi(idx, "trendDirection", "down")}
                                  className={`p-1 rounded-lg border cursor-pointer ${kpi.trendDirection === "down"
                                      ? "bg-rose-500/15 border-rose-500 text-rose-600"
                                      : "border-slate-200 dark:border-zinc-800 text-slate-400"
                                    }`}
                                  title="Trending Down"
                                >
                                  <ArrowDown className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {currentDataPoints.length < 4 && (
                      <button
                        type="button"
                        onClick={handleAddKpi}
                        className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add KPI Metric Card</span>
                      </button>
                    )}
                  </div>
                )}

                {/* 4. MULTI-SERIES DYNAMIC SPREADSHEET EDITOR (multi-line, grouped-bar, combo, stacked-bar, etc.) */}
                {editorMode === "multi-series" && (
                  <div className="space-y-2">
                    {/* Header Controls */}
                    <div className="flex items-center justify-between pb-1">
                      <span className="text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                        {chartType === "multi-line"
                          ? "Time Points & Data Lines"
                          : chartType === "grouped-bar"
                          ? "Categories & Grouped Series"
                          : chartType === "stacked-bar"
                          ? "Categories & Stack Layers"
                          : chartType === "combo"
                          ? "Categories & Combo Metrics"
                          : "Categories & Series Columns"}
                      </span>
                      <button
                        type="button"
                        onClick={handleAddSeries}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#9D61FF]/10 hover:bg-[#9D61FF]/20 text-[#9D61FF] border border-[#9D61FF]/30 transition-colors cursor-pointer"
                        title="Add another dynamic series"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {chartType === "multi-line"
                            ? "Add Line"
                            : chartType === "grouped-bar"
                            ? "Add Series"
                            : chartType === "stacked-bar"
                            ? "Add Stack"
                            : chartType === "combo"
                            ? "Add Trend Line"
                            : "Add Series"}
                        </span>
                      </button>
                    </div>

                    <div className="overflow-x-auto custom-scrollbar pb-2">
                      <div className="space-y-1.5" style={{ minWidth: `${Math.max(480, 160 + currentSeriesList.length * 110)}px` }}>
                        {/* Table Header with Editable Series Names */}
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2 py-1">
                          <div className="w-36 flex-shrink-0">
                            {chartType === "multi-line" || chartType === "combo" ? "Time / Period" : "Category / Group"}
                          </div>
                          {currentSeriesList.map((s, sIdx) => {
                            const sColor = chartColors[sIdx] || s.color || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length];
                            return (
                              <div
                                key={s.id || sIdx}
                                className="flex-1 min-w-[100px] flex items-center gap-1.5 bg-slate-100/70 dark:bg-zinc-800/60 px-2 py-1 rounded-lg border border-slate-200/60 dark:border-zinc-700/60"
                              >
                                <span
                                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 shadow-2xs"
                                  style={{ backgroundColor: sColor }}
                                />
                                <input
                                  type="text"
                                  value={s.name}
                                  onChange={(e) => handleRenameSeries(sIdx, e.target.value)}
                                  placeholder={`Series ${sIdx + 1}`}
                                  className="w-full bg-transparent text-xs font-semibold text-slate-800 dark:text-zinc-200 focus:outline-none focus:text-[#9D61FF] truncate"
                                  title="Click to rename this series"
                                />
                                {currentSeriesList.length > 1 && (
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveSeries(sIdx)}
                                    className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer p-0.5"
                                    title="Delete this series"
                                  >
                                    <X className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            );
                          })}
                          <div className="w-8 flex-shrink-0 text-center" />
                        </div>

                        {/* Data Rows */}
                        {currentDataPoints.map((pt, idx) => (
                          <div
                            key={pt.id || idx}
                            className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-2xs hover:border-[#9D61FF]/40 transition-colors"
                          >
                            <div className="w-36 flex-shrink-0">
                              <input
                                type="text"
                                value={pt.label}
                                onChange={(e) => handleUpdatePoint(idx, "label", e.target.value)}
                                placeholder="e.g. Jan"
                                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium focus:outline-none focus:border-[#9D61FF]"
                              />
                            </div>
                            {currentSeriesList.map((s, sIdx) => {
                              const val = getPointSeriesValue(pt, sIdx);
                              const sColor = chartColors[sIdx] || s.color || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length];
                              return (
                                <div key={s.id || sIdx} className="flex-1 min-w-[100px]">
                                  <input
                                    type="number"
                                    value={val}
                                    onChange={(e) =>
                                      handleUpdatePointSeries(idx, sIdx, parseFloat(e.target.value) || 0)
                                    }
                                    placeholder="0"
                                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-bold font-mono text-center focus:outline-none focus:border-[#9D61FF]"
                                    style={{ color: sColor }}
                                  />
                                </div>
                              );
                            })}
                            <div className="w-8 flex-shrink-0 flex items-center justify-center">
                              <button
                                type="button"
                                disabled={currentDataPoints.length <= 1}
                                onClick={() => handleDeletePoint(idx)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>
                        {chartType === "multi-line"
                          ? "Add Time Point"
                          : chartType === "combo"
                          ? "Add Period Row"
                          : "Add Category Row"}
                      </span>
                    </button>
                  </div>
                )}

                {/* 5. SCATTER & BUBBLE PLOT EDITOR */}
                {(editorMode === "scatter" || editorMode === "bubble") && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-4">Point Label</span>
                      <span className="col-span-3 text-center">X Coordinate</span>
                      <span className="col-span-3 text-center">
                        {editorMode === "bubble" ? "Y Coord" : "Y Value"}
                      </span>
                      {editorMode === "bubble" && (
                        <span className="col-span-1 text-center">Size</span>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      {currentDataPoints.map((pt, idx) => (
                        <div
                          key={pt.id || idx}
                          className="grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-2xs hover:border-[#9D61FF]/40 transition-colors"
                        >
                          <span className="col-span-1 text-center text-xs font-mono text-slate-400 font-bold">
                            {idx + 1}
                          </span>
                          {/* Label */}
                          <div className={editorMode === "bubble" ? "col-span-3" : "col-span-4"}>
                            <input
                              type="text"
                              value={pt.label}
                              onChange={(e) => handleUpdatePoint(idx, "label", e.target.value)}
                              placeholder="Node Name"
                              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium"
                            />
                          </div>
                          {/* X Coordinate */}
                          <div className={editorMode === "bubble" ? "col-span-2" : "col-span-3"}>
                            <input
                              type="number"
                              value={pt.x ?? pt.value}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                handleUpdatePoint(idx, "x", val);
                                handleUpdatePoint(idx, "value", val);
                              }}
                              placeholder="X"
                              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-center font-bold text-[#9D61FF]"
                            />
                          </div>
                          {/* Y Coordinate */}
                          <div className={editorMode === "bubble" ? "col-span-2" : "col-span-3"}>
                            <input
                              type="number"
                              value={pt.y ?? pt.secondaryValue ?? 50}
                              onChange={(e) => {
                                const val = parseFloat(e.target.value) || 0;
                                handleUpdatePoint(idx, "y", val);
                                handleUpdatePoint(idx, "secondaryValue", val);
                              }}
                              placeholder="Y"
                              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-center font-bold text-emerald-600 dark:text-emerald-400"
                            />
                          </div>
                          {/* Bubble Size */}
                          {editorMode === "bubble" && (
                            <div className="col-span-2">
                              <input
                                type="number"
                                value={pt.size ?? 16}
                                min={4}
                                max={50}
                                onChange={(e) =>
                                  handleUpdatePoint(idx, "size", parseFloat(e.target.value) || 16)
                                }
                                placeholder="Size"
                                className="w-full px-1.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-center font-bold text-amber-500"
                              />
                            </div>
                          )}
                          <div className="col-span-1 flex items-center justify-center">
                            <button
                              type="button"
                              disabled={currentDataPoints.length <= 1}
                              onClick={() => handleDeletePoint(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Coordinate Point</span>
                    </button>
                  </div>
                )}

                {/* 6. STACKED HORIZONTAL EDITOR */}
                {editorMode === "stacked-horizontal" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                      <span className="col-span-5">Worksite / Zone</span>
                      <span className="col-span-3 text-center text-emerald-600 dark:text-emerald-400">
                        Safe / Passed
                      </span>
                      <span className="col-span-3 text-center text-rose-500">Violations</span>
                      <span className="col-span-1 text-center"></span>
                    </div>

                    <div className="space-y-1.5">
                      {currentDataPoints.map((pt, idx) => {
                        const val1 = pt.value || 0;
                        const val2 = pt.secondaryValue || 0;
                        const total = val1 + val2 || 1;
                        const pct1 = Math.round((val1 / total) * 100);

                        return (
                          <div
                            key={pt.id || idx}
                            className="p-2 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-2xs space-y-1.5"
                          >
                            <div className="grid grid-cols-12 gap-2 items-center">
                              <div className="col-span-5">
                                <input
                                  type="text"
                                  value={pt.label}
                                  onChange={(e) => handleUpdatePoint(idx, "label", e.target.value)}
                                  placeholder="Worksite Name"
                                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium"
                                />
                              </div>
                              <div className="col-span-3">
                                <input
                                  type="number"
                                  value={pt.value}
                                  onChange={(e) =>
                                    handleUpdatePoint(idx, "value", parseFloat(e.target.value) || 0)
                                  }
                                  placeholder="Safe"
                                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-bold font-mono text-emerald-600 text-center"
                                />
                              </div>
                              <div className="col-span-3">
                                <input
                                  type="number"
                                  value={pt.secondaryValue ?? 0}
                                  onChange={(e) =>
                                    handleUpdatePoint(
                                      idx,
                                      "secondaryValue",
                                      parseFloat(e.target.value) || 0
                                    )
                                  }
                                  placeholder="Risk"
                                  className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-bold font-mono text-rose-500 text-center"
                                />
                              </div>
                              <div className="col-span-1 flex items-center justify-center">
                                <button
                                  type="button"
                                  disabled={currentDataPoints.length <= 1}
                                  onClick={() => handleDeletePoint(idx)}
                                  className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                            {/* Visual ratio bar */}
                            <div className="h-1.5 w-full bg-rose-500/20 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${pct1}%` }}
                                className="h-full bg-emerald-500 transition-all"
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Worksite Row</span>
                    </button>
                  </div>
                )}

                {/* 7. TWO-SEGMENT COMPARISON EDITOR — Dynamic Segments */}
                {editorMode === "two-segment" && (() => {
                  const totalPct = currentDataPoints.reduce((s, p) => s + (p.value || 0), 0);
                  const SEGMENT_COLORS = [
                    "#10B981", "#9D61FF", "#3B82F6", "#F59E0B", "#F43F5E",
                    "#06B6D4", "#8B5CF6", "#EC4899", "#14B8A6", "#EF4444",
                  ];

                  const handleAddSegment = () => {
                    const nextIdx = currentDataPoints.length;
                    const defaultVal = Math.max(0, Math.round((100 - totalPct) / 2));
                    const newSeg: import("@/lib/redux/slices/reportModuleSlice").ChartDataPoint = {
                      id: `seg_${Date.now()}`,
                      label: `Segment ${nextIdx + 1}`,
                      value: defaultVal,
                      secondaryValue: 100,
                      color: SEGMENT_COLORS[nextIdx % SEGMENT_COLORS.length],
                    };
                    changeDataPoints([...currentDataPoints, newSeg]);
                  };

                  const handleBalanceAll = () => {
                    const n = currentDataPoints.length;
                    if (n === 0) return;
                    const each = Math.round(100 / n);
                    const updated = currentDataPoints.map((p, i) => ({
                      ...p,
                      value: i === n - 1 ? 100 - each * (n - 1) : each,
                    }));
                    changeDataPoints(updated);
                  };

                  return (
                    <div className="space-y-3">
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-700 dark:text-zinc-200 flex items-center gap-1.5">
                          <Layers className="w-3.5 h-3.5 text-[#9D61FF]" />
                          Segments ({currentDataPoints.length})
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={handleBalanceAll}
                            className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 hover:bg-purple-500/20 cursor-pointer"
                          >
                            Balance to 100%
                          </button>
                        </div>
                      </div>

                      {/* Segment List */}
                      <div className="space-y-2">
                        {currentDataPoints.map((pt, idx) => {
                          const pct = Math.round(pt.value || 0);
                          const segColor = pt.color || SEGMENT_COLORS[idx % SEGMENT_COLORS.length];
                          const isFirst = idx === 0;

                          return (
                            <div
                              key={pt.id || idx}
                              className="p-2.5 rounded-xl border bg-white dark:bg-zinc-900 shadow-2xs space-y-2 transition-colors hover:border-[#9D61FF]/30"
                              style={{ borderColor: `${segColor}40` }}
                            >
                              {/* Row 1: colour · label · value · delete */}
                              <div className="grid grid-cols-12 gap-2 items-center">
                                {/* Colour swatch */}
                                <div className="col-span-1 flex items-center justify-center">
                                  <div
                                    className="w-4 h-4 rounded-full border-2 border-white dark:border-zinc-800 shadow cursor-pointer ring-2 ring-offset-1"
                                    style={{ backgroundColor: segColor, "--tw-ring-color": segColor } as React.CSSProperties} title="Segment colour"
                                  />
                                </div>
                                {/* Label */}
                                <div className="col-span-6">
                                  <input
                                    type="text"
                                    value={pt.label}
                                    onChange={(e) => handleUpdatePoint(idx, "label", e.target.value)}
                                    placeholder={`Segment ${idx + 1}`}
                                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium focus:outline-none focus:border-[#9D61FF]"
                                  />
                                </div>
                                {/* Value (0-100) */}
                                <div className="col-span-3">
                                  <input
                                    type="number"
                                    value={pct}
                                    min={0}
                                    max={100}
                                    onChange={(e) =>
                                      handleUpdatePoint(idx, "value", parseFloat(e.target.value) || 0)
                                    }
                                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono font-bold text-center focus:outline-none focus:border-[#9D61FF]"
                                    style={{ color: segColor }}
                                  />
                                </div>
                                {/* Delete */}
                                <div className="col-span-2 flex items-center justify-end gap-1">
                                  <span className="text-[9px] font-mono text-slate-400">{pct}%</span>
                                  <button
                                    type="button"
                                    disabled={currentDataPoints.length <= 1}
                                    onClick={() => handleDeletePoint(idx)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>

                              {/* Row 2: colour picker pills */}
                              <div className="flex items-center gap-1 flex-wrap">
                                <span className="text-[9px] font-bold text-slate-400 uppercase mr-1">Colour:</span>
                                {SEGMENT_COLORS.map((c) => (
                                  <button
                                    key={c}
                                    type="button"
                                    onClick={() => handleUpdatePoint(idx, "color", c)}
                                    className="w-4 h-4 rounded-full border-2 transition-transform hover:scale-110 cursor-pointer"
                                    style={{
                                      backgroundColor: c,
                                      borderColor: pt.color === c ? "white" : "transparent",
                                      boxShadow: pt.color === c ? `0 0 0 1.5px ${c}` : "none",
                                    }}
                                  />
                                ))}
                              </div>

                              {/* Row 3: visual fill bar */}
                              <div className="h-1.5 w-full bg-slate-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: segColor }}
                                  className="h-full rounded-full transition-all"
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Total bar */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800">
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total</span>
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-24 bg-slate-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                            <div
                              style={{ width: `${Math.min(totalPct, 100)}%` }}
                              className={`h-full rounded-full transition-all ${totalPct > 100 ? "bg-rose-500" : totalPct === 100 ? "bg-emerald-500" : "bg-[#9D61FF]"
                                }`}
                            />
                          </div>
                          <span
                            className={`text-[11px] font-mono font-bold ${totalPct > 100 ? "text-rose-500" : totalPct === 100 ? "text-emerald-500" : "text-[#9D61FF]"
                              }`}
                          >
                            {totalPct}%
                          </span>
                        </div>
                      </div>

                      {/* Add segment */}
                      <button
                        type="button"
                        onClick={handleAddSegment}
                        className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add Segment</span>
                      </button>
                    </div>
                  );
                })()}


                {/* 8. DONUT & PIE EDITOR */}
                {editorMode === "donut" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-5">Slice Category</span>
                      <span className="col-span-3 text-center">Value</span>
                      <span className="col-span-2 text-center">% Share</span>
                      <span className="col-span-1 text-center"></span>
                    </div>

                    {(() => {
                      const totalVal =
                        currentDataPoints.reduce((sum, p) => sum + (p.value || 0), 0) || 1;

                      return (
                        <div className="space-y-1.5">
                          {currentDataPoints.map((pt, idx) => {
                            const pct = ((pt.value / totalVal) * 100).toFixed(1);
                            return (
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
                                    onChange={(e) =>
                                      handleUpdatePoint(idx, "label", e.target.value)
                                    }
                                    placeholder="Hazard / Slice"
                                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium"
                                  />
                                </div>
                                <div className="col-span-3">
                                  <input
                                    type="number"
                                    value={pt.value}
                                    onChange={(e) =>
                                      handleUpdatePoint(
                                        idx,
                                        "value",
                                        parseFloat(e.target.value) || 0
                                      )
                                    }
                                    placeholder="0"
                                    className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono font-bold text-[#9D61FF] text-center"
                                  />
                                </div>
                                <div className="col-span-2 flex items-center justify-center">
                                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-purple-500/10 text-[#9D61FF]">
                                    {pct}%
                                  </span>
                                </div>
                                <div className="col-span-1 flex items-center justify-center">
                                  <button
                                    type="button"
                                    disabled={currentDataPoints.length <= 1}
                                    onClick={() => handleDeletePoint(idx)}
                                    className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      );
                    })()}

                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Pie / Donut Slice</span>
                    </button>
                  </div>
                )}

                {/* 9. FUNNEL / STAGE PROGRESSION EDITOR */}
                {editorMode === "funnel" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-5">Stage Name</span>
                      <span className="col-span-3 text-center">Count / Throughput</span>
                      <span className="col-span-2 text-center">Stage Drop</span>
                      <span className="col-span-1 text-center"></span>
                    </div>

                    <div className="space-y-1.5">
                      {currentDataPoints.map((pt, idx) => {
                        const prevVal = currentDataPoints[idx - 1]?.value || pt.value;
                        const drop =
                          idx > 0 && prevVal > 0
                            ? `${Math.round((pt.value / prevVal) * 100)}%`
                            : "100%";

                        return (
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
                                placeholder="Stage Name"
                                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium"
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
                                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono font-bold text-[#9D61FF] text-center"
                              />
                            </div>
                            <div className="col-span-2 flex items-center justify-center">
                              <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                                {drop}
                              </span>
                            </div>
                            <div className="col-span-1 flex items-center justify-center">
                              <button
                                type="button"
                                disabled={currentDataPoints.length <= 1}
                                onClick={() => handleDeletePoint(idx)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Funnel Stage</span>
                    </button>
                  </div>
                )}

                {/* 10. TIMELINE / ROADMAP EDITOR */}
                {editorMode === "timeline" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-5">Milestone / Task</span>
                      <span className="col-span-3 text-center">Duration (Days)</span>
                      <span className="col-span-2 text-center">Status</span>
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
                              placeholder="Milestone"
                              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium"
                            />
                          </div>
                          <div className="col-span-3">
                            <input
                              type="number"
                              value={pt.value}
                              onChange={(e) =>
                                handleUpdatePoint(idx, "value", parseFloat(e.target.value) || 0)
                              }
                              placeholder="Days"
                              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono font-bold text-[#9D61FF] text-center"
                            />
                          </div>
                          <div className="col-span-2">
                            <select
                              value={pt.status || "In Progress"}
                              onChange={(e) => handleUpdatePoint(idx, "status", e.target.value)}
                              className="w-full px-1.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-semibold"
                            >
                              <option value="Completed">Done</option>
                              <option value="In Progress">Active</option>
                              <option value="Pending">Queue</option>
                              <option value="Delayed">Delay</option>
                            </select>
                          </div>
                          <div className="col-span-1 flex items-center justify-center">
                            <button
                              type="button"
                              disabled={currentDataPoints.length <= 1}
                              onClick={() => handleDeletePoint(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Milestone Task</span>
                    </button>
                  </div>
                )}

                {/* 11. GEO-MAP / ZONES EDITOR */}
                {editorMode === "geo-map" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-3">Facility / Site</span>
                      <span className="col-span-2 text-center">X Pos %</span>
                      <span className="col-span-2 text-center">Y Pos %</span>
                      <span className="col-span-2 text-center">Score</span>
                      <span className="col-span-1 text-center">Status</span>
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
                          {/* Site Name */}
                          <div className="col-span-3">
                            <input
                              type="text"
                              value={pt.label}
                              onChange={(e) => handleUpdatePoint(idx, "label", e.target.value)}
                              placeholder="Site Name"
                              className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium"
                            />
                          </div>
                          {/* X position (0-100) */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={typeof pt.x === "number" ? pt.x : 50}
                              min={0}
                              max={100}
                              onChange={(e) =>
                                handleUpdatePoint(idx, "x", parseFloat(e.target.value) || 0)
                              }
                              placeholder="X %"
                              className="w-full px-1.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-center font-bold text-[#9D61FF]"
                            />
                          </div>
                          {/* Y position (0-100) */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={pt.y ?? 50}
                              min={0}
                              max={100}
                              onChange={(e) =>
                                handleUpdatePoint(idx, "y", parseFloat(e.target.value) || 0)
                              }
                              placeholder="Y %"
                              className="w-full px-1.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-center font-bold text-emerald-600 dark:text-emerald-400"
                            />
                          </div>
                          {/* Alert Metric Value */}
                          <div className="col-span-2">
                            <input
                              type="number"
                              value={pt.value}
                              onChange={(e) =>
                                handleUpdatePoint(idx, "value", parseFloat(e.target.value) || 0)
                              }
                              placeholder="Score"
                              className="w-full px-1.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono font-bold text-amber-500 text-center"
                            />
                          </div>
                          {/* Risk Level */}
                          <div className="col-span-1">
                            <select
                              value={pt.status || "Normal"}
                              onChange={(e) => handleUpdatePoint(idx, "status", e.target.value)}
                              className="w-full px-1 py-1 text-[10px] rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-semibold"
                            >
                              <option value="Optimal">✓</option>
                              <option value="Normal">~</option>
                              <option value="Warning">!</option>
                              <option value="Critical">✕</option>
                            </select>
                          </div>
                          <div className="col-span-1 flex items-center justify-center">
                            <button
                              type="button"
                              disabled={currentDataPoints.length <= 1}
                              onClick={() => handleDeletePoint(idx)}
                              className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Facility Zone</span>
                    </button>
                  </div>
                )}

                {/* 12. SPARKLINE CHANNEL EDITOR */}
                {editorMode === "sparkline" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-2 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200/60 dark:border-emerald-900/40">
                      <span className="text-[10px] font-bold text-slate-600 dark:text-zinc-300 uppercase tracking-wider flex items-center gap-1">
                        <Activity className="w-3.5 h-3.5 text-emerald-500" />
                        {currentDataPoints.length} Channels — Edit sparkline values (comma separated)
                      </span>
                    </div>
                    <div className="space-y-2.5">
                      {currentDataPoints.map((pt, idx) => {
                        const vals = (pt.rowValues && pt.rowValues.length > 0)
                          ? pt.rowValues.map(v => (typeof v === "number" ? v : parseFloat(String(v)) || 0))
                          : [10, 20, 15, 30, 25, 35];
                        return (
                          <div key={pt.id || idx} className="p-3 rounded-2xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-2xs space-y-2">
                            <div className="flex items-center justify-between">
                              <input
                                type="text"
                                value={pt.label}
                                onChange={(e) => handleUpdatePoint(idx, "label", e.target.value)}
                                placeholder={`Channel ${idx + 1} Name`}
                                className="flex-1 px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-bold"
                              />
                              <button
                                type="button"
                                disabled={currentDataPoints.length <= 1}
                                onClick={() => handleDeletePoint(idx)}
                                className="p-1 ml-2 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="grid grid-cols-6 gap-1.5">
                              {vals.map((v, ci) => (
                                <input
                                  key={ci}
                                  type="number"
                                  value={v}
                                  onChange={(e) => {
                                    const newVals = [...vals];
                                    newVals[ci] = parseFloat(e.target.value) || 0;
                                    const updated = [...currentDataPoints];
                                    updated[idx] = { ...updated[idx], rowValues: newVals, value: newVals[0] ?? v };
                                    changeDataPoints(updated);
                                  }}
                                  placeholder={`T${ci + 1}`}
                                  className="w-full px-1 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-center font-bold text-[#9D61FF]"
                                />
                              ))}
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                const updated = [...currentDataPoints];
                                updated[idx] = { ...updated[idx], rowValues: [...vals, 0] };
                                changeDataPoints(updated);
                              }}
                              className="text-[10px] font-bold text-[#9D61FF] hover:text-purple-700 cursor-pointer"
                            >
                              + Add Time Point
                            </button>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Sparkline Channel</span>
                    </button>
                  </div>
                )}

                {/* 13. WATERFALL STEP EDITOR */}
                {editorMode === "waterfall" && (
                  <div className="space-y-2">
                    <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                      <span className="col-span-1 text-center">#</span>
                      <span className="col-span-4">Step / Event</span>
                      <span className="col-span-3 text-center">Net Change</span>
                      <span className="col-span-3 text-center">Type</span>
                      <span className="col-span-1 text-center"></span>
                    </div>
                    <div className="space-y-1.5">
                      {currentDataPoints.map((pt, idx) => {
                        const isNeg = pt.value < 0;
                        return (
                          <div
                            key={pt.id || idx}
                            className="grid grid-cols-12 gap-2 items-center p-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-900 shadow-2xs hover:border-[#9D61FF]/40 transition-colors"
                          >
                            <span className="col-span-1 text-center text-xs font-mono font-bold text-slate-400">{idx + 1}</span>
                            <div className="col-span-4">
                              <input
                                type="text"
                                value={pt.label}
                                onChange={(e) => handleUpdatePoint(idx, "label", e.target.value)}
                                placeholder="Step Name"
                                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-medium"
                              />
                            </div>
                            <div className="col-span-3">
                              <input
                                type="number"
                                value={pt.value}
                                onChange={(e) =>
                                  handleUpdatePoint(idx, "value", parseFloat(e.target.value) || 0)
                                }
                                placeholder="e.g. +20 or -15"
                                className={`w-full px-2 py-1 text-xs rounded-lg border bg-slate-50/50 dark:bg-zinc-950 font-mono font-bold text-center focus:outline-none focus:border-[#9D61FF] ${isNeg
                                    ? "border-rose-400 text-rose-500"
                                    : "border-emerald-400 text-emerald-600"
                                  }`}
                              />
                            </div>
                            <div className="col-span-3">
                              <select
                                value={pt.status || "add"}
                                onChange={(e) => handleUpdatePoint(idx, "status", e.target.value)}
                                className="w-full px-1.5 py-1 text-[11px] rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950 font-semibold"
                              >
                                <option value="start">Base / Start</option>
                                <option value="add">Positive (+)</option>
                                <option value="sub">Negative (−)</option>
                                <option value="total">Total / Net</option>
                              </select>
                            </div>
                            <div className="col-span-1 flex items-center justify-center">
                              <button
                                type="button"
                                disabled={currentDataPoints.length <= 1}
                                onClick={() => handleDeletePoint(idx)}
                                className="p-1 rounded text-slate-400 hover:text-rose-500 disabled:opacity-30 cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    <button
                      type="button"
                      onClick={handleAddPoint}
                      className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Waterfall Step</span>
                    </button>
                  </div>
                )}

                {/* 14. STANDARD TABLE EDITOR (table, radar, treemap, and standard bar/line/area) */}
                {![
                  "heatmap",
                  "gauge",
                  "kpi-card",
                  "multi-series",
                  "scatter",
                  "bubble",
                  "stacked-horizontal",
                  "two-segment",
                  "donut",
                  "funnel",
                  "timeline",
                  "geo-map",
                  "sparkline",
                  "waterfall",
                ].includes(editorMode) && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider px-2">
                        <span className="col-span-1 text-center">#</span>
                        <span className="col-span-5">
                          {chartType === "radar"
                            ? "Audit Dimension / Axis"
                            : chartType === "treemap"
                            ? "Category / Hazard"
                            : chartType === "line" || chartType === "area"
                            ? "Time / Period (X-Axis)"
                            : chartType === "bar" || chartType === "horizontal-bar"
                            ? "Category / Bar Label"
                            : "Label / Category"}
                        </span>
                        <span className="col-span-3 text-center">
                          {chartType === "radar"
                            ? "Actual Score"
                            : chartType === "treemap"
                            ? "Share / Size (%)"
                            : chartType === "line"
                            ? "Line Value"
                            : chartType === "area"
                            ? "Area Value"
                            : chartType === "bar" || chartType === "horizontal-bar"
                            ? "Bar Value"
                            : "Value"}
                        </span>
                        <span className="col-span-2 text-center">
                          {chartType === "radar" ? "Target Score" : "Target (Opt.)"}
                        </span>
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
                                placeholder={
                                  chartType === "line" || chartType === "area"
                                    ? "e.g. Jan / 08:00"
                                    : chartType === "radar"
                                    ? "e.g. PPE / Response"
                                    : chartType === "treemap"
                                    ? "e.g. Civil / Electrical"
                                    : "e.g. Zone A"
                                }
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
                                className="w-full px-2 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-bold font-mono text-[#9D61FF] dark:text-[#a78bfa] text-center focus:outline-none focus:border-[#9D61FF]"
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
                                    e.target.value === ""
                                      ? undefined
                                      : parseFloat(e.target.value) || 0
                                  )
                                }
                                placeholder="Opt."
                                className="w-full px-1.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-950 font-mono text-slate-500 text-center focus:outline-none focus:border-[#9D61FF]"
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

                      <button
                        type="button"
                        onClick={handleAddPoint}
                        className="w-full py-2 px-3 border border-dashed border-[#9D61FF]/40 rounded-xl text-xs font-bold text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>
                          {chartType === "bar" || chartType === "horizontal-bar"
                            ? "Add Bar / Category"
                            : chartType === "line" || chartType === "area"
                            ? "Add Time Point"
                            : chartType === "radar"
                            ? "Add Dimension"
                            : chartType === "treemap"
                            ? "Add Item"
                            : "Add Data Point"}
                        </span>
                      </button>
                    </div>
                  )}
              </div>

              {/* Data Summary Stats */}
              <div className="px-4 py-2 border-t border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 text-[11px] font-mono text-slate-500 dark:text-zinc-400 flex items-center justify-between flex-shrink-0">
                <span>Total Items: {currentDataPoints.length}</span>
                <span>
                  Max: {Math.max(...currentDataPoints.map((p) => p.value || 0), 0)} | Min:{" "}
                  {Math.min(...currentDataPoints.map((p) => p.value || 0), 0)}
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
                        className={`px-2 py-0.5 rounded-md text-[10px] font-semibold border transition-colors cursor-pointer ${(currentYAxis.unit || "") === (u === "None" ? "" : u)
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
                        key={s.id || idx}
                        type="button"
                        onClick={() => setActiveSeriesIndex(idx)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs transition-all cursor-pointer border ${isSelected
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
                  <button
                    type="button"
                    onClick={handleAddSeries}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-semibold text-[#9D61FF] bg-[#9D61FF]/10 hover:bg-[#9D61FF]/20 border border-[#9D61FF]/30 transition-colors cursor-pointer"
                    title="Add another dynamic series"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add</span>
                  </button>
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
                          className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${currentRows === num
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
                          className={`w-6 h-6 rounded-md text-xs font-bold transition-all cursor-pointer ${currentCols === num
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
                  title: chartTitle,
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
                  series: currentSeriesList.map((s, idx) => ({
                    ...s,
                    color: chartColors[idx] || s.color || DEFAULT_SERIES_PALETTE[idx % DEFAULT_SERIES_PALETTE.length],
                  })),
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
              className="px-5 py-2.5 rounded-xl bg-[#9D61FF] text-white text-sm font-bold hover:bg-purple-600 transition-colors cursor-pointer shadow-md shadow-purple-500/20"
            >
              Save Chart
            </button>
          )}
        </div>
      )}
    </div>
  );
}
