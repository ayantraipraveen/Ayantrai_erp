import {
  BADGE_COLOR_PALETTES,
  BADGE_COLOR_MAP,
  DYNAMIC_METRIC_ICONS,
  CARD_BG_PRESETS,
} from "../../../utils";
import {
  CanvasCell,
  LibraryMetricCard,
  LibraryChartCard,
  LibraryKeyInsightItem,
  CanvasBadgeStrip,
  CanvasBadgeItem,
  CanvasTextBlock,
} from "@/lib/redux/slices/reportModuleSlice";

export { BADGE_COLOR_PALETTES, BADGE_COLOR_MAP, DYNAMIC_METRIC_ICONS };

export const BADGE_AVAILABLE_ICONS = DYNAMIC_METRIC_ICONS;

export const CONTAINER_BG_PRESETS = [
  { id: "white", label: "White", value: "#ffffff", bg: "bg-white text-slate-800", border: "border-slate-300" },
  { id: "slate50", label: "Slate", value: "#f8fafc", bg: "bg-slate-50 text-slate-800", border: "border-slate-200" },
  { id: "cream", label: "Cream", value: "#fefbf6", bg: "bg-[#fefbf6] text-amber-900", border: "border-amber-200" },
  { id: "violet", label: "Violet", value: "#f5f3ff", bg: "bg-violet-50 text-violet-900", border: "border-violet-200" },
  { id: "blue", label: "Blue", value: "#f0f9ff", bg: "bg-sky-50 text-sky-900", border: "border-sky-200" },
  { id: "green", label: "Green", value: "#ecfdf5", bg: "bg-emerald-50 text-emerald-900", border: "border-emerald-200" },
  { id: "amber", label: "Amber", value: "#fffbeb", bg: "bg-amber-50 text-amber-900", border: "border-amber-200" },
  { id: "rose", label: "Rose", value: "#fff1f2", bg: "bg-rose-50 text-rose-900", border: "border-rose-200" },
  { id: "dark", label: "Dark", value: "#0f172a", bg: "bg-slate-900 text-white", border: "border-slate-700" },
  { id: "transparent", label: "None", value: "transparent", bg: "bg-transparent text-slate-500", border: "border-dashed border-slate-300" },
];

export const CONTAINER_BORDER_PRESETS = [
  { id: "slate200", label: "Default", value: "#e2e8f0", bg: "bg-slate-100 text-slate-700", border: "border-slate-300" },
  { id: "slate400", label: "Muted", value: "#94a3b8", bg: "bg-slate-200 text-slate-800", border: "border-slate-400" },
  { id: "purple300", label: "Purple", value: "#c4b5fd", bg: "bg-purple-100 text-purple-800", border: "border-purple-300" },
  { id: "sky300", label: "Blue", value: "#bae6fd", bg: "bg-sky-100 text-sky-800", border: "border-sky-300" },
  { id: "emerald300", label: "Green", value: "#a7f3d0", bg: "bg-emerald-100 text-emerald-800", border: "border-emerald-300" },
  { id: "amber300", label: "Amber", value: "#fde68a", bg: "bg-amber-100 text-amber-800", border: "border-amber-300" },
  { id: "rose300", label: "Rose", value: "#fecdd3", bg: "bg-rose-100 text-rose-800", border: "border-rose-300" },
  { id: "dark", label: "Dark", value: "#334155", bg: "bg-slate-800 text-white", border: "border-slate-700" },
  { id: "indigo", label: "Indigo", value: "#818cf8", bg: "bg-indigo-100 text-indigo-800", border: "border-indigo-300" },
  { id: "transparent", label: "None", value: "transparent", bg: "bg-transparent text-slate-500", border: "border-dashed border-slate-300" },
];

export function withAlpha(color: string, opacity: number): string {
  const alpha = Math.max(0, Math.min(100, opacity)) / 100;
  const hex = color.trim();
  if (/^#[0-9a-f]{6}$/i.test(hex)) {
    const value = parseInt(hex.slice(1), 16);
    return `rgba(${(value >> 16) & 255}, ${(value >> 8) & 255}, ${value & 255}, ${alpha})`;
  }
  if (/^#[0-9a-f]{3}$/i.test(hex)) {
    const expanded = hex.slice(1).split("").map((part) => part + part).join("");
    return withAlpha(`#${expanded}`, opacity);
  }
  const rgbaMatch = hex.match(/^rgba?\(([^)]+)\)$/i);
  if (rgbaMatch) {
    const channels = rgbaMatch[1].split(",").slice(0, 3).map((part) => part.trim());
    return `rgba(${channels.join(", ")}, ${alpha})`;
  }
  return color;
}

export function getCardBackgroundColor(style?: CanvasCell["style"]): string | undefined {
  if (!style?.cardBg) return undefined;
  const preset = (CARD_BG_PRESETS as Array<{ id: string; color: string }>).find((item) => item.id === style.cardBg);
  const color = preset?.color || style.cardBg;
  if (style.backgroundOpacity !== undefined) {
    return withAlpha(color, style.backgroundOpacity);
  }
  return color;
}

export interface BlockRendererProps {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  isForceEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onUpdateMetricCard?: (card: LibraryMetricCard) => void;
  onUpdateChart?: (chart: LibraryChartCard) => void;
  onOpenChartEditor?: () => void;
  onUpdateInsight?: (textOrInsight: string | LibraryKeyInsightItem) => void;
  onUpdateTextBlock?: (contentOrBlock: string | CanvasTextBlock) => void;
  onUpdateBadgeStrip?: (strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: () => void;
  onDeleteBadge?: (badgeId: string) => void;
}
