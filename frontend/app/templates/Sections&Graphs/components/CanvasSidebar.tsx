"use client";

import React, { useState } from "react";
import {
  Stamp,
  Check,
  ExternalLink,
  Activity,
  BarChart2,
  Lightbulb,
  AlignLeft,
  LayoutGrid,
  Minus,
  Search,
  Plus,
  Sparkles,
  ArrowUp,
  Layers,
  CheckCircle2,
  Bookmark,
  TrendingUp,
  PieChart,
  Grid,
  Table as TableIcon,
  Clock,
  Filter,
  Zap,
  Eye,
  X,
  Sliders,
} from "lucide-react";
import {
  CanvasBlockType,
  GraphType,
  LibraryChartCard,
} from "@/lib/redux/slices/reportModuleSlice";
import {
  CHART_TYPE_OPTIONS,
  ChartTypeOption,
} from "./constants/chartTypes";
import ChartRenderer from "./ChartRenderer";
import { UploadedSvgWatermark } from "./watermarkStorage";

export interface SidebarAddBlockEvent {
  blockType: CanvasBlockType;
  chartType?: GraphType;
  customChart?: LibraryChartCard;
  targetRowId?: string;
}

export interface CanvasSidebarProps {
  onAddBlock: (e: SidebarAddBlockEvent) => void;
  sectionCharts?: LibraryChartCard[];
  allLibraryCharts?: LibraryChartCard[];
  uploadedWatermarks?: UploadedSvgWatermark[];
  activeWatermarkId?: string | null;
  onSelectWatermark?: (watermarkId: string | null) => void;
  isCollapsed?: boolean;
}

