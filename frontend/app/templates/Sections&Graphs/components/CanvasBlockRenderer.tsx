"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ArrowUp,
  ArrowDown,
  Lightbulb,
  Minus,
  Shield,
  Clock,
  Zap,
  Users,
  Activity,
  TrendingUp,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Flame,
  HeartPulse,
  Target,
  Award,
  BarChart2,
  Pencil,
  Trash2,
  Plus,
  X,
  FileText,
  MessageSquare,
  Quote,
  HardHat,
  CheckSquare,
  SlidersHorizontal,
  ShieldCheck,
  Package,
  UserCheck,
  Settings,
  History,
  Palette,
  Search,
  RotateCcw,
  Check,
} from "lucide-react";
import {
  CanvasCell,
  CanvasBadgeItem,
  CanvasBadgeStrip,
  LibraryMetricCard,
  LibraryKeyInsightItem,
  KeyInsightBulletItem,
  KeyInsightVariant,
  LibraryChartCard,
  PaletteRamp,
} from "@/lib/redux/slices/reportModuleSlice";
import { DynamicTextEditor, renderDynamicText } from "./DynamicTitleEditor";
import { PALETTE_RAMPS } from "./constants/chartTypes";
import ChartRenderer from "./ChartComponent/ChartRenderer";
import {
  CARD_BG_PRESETS,
  BADGE_COLOR_PALETTES,
  BADGE_COLOR_MAP,
  DYNAMIC_METRIC_ICONS,
  getMetricIconComponent,
} from "../utils";

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

export function BadgeIcon({
  name,
  size = 16,
  className = "",
  color,
}: {
  name?: string;
  size?: number;
  className?: string;
  color?: string;
}) {
  const Icon = getMetricIconComponent(name);
  return (
    <Icon
      style={{
        width: `${size}px`,
        height: `${size}px`,
        color: color || undefined,
        strokeWidth: 2,
      }}
      className={className}
    />
  );
}

// ── Individual block renderers with Inline Editing ─────────────────────────────

