import React from "react";
import {
  TrendingUp,
  BarChart2,
  PieChart,
  Layers,
  Grid,
  CheckCircle2,
  Table as TableIcon,
  Activity,
  Clock,
  Sparkles,
  Filter,
  Calendar,
  Zap,
  LucideIcon,
} from "lucide-react";
import { PaletteRamp, GraphType } from "@/lib/redux/slices/reportModuleSlice";

// 9 Color Ramps for Pastel Metric Cards (Matching Dummy_report.pdf)
export const PALETTE_RAMPS: {
  id: PaletteRamp;
  label: string;
  bgLight: string;
  bgDark: string;
  borderLight: string;
  borderDark: string;
  textLight: string;
  textDark: string;
  badgeBg: string;
  badgeText: string;
  accent: string;
}[] = [
  {
    id: "blue",
    label: "Ocean Blue",
    bgLight: "bg-blue-50/90",
    bgDark: "dark:bg-blue-950/30",
    borderLight: "border-blue-200/90",
    borderDark: "dark:border-blue-800/60",
    textLight: "text-blue-950",
    textDark: "dark:text-blue-100",
    badgeBg: "bg-blue-500/15",
    badgeText: "text-blue-700 dark:text-blue-300",
    accent: "#3B82F6",
  },
  {
    id: "green",
    label: "Sage Green",
    bgLight: "bg-green-50/90",
    bgDark: "dark:bg-green-950/30",
    borderLight: "border-green-200/90",
    borderDark: "dark:border-green-800/60",
    textLight: "text-green-950",
    textDark: "dark:text-green-100",
    badgeBg: "bg-green-500/15",
    badgeText: "text-green-700 dark:text-green-300",
    accent: "#22C55E",
  },
  {
    id: "purple",
    label: "Royal Violet",
    bgLight: "bg-purple-50/90",
    bgDark: "dark:bg-purple-950/30",
    borderLight: "border-purple-200/90",
    borderDark: "dark:border-purple-800/60",
    textLight: "text-purple-950",
    textDark: "dark:text-purple-100",
    badgeBg: "bg-purple-500/15",
    badgeText: "text-purple-700 dark:text-purple-300",
    accent: "#9D61FF",
  },
  {
    id: "red",
    label: "Soft Coral",
    bgLight: "bg-rose-50/90",
    bgDark: "dark:bg-rose-950/30",
    borderLight: "border-rose-200/90",
    borderDark: "dark:border-rose-800/60",
    textLight: "text-rose-950",
    textDark: "dark:text-rose-100",
    badgeBg: "bg-rose-500/15",
    badgeText: "text-rose-700 dark:text-rose-300",
    accent: "#F43F5E",
  },
  {
    id: "amber",
    label: "Warm Amber",
    bgLight: "bg-amber-50/90",
    bgDark: "dark:bg-amber-950/30",
    borderLight: "border-amber-200/90",
    borderDark: "dark:border-amber-800/60",
    textLight: "text-amber-950",
    textDark: "dark:text-amber-100",
    badgeBg: "bg-amber-500/15",
    badgeText: "text-amber-700 dark:text-amber-300",
    accent: "#F59E0B",
  },
  {
    id: "emerald",
    label: "Mint Emerald",
    bgLight: "bg-emerald-50/90",
    bgDark: "dark:bg-emerald-950/30",
    borderLight: "border-emerald-200/90",
    borderDark: "dark:border-emerald-800/60",
    textLight: "text-emerald-950",
    textDark: "dark:text-emerald-100",
    badgeBg: "bg-emerald-500/15",
    badgeText: "text-emerald-700 dark:text-emerald-300",
    accent: "#10B981",
  },
  {
    id: "cyan",
    label: "Crisp Cyan",
    bgLight: "bg-cyan-50/90",
    bgDark: "dark:bg-cyan-950/30",
    borderLight: "border-cyan-200/90",
    borderDark: "dark:border-cyan-800/60",
    textLight: "text-cyan-950",
    textDark: "dark:text-cyan-100",
    badgeBg: "bg-cyan-500/15",
    badgeText: "text-cyan-700 dark:text-cyan-300",
    accent: "#06B6D4",
  },
  {
    id: "orange",
    label: "Tangerine",
    bgLight: "bg-orange-50/90",
    bgDark: "dark:bg-orange-950/30",
    borderLight: "border-orange-200/90",
    borderDark: "dark:border-orange-800/60",
    textLight: "text-orange-950",
    textDark: "dark:text-orange-100",
    badgeBg: "bg-orange-500/15",
    badgeText: "text-orange-700 dark:text-orange-300",
    accent: "#F97316",
  },
  {
    id: "slate",
    label: "Neutral Slate",
    bgLight: "bg-slate-100/90",
    bgDark: "dark:bg-slate-900/60",
    borderLight: "border-slate-300/80",
    borderDark: "dark:border-slate-800/80",
    textLight: "text-slate-950",
    textDark: "dark:text-slate-100",
    badgeBg: "bg-slate-500/15",
    badgeText: "text-slate-700 dark:text-slate-300",
    accent: "#64748B",
  },
];

