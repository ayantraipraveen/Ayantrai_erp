"use client";

import React from "react";
import { LibraryChartCard, ChartDataPoint } from "@/lib/redux/slices/reportModuleSlice";
import { getMetricIconComponent } from "../../utils";

interface ChartRendererProps {
  chart: LibraryChartCard;
  color?: string;
  colors?: string[];
  gridRows?: number;
  gridCols?: number;
  height?: number;
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl" | string;
  customFontSize?: number;
}

/**
 * Renders live SVG visualizations for all 25 supported telemetry chart types.
 * Supports multi-series dynamic color palettes and dynamic row/column grid dimensions.
 */
export default function ChartRenderer({
  chart,
  color = "#3B82F6",
  colors,
  gridRows,
  gridCols,
  height,
  fontSize,
  customFontSize,
}: ChartRendererProps) {
  const chartColors = colors && colors.length > 0 ? colors : chart.colors || [];
  const c0 = chart.color || chartColors[0] || color;
  const c1 = chartColors[1] || "#10B981";
  const c2 = chartColors[2] || "#F59E0B";
  const c3 = chartColors[3] || "#F43F5E";
  const c4 = chartColors[4] || "#06B6D4";
  const DEFAULT_SERIES_PALETTE = [c0, c1, c2, c3, c4, "#8B5CF6", "#EC4899", "#14B8A6", "#F97316", "#06B6D4"];

  const effectiveRows = gridRows ?? chart.gridRows;
  const effectiveCols = gridCols ?? chart.gridCols;

  interface ResolvedChartData {
    categories: string[];
    values: number[];
    secondaryValues?: number[];
    allSeriesValues?: number[][];
    pointColors?: string[];
    yMin: number;
    yMax: number;
    unit: string;
    xAxisTitle?: string;
    yAxisTitle?: string;
    showValues: boolean;
    showGridLines: boolean;
    showLegend: boolean;
    hasCustomData: boolean;
  }

  const resolveChartData = (
    palette: string[],
    fallbackCategories: string[],
    fallbackValues: number[],
    fallbackYMax = 100,
    fallbackUnit = "%"
  ): ResolvedChartData => {
    const hasPoints = Boolean(chart.dataPoints && chart.dataPoints.length > 0);
    const hasSeries = Boolean(chart.series && chart.series.length > 0);
    const hasCustomData = hasPoints || hasSeries;

    let categories = fallbackCategories;
    let values = fallbackValues;
    let secondaryValues: number[] | undefined = undefined;
    let allSeriesValues: number[][] | undefined = undefined;
    let pointColors: string[] | undefined = undefined;

    const getPtSeriesVal = (p: ChartDataPoint, sIdx: number): number => {
      if (sIdx === 0) return p.value ?? 0;
      if (sIdx === 1) return p.secondaryValue ?? 0;
      if (sIdx === 2) return p.tertiaryValue ?? 0;
      if (sIdx === 3) return p.quaternaryValue ?? 0;
      if (p.rowValues && p.rowValues[sIdx] !== undefined) {
        const v = p.rowValues[sIdx];
        return typeof v === "number" ? v : parseFloat(v as string) || 0;
      }
      return 0;
    };

    if (hasPoints && chart.dataPoints) {
      categories = chart.dataPoints.map((p, i) => p.label || `Item ${i + 1}`);
      values = chart.dataPoints.map((p) => p.value ?? 0);
      if (chart.dataPoints.some((p) => p.secondaryValue !== undefined)) {
        secondaryValues = chart.dataPoints.map((p) => p.secondaryValue ?? 0);
      }
      const safePalette = palette && palette.length > 0 ? palette : DEFAULT_SERIES_PALETTE;
      if (chart.dataPoints.some((p) => p.color)) {
        pointColors = chart.dataPoints.map((p, i) => p.color || safePalette[i % safePalette.length]);
      }

      // Determine series count from chart.series or dataPoints rowValues / values
      let sCount = chart.series?.length || 1;
      if (chart.dataPoints.some((p) => p.rowValues && p.rowValues.length > sCount)) {
        sCount = Math.max(...chart.dataPoints.map((p) => p.rowValues?.length || 0));
      } else if (chart.dataPoints.some((p) => p.quaternaryValue !== undefined)) {
        sCount = Math.max(sCount, 4);
      } else if (chart.dataPoints.some((p) => p.tertiaryValue !== undefined)) {
        sCount = Math.max(sCount, 3);
      } else if (chart.dataPoints.some((p) => p.secondaryValue !== undefined)) {
        sCount = Math.max(sCount, 2);
      }

      allSeriesValues = [];
      for (let s = 0; s < sCount; s++) {
        allSeriesValues.push(chart.dataPoints.map((p) => getPtSeriesVal(p, s)));
      }
    } else if (hasSeries && chart.series) {
      if (chart.xAxis?.labels && chart.xAxis.labels.length > 0) {
        categories = chart.xAxis.labels;
      }
      values = chart.series[0]?.data || fallbackValues;
      if (chart.series.length > 1) {
        secondaryValues = chart.series[1]?.data;
      }
      allSeriesValues = chart.series.map((s) => s.data || []);
    } else if (chart.xAxis?.labels && chart.xAxis.labels.length > 0) {
      categories = chart.xAxis.labels;
    }

    const flatVals = allSeriesValues ? allSeriesValues.flat() : [...values, ...(secondaryValues || [])];
    const rawMax = Math.max(
      ...flatVals,
      hasCustomData ? 1 : fallbackYMax
    );
    const rawMin = Math.min(
      ...flatVals,
      0
    );

    const yMin = chart.yAxis?.min !== undefined ? chart.yAxis.min : rawMin < 0 ? Math.floor(rawMin * 1.1) : 0;
    const yMax = chart.yAxis?.max !== undefined
      ? chart.yAxis.max
      : hasCustomData
      ? Math.max(10, Math.ceil(rawMax * 1.15))
      : fallbackYMax;

    const unit = chart.yAxis?.unit !== undefined ? chart.yAxis.unit : fallbackUnit;
    const showValues = chart.options?.showValues ?? true;
    const showGridLines = chart.options?.showGridLines ?? chart.yAxis?.showGridLines ?? true;
    const showLegend = chart.options?.showLegend ?? Boolean(secondaryValues !== undefined || (chart.series && chart.series.length > 1));

    return {
      categories,
      values,
      secondaryValues,
      pointColors,
      yMin,
      yMax,
      unit,
      xAxisTitle: chart.xAxis?.title,
      yAxisTitle: chart.yAxis?.title,
      showValues,
      showGridLines,
      showLegend,
      hasCustomData,
    };
  };

  /** Formats Y-axis numerical ticks cleanly without repeating long units on every tick */
  const formatYTick = (val: number, unit: string) => {
    const rounded = Math.round(val);
    if (!unit) return `${rounded}`;
    if (unit === "%" || unit === "°" || unit === "°C") return `${rounded}${unit}`;
    return `${rounded}`;
  };

  /** Formats value badges displayed above chart bars or points */
  const formatDataValue = (val: number, unit: string, isCrowded = false) => {
    if (!unit) return `${val}`;
    if (unit === "%" || unit === "°" || unit === "°C") return `${val}${unit}`;
    if (isCrowded && unit.length > 3) return `${val}`;
    return `${val} ${unit}`;
  };

  /** Header title or unit badge rendered at top of Y-axis */
  const getYAxisHeader = (yAxisTitle?: string, unit?: string) => {
    if (yAxisTitle && unit && unit !== "None") {
      return `${yAxisTitle} (${unit})`;
    }
    if (yAxisTitle) return yAxisTitle;
    if (unit && unit !== "None" && unit.length > 2) return `(${unit})`;
    return null;
  };

  // Proportional scale factor continuous based on container height (reference: 240px)
  const heightRatio = height !== undefined
    ? Math.min(1.4, Math.max(0.35, height / 240))
    : 1;

  // Custom font size scale factor (relative to standard 14px base)
  const customScale = customFontSize !== undefined && customFontSize > 0 ? customFontSize / 14 : undefined;

  // Unified responsive scale across all chart types
  const isUltraCompact = heightRatio < 0.65;
  const isCompact = heightRatio < 0.85 || fontSize === "xs" || (customFontSize !== undefined && customFontSize <= 11);
  const isLarge = (height !== undefined && height > 340 && fontSize !== "xs" && fontSize !== "sm") || fontSize === "lg" || fontSize === "xl" || (customFontSize !== undefined && customFontSize >= 16);

  // User-configured zoom scale factor (default 1.0)
  const userZoom = (chart.scale !== undefined && chart.scale > 0) ? chart.scale : 1;

  // Effective scale combines custom toolbar font scale and container height ratio
  const effectiveScale = customScale ? customScale * Math.min(1.15, Math.max(0.65, heightRatio)) : heightRatio;

  // Dynamic SVG font sizes scaled proportionally with container and zoom
  const baseTick = fontSize === "xs" ? 5.2 : fontSize === "sm" ? 5.8 : fontSize === "lg" ? 7.5 : fontSize === "xl" ? 8.2 : 6.5;
  const svgTickSize = +(baseTick * effectiveScale).toFixed(1);

  const baseVal = fontSize === "xs" ? 5.6 : fontSize === "sm" ? 6.2 : fontSize === "lg" ? 8.0 : fontSize === "xl" ? 8.8 : 7.0;
  const svgValueSize = +(baseVal * effectiveScale).toFixed(1);

  const baseTitle = fontSize === "xs" ? 5.8 : fontSize === "sm" ? 6.4 : fontSize === "lg" ? 8.0 : fontSize === "xl" ? 8.8 : 7.0;
  const svgTitleSize = +(baseTitle * effectiveScale).toFixed(1);

  // Dynamic Tailwind text classes for HTML-rendered charts & legends
  const legendTextClass =
    customFontSize !== undefined
      ? customFontSize <= 10
        ? "text-[8px]"
        : customFontSize <= 12
        ? "text-[9px]"
        : customFontSize >= 16
        ? "text-xs sm:text-sm"
        : "text-[10px]"
      : isUltraCompact
      ? "text-[7.5px] leading-tight"
      : isCompact
      ? "text-[9px]"
      : fontSize === "lg" || fontSize === "xl" || isLarge
      ? "text-xs"
      : "text-[10px] sm:text-[11px]";

  const legendGapClass = isUltraCompact ? "gap-x-1.5 gap-y-0.5 py-0.5" : isCompact ? "gap-x-2 gap-y-0.5 pt-0.5" : "gap-x-3.5 gap-y-1 sm:gap-x-4 sm:gap-y-1.5 pt-1";
  const legendDotClass = isUltraCompact ? "w-1.5 h-1.5" : isCompact ? "w-2 h-2" : "w-2.5 h-2.5";
  const chartWrapperClass = "w-full h-full min-h-0 flex-1 flex flex-col justify-center items-center overflow-hidden";

  const renderChart = () => {
    switch (chart.chartType) {
    case "line": {
      const d = resolveChartData(chartColors, ["08:00", "12:00", "16:00", "20:00", "24:00"], [88, 94, 96, 99, 100], 100, "%");
      const n = d.categories.length;
      const yRange = (d.yMax - d.yMin) || 1;

      const activeSeries = (chart.series && chart.series.length > 0)
        ? chart.series
        : (d.allSeriesValues && d.allSeriesValues.length > 1)
        ? d.allSeriesValues.map((vals, sIdx) => ({
            id: `s${sIdx + 1}`,
            name: `Line ${sIdx + 1}`,
            color: chartColors[sIdx] || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length],
            data: vals,
          }))
        : [
            { id: "s1", name: chart.series?.[0]?.name || "Line 1", color: c0, data: d.values },
          ];

      const dashPatterns = ["none", "4 2", "2 2", "6 2 2 2", "5 3", "1 2"];

      const allSeriesData = activeSeries.map((s, sIdx) => {
        const sColor = s.color || chartColors[sIdx] || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length];
        const vals = (d.allSeriesValues && d.allSeriesValues[sIdx]) || (sIdx === 0 ? d.values : sIdx === 1 ? (d.secondaryValues || []) : s.data || []);
        const points = vals.map((v, i) => {
          const cx = 56 + (n > 1 ? (i / (n - 1)) * 360 : 180);
          const norm = Math.max(0, Math.min(1, (v - d.yMin) / yRange));
          const cy = 114 - norm * 88;
          return { cx, cy, val: v, label: d.categories[i] };
        });
        const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(" ");
        const areaPath = points.length > 0 ? `${path} L ${points[points.length - 1].cx.toFixed(1)} 114 L ${points[0].cx.toFixed(1)} 114 Z` : "";
        return {
          s,
          sColor,
          vals,
          points,
          path,
          areaPath,
          name: s.name || `Line ${sIdx + 1}`,
          dash: activeSeries.length > 1 ? dashPatterns[sIdx % dashPatterns.length] : "none",
        };
      });

      let yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((r) => ({
        y: 114 - r * 88,
        label: formatYTick(d.yMin + r * yRange, d.unit),
      }));
      if (chart.yAxis?.step && chart.yAxis.step > 0) {
        const step = chart.yAxis.step;
        const tickVals: number[] = [];
        for (let v = d.yMin; v <= d.yMax; v += step) {
          tickVals.push(v);
        }
        yTicks = tickVals.map((v) => ({
          y: 114 - ((v - d.yMin) / yRange) * 88,
          label: formatYTick(v, d.unit),
        }));
      }

      const yHeader = getYAxisHeader(d.yAxisTitle, d.unit);

      return (
        <div className={chartWrapperClass}>
          {d.showLegend && activeSeries.length > 1 && chart.options?.legendPosition !== "header" && (
            <div className={`flex items-center justify-center ${legendGapClass} ${legendTextClass} font-mono font-medium flex-wrap`}>
              {allSeriesData.map((sData, sIdx) => (
                <div key={sData.s.id || sIdx} className="flex items-center gap-1.5">
                  <span className={`${legendDotClass} rounded-xs flex-shrink-0`} style={{ backgroundColor: sData.sColor }} />
                  <span className="text-slate-600 dark:text-zinc-300 font-semibold">{sData.name}</span>
                </div>
              ))}
            </div>
          )}
          <svg viewBox={d.xAxisTitle ? "0 0 440 160" : "0 0 440 144"} preserveAspectRatio="xMidYMid meet" className="w-full h-full flex-1 max-h-full max-w-full block overflow-visible">
            <defs>
              <linearGradient id={`grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c0} stopOpacity="0.35" />
                <stop offset="100%" stopColor={c0} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Y-axis */}
            <line x1="48" y1="16" x2="48" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="114" x2="425" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Rotated Y-axis Title */}
            {d.yAxisTitle && (
              <text
                transform="rotate(-90)"
                x="-65"
                y="14"
                fontSize={svgTitleSize}
                fontWeight="600"
                textAnchor="middle"
                fill="currentColor"
                fillOpacity="0.6"
                letterSpacing="0.02em"
              >
                {d.yAxisTitle}
              </text>
            )}
            {/* Y-axis Header / Unit (fallback if no rotated title) */}
            {!d.yAxisTitle && yHeader && (
              <text x="48" y="10" fontSize={svgTitleSize} fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
                {yHeader}
              </text>
            )}
            {/* Y grid + labels */}
            {yTicks.map((g, i) => (
              <g key={i}>
                {d.showGridLines && (
                  <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                )}
                <text x="43" y={g.y + 2.5} fontSize={svgTickSize} textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.label}</text>
              </g>
            ))}
            {/* X ticks */}
            {d.categories.map((cat, i) => {
              const cx = 56 + (n > 1 ? (i / (n - 1)) * 360 : 180);
              return (
                <g key={i}>
                  <line x1={cx} y1="114" x2={cx} y2="118" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={cx} y={128} fontSize={n > 20 ? Math.max(4.5, svgTickSize * 0.85) : svgTickSize} textAnchor="middle" fill="currentColor" fillOpacity="0.55">{cat}</text>
                </g>
              );
            })}
            {/* Single series area fill */}
            {activeSeries.length === 1 && allSeriesData[0]?.areaPath && (
              <path d={allSeriesData[0].areaPath} fill={`url(#grad-${chart.id})`} />
            )}
            {/* Lines & Markers */}
            {allSeriesData.map((sData, sIdx) => (
              <g key={sData.s.id || sIdx}>
                <path
                  d={sData.path}
                  fill="none"
                  stroke={sData.sColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={sData.dash === "none" ? undefined : sData.dash}
                />
                {sData.points.map((pt, pIdx) => {
                  const ptDotColor = (d.pointColors && d.pointColors[pIdx]) || chart.dataPoints?.[pIdx]?.color || sData.sColor;
                  return (
                    <g key={pIdx}>
                      <circle cx={pt.cx} cy={pt.cy} r={n > 20 ? "2.2" : "3"} fill={ptDotColor} stroke="#fff" strokeWidth="1" />
                      {d.showValues && (
                        <text x={pt.cx} y={pt.cy - 5} fontSize={svgValueSize} fontWeight="bold" textAnchor="middle" fill={ptDotColor}>
                          {formatDataValue(pt.val, d.unit, n > 6)}
                        </text>
                      )}
                    </g>
                  );
                })}
              </g>
            ))}
            {d.xAxisTitle && (
              <text x="240" y="145" fontSize={svgTitleSize} fontWeight="600" textAnchor="middle" fill="currentColor" fillOpacity="0.6" letterSpacing="0.03em">{d.xAxisTitle}</text>
            )}
          </svg>
        </div>
      );
    }

    case "donut":
    case "pie": {
      const isPie = chart.chartType === "pie";
      const d = resolveChartData(
        [c0, c1, c2, c3, c4],
        ["Smart Helmets", "Vest Hubs", "Grounding Boots"],
        [55, 30, 15],
        100,
        "%"
      );
      const sum = d.values.reduce((acc, curr) => acc + curr, 0) || 1;
      const circumference = isPie ? 157 : 238; // 2 * PI * r
      const radius = isPie ? 25 : 38;
      const strokeW = isPie ? 50 : 15;

      let accumulatedOffset = 0;
      const segments = d.values.map((val, i) => {
        const pct = val / sum;
        const length = pct * circumference;
        const offset = -accumulatedOffset;
        accumulatedOffset += length;
        const segmentColor = d.pointColors?.[i] || chart.dataPoints?.[i]?.color || DEFAULT_SERIES_PALETTE[i % DEFAULT_SERIES_PALETTE.length];
        return {
          val,
          pct: Math.round(pct * 100),
          label: d.categories[i] || `Segment ${i + 1}`,
          color: segmentColor,
          dasharray: `${length.toFixed(1)} ${(circumference - length).toFixed(1)}`,
          dashoffset: offset.toFixed(1),
        };
      });

      const primaryVal = d.values[0] ?? 0;
      const primaryPct = Math.round((primaryVal / sum) * 100);

      const isUltraCompactDonut = isUltraCompact || (height !== undefined && height < 170);
      const isCompactDonut = isCompact || (height !== undefined && height < 220);
      const donutSizeClass = isUltraCompactDonut
        ? "w-20 h-20 sm:w-24 sm:h-24"
        : isCompactDonut
        ? "w-28 h-28 sm:w-32 sm:h-32"
        : isLarge
        ? "w-44 h-44 sm:w-52 sm:h-52"
        : "w-36 h-36 sm:w-40 sm:h-40";

      return (
        <div className={`w-full h-full min-h-0 flex items-center justify-center ${isUltraCompact ? "gap-2 sm:gap-4" : isCompact ? "gap-3 sm:gap-6" : isLarge ? "gap-8 sm:gap-12" : "gap-5 sm:gap-8"} py-1 overflow-hidden`}>
          <div className={`relative ${donutSizeClass} flex items-center justify-center flex-shrink-0`}>
            <svg viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet" className="w-full h-full -rotate-90 overflow-visible">
              {segments.map((seg, i) => (
                <circle
                  key={i}
                  cx="50"
                  cy="50"
                  r={radius}
                  fill="transparent"
                  stroke={seg.color}
                  strokeWidth={strokeW}
                  strokeDasharray={seg.dasharray}
                  strokeDashoffset={seg.dashoffset}
                />
              ))}
            </svg>
            {!isPie && (
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className={`${isUltraCompact ? "text-sm sm:text-base" : isCompact ? "text-base sm:text-lg" : isLarge ? "text-2xl sm:text-3xl" : "text-xl sm:text-2xl"} font-black font-mono text-slate-900 dark:text-white leading-none`}>
                  {primaryPct}%
                </span>
                <span className={`${isUltraCompact ? "text-[7px]" : isCompact ? "text-[8px]" : "text-[9px] sm:text-[10px]"} font-bold uppercase tracking-wider text-slate-400 mt-0.5 truncate max-w-[80px] text-center`}>
                  {d.categories[0] || "Compliant"}
                </span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className={`space-y-1 sm:space-y-1.5 ${legendTextClass} font-medium`}>
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center gap-1.5 sm:gap-2">
                <div className={`${legendDotClass} rounded-full flex-shrink-0`} style={{ backgroundColor: seg.color }} />
                <span className="text-slate-700 dark:text-zinc-300">
                  {seg.label}: <b className="font-bold">{seg.val}{d.unit} ({seg.pct}%)</b>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }



    case "heatmap": {
      const rowsCount = effectiveRows || (chart.dataPoints && chart.dataPoints.length > 0 ? chart.dataPoints.length : 4);
      const colsCount = effectiveCols || 7;

      const standardDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const days = Array.from({ length: colsCount }, (_, i) => standardDays[i] || `D${i + 1}`);
      const weeks = Array.from({ length: rowsCount }, (_, i) => {
        if (chart.dataPoints?.[i]?.label) return chart.dataPoints[i].label;
        return i < 12 ? `Week ${i + 1}` : `W${i + 1}`;
      });

      const getCellValue = (r: number, c: number) => {
        const pt = chart.dataPoints?.[r];
        if (pt && pt.rowValues && pt.rowValues[c] !== undefined) {
          const val = typeof pt.rowValues[c] === "number" ? pt.rowValues[c] : parseFloat(String(pt.rowValues[c]));
          if (!isNaN(val as number)) return val as number;
        }
        const matrix = [
          [96, 96, 96, 96, 96, 82, 82],
          [94, 94, 94, 94, 94, 78, 78],
          [96, 95, 95, 95, 95, 85, 85],
          [98, 98, 98, 98, 98, 72, 72],
          [92, 93, 91, 94, 95, 80, 80],
          [90, 92, 94, 91, 93, 75, 76],
        ];
        if (r < 6 && c < 7) {
          return matrix[r][c];
        }
        return ((r * 11 + c * 7 + 83) % 27) + 72;
      };

      // Responsive font sizing and gaps based on container height and selected fontSize
      const isCompact = (height !== undefined && height < 230) || fontSize === "xs";
      const isLarge = (height !== undefined && height > 340 && fontSize !== "xs" && fontSize !== "sm") || fontSize === "lg" || fontSize === "xl";
      const gapClass = isCompact ? "gap-1" : isLarge ? "gap-2" : "gap-1.5";
      const headerTextSize =
        fontSize === "xs"
          ? "text-[8px]"
          : fontSize === "sm" || isCompact
          ? "text-[9px]"
          : fontSize === "lg" || fontSize === "xl" || isLarge
          ? "text-xs"
          : "text-[10px]";
      const weekTextSize =
        fontSize === "xs"
          ? "text-[8px]"
          : fontSize === "sm" || isCompact
          ? "text-[9px]"
          : fontSize === "lg" || fontSize === "xl" || isLarge
          ? "text-xs"
          : "text-[10px]";
      const cellTextSize =
        fontSize === "xs"
          ? "text-[8px] font-bold"
          : fontSize === "sm"
          ? "text-[9px] font-bold"
          : isCompact
          ? "text-[9px] font-bold"
          : fontSize === "xl"
          ? "text-sm font-bold"
          : fontSize === "lg" || isLarge
          ? "text-xs font-bold"
          : "text-[10px] sm:text-[11px] font-bold";

      return (
        <div className={`w-full h-full min-h-0 flex flex-col justify-between ${gapClass} bg-transparent select-none overflow-hidden py-0.5`}>
          {/* Header Row: Week label spacer + Days of week pinned at top */}
          <div
            className={`w-full grid ${gapClass} flex-shrink-0 items-center`}
            style={{
              gridTemplateColumns: `minmax(42px, 56px) repeat(${colsCount}, 1fr)`,
            }}
          >
            <div className={`text-right pr-2 font-mono ${headerTextSize} text-slate-400 font-semibold truncate`}>
              WEEK
            </div>
            {days.map((day) => (
              <div
                key={day}
                className={`text-center font-bold text-slate-600 dark:text-zinc-400 ${headerTextSize} uppercase truncate tracking-tight`}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Grid Rows: Each week fills an equal 1fr fraction of available card height */}
          <div
            className={`w-full flex-1 min-h-0 grid ${gapClass}`}
            style={{
              gridTemplateRows: `repeat(${rowsCount}, 1fr)`,
            }}
          >
            {weeks.map((w, rIdx) => (
              <div
                key={w}
                className={`w-full h-full min-h-0 grid ${gapClass} items-center`}
                style={{
                  gridTemplateColumns: `minmax(42px, 56px) repeat(${colsCount}, 1fr)`,
                }}
              >
                {/* Week Label on Left */}
                <div className={`text-right pr-2 font-mono ${weekTextSize} font-semibold text-slate-500 dark:text-zinc-400 truncate`}>
                  {w}
                </div>
                {/* Day Cells across row */}
                {days.map((_, cIdx) => {
                  const val = getCellValue(rIdx, cIdx);
                  const cellColor = val >= 92 ? c0 : val >= 80 ? c1 : c2;
                  return (
                    <div
                      key={cIdx}
                      className={`w-full h-full min-h-0 rounded-md flex items-center justify-center ${cellTextSize} text-white transition-all hover:scale-[1.03] cursor-default`}
                      style={{ backgroundColor: cellColor }}
                      title={`${w}, ${days[cIdx]}: ${val}% Compliance`}
                    >
                      {val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      );
    }


    case "horizontal-bar": {
      const d = resolveChartData(
        chartColors,
        ["Civil", "Mechanical", "Electrical", "Fabrication"],
        [93, 88, 90, 85],
        100,
        "%"
      );
      const yRange = (d.yMax - d.yMin) || 1;
      const activeSeries = (chart.series && chart.series.length > 0)
        ? chart.series
        : (d.allSeriesValues && d.allSeriesValues.length > 1)
        ? d.allSeriesValues.map((vals, sIdx) => ({
            id: `s${sIdx + 1}`,
            name: `Series ${sIdx + 1}`,
            color: chartColors[sIdx] || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length],
            data: vals,
          }))
        : [
            { id: "s1", name: chart.series?.[0]?.name || "Series 1", color: c0, data: d.values },
          ];

      return (
        <div className="w-full h-full min-h-0 flex flex-col justify-center py-1 gap-2 text-xs overflow-hidden">
          {d.showLegend && activeSeries.length > 1 && (
            <div className={`flex items-center justify-center ${legendGapClass} ${legendTextClass} font-mono font-medium flex-wrap mb-1`}>
              {activeSeries.map((s, sIdx) => {
                const sColor = s.color || chartColors[sIdx] || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length];
                return (
                  <div key={s.id || sIdx} className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-xs flex-shrink-0" style={{ backgroundColor: sColor }} />
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold">{s.name || `Series ${sIdx + 1}`}</span>
                  </div>
                );
              })}
            </div>
          )}
          {d.categories.map((cat, i) => (
            <div key={i} className="flex items-center gap-2 sm:gap-3">
              <span className={`w-20 sm:w-24 text-right font-medium text-slate-700 dark:text-zinc-300 truncate ${legendTextClass}`} title={cat}>
                {cat}
              </span>
              <div className="flex-1 flex flex-col gap-1">
                {activeSeries.map((s, sIdx) => {
                  const vals = (d.allSeriesValues && d.allSeriesValues[sIdx]) || (sIdx === 0 ? d.values : sIdx === 1 ? (d.secondaryValues || []) : s.data || []);
                  const v = vals[i] ?? 0;
                  const pct = Math.max(0, Math.min(100, ((v - d.yMin) / yRange) * 100));
                  const sColor = s.color || chart.colors?.[sIdx] || chartColors[sIdx] || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length];
                  // Chart-type-aware color behavior:
                  // For horizontal bar (discrete categorical items), single series or primary series
                  // accurately reflects the individual data point's custom color if set.
                  const ptColor = d.pointColors?.[i] || chart.dataPoints?.[i]?.color;
                  const barColor = (activeSeries.length === 1 || sIdx === 0) && ptColor ? ptColor : sColor;
                  return (
                    <div key={s.id || sIdx} className="w-full h-4 sm:h-5 bg-slate-100 dark:bg-zinc-800 rounded-r-md flex items-center">
                      <div
                        className="h-full flex items-center justify-end pr-2 rounded-r-md transition-all"
                        style={{ width: `${pct}%`, backgroundColor: barColor }}
                      >
                        {d.showValues && (
                          <span className="text-[9px] sm:text-[10px] font-bold text-white whitespace-nowrap">
                            {v}{d.unit}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "stacked-horizontal": {
      const d = resolveChartData(
        chartColors,
        ["Hours without Violations", "Hours with Violations"],
        [17330, 1420],
        20000,
        "hrs"
      );

      const activeSeries = (chart.series && chart.series.length > 0)
        ? chart.series
        : [
            { id: "s1", name: d.categories[0] || "Safe Hours", color: c0 },
            { id: "s2", name: d.categories[1] || "Violations", color: c1 },
          ];

      const seriesVals = activeSeries.map((s, sIdx) => {
        const vals = (d.allSeriesValues && d.allSeriesValues[sIdx]) || (sIdx === 0 ? d.values : sIdx === 1 ? (d.secondaryValues || []) : []);
        return vals[0] ?? (sIdx === 0 ? 17330 : 1420);
      });

      const total = seriesVals.reduce((sum, v) => sum + v, 0) || 1;
      const seriesSegments = activeSeries.map((s, sIdx) => {
        const val = seriesVals[sIdx] ?? 0;
        const pct = Math.max(0, (val / total) * 100);
        const sColor = s.color || chartColors[sIdx] || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length];
        return {
          s,
          sColor,
          val,
          pct: pct.toFixed(1),
          name: s.name || `Series ${sIdx + 1}`,
        };
      });

      return (
        <div className="w-full h-full min-h-0 flex flex-col justify-center py-2 text-xs overflow-hidden">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className={`font-semibold text-slate-700 dark:text-zinc-300 ${legendTextClass}`}>{chart.title || "Total Operational Distribution"}</span>
            <span className={`font-bold text-slate-900 dark:text-white ${legendTextClass}`}>{total.toLocaleString()} {d.unit}</span>
          </div>
          <div className="w-full h-8 sm:h-10 flex rounded-lg overflow-hidden mb-3">
            {seriesSegments.map((seg, sIdx) => (
              <div
                key={seg.s.id || sIdx}
                className="flex items-center justify-center text-white font-bold text-xs truncate px-1 transition-all"
                style={{ width: `${seg.pct}%`, backgroundColor: seg.sColor }}
                title={`${seg.name}: ${seg.pct}% (${seg.val.toLocaleString()} ${d.unit})`}
              >
                {parseFloat(seg.pct) >= 10 ? `${seg.pct}% ${seg.name}` : parseFloat(seg.pct) >= 5 ? `${seg.pct}%` : ""}
              </div>
            ))}
          </div>
          <div className={`flex flex-wrap justify-between gap-2 ${legendTextClass} font-mono text-slate-500 px-1`}>
            {seriesSegments.map((seg, sIdx) => (
              <div key={seg.s.id || sIdx} className="flex items-center gap-1.5">
                <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ backgroundColor: seg.sColor }} />
                <span>{seg.name} ({seg.val.toLocaleString()})</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case "stacked-bar": {
      const d = resolveChartData(
        chartColors,
        ["Civil", "Mech", "Elec", "Fab", "Safety"],
        [35, 32, 28, 40, 20],
        100,
        "%"
      );
      const n = d.categories.length;
      const yRange = (d.yMax - d.yMin) || 1;
      const bw = Math.min(32, Math.max(12, (360 / n) * 0.5));

      const activeSeries = (chart.series && chart.series.length > 0)
        ? chart.series
        : [
            { id: "s1", name: "Civil", color: c0 },
            { id: "s2", name: "PPE", color: c1 },
            { id: "s3", name: "Safety", color: c2 },
            { id: "s4", name: "Risk", color: c3 },
          ];

      const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((r) => ({
        y: 114 - r * 88,
        label: formatYTick(d.yMin + r * yRange, d.unit),
      }));

      const yHeader = getYAxisHeader(d.yAxisTitle, d.unit);

      return (
        <div className={chartWrapperClass}>
          {/* Nomenclature / Legend */}
          {d.showLegend && (
            <div className={`flex items-center justify-center ${legendGapClass} ${legendTextClass} font-mono font-medium flex-wrap max-w-full px-2`}>
              {activeSeries.map((s, sIdx) => {
                const sColor = s.color || chartColors[sIdx] || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length];
                return (
                  <div key={s.id || sIdx} className="flex items-center gap-1.5 min-w-0 max-w-[140px] sm:max-w-none flex-shrink-0">
                    <span className={`${legendDotClass} rounded-full flex-shrink-0`} style={{ backgroundColor: sColor }} />
                    <span className="text-slate-600 dark:text-zinc-300 font-semibold truncate">{s.name || `Series ${sIdx + 1}`}</span>
                  </div>
                );
              })}
            </div>
          )}

          <svg viewBox={d.xAxisTitle ? "0 0 440 160" : "0 0 440 144"} preserveAspectRatio="xMidYMid meet" className="w-full h-full flex-1 max-h-full max-w-full block overflow-visible">
            {/* Y-axis */}
            <line x1="48" y1="16" x2="48" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="114" x2="425" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {yHeader && (
              <text x="48" y="10" fontSize={svgTitleSize} fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
                {yHeader}
              </text>
            )}
            {/* Y labels */}
            {yTicks.map((g, i) => (
              <g key={i}>
                {d.showGridLines && (
                  <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                )}
                <text x="43" y={g.y + 2.5} fontSize={svgTickSize} textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.label}</text>
              </g>
            ))}
            {d.categories.map((cat, i) => {
              const x = 56 + ((i + 0.5) / n) * 360;
              let accumulatedH = 0;
              const seriesSegs = activeSeries.map((s, sIdx) => {
                const vals = (d.allSeriesValues && d.allSeriesValues[sIdx]) || (sIdx === 0 ? d.values : sIdx === 1 ? (d.secondaryValues || []) : []);
                const val = vals[i] ?? 0;
                const sColor = s.color || chartColors[sIdx] || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length];
                return { s, sColor, val };
              });
              const totalVal = seriesSegs.reduce((sum, seg) => sum + seg.val, 0) || 1;

              return (
                <g key={i}>
                  {seriesSegs.map((seg, sIdx) => {
                    const sh = Math.max(1, (seg.val / totalVal) * 88);
                    const y = 114 - accumulatedH - sh;
                    accumulatedH += sh;
                    return (
                      <rect
                        key={sIdx}
                        x={x - bw / 2}
                        y={y}
                        width={bw}
                        height={sh}
                        fill={seg.sColor}
                        rx={sIdx === seriesSegs.length - 1 ? 2 : 0}
                      />
                    );
                  })}
                  <line x1={x} y1="114" x2={x} y2="118" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={x} y={130} fontSize={svgTickSize} fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{cat}</text>
                </g>
              );
            })}
            {d.xAxisTitle && (
              <text x="238" y="150" fontSize={svgTitleSize} fontWeight="600" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{d.xAxisTitle}</text>
            )}
          </svg>
        </div>
      );
    }

    case "grouped-bar": {
      const d = resolveChartData(
        chartColors,
        ["Civil", "Elec", "Mech", "Safety", "Admin"],
        [60, 85, 90, 30, 70],
        100,
        "%"
      );
      const n = d.categories.length;
      const yRange = (d.yMax - d.yMin) || 1;

      // Dynamic series definitions: read from chart.series or fallback
      const activeSeries = (chart.series && chart.series.length > 0)
        ? chart.series
        : [
            { id: "s1", name: "Series 1 (Actual)", color: c0, data: d.values },
            { id: "s2", name: "Series 2 (Target)", color: c1, data: d.secondaryValues || [40, 60, 55, 20, 50] },
          ];

      const numSeries = activeSeries.length;
      const seriesInfo = activeSeries.map((s, sIdx) => {
        const sColor = s.color || chartColors[sIdx] || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length];
        const vals = (d.allSeriesValues && d.allSeriesValues[sIdx]) || (sIdx === 0 ? d.values : sIdx === 1 ? (d.secondaryValues || []) : s.data || []);
        return { s, sColor, vals, name: s.name || `Series ${sIdx + 1}` };
      });

      const totalSlotWidth = Math.min(84, Math.max(20, (360 / n) * 0.78));
      const barGap = numSeries > 3 ? 1 : 2;
      const bw = Math.max(3, Math.min(22, (totalSlotWidth - (numSeries - 1) * barGap) / numSeries));
      const groupWidth = numSeries * bw + (numSeries - 1) * barGap;

      const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((r) => ({
        y: 114 - r * 88,
        label: formatYTick(d.yMin + r * yRange, d.unit),
      }));

      const yHeader = getYAxisHeader(d.yAxisTitle, d.unit);

      return (
        <div className={chartWrapperClass}>
          {d.showLegend && (
            <div className={`flex items-center justify-center ${legendGapClass} ${legendTextClass} font-mono font-medium flex-wrap max-w-full px-2`}>
              {seriesInfo.map((sData, sIdx) => (
                <div key={sData.s.id || sIdx} className="flex items-center gap-1.5 min-w-0 max-w-[140px] sm:max-w-none flex-shrink-0">
                  <span className={`${legendDotClass} rounded-full flex-shrink-0`} style={{ backgroundColor: sData.sColor }} />
                  <span className="text-slate-600 dark:text-zinc-300 font-semibold truncate">{sData.name}</span>
                </div>
              ))}
            </div>
          )}

          <svg viewBox={d.xAxisTitle ? "0 0 440 160" : "0 0 440 144"} preserveAspectRatio="xMidYMid meet" className="w-full h-full flex-1 max-h-full max-w-full block overflow-visible">
            {/* Y-axis */}
            <line x1="48" y1="16" x2="48" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="114" x2="425" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {yHeader && (
              <text x="48" y="10" fontSize={svgTitleSize} fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
                {yHeader}
              </text>
            )}
            {/* Y labels */}
            {yTicks.map((g, i) => (
              <g key={i}>
                {d.showGridLines && (
                  <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                )}
                <text x="43" y={g.y + 2.5} fontSize={svgTickSize} textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.label}</text>
              </g>
            ))}
            {d.categories.map((cat, i) => {
              const xCenter = 56 + ((i + 0.5) / n) * 360;
              const startX = xCenter - groupWidth / 2;

              return (
                <g key={i}>
                  {seriesInfo.map((sData, sIdx) => {
                    const val = sData.vals[i] ?? 0;
                    const h = Math.max(2, Math.min(88, ((val - d.yMin) / yRange) * 88));
                    const bx = startX + sIdx * (bw + barGap);

                    const ptColor = d.pointColors?.[i] || chart.dataPoints?.[i]?.color;
                    const barColor = (numSeries === 1 && ptColor) ? ptColor : sData.sColor;

                    return (
                      <React.Fragment key={sIdx}>
                        <rect x={bx} y={114 - h} width={bw} height={h} fill={barColor} rx="2" />
                        {d.showValues && (
                          <text
                            x={bx + bw / 2}
                            y={114 - h - 3}
                            fontSize={numSeries > 3 ? +(svgValueSize * 0.9).toFixed(1) : svgValueSize}
                            fontWeight="bold"
                            textAnchor="middle"
                            fill={barColor}
                          >
                            {val}
                          </text>
                        )}
                      </React.Fragment>
                    );
                  })}
                  <line x1={xCenter} y1="114" x2={xCenter} y2="118" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={xCenter} y={130} fontSize={svgTickSize} textAnchor="middle" fill="currentColor" fillOpacity="0.55">{cat}</text>
                </g>
              );
            })}
            {d.xAxisTitle && (
              <text x="238" y="150" fontSize={svgTitleSize} fontWeight="600" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{d.xAxisTitle}</text>
            )}
          </svg>
        </div>
      );
    }

    case "multi-line": {
      const d = resolveChartData(
        chartColors,
        ["08:00", "12:00", "16:00", "20:00", "24:00"],
        [85, 94, 96, 92, 88],
        100,
        "%"
      );
      const n = d.categories.length;
      const yRange = (d.yMax - d.yMin) || 1;

      // Extract dynamic series list
      const activeSeries = (chart.series && chart.series.length > 0)
        ? chart.series
        : [
            { id: "s1", name: "Line 1 (Actual)", color: c0, data: d.values },
            { id: "s2", name: "Line 2 (Target)", color: c1, data: d.secondaryValues || [78, 88, 91, 84, 80] },
          ];

      const dashPatterns = ["none", "4 2", "2 2", "6 2 2 2", "5 3", "1 2"];

      const allSeriesData = activeSeries.map((s, sIdx) => {
        const sColor = s.color || chartColors[sIdx] || DEFAULT_SERIES_PALETTE[sIdx % DEFAULT_SERIES_PALETTE.length];
        const vals = (d.allSeriesValues && d.allSeriesValues[sIdx]) || (sIdx === 0 ? d.values : sIdx === 1 ? (d.secondaryValues || []) : s.data || []);
        const points = vals.map((v, i) => {
          const cx = 56 + (n > 1 ? (i / (n - 1)) * 360 : 180);
          const norm = Math.max(0, Math.min(1, (v - d.yMin) / yRange));
          const cy = 114 - norm * 88;
          return { cx, cy, val: v, label: d.categories[i] };
        });
        const path = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(" ");
        return {
          s,
          sColor,
          vals,
          points,
          path,
          name: s.name || `Line ${sIdx + 1}`,
          dash: dashPatterns[sIdx % dashPatterns.length],
        };
      });

      const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((r) => ({
        y: 114 - r * 88,
        label: formatYTick(d.yMin + r * yRange, d.unit),
      }));

      const yHeader = getYAxisHeader(d.yAxisTitle, d.unit);

      return (
        <div className={chartWrapperClass}>
          {d.showLegend && (
            <div className={`flex items-center justify-center ${legendGapClass} ${legendTextClass} font-mono font-medium flex-wrap max-w-full px-2 ${height && height < 110 ? "max-h-[18px] overflow-hidden" : ""}`}>
              {allSeriesData.map((sData, sIdx) => (
                <div key={sData.s.id || sIdx} className="flex items-center gap-1.5 min-w-0 max-w-[140px] sm:max-w-none flex-shrink-0">
                  <span className={`${legendDotClass} rounded-full flex-shrink-0`} style={{ backgroundColor: sData.sColor }} />
                  <span className="text-slate-600 dark:text-zinc-300 font-semibold truncate">{sData.name}</span>
                </div>
              ))}
            </div>
          )}
          <svg viewBox={d.xAxisTitle ? "0 0 440 160" : "0 0 440 144"} preserveAspectRatio="xMidYMid meet" className="w-full h-full flex-1 max-h-full max-w-full block overflow-visible">
            {/* Y-axis */}
            <line x1="48" y1="16" x2="48" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="114" x2="425" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {yHeader && (
              <text x="48" y="10" fontSize={svgTitleSize} fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
                {yHeader}
              </text>
            )}
            {/* Y grid */}
            {yTicks.map((g, i) => (
              <g key={i}>
                {d.showGridLines && (
                  <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                )}
                <text x="43" y={g.y + 2.5} fontSize={svgTickSize} textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.label}</text>
              </g>
            ))}
            {/* X ticks */}
            {d.categories.map((cat, i) => {
              const cx = 56 + (n > 1 ? (i / (n - 1)) * 360 : 180);
              return (
                <g key={i}>
                  <line x1={cx} y1="114" x2={cx} y2="118" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={cx} y={130} fontSize={svgTickSize} textAnchor="middle" fill="currentColor" fillOpacity="0.55">{cat}</text>
                </g>
              );
            })}
            {/* Dynamic Lines & Markers for all series */}
            {allSeriesData.map((sData, sIdx) => (
              <g key={sData.s.id || sIdx}>
                <path
                  d={sData.path}
                  fill="none"
                  stroke={sData.sColor}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeDasharray={sData.dash === "none" ? undefined : sData.dash}
                />
                {sData.points.map((p, pIdx) => {
                  const ptDotColor = (d.pointColors && d.pointColors[pIdx]) || chart.dataPoints?.[pIdx]?.color || sData.sColor;
                  return (
                    <circle
                      key={pIdx}
                      cx={p.cx}
                      cy={p.cy}
                      r="3"
                      fill="#fff"
                      stroke={ptDotColor}
                      strokeWidth="2"
                    />
                  );
                })}
              </g>
            ))}
            {d.xAxisTitle && (
              <text x="238" y="150" fontSize={svgTitleSize} fontWeight="600" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{d.xAxisTitle}</text>
            )}
          </svg>
        </div>
      );
    }

    case "two-segment": {
      const d = resolveChartData(
        [c0, c1, c2, c3, c4],
        ["Compliant Workers", "PPE Score", "Incident-Free Days"],
        [85, 73, 92],
        100,
        "%"
      );
      const yRange = (d.yMax - d.yMin) || 1;

      return (
        <div className={`w-full h-full min-h-0 flex flex-col justify-center ${isUltraCompact ? "gap-1" : isCompact ? "gap-1.5" : "gap-2.5"} text-xs px-2 py-1 overflow-hidden`}>
          {d.values.map((v, i) => {
            const pct = Math.max(0, Math.min(100, ((v - d.yMin) / yRange) * 100));
            const col = d.pointColors?.[i] || [c0, c1, c2, c3, c4][i % 5];
            const label = d.categories[i] || `Metric ${i + 1}`;
            return (
              <div key={i} className="space-y-0.5 sm:space-y-1">
                <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-300">
                  <span className={legendTextClass}>{label}</span>
                  <span className={legendTextClass}>{formatDataValue(v, d.unit)}</span>
                </div>
                <div className={`w-full ${isUltraCompact ? "h-2.5" : isCompact ? "h-3 sm:h-3.5" : "h-4 sm:h-5"} bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex`}>
                  <div className="h-full rounded-lg transition-all" style={{ width: `${pct}%`, backgroundColor: col }} />
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case "area": {
      const d = resolveChartData(chartColors, ["Jan", "Apr", "Jul", "Oct"], [88, 94, 96, 99], 100, "%");
      const n = d.categories.length;
      const yRange = (d.yMax - d.yMin) || 1;
      const points = d.values.map((v, i) => {
        const cx = 56 + (n > 1 ? (i / (n - 1)) * 360 : 180);
        const norm = Math.max(0, Math.min(1, (v - d.yMin) / yRange));
        const cy = 114 - norm * 88;
        return { cx, cy, val: v, label: d.categories[i] };
      });
      const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(" ");
      const areaD = `${pathD} L ${points[points.length - 1].cx.toFixed(1)} 114 L ${points[0].cx.toFixed(1)} 114 Z`;

      const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((r) => ({
        y: 114 - r * 88,
        label: formatYTick(d.yMin + r * yRange, d.unit),
      }));

      const yHeader = getYAxisHeader(d.yAxisTitle, d.unit);

      return (
        <div className={chartWrapperClass}>
          <svg viewBox={d.xAxisTitle ? "0 0 440 160" : "0 0 440 144"} preserveAspectRatio="xMidYMid meet" className="w-full h-full flex-1 max-h-full max-w-full block overflow-visible">
            <defs>
              <linearGradient id={`areagrad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c0} stopOpacity="0.5" />
                <stop offset="100%" stopColor={c0} stopOpacity="0.03" />
              </linearGradient>
            </defs>
            <line x1="48" y1="16" x2="48" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            <line x1="48" y1="114" x2="425" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {yHeader && (
              <text x="48" y="10" fontSize={svgTitleSize} fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
                {yHeader}
              </text>
            )}
            {yTicks.map((g, i) => (
              <g key={i}>
                {d.showGridLines && (
                  <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                )}
                <text x="43" y={g.y + 2.5} fontSize={svgTickSize} textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.label}</text>
              </g>
            ))}
            {points.map((p, i) => (
              <g key={i}>
                <line x1={p.cx} y1="114" x2={p.cx} y2="118" stroke="currentColor" strokeOpacity="0.3" />
                <text x={p.cx} y={130} fontSize={svgTickSize} textAnchor="middle" fill="currentColor" fillOpacity="0.55">{p.label}</text>
              </g>
            ))}
            <path d={areaD} fill={`url(#areagrad-${chart.id})`} />
            <path d={pathD} fill="none" stroke={c0} strokeWidth="2.5" strokeLinecap="round" />
            {points.map((pt, i) => {
              const ptDotColor = (d.pointColors && d.pointColors[i]) || chart.dataPoints?.[i]?.color || c0;
              return (
                <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#fff" stroke={ptDotColor} strokeWidth="2" />
              );
            })}
            {d.xAxisTitle && (
              <text x="238" y="150" fontSize={svgTitleSize} fontWeight="600" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{d.xAxisTitle}</text>
            )}
          </svg>
        </div>
      );
    }

    case "radar": {
      const d = resolveChartData(
        chartColors,
        ["PPE", "Response", "Reporting", "Checks", "Housekeeping"],
        [94, 85, 78, 92, 86],
        100,
        "pts"
      );
      const n = d.categories.length || 5;
      const rOuter = 40;
      const cx = 50;
      const cy = 50;

      const getPoints = (vals: number[]) =>
        vals
          .map((v, i) => {
            const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
            const norm = Math.max(0.1, Math.min(1, v / (d.yMax || 100)));
            const px = cx + rOuter * norm * Math.cos(angle);
            const py = cy + rOuter * norm * Math.sin(angle);
            return `${px.toFixed(1)},${py.toFixed(1)}`;
          })
          .join(" ");

      return (
        <div className="w-full h-full min-h-0 flex items-center justify-center overflow-hidden py-1">
          <svg viewBox="0 0 100 100" className="h-full w-full max-h-full overflow-visible">
            {/* Background Webs */}
            <polygon points={getPoints(Array(n).fill(100))} fill="none" stroke="currentColor" strokeOpacity="0.2" strokeWidth="0.8" />
            <polygon points={getPoints(Array(n).fill(50))} fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="0.8" strokeDasharray="2 2" />
            {/* Target Series polygon if available */}
            {d.secondaryValues && (
              <polygon points={getPoints(d.secondaryValues)} fill={c1} fillOpacity="0.2" stroke={c1} strokeWidth="1.2" strokeDasharray="3 2" />
            )}
            {/* Main Series polygon */}
            <polygon points={getPoints(d.values)} fill={c0} fillOpacity="0.38" stroke={c0} strokeWidth="1.6" />
            {/* Labels */}
            {d.categories.map((cat, i) => {
              const angle = (Math.PI * 2 * i) / n - Math.PI / 2;
              const px = cx + (rOuter + 8) * Math.cos(angle);
              const py = cy + (rOuter + 8) * Math.sin(angle);
              return (
                <text key={i} x={px} y={py + 2} fontSize={svgTickSize} textAnchor="middle" fill="currentColor" fillOpacity="0.7" fontWeight="bold">
                  {cat}
                </text>
              );
            })}
          </svg>
        </div>
      );
    }

    case "gauge": {
      const d = resolveChartData(chartColors, ["Score"], [72], 100, "%");
      const primaryVal = chart.dataPoints?.[0]?.value ?? d.values[0] ?? 72;
      const targetVal = chart.dataPoints?.[0]?.target;
      const yRange = (d.yMax - d.yMin) || 1;
      const norm = Math.max(0, Math.min(1, (primaryVal - d.yMin) / yRange));
      const angle = norm * 180;
      const rad = (180 - angle) * (Math.PI / 180);
      const endX = 50 + 40 * Math.cos(rad);
      const endY = 50 - 40 * Math.sin(rad);
      const pathGauge = `M 10 50 A 40 40 0 0 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`;

      const gaugeWClass = isUltraCompact ? "w-28 sm:w-32" : isCompact ? "w-36 sm:w-44" : "w-48 sm:w-56";
      const valSizeClass = isUltraCompact ? "text-lg sm:text-xl" : isCompact ? "text-xl sm:text-2xl" : "text-2xl sm:text-3xl";
      const gaugeColor = chart.dataPoints?.[0]?.color || d.pointColors?.[0] || c0;

      return (
        <div className="w-full h-full min-h-0 flex flex-col items-center justify-center relative overflow-hidden py-1">
          <svg viewBox="0 0 100 56" preserveAspectRatio="xMidYMid meet" className={`${gaugeWClass} h-auto max-h-full max-w-full block overflow-visible`}>
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeOpacity="0.12" strokeWidth="12" strokeLinecap="round" />
            <path d={pathGauge} fill="none" stroke={gaugeColor} strokeWidth="12" strokeLinecap="round" />
          </svg>
          <div className="text-center -mt-2 sm:-mt-3">
            <div className={`font-black ${valSizeClass} text-slate-800 dark:text-white leading-none`}>
              {primaryVal}{d.unit}
            </div>
            {targetVal !== undefined && (
              <div className={`${isUltraCompact ? "text-[8px]" : "text-[10px]"} font-mono text-slate-400 mt-0.5`}>
                Target: {targetVal}{d.unit}
              </div>
            )}
            {d.categories[0] && (
              <div className={`${isUltraCompact ? "text-[8px]" : "text-[10px]"} font-mono text-[#9D61FF] font-bold uppercase mt-0.5`}>
                {d.categories[0]}
              </div>
            )}
          </div>
        </div>
      );
    }

    case "scatter":
    case "bubble": {
      const isBubble = chart.chartType === "bubble";
      const pts = (chart.dataPoints && chart.dataPoints.length > 0)
        ? chart.dataPoints
        : [
            { label: "Pump A-1", x: 25, y: 35, size: 14, value: 35 },
            { label: "Turbine T-2", x: 45, y: 78, size: 24, value: 78 },
            { label: "Compressor C-1", x: 60, y: 52, size: 18, value: 52 },
            { label: "Generator G-4", x: 80, y: 88, size: 28, value: 88 },
            { label: "Motor M-5", x: 92, y: 40, size: 12, value: 40 },
          ];

      return (
        <div className={chartWrapperClass}>
          <svg viewBox="0 0 440 144" preserveAspectRatio="xMidYMid meet" className="w-full h-full flex-1 max-h-full max-w-full block overflow-visible">
            <line x1="48" y1="16" x2="48" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            <line x1="48" y1="114" x2="425" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {[0, 25, 50, 75, 100].map((v, i) => {
              const y = 114 - (v / 100) * 88;
              return (
                <g key={i}>
                  <line x1="45" y1={y} x2="425" y2={y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="43" y={y + 2.5} fontSize={svgTickSize} textAnchor="end" fill="currentColor" fillOpacity="0.5">{v}</text>
                </g>
              );
            })}
            {[20, 40, 60, 80, 100].map((v, i) => {
              const x = 48 + (v / 100) * 360;
              return (
                <g key={i}>
                  <line x1={x} y1="114" x2={x} y2="118" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={x} y={130} fontSize={svgTickSize} textAnchor="middle" fill="currentColor" fillOpacity="0.55">{v}</text>
                </g>
              );
            })}
            {pts.map((pt, i) => {
              const rawX = typeof pt.x === "number" ? pt.x : parseFloat(String(pt.x)) || (i * 20 + 20);
              const rawY = typeof pt.y === "number" ? pt.y : pt.value ?? (i * 15 + 30);
              const cx = 48 + Math.max(0, Math.min(100, rawX) / 100) * 360;
              const cy = 114 - Math.max(0, Math.min(100, rawY) / 100) * 88;
              const r = isBubble ? Math.max(6, Math.min(26, pt.size ?? 16)) : 4.5;
              const pCol = pt.color || c0;

              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r={r} fill={pCol} fillOpacity={isBubble ? "0.45" : "0.9"} stroke={pCol} strokeWidth="1.5" />
                  <text x={cx} y={cy - r - 3} fontSize={svgTickSize} fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.75">{pt.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
      );
    }

    case "funnel": {
      const pts = (chart.dataPoints && chart.dataPoints.length > 0)
        ? chart.dataPoints
        : [
            { label: "Gate Entries", value: 1200 },
            { label: "Briefing Passed", value: 850 },
            { label: "PPE Inspected", value: 420 },
            { label: "Zero Violations", value: 180 },
          ];
      const maxVal = Math.max(...pts.map((p) => p.value), 1);

      return (
        <div className="w-full h-full min-h-0 flex flex-col items-center justify-center gap-1.5 text-xs text-white font-bold py-1 overflow-hidden">
          {pts.map((pt, i) => {
            const pct = Math.max(25, (pt.value / maxVal) * 100);
            const op = 1 - (i * 0.18);
            const stageColor = pt.color || chart.dataPoints?.[i]?.color || chartColors[i % chartColors.length] || c0;
            return (
              <div
                key={i}
                className="h-7 sm:h-8 rounded-lg flex items-center justify-between px-3 transition-all"
                style={{ width: `${pct}%`, backgroundColor: stageColor, opacity: Math.max(0.4, op) }}
              >
                <span className="text-[10px] sm:text-xs truncate">{pt.label}</span>
                <span className="text-[10px] sm:text-xs font-mono font-black">{pt.value.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      );
    }

    case "sparkline": {
      const channels = (chart.dataPoints && chart.dataPoints.length > 0)
        ? chart.dataPoints
        : [
            { label: "Zone A", rowValues: [25, 10, 20, 5, 15, 0], color: c0 },
            { label: "Zone B", rowValues: [20, 25, 10, 20, 5, 15], color: c1 },
            { label: "Zone C", rowValues: [30, 15, 25, 10, 20, 5], color: c2 },
          ];

      return (
        <div className="w-full h-full min-h-0 flex flex-col items-center justify-center gap-2.5 py-1 overflow-hidden">
          {channels.map((s, i) => {
            const vals = (s.rowValues && s.rowValues.length > 0)
              ? s.rowValues.map((v) => (typeof v === "number" ? v : parseFloat(String(v)) || 0))
              : [10, 20, 15, 30, 25, 35];
            const maxV = Math.max(...vals, 1);
            const minV = Math.min(...vals, 0);
            const span = (maxV - minV) || 1;
            const ptsSvg = vals
              .map((v, idx) => {
                const x = (idx / (vals.length - 1 || 1)) * 100;
                const y = 30 - ((v - minV) / span) * 26;
                return `${idx === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
              })
              .join(" ");

              const channelColor = s.color || chartColors[i % chartColors.length] || c0;
              return (
                <div key={i} className="flex items-center gap-3 w-full px-2">
                  <span className={`text-[10px] font-bold text-slate-500 w-16 text-right truncate ${legendTextClass}`}>{s.label}</span>
                  <svg viewBox="0 0 100 32" className="flex-1 h-6 overflow-visible">
                    <path d={ptsSvg} fill="none" stroke={channelColor} strokeWidth="2.2" strokeLinecap="round" />
                  </svg>
                  <span className="text-[10px] font-bold" style={{ color: channelColor }}>↑</span>
                </div>
              );
          })}
        </div>
      );
    }

    case "combo": {
      const d = resolveChartData(chartColors, ["Jan", "Feb", "Mar", "Apr", "May"], [55, 75, 42, 85, 30], 100, "%");
      const secVals = d.secondaryValues || [45, 65, 35, 75, 25];
      const n = d.categories.length;
      const yRange = (d.yMax - d.yMin) || 1;

      return (
        <div className={chartWrapperClass}>
          <svg viewBox="0 0 440 144" preserveAspectRatio="xMidYMid meet" className="w-full h-full flex-1 max-h-full max-w-full block overflow-visible">
            <line x1="48" y1="16" x2="48" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            <line x1="48" y1="114" x2="425" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {[0, 25, 50, 75, 100].map((v, i) => {
              const y = 114 - (v / 100) * 88;
              return (
                <g key={i}>
                  <line x1="45" y1={y} x2="425" y2={y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                  <text x="43" y={y + 2.5} fontSize={svgTickSize} textAnchor="end" fill="currentColor" fillOpacity="0.5">{v}</text>
                </g>
              );
            })}
            {/* Bars for Series 1 */}
            {d.values.map((v, i) => {
              const x = 56 + ((i + 0.5) / n) * 360;
              const h = Math.max(3, ((v - d.yMin) / yRange) * 88);
              return (
                <g key={i}>
                  <rect x={x - 16} y={114 - h} width="32" height={h} fill={c0} opacity="0.8" rx="2" />
                  <line x1={x} y1="114" x2={x} y2="118" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={x} y={130} fontSize={svgTickSize} textAnchor="middle" fill="currentColor" fillOpacity="0.55">{d.categories[i]}</text>
                </g>
              );
            })}
            {/* Line for Series 2 */}
            <path
              d={secVals.map((v, i) => {
                const x = 56 + ((i + 0.5) / n) * 360;
                const y = 114 - Math.max(3, ((v - d.yMin) / yRange) * 88);
                return `${i === 0 ? "M" : "L"} ${x} ${y}`;
              }).join(" ")}
              fill="none"
              stroke={c1}
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            {secVals.map((v, i) => {
              const x = 56 + ((i + 0.5) / n) * 360;
              const y = 114 - Math.max(3, ((v - d.yMin) / yRange) * 88);
              return <circle key={i} cx={x} cy={y} r="3" fill={c1} />;
            })}
            {/* Legend */}
            <rect x="52" y="10" width="7" height="7" fill={c0} rx="1" /><text x="62" y="16" fontSize={svgTickSize} fill="currentColor" fillOpacity="0.6">{chart.series?.[0]?.name || "Volume"}</text>
            <line x1="110" y1="14" x2="122" y2="14" stroke={c1} strokeWidth="2" /><text x="125" y="16" fontSize={svgTickSize} fill="currentColor" fillOpacity="0.6">{chart.series?.[1]?.name || "Trend"}</text>
          </svg>
        </div>
      );
    }

    case "waterfall": {
      const pts = (chart.dataPoints && chart.dataPoints.length > 0)
        ? chart.dataPoints
        : [
            { label: "Base", value: 65, color: "#64748B" },
            { label: "+ Audits", value: 20, color: "#10B981" },
            { label: "- Violations", value: -15, color: "#F43F5E" },
            { label: "+ Training", value: 10, color: "#10B981" },
            { label: "Net Total", value: 80, color: c0 },
          ];

      return (
        <div className={chartWrapperClass}>
          <svg viewBox="0 0 440 144" preserveAspectRatio="xMidYMid meet" className="w-full h-full flex-1 max-h-full max-w-full block overflow-visible">
            <line x1="48" y1="16" x2="48" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            <line x1="48" y1="114" x2="425" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {pts.map((p, i) => {
              const x = 60 + i * 72;
              const isNeg = p.value < 0;
              const h = Math.min(60, Math.max(12, Math.abs(p.value) * 1.2));
              const y = isNeg ? 60 : 60 - h;
              const ptColor = p.color || chart.dataPoints?.[i]?.color;
              const barColor = ptColor || (isNeg ? "#F43F5E" : (i === pts.length - 1 ? c0 : "#10B981"));

              return (
                <g key={i}>
                  <rect x={x} y={y} width="52" height={h} fill={barColor} rx="2" />
                  <line x1={x + 26} y1="114" x2={x + 26} y2="118" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={x + 26} y={130} fontSize={svgTickSize} textAnchor="middle" fill="currentColor" fillOpacity="0.7">{p.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
      );
    }

    case "treemap": {
      const items = (chart.dataPoints && chart.dataPoints.length > 0)
        ? chart.dataPoints
        : [
            { label: "Civil Works", value: 45, color: c0 },
            { label: "Mechanical", value: 25, color: c1 },
            { label: "Electrical", value: 18, color: c2 },
            { label: "Chemical", value: 12, color: c3 },
          ];

      return (
        <div className="w-full h-full min-h-0 grid grid-cols-3 gap-1.5 p-1 text-white font-bold text-[10px] overflow-hidden">
          {items.map((item, i) => (
            <div
              key={i}
              className={`rounded-lg p-2 flex items-end ${i === 0 ? "col-span-2 row-span-2" : i === 3 ? "col-span-3" : ""}`}
              style={{ backgroundColor: item.color || chartColors[i % chartColors.length] || [c0, c1, c2, c3][i % 4] }}
            >
              <div className="truncate">
                <div>{item.label}</div>
                <div className="text-[9px] font-mono opacity-80">{item.value}%</div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "kpi-card": {
      const kpis: ChartDataPoint[] = (chart.dataPoints && chart.dataPoints.length > 0)
        ? chart.dataPoints
        : [
            { id: "k1", label: "Total Incidents", value: 0, status: "0", trend: "-100%", trendDirection: "down", color: "#10B981" },
            { id: "k2", label: "PPE Compliance", value: 97.4, status: "97.4%", trend: "+2.1%", trendDirection: "up", color: c0 },
            { id: "k3", label: "Worker Hours", value: 18750, status: "18,750", trend: "+5.3%", trendDirection: "up", color: c1 },
            { id: "k4", label: "Near-Misses", value: 12, status: "12", trend: "-33%", trendDirection: "down", color: c2 },
          ];

      return (
        <div className={`w-full h-full min-h-0 grid grid-cols-2 ${isUltraCompact ? "gap-1.5 p-0.5" : isCompact ? "gap-2 p-1" : "gap-2.5 p-1"} auto-rows-fr overflow-hidden`}>
          {kpis.slice(0, 4).map((k, i) => (
            <div
              key={i}
              className={`flex flex-col justify-between bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md rounded-xl ${isUltraCompact ? "p-1.5" : isCompact ? "p-2 sm:p-2.5" : "p-3 sm:p-4"} border border-slate-200/80 dark:border-zinc-800/80 hover:border-[#9D61FF]/40 transition-all min-h-0 overflow-hidden`}
            >
              <span className={`${isUltraCompact ? "text-[8px]" : "text-[10px] sm:text-xs"} font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider truncate`}>
                {k.label}
              </span>
              <div className={`font-black ${isUltraCompact ? "text-sm sm:text-base" : isCompact ? "text-base sm:text-xl" : "text-xl sm:text-2xl"} text-slate-900 dark:text-white leading-tight my-auto truncate`}>
                {k.status || k.value}
              </div>
              <span className={`font-bold ${isUltraCompact ? "text-[8px]" : "text-[10px] sm:text-xs"} flex items-center gap-1`} style={{ color: k.color || [c3, c0, c1, c2][i % 4] }}>
                {k.trendDirection === "down" ? "↓" : "↑"} {k.trend || "+0%"}
              </span>
            </div>
          ))}
        </div>
      );
    }

    case "timeline": {
      const tasks = (chart.dataPoints && chart.dataPoints.length > 0)
        ? chart.dataPoints
        : [
            { label: "Foundation", value: 10, secondaryValue: 35, status: "Completed", color: c0 },
            { label: "Framing", value: 40, secondaryValue: 30, status: "In Progress", color: c1 },
            { label: "Sign-Off", value: 65, secondaryValue: 30, status: "Pending", color: c2 },
          ];

      return (
        <div className="w-full h-full min-h-0 flex flex-col justify-center gap-2 p-1 overflow-hidden">
          {tasks.map((t, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-20 text-right text-[10px] font-bold text-slate-500 truncate ${legendTextClass}`}>{t.label}</div>
              <div className="flex-1 h-5 bg-slate-100 dark:bg-zinc-800 rounded flex items-center">
                <div
                  className="h-full rounded transition-all"
                  style={{
                    width: `${Math.max(10, Math.min(80, t.secondaryValue ?? 30))}%`,
                    marginLeft: `${Math.max(0, Math.min(70, t.value ?? 10))}%`,
                    backgroundColor: t.color || [c0, c1, c2, c3][i % 4],
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "geo-map": {
      const sites = (chart.dataPoints && chart.dataPoints.length > 0)
        ? chart.dataPoints
        : [
            { label: "Site A", x: 30, y: 45, color: c0 },
            { label: "Site B", x: 62, y: 35, color: c1 },
            { label: "Site C", x: 45, y: 75, color: c2 },
            { label: "Site D", x: 80, y: 62, color: c3 },
          ];

      return (
        <div className="w-full h-full min-h-0 relative overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-700">
          <svg viewBox="0 0 400 176" className="w-full h-full">
            {[40, 80, 120, 160].map((y) => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />)}
            {[80, 160, 240, 320].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="176" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />)}
            {sites.map((s, i) => {
              const rawX = typeof s.x === "number" ? s.x : 50;
              const rawY = typeof s.y === "number" ? s.y : 50;
              const cx = (rawX / 100) * 360 + 20;
              const cy = (rawY / 100) * 140 + 18;
              const pinColor = s.color || [c0, c1, c2, c3][i % 4];

              return (
                <g key={i}>
                  <circle cx={cx} cy={cy} r="12" fill={pinColor} fillOpacity="0.2" />
                  <circle cx={cx} cy={cy} r="5" fill={pinColor} />
                  <text x={cx} y={cy + 18} fontSize="8.5" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.75">{s.label}</text>
                </g>
              );
            })}
          </svg>
          <div className="absolute bottom-1.5 right-2 text-[8px] font-mono text-slate-400 bg-white/70 dark:bg-zinc-900/70 px-1.5 py-0.5 rounded">Telemetry Map</div>
        </div>
      );
    }

    case "table": {
      const headers = chart.tableColumns && chart.tableColumns.length > 0
        ? chart.tableColumns
        : ["#", "Category / Metric", "Value", "Target", "Status"];

      const pts = (chart.dataPoints && chart.dataPoints.length > 0)
        ? chart.dataPoints
        : [
            { id: "t1", label: "Zone North", value: 94.5, secondaryValue: 90, status: "Optimal" },
            { id: "t2", label: "Substation East", value: 88.0, secondaryValue: 85, status: "Normal" },
            { id: "t3", label: "Refinery Yard", value: 76.5, secondaryValue: 85, status: "Review" },
            { id: "t4", label: "Storage Depot", value: 92.0, secondaryValue: 90, status: "Optimal" },
          ];

      return (
        <div className="w-full h-full min-h-0 overflow-auto custom-scrollbar p-1">
          <table className="w-full text-left border-collapse text-[10px] sm:text-xs">
            <thead>
              <tr className="border-b border-slate-200/80 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/60 sticky top-0">
                {headers.map((h, i) => {
                  const headerTitle = typeof h === "string" ? h : (h?.label || h?.id || `Col ${i + 1}`);
                  return (
                    <th key={i} className="py-1.5 px-2 font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                      {headerTitle}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-medium text-slate-700 dark:text-zinc-200">
              {pts.map((pt, rIdx) => {
                const rowCells = pt.rowValues && pt.rowValues.length > 0
                  ? pt.rowValues
                  : [
                      rIdx + 1,
                      pt.label,
                      `${pt.value}${chart.yAxis?.unit ? ` ${chart.yAxis.unit}` : ""}`,
                      pt.secondaryValue !== undefined ? `${pt.secondaryValue}${chart.yAxis?.unit ? ` ${chart.yAxis.unit}` : ""}` : "-",
                      pt.status || (pt.value >= 90 ? "Optimal" : pt.value >= 80 ? "Normal" : "Review")
                    ];

                return (
                  <tr key={pt.id || rIdx} className="hover:bg-slate-50/60 dark:hover:bg-zinc-800/40 transition-colors">
                    {rowCells.map((cell, cIdx) => (
                      <td key={cIdx} className="py-1.5 px-2 whitespace-nowrap">
                        {cIdx === rowCells.length - 1 && typeof cell === "string" && ["Optimal", "Normal", "Review", "Warning", "Critical"].includes(cell) ? (
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              cell === "Optimal"
                                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                : cell === "Normal"
                                ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                                : cell === "Review" || cell === "Warning"
                                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400"
                                : "bg-rose-500/10 text-rose-600 dark:text-rose-400"
                            }`}
                          >
                            {cell}
                          </span>
                        ) : (
                          String(cell ?? "")
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      );
    }

    case "bar":
    default: {
      const d = resolveChartData(
        chartColors,
        ["L&T Civil", "Steel Mech", "Tower Crane", "Batching", "Subterra"],
        [94.2, 98.7, 88.4, 96.5, 84.0],
        100,
        "%"
      );
      const n = d.categories.length;
      const yRange = (d.yMax - d.yMin) || 1;
      const bw = Math.min(36, Math.max(12, (360 / n) * 0.65));

      const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((r) => ({
        y: 114 - r * 88,
        label: formatYTick(d.yMin + r * yRange, d.unit),
      }));

      const yHeader = getYAxisHeader(d.yAxisTitle, d.unit);

      return (
        <div className={chartWrapperClass}>
          <svg viewBox={d.xAxisTitle ? "0 0 440 160" : "0 0 440 144"} preserveAspectRatio="xMidYMid meet" className="w-full h-full flex-1 max-h-full max-w-full block overflow-visible">
            <line x1="48" y1="16" x2="48" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            <line x1="48" y1="114" x2="425" y2="114" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {yHeader && (
              <text x="48" y="10" fontSize={svgTitleSize} fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
                {yHeader}
              </text>
            )}
            {yTicks.map((g, i) => (
              <g key={i}>
                {d.showGridLines && (
                  <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                )}
                <text x="43" y={g.y + 2.5} fontSize={svgTickSize} textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.label}</text>
              </g>
            ))}
            {d.values.map((v, i) => {
              const x = 56 + ((i + 0.5) / n) * 360;
              const norm = Math.max(0, Math.min(1, (v - d.yMin) / yRange));
              const barH = Math.max(3, norm * 88);
              const barColor = d.pointColors?.[i] || chart.dataPoints?.[i]?.color || c0;

              return (
                <g key={i}>
                  <rect x={x - bw / 2} y={114 - barH} width={bw} height={barH} rx="4" fill={barColor} />
                  {d.showValues && (
                    <text x={x} y={114 - barH - 4} fontSize={svgValueSize} fontWeight="bold" textAnchor="middle" fill={barColor}>
                      {formatDataValue(v, d.unit, n > 6)}
                    </text>
                  )}
                  <line x1={x} y1="114" x2={x} y2="118" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={x} y={130} fontSize={svgTickSize} textAnchor="middle" fill="currentColor" fillOpacity="0.55">
                    {d.categories[i]}
                  </text>
                </g>
              );
            })}
            {d.xAxisTitle && (
              <text x="238" y="150" fontSize={svgTitleSize} fontWeight="600" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{d.xAxisTitle}</text>
            )}
          </svg>
        </div>
      );
    }
    }
  };

  const overflowClass = userZoom > 1 ? "overflow-visible" : "overflow-hidden";

  const scaledChart = (
    <div
      style={{
        transform: userZoom !== 1 ? `scale(${userZoom})` : undefined,
        transformOrigin: "center center",
        width: "100%",
        height: "100%",
      }}
      className={`w-full h-full min-h-0 flex-1 flex flex-col items-center justify-center transition-transform duration-100 ${overflowClass}`}
    >
      {renderChart()}
    </div>
  );

  if (typeof height === "number") {
    return (
      <div
        style={{ height: `${height}px`, maxHeight: "100%", width: "100%" }}
        className={`w-full h-full min-h-0 flex-1 flex items-center justify-center ${overflowClass} [&>div]:!min-h-0 [&>div]:!max-h-full [&>div]:!h-full [&>div]:!w-full`}
      >
        {scaledChart}
      </div>
    );
  }

  return (
    <div
      className={`w-full h-full min-h-0 max-h-full flex-1 flex items-center justify-center ${overflowClass} [&>div]:!min-h-0 [&>div]:!max-h-full [&>div]:!h-full [&>div]:!w-full`}
    >
      {scaledChart}
    </div>
  );
}