// ── Mini SVG / CSS Graphic Previews for Chart Types ─────────────────────────
function MiniChartPreview({ type }: { type: GraphType }) {
  switch (type) {
    case "bar":
      return (
        <div className="h-7 w-full flex items-end justify-center gap-1.5 px-2 py-1 bg-purple-500/5 rounded-lg">
          <div className="w-2 h-3 bg-purple-400/60 rounded-t" />
          <div className="w-2 h-5 bg-[#9D61FF] rounded-t" />
          <div className="w-2 h-2.5 bg-purple-400/60 rounded-t" />
          <div className="w-2 h-4.5 bg-[#9D61FF] rounded-t" />
          <div className="w-2 h-3.5 bg-purple-400/60 rounded-t" />
        </div>
      );
    case "grouped-bar":
      return (
        <div className="h-7 w-full flex items-end justify-center gap-1.5 px-2 py-1 bg-purple-500/5 rounded-lg">
          <div className="flex items-end gap-0.5">
            <div className="w-1.5 h-4 bg-[#9D61FF] rounded-t" />
            <div className="w-1.5 h-2.5 bg-emerald-500 rounded-t" />
          </div>
          <div className="flex items-end gap-0.5">
            <div className="w-1.5 h-5 bg-[#9D61FF] rounded-t" />
            <div className="w-1.5 h-3.5 bg-emerald-500 rounded-t" />
          </div>
          <div className="flex items-end gap-0.5">
            <div className="w-1.5 h-3.5 bg-[#9D61FF] rounded-t" />
            <div className="w-1.5 h-4.5 bg-emerald-500 rounded-t" />
          </div>
        </div>
      );
    case "horizontal-bar":
      return (
        <div className="h-7 w-full flex flex-col justify-center gap-1 px-3 py-1 bg-purple-500/5 rounded-lg">
          <div className="h-1.5 w-4/5 bg-[#9D61FF] rounded-r" />
          <div className="h-1.5 w-3/5 bg-purple-400/60 rounded-r" />
          <div className="h-1.5 w-5/6 bg-[#9D61FF] rounded-r" />
        </div>
      );
    case "stacked-horizontal":
      return (
        <div className="h-7 w-full flex flex-col justify-center gap-1.5 px-3 py-1 bg-purple-500/5 rounded-lg">
          <div className="h-2 w-full flex rounded overflow-hidden">
            <div className="w-3/5 bg-[#9D61FF]" />
            <div className="w-2/5 bg-emerald-400" />
          </div>
          <div className="h-2 w-full flex rounded overflow-hidden">
            <div className="w-2/5 bg-[#9D61FF]" />
            <div className="w-3/5 bg-emerald-400" />
          </div>
        </div>
      );
    case "stacked-bar":
      return (
        <div className="h-7 w-full flex items-end justify-center gap-1.5 px-2 py-1 bg-purple-500/5 rounded-lg">
          <div className="w-2.5 h-5 flex flex-col justify-end rounded-t overflow-hidden">
            <div className="h-2.5 bg-emerald-400" />
            <div className="h-2.5 bg-[#9D61FF]" />
          </div>
          <div className="w-2.5 h-6 flex flex-col justify-end rounded-t overflow-hidden">
            <div className="h-3 bg-emerald-400" />
            <div className="h-3 bg-[#9D61FF]" />
          </div>
          <div className="w-2.5 h-4 flex flex-col justify-end rounded-t overflow-hidden">
            <div className="h-2 bg-emerald-400" />
            <div className="h-2 bg-[#9D61FF]" />
          </div>
        </div>
      );
    case "line":
    case "sparkline":
      return (
        <div className="h-7 w-full flex items-center justify-center px-2 py-1 bg-purple-500/5 rounded-lg">
          <svg className="w-full h-5 text-[#9D61FF]" viewBox="0 0 100 30" fill="none">
            <path d="M5 22 Q 25 5, 50 18 T 95 8" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="95" cy="8" r="3" fill="currentColor" />
          </svg>
        </div>
      );
    case "multi-line":
      return (
        <div className="h-7 w-full flex items-center justify-center px-2 py-1 bg-purple-500/5 rounded-lg">
          <svg className="w-full h-5" viewBox="0 0 100 30" fill="none">
            <path d="M5 22 Q 25 5, 50 18 T 95 8" stroke="#9D61FF" strokeWidth="2" strokeLinecap="round" />
            <path d="M5 12 Q 30 25, 60 10 T 95 20" stroke="#10B981" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "area":
      return (
        <div className="h-7 w-full flex items-center justify-center px-2 py-1 bg-purple-500/5 rounded-lg">
          <svg className="w-full h-5" viewBox="0 0 100 30" fill="none">
            <path d="M5 25 L 5 15 Q 30 5, 55 18 T 95 8 L 95 25 Z" fill="rgba(157, 97, 255, 0.25)" />
            <path d="M5 15 Q 30 5, 55 18 T 95 8" stroke="#9D61FF" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "donut":
      return (
        <div className="h-7 w-full flex items-center justify-center bg-purple-500/5 rounded-lg">
          <svg className="w-6 h-6" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="14" fill="none" stroke="#E2E8F0" strokeWidth="5" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#9D61FF" strokeWidth="5" strokeDasharray="65 100" strokeDashoffset="25" />
            <circle cx="18" cy="18" r="14" fill="none" stroke="#10B981" strokeWidth="5" strokeDasharray="25 100" strokeDashoffset="90" />
          </svg>
        </div>
      );
    case "pie":
      return (
        <div className="h-7 w-full flex items-center justify-center bg-purple-500/5 rounded-lg">
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[#9D61FF] via-emerald-400 to-sky-400 shadow-sm" />
        </div>
      );
    case "heatmap":
      return (
        <div className="h-7 w-full flex items-center justify-center bg-purple-500/5 rounded-lg px-2">
          <div className="grid grid-cols-6 gap-1 w-full max-w-[130px]">
            <div className="h-2 bg-purple-200 dark:bg-purple-950/60 rounded-xs" />
            <div className="h-2 bg-purple-400 rounded-xs" />
            <div className="h-2 bg-purple-600 rounded-xs" />
            <div className="h-2 bg-purple-300 rounded-xs" />
            <div className="h-2 bg-purple-700 rounded-xs" />
            <div className="h-2 bg-purple-500 rounded-xs" />
            <div className="h-2 bg-purple-500 rounded-xs" />
            <div className="h-2 bg-purple-700 rounded-xs" />
            <div className="h-2 bg-purple-300 rounded-xs" />
            <div className="h-2 bg-purple-600 rounded-xs" />
            <div className="h-2 bg-purple-200 dark:bg-purple-950/60 rounded-xs" />
            <div className="h-2 bg-purple-400 rounded-xs" />
          </div>
        </div>
      );
    case "table":
      return (
        <div className="h-7 w-full flex flex-col justify-center gap-0.5 px-3 py-1 bg-purple-500/5 rounded-lg">
          <div className="h-1.5 w-full bg-purple-400/80 rounded" />
          <div className="h-1 w-full bg-slate-300/80 dark:bg-zinc-700 rounded" />
          <div className="h-1 w-full bg-slate-300/80 dark:bg-zinc-700 rounded" />
        </div>
      );
    case "radar":
      return (
        <div className="h-7 w-full flex items-center justify-center bg-purple-500/5 rounded-lg">
          <svg className="w-6 h-6" viewBox="0 0 40 40" fill="none">
            <polygon points="20,4 36,16 30,34 10,34 4,16" stroke="#CBD5E1" strokeWidth="1" />
            <polygon points="20,9 31,18 27,30 13,30 9,18" fill="rgba(157, 97, 255, 0.3)" stroke="#9D61FF" strokeWidth="1.5" />
          </svg>
        </div>
      );
    case "gauge":
      return (
        <div className="h-7 w-full flex items-center justify-center bg-purple-500/5 rounded-lg">
          <svg className="w-7 h-5" viewBox="0 0 40 25" fill="none">
            <path d="M 6 22 A 14 14 0 0 1 34 22" stroke="#E2E8F0" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <path d="M 6 22 A 14 14 0 0 1 28 10" stroke="#9D61FF" strokeWidth="3.5" fill="none" strokeLinecap="round" />
            <line x1="20" y1="22" x2="25" y2="12" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </div>
      );
    case "two-segment":
      return (
        <div className="h-7 w-full flex items-center px-3 py-1 bg-purple-500/5 rounded-lg">
          <div className="h-2.5 w-full flex rounded-full overflow-hidden bg-slate-200 dark:bg-zinc-700">
            <div className="h-full w-3/4 bg-[#9D61FF]" />
            <div className="h-full w-1/4 bg-emerald-400" />
          </div>
        </div>
      );
    case "funnel":
      return (
        <div className="h-7 w-full flex flex-col items-center justify-center gap-0.5 px-4 bg-purple-500/5 rounded-lg">
          <div className="h-1.5 w-full bg-[#9D61FF] rounded" />
          <div className="h-1.5 w-3/4 bg-purple-400 rounded" />
          <div className="h-1.5 w-1/2 bg-purple-300 rounded" />
        </div>
      );
    default:
      return (
        <div className="h-7 w-full flex items-end justify-center gap-1 px-2 py-1 bg-purple-500/5 rounded-lg">
          <div className="w-2 h-3.5 bg-purple-400/60 rounded-t" />
          <div className="w-2 h-5 bg-[#9D61FF] rounded-t" />
          <div className="w-2 h-4 bg-purple-400/60 rounded-t" />
        </div>
      );
  }
}

// ── Standard Non-Chart Blocks ────────────────────────────────────────────────
interface BaseBlockDef {
  type: CanvasBlockType;
  label: string;
  category: "metrics" | "text";
  description: string;
  badge: string;
  icon: React.ElementType;
  preview: React.ReactNode;
}

const BASE_BLOCK_DEFS: BaseBlockDef[] = [
  {
    type: "metric-card",
    label: "KPI Metric Card",
    category: "metrics",
    description: "Industrial indicator with live trend",
    badge: "1-4 Col",
    icon: Activity,
    preview: (
      <div className="w-full bg-blue-500/10 border border-blue-400/30 rounded-xl p-2.5 flex flex-col gap-1">
        <div className="text-[9px] font-bold text-slate-500">Compliance Rate</div>
        <div className="text-sm font-black font-mono text-blue-600 dark:text-blue-400">98.4%</div>
        <div className="flex items-center gap-1 text-[8px] font-mono text-emerald-600 font-bold">
          <ArrowUp className="w-2 h-2" /> +2.4% vs last shift
        </div>
      </div>
    ),
  },
  {
    type: "badge-strip",
    label: "4-Badge Metric Strip",
    category: "metrics",
    description: "Multi-indicator executive summary row",
    badge: "Full Width",
    icon: LayoutGrid,
    preview: (
      <div className="w-full bg-emerald-500/10 border border-emerald-400/30 rounded-xl p-2 grid grid-cols-4 gap-1 text-center">
        <div className="bg-white/60 dark:bg-black/40 rounded p-1">
          <div className="text-[7px] text-slate-400">Attn</div>
          <div className="text-[9px] font-bold text-emerald-600">98%</div>
        </div>
        <div className="bg-white/60 dark:bg-black/40 rounded p-1">
          <div className="text-[7px] text-slate-400">PPE</div>
          <div className="text-[9px] font-bold text-blue-600">96%</div>
        </div>
        <div className="bg-white/60 dark:bg-black/40 rounded p-1">
          <div className="text-[7px] text-slate-400">Time</div>
          <div className="text-[9px] font-bold text-purple-600">&lt;4m</div>
        </div>
        <div className="bg-white/60 dark:bg-black/40 rounded p-1">
          <div className="text-[7px] text-slate-400">Safe</div>
          <div className="text-[9px] font-bold text-amber-600">14k</div>
        </div>
      </div>
    ),
  },
  {
    type: "insight",
    label: "Key Insight Bullet",
    category: "text",
    description: "Numbered observation callout block",
    badge: "Full Width",
    icon: Lightbulb,
    preview: (
      <div className="w-full bg-amber-500/10 border border-amber-400/30 rounded-xl p-2.5 flex items-center gap-2">
        <div className="w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center text-[8px] font-bold flex-shrink-0">
          <Sparkles className="w-2.5 h-2.5" />
        </div>
        <div className="text-[9px] text-slate-600 dark:text-zinc-300 line-clamp-2 leading-tight">
          Supervisory compliance increased 14.2% across North Yard shifts.
        </div>
      </div>
    ),
  },
  {
    type: "text",
    label: "Text Paragraph",
    category: "text",
    description: "Rich editable commentary block",
    badge: "Full Width",
    icon: AlignLeft,
    preview: (
      <div className="w-full bg-slate-500/10 border border-slate-400/30 rounded-xl p-2.5 space-y-1">
        <div className="w-3/4 h-1.5 bg-slate-300 dark:bg-zinc-600 rounded" />
        <div className="w-full h-1.5 bg-slate-300/60 dark:bg-zinc-700/60 rounded" />
        <div className="w-2/3 h-1.5 bg-slate-300/40 dark:bg-zinc-700/40 rounded" />
      </div>
    ),
  },
  {
    type: "divider",
    label: "Horizontal Divider",
    category: "text",
    description: "Sleek section rule divider",
    badge: "Divider",
    icon: Minus,
    preview: (
      <div className="w-full py-2 flex items-center gap-1.5">
        <div className="flex-1 h-px bg-slate-300 dark:bg-zinc-700" />
        <Minus className="w-3 h-3 text-slate-400" />
        <div className="flex-1 h-px bg-slate-300 dark:bg-zinc-700" />
      </div>
    ),
  },
];

export function CanvasSidebar({
  onAddBlock,
  sectionCharts = [],
  allLibraryCharts = [],
  uploadedWatermarks = [],
  activeWatermarkId,
  onSelectWatermark,
  isCollapsed,
}: CanvasSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | "charts" | "metrics" | "text" | "watermarks">("charts");

  // State for Chart Quick Preview Dialog
  const [previewingChart, setPreviewingChart] = useState<LibraryChartCard | null>(null);

  if (isCollapsed) return null;

  // Filter 25 chart types
  const filteredChartTypes = CHART_TYPE_OPTIONS.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter added charts in this section
  const filteredSectionCharts = sectionCharts.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.chartType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter other library charts
  const otherLibraryCharts = allLibraryCharts.filter(
    (c) => !sectionCharts.some((sc) => sc.id === c.id) &&
      (c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
       c.chartType.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  
  // Filter watermark stamps
  const filteredWatermarks = (uploadedWatermarks || []).filter((wm) =>
    wm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    wm.fileName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter non-chart blocks
  const filteredBaseBlocks = BASE_BLOCK_DEFS.filter((def) => {
    const matchesSearch =
      def.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      def.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat =
      selectedCategory === "all" || def.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  // Helper to trigger preview of any chart type
  const handleOpenChartTypePreview = (opt: ChartTypeOption) => {
    const syntheticChart: LibraryChartCard = {
      id: `preview-${opt.id}`,
      title: `Sample ${opt.label} Telemetry`,
      chartType: opt.id,
      dataSourceField: "ppe_sensor_compliance",
      description: `Live interactive visualization of ${opt.label} formatted for Sitesafe executive reporting.`,
      color: "#9D61FF",
      colors: ["#9D61FF", "#10B981", "#3B82F6", "#F59E0B"],
      gridRows: 4,
      gridCols: 7,
    };
    setPreviewingChart(syntheticChart);
  };

  return (
    <>
      <aside className="flex-shrink-0 w-72 flex flex-col border-r border-slate-200/90 dark:border-zinc-800 bg-white/95 dark:bg-[#090d14]/95 backdrop-blur-md overflow-hidden select-none z-10 transition-all duration-200">
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b border-slate-100 dark:border-zinc-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-md bg-[#9D61FF]/15 text-[#9D61FF] flex items-center justify-center">
                <Layers className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Block Studio
              </span>
            </div>
            <span className="text-[10px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-bold">
              25 Charts
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search charts & visual widgets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-800 dark:text-zinc-200 placeholder-slate-400 outline-none focus:border-[#9D61FF] transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5">
            {(["all", "charts", "metrics", "text", "watermarks"] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`h-6.5 px-3 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-[#9D61FF] text-white shadow-sm"
                    : "bg-slate-100 dark:bg-zinc-800/60 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                }`}
              >
                {cat === "charts" ? "Charts (25)" : cat === "watermarks" ? "Stamps" : cat}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">
          {/* ── SECTION CHARTS (Already Added to Current Section) ── */}
          {(selectedCategory === "charts" || selectedCategory === "all") && filteredSectionCharts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono uppercase font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Added in Section ({filteredSectionCharts.length})
                </span>
                <span className="text-[9px] text-slate-400">Preview & Copy</span>
              </div>

              <div className="space-y-2">
                {filteredSectionCharts.map((chart) => (
                  <div
                    key={chart.id}
                    className="group relative rounded-xl border border-sky-400/30 bg-sky-500/5 hover:bg-sky-500/10 hover:border-sky-400/60 p-2.5 transition-all duration-200 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-[#9D61FF] transition-colors">
                        {chart.title}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-sky-500/15 text-sky-600 dark:text-sky-400 font-bold flex-shrink-0">
                        {chart.chartType}
                      </span>
                    </div>

                    {/* Visual Chart Preview Section */}
                    <div
                      onClick={() => setPreviewingChart(chart)}
                      className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 hover:scale-[1.01] transition-transform"
                      title="Click to expand full live preview"
                    >
                      <MiniChartPreview type={chart.chartType} />
                    </div>

                    {/* Actions: Preview & Add */}
                    <div className="flex items-center justify-between pt-1 border-t border-sky-400/15 text-[10px] text-slate-400">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewingChart(chart);
                        }}
                        className="flex items-center gap-1 hover:text-sky-600 dark:hover:text-sky-300 font-medium cursor-pointer"
                        title="Open full interactive preview"
                      >
                        <Eye className="w-3 h-3 text-sky-500" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddBlock({ blockType: "chart", customChart: chart })}
                        className="flex items-center gap-1 text-[#9D61FF] hover:text-[#8B3DFF] font-bold cursor-pointer bg-[#9D61FF]/10 px-2 py-0.5 rounded-md"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FROM LIBRARY SECTIONS (With Visual Chart Preview on each) ── */}
          {selectedCategory === "charts" && otherLibraryCharts.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
                  <Bookmark className="w-3.5 h-3.5" />
                  From Library Sections ({otherLibraryCharts.length})
                </span>
                <span className="text-[9px] text-slate-400">Preview & Insert</span>
              </div>

              <div className="space-y-2">
                {otherLibraryCharts.map((chart) => (
                  <div
                    key={chart.id}
                    className="group relative rounded-xl border border-amber-400/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-400/60 p-2.5 transition-all duration-200 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-bold text-slate-800 dark:text-zinc-200 truncate group-hover:text-[#9D61FF] transition-colors">
                        {chart.title}
                      </span>
                      <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-bold flex-shrink-0">
                        {chart.chartType}
                      </span>
                    </div>

                    {/* Visual Chart Preview Section */}
                    <div
                      onClick={() => setPreviewingChart(chart)}
                      className="rounded-lg overflow-hidden cursor-pointer hover:opacity-90 hover:scale-[1.01] transition-transform"
                      title="Click to expand full live preview"
                    >
                      <MiniChartPreview type={chart.chartType} />
                    </div>

                    {/* Actions: Preview & Add */}
                    <div className="flex items-center justify-between pt-1 border-t border-amber-400/15 text-[10px] text-slate-400">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewingChart(chart);
                        }}
                        className="flex items-center gap-1 hover:text-amber-600 dark:hover:text-amber-300 font-medium cursor-pointer"
                        title="Open full interactive preview"
                      >
                        <Eye className="w-3 h-3 text-amber-500" />
                        <span>Preview</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddBlock({ blockType: "chart", customChart: chart })}
                        className="flex items-center gap-1 text-[#9D61FF] hover:text-[#8B3DFF] font-bold cursor-pointer bg-[#9D61FF]/10 px-2 py-0.5 rounded-md"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ALL 25 CHART VISUALIZATION TYPES ── */}
          {(selectedCategory === "charts" || selectedCategory === "all") && (
            <div className="space-y-2">
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[#9D61FF] flex items-center gap-1.5">
                  <BarChart2 className="w-3.5 h-3.5" />
                  {selectedCategory === "charts" ? "All 25 Chart Types" : "Popular Chart Types"}
                </span>
                <span className="text-[9px] font-mono text-slate-400">
                  {filteredChartTypes.length} types
                </span>
              </div>

              <div className="space-y-2.5">
                {filteredChartTypes.map((opt: ChartTypeOption) => {
                  const Icon = opt.icon;
                  return (
                    <div
                      key={opt.id}
                      className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c1017] hover:border-[#9D61FF]/60 hover:shadow-lg transition-all duration-200 overflow-hidden p-2.5 space-y-2"
                    >
                      {/* Header */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-6 h-6 rounded-lg bg-purple-500/10 text-[#9D61FF] flex items-center justify-center flex-shrink-0">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#9D61FF] transition-colors truncate">
                            {opt.label}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 uppercase bg-purple-500/10 px-1.5 py-0.5 rounded font-bold flex-shrink-0">
                          {opt.id}
                        </span>
                      </div>

                      {/* Graphic Preview */}
                      <div
                        onClick={() => handleOpenChartTypePreview(opt)}
                        className="rounded-xl overflow-hidden cursor-pointer hover:opacity-90 hover:scale-[1.01] transition-transform"
                        title="Click to preview full chart"
                      >
                        <MiniChartPreview type={opt.id} />
                      </div>

                      {/* Actions: Preview & Add */}
                      <div className="flex items-center justify-between pt-0.5 border-t border-slate-100 dark:border-zinc-800/60 text-[10px]">
                        <button
                          type="button"
                          onClick={() => handleOpenChartTypePreview(opt)}
                          className="flex items-center gap-1 text-slate-500 hover:text-[#9D61FF] font-medium cursor-pointer"
                          title="Open full interactive preview"
                        >
                          <Eye className="w-3 h-3 text-purple-500" />
                          <span>Preview</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => onAddBlock({ blockType: "chart", chartType: opt.id })}
                          className="flex items-center gap-1 bg-[#9D61FF]/10 hover:bg-[#9D61FF] text-[#9D61FF] hover:text-white px-2 py-0.5 rounded-md font-bold transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Add to Canvas</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          
          {/* ── WATERMARK STAMPS ── */}
          {(selectedCategory === "all" || selectedCategory === "watermarks") && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8B3DFF] flex items-center gap-1.5">
                  <Stamp className="w-3.5 h-3.5" />
                  Document Watermarks ({filteredWatermarks.length})
                </span>
                <a
                  href="/templates/Sections&Graphs/watermark"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-[#8B3DFF] hover:underline flex items-center gap-0.5 font-semibold"
                  title="Open Watermark Studio to upload more SVGs"
                >
                  <span>Upload</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {filteredWatermarks.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400">
                  No watermarks found
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredWatermarks.map((wm) => {
                    const isApplied = activeWatermarkId === wm.id;
                    return (
                      <div
                        key={wm.id}
                        onClick={() => onSelectWatermark && onSelectWatermark(isApplied ? null : wm.id)}
                        className={`group relative rounded-2xl border p-3 transition-all duration-200 cursor-pointer overflow-hidden space-y-2 ${
                          isApplied
                            ? "border-[#8B3DFF] bg-[#8B3DFF]/10 shadow-md ring-1 ring-[#8B3DFF]"
                            : "border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c1017] hover:border-[#8B3DFF]/60 hover:shadow-lg"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                              isApplied ? "bg-[#8B3DFF] text-white" : "bg-purple-500/10 text-[#8B3DFF]"
                            }`}>
                              <Stamp className="w-3.5 h-3.5" />
                            </div>
                            <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                              {wm.name}
                            </span>
                          </div>
                          <span className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold flex-shrink-0 ${
                            isApplied
                              ? "bg-[#8B3DFF] text-white"
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400"
                          }`}>
                            {isApplied ? "Active" : "Stamp"}
                          </span>
                        </div>

                        {/* SVG Visual Stamp Preview */}
                        <div
                          className="h-16 w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 p-2 flex items-center justify-center overflow-hidden transition-transform group-hover:scale-[1.01]"
                          dangerouslySetInnerHTML={{ __html: wm.svgContent }}
                        />

                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] font-mono text-slate-400 truncate">
                            {wm.fileName}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onSelectWatermark) {
                                onSelectWatermark(isApplied ? null : wm.id);
                              }
                            }}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                              isApplied
                                ? "bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white border border-rose-300"
                                : "bg-[#8B3DFF] hover:bg-[#7c3aed] text-white shadow-sm"
                            }`}
                          >
                            {isApplied ? (
                              <>
                                <X className="w-3 h-3" />
                                <span>Remove</span>
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                <span>Apply</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* ── METRICS & TEXT BLOCKS ── */}
          {(selectedCategory === "all" || selectedCategory === "metrics" || selectedCategory === "text") && (
            <div className="space-y-2 pt-1">
              {selectedCategory === "all" && (
                <div className="px-1 text-[10px] font-mono uppercase font-bold text-slate-400">
                  Standard Elements
                </div>
              )}
              <div className="space-y-2.5">
                {filteredBaseBlocks.map((def) => {
                  const Icon = def.icon;
                  return (
                    <div
                      key={def.type}
                      onClick={() => onAddBlock({ blockType: def.type })}
                      className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c1017] hover:border-[#9D61FF]/60 hover:shadow-lg transition-all duration-200 cursor-pointer overflow-hidden p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-zinc-800 flex items-center justify-center text-slate-700 dark:text-zinc-300 group-hover:text-[#9D61FF] group-hover:bg-[#9D61FF]/10 transition-colors">
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#9D61FF] transition-colors">
                            {def.label}
                          </span>
                        </div>
                        <span className="text-[9px] font-mono text-slate-400 bg-slate-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                          {def.badge}
                        </span>
                      </div>

                      <div className="rounded-xl overflow-hidden pointer-events-none group-hover:scale-[1.02] transition-transform duration-200">
                        {def.preview}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-[10px] text-slate-400 leading-tight truncate">
                          {def.description}
                        </span>
                        <div className="w-5 h-5 rounded-full bg-[#9D61FF]/10 group-hover:bg-[#9D61FF] text-[#9D61FF] group-hover:text-white flex items-center justify-center transition-colors">
                          <Plus className="w-3 h-3" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* ── High-Definition Full Chart Preview Modal ── */}
      {previewingChart && (
        <div
          className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-fadeIn select-none"
          onClick={() => setPreviewingChart(null)}
        >
          <div
            className="bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-zinc-800/80">
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-mono uppercase font-bold px-2 py-0.5 rounded-md bg-[#9D61FF]/10 text-[#9D61FF] border border-[#9D61FF]/30">
                  {previewingChart.chartType}
                </span>
                <div>
                  <h2 className="text-base font-bold text-slate-900 dark:text-white">
                    {previewingChart.title}
                  </h2>
                  <span className="text-[10px] font-mono text-slate-400">
                    Source: {previewingChart.dataSourceField}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setPreviewingChart(null)}
                className="w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Live Visual Rendering */}
            <div className="p-6 space-y-4">
              <div className="w-full bg-slate-50 dark:bg-black/40 border border-slate-200 dark:border-zinc-800/80 rounded-2xl p-6 min-h-[300px] flex items-center justify-center shadow-inner">
                <ChartRenderer
                  chart={previewingChart}
                  color={previewingChart.color || "#9D61FF"}
                  colors={previewingChart.colors}
                  gridRows={previewingChart.gridRows}
                  gridCols={previewingChart.gridCols}
                />
              </div>

              {previewingChart.description && (
                <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed px-1">
                  {previewingChart.description}
                </p>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/30">
              <span className="text-xs text-slate-400">
                Ready to insert into section canvas
              </span>

              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setPreviewingChart(null)}
                  className="h-9 px-4 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAddBlock({
                      blockType: "chart",
                      chartType: previewingChart.chartType,
                      customChart: previewingChart,
                    });
                    setPreviewingChart(null);
                  }}
                  className="h-9 px-5 rounded-xl glow-btn-primary text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Insert This Chart into Canvas</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
