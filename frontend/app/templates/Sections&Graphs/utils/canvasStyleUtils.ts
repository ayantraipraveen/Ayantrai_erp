import { PaletteRamp } from "@/lib/redux/slices/reportModuleSlice";

export interface CanvasMarginConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
  radius: number;
}

export const DEFAULT_CANVAS_MARGIN: CanvasMarginConfig = {
  top: 24,
  right: 24,
  bottom: 24,
  left: 24,
  radius: 24,
};

export type CanvasPaperTone = "white" | "warm" | "cool" | "dark";

export function isColorDark(hexOrColor?: string): boolean {
  if (!hexOrColor) return false;
  if (hexOrColor === "dark") return true;
  if (!hexOrColor.startsWith("#") || hexOrColor.length < 7) return false;
  const r = parseInt(hexOrColor.slice(1, 3), 16);
  const g = parseInt(hexOrColor.slice(3, 5), 16);
  const b = parseInt(hexOrColor.slice(5, 7), 16);
  const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  return luma < 135;
}

export function getPaperToneColor(paperTone?: string): string {
  switch (paperTone) {
    case "warm":
      return "#faf9f6";
    case "cool":
      return "#f8fafc";
    case "dark":
      return "#090d16";
    case "white":
    default:
      return "#ffffff";
  }
}

export const COLOR_RAMP_DOTS: { id: PaletteRamp; bg: string; label: string }[] = [
  { id: "blue", bg: "bg-blue-500", label: "Blue" },
  { id: "green", bg: "bg-emerald-500", label: "Green" },
  { id: "purple", bg: "bg-purple-500", label: "Purple" },
  { id: "amber", bg: "bg-amber-500", label: "Amber" },
  { id: "cyan", bg: "bg-cyan-500", label: "Cyan" },
  { id: "red", bg: "bg-rose-500", label: "Rose" },
  { id: "slate", bg: "bg-slate-500", label: "Slate" },
];

export const FONT_OPTIONS: { id: "sans" | "serif" | "mono" | "rounded"; label: string; previewClass: string }[] = [
  { id: "sans", label: "Inter Sans", previewClass: "font-sans" },
  { id: "serif", label: "Merriweather Serif", previewClass: "font-serif" },
  { id: "mono", label: "JetBrains Mono", previewClass: "font-mono" },
  { id: "rounded", label: "Outfit Modern", previewClass: "font-sans tracking-wide" },
];

export const CARD_BG_PRESETS: { id: string; label: string; color: string; border: string; darkBg: string }[] = [
  { id: "white", label: "Pure White", color: "#ffffff", border: "#e2e8f0", darkBg: "#0c1017" },
  { id: "slate", label: "Clean Slate", color: "#f8fafc", border: "#e2e8f0", darkBg: "#0f172a" },
  { id: "zinc", label: "Subtle Zinc", color: "#f4f4f5", border: "#e4e4e7", darkBg: "#18181b" },
  { id: "blue", label: "Soft Azure", color: "#eff6ff", border: "#bfdbfe", darkBg: "#172554" },
  { id: "purple", label: "Soft Purple", color: "#faf5ff", border: "#e9d5ff", darkBg: "#2e1065" },
  { id: "emerald", label: "Soft Mint", color: "#f0fdf4", border: "#bbf7d0", darkBg: "#064e3b" },
  { id: "amber", label: "Soft Amber", color: "#fffbeb", border: "#fde68a", darkBg: "#451a03" },
];

export const BADGE_COLOR_PALETTES = [
  { id: "blue", label: "Blue", bg: "bg-blue-500/10", border: "border-blue-400/30", text: "text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
  { id: "green", label: "Green", bg: "bg-emerald-500/10", border: "border-emerald-400/30", text: "text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
  { id: "purple", label: "Purple", bg: "bg-purple-500/10", border: "border-purple-400/30", text: "text-purple-600 dark:text-purple-300", dot: "bg-purple-500" },
  { id: "amber", label: "Amber", bg: "bg-amber-500/10", border: "border-amber-400/30", text: "text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
  { id: "rose", label: "Rose", bg: "bg-rose-500/10", border: "border-rose-400/30", text: "text-rose-600 dark:text-rose-300", dot: "bg-rose-500" },
  { id: "cyan", label: "Cyan", bg: "bg-cyan-500/10", border: "border-cyan-400/30", text: "text-cyan-600 dark:text-cyan-300", dot: "bg-cyan-500" },
] as const;

export const BADGE_COLOR_MAP: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  blue: { bg: "bg-blue-500/10", border: "border-blue-400/30", text: "text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
  green: { bg: "bg-emerald-500/10", border: "border-emerald-400/30", text: "text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
  purple: { bg: "bg-purple-500/10", border: "border-purple-400/30", text: "text-purple-600 dark:text-purple-300", dot: "bg-purple-500" },
  amber: { bg: "bg-amber-500/10", border: "border-amber-400/30", text: "text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
  rose: { bg: "bg-rose-500/10", border: "border-rose-400/30", text: "text-rose-600 dark:text-rose-300", dot: "bg-rose-500" },
  cyan: { bg: "bg-cyan-500/10", border: "border-cyan-400/30", text: "text-cyan-600 dark:text-cyan-300", dot: "bg-cyan-500" },
};