interface BlockRendererProps {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  isForceEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onUpdateMetricCard?: (card: LibraryMetricCard) => void;
  onUpdateChart?: (chart: LibraryChartCard) => void;
  onOpenChartEditor?: () => void;
  onUpdateInsight?: (textOrInsight: string | LibraryKeyInsightItem) => void;
  onUpdateTextBlock?: (content: string) => void;
  onUpdateBadgeStrip?: (strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: () => void;
  onDeleteBadge?: (badgeId: string) => void;
}

// ── Dynamic Top Action Bar Positioning Helper ─────────────────────────────────
function calculateTopBarPosition(rect: DOMRect | null): { top: number; left: number } | null {
  if (!rect) return null;
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;
  const topNavbarHeight = 72; // Safe area below header navigation and breadcrumbs

  // If the target element is completely scrolled out of the viewport, do NOT render the floating action bar
  if (rect.bottom < topNavbarHeight + 10 || rect.top > viewportH - 20) {
    return null;
  }

  // Normal position: 44px above the top edge of the card
  let top = rect.top - 44;
  // If placing it 44px above would clip under or collide with top navbar (<= 72px):
  if (top < topNavbarHeight) {
    // If card has room, place it neatly docked just below navbar or near card top
    top = Math.max(topNavbarHeight + 4, Math.min(rect.top + 8, viewportH - 60));
  }

  // Center horizontally over card, bounded within viewport margins
  const halfBarWidth = 150;
  const left = Math.max(halfBarWidth + 16, Math.min(viewportW - halfBarWidth - 16, rect.left + rect.width / 2));

  return { top: Math.round(top), left: Math.round(left) };
}

// ── Dynamic Floating Popover Positioning Helper ──────────────────────────────
function calculateFloatingPosition(
  targetRect: DOMRect | null,
  popoverWidth = 385,
  popoverHeight = 520,
  preferredSide: "right" | "left" | "top" | "bottom" = "right"
): { top: number; left: number; placement: "right" | "left" | "top" | "bottom" } {
  const margin = 14;
  const topNavbarHeight = 72; // Never overlap top navigation header
  const viewportW = typeof window !== "undefined" ? window.innerWidth : 1200;
  const viewportH = typeof window !== "undefined" ? window.innerHeight : 900;

  if (!targetRect) {
    return {
      top: topNavbarHeight + 10,
      left: Math.max(margin, viewportW - popoverWidth - margin),
      placement: "right",
    };
  }

  const spaceOnRight = viewportW - (targetRect.right + margin);
  const spaceOnLeft = targetRect.left - margin;
  const spaceAbove = targetRect.top - topNavbarHeight - margin;
  const spaceBelow = viewportH - (targetRect.bottom + margin);

  let placement: "right" | "left" | "top" | "bottom" = preferredSide;
  let left = targetRect.right + margin;
  let top = targetRect.top;

  if (preferredSide === "right") {
    if (spaceOnRight >= popoverWidth) {
      placement = "right";
      left = targetRect.right + margin;
      top = Math.max(topNavbarHeight, Math.min(targetRect.top, viewportH - popoverHeight - margin));
    } else if (spaceOnLeft >= popoverWidth) {
      placement = "left";
      left = targetRect.left - popoverWidth - margin;
      top = Math.max(topNavbarHeight, Math.min(targetRect.top, viewportH - popoverHeight - margin));
    } else if (spaceAbove >= popoverHeight) {
      placement = "top";
      left = Math.max(margin, Math.min(targetRect.left, viewportW - popoverWidth - margin));
      top = targetRect.top - popoverHeight - margin;
    } else if (spaceBelow >= popoverHeight) {
      placement = "bottom";
      left = Math.max(margin, Math.min(targetRect.left, viewportW - popoverWidth - margin));
      top = targetRect.bottom + margin;
    } else {
      // Pick whichever side has more space
      if (spaceOnRight >= spaceOnLeft) {
        placement = "right";
        left = Math.max(margin, viewportW - popoverWidth - margin);
      } else {
        placement = "left";
        left = margin;
      }
      top = Math.max(topNavbarHeight, Math.min(targetRect.top, viewportH - popoverHeight - margin));
    }
  }

  // Strict boundary protection: ALWAYS fully inside viewport
  left = Math.max(margin, Math.min(left, viewportW - popoverWidth - margin));
  top = Math.max(topNavbarHeight, Math.min(top, viewportH - popoverHeight - margin));

  return { top: Math.round(top), left: Math.round(left), placement };
}

// ── React Portal Popover: KPI Metric Card Inspector (Anchored beside card) ───
function MetricCardInspectorPopover({
  card,
  isOpen,
  anchorRect,
  onClose,
  onUpdateCard,
}: {
  card: LibraryMetricCard;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onUpdateCard: (patch: Partial<LibraryMetricCard>) => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"content" | "colors">("content");
  const [iconSearch, setIconSearch] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (popoverRef.current?.contains(target)) return;
      if (
        target.closest(".portal-metric-card-topbar") ||
        target.closest(".group\\/metric-card")
      ) {
        return;
      }
      onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || typeof document === "undefined") return null;

  const pos = calculateFloatingPosition(anchorRect, 385, 520, "right");

  const filteredIcons = iconSearch
    ? DYNAMIC_METRIC_ICONS.filter(
        (i) =>
          i.id.toLowerCase().includes(iconSearch.toLowerCase()) ||
          i.label.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : DYNAMIC_METRIC_ICONS;

  return createPortal(
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        width: "385px",
        maxHeight: "calc(100vh - 88px)",
        zIndex: 99999,
      }}
      className="portal-metric-card-inspector flex flex-col bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#9D61FF]/15 text-[#9D61FF] flex items-center justify-center font-bold text-xs">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight">KPI Metric Inspector</h3>
            <p className="text-[9.5px] text-slate-500 dark:text-zinc-400">
              Live editing • Direct canvas effect
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="px-3 pt-2 pb-1.5">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab("content")}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "content"
                ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Content & Trend
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("colors")}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer ${
              activeTab === "colors"
                ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            Colors & Style
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-2.5 text-xs">
        {activeTab === "content" ? (
          <>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[11px]">
                  Metric Value
                </label>
                <input
                  type="text"
                  value={card.value || ""}
                  onChange={(e) => onUpdateCard({ value: e.target.value })}
                  placeholder="e.g. 98.4%"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 font-mono font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[11px]">
                  Metric Label
                </label>
                <input
                  type="text"
                  value={card.label || ""}
                  onChange={(e) => onUpdateCard({ label: e.target.value })}
                  placeholder="e.g. Compliance Rate"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[11px]">
                  Trend Indicator
                </label>
                <select
                  value={card.trendDirection || "up"}
                  onChange={(e) => onUpdateCard({ trendDirection: e.target.value as any })}
                  className="w-full px-2 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-[11px] focus:outline-none focus:border-[#9D61FF]"
                >
                  <option value="up">▲ Upward Trend</option>
                  <option value="down">▼ Downward Trend</option>
                  <option value="no-change">— Stable / Flat</option>
                </select>
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[11px]">
                  Comparison Text
                </label>
                <input
                  type="text"
                  value={card.trendValue || ""}
                  onChange={(e) => onUpdateCard({ trendValue: e.target.value })}
                  placeholder="e.g. +2.4% vs last shift"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            {/* Font Size Sliders */}
            <div className="grid grid-cols-2 gap-2 pt-0.5">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                    Value Font
                  </label>
                  <span className="font-mono text-xs font-bold text-[#9D61FF]">
                    {card.fontSizeValue || 20}px
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={36}
                  value={card.fontSizeValue || 20}
                  onChange={(e) => onUpdateCard({ fontSizeValue: Number(e.target.value) })}
                  className="w-full accent-[#9D61FF] cursor-pointer h-1"
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                    Label Font
                  </label>
                  <span className="font-mono text-xs font-bold text-[#9D61FF]">
                    {card.fontSizeLabel || 10}px
                  </span>
                </div>
                <input
                  type="range"
                  min={8}
                  max={18}
                  value={card.fontSizeLabel || 10}
                  onChange={(e) => onUpdateCard({ fontSizeLabel: Number(e.target.value) })}
                  className="w-full accent-[#9D61FF] cursor-pointer h-1"
                />
              </div>
            </div>

            {/* Card Dimensions (Height & Width) */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-semibold text-slate-700 dark:text-zinc-300 text-xs">
                  Card Sizing (Height & Width)
                </span>
                {(card.customHeight || card.customWidth) && (
                  <button
                    type="button"
                    onClick={() => onUpdateCard({ customHeight: undefined, customWidth: undefined })}
                    className="text-[10px] text-[#9D61FF] hover:underline cursor-pointer font-semibold"
                  >
                    Reset Auto
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-slate-600 dark:text-zinc-400">Card Height</span>
                    <span className="font-mono text-[11px] font-bold text-[#9D61FF]">
                      {card.customHeight ? `${card.customHeight}px` : "Auto"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min={50}
                      max={280}
                      value={card.customHeight || 90}
                      onChange={(e) => onUpdateCard({ customHeight: Number(e.target.value) })}
                      className="flex-1 accent-[#9D61FF] cursor-pointer h-1"
                    />
                    <input
                      type="number"
                      min={40}
                      max={400}
                      value={card.customHeight || ""}
                      placeholder="Auto"
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        onUpdateCard({ customHeight: val });
                      }}
                      className="w-12 px-1.5 py-0.5 text-[11px] rounded border border-slate-200 dark:border-zinc-800 text-center font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-slate-600 dark:text-zinc-400">Card Width</span>
                    <span className="font-mono text-[11px] font-bold text-[#9D61FF]">
                      {card.customWidth ? `${card.customWidth}px` : "Auto"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min={70}
                      max={360}
                      value={card.customWidth || 150}
                      onChange={(e) => onUpdateCard({ customWidth: Number(e.target.value) })}
                      className="flex-1 accent-[#9D61FF] cursor-pointer h-1"
                    />
                    <input
                      type="number"
                      min={50}
                      max={500}
                      value={card.customWidth || ""}
                      placeholder="Auto"
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        onUpdateCard({ customWidth: val });
                      }}
                      className="w-12 px-1.5 py-0.5 text-[11px] rounded border border-slate-200 dark:border-zinc-800 text-center font-mono"
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* 9 Palette Ramps */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                Card Preset Tint
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {PALETTE_RAMPS.map((ramp) => (
                  <button
                    key={ramp.id}
                    type="button"
                    onClick={() =>
                      onUpdateCard({
                        tintColor: ramp.id,
                        customBgColor: undefined,
                        customBorderColor: undefined,
                      })
                    }
                    className={`p-1.5 rounded-xl border flex items-center gap-1.5 cursor-pointer transition-all ${
                      card.tintColor === ramp.id && !card.customBgColor
                        ? "border-[#9D61FF] ring-2 ring-purple-500/30 font-bold bg-purple-50 dark:bg-purple-950/30"
                        : "border-slate-200 dark:border-zinc-800 opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div
                      className="w-3 h-3 rounded-full flex-shrink-0"
                      style={{ backgroundColor: ramp.accent }}
                    />
                    <span className="text-[10px] truncate">{ramp.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="text-[11px] text-slate-600 dark:text-zinc-400 block mb-1">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={card.customBgColor || "#ffffff"}
                    onChange={(e) => onUpdateCard({ customBgColor: e.target.value })}
                    className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={card.customBgColor || ""}
                    onChange={(e) => onUpdateCard({ customBgColor: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-600 dark:text-zinc-400 block mb-1">
                  Border Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={card.customBorderColor || "#e2e8f0"}
                    onChange={(e) => onUpdateCard({ customBorderColor: e.target.value })}
                    className="w-7 h-7 rounded-lg border border-slate-200 dark:border-zinc-800 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={card.customBorderColor || ""}
                    onChange={(e) => onUpdateCard({ customBorderColor: e.target.value })}
                    placeholder="#e2e8f0"
                    className="flex-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Icon Symbol & Shape */}
            <div className="grid grid-cols-2 gap-2.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Icon Shape
                </label>
                <div className="grid grid-cols-3 gap-1">
                  {(["circle", "rounded", "none"] as const).map((sh) => (
                    <button
                      key={sh}
                      type="button"
                      onClick={() => onUpdateCard({ iconShape: sh })}
                      className={`py-1 rounded-lg border text-[10px] font-bold capitalize transition-all cursor-pointer ${
                        (card.iconShape || "circle") === sh
                          ? "bg-[#9D61FF] text-white border-[#9D61FF]"
                          : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {sh}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">
                    Icon Size
                  </label>
                  <span className="font-mono text-xs font-bold text-[#9D61FF]">
                    {card.iconSize || 14}px
                  </span>
                </div>
                <input
                  type="range"
                  min={10}
                  max={28}
                  value={card.iconSize || 14}
                  onChange={(e) => onUpdateCard({ iconSize: Number(e.target.value) })}
                  className="w-full accent-[#9D61FF] cursor-pointer"
                />
              </div>
            </div>

            {/* Icon Picker Grid */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Icon Symbol
                </label>
                <input
                  type="text"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Filter icons..."
                  className="w-28 px-2 py-0.5 text-[10px] rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900"
                />
              </div>
              <div className="grid grid-cols-8 gap-1 p-1 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 max-h-24 overflow-y-auto">
                {filteredIcons.map((opt) => {
                  const IconComp = opt.icon;
                  const isSelected = (card.icon || "Shield") === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onUpdateCard({ icon: opt.id })}
                      className={`h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#9D61FF] text-white shadow-xs"
                          : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                      }`}
                      title={opt.label}
                    >
                      <IconComp className="w-3.5 h-3.5" />
                    </button>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end px-4 py-2.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── Complete KPI Metric Card Block ───────────────────────────────────────────
function MetricCardBlock({
  cell,
  isSelected,
  isPreview,
  onUpdateMetricCard,
  onEditingChange,
}: {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  onUpdateMetricCard?: (card: LibraryMetricCard) => void;
  onEditingChange?: (isEditing: boolean) => void;
}) {
  const card = cell.metricCard;
  const containerRef = useRef<HTMLDivElement>(null);
  const [portalCoords, setPortalCoords] = useState<{ top: number; left: number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);
  if (!card) return null;
  const ramp = PALETTE_RAMPS.find((r) => r.id === card.tintColor) || PALETTE_RAMPS[0];

  const updatePortalPos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setAnchorRect(rect);
    setPortalCoords(calculateTopBarPosition(rect));
  }, []);

  useEffect(() => {
    if (isSelected && !isPreview) {
      updatePortalPos();
      const interval = setInterval(updatePortalPos, 400);
      window.addEventListener("scroll", updatePortalPos, true);
      window.addEventListener("resize", updatePortalPos);
      return () => {
        clearInterval(interval);
        window.removeEventListener("scroll", updatePortalPos, true);
        window.removeEventListener("resize", updatePortalPos);
      };
    }
  }, [isSelected, isPreview, updatePortalPos]);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<"label" | "value" | "trend" | null>(null);
  const [localLabel, setLocalLabel] = useState(card.label);
  const [localValue, setLocalValue] = useState(card.value);
  const [localTrendVal, setLocalTrendVal] = useState(card.trendValue);

  useEffect(() => {
    setLocalLabel(card.label);
    setLocalValue(card.value);
    setLocalTrendVal(card.trendValue);
  }, [card]);

  const handleSetEditingField = (field: "label" | "value" | "trend" | null) => {
    setEditingField(field);
    onEditingChange?.(Boolean(field));
  };

  const commitCardChange = (patch: Partial<LibraryMetricCard>) => {
    if (!onUpdateMetricCard) return;
    onUpdateMetricCard({
      ...card,
      ...patch,
    });
    handleSetEditingField(null);
  };

  const cycleTrend = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPreview || !onUpdateMetricCard) return;
    const nextDir: "up" | "down" | "no-change" =
      card.trendDirection === "up"
        ? "down"
        : card.trendDirection === "down"
          ? "no-change"
          : "up";
    commitCardChange({ trendDirection: nextDir });
  };

  const renderCardIcon = (iconName?: string) => {
    const IconComp = getMetricIconComponent(iconName);
    const size = card.iconSize || 14;
    return (
      <IconComp
        style={{
          width: `${size}px`,
          height: `${size}px`,
          color: card.customIconColor || undefined,
          strokeWidth: 2,
        }}
      />
    );
  };

  // Dynamic Trend Sentiment Resolution
  const isNegativeMetric =
    card.higherIsBetter === false ||
    card.dataSourceField?.includes("damage") ||
    card.dataSourceField?.includes("overtime") ||
    card.dataSourceField?.includes("incident") ||
    card.dataSourceField?.includes("violation") ||
    card.label?.toLowerCase().includes("damage") ||
    card.label?.toLowerCase().includes("overtime");

  const resolvedTrendColor: "green" | "red" | "neutral" = card.trendColor || (
    card.trendDirection === "no-change"
      ? "neutral"
      : isNegativeMetric
        ? card.trendDirection === "up" ? "red" : "green"
        : card.trendDirection === "up" ? "green" : "red"
  );

  const trendTextColor =
    resolvedTrendColor === "red"
      ? "text-rose-600 dark:text-rose-400"
      : resolvedTrendColor === "neutral"
        ? "text-slate-500 dark:text-zinc-400"
        : "text-emerald-600 dark:text-emerald-400";

  // Dynamic Value & Unit parsing
  const formatDynamicValue = (valStr: string) => {
    const trimmed = (valStr || "").trim();
    if (!trimmed) return { num: "0", unit: card.unit || "" };
    const unitMatch = trimmed.match(/^(.*?)\s*(hrs|hr|%|min|sec|days|devices|workers)$/i);
    if (unitMatch) {
      return { num: unitMatch[1], unit: unitMatch[2] };
    }
    return { num: trimmed, unit: card.unit || "" };
  };

  const valueFontSizeClass =
    cell.style?.fontSize === "xs"
      ? "text-sm sm:text-base"
      : cell.style?.fontSize === "sm"
        ? "text-base sm:text-lg"
        : cell.style?.fontSize === "lg"
          ? "text-[22px] sm:text-[24px]"
          : cell.style?.fontSize === "xl"
            ? "text-[26px] sm:text-[28px]"
            : "text-lg sm:text-xl";

  const labelFontSizeClass =
    cell.style?.fontSize === "xs"
      ? "text-[9px]"
      : cell.style?.fontSize === "sm"
        ? "text-[9.5px]"
        : cell.style?.fontSize === "lg"
          ? "text-[11px]"
          : cell.style?.fontSize === "xl"
            ? "text-[12px]"
            : "text-[9.5px] sm:text-[10px]";

  const customPx = cell.style?.customFontSize ?? cell.style?.fontSizeCustom;

  const defaultValFontSize =
    card.fontSizeValue ||
    customPx ||
    (cell.style?.fontSize === "xs" ? 16 : cell.style?.fontSize === "sm" ? 18 : cell.style?.fontSize === "lg" ? 24 : cell.style?.fontSize === "xl" ? 28 : 20);

  const cardContainerStyle: React.CSSProperties = {
    width: card.customWidth ? `${card.customWidth}px` : "100%",
    height: card.customHeight ? `${card.customHeight}px` : (cell.customHeight ? `${cell.customHeight}px` : "100%"),
    minHeight: card.customHeight ? `${card.customHeight}px` : (cell.customHeight ? `${cell.customHeight}px` : 0),
    maxWidth: "100%",
    backgroundColor: card.customBgColor || undefined,
    borderColor: card.customBorderColor || undefined,
    borderWidth: card.customBorderWidth !== undefined ? `${card.customBorderWidth}px` : undefined,
    borderRadius: card.customBorderRadius !== undefined ? `${card.customBorderRadius}px` : undefined,
    padding: card.customPadding !== undefined ? `${card.customPadding}px` : undefined,
  };

  const iconContainerSize =
    card.iconShape === "none"
      ? (card.iconSize || 14)
      : Math.max(24, (card.iconSize || 14) + 10);

  const iconShapeClass =
    card.iconShape === "rounded"
      ? "rounded-xl"
      : card.iconShape === "none"
        ? "bg-transparent p-0 shadow-none border-0"
        : "rounded-full";

  return (
    <>
      <div
        ref={containerRef}
        style={cardContainerStyle}
        className={`group/metric-card relative w-full h-full min-h-0 rounded-xl border p-2 transition-all duration-200 select-none flex flex-col justify-between overflow-hidden ${
          !card.customBgColor ? `${ramp.bgLight} ${ramp.bgDark}` : ""
        } ${
          !card.customBorderColor ? `${ramp.borderLight} ${ramp.borderDark}` : ""
        } ${editingField ? "z-50" : "z-10"}`}
      >
        {/* Top Right Quick Edit Button */}
        {!isPreview && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsEditModalOpen(true);
            }}
            className="opacity-0 group-hover/metric-card:opacity-100 p-1 text-slate-400 hover:text-[#9D61FF] transition-opacity cursor-pointer rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800/60 absolute top-1.5 right-1.5 z-20"
            title="Edit Metric Card properties (React Portal)"
          >
            <Pencil className="w-3 h-3" />
          </button>
        )}
        <div>
          {/* Icon Badge */}
          <div
            style={{
              width: `${iconContainerSize}px`,
              height: `${iconContainerSize}px`,
              backgroundColor: card.customIconBg || undefined,
            }}
            className={`${iconShapeClass} flex items-center justify-center shrink-0 mb-0.5 shadow-none ${!card.customIconBg && card.iconShape !== "none" ? (ramp.iconCircleBg || "bg-blue-100 dark:bg-blue-900/50") : ""
              } ${!card.customIconColor ? (ramp.iconColor || "text-blue-600 dark:text-blue-300") : ""
              }`}
          >
            {renderCardIcon(card.icon)}
          </div>

          {/* Label (inline editable on double click) */}
          <div
            style={{
              color: card.customTextColor || undefined,
              fontSize: card.fontSizeLabel ? `${card.fontSizeLabel}px` : undefined,
            }}
            className={`${labelFontSizeClass} font-bold text-slate-800 dark:text-zinc-200 ${editingField === "label" ? "" : "line-clamp-2 sm:line-clamp-1"
              } leading-tight mb-0.5`}
          >
            {!isPreview && editingField === "label" ? (
              <DynamicTextEditor
                initialValue={card.label}
                initialHtml={(card as any).labelHtml}
                defaultFontSize={card.fontSizeLabel || 11.5}
                className="font-bold leading-tight"
                onSave={(plain, html) => {
                  commitCardChange({ label: plain, labelHtml: html } as any);
                }}
                onCancel={() => handleSetEditingField(null)}
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  if (isPreview) return;
                  e.stopPropagation();
                  handleSetEditingField("label");
                }}
                title={!isPreview ? "Double-click to format label (Word style)" : undefined}
                className={!isPreview ? "hover:underline hover:decoration-dotted cursor-text" : ""}
              >
                {renderDynamicText((card as any).labelHtml, card.label)}
              </span>
            )}
          </div>

          {/* Primary Value (inline editable on double click) */}
          <div
            style={{
              color: card.customValueColor || undefined,
              fontSize: card.fontSizeValue ? `${card.fontSizeValue}px` : (customPx ? `${customPx}px` : undefined),
            }}
            className={`${valueFontSizeClass} font-black tracking-tight leading-none text-slate-900 dark:text-white my-0.5 flex items-baseline gap-1`}
          >
            {!isPreview && editingField === "value" ? (
              <DynamicTextEditor
                initialValue={card.value}
                initialHtml={(card as any).valueHtml}
                defaultFontSize={defaultValFontSize}
                className="font-black"
                onSave={(plain, html) => {
                  commitCardChange({ value: plain, valueHtml: html } as any);
                }}
                onCancel={() => handleSetEditingField(null)}
              />
            ) : (
              <span
                onDoubleClick={(e) => {
                  if (isPreview) return;
                  e.stopPropagation();
                  handleSetEditingField("value");
                }}
                title={!isPreview ? "Double-click to format value (Word style)" : undefined}
                className={!isPreview ? "hover:underline hover:decoration-dotted cursor-text" : ""}
              >
                {(() => {
                  const hasCustomHtml = Boolean((card as any).valueHtml && (card as any).valueHtml.includes("<"));
                  if (hasCustomHtml) {
                    return renderDynamicText((card as any).valueHtml, card.value);
                  }

                  const { num, unit } = formatDynamicValue(card.value);
                  if (unit) {
                    return (
                      <>
                        <span>{num}</span>
                        <span className="text-xs sm:text-sm font-bold text-slate-700 dark:text-zinc-300 ml-0.5">{unit}</span>
                      </>
                    );
                  }
                  return renderDynamicText((card as any).valueHtml, card.value);
                })()}
              </span>
            )}
          </div>
        </div>

        {/* Trend Row */}
        <div className="pt-0.5 flex flex-col gap-0">
          <div className="flex items-center gap-1 flex-wrap">
            <button
              type="button"
              onClick={cycleTrend}
              title={!isPreview ? "Click to cycle trend: Up → Down → Neutral" : undefined}
              className={`inline-flex items-center gap-0.5 text-[10px] sm:text-[10.5px] font-bold font-sans transition-transform ${trendTextColor} ${!isPreview ? "hover:scale-105 cursor-pointer" : ""
                }`}
            >
              {card.trendDirection === "up" && <span>▲</span>}
              {card.trendDirection === "down" && <span>▼</span>}
              {card.trendDirection === "no-change" && <span>—</span>}

              {!isPreview && editingField === "trend" ? (
                <div onClick={(e) => e.stopPropagation()} className="min-w-[80px] max-w-full">
                  <DynamicTextEditor
                    initialValue={card.trendValue}
                    initialHtml={(card as any).trendValueHtml}
                    defaultFontSize={11}
                    className="text-[11px] font-bold"
                    onSave={(plain, html) => {
                      commitCardChange({ trendValue: plain, trendValueHtml: html } as any);
                    }}
                    onCancel={() => handleSetEditingField(null)}
                  />
                </div>
              ) : (
                <span
                  onDoubleClick={(e) => {
                    if (isPreview) return;
                    e.stopPropagation();
                    handleSetEditingField("trend");
                  }}
                  title={!isPreview ? "Double-click to format trend text (Word style)" : undefined}
                >
                  {renderDynamicText((card as any).trendValueHtml, card.trendValue)}
                </span>
              )}
            </button>

            {/* Subtitle e.g. "vs. last month" */}
            {card.trendSubtitle && !card.trendSubtitle.includes("(Lower is better)") && (
              <span className="text-[9.5px] sm:text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                {card.trendSubtitle}
              </span>
            )}
            {!card.trendSubtitle && (
              <span className="text-[9.5px] sm:text-[10px] text-slate-400 dark:text-zinc-500 font-normal">
                vs. last month
              </span>
            )}
          </div>

          {(card.trendSubtitle?.includes("(Lower is better)") || (isNegativeMetric && card.trendDirection === "down")) && (
            <div className="text-[9px] text-slate-400 dark:text-zinc-500 font-medium leading-none">
              (Lower is better)
            </div>
          )}
        </div>
      </div>

      {/* ── React Portal: Top Action Bar for Single KPI Metric Card ── */}
      {isSelected && !isPreview && portalCoords && typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${portalCoords.top}px`,
              left: `${portalCoords.left}px`,
              transform: "translateX(-50%)",
              zIndex: 99999,
            }}
            className="portal-metric-card-topbar flex items-center gap-1.5 bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="text-[10px] font-mono font-bold text-[#9D61FF] px-2 py-0.5 rounded-full bg-[#9D61FF]/10">
              KPI Metric
            </span>

            {/* Edit Card Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#9D61FF] hover:bg-[#8B4CF0] text-white font-bold text-[11px] shadow-xs transition-colors cursor-pointer"
              title="Edit Metric Card Properties (React Portal)"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit Card</span>
            </button>

            <div className="w-px h-3.5 bg-slate-200 dark:border-zinc-800 mx-0.5" />

            {/* Cycle Trend Button */}
            <button
              type="button"
              onClick={cycleTrend}
              className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 text-[11px] font-medium transition-colors cursor-pointer"
              title="Click to cycle trend (Up / Down / Neutral)"
            >
              <span className="text-[#9D61FF] font-bold">
                {card.trendDirection === "up" ? "▲ Up" : card.trendDirection === "down" ? "▼ Down" : "— Flat"}
              </span>
            </button>
          </div>,
          document.body
        )
      }

      {/* React Portal: Anchored Metric Card Inspector (Beside Card) */}
      {isEditModalOpen && (
        <MetricCardInspectorPopover
          card={card}
          isOpen={isEditModalOpen}
          anchorRect={anchorRect}
          onClose={() => setIsEditModalOpen(false)}
          onUpdateCard={(patch) => commitCardChange(patch)}
        />
      )}
    </>
  );
}

function ChartBlock({
  cell,
  isPreview,
  onOpenChartEditor,
  onUpdateChart,
  onEditingChange,
}: {
  cell: CanvasCell;
  isPreview?: boolean;
  onOpenChartEditor?: () => void;
  onUpdateChart?: (chart: LibraryChartCard) => void;
  onEditingChange?: (isEditing: boolean) => void;
}) {
  const chart = cell.chart;
  if (!chart) return null;
  const customHeight = cell.customHeight;
  const style = cell.style || {};

  // Dynamic responsive scaling based on customHeight and customWidth
  const isUltraCompact = customHeight !== undefined && customHeight < 200;
  const isCompact = (customHeight !== undefined && customHeight < 280) || isUltraCompact;

  const fontSize = style.fontSize || "base";
  const titleSizeClass = isUltraCompact
    ? "text-xs font-bold leading-tight"
    : isCompact
      ? "text-xs sm:text-sm font-bold leading-snug"
      : fontSize === "xs"
        ? "text-xs font-bold"
        : fontSize === "sm"
          ? "text-sm font-bold"
          : fontSize === "lg"
            ? "text-base sm:text-lg font-bold"
            : fontSize === "xl"
              ? "text-lg sm:text-xl font-bold"
              : "text-sm sm:text-base font-bold";

  const subtitleSizeClass =
    isUltraCompact || fontSize === "xs" || fontSize === "sm"
      ? "text-[9px]"
      : isCompact
        ? "text-[9.5px]"
        : fontSize === "lg" || fontSize === "xl"
          ? "text-xs"
          : "text-[10px]";

  const descSizeClass = isUltraCompact
    ? "text-[9px] leading-tight line-clamp-1"
    : isCompact
      ? "text-[10px] leading-snug line-clamp-1"
      : fontSize === "xs"
        ? "text-[10px] line-clamp-2"
        : fontSize === "sm"
          ? "text-[11px] line-clamp-2"
          : fontSize === "lg"
            ? "text-xs sm:text-sm line-clamp-2"
            : fontSize === "xl"
              ? "text-sm line-clamp-2"
              : "text-[11px] sm:text-xs leading-relaxed line-clamp-2";

  const hasTitle = Boolean(chart.title && chart.title.trim());
  const pClass = isUltraCompact
    ? "p-2 gap-1"
    : isCompact
      ? "p-2.5 sm:p-3 gap-1.5"
      : "p-4 gap-2";

  // Compute accurate overhead budget so child NEVER overflows the card
  const padOverhead = isUltraCompact ? 16 : isCompact ? 22 : 32;
  const titleOverhead = hasTitle ? (isUltraCompact ? 18 : isCompact ? 22 : 28) : 0;
  const descOverhead = chart.description ? (isUltraCompact ? 16 : isCompact ? 20 : 30) : 0;
  const totalOverhead = padOverhead + titleOverhead + descOverhead;

  const chartAreaHeight = customHeight
    ? Math.max(50, customHeight - totalOverhead)
    : undefined;

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(chart.title || "");
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [localDesc, setLocalDesc] = useState(chart.description || "");

  const handleSetEditingTitle = (editing: boolean) => {
    setIsEditingTitle(editing);
    onEditingChange?.(editing || isEditingDesc);
  };

  const handleSetEditingDesc = (editing: boolean) => {
    setIsEditingDesc(editing);
    onEditingChange?.(isEditingTitle || editing);
  };

  useEffect(() => {
    setLocalTitle(chart.title || "");
  }, [chart.title]);

  useEffect(() => {
    setLocalDesc(chart.description || "");
  }, [chart.description]);

  const handleTitleCommit = () => {
    handleSetEditingTitle(false);
    const trimmed = localTitle.trim();
    if (trimmed !== (chart.title || "").trim() && onUpdateChart) {
      onUpdateChart({ ...chart, title: trimmed });
    }
  };

  const handleDescCommit = () => {
    handleSetEditingDesc(false);
    const trimmed = localDesc.trim();
    if (trimmed !== (chart.description || "").trim() && onUpdateChart) {
      onUpdateChart({ ...chart, description: trimmed });
    }
  };

  return (
    <div
      style={customHeight ? { height: `${customHeight}px`, maxHeight: "100%" } : { maxHeight: "100%" }}
      className={`relative group/chart w-full max-h-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] ${pClass} flex flex-col justify-between overflow-hidden`}
    >
      {/* Configure & Edit Data Button - Clean overlay in top right on hover */}
      {!isPreview && onOpenChartEditor && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onOpenChartEditor();
          }}
          className="absolute top-2.5 right-2.5 z-10 opacity-0 group-hover/chart:opacity-100 transition-opacity flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#9D61FF] text-white hover:bg-purple-600 cursor-pointer"
          title="Configure Chart, Data Points & Axis"
        >
          <SlidersHorizontal className="w-3 h-3" />
          <span>Edit Data</span>
        </button>
      )}

      {/* Chart Title (if present or currently editing) */}
      {(hasTitle || (isEditingTitle && !isPreview)) && (
        <div className="flex items-start justify-between gap-3 flex-shrink-0 pr-16">
          <div className="min-w-0 flex-1">
            {isEditingTitle && !isPreview ? (
              <input
                type="text"
                autoFocus
                value={localTitle}
                onChange={(e) => setLocalTitle(e.target.value)}
                onBlur={handleTitleCommit}
                onClick={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  e.stopPropagation();
                  if (e.key === "Enter") handleTitleCommit();
                  if (e.key === "Escape") {
                    setLocalTitle(chart.title || "");
                    handleSetEditingTitle(false);
                  }
                }}
                className={`${titleSizeClass} text-slate-900 dark:text-white bg-purple-500/10 border border-[#9D61FF] rounded px-1.5 py-0.5 outline-none w-full`}
              />
            ) : (
              <h3
                onDoubleClick={() => !isPreview && handleSetEditingTitle(true)}
                title={!isPreview ? "Double click to rename or clear chart title" : undefined}
                className={`${titleSizeClass} text-slate-900 dark:text-white tracking-tight truncate ${!isPreview ? "cursor-text hover:text-[#9D61FF] transition-colors" : ""
                  }`}
              >
                {chart.title}
              </h3>
            )}
          </div>
        </div>
      )}

      <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden py-0.5">
        <ChartRenderer
          chart={chart}
          color={chart.color || chart.colors?.[0]}
          colors={chart.colors}
          gridRows={chart.gridRows}
          gridCols={chart.gridCols}
          height={chartAreaHeight}
          fontSize={fontSize}
          customFontSize={style.customFontSize}
        />
      </div>
      {chart.description && (
        isEditingDesc && !isPreview ? (
          <input
            type="text"
            autoFocus
            value={localDesc}
            onChange={(e) => setLocalDesc(e.target.value)}
            onBlur={handleDescCommit}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              e.stopPropagation();
              if (e.key === "Enter") handleDescCommit();
              if (e.key === "Escape") {
                setLocalDesc(chart.description || "");
                handleSetEditingDesc(false);
              }
            }}
            className={`${descSizeClass} font-medium text-slate-700 dark:text-zinc-300 bg-purple-500/10 border border-[#9D61FF] rounded px-1.5 py-0.5 outline-none w-full`}
          />
        ) : (
          <p
            onDoubleClick={() => !isPreview && handleSetEditingDesc(true)}
            title={!isPreview ? "Double click to edit description / caption" : undefined}
            className={`${descSizeClass} text-slate-500 dark:text-zinc-400 ${isCompact ? "pt-1" : "pt-1.5"} border-t border-slate-100 dark:border-zinc-800/80 leading-relaxed flex-shrink-0 ${!isPreview ? "cursor-text hover:text-[#9D61FF] transition-colors" : ""
              }`}
          >
            {chart.description}
          </p>
        )
      )}
    </div>
  );
}

