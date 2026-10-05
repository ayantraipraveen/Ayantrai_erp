"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Stamp,
  Check,
  BarChart2,
  Search,
  Plus,
  Sparkles,
  Layers,
  CheckCircle2,
  Eye,
  X,
  FileText,
  CheckSquare,
  ListChecks,
  ArrowUp,
  LayoutGrid,
  Lightbulb,
  MessageSquare,
  Quote,
  HardHat,
  AlertTriangle,
  AlignLeft,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Minus,
  Activity,
  Bookmark,
  TrendingUp,
  ExternalLink,
  Move,
} from "lucide-react";
import {
  CanvasBlockType,
  CanvasElementBlock,
  GraphType,
  LibraryChartCard,
  LibraryKeyInsightItem,
  CanvasRow,
  LibrarySection,
} from "@/lib/redux/slices/reportModuleSlice";
import { resolveSectionCanvasRows } from "../utils/canvasLayoutUtils";
import { useAppSelector } from "@/lib/redux/hooks";
import {
  CHART_TYPE_OPTIONS,
  ChartTypeOption,
} from "./constants/chartTypes";
import ChartRenderer from "./ChartComponent/ChartRenderer";
import { UploadedSvgWatermark, WatermarkStampConfig } from "../watermark/utils";

export interface SidebarAddBlockEvent {
  blockType: CanvasBlockType | "section";
  elementBlock?: CanvasElementBlock;
  chartType?: GraphType;
  customChart?: LibraryChartCard;
  customInsight?: LibraryKeyInsightItem;
  targetRowId?: string;
  targetCellIndex?: number;
  insertRowAtIndex?: number;
  targetStackCellId?: string;
  sectionRows?: CanvasRow[];
  sectionName?: string;
}

export function handleBlockDragStart(
  e: React.DragEvent,
  payload: SidebarAddBlockEvent
) {
  e.dataTransfer.setData("application/json", JSON.stringify(payload));
  e.dataTransfer.setData("text/plain", payload.blockType);
  e.dataTransfer.effectAllowed = "copy";
}

export interface ReportOutlineItem {
  id: string;
  key: string;
  title: string;
  subtitle?: string;
  type: "cover" | "toc" | "section" | "back-cover";
  pageNumber?: string | number;
  sectionId?: string;
  rowsCount?: number;
}