// 25 Chart Visualization Types
export interface ChartTypeOption {
  id: GraphType;
  label: string;
  icon: LucideIcon;
}

export const CHART_TYPE_OPTIONS: ChartTypeOption[] = [
  { id: "line", label: "Line Chart", icon: TrendingUp },
  { id: "multi-line", label: "Multi-line", icon: TrendingUp },
  { id: "bar", label: "Vertical Bar", icon: BarChart2 },
  { id: "grouped-bar", label: "Grouped Bar", icon: BarChart2 },
  { id: "horizontal-bar", label: "Horiz. Bar", icon: BarChart2 },
  { id: "stacked-horizontal", label: "100% Stacked", icon: Layers },
  { id: "donut", label: "Donut", icon: PieChart },
  { id: "pie", label: "Pie Chart", icon: PieChart },
  { id: "heatmap", label: "Heatmap", icon: Grid },
  { id: "two-segment", label: "Progress Bar", icon: CheckCircle2 },
  { id: "table", label: "Data Table", icon: TableIcon },
  { id: "area", label: "Area Chart", icon: TrendingUp },
  { id: "stacked-bar", label: "Stacked Bar", icon: Layers },
  { id: "radar", label: "Radar", icon: Activity },
  { id: "gauge", label: "Gauge", icon: Clock },
  { id: "scatter", label: "Scatter", icon: Sparkles },
  { id: "bubble", label: "Bubble", icon: Sparkles },
  { id: "funnel", label: "Funnel", icon: Filter },
  { id: "sparkline", label: "Sparkline", icon: Activity },
  { id: "combo", label: "Combo", icon: Layers },
  { id: "waterfall", label: "Waterfall", icon: BarChart2 },
  { id: "treemap", label: "Treemap", icon: Grid },
  { id: "kpi-card", label: "KPI Card", icon: CheckCircle2 },
  { id: "timeline", label: "Timeline", icon: Calendar },
  { id: "geo-map", label: "Geo Map", icon: Zap },
];

// Color Palette Swatches for Chart Preview Selection
export interface PaletteColorSwatch {
  color: string;
  label: string;
}

export const PALETTE_COLORS: PaletteColorSwatch[] = [
  { color: "#9D61FF", label: "Violet" },
  { color: "#3B82F6", label: "Blue" },
  { color: "#10B981", label: "Emerald" },
  { color: "#F59E0B", label: "Amber" },
  { color: "#F43F5E", label: "Rose" },
  { color: "#06B6D4", label: "Cyan" },
  { color: "#8B5CF6", label: "Purple" },
  { color: "#F97316", label: "Orange" },
  { color: "#64748B", label: "Slate" },
];
