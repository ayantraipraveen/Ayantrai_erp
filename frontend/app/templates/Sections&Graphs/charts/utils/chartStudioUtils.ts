import { GraphType } from "@/lib/redux/slices/reportModuleSlice";

export const DEFAULT_CHART_COLORS: string[] = [
  "#9D61FF",
  "#2563eb",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#06b6d4",
  "#8b5cf6",
];

export const TELEMETRY_GRID_PRESETS = [
  { rows: 3, cols: 5, label: "3 × 5 Compact" },
  { rows: 4, cols: 7, label: "4 × 7 Standard Weekly" },
  { rows: 6, cols: 10, label: "6 × 10 Detailed Matrix" },
  { rows: 12, cols: 12, label: "12 × 12 High Density Heatmap" },
];

export function generateSampleChartData(type: GraphType): { label: string; value: number }[] {
  switch (type) {
    case "bar":
    case "stacked-bar":
      return [
        { label: "Shift A", value: 85 },
        { label: "Shift B", value: 92 },
        { label: "Shift C", value: 78 },
        { label: "Shift D", value: 96 },
      ];
    case "line":
    case "area":
      return [
        { label: "06:00", value: 45 },
        { label: "09:00", value: 88 },
        { label: "12:00", value: 94 },
        { label: "15:00", value: 91 },
        { label: "18:00", value: 82 },
        { label: "21:00", value: 65 },
      ];
    case "pie":
    case "donut":
      return [
        { label: "Compliant", value: 68 },
        { label: "Caution", value: 22 },
        { label: "Critical", value: 10 },
      ];
    case "gauge":
      return [{ label: "Compliance Index", value: 92 }];
    default:
      return [
        { label: "Point 1", value: 50 },
        { label: "Point 2", value: 75 },
        { label: "Point 3", value: 90 },
      ];
  }
}