export interface CanvasSidebarProps {
  onAddBlock: (e: SidebarAddBlockEvent) => void;
  sectionCharts?: LibraryChartCard[];
  allLibraryCharts?: LibraryChartCard[];
  uploadedWatermarks?: UploadedSvgWatermark[];
  activeWatermarkId?: string | null;
  onSelectWatermark?: (watermarkId: string | null) => void;
  onAddWatermarkElement?: (watermarkId: string) => void;
  onAddFloatingChart?: (chart: LibraryChartCard) => void;
  watermarkConfig?: WatermarkStampConfig;
  onUpdateWatermarkConfig?: (cfg: Partial<WatermarkStampConfig>) => void;
  isCollapsed?: boolean;
  // Dynamic report sections & outline navigation
  reportSections?: ReportOutlineItem[];
  activeReportSectionKey?: string;
  onSelectReportSection?: (key: string) => void;
  onAddSectionRows?: (rows: CanvasRow[], sectionName: string) => void;
  onReorderReportSections?: (fromIndex: number, toIndex: number) => void;
  onRemoveReportSection?: (sectionId: string) => void;
  showReportSections?: boolean;
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

// ── Standard Non-Chart & Key Bullet Blocks ──────────────────────────────────
interface BaseBlockDef {
  id: string;
  type: CanvasBlockType;
  label: string;
  category: "metrics" | "text";
  description: string;
  badge: string;
  icon: React.ElementType;
  preview: React.ReactNode;
  defaultInsight?: LibraryKeyInsightItem;
}

const BASE_BLOCK_DEFS: BaseBlockDef[] = [
  {
    id: "base-kpi-card",
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
    id: "base-badge-strip",
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
    id: "bullet-insight-cols",
    type: "insight",
    label: "Key Insights (4 Columns)",
    category: "text",
    description: "4-column cards with numbered color badges & metrics",
    badge: "Full Width",
    icon: Lightbulb,
    defaultInsight: {
      id: "ki-cols",
      variant: "columns-numbered",
      title: "Key Insights",
      text: "Overall attendance and supervisory observations across vendors.",
      items: [
        {
          id: "ki-1",
          num: 1,
          color: "green",
          text: "<b>Shakti Construction Services</b> recorded the <b>highest attendance efficiency at 95.2%</b>, with the lowest late comings (<b>4.2%</b>) and early exits (<b>2.8%</b>).",
        },
        {
          id: "ki-2",
          num: 2,
          color: "blue",
          text: "<b>Prime Facilities</b> had the <b>lowest attendance efficiency at 88.6%</b>, along with the highest late comings (<b>13.2%</b>) and early exits (<b>8.6%</b>), indicating a need for closer monitoring.",
        },
        {
          id: "ki-3",
          num: 3,
          color: "purple",
          text: "<b>Metro Engineers</b> and <b>Sree Enterprises</b> also observed relatively higher late coming and early exit rates compared to other vendors.",
        },
        {
          id: "ki-4",
          num: 4,
          color: "orange",
          text: "Overall vendor attendance remained <b>healthy at 92.4%</b>, with scope for improvement in <b>Prime Facilities</b> and <b>Metro Engineers</b> through better workforce management and supervision.",
        },
      ],
    },
    preview: (
      <div className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-[7px] font-bold">💡</div>
          <div className="text-[8px] font-bold text-blue-900 dark:text-blue-400">Key Insights</div>
        </div>
        <div className="grid grid-cols-4 gap-1 text-[6px] leading-tight">
          <div className="flex items-start gap-1 border-r border-slate-100 dark:border-zinc-800 pr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[5.5px] shrink-0">1</span>
            <span className="text-slate-600 dark:text-zinc-300 truncate">Shakti 95.2%</span>
          </div>
          <div className="flex items-start gap-1 border-r border-slate-100 dark:border-zinc-800 pr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[5.5px] shrink-0">2</span>
            <span className="text-slate-600 dark:text-zinc-300 truncate">Prime 88.6%</span>
          </div>
          <div className="flex items-start gap-1 border-r border-slate-100 dark:border-zinc-800 pr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-[5.5px] shrink-0">3</span>
            <span className="text-slate-600 dark:text-zinc-300 truncate">Metro & Sree</span>
          </div>
          <div className="flex items-start gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-[5.5px] shrink-0">4</span>
            <span className="text-slate-600 dark:text-zinc-300 truncate">Vendor 92.4%</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "bullet-insight-titled",
    type: "insight",
    label: "Key Insights (Titled Cards)",
    category: "text",
    description: "4 columns with bold headline titles and detailed analysis",
    badge: "Full Width",
    icon: Lightbulb,
    defaultInsight: {
      id: "ki-titled",
      variant: "columns-titled",
      title: "Key Insights",
      text: "Departmental compliance and safety audit observations.",
      items: [
        {
          id: "kit-1",
          num: 1,
          color: "green",
          title: "Fabrication Needs Attention",
          text: "Fabrication has the highest average violations per worker (<b>4.3</b>) and a high share of helmet violations (<b>40%</b>), indicating a need for focused training and supervision.",
        },
        {
          id: "kit-2",
          num: 2,
          color: "blue",
          title: "Repeat Violators Concentrated in Few Departments",
          text: "Civil (35) and Mechanical (28) together account for <b>61% of total repeated violators (63 out of 103)</b>, suggesting targeted engagement with supervisors in these departments.",
        },
        {
          id: "kit-3",
          num: 3,
          color: "orange",
          title: "Vest Violations are Most Common",
          text: "Across all departments, vest violations form the largest share, averaging <b>40% of total violations</b>, indicating the need for increased awareness and checks for vest usage.",
        },
        {
          id: "kit-4",
          num: 4,
          color: "red",
          title: "Safety and Admin Performing Well",
          text: "Safety (<b>96% compliance</b>) and Admin (<b>94% compliance</b>) show the best performance with the lowest average violations per worker (<b>0.9 and 0.6</b> respectively).",
        },
      ],
    },
    preview: (
      <div className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 space-y-1.5 shadow-2xs">
        <div className="flex items-center gap-1.5 pb-1 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-3.5 h-3.5 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center text-[7px] font-bold">💡</div>
          <div className="text-[8px] font-bold text-blue-900 dark:text-blue-400">Key Insights</div>
        </div>
        <div className="grid grid-cols-4 gap-1 text-[6px]">
          <div className="space-y-0.5 border-r border-slate-100 dark:border-zinc-800 pr-1">
            <div className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[4.5px]">1</span>
              <span className="font-bold text-blue-800 dark:text-blue-300 truncate">Fabrication</span>
            </div>
            <div className="text-[5px] text-slate-400 line-clamp-1">Needs attention</div>
          </div>
          <div className="space-y-0.5 border-r border-slate-100 dark:border-zinc-800 pr-1">
            <div className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[4.5px]">2</span>
              <span className="font-bold text-blue-800 dark:text-blue-300 truncate">Repeat</span>
            </div>
            <div className="text-[5px] text-slate-400 line-clamp-1">Civil & Mech</div>
          </div>
          <div className="space-y-0.5 border-r border-slate-100 dark:border-zinc-800 pr-1">
            <div className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-orange-500 text-white font-bold flex items-center justify-center text-[4.5px]">3</span>
              <span className="font-bold text-blue-800 dark:text-blue-300 truncate">Vest PPE</span>
            </div>
            <div className="text-[5px] text-slate-400 line-clamp-1">Most common</div>
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-0.5">
              <span className="w-2 h-2 rounded-full bg-rose-500 text-white font-bold flex items-center justify-center text-[4.5px]">4</span>
              <span className="font-bold text-blue-800 dark:text-blue-300 truncate">Safety/Admin</span>
            </div>
            <div className="text-[5px] text-slate-400 line-clamp-1">Well performing</div>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "bullet-takeaways",
    type: "insight",
    label: "Key Takeaways (Numbered List)",
    category: "text",
    description: "Vertical stacked bullet list with 8 colored number badges",
    badge: "Full Width",
    icon: ListChecks,
    defaultInsight: {
      id: "ki-takeaways",
      variant: "vertical-takeaways",
      title: "Key Takeaways",
      text: "Executive takeaway metrics for workforce safety and device deployment.",
      items: [
        { id: "kt-1", num: 1, color: "blue", title: "Attendance Rate", text: "<b>92.4%</b> of the registered workforce was present on-site this month, showing a <b>2.1% improvement</b> from last month." },
        { id: "kt-2", num: 2, color: "green", title: "Compliance Rate", text: "PPE compliance stood at <b>96.8%</b>, reflecting strong adherence and a <b>3.6% improvement</b>." },
        { id: "kt-3", num: 3, color: "purple", title: "Devices Sent", text: "A total of <b>300 devices</b> were deployed at the site, with no change from last month." },
        { id: "kt-4", num: 4, color: "red", title: "Damaged Devices", text: "<b>5 devices</b> were reported damaged this month, an increase of 2 compared to last month." },
        { id: "kt-5", num: 5, color: "emerald", title: "Risk-Free Working Hours", text: "<b>18,450 hours</b> were recorded without any high-risk incidents, marking a <b>12% increase</b>." },
        { id: "kt-6", num: 6, color: "amber", title: "Supervisory Efficiency", text: "Supervisors responded and resolved violations with <b>89.2% efficiency</b>, up by <b>4.5%</b>." },
        { id: "kt-7", num: 7, color: "sky", title: "Total Runtime", text: "Devices operated for a total of <b>26,340 hours</b>, an <b>8% increase</b>, ensuring consistent site coverage." },
        { id: "kt-8", num: 8, color: "green", title: "Overtime of Devices", text: "Devices logged <b>320 hours</b> of overtime, a <b>28% reduction</b> from last month, indicating improved deployment management." },
      ],
    },
    preview: (
      <div className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 space-y-1 shadow-2xs">
        <div className="flex items-center gap-1.5 pb-0.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-3 h-3 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center text-[7px]">📄</div>
          <div className="text-[8px] font-bold text-blue-900 dark:text-blue-400">Key Takeaways</div>
        </div>
        <div className="space-y-0.5 text-[6px]">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 text-white font-bold flex items-center justify-center text-[5px]">1</span>
            <span className="font-bold text-slate-700 dark:text-zinc-200">Attendance:</span>
            <span className="text-slate-400 truncate">92.4% workforce</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 text-white font-bold flex items-center justify-center text-[5px]">2</span>
            <span className="font-bold text-slate-700 dark:text-zinc-200">Compliance:</span>
            <span className="text-slate-400 truncate">96.8% PPE adherence</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 text-white font-bold flex items-center justify-center text-[5px]">3</span>
            <span className="font-bold text-slate-700 dark:text-zinc-200">Devices Sent:</span>
            <span className="text-slate-400 truncate">300 active devices</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "bullet-narrative",
    type: "insight",
    label: "Narrative Key Insights",
    category: "text",
    description: "Structured multi-paragraph executive commentary with bold metrics",
    badge: "Full Width",
    icon: FileText,
    defaultInsight: {
      id: "ki-narrative",
      variant: "narrative-summary",
      title: "Key Insights",
      text: `<p>The site maintained a strong workforce presence throughout the month, with an average of <b>276 workers present daily</b>, resulting in an <b>attendance rate of 92.4%</b>, which is a <b>2.1% improvement</b> from last month.</p>
<p>A total of <b>412 instances of late coming</b> and <b>196 instances of early exits</b> were recorded this month, with noticeable spikes around <b>8 September</b> and <b>22 September</b>, indicating periods of reduced punctuality.</p>
<p>The most absent worker this month was <b>Rajesh Kumar (Emp ID: W1876)</b>, with <b>12 days of absence</b>.</p>
<p>The vendor with the most absentees was <b>Shakti Construction Services</b>, with a total of <b>28 absent workers</b>.</p>
<p>Overall, attendance remained stable, but continued focus on punctuality and shift discipline is recommended, especially during identified spike periods.</p>`,
    },
    preview: (
      <div className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 space-y-1 shadow-2xs">
        <div className="flex items-center gap-1.5 pb-0.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-3 h-3 rounded bg-blue-500/10 text-blue-600 flex items-center justify-center text-[7px]">📑</div>
          <div className="text-[8px] font-bold text-blue-900 dark:text-blue-400">Key Insights</div>
        </div>
        <div className="space-y-1 text-[6px] text-slate-500 line-clamp-3">
          The site maintained strong workforce presence with <b>276 workers daily</b> (92.4%). 412 late instances recorded with noticeable spikes.
        </div>
      </div>
    ),
  },
  {
    id: "bullet-split-quote",
    type: "insight",
    label: "Remarks & Quote Split Block",
    category: "text",
    description: "Side-by-side operational commentary with large inspirational quote",
    badge: "Full Width",
    icon: MessageSquare,
    defaultInsight: {
      id: "ki-split-quote",
      variant: "split-quote",
      title: "3. Operational Remarks",
      text: "During the reporting period, the site maintained <b>92.4% PPE compliance</b> across <b>400 monitored workers</b>. Violation activity was primarily concentrated within a few key departments/vendors, while repeated violations accounted for <b>18% of total events</b>. Supervisory teams demonstrated strong responsiveness, resolving <b>94.2% of alerts</b> with an average resolution time of <b>7.4 minutes</b>, though <b>4.8% of alerts</b> required escalation.",
      quote: {
        text: "A safer site is not an accident. It is the result of consistent action, responsible teams and data-driven decisions.",
      },
    },
    preview: (
      <div className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 grid grid-cols-3 gap-1.5 items-center shadow-2xs">
        <div className="col-span-2 space-y-0.5 border-r border-slate-100 dark:border-zinc-800 pr-1.5">
          <div className="text-[7px] font-bold text-blue-900 dark:text-blue-400">3. Operational Remarks</div>
          <div className="text-[5.5px] text-slate-400 line-clamp-2">92.4% PPE compliance across 400 monitored workers...</div>
        </div>
        <div className="text-center font-serif italic text-[6px] text-blue-800 dark:text-blue-300 line-clamp-3">
          “A safer site is not an accident...”
        </div>
      </div>
    ),
  },
  {
    id: "bullet-quote",
    type: "insight",
    label: "Executive Quote Callout",
    category: "text",
    description: "Serif quote card with decorative quotation marks and accent underline",
    badge: "Full Width",
    icon: Quote,
    defaultInsight: {
      id: "ki-quote",
      variant: "quote-card",
      text: "Consistent attendance builds safer sites and stronger teams.",
    },
    preview: (
      <div className="w-full bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200/50 rounded-xl p-2.5 flex flex-col items-center justify-center text-center space-y-1">
        <span className="text-[10px] text-blue-400 font-serif leading-none font-black">“</span>
        <div className="text-[8px] font-serif italic text-blue-900 dark:text-blue-300 font-semibold line-clamp-2">
          Consistent attendance builds safer sites and stronger teams.
        </div>
        <div className="w-6 h-0.5 bg-blue-500 rounded-full" />
      </div>
    ),
  },
  {
    id: "bullet-banner",
    type: "insight",
    label: "Campaign Vision Banner",
    category: "text",
    description: "Wide banner with hardhat avatar, 3 feature pills, and script tagline",
    badge: "Full Width",
    icon: HardHat,
    defaultInsight: {
      id: "ki-banner",
      variant: "vision-banner",
      title: "Turning Insights into a Safer Tomorrow",
      text: "Continuous monitoring. Clearer actions. Safer workplaces.",
      banner: {
        headline: "Turning Insights into a Safer Tomorrow",
        subtitle: "Continuous monitoring. Clearer actions. Safer workplaces.",
        pills: ["People Safer", "Sites Smarter", "Operations Stronger"],
        tagline: "Every Worker Returns Home Safe",
      },
    },
    preview: (
      <div className="w-full bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50 dark:from-blue-950/30 dark:to-zinc-900 border border-blue-200 dark:border-blue-900/50 rounded-xl p-2 flex items-center justify-between gap-1 shadow-2xs">
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded-full bg-blue-900 text-white flex items-center justify-center text-[7px]">⛑️</div>
          <div>
            <div className="text-[7px] font-bold text-blue-950 dark:text-blue-200 leading-tight">Safer Tomorrow</div>
            <div className="text-[5px] text-sky-600 dark:text-sky-400">Safer workplaces</div>
          </div>
        </div>
        <div className="text-[6px] font-serif italic font-bold text-blue-900 dark:text-blue-300 text-right">
          Every Worker Safe
        </div>
      </div>
    ),
  },
  {
    id: "bullet-risk",
    type: "insight",
    label: "Key Factors (Risk Bullets)",
    category: "text",
    description: "Solid red alert bullet list for high risk assessments",
    badge: "Full Width",
    icon: AlertTriangle,
    defaultInsight: {
      id: "ki-risk",
      variant: "risk-factors",
      title: "Key Factors",
      text: "Critical non-compliance observations.",
      items: [
        { id: "rf-1", color: "red", text: "Multiple PPE violations (12 instances)" },
        { id: "rf-2", color: "red", text: "Repeated non-compliance over 8 days" },
        { id: "rf-3", color: "red", text: "Irregular PPE usage pattern detected" },
        { id: "rf-4", color: "red", text: "Lowest compliance rate among all vendors (86.1%)" },
      ],
    },
    preview: (
      <div className="w-full bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl p-2 space-y-1">
        <div className="flex items-center gap-1 text-[7.5px] font-bold text-rose-700 dark:text-rose-400">
          <span>⚠️</span> Key Factors
        </div>
        <div className="space-y-0.5 text-[6px] text-slate-600 dark:text-zinc-300">
          <div className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-rose-500" /> Multiple PPE violations</div>
          <div className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-rose-500" /> Repeated non-compliance</div>
        </div>
      </div>
    ),
  },
  {
    id: "bullet-observations",
    type: "insight",
    label: "Key Observations (Dot Bullets)",
    category: "text",
    description: "Clean bullet dots with indented operational observations",
    badge: "Full Width",
    icon: BarChart2,
    defaultInsight: {
      id: "ki-obs",
      variant: "bullet-observations",
      title: "Key Observations",
      text: "Hourly compliance patterns.",
      items: [
        { id: "ko-1", color: "blue", text: "Compliance is highest during start (8–9 AM) and end of day (5–6 PM)." },
        { id: "ko-2", color: "blue", text: "Lowest compliance observed between 12 PM–2 PM (average 85%)." },
        { id: "ko-3", color: "blue", text: "A clear mid-day dip indicates need for increased supervision and alerts during lunch." },
      ],
    },
    preview: (
      <div className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 space-y-1">
        <div className="flex items-center gap-1 text-[7.5px] font-bold text-blue-900 dark:text-blue-400">
          <span>📊</span> Key Observations
        </div>
        <div className="space-y-0.5 text-[6px] text-slate-600 dark:text-zinc-300">
          <div className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-blue-500" /> Highest during start 8–9 AM</div>
          <div className="flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-blue-500" /> Mid-day dip at 12–2 PM</div>
        </div>
      </div>
    ),
  },
  {
    id: "bullet-priority-actions",
    type: "insight",
    label: "Priority Actions (5 Steps)",
    category: "text",
    description: "5 numbered action cards with colored pill headers and bullet points",
    badge: "Full Width",
    icon: CheckSquare,
    defaultInsight: {
      id: "ki-priority",
      variant: "priority-actions",
      title: "2. Priority Actions for Next Month",
      text: "Key actions to address identified improvement areas.",
      items: [
        {
          id: "pa-1",
          num: 1,
          color: "blue",
          title: "Reduce Repeated Violations",
          text: "Target high-risk workers with counselling",
          subItems: [
            "Identify workers crossing threshold",
            "Conduct targeted training",
            "Monitor weekly reviews",
          ],
        },
        {
          id: "pa-2",
          num: 2,
          color: "green",
          title: "Strengthen Supervisor Response",
          text: "Accelerate alert turnaround",
          subItems: [
            "Improve alert acknowledgement times",
            "Ensure timely resolution",
            "Provide supervisor training",
          ],
        },
        {
          id: "pa-3",
          num: 3,
          color: "amber",
          title: "Improve PPE-Specific Compliance",
          text: "Target helmet & vest enforcement",
          subItems: [
            "Focus on high-violation categories",
            "Run on-site awareness drives",
            "Track improvement trends",
          ],
        },
        {
          id: "pa-4",
          num: 4,
          color: "purple",
          title: "Vendor & Department Monitoring",
          text: "Drive contractor accountability",
          subItems: [
            "Increase review frequency",
            "Share summaries with leaders",
            "Set department action plans",
          ],
        },
        {
          id: "pa-5",
          num: 5,
          color: "red",
          title: "Optimise Device Deployment",
          text: "Maintain operational readiness",
          subItems: [
            "Reallocate underutilised units",
            "Plan preventive maintenance",
            "Ensure buffer flexibility",
          ],
        },
      ],
    },
    preview: (
      <div className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-zinc-800 rounded-xl p-2 space-y-1">
        <div className="text-[7.5px] font-bold text-blue-900 dark:text-blue-400">2. Priority Actions</div>
        <div className="grid grid-cols-5 gap-0.5 text-center text-[5px]">
          <div className="bg-blue-50 dark:bg-blue-950/40 rounded p-0.5"><div className="font-bold text-blue-700 dark:text-blue-300">01</div>Violations</div>
          <div className="bg-emerald-50 dark:bg-emerald-950/40 rounded p-0.5"><div className="font-bold text-emerald-700 dark:text-emerald-300">02</div>Response</div>
          <div className="bg-amber-50 dark:bg-amber-950/40 rounded p-0.5"><div className="font-bold text-amber-700 dark:text-amber-300">03</div>PPE Focus</div>
          <div className="bg-purple-50 dark:bg-purple-950/40 rounded p-0.5"><div className="font-bold text-purple-700 dark:text-purple-300">04</div>Vendors</div>
          <div className="bg-rose-50 dark:bg-rose-950/40 rounded p-0.5"><div className="font-bold text-rose-700 dark:text-rose-300">05</div>Devices</div>
        </div>
      </div>
    ),
  },
  {
    id: "bullet-single-insight",
    type: "insight",
    label: "Key Insight Bullet",
    category: "text",
    description: "Numbered observation callout block",
    badge: "Full Width",
    icon: Lightbulb,
    defaultInsight: {
      id: "ki-single",
      variant: "single",
      text: "Supervisory compliance increased 14.2% across North Yard shifts.",
    },
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
    id: "base-text",
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
    id: "base-divider",
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

export const TWO_ZONE_CHART_PRESET: LibraryChartCard = {
  id: "preset-two-zone-chart",
  title: "Zone A vs Zone B Telemetry",
  chartType: "multi-line",
  dataSourceField: "zone_telemetry_feed",
  description: "Comparative two-zone continuous sensor telemetry (Zone A vs Zone B).",
  color: "#9D61FF",
  colors: ["#9D61FF", "#10B981"],
  series: [
    { id: "s1", name: "Zone A (Actual)", color: "#9D61FF", data: [85, 94, 96, 92, 88] },
    { id: "s2", name: "Zone B (Target)", color: "#10B981", data: [78, 88, 91, 84, 80] },
  ],

  dataPoints: [
    { id: "p1", label: "08:00", value: 85, secondaryValue: 78 },
    { id: "p2", label: "12:00", value: 94, secondaryValue: 88 },
    { id: "p3", label: "16:00", value: 96, secondaryValue: 91 },
    { id: "p4", label: "20:00", value: 92, secondaryValue: 84 },
    { id: "p5", label: "24:00", value: 88, secondaryValue: 80 },
  ],
  options: { showValues: true, showGridLines: true, showLegend: true },
};

export function CanvasSidebar({
  onAddBlock,
  sectionCharts = [],
  allLibraryCharts = [],
  uploadedWatermarks = [],
  activeWatermarkId,
  onSelectWatermark,
  onAddWatermarkElement,
  onAddFloatingChart,
  watermarkConfig,
  onUpdateWatermarkConfig,
  isCollapsed,
  reportSections,
  activeReportSectionKey,
  onSelectReportSection,
  onAddSectionRows,
  onReorderReportSections,
  onRemoveReportSection,
  showReportSections = false,
}: CanvasSidebarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const availableCategories = useMemo(() => {
    if (showReportSections) {
      return ["sections", "all", "charts", "metrics", "text", "watermarks"] as const;
    }
    return ["all", "charts", "metrics", "text", "watermarks"] as const;
  }, [showReportSections]);

  const [selectedCategory, setSelectedCategory] = useState<"all" | "sections" | "charts" | "metrics" | "text" | "watermarks">(
    showReportSections && reportSections && reportSections.length > 0 ? "sections" : "all"
  );

  useEffect(() => {
    if (!showReportSections && selectedCategory === "sections") {
      setSelectedCategory("all");
    }
  }, [showReportSections, selectedCategory]);

  const reduxLibrarySections = useAppSelector((state) => state.reportModule.librarySections || []);

  // Filter existing library sections (deduplicated by id)
  const filteredLibrarySections = useMemo(() => {
    const seen = new Set<string>();
    const query = searchQuery.toLowerCase().trim();
    return reduxLibrarySections.filter((sec) => {
      if (seen.has(sec.id)) return false;
      seen.add(sec.id);
      if (!query) return true;
      return (
        sec.name.toLowerCase().includes(query) ||
        sec.eyebrow.toLowerCase().includes(query) ||
        sec.description.toLowerCase().includes(query)
      );
    });
  }, [reduxLibrarySections, searchQuery]);

  // State for Chart Quick Preview Dialog
  const [previewingChart, setPreviewingChart] = useState<LibraryChartCard | null>(null);

  if (isCollapsed) return null;

  // Filter 25 chart types
  const filteredChartTypes = CHART_TYPE_OPTIONS.filter((opt) =>
    opt.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    opt.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (searchQuery.toLowerCase().includes("zone") && (opt.id === "multi-line" || opt.id === "grouped-bar" || opt.id === "geo-map"))
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
              {selectedCategory === "charts"
                ? "25 Charts"
                : selectedCategory === "text"
                ? "11 Bullets"
                : selectedCategory === "metrics"
                ? "2 Metrics"
                : selectedCategory === "watermarks"
                ? "6 Stamps"
                : "All Elements"}
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
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none]">
            {availableCategories.map((cat) => {
              const label =
                cat === "sections"
                  ? "Sections"
                  : cat === "charts"
                  ? "Charts"
                  : cat === "watermarks"
                  ? "Stamps"
                  : cat === "text"
                  ? "Bullets"
                  : cat;
              return (
                <button
                  key={cat}
                  type="button"
                  title={
                    cat === "sections"
                      ? "Report Sections & Library Blueprints"
                      : cat === "text"
                      ? "Key Bullets, Insights & Takeaways"
                      : undefined
                  }
                  onClick={() => setSelectedCategory(cat)}
                  className={`h-7 px-2.5 rounded-lg text-[10px] font-bold capitalize transition-all cursor-pointer whitespace-nowrap flex-shrink-0 flex items-center justify-center ${
                    selectedCategory === cat
                      ? "bg-[#9D61FF] text-white shadow-sm"
                      : "bg-slate-100 dark:bg-zinc-800/60 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4">

          {/* ── REPORT SECTIONS & OUTLINE NAVIGATOR (Complete Report Format Only) ── */}
          {showReportSections && (selectedCategory === "sections" || selectedCategory === "all") && (
            <div className="space-y-3 pb-2 border-b border-slate-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[#9D61FF] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Report Pages ({reportSections ? reportSections.length : 4})
                </span>
                <span className="text-[9px] text-slate-400">Click to Jump &amp; Edit</span>
              </div>

              <div className="space-y-1.5">
                {/* 1. Fixed Cover Page */}
                <button
                  type="button"
                  onClick={() => onSelectReportSection?.("cover")}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    activeReportSectionKey === "cover"
                      ? "border-blue-500 bg-blue-500/10 shadow-sm"
                      : "border-blue-500/30 bg-blue-500/5 hover:bg-blue-500/10 hover:border-blue-500/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-500/15 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-blue-600 truncate">
                        1. Cover Page
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Fixed Page 1 • Title, Subtitle, Site, Author
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-500/15 text-blue-600 flex-shrink-0">
                    Page 01
                  </span>
                </button>

                {/* 2. Fixed Table of Contents */}
                <button
                  type="button"
                  onClick={() => onSelectReportSection?.("toc")}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    activeReportSectionKey === "toc"
                      ? "border-indigo-500 bg-indigo-500/10 shadow-sm"
                      : "border-indigo-500/30 bg-indigo-500/5 hover:bg-indigo-500/10 hover:border-indigo-500/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-indigo-500/15 text-indigo-600 flex items-center justify-center flex-shrink-0">
                      <ListChecks className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-indigo-600 truncate">
                        2. Table of Contents
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Fixed Page 2 • Section Index &amp; Overview
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-600 flex-shrink-0">
                    Page 02
                  </span>
                </button>

                {/* 3...N. Dynamic Body Sections (Draggable & Reorderable) */}
                {reportSections &&
                  reportSections
                    .filter((s) => s.type === "section")
                    .map((sec, idx, arr) => (
                      <div
                        key={sec.id || idx}
                        draggable={true}
                        onDragStart={(e) => {
                          e.dataTransfer.setData("application/reorder-section", String(idx));
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        onDragOver={(e) => {
                          if (
                            e.dataTransfer.types.includes("application/reorder-section") ||
                            e.dataTransfer.types.includes("application/json")
                          ) {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = "copy";
                          }
                        }}
                        onDrop={(e) => {
                          const rawIdx = e.dataTransfer.getData("application/reorder-section");
                          if (rawIdx !== "") {
                            e.preventDefault();
                            e.stopPropagation();
                            const fromIdx = parseInt(rawIdx, 10);
                            if (!isNaN(fromIdx) && fromIdx !== idx) {
                              onReorderReportSections?.(fromIdx, idx);
                            }
                            return;
                          }
                          const rawJson = e.dataTransfer.getData("application/json");
                          if (rawJson) {
                            try {
                              const parsed = JSON.parse(rawJson);
                              if (parsed.blockType === "section" && parsed.sectionRows) {
                                e.preventDefault();
                                e.stopPropagation();
                                onAddSectionRows?.(parsed.sectionRows, parsed.sectionName || "New Section");
                              }
                            } catch (err) {
                              console.error(err);
                            }
                          }
                        }}
                        onClick={() => onSelectReportSection?.(sec.key)}
                        className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                          activeReportSectionKey === sec.key
                            ? "border-[#9D61FF] bg-purple-500/15 shadow-sm"
                            : "border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10 hover:border-purple-500/50"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          {/* Drag handle */}
                          <div
                            className="cursor-grab active:cursor-grabbing p-0.5 text-slate-400 group-hover:text-[#9D61FF] transition-colors flex-shrink-0"
                            title="Drag up or down to reorder this section"
                          >
                            <GripVertical className="w-3.5 h-3.5" />
                          </div>

                          <div className="w-6 h-6 rounded-lg bg-purple-500/15 text-[#9D61FF] flex items-center justify-center flex-shrink-0">
                            <Layers className="w-3 h-3" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-[#9D61FF] truncate">
                              {idx + 3}. {sec.title}
                            </div>
                            <div className="text-[10px] text-slate-400 truncate">
                              {sec.subtitle || `Telemetry charts & metrics (${sec.rowsCount || 1} rows)`}
                            </div>
                          </div>
                        </div>

                        {/* Reorder Steppers & Page Badge */}
                        <div className="flex items-center gap-1 flex-shrink-0 ml-1">
                          {arr.length > 1 && (
                            <div className="flex items-center gap-0.5 opacity-60 group-hover:opacity-100 transition-opacity">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onReorderReportSections?.(idx, idx - 1);
                                }}
                                className="p-1 rounded hover:bg-purple-500/20 disabled:opacity-20 text-slate-500 hover:text-[#9D61FF] transition-all cursor-pointer disabled:pointer-events-none"
                                title="Move Section Up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === arr.length - 1}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onReorderReportSections?.(idx, idx + 1);
                                }}
                                className="p-1 rounded hover:bg-purple-500/20 disabled:opacity-20 text-slate-500 hover:text-[#9D61FF] transition-all cursor-pointer disabled:pointer-events-none"
                                title="Move Section Down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}

                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-500/15 text-[#9D61FF]">
                            Page {sec.pageNumber ? (typeof sec.pageNumber === "number" ? String(sec.pageNumber).padStart(2, "0") : sec.pageNumber) : String(idx + 3).padStart(2, "0")}
                          </span>
                        </div>
                      </div>
                    ))}

                {/* Last. Fixed Back Cover Page */}
                <button
                  type="button"
                  onClick={() => onSelectReportSection?.("back-cover")}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                    activeReportSectionKey === "back-cover"
                      ? "border-emerald-500 bg-emerald-500/10 shadow-sm"
                      : "border-emerald-500/30 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/60"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center flex-shrink-0">
                      <CheckSquare className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 group-hover:text-emerald-600 truncate">
                        End. Back Cover Page
                      </div>
                      <div className="text-[10px] text-slate-400 truncate">
                        Fixed Last Page • Thank You &amp; Sign-off
                      </div>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 flex-shrink-0">
                    {reportSections?.find((s) => s.type === "back-cover")?.pageNumber
                      ? `Page ${String(reportSections.find((s) => s.type === "back-cover")?.pageNumber).padStart(2, "0")}`
                      : "Last Page"}
                  </span>
                </button>
              </div>

              {/* ── EXISTING SECTIONS FROM LIBRARY (+ INSERT SECTION & DRAG TO REPORT) ── */}
              <div className="pt-3 border-t border-slate-200/80 dark:border-zinc-800/80 space-y-2.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#9D61FF]" />
                    Insert Existing Section ({filteredLibrarySections.length})
                  </span>
                  <span className="text-[9px] text-emerald-500 font-semibold font-mono">Drag or Insert</span>
                </div>

                <div className="space-y-2">
                  {filteredLibrarySections.map((libSec, secIdx) => {
                    const resolvedRows = resolveSectionCanvasRows(libSec);
                    const chartsCount = libSec.charts?.length || 0;
                    const metricsCount = libSec.metricCards?.length || 0;
                    const rowsCount = resolvedRows.length;

                    return (
                      <div
                        key={`lib-sec-${libSec.id}-${secIdx}`}
                        draggable={true}
                        onDragStart={(e) => {
                          const payload: SidebarAddBlockEvent = {
                            blockType: "section",
                            sectionName: libSec.name,
                            sectionRows: resolvedRows,
                          };
                          e.dataTransfer.setData("application/json", JSON.stringify(payload));
                          e.dataTransfer.setData("text/plain", libSec.name);
                          e.dataTransfer.effectAllowed = "copy";
                        }}
                        className="group/sec-card p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/60 hover:border-[#9D61FF]/60 hover:shadow-md transition-all space-y-2 cursor-grab active:cursor-grabbing"
                        title="Drag section onto report canvas, or click button to insert after current section"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-1.5 min-w-0 flex-1">
                            <GripVertical className="w-3.5 h-3.5 text-slate-400 group-hover/sec-card:text-[#9D61FF] transition-colors flex-shrink-0" />
                            <div className="min-w-0 flex-1">
                              <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {libSec.name}
                              </div>
                              <div className="text-[10px] text-slate-400 font-mono truncate mt-0.5">
                                {libSec.eyebrow}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded-full ${
                              libSec.type === "core"
                                ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                                : "bg-amber-500/15 text-amber-600"
                            }`}
                          >
                            {libSec.type || "core"}
                          </span>
                        </div>

                        {/* Badges / Stats */}
                        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono pl-5">
                          <span>
                            {chartsCount} {chartsCount === 1 ? "Chart" : "Charts"}
                          </span>
                          <span>•</span>
                          <span>{metricsCount} Metrics</span>
                          <span>•</span>
                          <span>{rowsCount} Rows</span>
                        </div>

                        {/* Action Button: Insert Section into Report */}
                        <button
                          type="button"
                          onClick={() => onAddSectionRows?.(resolvedRows, libSec.name)}
                          className="w-full py-1.5 px-2.5 rounded-xl bg-purple-500/10 hover:bg-[#9D61FF] text-[#9D61FF] hover:text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Insert Section to Report</span>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

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
                    draggable={true}
                    onDragStart={(e) => handleBlockDragStart(e, { blockType: "chart", customChart: chart })}
                    className="group relative rounded-xl border border-sky-400/30 bg-sky-500/5 hover:bg-sky-500/10 hover:border-sky-400/60 p-2.5 transition-all duration-200 space-y-2 cursor-grab active:cursor-grabbing hover:shadow-md"
                    title="Drag anywhere on report to place, or click Add"
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

                      <div className="flex items-center gap-1.5">
                        {onAddFloatingChart && (
                          <button
                            type="button"
                            onClick={() => onAddFloatingChart(chart)}
                            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md transition-colors"
                            title="Float on Page (freeform coordinates & 360° axis rotation)"
                          >
                            <Move className="w-2.5 h-2.5" />
                            <span>Float</span>
                          </button>
                        )}
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
                    draggable={true}
                    onDragStart={(e) => handleBlockDragStart(e, { blockType: "chart", customChart: chart })}
                    className="group relative rounded-xl border border-amber-400/30 bg-amber-500/5 hover:bg-amber-500/10 hover:border-amber-400/60 p-2.5 transition-all duration-200 space-y-2 cursor-grab active:cursor-grabbing hover:shadow-md"
                    title="Drag anywhere on report to place, or click Add"
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

                      <div className="flex items-center gap-1.5">
                        {onAddFloatingChart && (
                          <button
                            type="button"
                            onClick={() => onAddFloatingChart(chart)}
                            className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-bold cursor-pointer bg-emerald-500/10 hover:bg-emerald-500/20 px-2 py-0.5 rounded-md transition-colors"
                            title="Float on Page (freeform coordinates & 360° axis rotation)"
                          >
                            <Move className="w-2.5 h-2.5" />
                            <span>Float</span>
                          </button>
                        )}
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
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── FEATURED TWO-ZONE TELEMETRY CHART PRESET ── */}
          {(selectedCategory === "charts" || selectedCategory === "all") &&
            (!searchQuery || "two-zone chart zone a vs zone b telemetry comparison".includes(searchQuery.toLowerCase())) && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-mono uppercase font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5" />
                    Two-Zone Telemetry Chart
                  </span>
                  <span className="text-[9px] font-mono text-purple-600 dark:text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-bold">
                    Preset
                  </span>
                </div>

                <div
                  draggable={true}
                  onDragStart={(e) => handleBlockDragStart(e, { blockType: "chart", customChart: TWO_ZONE_CHART_PRESET })}
                  className="group relative rounded-2xl border border-emerald-400/40 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/80 p-2.5 transition-all duration-200 space-y-2 cursor-grab active:cursor-grabbing hover:shadow-lg"
                  title="Drag anywhere on report to place, or click Add to Canvas"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center flex-shrink-0">
                        <TrendingUp className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors truncate">
                        Two-Zone Chart (Zone A vs B)
                      </span>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-600 font-bold flex-shrink-0">
                      Multi-Line
                    </span>
                  </div>

                  <div
                    onClick={() => setPreviewingChart(TWO_ZONE_CHART_PRESET)}
                    className="rounded-xl overflow-hidden cursor-pointer hover:opacity-90 hover:scale-[1.01] transition-transform"
                    title="Click to expand full live preview"
                  >
                    <MiniChartPreview type="multi-line" />
                  </div>

                  <div className="flex items-center justify-between pt-0.5 border-t border-emerald-400/20 text-[10px]">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewingChart(TWO_ZONE_CHART_PRESET);
                      }}
                      className="flex items-center gap-1 text-slate-500 hover:text-emerald-600 font-medium cursor-pointer"
                    >
                      <Eye className="w-3 h-3 text-emerald-500" />
                      <span>Preview</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onAddBlock({ blockType: "chart", customChart: TWO_ZONE_CHART_PRESET })}
                      className="flex items-center gap-1 text-white bg-emerald-600 hover:bg-emerald-700 font-bold cursor-pointer px-2.5 py-1 rounded-lg shadow-xs hover:scale-105 active:scale-95 transition-all"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add to Canvas</span>
                    </button>
                  </div>
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
                      draggable={true}
                      onDragStart={(e) => handleBlockDragStart(e, { blockType: "chart", chartType: opt.id })}
                      className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c1017] hover:border-[#9D61FF]/60 hover:shadow-lg transition-all duration-200 overflow-hidden p-2.5 space-y-2 cursor-grab active:cursor-grabbing"
                      title="Drag anywhere on report to place, or click Add to Canvas"
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

          
          {/* ── SVG ELEMENTS AND WATERMARKS ── */}
          {(selectedCategory === "all" || selectedCategory === "watermarks") && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between px-1">
                <span className="text-[10px] font-mono uppercase font-bold text-[#8B3DFF] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  SVG Elements ({filteredWatermarks.length})
                </span>
                <a
                  href="/templates/Sections&Graphs/watermark"
                  target="_blank"
                  rel="noreferrer"
                  className="text-[9px] text-[#8B3DFF] hover:underline flex items-center gap-0.5 font-semibold"
                  title="Upload more SVG assets"
                >
                  <span>Upload</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>

              {filteredWatermarks.length === 0 ? (
                <div className="p-3 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 text-center text-xs text-slate-400">
                  No SVG elements found
                </div>
              ) : (
                <div className="space-y-2.5">
                  {filteredWatermarks.map((wm) => {
                    const isApplied = activeWatermarkId === wm.id;
                    return (
                      <div
                        key={wm.id}
                        className={`group relative rounded-2xl border p-3 transition-all duration-200 overflow-hidden space-y-2 ${
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

                        <div className="flex items-center justify-between gap-2 pt-1">
                          <span className="text-[10px] font-mono text-slate-400 truncate">
                            {wm.fileName}
                          </span>
                          <div className="flex flex-shrink-0 items-center gap-1">
                            <button
                              type="button"
                              onClick={() => onAddWatermarkElement?.(wm.id)}
                              className="flex items-center gap-1 rounded-md border border-slate-200 px-2 py-1 text-[10px] font-bold text-slate-600 transition-colors hover:border-[#8B3DFF] hover:text-[#8B3DFF] dark:border-zinc-700 dark:text-zinc-300"
                              title="Place this graphic on the page"
                            >
                              <Plus className="h-3 w-3" />
                              <span>Element</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => onSelectWatermark?.(isApplied ? null : wm.id)}
                              className={`flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold transition-colors ${
                                isApplied
                                  ? "border border-rose-300 bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white"
                                  : "bg-[#8B3DFF] text-white hover:bg-[#7c3aed]"
                              }`}
                              title={isApplied ? "Remove as watermark" : "Apply as page watermark"}
                            >
                              {isApplied ? <X className="h-3 w-3" /> : <Stamp className="h-3 w-3" />}
                              <span>{isApplied ? "Remove" : "Watermark"}</span>
                            </button>
                          </div>
                        </div>

                        {/* If applied, show quick resize & placement controls */}
                        {isApplied && onUpdateWatermarkConfig && watermarkConfig && (
                          <div
                            className="pt-2 border-t border-purple-500/20 flex items-center justify-between gap-1 text-[10px]"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {/* Scale Stepper */}
                            <div className="flex items-center gap-1 bg-white dark:bg-zinc-900 px-1.5 py-0.5 rounded-lg border border-purple-200 dark:border-purple-800">
                              <button
                                type="button"
                                onClick={() => onUpdateWatermarkConfig({ scale: Math.max(20, (watermarkConfig.scale ?? 100) - 10) })}
                                className="w-4 h-4 rounded hover:bg-purple-100 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300"
                                title="Smaller"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold text-[#8B3DFF]">
                                {watermarkConfig.scale ?? 100}%
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateWatermarkConfig({ scale: Math.min(300, (watermarkConfig.scale ?? 100) + 10) })}
                                className="w-4 h-4 rounded hover:bg-purple-100 flex items-center justify-center font-bold text-slate-700 dark:text-zinc-300"
                                title="Larger"
                              >
                                +
                              </button>
                            </div>

                            {/* Placement Cycler */}
                            <button
                              type="button"
                              onClick={() => {
                                const placements = ["center", "top-left", "top-right", "bottom-left", "bottom-right", "tiled"] as const;
                                const nextIdx = (placements.indexOf(watermarkConfig.placement as any) + 1) % placements.length;
                                onUpdateWatermarkConfig({ placement: placements[nextIdx] });
                              }}
                              className="px-2 py-0.5 rounded-lg bg-white dark:bg-zinc-900 border border-purple-200 dark:border-purple-800 text-[10px] font-mono uppercase text-slate-700 dark:text-zinc-300 hover:bg-purple-50 cursor-pointer"
                              title="Cycle Location"
                            >
                              Pos: {watermarkConfig.placement ?? "center"}
                            </button>
                            <button
                              type="button"
                              onClick={() => onUpdateWatermarkConfig({ layer: watermarkConfig.layer === "front" ? "back" : "front" })}
                              className="flex items-center gap-1 rounded-lg border border-purple-200 bg-white px-2 py-0.5 text-[10px] font-mono uppercase text-slate-700 hover:bg-purple-50 dark:border-purple-800 dark:bg-zinc-900 dark:text-zinc-300"
                              title={watermarkConfig.layer === "front" ? "Send watermark behind page content" : "Bring watermark in front of page content"}
                            >
                              <Layers className="h-3 w-3" />
                              {watermarkConfig.layer === "front" ? "Front" : "Back"}
                            </button>
                          </div>
                        )}
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
              {selectedCategory === "text" && (
                <div className="px-1 text-[10px] font-mono uppercase font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                  <span>Key Bullets & Takeaways</span>
                  <span className="text-[9px] font-normal text-slate-400">11 Styles</span>
                </div>
              )}
              <div className="space-y-2.5">
                {filteredBaseBlocks.map((def) => {
                  const Icon = def.icon;
                  return (
                    <div
                      key={def.id}
                      draggable={true}
                      onDragStart={(e) =>
                        handleBlockDragStart(e, {
                          blockType: def.type,
                          customInsight: def.defaultInsight,
                        })
                      }
                      onClick={() =>
                        onAddBlock({
                          blockType: def.type,
                          customInsight: def.defaultInsight,
                        })
                      }
                      className="group relative rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0c1017] hover:border-[#9D61FF]/60 hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing overflow-hidden p-3 space-y-2"
                      title="Drag anywhere on report to place, or click to add"
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
                {onAddFloatingChart && (
                  <button
                    type="button"
                    onClick={() => {
                      onAddFloatingChart(previewingChart);
                      setPreviewingChart(null);
                    }}
                    className="h-9 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-md transition-colors"
                    title="Float on Page (freeform coordinates & 360° axis rotation)"
                  >
                    <Move className="w-3.5 h-3.5" />
                    <span>Float on Page</span>
                  </button>
                )}
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
