import {
  CanvasMarginConfig,
  DEFAULT_CANVAS_MARGIN,
  CARD_BG_PRESETS,
} from "../../utils";

export type { CanvasMarginConfig };
export { DEFAULT_CANVAS_MARGIN, CARD_BG_PRESETS };

export const CARD_BORDER_PRESETS: { id: string; label: string; color: string }[] = [
  { id: "none",        label: "None",         color: "transparent" },
  { id: "slate-light", label: "Light Slate",  color: "#e2e8f0" },
  { id: "slate-dark",  label: "Muted Slate",  color: "#94a3b8" },
  { id: "purple",      label: "Purple",       color: "#c084fc" },
  { id: "blue",        label: "Royal Blue",   color: "#60a5fa" },
  { id: "emerald",     label: "Emerald",      color: "#34d399" },
  { id: "amber",       label: "Amber",        color: "#fbbf24" },
  { id: "rose",        label: "Rose",         color: "#f87171" },
  { id: "dark",        label: "Midnight",     color: "#334155" },
];

export const TEXT_COLOR_SWATCHES = [
  { hex: "#0f172a", label: "Slate Dark" },
  { hex: "#1e293b", label: "Charcoal" },
  { hex: "#475569", label: "Slate Gray" },
  { hex: "#64748b", label: "Muted Gray" },
  { hex: "#8b3dff", label: "Canva Purple" },
  { hex: "#2563eb", label: "Royal Blue" },
  { hex: "#059669", label: "Emerald Green" },
  { hex: "#d97706", label: "Amber Gold" },
  { hex: "#dc2626", label: "Crimson Red" },
  { hex: "#0891b2", label: "Cyan Teal" },
  { hex: "#4f46e5", label: "Indigo" },
  { hex: "#ffffff", label: "Pure White" },
];

export const PAPER_TONE_PRESETS: { id: string; label: string; color: string; border: string; darkBg: string }[] = [
  { id: "white",  label: "Pure White",      color: "#ffffff", border: "#cbd5e1", darkBg: "#0c1017" },
  { id: "slate",  label: "Crisp Slate",     color: "#f8fafc", border: "#94a3b8", darkBg: "#1e293b" },
  { id: "paper",  label: "Warm Cream",      color: "#faf8f5", border: "#fde68a", darkBg: "#15130f" },
  { id: "linen",  label: "Soft Linen",      color: "#f4f1ea", border: "#d6d3d1", darkBg: "#181613" },
  { id: "ice",    label: "Ice Blueprint",   color: "#f0f7ff", border: "#bfdbfe", darkBg: "#0c1322" },
  { id: "mint",   label: "Pale Mint",       color: "#f2f9f5", border: "#a7f3d0", darkBg: "#0b1812" },
  { id: "rose",   label: "Rose Quartz",     color: "#fff5f7", border: "#fbcfe8", darkBg: "#1a0c10" },
  { id: "amber",  label: "Amber Parchment", color: "#fffbeb", border: "#fef08a", darkBg: "#1a1608" },
  { id: "dark",   label: "Executive Dark",  color: "#0f172a", border: "#475569", darkBg: "#07090d" },
];

export function getPaperToneColor(tone?: string): string {
  if (!tone) return "#ffffff";
  const lower = tone.toLowerCase();
  const preset = PAPER_TONE_PRESETS.find((p) => p.id === lower);
  if (preset) return preset.color;
  if (lower === "cream") return "#faf8f5";
  if (lower.startsWith("#") || lower.startsWith("rgb") || lower.startsWith("hsl")) return tone;
  return "#ffffff";
}