const BADGE_NUM_COLORS: Record<string, string> = {
  green: "bg-[#10b981] text-white",
  blue: "bg-[#3b82f6] text-white",
  purple: "bg-[#8b5cf6] text-white",
  orange: "bg-[#f97316] text-white",
  red: "bg-[#ef4444] text-white",
  amber: "bg-[#f59e0b] text-white",
  emerald: "bg-[#059669] text-white",
  mint: "bg-[#059669] text-white",
  cyan: "bg-[#0ea5e9] text-white",
  sky: "bg-[#0284c7] text-white",
  teal: "bg-[#10b981] text-white",
};

function InsightBlock({
  cell,
  isPreview,
  isForceEditing,
  onEditingChange,
  onUpdateInsight,
  style,
}: {
  cell: CanvasCell;
  isPreview?: boolean;
  isForceEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onUpdateInsight?: (textOrInsight: string | LibraryKeyInsightItem) => void;
  style?: React.CSSProperties;
}) {
  const insight = cell.insight;
  if (!insight) return null;

  const variant: KeyInsightVariant = insight.variant || "single";
  const [editingTarget, setEditingTarget] = useState<string | null>(null);

  const startEdit = (target: string) => {
    if (isPreview) return;
    setEditingTarget(target);
    onEditingChange?.(true);
  };

  const finishEdit = () => {
    setEditingTarget(null);
    onEditingChange?.(false);
  };

  const handleUpdate = (patch: Partial<LibraryKeyInsightItem>) => {
    if (!onUpdateInsight) return;
    onUpdateInsight({
      ...insight,
      ...patch,
    });
  };

  const handleItemTextUpdate = (itemId: string, newText: string) => {
    const updated = (insight.items || []).map((it) => (it.id === itemId ? { ...it, text: newText } : it));
    handleUpdate({ items: updated });
    finishEdit();
  };

  const handleItemTitleUpdate = (itemId: string, newTitle: string) => {
    const updated = (insight.items || []).map((it) => (it.id === itemId ? { ...it, title: newTitle } : it));
    handleUpdate({ items: updated });
    finishEdit();
  };

  const handleAddItem = (defaultItem: Partial<KeyInsightBulletItem>) => {
    const ts = Date.now();
    const count = (insight.items?.length || 0) + 1;
    const newItem: KeyInsightBulletItem = {
      id: `kib-${ts}`,
      num: count,
      color: count === 1 ? "green" : count === 2 ? "blue" : count === 3 ? "purple" : "orange",
      title: defaultItem.title || `Observation ${count}`,
      text: defaultItem.text || "New observation recorded during monitoring.",
      subItems: defaultItem.subItems || [],
      ...defaultItem,
    };
    handleUpdate({ items: [...(insight.items || []), newItem] });
  };

  const handleDeleteItem = (itemId: string) => {
    const updated = (insight.items || []).filter((it) => it.id !== itemId);
    handleUpdate({ items: updated });
  };

  const dynamicBorderRadius =
    cell.style?.borderRadius !== undefined
      ? typeof cell.style.borderRadius === "number"
        ? `${cell.style.borderRadius}px`
        : cell.style.borderRadius === "none"
          ? "0px"
          : cell.style.borderRadius === "sm"
            ? "6px"
            : cell.style.borderRadius === "md"
              ? "10px"
              : cell.style.borderRadius === "lg"
                ? "16px"
                : cell.style.borderRadius === "xl"
                  ? "20px"
                  : cell.style.borderRadius === "2xl"
                    ? "24px"
                    : cell.style.borderRadius === "full"
                      ? "9999px"
                      : cell.style.borderRadius
      : undefined;

  const dynamicBoxShadow = "none";

  // ── 1. 4-Column Numbered Key Insights Grid (Page 5, 6, 7, 8) ────────────────
  if (variant === "columns-numbered") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 sm:p-5 space-y-3.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              {editingTarget === "title" && !isPreview ? (
                <DynamicTextEditor
                  initialValue={insight.title || "Key Insights"}
                  defaultFontSize={14}
                  className="text-sm font-black text-[#1e3a8a] dark:text-blue-400"
                  onSave={(plain) => {
                    handleUpdate({ title: plain });
                    finishEdit();
                  }}
                  onCancel={finishEdit}
                />
              ) : (
                <div
                  onDoubleClick={() => startEdit("title")}
                  title={!isPreview ? "Double-click to edit title" : undefined}
                  className="cursor-text"
                >
                  <h3 className="text-sm sm:text-base font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none">
                    {insight.title || "Key Insights"}
                  </h3>
                  <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-1" />
                </div>
              )}
            </div>
          </div>

          {!isPreview && (
            <button
              type="button"
              onClick={() => handleAddItem({})}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/50 flex items-center gap-1 cursor-pointer transition-colors"
              title="Add another insight column"
            >
              <Plus className="w-3 h-3" />
              <span>Add Column</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 md:divide-x divide-slate-100 dark:divide-zinc-800/80">
          {(insight.items || []).map((item, idx) => {
            const badgeColorClass =
              BADGE_NUM_COLORS[item.color || ""] ||
              (idx % 4 === 0 ? "bg-[#10b981] text-white" : idx % 4 === 1 ? "bg-[#3b82f6] text-white" : idx % 4 === 2 ? "bg-[#8b5cf6] text-white" : "bg-[#f97316] text-white");
            const isItemEditing = editingTarget === `item-${item.id}`;

            return (
              <div
                key={item.id}
                className={`relative group/item flex items-start gap-2.5 ${idx > 0 ? "md:pl-3.5" : ""}`}
              >
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${badgeColorClass}`}>
                  {item.num ?? idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {isItemEditing && !isPreview ? (
                    <DynamicTextEditor
                      initialValue={item.text}
                      initialHtml={item.text}
                      defaultFontSize={12}
                      multiline={true}
                      toolbarPosition="top"
                      className="text-xs leading-relaxed"
                      onSave={(_plain, html) => handleItemTextUpdate(item.id, html)}
                      onCancel={finishEdit}
                    />
                  ) : (
                    <div
                      onDoubleClick={() => startEdit(`item-${item.id}`)}
                      title={!isPreview ? "Double-click to format text (Word style)" : undefined}
                      className={`text-xs text-slate-700 dark:text-zinc-300 leading-relaxed select-text ${!isPreview ? "hover:bg-blue-500/5 rounded p-0.5 cursor-text transition-colors" : ""}`}
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  )}
                </div>

                {!isPreview && (insight.items?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteItem(item.id);
                    }}
                    className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 transition-opacity cursor-pointer absolute -top-1.5 -right-1"
                    title="Remove this bullet"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 2. 4-Column Titled Key Insights (Page 10, 11) ───────────────────────────
  if (variant === "columns-titled") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 sm:p-5 space-y-3.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <Lightbulb className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none">
                {insight.title || "Key Insights"}
              </h3>
              <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-1" />
            </div>
          </div>
          {!isPreview && (
            <button
              type="button"
              onClick={() => handleAddItem({ title: "New Focus Area" })}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/50 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-3 h-3" /> Add Column
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 md:divide-x divide-slate-100 dark:divide-zinc-800/80">
          {(insight.items || []).map((item, idx) => {
            const badgeColorClass =
              BADGE_NUM_COLORS[item.color || ""] ||
              (idx % 4 === 0 ? "bg-[#10b981] text-white" : idx % 4 === 1 ? "bg-[#3b82f6] text-white" : idx % 4 === 2 ? "bg-[#f97316] text-white" : "bg-[#ef4444] text-white");
            const isEditingTitle = editingTarget === `title-${item.id}`;
            const isEditingText = editingTarget === `text-${item.id}`;

            return (
              <div key={item.id} className={`relative group/item flex items-start gap-2.5 ${idx > 0 ? "md:pl-3.5" : ""}`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0 mt-0.5 ${badgeColorClass}`}>
                  {item.num ?? idx + 1}
                </span>

                <div className="flex-1 min-w-0 space-y-1">
                  {isEditingTitle && !isPreview ? (
                    <DynamicTextEditor
                      initialValue={item.title || ""}
                      defaultFontSize={12}
                      className="text-xs font-black text-[#1e3a8a] dark:text-blue-400"
                      onSave={(plain) => handleItemTitleUpdate(item.id, plain)}
                      onCancel={finishEdit}
                    />
                  ) : (
                    <h4
                      onDoubleClick={() => startEdit(`title-${item.id}`)}
                      title={!isPreview ? "Double-click to edit title" : undefined}
                      className={`text-xs font-black text-[#1e3a8a] dark:text-blue-400 leading-snug cursor-text ${!isPreview ? "hover:underline hover:decoration-dotted" : ""}`}
                    >
                      {item.title}
                    </h4>
                  )}

                  {isEditingText && !isPreview ? (
                    <DynamicTextEditor
                      initialValue={item.text}
                      initialHtml={item.text}
                      defaultFontSize={11}
                      multiline={true}
                      toolbarPosition="top"
                      className="text-xs leading-relaxed"
                      onSave={(_plain, html) => handleItemTextUpdate(item.id, html)}
                      onCancel={finishEdit}
                    />
                  ) : (
                    <div
                      onDoubleClick={() => startEdit(`text-${item.id}`)}
                      title={!isPreview ? "Double-click to format text (Word style)" : undefined}
                      className={`text-xs text-slate-600 dark:text-zinc-300 leading-relaxed select-text ${!isPreview ? "hover:bg-blue-500/5 rounded p-0.5 cursor-text transition-colors" : ""}`}
                      dangerouslySetInnerHTML={{ __html: item.text }}
                    />
                  )}
                </div>

                {!isPreview && (insight.items?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="opacity-0 group-hover/item:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 transition-opacity cursor-pointer absolute -top-1.5 -right-1"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 3. Key Takeaways Numbered Badge List (Page 3) ───────────────────────────
  if (variant === "vertical-takeaways") {
    const takeawayFontSizeClass =
      cell.style?.fontSize === "xs"
        ? "text-[8px] leading-[1.2]"
        : cell.style?.fontSize === "sm"
          ? "text-[8.5px] leading-[1.2]"
          : cell.style?.fontSize === "lg"
            ? "text-[10px] leading-snug"
            : cell.style?.fontSize === "xl"
              ? "text-[11px] leading-relaxed"
              : "text-[8.5px] sm:text-[9px] leading-[1.25]";

    return (
      <div
        className="w-full h-auto min-h-fit rounded-xl border border-slate-200/80 dark:border-zinc-800 bg-[#f8fafc]/90 dark:bg-[#0c1017] px-3.5 py-1.5 space-y-0.5 overflow-hidden shadow-none"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1 mb-1 border-b border-slate-200/80 dark:border-zinc-800">
          <div className="flex items-center gap-1.5">
            <div className="w-4 h-4 rounded bg-[#2563eb] text-white flex items-center justify-center font-bold shrink-0">
              <FileText className="w-2.5 h-2.5" />
            </div>
            <div>
              <h3 className="text-[11px] sm:text-xs font-black text-[#0f172a] dark:text-blue-400 tracking-tight leading-none">
                {insight.title || "Key Takeaways"}
              </h3>
            </div>
          </div>
          {!isPreview && (
            <button
              type="button"
              onClick={() => handleAddItem({ title: "New Metric" })}
              className="text-[9px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/50 flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Plus className="w-2.5 h-2.5" /> Add Takeaway
            </button>
          )}
        </div>

        <div className="space-y-[2px]">
          {(insight.items || []).map((item, idx) => {
            const defaultColors = [
              "bg-[#3b82f6] text-white",
              "bg-[#10b981] text-white",
              "bg-[#8b5cf6] text-white",
              "bg-[#ef4444] text-white",
              "bg-[#059669] text-white",
              "bg-[#f59e0b] text-white",
              "bg-[#0ea5e9] text-white",
              "bg-[#10b981] text-white",
            ];
            const badgeColorClass =
              BADGE_NUM_COLORS[item.color || ""] ||
              defaultColors[idx % defaultColors.length];
            const isEditing = editingTarget === `item-${item.id}`;

            return (
              <div key={item.id} className={`relative group/row flex items-start gap-1.5 ${takeawayFontSizeClass} text-slate-700 dark:text-zinc-300 py-[1px]`}>
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7.5px] font-black shrink-0 mt-[1px] ${badgeColorClass}`}>
                  {item.num ?? idx + 1}
                </span>

                <div className="flex-1 min-w-0">
                  {isEditing && !isPreview ? (
                    <DynamicTextEditor
                      initialValue={item.text}
                      initialHtml={item.text}
                      defaultFontSize={9}
                      multiline={true}
                      toolbarPosition="top"
                      className="text-[9px] leading-tight"
                      onSave={(_plain, html) => handleItemTextUpdate(item.id, html)}
                      onCancel={finishEdit}
                    />
                  ) : (
                    <div
                      onDoubleClick={() => startEdit(`item-${item.id}`)}
                      title={!isPreview ? "Double-click to format takeaway (Word style)" : undefined}
                      className={`select-text ${!isPreview ? "hover:bg-blue-500/5 rounded px-0.5 py-0 cursor-text transition-colors" : ""}`}
                    >
                      {item.title && <b className="text-slate-900 dark:text-white mr-1 font-bold">{item.title}:</b>}
                      <span dangerouslySetInnerHTML={{ __html: item.text }} />
                    </div>
                  )}
                </div>

                {!isPreview && (insight.items?.length || 0) > 1 && (
                  <button
                    type="button"
                    onClick={() => handleDeleteItem(item.id)}
                    className="opacity-0 group-hover/row:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 transition-opacity cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 4. Narrative Key Insights Multi-Paragraph (Page 4) ──────────────────────
  if (variant === "narrative-summary") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 space-y-3.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center gap-2.5 pb-1.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none">
              {insight.title || "Key Insights"}
            </h3>
            <div className="w-10 h-0.5 bg-blue-600 rounded-full mt-1" />
          </div>
        </div>

        <div className="flex-1 min-w-0">
          {!isPreview && editingTarget === "narrative" ? (
            <DynamicTextEditor
              initialValue={insight.text}
              initialHtml={insight.text}
              defaultFontSize={12}
              multiline={true}
              toolbarPosition="top"
              className="text-xs leading-relaxed space-y-2"
              onSave={(_plain, html) => {
                handleUpdate({ text: html });
                finishEdit();
              }}
              onCancel={finishEdit}
            />
          ) : (
            <div
              onDoubleClick={() => startEdit("narrative")}
              title={!isPreview ? "Double-click to edit narrative commentary (Word style)" : undefined}
              className={`text-xs text-slate-700 dark:text-zinc-300 leading-relaxed select-text space-y-2.5 ${!isPreview ? "hover:bg-blue-500/5 rounded p-1 cursor-text transition-colors" : ""}`}
              dangerouslySetInnerHTML={{ __html: insight.text }}
            />
          )}
        </div>
      </div>
    );
  }

  // ── 5. Split Remarks & Quote Block (Page 17) ────────────────────────────────
  if (variant === "split-quote") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-10 gap-6 items-center">
          <div className="lg:col-span-7 space-y-2.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
                <MessageSquare className="w-3.5 h-3.5" />
              </div>
              <h3 className="text-sm font-black text-[#1e3a8a] dark:text-blue-400">
                {insight.title || "3. Operational Remarks"}
              </h3>
            </div>

            {!isPreview && editingTarget === "text" ? (
              <DynamicTextEditor
                initialValue={insight.text}
                initialHtml={insight.text}
                defaultFontSize={12}
                multiline={true}
                toolbarPosition="top"
                className="text-xs leading-relaxed"
                onSave={(_plain, html) => {
                  handleUpdate({ text: html });
                  finishEdit();
                }}
                onCancel={finishEdit}
              />
            ) : (
              <div
                onDoubleClick={() => startEdit("text")}
                title={!isPreview ? "Double-click to edit remarks" : undefined}
                className={`text-xs text-slate-700 dark:text-zinc-300 leading-relaxed select-text ${!isPreview ? "hover:bg-blue-500/5 rounded p-1 cursor-text transition-colors" : ""}`}
                dangerouslySetInnerHTML={{ __html: insight.text }}
              />
            )}
          </div>

          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-zinc-800 pt-4 lg:pt-0 lg:pl-6 space-y-2">
            <span className="text-3xl font-serif font-black text-blue-500 dark:text-blue-400 leading-none block">“</span>
            {!isPreview && editingTarget === "quote" ? (
              <DynamicTextEditor
                initialValue={insight.quote?.text || ""}
                defaultFontSize={12}
                multiline={true}
                toolbarPosition="top"
                className="font-serif italic text-xs leading-relaxed"
                onSave={(plain) => {
                  handleUpdate({ quote: { ...insight.quote, text: plain } });
                  finishEdit();
                }}
                onCancel={finishEdit}
              />
            ) : (
              <p
                onDoubleClick={() => startEdit("quote")}
                title={!isPreview ? "Double-click to edit quote" : undefined}
                className={`font-serif italic text-xs text-blue-950 dark:text-blue-200 font-semibold leading-relaxed cursor-text ${!isPreview ? "hover:bg-blue-500/5 rounded p-1" : ""}`}
              >
                {insight.quote?.text || "A safer site is not an accident. It is the result of consistent action, responsible teams and data-driven decisions."}
              </p>
            )}
            <div className="w-8 h-0.5 bg-blue-600 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  // ── 6. Executive Quote Card (Page 5, 17, 18) ────────────────────────────────
  if (variant === "quote-card") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-blue-200/60 dark:border-blue-900/40 bg-gradient-to-br from-blue-50/60 via-white to-sky-50/40 dark:from-blue-950/30 dark:via-zinc-950 dark:to-zinc-900 p-6 flex flex-col justify-between relative overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <span className="text-3xl font-serif font-black text-blue-400/80 leading-none">“</span>
        <div className="py-2 px-4 text-center">
          {!isPreview && editingTarget === "quote" ? (
            <DynamicTextEditor
              initialValue={insight.text}
              defaultFontSize={14}
              multiline={true}
              toolbarPosition="top"
              className="font-serif italic text-sm sm:text-base font-semibold text-center text-blue-950 dark:text-blue-200"
              onSave={(plain) => {
                handleUpdate({ text: plain });
                finishEdit();
              }}
              onCancel={finishEdit}
            />
          ) : (
            <blockquote
              onDoubleClick={() => startEdit("quote")}
              title={!isPreview ? "Double-click to edit quote" : undefined}
              className={`font-serif italic text-sm sm:text-base font-bold text-blue-950 dark:text-blue-200 leading-relaxed cursor-text ${!isPreview ? "hover:bg-blue-500/5 rounded p-2" : ""}`}
            >
              {insight.text || "Consistent attendance builds safer sites and stronger teams."}
            </blockquote>
          )}
          <div className="w-10 h-0.5 bg-blue-600 rounded-full mx-auto mt-3" />
        </div>
        <span className="text-3xl font-serif font-black text-blue-400/80 leading-none self-end rotate-180">“</span>
      </div>
    );
  }

  // ── 7. Campaign Vision Banner (Page 17) ─────────────────────────────────────
  if (variant === "vision-banner") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-blue-200/80 dark:border-blue-900/50 bg-gradient-to-r from-blue-50 via-sky-50 to-indigo-50/50 dark:from-blue-950/40 dark:via-zinc-950 dark:to-zinc-900 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 relative overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-full bg-blue-900 text-white flex items-center justify-center shrink-0">
            <HardHat className="w-6 h-6" />
          </div>
          <div className="w-px h-10 bg-blue-600/40 hidden sm:block shrink-0" />
          <div>
            <h3 className="text-base sm:text-lg font-black text-[#1e3a8a] dark:text-blue-300 leading-tight">
              {insight.banner?.headline || insight.title || "Turning Insights into a Safer Tomorrow"}
            </h3>
            <p className="text-xs text-sky-700 dark:text-sky-400 font-semibold mt-0.5">
              {insight.banner?.subtitle || insight.text || "Continuous monitoring. Clearer actions. Safer workplaces."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-blue-200/60 dark:border-zinc-700 text-xs font-bold text-blue-900 dark:text-blue-200">
            <Shield className="w-3.5 h-3.5 text-blue-600" />
            <span>People Safer</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-blue-200/60 dark:border-zinc-700 text-xs font-bold text-blue-900 dark:text-blue-200">
            <BarChart2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Sites Smarter</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/80 dark:bg-zinc-800/80 border border-blue-200/60 dark:border-zinc-700 text-xs font-bold text-blue-900 dark:text-blue-200">
            <Users className="w-3.5 h-3.5 text-blue-600" />
            <span>Operations Stronger</span>
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className="font-serif italic font-black text-sm text-blue-950 dark:text-blue-200">
            {insight.banner?.tagline || "Every Worker Returns Home Safe"}
          </div>
          <div className="w-12 h-0.5 bg-blue-600 rounded-full ml-auto mt-1" />
        </div>
      </div>
    );
  }

  // ── 8. Key Factors / Risk Bullets (Page 8) ──────────────────────────────────
  if (variant === "risk-factors") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/40 dark:bg-rose-950/20 p-4 space-y-2.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1 border-b border-rose-100 dark:border-rose-900/40">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            <h4 className="text-xs font-bold text-rose-800 dark:text-rose-300">
              {insight.title || "Key Factors"}
            </h4>
          </div>
          {!isPreview && (
            <button
              type="button"
              onClick={() => handleAddItem({ color: "red", text: "New critical risk observation" })}
              className="text-[10px] font-bold text-rose-600 hover:text-rose-700 bg-rose-100/60 dark:bg-rose-900/40 px-2 py-0.5 rounded border border-rose-300/50 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          )}
        </div>
        <div className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
          {(insight.items || []).map((item) => (
            <div key={item.id} className="relative group/risk flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0 mt-1.5" />
              <div
                onDoubleClick={() => startEdit(`item-${item.id}`)}
                className={`flex-1 select-text ${!isPreview ? "hover:bg-rose-500/10 rounded px-1 cursor-text" : ""}`}
              >
                {editingTarget === `item-${item.id}` && !isPreview ? (
                  <DynamicTextEditor
                    initialValue={item.text}
                    defaultFontSize={12}
                    className="text-xs"
                    onSave={(plain) => handleItemTextUpdate(item.id, plain)}
                    onCancel={finishEdit}
                  />
                ) : (
                  <span>{item.text}</span>
                )}
              </div>
              {!isPreview && (insight.items?.length || 0) > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="opacity-0 group-hover/risk:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 9. Key Observations Dot Bullets (Page 9) ────────────────────────────────
  if (variant === "bullet-observations") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 space-y-2.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <BarChart2 className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs font-bold text-blue-900 dark:text-blue-300">
              {insight.title || "Key Observations"}
            </h4>
          </div>
          {!isPreview && (
            <button
              type="button"
              onClick={() => handleAddItem({ color: "blue", text: "New operational observation" })}
              className="text-[10px] font-bold text-blue-600 hover:text-blue-700 bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 flex items-center gap-1 cursor-pointer"
            >
              <Plus className="w-3 h-3" /> Add
            </button>
          )}
        </div>
        <div className="space-y-1.5 text-xs text-slate-700 dark:text-zinc-300">
          {(insight.items || []).map((item) => (
            <div key={item.id} className="relative group/obs flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
              <div
                onDoubleClick={() => startEdit(`item-${item.id}`)}
                className={`flex-1 select-text ${!isPreview ? "hover:bg-blue-500/10 rounded px-1 cursor-text" : ""}`}
              >
                {editingTarget === `item-${item.id}` && !isPreview ? (
                  <DynamicTextEditor
                    initialValue={item.text}
                    defaultFontSize={12}
                    className="text-xs"
                    onSave={(plain) => handleItemTextUpdate(item.id, plain)}
                    onCancel={finishEdit}
                  />
                ) : (
                  <span>{item.text}</span>
                )}
              </div>
              {!isPreview && (insight.items?.length || 0) > 1 && (
                <button
                  type="button"
                  onClick={() => handleDeleteItem(item.id)}
                  className="opacity-0 group-hover/obs:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── 10. Priority Actions 5 Steps (Page 18) ──────────────────────────────────
  if (variant === "priority-actions") {
    return (
      <div
        className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 space-y-3.5 overflow-hidden"
        style={{ borderRadius: dynamicBorderRadius, boxShadow: "none", ...style }}
      >
        <div className="flex items-center justify-between pb-1.5 border-b border-slate-100 dark:border-zinc-800">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold">
              <CheckSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-black text-[#1e3a8a] dark:text-blue-400 tracking-tight leading-none">
                {insight.title || "2. Priority Actions for Next Month"}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {insight.text || "Key actions to address identified improvement areas."}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {(insight.items || []).map((item, idx) => {
            const badgeColorClass =
              BADGE_NUM_COLORS[item.color || ""] ||
              (idx === 0 ? "bg-blue-600 text-white" : idx === 1 ? "bg-emerald-600 text-white" : idx === 2 ? "bg-amber-600 text-white" : idx === 3 ? "bg-purple-600 text-white" : "bg-rose-600 text-white");

            return (
              <div key={item.id} className="rounded-xl border border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-900/40 p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${badgeColorClass}`}>
                    {String(item.num ?? idx + 1).padStart(2, "0")}
                  </span>
                </div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  {item.title}
                </h5>
                {item.subItems && item.subItems.length > 0 && (
                  <ul className="space-y-1 text-[11px] text-slate-600 dark:text-zinc-400 leading-snug">
                    {item.subItems.map((sub, sIdx) => (
                      <li key={sIdx} className="flex items-start gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                        <span>{sub}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ── 11. Default / Single Callout Bullet ──────────────────────────────────────
  return (
    <div
      className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 flex items-start gap-3.5 overflow-hidden"
      style={{
        borderRadius: dynamicBorderRadius,
        boxShadow: "none",
        ...style,
      }}
    >
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#9D61FF] to-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lightbulb className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        {!isPreview && (editingTarget === "single" || isForceEditing) ? (
          <DynamicTextEditor
            initialValue={insight.text}
            initialHtml={insight.text}
            defaultFontSize={12}
            multiline={true}
            toolbarPosition="top"
            className="text-xs leading-relaxed"
            placeholder="Key operational observation..."
            onSave={(_plain, html) => {
              handleUpdate({ text: html });
              finishEdit();
            }}
            onCancel={finishEdit}
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              if (isPreview) return;
              e.stopPropagation();
              startEdit("single");
            }}
            title={!isPreview ? "Double-click to format observation (Word style)" : undefined}
            className={`text-xs text-slate-700 dark:text-zinc-300 leading-relaxed select-text ${!isPreview ? "hover:bg-purple-500/5 rounded p-0.5 cursor-text transition-colors" : ""}`}
            dangerouslySetInnerHTML={{ __html: insight.text }}
          />
        )}
      </div>
    </div>
  );
}

function TextBlock({
  cell,
  isPreview,
  isForceEditing,
  onEditingChange,
  onUpdateTextBlock,
  style,
}: {
  cell: CanvasCell;
  isPreview?: boolean;
  isForceEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
  onUpdateTextBlock?: (content: string) => void;
  style?: React.CSSProperties;
}) {
  const tb = cell.textBlock;
  if (!tb) return null;

  const [isEditing, setIsEditing] = useState(false);
  const activeEditing = isEditing || isForceEditing;

  useEffect(() => {
    if (isForceEditing) {
      setIsEditing(true);
    }
  }, [isForceEditing]);

  const handleStartEditing = () => {
    if (isPreview || activeEditing) return;
    setIsEditing(true);
    if (onEditingChange) onEditingChange(true);
  };

  const handleFinishEditing = () => {
    setIsEditing(false);
    if (onEditingChange) onEditingChange(false);
  };

  // Compute dynamic card background & border from cell.style or passed style
  const cardBgPreset = cell.style?.cardBg ? CARD_BG_PRESETS.find((p) => p.id === cell.style?.cardBg) : undefined;
  const rawBgColor = cardBgPreset?.color || cell.style?.cardBg;
  const dynamicBg = rawBgColor
    ? cell.style?.backgroundOpacity !== undefined
      ? withAlpha(rawBgColor, cell.style.backgroundOpacity)
      : rawBgColor
    : undefined;

  const dynamicBorderColor =
    cell.style?.borderColor === "none" || cell.style?.borderColor === "transparent"
      ? "transparent"
      : cell.style?.borderColor || cardBgPreset?.border;

  const dynamicBorderWidth =
    cell.style?.borderWidth !== undefined
      ? `${cell.style.borderWidth}px`
      : cell.style?.borderStyle === "none" || cell.style?.borderColor === "transparent" || cell.style?.borderColor === "none"
        ? "0px"
        : undefined;

  const dynamicBorderStyle = cell.style?.borderStyle || undefined;

  const dynamicBorderRadius =
    cell.style?.borderRadius !== undefined
      ? typeof cell.style.borderRadius === "number"
        ? `${cell.style.borderRadius}px`
        : cell.style.borderRadius === "none"
          ? "0px"
          : cell.style.borderRadius === "sm"
            ? "6px"
            : cell.style.borderRadius === "md"
              ? "10px"
              : cell.style.borderRadius === "lg"
                ? "16px"
                : cell.style.borderRadius === "xl"
                  ? "20px"
                  : cell.style.borderRadius === "2xl"
                    ? "24px"
                    : cell.style.borderRadius === "full"
                      ? "9999px"
                      : cell.style.borderRadius
      : undefined;

  const dynamicBoxShadow = "none";

  const isContentEmpty =
    !tb.content ||
    tb.content.trim() === "" ||
    tb.content.includes("Empty text block") ||
    tb.content === "<p><br></p>" ||
    tb.content === "<br>";

  const contentToEdit = isContentEmpty ? "" : tb.content;

  return (
    <div
      onDoubleClick={(e) => {
        if (!isPreview && !activeEditing) {
          e.stopPropagation();
          handleStartEditing();
        }
      }}
      className={`w-full h-full flex-1 min-h-0 rounded-2xl border p-4 transition-all duration-150 flex flex-col ${!activeEditing ? "cursor-text hover:border-purple-300 dark:hover:border-purple-700/60" : ""
        } ${!dynamicBg ? "bg-slate-50/70 dark:bg-zinc-900/50" : ""
        } ${!dynamicBorderColor ? "border-slate-200 dark:border-zinc-800" : ""}`}
      style={{
        backgroundColor: dynamicBg,
        borderColor: dynamicBorderColor,
        borderWidth: dynamicBorderWidth,
        borderStyle: dynamicBorderStyle,
        borderRadius: dynamicBorderRadius,
        boxShadow: dynamicBoxShadow,
        ...style,
      }}
    >
      {!isPreview && activeEditing ? (
        <DynamicTextEditor
          initialValue={contentToEdit}
          initialHtml={contentToEdit}
          defaultFontSize={14}
          multiline={true}
          toolbarPosition="top"
          editorBorderColor={dynamicBorderColor && dynamicBorderColor !== "transparent" ? dynamicBorderColor : undefined}
          editorBgColor={dynamicBg}
          className="text-sm leading-relaxed w-full h-full min-h-[60px] flex-1"
          placeholder="Empty text block — click to type content."
          onSave={(_plain, html) => {
            if (onUpdateTextBlock) {
              onUpdateTextBlock(html);
            }
            handleFinishEditing();
          }}
          onCancel={handleFinishEditing}
        />
      ) : (
        <div
          title={!isPreview ? "Double-click to format text block (Word style)" : undefined}
          onDoubleClick={(e) => {
            if (isPreview) return;
            e.stopPropagation();
            handleStartEditing();
          }}
          className="w-full h-full min-h-[60px] flex-1 select-text leading-relaxed text-sm text-slate-800 dark:text-zinc-200 overflow-y-auto"
          dangerouslySetInnerHTML={{
            __html: isContentEmpty
              ? "<p class='text-sm text-slate-400 italic'>Empty text block — double click to type content.</p>"
              : tb.content,
          }}
        />
      )}
    </div>
  );
}




// ── React Portal Popover: Metric Badge Strip Inspector (Anchored beside card) ──
function BadgeStripInspectorPopover({
  strip,
  selectedBadgeId,
  activeTab,
  onTabChange,
  onSelectBadgeId,
  isOpen,
  anchorRect,
  onClose,
  onUpdateSingleBadge,
  onUpdateBadgeStrip,
  onAddBadge,
  onDeleteBadge,
}: {
  strip: CanvasBadgeStrip;
  selectedBadgeId: string | null;
  activeTab: "badge" | "layout";
  onTabChange: (tab: "badge" | "layout") => void;
  onSelectBadgeId: (id: string) => void;
  isOpen: boolean;
  anchorRect: DOMRect | null;
  onClose: () => void;
  onUpdateSingleBadge: (badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onUpdateBadgeStrip: (strip: CanvasBadgeStrip) => void;
  onAddBadge?: () => void;
  onDeleteBadge?: (badgeId: string) => void;
}) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [iconSearch, setIconSearch] = useState("");
  const activeBadge = strip.badges.find((b) => b.id === selectedBadgeId) || strip.badges[0];
  const activeBadgeIdx = strip.badges.findIndex((b) => b.id === (activeBadge?.id || selectedBadgeId));

  useEffect(() => {
    if (!isOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (popoverRef.current?.contains(target)) return;
      if (
        target.closest(".portal-strip-top-actions") ||
        target.closest(".group\\/badge-strip") ||
        target.closest(".group\\/single-badge")
      ) {
        return;
      }
      onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !activeBadge || typeof document === "undefined") return null;

  const pos = calculateFloatingPosition(anchorRect, 385, 520, "right");

  const filteredIcons = iconSearch
    ? DYNAMIC_METRIC_ICONS.filter(
        (i) =>
          i.id.toLowerCase().includes(iconSearch.toLowerCase()) ||
          i.label.toLowerCase().includes(iconSearch.toLowerCase())
      )
    : DYNAMIC_METRIC_ICONS;

  return createPortal(
    <div
      ref={popoverRef}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.stopPropagation()}
      style={{
        position: "fixed",
        top: `${pos.top}px`,
        left: `${pos.left}px`,
        width: "385px",
        maxHeight: "calc(100vh - 88px)",
        zIndex: 99999,
      }}
      className="portal-badge-strip-inspector flex flex-col bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-2xl shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto overflow-hidden animate-in fade-in zoom-in-95 duration-100"
    >
      {/* Header (Pinned) */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#9D61FF]/15 text-[#9D61FF] flex items-center justify-center font-bold text-xs">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </div>
          <div>
            <h3 className="text-xs font-bold leading-tight">Metric Strip Inspector</h3>
            <p className="text-[9.5px] text-slate-500 dark:text-zinc-400">
              Live editing • Direct canvas effect
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Inside Badge Switcher Bar (Pinned) */}
      <div className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-slate-50/50 dark:bg-zinc-900/50 border-b border-slate-200 dark:border-zinc-800 overflow-x-auto no-scrollbar">
        {strip.badges.map((b, idx) => {
          const isCurrent = (selectedBadgeId || strip.badges[0]?.id) === b.id;
          return (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                onSelectBadgeId(b.id);
                if (activeTab !== "badge") onTabChange("badge");
              }}
              className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isCurrent
                  ? "bg-[#9D61FF] text-white shadow-xs font-bold"
                  : "bg-white dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-[#9D61FF] border border-slate-200 dark:border-zinc-700"
              }`}
            >
              <span className="opacity-70">#{idx + 1}</span>
              <span className="truncate max-w-[80px]">{b.label || b.value}</span>
            </button>
          );
        })}
        {strip.badges.length < 8 && (
          <button
            type="button"
            onClick={() => onAddBadge?.()}
            className="flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 hover:bg-emerald-500/20 whitespace-nowrap cursor-pointer transition-colors"
            title="Add metric card"
          >
            <Plus className="w-2.5 h-2.5" />
            <span>Add</span>
          </button>
        )}
      </div>

      {/* Sub Tabs (Pinned) */}
      <div className="shrink-0 px-3.5 pt-2 pb-1.5">
        <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-zinc-800 rounded-xl">
          <button
            type="button"
            onClick={() => onTabChange("badge")}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "badge"
                ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <Pencil className="w-3 h-3" />
            <span>Card Properties</span>
          </button>
          <button
            type="button"
            onClick={() => onTabChange("layout")}
            className={`flex-1 py-1 text-[11px] font-bold rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "layout"
                ? "bg-white dark:bg-zinc-900 text-[#9D61FF] shadow-xs"
                : "text-slate-500 hover:text-slate-800 dark:hover:text-white"
            }`}
          >
            <SlidersHorizontal className="w-3 h-3" />
            <span>Strip Layout</span>
          </button>
        </div>
      </div>

      {/* Scrollable Body */}
      <div className="flex-1 overflow-y-auto px-3.5 py-2 space-y-2.5 text-xs">
        {activeTab === "badge" ? (
          <>
            {/* Value & Label */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[11px]">
                  Card Value
                </label>
                <input
                  type="text"
                  value={activeBadge.value}
                  onChange={(e) => onUpdateSingleBadge(activeBadge.id, { value: e.target.value })}
                  placeholder="e.g. 98.7%"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 font-mono font-bold text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[11px]">
                  Card Label
                </label>
                <input
                  type="text"
                  value={activeBadge.label}
                  onChange={(e) => onUpdateSingleBadge(activeBadge.id, { label: e.target.value })}
                  placeholder="e.g. Attendance"
                  className="w-full px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            {/* Color Palette Ramps */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1 text-[11px]">
                Badge Color Palette
              </label>
              <div className="grid grid-cols-5 gap-1.5">
                {BADGE_COLOR_PALETTES.map((pal) => (
                  <button
                    key={pal.id}
                    type="button"
                    onClick={() =>
                      onUpdateSingleBadge(activeBadge.id, {
                        color: pal.id as any,
                        customBgColor: undefined,
                        customBorderColor: undefined,
                        customTextColor: undefined,
                        customIconColor: undefined,
                      })
                    }
                    className={`h-7.5 rounded-lg flex items-center justify-center border transition-all cursor-pointer ${pal.bg} ${pal.border} ${
                      activeBadge.color === pal.id && !activeBadge.customBgColor
                        ? "ring-2 ring-[#9D61FF] scale-105"
                        : "opacity-80 hover:opacity-100"
                    }`}
                  >
                    <span className={`w-3 h-3 rounded-full ${pal.dot}`} />
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Colors */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10.5px] text-slate-600 dark:text-zinc-400 block mb-0.5">
                  Custom Background
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={activeBadge.customBgColor || "#ffffff"}
                    onChange={(e) => onUpdateSingleBadge(activeBadge.id, { customBgColor: e.target.value })}
                    className="w-6 h-6 rounded-md border border-slate-200 dark:border-zinc-800 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeBadge.customBgColor || ""}
                    onChange={(e) => onUpdateSingleBadge(activeBadge.id, { customBgColor: e.target.value })}
                    placeholder="#ffffff"
                    className="flex-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10.5px] text-slate-600 dark:text-zinc-400 block mb-0.5">
                  Custom Border
                </label>
                <div className="flex items-center gap-1.5">
                  <input
                    type="color"
                    value={activeBadge.customBorderColor || "#e2e8f0"}
                    onChange={(e) => onUpdateSingleBadge(activeBadge.id, { customBorderColor: e.target.value })}
                    className="w-6 h-6 rounded-md border border-slate-200 dark:border-zinc-800 cursor-pointer p-0.5 bg-transparent"
                  />
                  <input
                    type="text"
                    value={activeBadge.customBorderColor || ""}
                    onChange={(e) => onUpdateSingleBadge(activeBadge.id, { customBorderColor: e.target.value })}
                    placeholder="#e2e8f0"
                    className="flex-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Single Card Sizing (Height & Width) - MOVED UP FOR IMMEDIATE VISIBILITY */}
            <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800/80">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-700 dark:text-zinc-300 text-xs">
                    Card Sizing (Card #{strip.badges.findIndex((b) => b.id === activeBadge.id) + 1})
                  </span>
                  {(activeBadge.customHeight || activeBadge.customWidth) && (
                    <span className="px-1.5 py-0.2 rounded bg-purple-100 dark:bg-purple-900/40 text-[9.5px] font-bold text-[#9D61FF]">
                      Custom
                    </span>
                  )}
                </div>
                {(activeBadge.customHeight || activeBadge.customWidth) && (
                  <button
                    type="button"
                    onClick={() => onUpdateSingleBadge(activeBadge.id, { customHeight: undefined, customWidth: undefined })}
                    className="text-[10px] text-[#9D61FF] hover:underline cursor-pointer font-semibold flex items-center gap-1"
                    title="Reset this card to auto stretch"
                  >
                    <RotateCcw className="w-2.5 h-2.5" />
                    <span>Reset Auto</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-slate-600 dark:text-zinc-400">Card Height</span>
                    <span className="font-mono text-[11px] font-bold text-[#9D61FF]">
                      {activeBadge.customHeight ? `${activeBadge.customHeight}px` : "Auto"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min={50}
                      max={280}
                      value={activeBadge.customHeight || 90}
                      onChange={(e) => onUpdateSingleBadge(activeBadge.id, { customHeight: Number(e.target.value) })}
                      className="flex-1 accent-[#9D61FF] cursor-pointer h-1.5"
                    />
                    <input
                      type="number"
                      min={40}
                      max={400}
                      value={activeBadge.customHeight ?? ""}
                      placeholder="Auto"
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        onUpdateSingleBadge(activeBadge.id, { customHeight: val });
                      }}
                      className="w-13 px-1.5 py-0.5 text-[11px] rounded border border-slate-200 dark:border-zinc-800 text-center font-mono bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[11px] text-slate-600 dark:text-zinc-400">Card Width</span>
                    <span className="font-mono text-[11px] font-bold text-[#9D61FF]">
                      {activeBadge.customWidth ? `${activeBadge.customWidth}px` : "Auto"}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="range"
                      min={60}
                      max={280}
                      value={activeBadge.customWidth || 110}
                      onChange={(e) => onUpdateSingleBadge(activeBadge.id, { customWidth: Number(e.target.value) })}
                      className="flex-1 accent-[#9D61FF] cursor-pointer h-1.5"
                    />
                    <input
                      type="number"
                      min={50}
                      max={400}
                      value={activeBadge.customWidth ?? ""}
                      placeholder="Auto"
                      onChange={(e) => {
                        const val = e.target.value ? Number(e.target.value) : undefined;
                        onUpdateSingleBadge(activeBadge.id, { customWidth: val });
                      }}
                      className="w-13 px-1.5 py-0.5 text-[11px] rounded border border-slate-200 dark:border-zinc-800 text-center font-mono bg-white dark:bg-zinc-900"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Icon Shape & Size */}
            <div className="grid grid-cols-2 gap-2.5 pt-1 border-t border-slate-200/80 dark:border-zinc-800/80">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-0.5 text-[11px]">
                  Icon Shape
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {(["circle", "rounded", "square", "none"] as const).map((sh) => (
                    <button
                      key={sh}
                      type="button"
                      onClick={() => onUpdateSingleBadge(activeBadge.id, { iconShape: sh })}
                      className={`py-1 rounded-md border text-[9.5px] font-bold capitalize transition-all cursor-pointer ${
                        (activeBadge.iconShape || "rounded") === sh
                          ? "bg-[#9D61FF] text-white border-[#9D61FF]"
                          : "border-slate-200 dark:border-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {sh === "rounded" ? "Rnd" : sh}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                    Icon Size
                  </label>
                  <span className="font-mono text-xs font-bold text-[#9D61FF]">
                    {activeBadge.iconSize || 18}px
                  </span>
                </div>
                <input
                  type="range"
                  min={12}
                  max={32}
                  value={activeBadge.iconSize || 18}
                  onChange={(e) => onUpdateSingleBadge(activeBadge.id, { iconSize: Number(e.target.value) })}
                  className="w-full accent-[#9D61FF] cursor-pointer h-1.5"
                />
              </div>
            </div>

            {/* Icon Symbol Grid */}
            <div>
              <div className="flex items-center justify-between mb-0.5">
                <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                  Icon Symbol
                </label>
                <input
                  type="text"
                  value={iconSearch}
                  onChange={(e) => setIconSearch(e.target.value)}
                  placeholder="Filter icons..."
                  className="w-28 px-2 py-0.5 text-[10px] rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900"
                />
              </div>
              <div className="grid grid-cols-8 gap-1 p-1.5 bg-slate-50 dark:bg-zinc-900 rounded-xl border border-slate-200 dark:border-zinc-800 max-h-24 overflow-y-auto">
                {filteredIcons.map((opt) => {
                  const IconComp = opt.icon;
                  const isSel = (activeBadge.icon || "Shield") === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => onUpdateSingleBadge(activeBadge.id, { icon: opt.id })}
                      className={`h-6.5 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                        isSel
                          ? "bg-[#9D61FF] text-white shadow-xs"
                          : "text-slate-600 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-zinc-800"
                      }`}
                      title={opt.label}
                    >
                      <IconComp className="w-3 h-3" />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Delete current card if more than 1 */}
            {strip.badges.length > 1 && (
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => onDeleteBadge?.(activeBadge.id)}
                  className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors font-semibold text-[11px] cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove Card #{strip.badges.findIndex((b) => b.id === activeBadge.id) + 1}</span>
                </button>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Grid Columns */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block text-[11px]">
                  Grid Columns
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-slate-500">Custom:</span>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={strip.columns || 2}
                    onChange={(e) => onUpdateBadgeStrip({ ...strip, columns: Math.max(1, Math.min(12, Number(e.target.value) || 1)) })}
                    className="w-10 px-1 py-0.5 text-[11px] text-center font-bold font-mono rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                  />
                  <span className="text-[10px] text-slate-400">cols</span>
                </div>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[1, 2, 3, 4, 5, 6].map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => onUpdateBadgeStrip({ ...strip, columns: c })}
                    className={`py-1 rounded-lg border text-[11px] font-bold transition-all cursor-pointer ${
                      (strip.columns || 2) === c
                        ? "bg-[#9D61FF] text-white border-[#9D61FF] shadow-xs"
                        : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-700 dark:text-zinc-300"
                    }`}
                  >
                    {c} Col
                  </button>
                ))}
              </div>
            </div>

            {/* Gap & Padding Sliders */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                    Card Gap
                  </label>
                  <span className="font-mono text-xs font-bold text-[#9D61FF]">
                    {strip.gap !== undefined ? strip.gap : 12}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={strip.gap !== undefined ? strip.gap : 12}
                  onChange={(e) => onUpdateBadgeStrip({ ...strip, gap: Number(e.target.value) })}
                  className="w-full accent-[#9D61FF] cursor-pointer h-1"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-0.5">
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                    Padding
                  </label>
                  <span className="font-mono text-xs font-bold text-[#9D61FF]">
                    {strip.padding !== undefined ? strip.padding : 14}px
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={32}
                  value={strip.padding !== undefined ? strip.padding : 14}
                  onChange={(e) => onUpdateBadgeStrip({ ...strip, padding: Number(e.target.value) })}
                  className="w-full accent-[#9D61FF] cursor-pointer h-1"
                />
              </div>
            </div>

            {/* Transparent Container Toggle */}
            <div className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between">
              <div>
                <div className="font-semibold text-slate-800 dark:text-zinc-200 text-xs">
                  Transparent Container
                </div>
                <div className="text-[9.5px] text-slate-500 dark:text-zinc-400">
                  Removes outer card background & border
                </div>
              </div>
              <button
                type="button"
                onClick={() => onUpdateBadgeStrip({ ...strip, isTransparent: !strip.isTransparent })}
                className={`w-9 h-5 rounded-full transition-colors p-0.5 cursor-pointer relative ${
                  strip.isTransparent ? "bg-[#9D61FF]" : "bg-slate-300 dark:bg-zinc-700"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform ${
                    strip.isTransparent ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Border Radius & Border Width */}
            {!strip.isTransparent && (
              <div className="space-y-2.5 pt-0.5">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                        Radius
                      </label>
                      <span className="font-mono text-xs font-bold text-[#9D61FF]">
                        {strip.borderRadius !== undefined ? strip.borderRadius : 16}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={32}
                      value={strip.borderRadius !== undefined ? strip.borderRadius : 16}
                      onChange={(e) => onUpdateBadgeStrip({ ...strip, borderRadius: Number(e.target.value) })}
                      className="w-full accent-[#9D61FF] cursor-pointer h-1"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-0.5">
                      <label className="font-semibold text-slate-700 dark:text-zinc-300 text-[11px]">
                        Border
                      </label>
                      <span className="font-mono text-xs font-bold text-[#9D61FF]">
                        {strip.borderWidth !== undefined ? strip.borderWidth : 1}px
                      </span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={4}
                      value={strip.borderWidth !== undefined ? strip.borderWidth : 1}
                      onChange={(e) => onUpdateBadgeStrip({ ...strip, borderWidth: Number(e.target.value) })}
                      className="w-full accent-[#9D61FF] cursor-pointer h-1"
                    />
                  </div>
                </div>

                {/* Container Bg (Presets + Custom) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                      Container Bg
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      {strip.backgroundColor || "#ffffff"}
                    </span>
                  </div>
                  {/* Preset Swatches */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {CONTAINER_BG_PRESETS.map((p) => {
                      const isSel = (strip.backgroundColor || "#ffffff").toLowerCase() === p.value.toLowerCase();
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => onUpdateBadgeStrip({ ...strip, backgroundColor: p.value })}
                          className={`h-6.5 rounded-lg border text-[10px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-all ${p.bg} ${p.border} ${
                            isSel ? "ring-2 ring-[#9D61FF] scale-105 font-bold" : "hover:scale-102"
                          }`}
                          title={p.label}
                        >
                          <span className="truncate">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Custom Color Input */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <input
                      type="color"
                      value={strip.backgroundColor && strip.backgroundColor !== "transparent" ? strip.backgroundColor : "#ffffff"}
                      onChange={(e) => onUpdateBadgeStrip({ ...strip, backgroundColor: e.target.value })}
                      className="w-6 h-6 rounded-md border border-slate-200 dark:border-zinc-800 cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={strip.backgroundColor || ""}
                      onChange={(e) => onUpdateBadgeStrip({ ...strip, backgroundColor: e.target.value })}
                      placeholder="#ffffff or transparent"
                      className="flex-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono"
                    />
                    {strip.backgroundColor && strip.backgroundColor !== "#ffffff" && (
                      <button
                        type="button"
                        onClick={() => onUpdateBadgeStrip({ ...strip, backgroundColor: "#ffffff" })}
                        className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer font-medium"
                        title="Reset to white"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* Container Border (Presets + Custom) */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between">
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                      Container Border
                    </label>
                    <span className="text-[10px] font-mono text-slate-500">
                      {strip.borderColor || "#e2e8f0"}
                    </span>
                  </div>
                  {/* Preset Swatches */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {CONTAINER_BORDER_PRESETS.map((p) => {
                      const isSel = (strip.borderColor || "#e2e8f0").toLowerCase() === p.value.toLowerCase();
                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => onUpdateBadgeStrip({ ...strip, borderColor: p.value })}
                          className={`h-6.5 rounded-lg border text-[10px] font-medium flex items-center justify-center gap-1 cursor-pointer transition-all ${p.bg} ${p.border} ${
                            isSel ? "ring-2 ring-[#9D61FF] scale-105 font-bold" : "hover:scale-102"
                          }`}
                          title={p.label}
                        >
                          <span className="truncate">{p.label}</span>
                        </button>
                      );
                    })}
                  </div>
                  {/* Custom Color Input */}
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <input
                      type="color"
                      value={strip.borderColor && strip.borderColor !== "transparent" ? strip.borderColor : "#e2e8f0"}
                      onChange={(e) => onUpdateBadgeStrip({ ...strip, borderColor: e.target.value })}
                      className="w-6 h-6 rounded-md border border-slate-200 dark:border-zinc-800 cursor-pointer p-0.5 bg-transparent"
                    />
                    <input
                      type="text"
                      value={strip.borderColor || ""}
                      onChange={(e) => onUpdateBadgeStrip({ ...strip, borderColor: e.target.value })}
                      placeholder="#e2e8f0 or transparent"
                      className="flex-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono"
                    />
                    {strip.borderColor && strip.borderColor !== "#e2e8f0" && (
                      <button
                        type="button"
                        onClick={() => onUpdateBadgeStrip({ ...strip, borderColor: "#e2e8f0" })}
                        className="px-2 py-1 text-[10px] text-slate-500 hover:text-slate-800 dark:hover:text-zinc-200 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer font-medium"
                        title="Reset to default border"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                {/* All Cards Sizing Helper (Reset All to Auto) */}
                <div className="pt-2 border-t border-slate-200/80 dark:border-zinc-800/80">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300 text-xs">All Cards Sizing</span>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = {
                          ...strip,
                          badges: strip.badges.map((b) => ({ ...b, customHeight: undefined, customWidth: undefined })),
                        };
                        onUpdateBadgeStrip(updated);
                      }}
                      className="text-[10px] text-[#9D61FF] hover:underline cursor-pointer font-semibold flex items-center gap-1"
                    >
                      <RotateCcw className="w-2.5 h-2.5" />
                      <span>Reset All to Auto</span>
                    </button>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    Reset all cards in this strip to auto stretch so they fill the row height and column width evenly.
                  </p>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer (Pinned) */}
      <div className="shrink-0 flex items-center justify-between px-4 py-2 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/70">
        <span className="text-[10.5px] font-medium text-slate-500 dark:text-zinc-400">
          Card #{activeBadgeIdx + 1} of {strip.badges.length}
        </span>
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-1.5 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
        >
          Done
        </button>
      </div>
    </div>,
    document.body
  );
}

// ── Single Badge Item View (Clean Canvas Renderer) ─────────────────────────
function SingleBadgeItemView({
  badge,
  isInsideSelected,
  isPreview,
  onSelect,
  onUpdateBadge,
  onOpenInspector,
}: {
  badge: CanvasBadgeItem;
  isInsideSelected?: boolean;
  isPreview?: boolean;
  onSelect?: () => void;
  onUpdateBadge?: (patch: Partial<CanvasBadgeItem>) => void;
  onOpenInspector?: () => void;
}) {
  const [editingField, setEditingField] = useState<"value" | "label" | null>(null);
  const colors = BADGE_COLOR_MAP[badge.color] || BADGE_COLOR_MAP.blue;

  const cardStyle: React.CSSProperties = {
    backgroundColor: badge.customBgColor || undefined,
    borderColor: badge.customBorderColor || undefined,
    borderWidth: badge.borderWidth !== undefined ? `${badge.borderWidth}px` : undefined,
    borderStyle: badge.borderStyle || undefined,
    borderRadius: badge.borderRadius !== undefined ? `${badge.borderRadius}px` : undefined,
    padding: badge.padding !== undefined ? `${badge.padding}px` : undefined,
    width: badge.customWidth ? `${badge.customWidth}px` : "100%",
    height: badge.customHeight ? `${badge.customHeight}px` : "100%",
    minHeight: badge.customHeight ? `${badge.customHeight}px` : 0,
    maxWidth: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
  };

  const valueColorStyle: React.CSSProperties = {
    color: badge.customTextColor || undefined,
    fontSize: badge.fontSizeValue ? `${badge.fontSizeValue}px` : undefined,
  };

  const labelColorStyle: React.CSSProperties = {
    color: badge.customLabelColor || undefined,
    fontSize: badge.fontSizeLabel ? `${badge.fontSizeLabel}px` : undefined,
  };

  const iconContainerSize =
    badge.iconShape === "none"
      ? (badge.iconSize || 18)
      : Math.max(28, (badge.iconSize || 18) + 10);

  const iconShapeClass =
    badge.iconShape === "circle"
      ? "rounded-full"
      : badge.iconShape === "square"
        ? "rounded-none"
        : badge.iconShape === "none"
          ? "bg-transparent p-0 border-0 shadow-none"
          : "rounded-xl";

  const iconBoxStyle: React.CSSProperties = {
    width: `${iconContainerSize}px`,
    height: `${iconContainerSize}px`,
    backgroundColor: badge.customIconBg || undefined,
  };

  return (
    <div
      style={cardStyle}
      onMouseDown={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      onClick={(e) => {
        e.stopPropagation();
        onSelect?.();
      }}
      className={`no-drag relative rounded-2xl border p-3 flex flex-col justify-between transition-all duration-150 select-none group/single-badge cursor-pointer ${
        !badge.customWidth ? "w-full" : ""
      } ${
        !badge.customHeight ? "h-full min-h-0" : ""
      } ${
        isInsideSelected
          ? "ring-2 ring-[#9D61FF] ring-offset-2 dark:ring-offset-zinc-950 shadow-md border-[#9D61FF]"
          : "hover:border-purple-300 dark:hover:border-purple-700"
      } ${
        !badge.customBgColor ? colors.bg : ""
      } ${!badge.customBorderColor ? colors.border : ""} ${
        editingField ? "z-50" : "z-10"
      }`}
    >
      {/* Top row: Badge Icon & Edit Button */}
      <div className="flex items-start justify-between w-full">
        <div
          style={iconBoxStyle}
          className={`${iconShapeClass} flex items-center justify-center shrink-0 ${
            !badge.customIconColor ? colors.text : ""
          } ${
            !badge.customIconBg && badge.iconShape !== "none"
              ? "bg-white/50 dark:bg-zinc-800/50"
              : ""
          }`}
        >
          <BadgeIcon
            name={badge.icon}
            size={badge.iconSize || 18}
            color={badge.customIconColor}
          />
        </div>

        <div className="flex items-center gap-1">
          {/* Visual Selected Badge Indicator */}
          {isInsideSelected && (
            <div
              className="w-2.5 h-2.5 rounded-full bg-[#9D61FF] ring-2 ring-white dark:ring-zinc-900 shadow-xs pointer-events-none animate-pulse"
              title="Selected Card"
            />
          )}

          {!isPreview && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onSelect?.();
                onOpenInspector?.();
              }}
              className="opacity-0 group-hover/single-badge:opacity-100 p-1 text-slate-400 hover:text-[#9D61FF] transition-opacity cursor-pointer rounded-lg hover:bg-white/60 dark:hover:bg-zinc-800/60"
              title="Open Card Inspector"
            >
              <Pencil className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom section: Value + Label */}
      <div className="flex flex-col justify-end w-full">
        {/* Metric Value (double-click inline edit) */}
        <div
          style={valueColorStyle}
          className={`text-lg font-black font-mono leading-tight ${
            !badge.customTextColor ? colors.text : ""
          }`}
        >
          {!isPreview && editingField === "value" ? (
            <DynamicTextEditor
              initialValue={badge.value}
              initialHtml={(badge as any).valueHtml}
              defaultFontSize={badge.fontSizeValue || 18}
              className="text-lg font-black font-mono leading-tight"
              onSave={(plain, html) => {
                if (onUpdateBadge) onUpdateBadge({ value: plain, valueHtml: html } as any);
                setEditingField(null);
              }}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                if (isPreview) return;
                e.stopPropagation();
                setEditingField("value");
              }}
              title={!isPreview ? "Double-click to format value (Word style)" : undefined}
              className={!isPreview ? "hover:underline cursor-text" : ""}
            >
              {renderDynamicText((badge as any).valueHtml, badge.value)}
            </span>
          )}
        </div>

        {/* Badge Label (double-click inline edit) */}
        <div
          style={labelColorStyle}
          className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 leading-tight mt-0.5"
        >
          {!isPreview && editingField === "label" ? (
            <DynamicTextEditor
              initialValue={badge.label}
              initialHtml={(badge as any).labelHtml}
              defaultFontSize={badge.fontSizeLabel || 10}
              className="text-[10px] font-medium leading-tight"
              onSave={(plain, html) => {
                if (onUpdateBadge) onUpdateBadge({ label: plain, labelHtml: html } as any);
                setEditingField(null);
              }}
              onCancel={() => setEditingField(null)}
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                if (isPreview) return;
                e.stopPropagation();
                setEditingField("label");
              }}
              title={!isPreview ? "Double-click to format label (Word style)" : undefined}
              className={!isPreview ? "hover:underline cursor-text" : ""}
            >
              {renderDynamicText((badge as any).labelHtml, badge.label)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Clean & Authentic Badge Strip Block ───────────────────────────────────────
function BadgeStripBlock({
  cell,
  isSelected,
  isPreview,
  onUpdateBadgeStrip,
  onUpdateSingleBadge,
  onAddBadge,
  onDeleteBadge,
}: {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  onUpdateBadgeStrip?: (strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: () => void;
  onDeleteBadge?: (badgeId: string) => void;
}) {
  const strip = cell.badgeStrip;
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedBadgeId, setSelectedBadgeId] = useState<string | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorTab, setInspectorTab] = useState<"badge" | "layout">("badge");
  const [portalCoords, setPortalCoords] = useState<{ top: number; left: number } | null>(null);
  const [anchorRect, setAnchorRect] = useState<DOMRect | null>(null);

  if (!strip || !strip.badges) return null;

  const isCompact =
    (cell.customWidth !== undefined && cell.customWidth <= 60) ||
    (cell.colSpan !== undefined && cell.colSpan <= 2);

  const isTransparent = Boolean(strip.isTransparent);

  const containerStyle: React.CSSProperties = {
    padding: strip.padding !== undefined ? `${strip.padding}px` : undefined,
    borderRadius: strip.borderRadius !== undefined ? `${strip.borderRadius}px` : undefined,
    borderWidth: strip.borderWidth !== undefined ? `${strip.borderWidth}px` : undefined,
    borderColor: strip.borderColor || undefined,
    backgroundColor: isTransparent ? "transparent" : (strip.backgroundColor || undefined),
    width: "100%",
    height: "100%",
    minHeight: 0,
  };

  const colCount = strip.columns || (isCompact ? 2 : (strip.badges.length >= 4 ? 4 : strip.badges.length || 2));

  const hasAnyCustomHeight = strip.badges.some((b) => Boolean(b.customHeight));

  const gridStyle: React.CSSProperties = {
    gridTemplateColumns: `repeat(${colCount}, minmax(0, 1fr))`,
    gridAutoRows: hasAnyCustomHeight ? "minmax(min-content, 1fr)" : "1fr",
    gap: strip.gap !== undefined ? `${strip.gap}px` : "12px",
    width: "100%",
    height: "100%",
    minHeight: 0,
    alignItems: "stretch",
  };

  useEffect(() => {
    if (isSelected && strip.badges.length > 0 && !selectedBadgeId) {
      setSelectedBadgeId(strip.badges[0].id);
    }
  }, [isSelected, strip, selectedBadgeId]);

  useEffect(() => {
    if (!isSelected) {
      setIsInspectorOpen(false);
    }
  }, [isSelected]);

  const updatePortalPos = useCallback(() => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setAnchorRect(rect);
    setPortalCoords(calculateTopBarPosition(rect));
  }, []);

  useEffect(() => {
    if (isSelected && !isPreview) {
      updatePortalPos();
      const interval = setInterval(updatePortalPos, 400);
      window.addEventListener("scroll", updatePortalPos, true);
      window.addEventListener("resize", updatePortalPos);
      return () => {
        clearInterval(interval);
        window.removeEventListener("scroll", updatePortalPos, true);
        window.removeEventListener("resize", updatePortalPos);
      };
    }
  }, [isSelected, isPreview, updatePortalPos]);

  const activeBadge = strip.badges.find((b) => b.id === selectedBadgeId) || strip.badges[0];
  const activeBadgeIdx = strip.badges.findIndex((b) => b.id === (activeBadge?.id || selectedBadgeId));

  const handleAddDefaultBadge = () => {
    if (onAddBadge) {
      onAddBadge();
    } else if (onUpdateBadgeStrip) {
      const colors: Array<"blue" | "green" | "purple" | "amber" | "rose" | "cyan"> = [
        "blue", "green", "purple", "amber", "rose", "cyan"
      ];
      const newId = `badge-${Date.now()}`;
      const newBadge: CanvasBadgeItem = {
        id: newId,
        label: "New KPI",
        value: "100%",
        color: colors[strip.badges.length % colors.length],
        icon: "Shield",
      };
      const updated = {
        ...strip,
        badges: [...strip.badges, newBadge],
      };
      onUpdateBadgeStrip(updated);
      setSelectedBadgeId(newId);
    }
  };

  const handleDeleteActiveBadge = (badgeId: string) => {
    if (onDeleteBadge) {
      onDeleteBadge(badgeId);
    } else if (onUpdateBadgeStrip) {
      const updated = {
        ...strip,
        badges: strip.badges.filter((b) => b.id !== badgeId),
      };
      onUpdateBadgeStrip(updated);
      setSelectedBadgeId(updated.badges[0]?.id || null);
    }
  };

  return (
    <>
      <div
        ref={containerRef}
        style={containerStyle}
        className={`w-full h-full flex flex-col justify-between transition-all group/badge-strip relative ${
          isTransparent
            ? "bg-transparent border-0 shadow-none p-1"
            : "rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-3.5"
        }`}
      >
        <div
          style={gridStyle}
          className="grid items-stretch w-full h-full flex-1 min-h-0"
        >
          {strip.badges.map((badge: CanvasBadgeItem) => (
            <div
              key={badge.id}
              className="flex min-h-0 min-w-0"
              style={{
                width: "100%",
                height: badge.customHeight ? "auto" : "100%",
                minHeight: badge.customHeight ? `${badge.customHeight}px` : undefined,
                justifyContent: badge.customWidth ? "center" : "stretch",
                alignItems: "stretch",
              }}
            >
              <SingleBadgeItemView
                badge={badge}
                isInsideSelected={Boolean(isSelected && (selectedBadgeId === badge.id || (!selectedBadgeId && strip.badges[0]?.id === badge.id)))}
                onSelect={() => setSelectedBadgeId(badge.id)}
                onOpenInspector={() => {
                  setSelectedBadgeId(badge.id);
                  setInspectorTab("badge");
                  setIsInspectorOpen(true);
                }}
                isPreview={isPreview}
                onUpdateBadge={(patch) => {
                  if (onUpdateSingleBadge) {
                    onUpdateSingleBadge(badge.id, patch);
                  } else if (onUpdateBadgeStrip) {
                    const updated = {
                      ...strip,
                      badges: strip.badges.map((b) => (b.id === badge.id ? { ...b, ...patch } : b)),
                    };
                    onUpdateBadgeStrip(updated);
                  }
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── React Portal: Top Action Bar for Badge Strip ── */}
      {isSelected && !isPreview && portalCoords && typeof document !== "undefined" &&
        createPortal(
          <div
            onClick={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              position: "fixed",
              top: `${portalCoords.top}px`,
              left: `${portalCoords.left}px`,
              transform: "translateX(-50%)",
              zIndex: 99999,
            }}
            className="portal-strip-top-actions flex items-center gap-1.5 bg-white/98 dark:bg-[#0c1017]/98 border border-slate-200 dark:border-zinc-800 rounded-full px-2.5 py-1 shadow-2xl backdrop-blur-md text-xs select-none pointer-events-auto whitespace-nowrap animate-in fade-in zoom-in-95 duration-100"
          >
            <span className="text-[10px] font-mono font-bold text-[#9D61FF] px-2 py-0.5 rounded-full bg-[#9D61FF]/10">
              {activeBadge ? `Card #${activeBadgeIdx + 1}: ${activeBadge.label || activeBadge.value}` : `Strip • ${strip.badges.length}`}
            </span>

            {/* Edit Selected Card Button */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInspectorTab("badge");
                setIsInspectorOpen((prev) => !prev);
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full font-bold text-[11px] shadow-xs transition-colors cursor-pointer ${
                isInspectorOpen && inspectorTab === "badge"
                  ? "bg-[#8B4CF0] text-white ring-2 ring-[#9D61FF]/40"
                  : "bg-[#9D61FF] hover:bg-[#8B4CF0] text-white"
              }`}
              title="Toggle Live Card Inspector (React Portal)"
            >
              <Pencil className="w-3 h-3" />
              <span>Edit Card</span>
            </button>

            {/* Layout Settings */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setInspectorTab("layout");
                setIsInspectorOpen(true);
              }}
              className={`flex items-center gap-1 px-2 py-1 rounded-full font-semibold text-[11px] transition-colors cursor-pointer ${
                isInspectorOpen && inspectorTab === "layout"
                  ? "bg-[#9D61FF]/15 text-[#9D61FF] ring-1 ring-[#9D61FF]"
                  : "text-slate-700 dark:text-zinc-200 hover:text-[#9D61FF] hover:bg-[#9D61FF]/10"
              }`}
              title="Configure Grid Columns, Gap, Padding, & Container"
            >
              <SlidersHorizontal className="w-3 h-3 text-[#9D61FF]" />
              <span>Layout</span>
            </button>

            <div className="w-px h-3.5 bg-slate-200 dark:bg-zinc-800 mx-0.5" />

            {/* Add Badge Button */}
            {strip.badges.length < 6 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddDefaultBadge();
                }}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-slate-700 dark:text-zinc-200 hover:text-emerald-600 hover:bg-emerald-500/10 font-semibold text-[11px] transition-colors cursor-pointer"
                title="Add Another Metric Card (up to 6)"
              >
                <Plus className="w-3 h-3 text-emerald-600" />
                <span>Add</span>
              </button>
            )}

            {/* Delete Selected Badge */}
            {strip.badges.length > 1 && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (activeBadge) {
                    handleDeleteActiveBadge(activeBadge.id);
                  }
                }}
                className="p-1 rounded-full text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer ml-0.5"
                title="Remove selected metric card"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>,
          document.body
        )
      }

      {/* ── React Portal: Anchored Metric Badge Strip Inspector (Beside Card) ── */}
      {isInspectorOpen && activeBadge && (
        <BadgeStripInspectorPopover
          strip={strip}
          selectedBadgeId={selectedBadgeId || activeBadge.id}
          activeTab={inspectorTab}
          onTabChange={setInspectorTab}
          onSelectBadgeId={(id) => setSelectedBadgeId(id)}
          isOpen={isInspectorOpen}
          anchorRect={anchorRect}
          onClose={() => setIsInspectorOpen(false)}
          onUpdateSingleBadge={(badgeId, patch) => {
            if (onUpdateSingleBadge) {
              onUpdateSingleBadge(badgeId, patch);
            } else if (onUpdateBadgeStrip) {
              const updated = {
                ...strip,
                badges: strip.badges.map((b) => (b.id === badgeId ? { ...b, ...patch } : b)),
              };
              onUpdateBadgeStrip(updated);
            }
          }}
          onUpdateBadgeStrip={(updated) => {
            if (onUpdateBadgeStrip) onUpdateBadgeStrip(updated);
          }}
          onAddBadge={handleAddDefaultBadge}
          onDeleteBadge={handleDeleteActiveBadge}
        />
      )}
    </>
  );
}

function DividerBlock() {
  return (
    <div className="w-full flex items-center gap-3 py-2">
      <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-700" />
      <Minus className="w-4 h-4 text-slate-300 dark:text-zinc-600 flex-shrink-0" />
      <div className="flex-1 h-px bg-slate-200 dark:bg-zinc-700" />
    </div>
  );
}

function ElementBlock({ cell }: { cell: CanvasCell }) {
  const elem = cell.elementBlock;
  if (!elem || !elem.svgContent) {
    return (
      <div className="w-full h-full min-h-[90px] rounded-2xl border border-dashed border-slate-300 dark:border-zinc-700 bg-slate-50/50 dark:bg-zinc-900/30 flex items-center justify-center p-4 text-xs text-slate-400 font-mono">
        Empty SVG Element
      </div>
    );
  }

  const opacity = (elem.opacity ?? 100) / 100;
  const scale = (elem.scale ?? 100) / 100;
  const rotation = elem.rotation ?? 0;

  return (
    <div className="w-full h-full min-h-[90px] flex-1 flex items-center justify-center p-3 overflow-hidden select-none">
      <div
        className="w-full h-full max-w-full flex items-center justify-center transition-transform duration-100 [&>svg]:w-full [&>svg]:h-full [&>svg]:max-w-full [&>svg]:max-h-full"
        style={{
          opacity,
          transform: `rotate(${rotation}deg) scale(${scale})`,
          transformOrigin: "center center",
        }}
        dangerouslySetInnerHTML={{ __html: elem.svgContent }}
      />
    </div>
  );
}

// ── Helper to resolve CanvasCellStyle overrides ──────────────────────────────
export function getCellStyleClasses(style?: CanvasCell["style"]): {
  fontClass: string;
  fontSizeClass: string;
  alignClass: string;
  bgClass: string;
  textColorClass: string;
  styleProps: React.CSSProperties;
} {
  if (!style) return { fontClass: "", fontSizeClass: "", alignClass: "", bgClass: "", textColorClass: "", styleProps: {} };

  const fontClass =
    style.fontFamily === "serif"
      ? "font-serif"
      : style.fontFamily === "mono"
        ? "font-mono"
        : style.fontFamily === "rounded"
          ? "font-sans tracking-wide"
          : "font-sans";

  const fontSizeClass =
    style.fontSize === "xs"
      ? "text-xs"
      : style.fontSize === "sm"
        ? "text-sm"
        : style.fontSize === "lg"
          ? "text-lg"
          : style.fontSize === "xl"
            ? "text-xl"
            : "";

  const alignClass =
    style.textAlign === "center"
      ? "text-center"
      : style.textAlign === "right"
        ? "text-right"
        : "";
  const styleProps: React.CSSProperties = {};
  let bgClass = "";
  if (style.cardBg === "white") {
    bgClass = "[&>div]:bg-white dark:[&>div]:bg-[#0c1017] [&>div]:border-slate-200 dark:[&>div]:border-zinc-800";
  } else if (style.cardBg === "slate") {
    bgClass = "[&>div]:bg-slate-50 dark:[&>div]:bg-zinc-900 [&>div]:border-slate-300 dark:[&>div]:border-zinc-700";
  } else if (style.cardBg === "glass") {
    bgClass = "[&>div]:bg-white/75 dark:[&>div]:bg-zinc-900/75 [&>div]:backdrop-blur-md [&>div]:border-white/60 dark:[&>div]:border-zinc-700/60";
  } else if (style.cardBg === "purple") {
    bgClass = "[&>div]:bg-purple-50/80 dark:[&>div]:bg-purple-950/30 [&>div]:border-purple-200 dark:[&>div]:border-purple-800/40";
  } else if (style.cardBg === "indigo") {
    bgClass = "[&>div]:bg-indigo-50/80 dark:[&>div]:bg-indigo-950/30 [&>div]:border-indigo-200 dark:[&>div]:border-indigo-800/40";
  } else if (style.cardBg === "emerald") {
    bgClass = "[&>div]:bg-emerald-50/80 dark:[&>div]:bg-emerald-950/30 [&>div]:border-emerald-200 dark:[&>div]:border-emerald-800/40";
  } else if (style.cardBg === "amber") {
    bgClass = "[&>div]:bg-amber-50/80 dark:[&>div]:bg-amber-950/30 [&>div]:border-amber-200 dark:[&>div]:border-amber-800/40";
  } else if (style.cardBg === "rose") {
    bgClass = "[&>div]:bg-rose-50/80 dark:[&>div]:bg-rose-950/30 [&>div]:border-rose-200 dark:[&>div]:border-rose-800/40";
  } else if (style.cardBg === "dark") {
    bgClass = "[&>div]:bg-[#0f172a] [&>div]:text-white [&>div]:border-slate-700";
  } else if (style.cardBg?.startsWith("#") || style.cardBg?.startsWith("rgb")) {
    bgClass = "[&>div]:[background-color:inherit] [&>div]:border-slate-300/80 dark:[&>div]:border-zinc-700/80";
    styleProps.backgroundColor = style.cardBg;
  }


  if (style.borderColor) {
    if (style.borderColor === "none" || style.borderColor === "transparent") {
      styleProps.borderColor = "transparent";
      styleProps.borderWidth = "0px";
    } else {
      styleProps.borderColor = style.borderColor;
      styleProps.borderWidth = style.borderWidth !== undefined ? `${style.borderWidth}px` : "1px";
    }
  }
  if (style.borderStyle) {
    styleProps.borderStyle = style.borderStyle;
  }
  if (style.borderWidth !== undefined) {
    styleProps.borderWidth = `${style.borderWidth}px`;
    if (style.borderWidth === 0) {
      styleProps.borderStyle = "none";
    }
  }

  if (style.borderRadius !== undefined) {
    if (typeof style.borderRadius === "number") {
      styleProps.borderRadius = `${style.borderRadius}px`;
    } else {
      const RADIUS_MAP: Record<string, string> = {
        none: "0px",
        sm: "6px",
        md: "10px",
        lg: "16px",
        xl: "20px",
        "2xl": "24px",
        full: "9999px",
      };
      styleProps.borderRadius = RADIUS_MAP[style.borderRadius] || style.borderRadius;
    }
  }

  if (style.shadow) {
    styleProps.boxShadow = "none";
  }

  // Dynamic Inner Padding
  if (style.padding !== undefined) {
    styleProps.padding = `${style.padding}px`;
  } else {
    if (style.paddingTop !== undefined) styleProps.paddingTop = `${style.paddingTop}px`;
    if (style.paddingBottom !== undefined) styleProps.paddingBottom = `${style.paddingBottom}px`;
    if (style.paddingLeft !== undefined) styleProps.paddingLeft = `${style.paddingLeft}px`;
    if (style.paddingRight !== undefined) styleProps.paddingRight = `${style.paddingRight}px`;
  }

  // Dynamic Outer Margin
  if (style.margin !== undefined) {
    styleProps.margin = `${style.margin}px`;
  } else {
    if (style.marginTop !== undefined) styleProps.marginTop = `${style.marginTop}px`;
    if (style.marginBottom !== undefined) styleProps.marginBottom = `${style.marginBottom}px`;
    if (style.marginLeft !== undefined) styleProps.marginLeft = `${style.marginLeft}px`;
    if (style.marginRight !== undefined) styleProps.marginRight = `${style.marginRight}px`;
  }

  let textColorClass = "";
  if (style.textColor) {
    styleProps.color = style.textColor;
    textColorClass = "[&_p]:!text-[inherit] [&_span]:!text-[inherit] [&_h1]:!text-[inherit] [&_h2]:!text-[inherit] [&_h3]:!text-[inherit] [&_h4]:!text-[inherit]";
  }

  return { fontClass, fontSizeClass, alignClass, bgClass, textColorClass, styleProps };
}

function withAlpha(color: string, opacity: number): string {
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

function getCardBackgroundColor(style?: CanvasCell["style"]): string | undefined {
  if (!style?.cardBg) return undefined;
  const preset = CARD_BG_PRESETS.find((item) => item.id === style.cardBg);
  const color = preset?.color || style.cardBg;
  if (style.backgroundOpacity !== undefined) {
    return withAlpha(color, style.backgroundOpacity);
  }
  return color;
}


// ── Main export ───────────────────────────────────────────────────────────────
export function CanvasBlockRenderer({
  cell,
  isSelected,
  isPreview,
  isForceEditing,
  onEditingChange,
  onUpdateMetricCard,
  onUpdateChart,
  onOpenChartEditor,
  onUpdateInsight,
  onUpdateTextBlock,
  onUpdateBadgeStrip,
  onUpdateSingleBadge,
  onAddBadge,
  onDeleteBadge,
}: BlockRendererProps) {
  const { fontClass, fontSizeClass, alignClass, bgClass, textColorClass, styleProps } = getCellStyleClasses(cell.style);
  const backgroundColor = getCardBackgroundColor(cell.style);

  const renderInner = () => {
    switch (cell.blockType) {
      case "metric-card":
        return (
          <MetricCardBlock
            cell={cell}
            isSelected={isSelected}
            isPreview={isPreview}
            onUpdateMetricCard={onUpdateMetricCard}
            onEditingChange={onEditingChange}
          />
        );
      case "chart":
        return (
          <ChartBlock
            cell={cell}
            isPreview={isPreview}
            onOpenChartEditor={onOpenChartEditor}
            onUpdateChart={onUpdateChart}
            onEditingChange={onEditingChange}
          />
        );
      case "insight":
        return (
          <InsightBlock
            cell={cell}
            isPreview={isPreview}
            isForceEditing={isForceEditing}
            onEditingChange={onEditingChange}
            onUpdateInsight={onUpdateInsight}
          />
        );
      case "text":
        return (
          <TextBlock
            cell={cell}
            isPreview={isPreview}
            isForceEditing={isForceEditing}
            onEditingChange={onEditingChange}
            onUpdateTextBlock={onUpdateTextBlock}
          />
        );
      case "badge-strip":
        return (
          <BadgeStripBlock
            cell={cell}
            isSelected={isSelected}
            isPreview={isPreview}
            onUpdateBadgeStrip={onUpdateBadgeStrip}
            onUpdateSingleBadge={onUpdateSingleBadge}
            onAddBadge={onAddBadge}
            onDeleteBadge={onDeleteBadge}
          />
        );
      case "divider":
        return <DividerBlock />;
      case "element":
        return <ElementBlock cell={cell} />;
      default:
        return null;
    }
  };

  const renderedInner = renderInner();
  const cardStyles: React.CSSProperties = {};
  if (typeof cell.customHeight === "number") {
    cardStyles.minHeight = `${cell.customHeight}px`;
    if (cell.customHeight < 32) {
      cardStyles.paddingTop = Math.max(0, Math.floor(cell.customHeight / 2));
      cardStyles.paddingBottom = Math.max(0, Math.floor(cell.customHeight / 2));
    }
  }
  if (backgroundColor) cardStyles.backgroundColor = backgroundColor;
  if (styleProps.borderColor) cardStyles.borderColor = styleProps.borderColor;
  if (styleProps.borderWidth) cardStyles.borderWidth = styleProps.borderWidth;
  if (styleProps.borderStyle) cardStyles.borderStyle = styleProps.borderStyle;
  if (styleProps.borderRadius) cardStyles.borderRadius = styleProps.borderRadius;
  cardStyles.boxShadow = "none";
  if (styleProps.padding) cardStyles.padding = styleProps.padding;
  if (styleProps.paddingTop) cardStyles.paddingTop = styleProps.paddingTop;
  if (styleProps.paddingBottom) cardStyles.paddingBottom = styleProps.paddingBottom;
  if (styleProps.paddingLeft) cardStyles.paddingLeft = styleProps.paddingLeft;
  if (styleProps.paddingRight) cardStyles.paddingRight = styleProps.paddingRight;
  if (styleProps.margin) cardStyles.margin = styleProps.margin;
  if (styleProps.marginTop) cardStyles.marginTop = styleProps.marginTop;
  if (styleProps.marginBottom) cardStyles.marginBottom = styleProps.marginBottom;
  if (styleProps.marginLeft) cardStyles.marginLeft = styleProps.marginLeft;
  if (styleProps.marginRight) cardStyles.marginRight = styleProps.marginRight;

  const innerWithBackground = Object.keys(cardStyles).length > 0 && React.isValidElement(renderedInner)
    ? React.cloneElement(renderedInner as React.ReactElement<{ style?: React.CSSProperties }>, {
      style: {
        ...(renderedInner as React.ReactElement<{ style?: React.CSSProperties }>).props.style,
        ...cardStyles,
      },
    })
    : renderedInner;

  return (
    <div
      className={`w-full h-full flex-1 flex flex-col transition-all overflow-visible ${fontClass} ${fontSizeClass} ${alignClass} ${bgClass} ${textColorClass}`}
      style={{
        color: styleProps.color,
      }}
    >
      {innerWithBackground}
    </div>
  );
}

