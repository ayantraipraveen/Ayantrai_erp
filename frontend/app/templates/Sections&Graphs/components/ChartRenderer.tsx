"use client";

import React from "react";
import { LibraryChartCard } from "@/lib/redux/slices/reportModuleSlice";

interface ChartRendererProps {
  chart: LibraryChartCard;
  color?: string;
  colors?: string[];
  gridRows?: number;
  gridCols?: number;
  height?: number;
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
}: ChartRendererProps) {
  const chartColors = colors && colors.length > 0 ? colors : chart.colors || [];
  const c0 = chartColors[0] || chart.color || color;
  const c1 = chartColors[1] || "#10B981";
  const c2 = chartColors[2] || "#F59E0B";
  const c3 = chartColors[3] || "#F43F5E";
  const c4 = chartColors[4] || "#06B6D4";

  const effectiveRows = gridRows ?? chart.gridRows;
  const effectiveCols = gridCols ?? chart.gridCols;

  interface ResolvedChartData {
    categories: string[];
    values: number[];
    secondaryValues?: number[];
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
    let pointColors: string[] | undefined = undefined;

    if (hasPoints && chart.dataPoints) {
      categories = chart.dataPoints.map((p, i) => p.label || `Item ${i + 1}`);
      values = chart.dataPoints.map((p) => p.value ?? 0);
      if (chart.dataPoints.some((p) => p.secondaryValue !== undefined)) {
        secondaryValues = chart.dataPoints.map((p) => p.secondaryValue ?? 0);
      }
      if (chart.dataPoints.some((p) => p.color)) {
        pointColors = chart.dataPoints.map((p, i) => p.color || palette[i % palette.length]);
      }
    } else if (hasSeries && chart.series) {
      if (chart.xAxis?.labels && chart.xAxis.labels.length > 0) {
        categories = chart.xAxis.labels;
      }
      values = chart.series[0]?.data || fallbackValues;
      if (chart.series.length > 1) {
        secondaryValues = chart.series[1]?.data;
      }
    } else if (chart.xAxis?.labels && chart.xAxis.labels.length > 0) {
      categories = chart.xAxis.labels;
    }

    const rawMax = Math.max(
      ...values,
      ...(secondaryValues || []),
      hasCustomData ? 1 : fallbackYMax
    );
    const rawMin = Math.min(
      ...values,
      ...(secondaryValues || [0]),
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

  const renderChart = () => {
    switch (chart.chartType) {
    case "line": {
      const d = resolveChartData(chartColors, ["08:00", "12:00", "16:00", "20:00", "24:00"], [88, 94, 96, 99, 100], 100, "%");
      const n = d.categories.length;
      const yRange = (d.yMax - d.yMin) || 1;
      const points = d.values.map((v, i) => {
        const cx = 56 + (n > 1 ? (i / (n - 1)) * 360 : 180);
        const norm = Math.max(0, Math.min(1, (v - d.yMin) / yRange));
        const cy = 110 - norm * 96;
        return { cx, cy, val: v, label: d.categories[i] };
      });
      const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(" ");
      const areaD = `${pathD} L ${points[points.length - 1].cx.toFixed(1)} 110 L ${points[0].cx.toFixed(1)} 110 Z`;

      const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((r) => ({
        y: 110 - r * 96,
        label: formatYTick(d.yMin + r * yRange, d.unit),
      }));

      const yHeader = getYAxisHeader(d.yAxisTitle, d.unit);

      return (
        <div className="w-full h-auto min-h-[260px] max-h-[520px] flex flex-col justify-center">
          <svg viewBox={d.xAxisTitle ? "0 0 440 148" : "0 0 440 138"} className="w-full flex-1 overflow-visible">
            <defs>
              <linearGradient id={`grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c0} stopOpacity="0.35" />
                <stop offset="100%" stopColor={c0} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Y-axis */}
            <line x1="48" y1="12" x2="48" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="110" x2="425" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y-axis Header / Unit */}
            {yHeader && (
              <text x="48" y="7" fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
                {yHeader}
              </text>
            )}
            {/* Y grid + labels */}
            {yTicks.map((g, i) => (
              <g key={i}>
                {d.showGridLines && (
                  <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                )}
                <text x="43" y={g.y + 2.5} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.label}</text>
              </g>
            ))}
            {/* X ticks */}
            {points.map((p, i) => (
              <g key={i}>
                <line x1={p.cx} y1="110" x2={p.cx} y2="114" stroke="currentColor" strokeOpacity="0.3" />
                <text x={p.cx} y={124} fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.55">{p.label}</text>
              </g>
            ))}
            {/* Area fill */}
            <path d={areaD} fill={`url(#grad-${chart.id})`} />
            {/* Line */}
            <path d={pathD} fill="none" stroke={c0} strokeWidth="2.5" strokeLinecap="round" />
            {/* Points */}
            {points.map((pt, i) => (
              <g key={i}>
                <circle cx={pt.cx} cy={pt.cy} r="3" fill="#fff" stroke={c0} strokeWidth="2" />
                {d.showValues && (
                  <text x={pt.cx} y={pt.cy - 6} fontSize="7" fontWeight="bold" textAnchor="middle" fill={c0}>
                    {formatDataValue(pt.val, d.unit, n > 6)}
                  </text>
                )}
              </g>
            ))}
            {d.xAxisTitle && (
              <text x="238" y="141" fontSize="7" fontWeight="600" textAnchor="middle" fill="currentColor" fillOpacity="0.6" letterSpacing="0.03em">{d.xAxisTitle}</text>
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
        const segmentColor = d.pointColors?.[i] || [c0, c1, c2, c3, c4][i % 5];
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

      return (
        <div className="w-full h-full min-h-[260px] max-h-[520px] flex items-center justify-center gap-8 sm:gap-14 py-2">
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex items-center justify-center flex-shrink-0">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90 overflow-visible">
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
                <span className="text-xl sm:text-2xl font-black font-mono text-slate-900 dark:text-white leading-none">
                  {primaryPct}%
                </span>
                <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-1 truncate max-w-[90px] text-center">
                  {d.categories[0] || "Compliant"}
                </span>
              </div>
            )}
          </div>

          {/* Legend */}
          <div className="space-y-2.5 text-xs sm:text-sm font-medium">
            {segments.map((seg, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full flex-shrink-0 shadow-2xs" style={{ backgroundColor: seg.color }} />
                <span className="text-slate-700 dark:text-zinc-300">
                  {seg.label}: <b className="font-bold">{seg.val}{d.unit} ({seg.pct}%)</b>
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }


    case "table": {
      const rowsCount = effectiveRows || 4;
      const colsCount = effectiveCols || 4;

      const ALL_COLUMNS = [
        { id: "supervisor", label: "Supervisor / Area" },
        { id: "zone", label: "Zone" },
        { id: "response", label: "Response" },
        { id: "status", label: "Status" },
        { id: "shift", label: "Adherence" },
        { id: "headcount", label: "Headcount" },
        { id: "incidents", label: "Incidents" },
        { id: "ppeScore", label: "PPE Score" },
        { id: "inspection", label: "Inspection" },
        { id: "permit", label: "Permit #" },
      ];
      const cols = Array.from({ length: colsCount }, (_, i) => ALL_COLUMNS[i] || { id: `col_${i + 1}`, label: `Col ${i + 1}` });

      const ALL_DATA = [
        { supervisor: "Sunil M. (Crew #1)", zone: "Zone 1", response: "18s", status: "Optimal", shift: "98.2%", headcount: "42", incidents: "0", ppeScore: "99%", inspection: "Passed", permit: "WP-1041" },
        { supervisor: "Pooja K. (Structural)", zone: "Tower L12", response: "24s", status: "Compliant", shift: "95.0%", headcount: "38", incidents: "0", ppeScore: "96%", inspection: "Passed", permit: "WP-1042" },
        { supervisor: "Anand R. (Subcontractor)", zone: "Batching", response: "42s", status: "Review", shift: "88.4%", headcount: "27", incidents: "1", ppeScore: "87%", inspection: "Flagged", permit: "WP-1043" },
        { supervisor: "Rajesh V. (Electrical)", zone: "Substation", response: "15s", status: "Optimal", shift: "99.1%", headcount: "19", incidents: "0", ppeScore: "100%", inspection: "Passed", permit: "WP-1044" },
        { supervisor: "Deepa S. (Safety Lead)", zone: "Gate 3", response: "29s", status: "Compliant", shift: "94.6%", headcount: "31", incidents: "0", ppeScore: "94%", inspection: "Passed", permit: "WP-1045" },
        { supervisor: "Vikram T. (Excavation)", zone: "Pit North", response: "48s", status: "Review", shift: "86.0%", headcount: "22", incidents: "2", ppeScore: "82%", inspection: "Review", permit: "WP-1046" },
      ];
      const dataRows = Array.from({ length: rowsCount }, (_, i) => {
        if (i < ALL_DATA.length) return ALL_DATA[i];
        return {
          supervisor: `Operator #${i + 1} (${["Mech", "Civil", "Elec", "Safety"][i % 4]})`,
          zone: `Zone ${(i % 6) + 1}`,
          response: `${14 + (i * 4) % 35}s`,
          status: i % 3 === 0 ? "Optimal" : i % 3 === 1 ? "Compliant" : "Review",
          shift: `${90 + (i * 2) % 10}%`,
          headcount: `${20 + (i * 3) % 30}`,
          incidents: `${i % 3}`,
          ppeScore: `${85 + (i * 3) % 15}%`,
          inspection: i % 3 === 2 ? "Review" : "Passed",
          permit: `WP-${1040 + i}`,
        };
      });

      return (
        <div className="w-full h-full max-h-[520px] overflow-auto rounded-xl border border-slate-200/80 dark:border-zinc-800/80 text-xs custom-scrollbar bg-white/40 dark:bg-zinc-900/40 backdrop-blur-sm">
          <table className="w-full min-w-max text-left border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 font-mono text-[10px] uppercase sticky top-0 z-10 shadow-2xs backdrop-blur-sm">
                {cols.map((c) => (
                  <th key={c.id} className="py-2 px-3 font-semibold whitespace-nowrap">
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              {dataRows.map((row, rIdx) => (
                <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                  {cols.map((c) => {
                    if (c.id === "supervisor") {
                      return (
                        <td key={c.id} className="py-2 px-3 font-medium text-slate-900 dark:text-white whitespace-nowrap">
                          {row.supervisor}
                        </td>
                      );
                    }
                    if (c.id === "status") {
                      const isOptimal = row.status === "Optimal";
                      const isReview = row.status === "Review";
                      const badgeColor = isOptimal ? c0 : isReview ? c2 : c1;
                      return (
                        <td key={c.id} className="py-2 px-3 whitespace-nowrap">
                          <span
                            className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                            style={{ backgroundColor: `${badgeColor}18`, color: badgeColor }}
                          >
                            {row.status}
                          </span>
                        </td>
                      );
                    }
                    if (c.id === "response") {
                      const isFast = parseInt(row.response) <= 20;
                      return (
                        <td
                          key={c.id}
                          className="py-2 px-3 font-mono font-bold whitespace-nowrap"
                          style={{ color: isFast ? c0 : c1 }}
                        >
                          {row.response}
                        </td>
                      );
                    }
                    return (
                      <td key={c.id} className="py-2 px-3 font-mono text-slate-500 whitespace-nowrap">
                        {(row as Record<string, string>)[c.id] || "—"}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    case "heatmap": {
      const rowsCount = effectiveRows || 4;
      const colsCount = effectiveCols || 7;

      const standardDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
      const days = Array.from({ length: colsCount }, (_, i) => standardDays[i] || `Day ${i + 1}`);

      const weeks = Array.from({ length: rowsCount }, (_, i) => i < 12 ? `Week ${i + 1}` : `W${i + 1}`);

      const getCellValue = (r: number, c: number) => {
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

      return (
        <div className="w-full h-full max-h-[520px] overflow-auto pt-2 text-xs custom-scrollbar bg-transparent">
          <div
            className="w-full grid gap-1.5 min-w-max pb-1"
            style={{
              gridTemplateColumns: `auto repeat(${colsCount}, minmax(36px, 1fr))`,
            }}
          >
            {/* Header column (Week labels) */}
            <div className="flex flex-col gap-1 font-mono text-[9px] text-slate-400 sticky left-0 bg-white/80 dark:bg-[#0c1017]/80 backdrop-blur-sm z-10">
              <div className="h-4 mb-1" />
              {weeks.map((w) => (
                <div key={w} className="h-7 flex items-center justify-end pr-2 font-semibold whitespace-nowrap">
                  {w}
                </div>
              ))}
            </div>
            {/* Day columns */}
            {days.map((day, cIdx) => (
              <div key={day} className="flex flex-col gap-1 min-w-[36px]">
                <div className="text-center font-bold text-slate-600 dark:text-zinc-400 mb-1 text-[10px] uppercase truncate h-4 flex items-center justify-center">
                  {day}
                </div>
                {weeks.map((_, rIdx) => {
                  const val = getCellValue(rIdx, cIdx);
                  const cellColor = val >= 92 ? c0 : val >= 80 ? c1 : c2;
                  return (
                    <div
                      key={rIdx}
                      className="h-7 rounded-md flex items-center justify-center text-[10px] font-bold text-white shadow-2xs transition-all hover:scale-105"
                      style={{ backgroundColor: cellColor }}
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
        [c0, c1, c2, c3, c4],
        ["Civil", "Mechanical", "Electrical", "Fabrication"],
        [93, 88, 90, 85],
        100,
        "%"
      );
      const yRange = (d.yMax - d.yMin) || 1;

      return (
        <div className="w-full h-auto min-h-[160px] flex flex-col justify-center py-2 gap-2.5 text-xs">
          {d.values.map((v, i) => {
            const pct = Math.max(0, Math.min(100, ((v - d.yMin) / yRange) * 100));
            const col = d.pointColors?.[i] || [c0, c1, c2, c3, c4][i % 5];
            const label = d.categories[i] || `Item ${i + 1}`;
            return (
              <div key={i} className="flex items-center gap-3">
                <span className="w-24 text-right font-medium text-slate-700 dark:text-zinc-300 truncate" title={label}>
                  {label}
                </span>
                <div className="flex-1 h-6 bg-slate-100 dark:bg-zinc-800 rounded-r-md flex items-center">
                  <div
                    className="h-full flex items-center justify-end pr-2 rounded-r-md transition-all"
                    style={{ width: `${pct}%`, backgroundColor: col }}
                  >
                    {d.showValues && (
                      <span className="text-[10px] font-bold text-white shadow-sm whitespace-nowrap">
                        {v}{d.unit}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case "stacked-horizontal":
      return (
        <div className="w-full h-44 flex flex-col justify-center py-4 text-xs">
          <div className="flex items-center justify-between mb-2 px-1">
            <span className="font-semibold text-slate-700 dark:text-zinc-300">Total Operational Hours</span>
            <span className="font-bold text-slate-900 dark:text-white">18,750</span>
          </div>
          <div className="w-full h-10 flex rounded-lg overflow-hidden shadow-sm mb-4">
            <div className="flex items-center justify-center text-white font-bold text-xs" style={{ width: "92.4%", backgroundColor: c0 }}>
              92.4% Safe
            </div>
            <div className="flex items-center justify-center text-white font-bold text-xs" style={{ width: "7.6%", backgroundColor: c1 }}>
              7.6%
            </div>
          </div>
          <div className="flex justify-between text-[10px] font-mono text-slate-500 px-1">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c0 }} /> Hours without Violations (17,330)</div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-sm flex-shrink-0" style={{ backgroundColor: c1 }} /> Hours with Violations (1,420)</div>
          </div>
        </div>
      );

    case "stacked-bar":
      return (
        <div className="w-full h-auto min-h-[260px] max-h-[520px] flex flex-col justify-center gap-2">
          {/* Nomenclature / Legend placed safely above chart bars */}
          <div className="flex items-center justify-center gap-5 pt-1 text-[11px] font-mono font-medium flex-wrap">
            {[{ c: c0, l: "Civil" }, { c: c1, l: "PPE" }, { c: c2, l: "Safety" }, { c: c3, l: "Risk" }].map((lg, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs shadow-2xs flex-shrink-0" style={{ backgroundColor: lg.c }} />
                <span className="text-slate-600 dark:text-zinc-300 font-semibold">{lg.l}</span>
              </div>
            ))}
          </div>

          <svg viewBox="0 0 440 138" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="48" y1="12" x2="48" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="110" x2="425" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y labels */}
            {[{ y: 110, l: "0%" }, { y: 86, l: "25%" }, { y: 62, l: "50%" }, { y: 38, l: "75%" }, { y: 14, l: "100%" }].map((g, i) => (
              <g key={i}>
                <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="43" y={g.y + 2.5} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.l}</text>
              </g>
            ))}
            {[
              { x: 90, h1: 35, h2: 40, h3: 15, h4: 10, label: "Civil" },
              { x: 165, h1: 32, h2: 38, h3: 20, h4: 10, label: "Mech" },
              { x: 240, h1: 28, h2: 42, h3: 18, h4: 12, label: "Elec" },
              { x: 315, h1: 40, h2: 35, h3: 15, h4: 10, label: "Fab" },
              { x: 390, h1: 20, h2: 45, h3: 25, h4: 10, label: "Safety" },
            ].map((b, i) => {
              const totalH = b.h1 + b.h2 + b.h3 + b.h4;
              return (
                <g key={i}>
                  <rect x={b.x - 16} y={110 - b.h1} width="32" height={b.h1} fill={c0} />
                  <rect x={b.x - 16} y={110 - b.h1 - b.h2} width="32" height={b.h2} fill={c1} />
                  <rect x={b.x - 16} y={110 - b.h1 - b.h2 - b.h3} width="32" height={b.h3} fill={c2} />
                  <rect x={b.x - 16} y={110 - totalH} width="32" height={b.h4} fill={c3} />
                  <line x1={b.x} y1="110" x2={b.x} y2="114" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={b.x} y={124} fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{b.label}</text>
                </g>
              );
            })}
          </svg>
        </div>
      );

    case "grouped-bar": {
      const d = resolveChartData(
        chartColors,
        ["Civil", "Elec", "Mech", "Safety", "Admin"],
        [60, 85, 90, 30, 70],
        100,
        "%"
      );
      const secVals = d.secondaryValues || [40, 60, 55, 20, 50];
      const n = d.categories.length;
      const yRange = (d.yMax - d.yMin) || 1;
      const bw = Math.min(18, Math.max(8, (360 / n) * 0.38));

      const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((r) => ({
        y: 110 - r * 96,
        label: formatYTick(d.yMin + r * yRange, d.unit),
      }));

      const yHeader = getYAxisHeader(d.yAxisTitle, d.unit);

      return (
        <div className="w-full h-auto min-h-[260px] max-h-[520px] flex flex-col justify-center gap-2">
          {d.showLegend && (
            <div className="flex items-center justify-center gap-5 pt-1 text-[11px] font-mono font-medium flex-wrap">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs shadow-2xs flex-shrink-0" style={{ backgroundColor: c0 }} />
                <span className="text-slate-600 dark:text-zinc-300 font-semibold">{chart.series?.[0]?.name || "Primary / Actual"}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-xs shadow-2xs flex-shrink-0" style={{ backgroundColor: c1 }} />
                <span className="text-slate-600 dark:text-zinc-300 font-semibold">{chart.series?.[1]?.name || "Target / Prior"}</span>
              </div>
            </div>
          )}

          <svg viewBox={d.xAxisTitle ? "0 0 440 148" : "0 0 440 138"} className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="48" y1="12" x2="48" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="110" x2="425" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y-axis Header / Unit */}
            {yHeader && (
              <text x="48" y="7" fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
                {yHeader}
              </text>
            )}
            {/* Y labels */}
            {yTicks.map((g, i) => (
              <g key={i}>
                {d.showGridLines && (
                  <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                )}
                <text x="43" y={g.y + 2.5} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.label}</text>
              </g>
            ))}
            {d.values.map((v1, i) => {
              const v2 = secVals[i] ?? 0;
              const x = 56 + ((i + 0.5) / n) * 360;
              const h1 = Math.max(2, Math.min(96, ((v1 - d.yMin) / yRange) * 96));
              const h2 = Math.max(2, Math.min(96, ((v2 - d.yMin) / yRange) * 96));

              return (
                <g key={i}>
                  <rect x={x - bw - 1} y={110 - h1} width={bw} height={h1} fill={c0} rx="2" />
                  <rect x={x + 1} y={110 - h2} width={bw} height={h2} fill={c1} rx="2" />
                  <line x1={x} y1="110" x2={x} y2="114" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={x} y={124} fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.55">{d.categories[i]}</text>
                  {d.showValues && (
                    <text x={x - bw / 2 - 1} y={110 - h1 - 3} fontSize="6" fontWeight="bold" textAnchor="middle" fill={c0}>{v1}</text>
                  )}
                </g>
              );
            })}
            {d.xAxisTitle && (
              <text x="238" y="141" fontSize="7" fontWeight="600" textAnchor="middle" fill="currentColor" fillOpacity="0.6" letterSpacing="0.03em">{d.xAxisTitle}</text>
            )}
          </svg>
        </div>
      );
    }

    case "multi-line":
      return (
        <div className="w-full h-auto min-h-[260px] max-h-[520px] flex flex-col justify-center">
          <svg viewBox="0 0 440 138" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="48" y1="12" x2="48" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="110" x2="425" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y grid + labels */}
            {[{ y: 110, l: "0%" }, { y: 86, l: "25%" }, { y: 62, l: "50%" }, { y: 38, l: "75%" }, { y: 14, l: "100%" }].map((g, i) => (
              <g key={i}>
                <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="43" y={g.y + 2.5} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.l}</text>
              </g>
            ))}
            {/* X ticks */}
            {[{ x: 100, l: "Q1" }, { x: 190, l: "Q2" }, { x: 280, l: "Q3" }, { x: 415, l: "Q4" }].map((t, i) => (
              <g key={i}>
                <line x1={t.x} y1="110" x2={t.x} y2="114" stroke="currentColor" strokeOpacity="0.3" />
                <text x={t.x} y="124" fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.55">{t.l}</text>
              </g>
            ))}
            {/* Line 1 */}
            <path d="M 55 97 Q 120 44, 185 67 T 305 30 T 415 16" fill="none" stroke={c0} strokeWidth="2.5" strokeLinecap="round" />
            {[{ cx: 55, cy: 97 }, { cx: 185, cy: 67 }, { cx: 305, cy: 30 }, { cx: 415, cy: 16 }].map((p, i) => <circle key={i} cx={p.cx} cy={p.cy} r="3" fill={c0} />)}
            {/* Line 2 */}
            <path d="M 55 107 Q 120 80, 185 54 T 305 64 T 415 40" fill="none" stroke={c1} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 2" />
            {[{ cx: 55, cy: 107 }, { cx: 185, cy: 54 }, { cx: 305, cy: 64 }, { cx: 415, cy: 40 }].map((p, i) => <circle key={i} cx={p.cx} cy={p.cy} r="3" fill={c1} />)}
            {/* Legend */}
            <rect x="300" y="10" width="8" height="3" fill={c0} rx="1" />
            <text x="311" y="14" fontSize="6.5" fill="currentColor" fillOpacity="0.6">Zone A</text>
            <rect x="300" y="20" width="8" height="3" fill={c1} rx="1" />
            <text x="311" y="24" fontSize="6.5" fill="currentColor" fillOpacity="0.6">Zone B</text>
          </svg>
        </div>
      );

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
        <div className="w-full h-auto min-h-[140px] flex flex-col justify-center gap-3 text-xs px-2 py-2">
          {d.values.map((v, i) => {
            const pct = Math.max(0, Math.min(100, ((v - d.yMin) / yRange) * 100));
            const col = d.pointColors?.[i] || [c0, c1, c2, c3, c4][i % 5];
            const label = d.categories[i] || `Metric ${i + 1}`;
            return (
              <div key={i}>
                <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-300 mb-1">
                  <span>{label}</span>
                  <span>{formatDataValue(v, d.unit)}</span>
                </div>
                <div className="w-full h-5 bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex">
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
        const cy = 110 - norm * 96;
        return { cx, cy, val: v, label: d.categories[i] };
      });
      const pathD = points.map((p, i) => `${i === 0 ? "M" : "L"} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(" ");
      const areaD = `${pathD} L ${points[points.length - 1].cx.toFixed(1)} 110 L ${points[0].cx.toFixed(1)} 110 Z`;

      const yTicks = [0, 0.25, 0.5, 0.75, 1.0].map((r) => ({
        y: 110 - r * 96,
        label: formatYTick(d.yMin + r * yRange, d.unit),
      }));

      const yHeader = getYAxisHeader(d.yAxisTitle, d.unit);

      return (
        <div className="w-full h-auto min-h-[260px] max-h-[520px] flex flex-col justify-center">
          <svg viewBox={d.xAxisTitle ? "0 0 440 148" : "0 0 440 138"} className="w-full flex-1 overflow-visible">
            <defs>
              <linearGradient id={`areagrad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c0} stopOpacity="0.5" />
                <stop offset="100%" stopColor={c0} stopOpacity="0.03" />
              </linearGradient>
            </defs>
            {/* Y-axis */}
            <line x1="48" y1="12" x2="48" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="110" x2="425" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y-axis Header / Unit */}
            {yHeader && (
              <text x="48" y="7" fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
                {yHeader}
              </text>
            )}
            {/* Y grid */}
            {yTicks.map((g, i) => (
              <g key={i}>
                {d.showGridLines && (
                  <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                )}
                <text x="43" y={g.y + 2.5} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.label}</text>
              </g>
            ))}
            {/* X ticks */}
            {points.map((p, i) => (
              <g key={i}>
                <line x1={p.cx} y1="110" x2={p.cx} y2="114" stroke="currentColor" strokeOpacity="0.3" />
                <text x={p.cx} y={124} fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.55">{p.label}</text>
              </g>
            ))}
            <path d={areaD} fill={`url(#areagrad-${chart.id})`} />
            <path d={pathD} fill="none" stroke={c0} strokeWidth="2.5" strokeLinecap="round" />
            {points.map((pt, i) => (
              <circle key={i} cx={pt.cx} cy={pt.cy} r="3" fill="#fff" stroke={c0} strokeWidth="2" />
            ))}
            {d.xAxisTitle && (
              <text x="238" y="141" fontSize="7" fontWeight="600" textAnchor="middle" fill="currentColor" fillOpacity="0.6" letterSpacing="0.03em">{d.xAxisTitle}</text>
            )}
          </svg>
        </div>
      );
    }

    case "radar":
      return (
        <div className="w-full h-44 flex items-center justify-center">
          <svg viewBox="0 0 100 100" className="h-full w-full">
            <polygon points="50,5 95,35 80,90 20,90 5,35" fill="none" stroke="currentColor" strokeOpacity="0.2" />
            <polygon points="50,20 80,45 70,80 30,80 20,45" fill="none" stroke="currentColor" strokeOpacity="0.2" />
            <polygon points="50,15 85,40 60,75 35,80 15,45" fill={c0} fillOpacity="0.4" stroke={c0} strokeWidth="1.5" />
          </svg>
        </div>
      );

    case "gauge": {
      const d = resolveChartData(chartColors, ["Score"], [72], 100, "%");
      const primaryVal = d.values[0] ?? 72;
      const yRange = (d.yMax - d.yMin) || 1;
      const norm = Math.max(0, Math.min(1, (primaryVal - d.yMin) / yRange));
      const angle = norm * 180;
      const rad = (180 - angle) * (Math.PI / 180);
      const endX = 50 + 40 * Math.cos(rad);
      const endY = 50 - 40 * Math.sin(rad);
      const pathGauge = `M 10 50 A 40 40 0 0 1 ${endX.toFixed(1)} ${endY.toFixed(1)}`;

      return (
        <div className="w-full h-44 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 100 50" className="w-48 h-24 overflow-visible">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="15" strokeLinecap="round" />
            <path d={pathGauge} fill="none" stroke={c0} strokeWidth="15" strokeLinecap="round" />
          </svg>
          <div className="absolute bottom-6 font-bold text-2xl text-slate-800 dark:text-white">
            {primaryVal}{d.unit}
          </div>
          {d.categories[0] && (
            <div className="text-[10px] font-mono text-slate-400 mt-1 uppercase">
              {d.categories[0]}
            </div>
          )}
        </div>
      );
    }

    case "scatter":
    case "bubble":
      return (
        <div className="w-full h-auto min-h-[260px] max-h-[520px] flex flex-col justify-center">
          <svg viewBox="0 0 440 138" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="48" y1="12" x2="48" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="110" x2="425" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y grid + labels */}
            {[{ y: 110, l: "0" }, { y: 86, l: "25" }, { y: 62, l: "50" }, { y: 38, l: "75" }, { y: 14, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="43" y={g.y + 2.5} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.l}</text>
              </g>
            ))}
            {/* X ticks */}
            {[{ x: 110, l: "20" }, { x: 190, l: "40" }, { x: 270, l: "60" }, { x: 350, l: "80" }, { x: 415, l: "100" }].map((t, i) => (
              <g key={i}>
                <line x1={t.x} y1="110" x2={t.x} y2="114" stroke="currentColor" strokeOpacity="0.3" />
                <text x={t.x} y={124} fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.55">{t.l}</text>
              </g>
            ))}
            {[
              { cx: 130, cy: 78, r: chart.chartType === "bubble" ? 15 : 4 },
              { cx: 195, cy: 50, r: chart.chartType === "bubble" ? 22 : 5 },
              { cx: 255, cy: 65, r: chart.chartType === "bubble" ? 28 : 6 },
              { cx: 315, cy: 42, r: chart.chartType === "bubble" ? 19 : 5 },
              { cx: 375, cy: 68, r: chart.chartType === "bubble" ? 14 : 4 },
            ].map((c, i) => (
              <circle
                key={i}
                cx={c.cx}
                cy={c.cy}
                r={c.r}
                fill={c0}
                fillOpacity="0.45"
                stroke={c0}
                strokeWidth="1.5"
              />
            ))}
          </svg>
        </div>
      );

    case "funnel":
      return (
        <div className="w-full h-44 flex flex-col items-center justify-center gap-1 text-xs text-white font-bold">
          <div className="h-8 rounded flex items-center justify-center shadow-xs" style={{ width: "90%", backgroundColor: c0 }}>1,200</div>
          <div className="h-8 rounded flex items-center justify-center shadow-xs" style={{ width: "70%", backgroundColor: `${c0}CC` }}>850</div>
          <div className="h-8 rounded flex items-center justify-center shadow-xs text-slate-900" style={{ width: "50%", backgroundColor: `${c0}88` }}>420</div>
          <div className="h-8 rounded flex items-center justify-center shadow-xs text-slate-900" style={{ width: "30%", backgroundColor: `${c0}55` }}>180</div>
        </div>
      );

    case "sparkline":
      return (
        <div className="w-full h-44 flex flex-col items-center justify-center gap-3">
          {[
            { label: "Zone A", d: "M 0 25 L 20 10 L 40 20 L 60 5 L 80 15 L 100 0", color: c0 },
            { label: "Zone B", d: "M 0 20 L 20 25 L 40 10 L 60 20 L 80 5 L 100 15", color: c1 },
            { label: "Zone C", d: "M 0 30 L 20 15 L 40 25 L 60 10 L 80 20 L 100 5", color: c2 },
          ].map((s, i) => (
            <div key={i} className="flex items-center gap-3 w-full px-4">
              <span className="text-[10px] font-bold text-slate-500 w-12 text-right">{s.label}</span>
              <svg viewBox="0 0 100 30" className="w-48 h-8 overflow-visible flex-shrink-0">
                <path d={s.d} fill="none" stroke={s.color} strokeWidth="2.5" strokeLinecap="round" />
              </svg>
              <span className="text-[10px] font-bold" style={{ color: s.color }}>↑</span>
            </div>
          ))}
        </div>
      );

    case "combo":
      return (
        <div className="w-full h-auto min-h-[260px] max-h-[520px] flex flex-col justify-center">
          <svg viewBox="0 0 440 138" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="48" y1="12" x2="48" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="110" x2="425" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y grid */}
            {[{ y: 110, l: "0" }, { y: 86, l: "25" }, { y: 62, l: "50" }, { y: 38, l: "75" }, { y: 14, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="43" y={g.y + 2.5} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.l}</text>
              </g>
            ))}
            {/* Bars */}
            {[{ x: 80, h: 55 }, { x: 155, h: 75 }, { x: 230, h: 42 }, { x: 305, h: 85 }, { x: 380, h: 30 }].map((b, i) => (
              <g key={i}>
                <rect x={b.x - 18} y={110 - b.h} width="36" height={b.h} fill={c0} opacity="0.8" rx="2" />
                <line x1={b.x} y1="110" x2={b.x} y2="114" stroke="currentColor" strokeOpacity="0.3" />
                <text x={b.x} y={124} fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.55">{["Jan", "Feb", "Mar", "Apr", "May"][i]}</text>
              </g>
            ))}
            {/* Trend line */}
            <path d="M 80 54 L 155 36 L 230 70 L 305 24 L 380 82" fill="none" stroke={c1} strokeWidth="2.5" strokeLinecap="round" />
            {[{ cx: 80, cy: 54 }, { cx: 155, cy: 36 }, { cx: 230, cy: 70 }, { cx: 305, cy: 24 }, { cx: 380, cy: 82 }].map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r="3" fill={c1} />
            ))}
            {/* Legend */}
            <rect x="52" y="10" width="7" height="7" fill={c0} rx="1" /><text x="62" y="16" fontSize="6.5" fill="currentColor" fillOpacity="0.6">Volume</text>
            <line x1="110" y1="14" x2="122" y2="14" stroke={c1} strokeWidth="2" /><text x="125" y="16" fontSize="6.5" fill="currentColor" fillOpacity="0.6">Trend</text>
          </svg>
        </div>
      );

    case "waterfall":
      return (
        <div className="w-full h-auto min-h-[260px] max-h-[520px] flex flex-col justify-center">
          <svg viewBox="0 0 440 138" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="48" y1="12" x2="48" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="110" x2="425" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y labels */}
            {[{ y: 110, l: "0" }, { y: 86, l: "25" }, { y: 62, l: "50" }, { y: 38, l: "75" }, { y: 14, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="43" y={g.y + 2.5} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.l}</text>
              </g>
            ))}
            {/* Connectors */}
            <line x1="116" y1="50" x2="130" y2="50" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
            <line x1="196" y1="30" x2="210" y2="50" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
            <line x1="276" y1="70" x2="290" y2="90" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
            <line x1="356" y1="90" x2="370" y2="90" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
            {/* Bars: start (c2), +20 (c0), -20 (c1), +10 (c0), total (c2) */}
            <rect x="54" y="50" width="62" height="60" fill={c2} rx="2" />
            <rect x="130" y="30" width="66" height="20" fill={c0} rx="2" />
            <rect x="210" y="50" width="66" height="20" fill={c1} rx="2" />
            <rect x="290" y="90" width="66" height="20" fill={c0} rx="2" />
            <rect x="370" y="30" width="42" height="80" fill={c2} rx="2" />
            {[{ x: 85, l: "Start" }, { x: 163, l: "+20" }, { x: 243, l: "-20" }, { x: 323, l: "+10" }, { x: 391, l: "Total" }].map((t, i) => (
              <g key={i}>
                <line x1={t.x} y1="110" x2={t.x} y2="114" stroke="currentColor" strokeOpacity="0.3" />
                <text x={t.x} y={124} fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{t.l}</text>
              </g>
            ))}
          </svg>
        </div>
      );

    case "treemap":
      return (
        <div className="w-full h-auto min-h-[176px] max-h-[352px] grid grid-cols-3 gap-1 p-2 text-white font-bold text-[10px]">
          <div className="col-span-2 row-span-2 rounded p-2 flex items-end shadow-2xs" style={{ backgroundColor: c0 }}>Item A</div>
          <div className="rounded p-2 flex items-end shadow-2xs" style={{ backgroundColor: c1 }}>Item B</div>
          <div className="rounded p-2 flex items-end shadow-2xs" style={{ backgroundColor: c2 }}>Item C</div>
          <div className="col-span-3 rounded p-2 flex items-end shadow-2xs" style={{ backgroundColor: c3 }}>Item D</div>
        </div>
      );

    case "kpi-card":
      return (
        <div className="w-full h-full max-h-[460px] grid grid-cols-2 gap-4 p-2 text-xs auto-rows-fr">
          {[
            { label: "Total Incidents", val: "1,248", trend: "-18%", color: c3, icon: "↓" },
            { label: "PPE Compliance", val: "97.4%", trend: "+2.1%", color: c0, icon: "↑" },
            { label: "Worker Hours", val: "18,750", trend: "+5.3%", color: c1, icon: "↑" },
            { label: "Near-Misses", val: "12", trend: "-33%", color: c2, icon: "↓" },
          ].map((k, i) => (
            <div
              key={i}
              className="flex flex-col justify-between bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md rounded-2xl p-5 sm:p-6 border border-slate-200/80 dark:border-zinc-800/80 shadow-xs hover:border-[#9D61FF]/40 transition-all"
            >
              <span className="text-[11px] sm:text-xs font-semibold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
                {k.label}
              </span>
              <div className="font-black text-3xl sm:text-4xl text-slate-900 dark:text-white leading-tight my-auto">
                {k.val}
              </div>
              <span className="font-bold text-xs sm:text-sm flex items-center gap-1" style={{ color: k.color }}>
                {k.icon} {k.trend}
              </span>
            </div>
          ))}
        </div>
      );

    case "timeline":
      return (
        <div className="w-full h-44 flex flex-col justify-center gap-2 p-2">
          <div className="flex items-center gap-2">
            <div className="w-16 text-right text-[10px] font-bold text-slate-500">Task 1</div>
            <div className="h-4 rounded shadow-2xs" style={{ width: "40%", marginLeft: "10%", backgroundColor: c0 }}></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 text-right text-[10px] font-bold text-slate-500">Task 2</div>
            <div className="h-4 rounded shadow-2xs" style={{ width: "30%", marginLeft: "45%", backgroundColor: c1 }}></div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-16 text-right text-[10px] font-bold text-slate-500">Task 3</div>
            <div className="h-4 rounded shadow-2xs" style={{ width: "50%", marginLeft: "20%", backgroundColor: c2 }}></div>
          </div>
        </div>
      );

    case "geo-map":
      return (
        <div className="w-full h-44 relative overflow-hidden rounded-xl bg-slate-100 dark:bg-zinc-900/80 border border-slate-200 dark:border-zinc-700">
          <svg viewBox="0 0 400 176" className="w-full h-full">
            {/* Grid lines for map feel */}
            {[40, 80, 120, 160].map((y) => <line key={y} x1="0" y1={y} x2="400" y2={y} stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />)}
            {[80, 160, 240, 320].map((x) => <line key={x} x1={x} y1="0" x2={x} y2="176" stroke="currentColor" strokeOpacity="0.08" strokeDasharray="4 4" />)}
            {/* Site location markers */}
            {[
              { cx: 120, cy: 80, label: "Site A", color: c0 },
              { cx: 250, cy: 60, label: "Site B", color: c1 },
              { cx: 180, cy: 130, label: "Site C", color: c2 },
              { cx: 320, cy: 110, label: "Site D", color: c3 },
            ].map((s, i) => (
              <g key={i}>
                <circle cx={s.cx} cy={s.cy} r="14" fill={s.color} fillOpacity="0.2" />
                <circle cx={s.cx} cy={s.cy} r="6" fill={s.color} />
                <text x={s.cx} y={s.cy + 22} fontSize="9" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.7">{s.label}</text>
              </g>
            ))}
          </svg>
          <div className="absolute bottom-2 right-2 text-[9px] font-mono text-slate-400 bg-white/70 dark:bg-zinc-900/70 px-2 py-0.5 rounded">Geo / Map Chart</div>
        </div>
      );

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
        y: 110 - r * 96,
        label: formatYTick(d.yMin + r * yRange, d.unit),
      }));

      const yHeader = getYAxisHeader(d.yAxisTitle, d.unit);

      return (
        <div className="w-full h-auto min-h-[260px] max-h-[520px] flex flex-col justify-center">
          <svg viewBox={d.xAxisTitle ? "0 0 440 148" : "0 0 440 138"} className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="48" y1="12" x2="48" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="48" y1="110" x2="425" y2="110" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y-axis Header / Unit */}
            {yHeader && (
              <text x="48" y="7" fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">
                {yHeader}
              </text>
            )}
            {/* Y grid + labels */}
            {yTicks.map((g, i) => (
              <g key={i}>
                {d.showGridLines && (
                  <line x1="45" y1={g.y} x2="425" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                )}
                <text x="43" y={g.y + 2.5} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.5">{g.label}</text>
              </g>
            ))}
            {/* Bars */}
            {d.values.map((v, i) => {
              const x = 56 + ((i + 0.5) / n) * 360;
              const norm = Math.max(0, Math.min(1, (v - d.yMin) / yRange));
              const barH = Math.max(3, norm * 96);
              const barColor = d.pointColors?.[i] || c0;

              return (
                <g key={i}>
                  <rect x={x - bw / 2} y={110 - barH} width={bw} height={barH} rx="4" fill={barColor} />
                  {d.showValues && (
                    <text x={x} y={110 - barH - 4} fontSize="6.5" fontWeight="bold" textAnchor="middle" fill={barColor}>
                      {formatDataValue(v, d.unit, n > 6)}
                    </text>
                  )}
                  <line x1={x} y1="110" x2={x} y2="114" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={x} y={124} fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.55">
                    {d.categories[i]}
                  </text>
                </g>
              );
            })}
            {d.xAxisTitle && (
              <text x="238" y="141" fontSize="7" fontWeight="600" textAnchor="middle" fill="currentColor" fillOpacity="0.6" letterSpacing="0.03em">{d.xAxisTitle}</text>
            )}
          </svg>
        </div>
      );
    }
    }
  };

  if (typeof height === "number") {
    return (
      <div
        style={{ height: `${height}px`, minHeight: `${height}px` }}
        className="w-full flex items-center justify-center overflow-hidden [&>div]:!min-h-0 [&>div]:!max-h-full [&>div]:!h-full [&>div]:!w-full"
      >
        {renderChart()}
      </div>
    );
  }

  return (
    <div className="w-full h-full min-h-0 max-h-full flex items-center justify-center overflow-hidden [&>div]:!min-h-[140px] [&>div]:!max-h-full [&>div]:!h-full [&>div]:!w-full">
      {renderChart()}
    </div>
  );
}
