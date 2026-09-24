"use client";

import React from "react";
import { LibraryChartCard } from "@/lib/redux/slices/reportModuleSlice";

interface ChartRendererProps {
  chart: LibraryChartCard;
  color?: string;
  colors?: string[];
}

/**
 * Renders live SVG visualizations for all 25 supported telemetry chart types.
 * Supports multi-series dynamic color palettes for all elements.
 */
export default function ChartRenderer({ chart, color = "#3B82F6", colors }: ChartRendererProps) {
  const chartColors = colors && colors.length > 0 ? colors : chart.colors || [];
  const c0 = chartColors[0] || chart.color || color;
  const c1 = chartColors[1] || "#10B981";
  const c2 = chartColors[2] || "#F59E0B";
  const c3 = chartColors[3] || "#F43F5E";
  const c4 = chartColors[4] || "#06B6D4";

  switch (chart.chartType) {
    case "line":
      return (
        <div className="w-full h-48 sm:h-56 flex flex-col">
          <svg viewBox="0 0 420 136" className="w-full flex-1 overflow-visible">
            <defs>
              <linearGradient id={`grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c0} stopOpacity="0.35" />
                <stop offset="100%" stopColor={c0} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            {/* Y-axis */}
            <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y grid + labels */}
            {[{ y: 108, l: "0" }, { y: 82, l: "25" }, { y: 55, l: "50" }, { y: 28, l: "75" }, { y: 8, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="32" y={g.y + 3} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
              </g>
            ))}
            {/* X ticks */}
            {[{ x: 90, l: "08:00" }, { x: 170, l: "12:00" }, { x: 250, l: "16:00" }, { x: 330, l: "20:00" }, { x: 405, l: "24:00" }].map((t, i) => (
              <g key={i}>
                <line x1={t.x} y1="108" x2={t.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                <text x={t.x} y="122" fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.45">{t.l}</text>
              </g>
            ))}
            {/* Area fill */}
            <path d="M 45 95 Q 110 42, 175 65 T 295 28 T 405 14 L 405 108 L 45 108 Z" fill={`url(#grad-${chart.id})`} />
            {/* Line */}
            <path d="M 45 95 Q 110 42, 175 65 T 295 28 T 405 14" fill="none" stroke={c0} strokeWidth="2.5" strokeLinecap="round" />
            {/* Points */}
            {[
              { cx: 45, cy: 95, val: "88" },
              { cx: 130, cy: 50, val: "94" },
              { cx: 220, cy: 46, val: "96" },
              { cx: 310, cy: 24, val: "99" },
              { cx: 405, cy: 14, val: "100" },
            ].map((pt, i) => (
              <g key={i}>
                <circle cx={pt.cx} cy={pt.cy} r="3" fill="#fff" stroke={c0} strokeWidth="2" />
                <text x={pt.cx} y={pt.cy - 6} fontSize="7.5" fontWeight="bold" textAnchor="middle" fill={c0}>{pt.val}</text>
              </g>
            ))}
          </svg>
        </div>
      );

    case "donut":
    case "pie":
      return (
        <div className="w-full h-44 flex items-center justify-around py-2">
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
              {/* Segment 1 */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke={c0}
                strokeWidth="15"
                strokeDasharray="131 238"
                strokeDashoffset="0"
              />
              {/* Segment 2 */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke={c1}
                strokeWidth="15"
                strokeDasharray="71 238"
                strokeDashoffset="-131"
              />
              {/* Segment 3 */}
              <circle
                cx="50"
                cy="50"
                r="38"
                fill="transparent"
                stroke={c2}
                strokeWidth="15"
                strokeDasharray="36 238"
                strokeDashoffset="-202"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-base font-extrabold font-mono text-slate-900 dark:text-white">98.7%</span>
              <span className="text-[9px] font-bold uppercase text-slate-400">Compliant</span>
            </div>
          </div>

          {/* Legend */}
          <div className="space-y-2 text-xs font-mono">
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c0 }} />
              <span className="text-slate-700 dark:text-zinc-300">Smart Helmets: 55%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c1 }} />
              <span className="text-slate-700 dark:text-zinc-300">Vest Hubs: 30%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: c2 }} />
              <span className="text-slate-700 dark:text-zinc-300">Grounding Boots: 15%</span>
            </div>
          </div>
        </div>
      );

    case "table":
      return (
        <div className="w-full h-44 overflow-y-auto rounded-xl border border-slate-200 dark:border-zinc-800 text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 font-mono text-[10px] uppercase">
                <th className="py-2 px-3 font-semibold">Supervisor / Area</th>
                <th className="py-2 px-3 font-semibold">Zone</th>
                <th className="py-2 px-3 font-semibold">Response</th>
                <th className="py-2 px-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/80">
              <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Sunil M. (Crew #1)</td>
                <td className="py-2 px-3 font-mono text-slate-500">Zone 1</td>
                <td className="py-2 px-3 font-mono font-bold" style={{ color: c0 }}>18s</td>
                <td className="py-2 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${c0}18`, color: c0 }}>
                    Optimal
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Pooja K. (Structural)</td>
                <td className="py-2 px-3 font-mono text-slate-500">Tower L12</td>
                <td className="py-2 px-3 font-mono font-bold" style={{ color: c1 }}>24s</td>
                <td className="py-2 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${c1}18`, color: c1 }}>
                    Compliant
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-slate-50 dark:hover:bg-zinc-900/40">
                <td className="py-2 px-3 font-medium text-slate-900 dark:text-white">Anand R. (Subcontractor)</td>
                <td className="py-2 px-3 font-mono text-slate-500">Batching</td>
                <td className="py-2 px-3 font-mono font-bold" style={{ color: c2 }}>42s</td>
                <td className="py-2 px-3">
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{ backgroundColor: `${c2}18`, color: c2 }}>
                    Review
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      );

    case "heatmap":
      return (
        <div className="w-full h-44 flex flex-col justify-end pt-2 text-xs">
          <div className="w-full grid grid-cols-8 gap-1 h-full">
            {/* Header column */}
            <div className="flex flex-col gap-1 justify-end pb-5 font-mono text-[9px] text-slate-400">
              <div className="h-7 flex items-center justify-end pr-2">Week 1</div>
              <div className="h-7 flex items-center justify-end pr-2">Week 2</div>
              <div className="h-7 flex items-center justify-end pr-2">Week 3</div>
              <div className="h-7 flex items-center justify-end pr-2">Week 4</div>
            </div>
            {/* Day columns */}
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day, i) => (
              <div key={day} className="flex flex-col gap-1 h-full">
                <div className="text-center font-semibold text-slate-600 dark:text-zinc-400 mb-1 h-4 text-[10px] uppercase">{day}</div>
                <div className="h-7 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-2xs" style={{ backgroundColor: i > 4 ? c1 : c0 }}>
                  {i > 4 ? "82" : "96"}
                </div>
                <div className="h-7 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-2xs" style={{ backgroundColor: i > 4 ? c2 : c0 }}>
                  {i > 4 ? "78" : "94"}
                </div>
                <div className="h-7 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-2xs" style={{ backgroundColor: i > 4 ? c1 : c0 }}>
                  {i > 4 ? "85" : "95"}
                </div>
                <div className="h-7 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-2xs" style={{ backgroundColor: i > 4 ? c2 : c0 }}>
                  {i > 4 ? "72" : "98"}
                </div>
              </div>
            ))}
          </div>
        </div>
      );

    case "horizontal-bar":
      return (
        <div className="w-full h-44 flex flex-col justify-center py-2 gap-2.5 text-xs">
          {[
            { label: "Civil", val: "93%", width: "93%", col: c0 },
            { label: "Mechanical", val: "88%", width: "88%", col: c1 },
            { label: "Electrical", val: "90%", width: "90%", col: c2 },
            { label: "Fabrication", val: "85%", width: "85%", col: c3 },
          ].map((row, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="w-20 text-right font-medium text-slate-700 dark:text-zinc-300 truncate">{row.label}</span>
              <div className="flex-1 h-6 bg-slate-100 dark:bg-zinc-800 rounded-r-md flex items-center">
                <div
                  className="h-full flex items-center justify-end pr-2 rounded-r-md transition-all"
                  style={{ width: row.width, backgroundColor: row.col }}
                >
                  <span className="text-[10px] font-bold text-white shadow-sm">{row.val}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      );

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
        <div className="w-full h-48 sm:h-56 flex flex-col">
          <svg viewBox="0 0 420 136" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y labels */}
            {[{ y: 108, l: "0" }, { y: 82, l: "25" }, { y: 55, l: "50" }, { y: 28, l: "75" }, { y: 8, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="32" y={g.y + 3} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
              </g>
            ))}
            {[
              { x: 80, h1: 35, h2: 40, h3: 15, h4: 10, label: "Civil" },
              { x: 160, h1: 32, h2: 38, h3: 20, h4: 10, label: "Mech" },
              { x: 240, h1: 28, h2: 42, h3: 18, h4: 12, label: "Elec" },
              { x: 320, h1: 40, h2: 35, h3: 15, h4: 10, label: "Fab" },
              { x: 400, h1: 20, h2: 45, h3: 25, h4: 10, label: "Safety" },
            ].map((b, i) => {
              const totalH = b.h1 + b.h2 + b.h3 + b.h4;
              return (
                <g key={i}>
                  <rect x={b.x - 16} y={108 - b.h1} width="32" height={b.h1} fill={c0} />
                  <rect x={b.x - 16} y={108 - b.h1 - b.h2} width="32" height={b.h2} fill={c1} />
                  <rect x={b.x - 16} y={108 - b.h1 - b.h2 - b.h3} width="32" height={b.h3} fill={c2} />
                  <rect x={b.x - 16} y={108 - totalH} width="32" height={b.h4} fill={c3} />
                  <line x1={b.x} y1="108" x2={b.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                  <text x={b.x} y={122} fontSize="6.5" fontWeight="bold" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{b.label}</text>
                </g>
              );
            })}
            {/* Legend */}
            {[{ c: c0, l: "Civil" }, { c: c1, l: "PPE" }, { c: c2, l: "Safety" }, { c: c3, l: "Risk" }].map((lg, i) => (
              <g key={i}>
                <rect x={42 + i * 60} y="10" width="7" height="7" fill={lg.c} rx="1" />
                <text x={52 + i * 60} y="16" fontSize="6.5" fill="currentColor" fillOpacity="0.6">{lg.l}</text>
              </g>
            ))}
          </svg>
        </div>
      );

    case "grouped-bar":
      return (
        <div className="w-full h-48 sm:h-56 flex flex-col">
          <svg viewBox="0 0 420 136" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y labels */}
            {[{ y: 108, l: "0" }, { y: 82, l: "25" }, { y: 55, l: "50" }, { y: 28, l: "75" }, { y: 8, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="32" y={g.y + 3} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
              </g>
            ))}
            {[
              { x: 80, v1: 60, v2: 40, label: "Civil" },
              { x: 160, v1: 85, v2: 60, label: "Elec" },
              { x: 240, v1: 90, v2: 55, label: "Mech" },
              { x: 320, v1: 30, v2: 20, label: "Safety" },
              { x: 400, v1: 70, v2: 50, label: "Admin" },
            ].map((b, i) => (
              <g key={i}>
                <rect x={b.x - 18} y={108 - b.v1} width="16" height={b.v1} fill={c0} rx="2" />
                <rect x={b.x + 2} y={108 - b.v2} width="16" height={b.v2} fill={c1} rx="2" />
                <line x1={b.x} y1="108" x2={b.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                <text x={b.x} y={122} fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{b.label}</text>
              </g>
            ))}
            {/* Legend */}
            <rect x="42" y="10" width="7" height="7" fill={c0} rx="1" /><text x="52" y="16" fontSize="6.5" fill="currentColor" fillOpacity="0.6">Actual</text>
            <rect x="90" y="10" width="7" height="7" fill={c1} rx="1" /><text x="100" y="16" fontSize="6.5" fill="currentColor" fillOpacity="0.6">Target</text>
          </svg>
        </div>
      );

    case "multi-line":
      return (
        <div className="w-full h-48 sm:h-56 flex flex-col">
          <svg viewBox="0 0 420 136" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y grid + labels */}
            {[{ y: 108, l: "0" }, { y: 82, l: "25" }, { y: 55, l: "50" }, { y: 28, l: "75" }, { y: 8, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="32" y={g.y + 3} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
              </g>
            ))}
            {/* X ticks */}
            {[{ x: 90, l: "Q1" }, { x: 180, l: "Q2" }, { x: 270, l: "Q3" }, { x: 405, l: "Q4" }].map((t, i) => (
              <g key={i}>
                <line x1={t.x} y1="108" x2={t.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                <text x={t.x} y="122" fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.45">{t.l}</text>
              </g>
            ))}
            {/* Line 1 */}
            <path d="M 45 95 Q 110 42, 175 65 T 295 28 T 405 14" fill="none" stroke={c0} strokeWidth="2.5" strokeLinecap="round" />
            {[{ cx: 45, cy: 95 }, { cx: 175, cy: 65 }, { cx: 295, cy: 28 }, { cx: 405, cy: 14 }].map((p, i) => <circle key={i} cx={p.cx} cy={p.cy} r="3" fill={c0} />)}
            {/* Line 2 */}
            <path d="M 45 105 Q 110 78, 175 52 T 295 62 T 405 38" fill="none" stroke={c1} strokeWidth="2.5" strokeLinecap="round" strokeDasharray="5 2" />
            {[{ cx: 45, cy: 105 }, { cx: 175, cy: 52 }, { cx: 295, cy: 62 }, { cx: 405, cy: 38 }].map((p, i) => <circle key={i} cx={p.cx} cy={p.cy} r="3" fill={c1} />)}
            {/* Legend */}
            <rect x="290" y="10" width="8" height="3" fill={c0} rx="1" />
            <text x="301" y="14" fontSize="6.5" fill="currentColor" fillOpacity="0.6">Zone A</text>
            <rect x="290" y="20" width="8" height="3" fill={c1} rx="1" />
            <text x="301" y="24" fontSize="6.5" fill="currentColor" fillOpacity="0.6">Zone B</text>
          </svg>
        </div>
      );

    case "two-segment":
      return (
        <div className="w-full h-44 flex flex-col justify-center gap-3 text-xs px-2">
          {[
            { label: "Compliant Workers", val: 85, color: c0 },
            { label: "PPE Score", val: 73, color: c1 },
            { label: "Incident-Free Days", val: 92, color: c2 },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between font-bold text-slate-700 dark:text-zinc-300 mb-1">
                <span>{item.label}</span><span>{item.val}%</span>
              </div>
              <div className="w-full h-5 bg-slate-100 dark:bg-zinc-800 rounded-lg overflow-hidden flex">
                <div className="h-full rounded-lg transition-all" style={{ width: `${item.val}%`, backgroundColor: item.color }} />
              </div>
            </div>
          ))}
        </div>
      );

    case "area":
      return (
        <div className="w-full h-48 sm:h-56 flex flex-col">
          <svg viewBox="0 0 420 136" className="w-full flex-1 overflow-visible">
            <defs>
              <linearGradient id={`areagrad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c0} stopOpacity="0.5" />
                <stop offset="100%" stopColor={c0} stopOpacity="0.03" />
              </linearGradient>
            </defs>
            {/* Y-axis */}
            <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y grid */}
            {[{ y: 108, l: "0" }, { y: 82, l: "25" }, { y: 55, l: "50" }, { y: 28, l: "75" }, { y: 8, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="32" y={g.y + 3} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
              </g>
            ))}
            {/* X ticks */}
            {[{ x: 90, l: "Jan" }, { x: 180, l: "Apr" }, { x: 270, l: "Jul" }, { x: 405, l: "Oct" }].map((t, i) => (
              <g key={i}>
                <line x1={t.x} y1="108" x2={t.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                <text x={t.x} y="122" fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.45">{t.l}</text>
              </g>
            ))}
            <path d="M 45 108 L 45 95 Q 110 42, 175 65 T 295 28 T 405 14 L 405 108 Z" fill={`url(#areagrad-${chart.id})`} />
            <path d="M 45 95 Q 110 42, 175 65 T 295 28 T 405 14" fill="none" stroke={c0} strokeWidth="2.5" strokeLinecap="round" />
            {[{ cx: 45, cy: 95 }, { cx: 130, cy: 50 }, { cx: 220, cy: 46 }, { cx: 310, cy: 24 }, { cx: 405, cy: 14 }].map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r="3" fill="#fff" stroke={c0} strokeWidth="2" />
            ))}
          </svg>
        </div>
      );

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

    case "gauge":
      return (
        <div className="w-full h-44 flex flex-col items-center justify-center relative">
          <svg viewBox="0 0 100 50" className="w-48 h-24 overflow-visible">
            <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="currentColor" strokeOpacity="0.1" strokeWidth="15" strokeLinecap="round" />
            <path d="M 10 50 A 40 40 0 0 1 70 15" fill="none" stroke={c0} strokeWidth="15" strokeLinecap="round" />
          </svg>
          <div className="absolute bottom-6 font-bold text-2xl text-slate-800 dark:text-white">72%</div>
        </div>
      );

    case "scatter":
    case "bubble":
      return (
        <div className="w-full h-48 sm:h-56 flex flex-col">
          <svg viewBox="0 0 420 136" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y grid + labels */}
            {[{ y: 108, l: "0" }, { y: 82, l: "25" }, { y: 55, l: "50" }, { y: 28, l: "75" }, { y: 8, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="32" y={g.y + 3} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
              </g>
            ))}
            {/* X ticks */}
            {[{ x: 100, l: "20" }, { x: 180, l: "40" }, { x: 260, l: "60" }, { x: 340, l: "80" }, { x: 405, l: "100" }].map((t, i) => (
              <g key={i}>
                <line x1={t.x} y1="108" x2={t.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                <text x={t.x} y="122" fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.45">{t.l}</text>
              </g>
            ))}
            {[
              { cx: 120, cy: 78, r: chart.chartType === "bubble" ? 15 : 4 },
              { cx: 185, cy: 50, r: chart.chartType === "bubble" ? 22 : 5 },
              { cx: 245, cy: 65, r: chart.chartType === "bubble" ? 28 : 6 },
              { cx: 305, cy: 42, r: chart.chartType === "bubble" ? 19 : 5 },
              { cx: 365, cy: 68, r: chart.chartType === "bubble" ? 14 : 4 },
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
        <div className="w-full h-48 sm:h-56 flex flex-col">
          <svg viewBox="0 0 420 136" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y grid */}
            {[{ y: 108, l: "0" }, { y: 82, l: "25" }, { y: 55, l: "50" }, { y: 28, l: "75" }, { y: 8, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="32" y={g.y + 3} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
              </g>
            ))}
            {/* Bars */}
            {[{ x: 70, h: 55 }, { x: 145, h: 75 }, { x: 220, h: 42 }, { x: 295, h: 85 }, { x: 370, h: 30 }].map((b, i) => (
              <g key={i}>
                <rect x={b.x - 18} y={108 - b.h} width="36" height={b.h} fill={c0} opacity="0.8" rx="2" />
                <line x1={b.x} y1="108" x2={b.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                <text x={b.x} y={122} fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.5">{["Jan", "Feb", "Mar", "Apr", "May"][i]}</text>
              </g>
            ))}
            {/* Trend line */}
            <path d="M 70 52 L 145 34 L 220 68 L 295 22 L 370 80" fill="none" stroke={c1} strokeWidth="2.5" strokeLinecap="round" />
            {[{ cx: 70, cy: 52 }, { cx: 145, cy: 34 }, { cx: 220, cy: 68 }, { cx: 295, cy: 22 }, { cx: 370, cy: 80 }].map((p, i) => (
              <circle key={i} cx={p.cx} cy={p.cy} r="3" fill={c1} />
            ))}
            {/* Legend */}
            <rect x="42" y="10" width="7" height="7" fill={c0} rx="1" /><text x="52" y="16" fontSize="6.5" fill="currentColor" fillOpacity="0.6">Volume</text>
            <line x1="100" y1="14" x2="112" y2="14" stroke={c1} strokeWidth="2" /><text x="115" y="16" fontSize="6.5" fill="currentColor" fillOpacity="0.6">Trend</text>
          </svg>
        </div>
      );

    case "waterfall":
      return (
        <div className="w-full h-48 sm:h-56 flex flex-col">
          <svg viewBox="0 0 420 136" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y labels */}
            {[{ y: 108, l: "0" }, { y: 82, l: "25" }, { y: 55, l: "50" }, { y: 28, l: "75" }, { y: 8, l: "100" }].map((g, i) => (
              <g key={i}>
                <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="32" y={g.y + 3} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
              </g>
            ))}
            {/* Connectors */}
            <line x1="106" y1="48" x2="120" y2="48" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
            <line x1="186" y1="28" x2="200" y2="48" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
            <line x1="266" y1="68" x2="280" y2="88" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
            <line x1="346" y1="88" x2="360" y2="88" stroke="currentColor" strokeOpacity="0.3" strokeDasharray="2 2" />
            {/* Bars: start (c2), +20 (c0), -20 (c1), +10 (c0), total (c2) */}
            <rect x="44" y="48" width="62" height="60" fill={c2} rx="2" />
            <rect x="120" y="28" width="66" height="20" fill={c0} rx="2" />
            <rect x="200" y="48" width="66" height="20" fill={c1} rx="2" />
            <rect x="280" y="88" width="66" height="20" fill={c0} rx="2" />
            <rect x="360" y="28" width="42" height="80" fill={c2} rx="2" />
            {[{ x: 75, l: "Start" }, { x: 153, l: "+20" }, { x: 233, l: "-20" }, { x: 313, l: "+10" }, { x: 381, l: "Total" }].map((t, i) => (
              <g key={i}>
                <line x1={t.x} y1="108" x2={t.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                <text x={t.x} y="122" fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.6">{t.l}</text>
              </g>
            ))}
          </svg>
        </div>
      );

    case "treemap":
      return (
        <div className="w-full h-44 grid grid-cols-3 gap-1 p-2 text-white font-bold text-[10px]">
          <div className="col-span-2 row-span-2 rounded p-2 flex items-end shadow-2xs" style={{ backgroundColor: c0 }}>Item A</div>
          <div className="rounded p-2 flex items-end shadow-2xs" style={{ backgroundColor: c1 }}>Item B</div>
          <div className="rounded p-2 flex items-end shadow-2xs" style={{ backgroundColor: c2 }}>Item C</div>
          <div className="col-span-3 rounded p-2 flex items-end shadow-2xs" style={{ backgroundColor: c3 }}>Item D</div>
        </div>
      );

    case "kpi-card":
      return (
        <div className="w-full h-44 grid grid-cols-2 gap-3 p-2 text-xs">
          {[
            { label: "Total Incidents", val: "1,248", trend: "-18%", color: c3, icon: "↓" },
            { label: "PPE Compliance", val: "97.4%", trend: "+2.1%", color: c0, icon: "↑" },
            { label: "Worker Hours", val: "18,750", trend: "+5.3%", color: c1, icon: "↑" },
            { label: "Near-Misses", val: "12", trend: "-33%", color: c2, icon: "↓" },
          ].map((k, i) => (
            <div key={i} className="flex flex-col justify-between bg-slate-50 dark:bg-zinc-900 rounded-xl p-3 border border-slate-200 dark:border-zinc-800">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">{k.label}</span>
              <div className="font-black text-xl text-slate-900 dark:text-white leading-tight">{k.val}</div>
              <span className="font-bold text-xs" style={{ color: k.color }}>{k.icon} {k.trend}</span>
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
    default:
      return (
        <div className="w-full h-48 sm:h-56 flex flex-col">
          <svg viewBox="0 0 420 136" className="w-full flex-1 overflow-visible">
            {/* Y-axis */}
            <line x1="38" y1="8" x2="38" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* X-axis */}
            <line x1="38" y1="108" x2="410" y2="108" stroke="currentColor" strokeOpacity="0.25" strokeWidth="1" />
            {/* Y grid + labels */}
            {[{ y: 108, l: "0%" }, { y: 82, l: "25%" }, { y: 55, l: "50%" }, { y: 28, l: "75%" }, { y: 8, l: "100%" }].map((g, i) => (
              <g key={i}>
                <line x1="35" y1={g.y} x2="410" y2={g.y} stroke="currentColor" strokeOpacity="0.07" strokeDasharray="3 3" />
                <text x="32" y={g.y + 3} fontSize="6.5" textAnchor="end" fill="currentColor" fillOpacity="0.45">{g.l}</text>
              </g>
            ))}
            {/* Bars */}
            {[
              { x: 80, height: 82, val: "94.2%", label: "L&T Civil" },
              { x: 160, height: 92, val: "98.7%", label: "Steel Mech" },
              { x: 240, height: 70, val: "88.4%", label: "Tower Crane" },
              { x: 320, height: 88, val: "96.5%", label: "Batching" },
              { x: 400, height: 60, val: "84.0%", label: "Subterra." },
            ].map((b, i) => (
              <g key={i}>
                <rect x={b.x - 17} y={108 - b.height} width="34" height={b.height} rx="4" fill={c0} />
                <text x={b.x} y={108 - b.height - 4} fontSize="7" fontWeight="bold" textAnchor="middle" fill={c0}>{b.val}</text>
                <line x1={b.x} y1="108" x2={b.x} y2="112" stroke="currentColor" strokeOpacity="0.3" />
                <text x={b.x} y={122} fontSize="6.5" textAnchor="middle" fill="currentColor" fillOpacity="0.55">{b.label}</text>
              </g>
            ))}
          </svg>
        </div>
      );
  }
}
