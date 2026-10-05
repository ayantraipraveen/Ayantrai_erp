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
  iconCircleBg?: string;
  iconColor?: string;
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
    iconCircleBg: "bg-blue-100 dark:bg-blue-900/50",
    iconColor: "text-blue-600 dark:text-blue-300",
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
    iconCircleBg: "bg-green-100 dark:bg-green-900/50",
    iconColor: "text-green-700 dark:text-green-300",
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
    iconCircleBg: "bg-purple-100 dark:bg-purple-900/50",
    iconColor: "text-purple-700 dark:text-purple-300",
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
    iconCircleBg: "bg-rose-100 dark:bg-rose-900/50",
    iconColor: "text-rose-600 dark:text-rose-300",
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
    iconCircleBg: "bg-amber-100 dark:bg-amber-900/50",
    iconColor: "text-amber-700 dark:text-amber-300",
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
    iconCircleBg: "bg-emerald-100 dark:bg-emerald-900/50",
    iconColor: "text-emerald-700 dark:text-emerald-300",
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
    iconCircleBg: "bg-cyan-100 dark:bg-cyan-900/50",
    iconColor: "text-cyan-700 dark:text-cyan-300",
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
    iconCircleBg: "bg-orange-100 dark:bg-orange-900/50",
    iconColor: "text-orange-700 dark:text-orange-300",
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
    iconCircleBg: "bg-slate-200/80 dark:bg-slate-800",
    iconColor: "text-slate-700 dark:text-slate-300",
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

export interface ChartSeriesItem {
  id: string;
  label: string;
  defaultColor: string;
}

export const MULTI_SERIES_CHART_CONFIG: Partial<Record<GraphType, ChartSeriesItem[]>> = {
  "multi-line": [
    { id: "zoneA", label: "Line 1", defaultColor: "#9D61FF" },
    { id: "zoneB", label: "Line 2", defaultColor: "#10B981" },
  ],
  "grouped-bar": [
    { id: "actual", label: "Series 1", defaultColor: "#9D61FF" },
    { id: "target", label: "Series 2", defaultColor: "#F43F5E" },
  ],
  "combo": [
    { id: "volume", label: "Volume (Bars)", defaultColor: "#3B82F6" },
    { id: "trend", label: "Trend (Line)", defaultColor: "#F43F5E" },
  ],
  "stacked-bar": [
    { id: "civil", label: "Civil", defaultColor: "#9D61FF" },
    { id: "ppe", label: "PPE", defaultColor: "#10B981" },
    { id: "safety", label: "Safety", defaultColor: "#F59E0B" },
    { id: "risk", label: "Risk", defaultColor: "#F43F5E" },
  ],
  "donut": [
    { id: "helmets", label: "Smart Helmets", defaultColor: "#3B82F6" },
    { id: "vests", label: "Vest Hubs", defaultColor: "#10B981" },
    { id: "boots", label: "Grounding Boots", defaultColor: "#F59E0B" },
  ],
  "pie": [
    { id: "helmets", label: "Smart Helmets", defaultColor: "#3B82F6" },
    { id: "vests", label: "Vest Hubs", defaultColor: "#10B981" },
    { id: "boots", label: "Grounding Boots", defaultColor: "#F59E0B" },
  ],
  "two-segment": [
    { id: "workers", label: "Compliant Workers", defaultColor: "#10B981" },
    { id: "ppe", label: "PPE Score", defaultColor: "#3B82F6" },
    { id: "days", label: "Incident-Free Days", defaultColor: "#9D61FF" },
  ],
  "sparkline": [
    { id: "zoneA", label: "Zone A", defaultColor: "#10B981" },
    { id: "zoneB", label: "Zone B", defaultColor: "#3B82F6" },
    { id: "zoneC", label: "Zone C", defaultColor: "#F59E0B" },
  ],
  "waterfall": [
    { id: "increase", label: "Positive (+)", defaultColor: "#10B981" },
    { id: "decrease", label: "Negative (-)", defaultColor: "#F43F5E" },
    { id: "base", label: "Base / Total", defaultColor: "#64748B" },
  ],
  "treemap": [
    { id: "itemA", label: "Item A", defaultColor: "#3B82F6" },
    { id: "itemB", label: "Item B", defaultColor: "#10B981" },
    { id: "itemC", label: "Item C", defaultColor: "#F59E0B" },
    { id: "itemD", label: "Item D", defaultColor: "#F43F5E" },
  ],
  "heatmap": [
    { id: "optimal", label: "High / Optimal", defaultColor: "#10B981" },
    { id: "moderate", label: "Moderate", defaultColor: "#F59E0B" },
    { id: "risk", label: "Attention / Risk", defaultColor: "#F43F5E" },
  ],
};

export interface ThemePreset {
  name: string;
  colors: string[];
}

export const THEME_PRESETS: ThemePreset[] = [
  { name: "Vibrant", colors: ["#9D61FF", "#10B981", "#F59E0B", "#F43F5E"] },
  { name: "Ocean", colors: ["#3B82F6", "#06B6D4", "#10B981", "#8B5CF6"] },
  { name: "Sunset", colors: ["#F43F5E", "#F97316", "#F59E0B", "#9D61FF"] },
  { name: "Emerald", colors: ["#10B981", "#06B6D4", "#3B82F6", "#F59E0B"] },
];

export const getChartSeriesConfig = (chartType: GraphType, primaryColor = "#9D61FF"): ChartSeriesItem[] => {
  const custom = MULTI_SERIES_CHART_CONFIG[chartType];
  if (custom && custom.length > 0) {
    return custom.map((item, idx) => (idx === 0 ? { ...item, defaultColor: primaryColor } : item));
  }
  return [{ id: "primary", label: "Series 1", defaultColor: primaryColor }];
};


