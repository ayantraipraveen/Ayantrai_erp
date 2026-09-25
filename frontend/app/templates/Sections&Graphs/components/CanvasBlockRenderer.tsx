"use client";

import React, { useState, useEffect, useRef } from "react";
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
  Check,
} from "lucide-react";
import {
  CanvasCell,
  CanvasBadgeItem,
  CanvasBadgeStrip,
  LibraryMetricCard,
} from "@/lib/redux/slices/reportModuleSlice";
import { PALETTE_RAMPS } from "./constants/chartTypes";
import ChartRenderer from "./ChartRenderer";
import { CARD_BG_PRESETS } from "./CanvasContextRibbon";

// ── Badge color & icon maps ───────────────────────────────────────────────────
export const BADGE_COLOR_PALETTES = [
  { id: "blue", label: "Blue", bg: "bg-blue-500/10", border: "border-blue-400/30", text: "text-blue-600 dark:text-blue-300", dot: "bg-blue-500" },
  { id: "green", label: "Green", bg: "bg-emerald-500/10", border: "border-emerald-400/30", text: "text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
  { id: "purple", label: "Purple", bg: "bg-purple-500/10", border: "border-purple-400/30", text: "text-purple-600 dark:text-purple-300", dot: "bg-purple-500" },
  { id: "amber", label: "Amber", bg: "bg-amber-500/10", border: "border-amber-400/30", text: "text-amber-600 dark:text-amber-300", dot: "bg-amber-500" },
  { id: "rose", label: "Rose", bg: "bg-rose-500/10", border: "border-rose-400/30", text: "text-rose-600 dark:text-rose-300", dot: "bg-rose-500" },
  { id: "cyan", label: "Cyan", bg: "bg-cyan-500/10", border: "border-cyan-400/30", text: "text-cyan-600 dark:text-cyan-300", dot: "bg-cyan-500" },
] as const;

const BADGE_COLOR_MAP: Record<
  string,
  { bg: string; border: string; text: string; dot: string }
> = {
  blue:   { bg: "bg-blue-500/10",    border: "border-blue-400/30",    text: "text-blue-600 dark:text-blue-300",       dot: "bg-blue-500" },
  green:  { bg: "bg-emerald-500/10", border: "border-emerald-400/30", text: "text-emerald-600 dark:text-emerald-300", dot: "bg-emerald-500" },
  purple: { bg: "bg-purple-500/10",  border: "border-purple-400/30",  text: "text-purple-600 dark:text-purple-300",   dot: "bg-purple-500" },
  amber:  { bg: "bg-amber-500/10",   border: "border-amber-400/30",   text: "text-amber-600 dark:text-amber-300",     dot: "bg-amber-500" },
  rose:   { bg: "bg-rose-500/10",    border: "border-rose-400/30",    text: "text-rose-600 dark:text-rose-300",       dot: "bg-rose-500" },
  cyan:   { bg: "bg-cyan-500/10",    border: "border-cyan-400/30",    text: "text-cyan-600 dark:text-cyan-300",       dot: "bg-cyan-500" },
};

export const BADGE_AVAILABLE_ICONS = [
  { id: "Users", label: "Users", icon: Users },
  { id: "Shield", label: "Shield", icon: Shield },
  { id: "Clock", label: "Clock", icon: Clock },
  { id: "Zap", label: "Zap", icon: Zap },
  { id: "Activity", label: "Activity", icon: Activity },
  { id: "TrendingUp", label: "Trend", icon: TrendingUp },
  { id: "Sparkles", label: "Sparkles", icon: Sparkles },
  { id: "Lightbulb", label: "Idea", icon: Lightbulb },
  { id: "CheckCircle2", label: "Check", icon: CheckCircle2 },
  { id: "AlertTriangle", label: "Alert", icon: AlertTriangle },
  { id: "Eye", label: "Eye", icon: Eye },
  { id: "Flame", label: "Flame", icon: Flame },
  { id: "HeartPulse", label: "Pulse", icon: HeartPulse },
  { id: "Target", label: "Target", icon: Target },
  { id: "Award", label: "Award", icon: Award },
  { id: "BarChart2", label: "Chart", icon: BarChart2 },
];

const BADGE_ICONS: Record<string, React.ElementType> = {
  Shield,
  Clock,
  Zap,
  Users,
  Activity,
  TrendingUp,
  Lightbulb,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Flame,
  HeartPulse,
  Target,
  Award,
  BarChart2,
};

function BadgeIcon({ name }: { name?: string }) {
  const Icon = name ? (BADGE_ICONS[name] || Activity) : Activity;
  return <Icon className="w-4 h-4" />;
}

// ── Individual block renderers with Inline Editing ─────────────────────────────

interface BlockRendererProps {
  cell: CanvasCell;
  isSelected?: boolean;
  isPreview?: boolean;
  onUpdateMetricCard?: (card: LibraryMetricCard) => void;
  onUpdateInsight?: (text: string) => void;
  onUpdateTextBlock?: (content: string) => void;
  onUpdateBadgeStrip?: (strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: () => void;
  onDeleteBadge?: (badgeId: string) => void;
}

function MetricCardBlock({
  cell,
  isPreview,
  onUpdateMetricCard,
}: {
  cell: CanvasCell;
  isPreview?: boolean;
  onUpdateMetricCard?: (card: LibraryMetricCard) => void;
}) {
  const card = cell.metricCard;
  if (!card) return null;
  const ramp = PALETTE_RAMPS.find((r) => r.id === card.tintColor) || PALETTE_RAMPS[0];

  const [editingField, setEditingField] = useState<"label" | "value" | "trend" | null>(null);
  const [localLabel, setLocalLabel] = useState(card.label);
  const [localValue, setLocalValue] = useState(card.value);
  const [localTrendVal, setLocalTrendVal] = useState(card.trendValue);

  useEffect(() => {
    setLocalLabel(card.label);
    setLocalValue(card.value);
    setLocalTrendVal(card.trendValue);
  }, [card]);

  const commitCardChange = (patch: Partial<LibraryMetricCard>) => {
    if (!onUpdateMetricCard) return;
    onUpdateMetricCard({
      ...card,
      ...patch,
    });
    setEditingField(null);
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

  return (
    <div
      className={`w-full h-full rounded-2xl border p-4 transition-all duration-200 select-none ${ramp.bgLight} ${ramp.bgDark} ${ramp.borderLight} ${ramp.borderDark} shadow-sm`}
    >
      {/* Label (inline editable on double click) */}
      <div className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 line-clamp-2 leading-snug mb-2">
        {!isPreview && editingField === "label" ? (
          <input
            type="text"
            value={localLabel}
            autoFocus
            onChange={(e) => setLocalLabel(e.target.value)}
            onBlur={() => commitCardChange({ label: localLabel.trim() || card.label })}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitCardChange({ label: localLabel.trim() || card.label });
              if (e.key === "Escape") { setLocalLabel(card.label); setEditingField(null); }
            }}
            className="w-full bg-white/90 dark:bg-zinc-900 border border-[#8B3DFF] rounded px-1.5 py-0.5 text-xs font-semibold text-slate-800 dark:text-white outline-none shadow-sm"
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              if (isPreview) return;
              e.stopPropagation();
              setEditingField("label");
            }}
            title={!isPreview ? "Double-click to edit label inline" : undefined}
            className={!isPreview ? "hover:underline hover:decoration-dotted cursor-text" : ""}
          >
            {card.label}
          </span>
        )}
      </div>

      {/* Primary Value (inline editable on double click) */}
      <div className={`text-2xl font-black font-mono tracking-tight ${ramp.textLight} ${ramp.textDark}`}>
        {!isPreview && editingField === "value" ? (
          <input
            type="text"
            value={localValue}
            autoFocus
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={() => commitCardChange({ value: localValue.trim() || card.value })}
            onKeyDown={(e) => {
              if (e.key === "Enter") commitCardChange({ value: localValue.trim() || card.value });
              if (e.key === "Escape") { setLocalValue(card.value); setEditingField(null); }
            }}
            className="w-full bg-white/90 dark:bg-zinc-900 border border-[#8B3DFF] rounded px-1.5 py-0.5 text-2xl font-black font-mono outline-none shadow-sm"
          />
        ) : (
          <span
            onDoubleClick={(e) => {
              if (isPreview) return;
              e.stopPropagation();
              setEditingField("value");
            }}
            title={!isPreview ? "Double-click to edit value inline" : undefined}
            className={!isPreview ? "hover:underline hover:decoration-dotted cursor-text" : ""}
          >
            {card.value}
          </span>
        )}
      </div>

      {/* Trend Badge */}
      <div className="pt-2 flex items-center gap-1.5">
        <button
          type="button"
          onClick={cycleTrend}
          title={!isPreview ? "Click to cycle trend: Up → Down → Neutral" : undefined}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold font-mono transition-transform ${ramp.badgeBg} ${ramp.badgeText} ${!isPreview ? "hover:scale-105 cursor-pointer" : ""}`}
        >
          {card.trendDirection === "up" && <ArrowUp className="w-2.5 h-2.5" />}
          {card.trendDirection === "down" && <ArrowDown className="w-2.5 h-2.5" />}
          {card.trendDirection === "no-change" && <span>—</span>}

          {!isPreview && editingField === "trend" ? (
            <input
              type="text"
              value={localTrendVal}
              autoFocus
              onClick={(e) => e.stopPropagation()}
              onChange={(e) => setLocalTrendVal(e.target.value)}
              onBlur={() => commitCardChange({ trendValue: localTrendVal.trim() || card.trendValue })}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitCardChange({ trendValue: localTrendVal.trim() || card.trendValue });
                if (e.key === "Escape") { setLocalTrendVal(card.trendValue); setEditingField(null); }
              }}
              className="w-28 bg-white/90 dark:bg-zinc-900 border border-[#8B3DFF] rounded px-1 text-[10px] font-mono outline-none"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                if (isPreview) return;
                e.stopPropagation();
                setEditingField("trend");
              }}
              title={!isPreview ? "Double-click to edit trend text inline" : undefined}
            >
              {card.trendValue}
            </span>
          )}
        </button>
      </div>
    </div>
  );
}

function ChartBlock({ cell }: { cell: CanvasCell }) {
  const chart = cell.chart;
  if (!chart) return null;
  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight">{chart.title}</h3>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">{chart.dataSourceField}</div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 font-bold flex-shrink-0">
          {chart.chartType.toUpperCase()}
        </span>
      </div>
      <ChartRenderer
        chart={chart}
        color={chart.color || chart.colors?.[0]}
        colors={chart.colors}
        gridRows={chart.gridRows}
        gridCols={chart.gridCols}
      />
      {chart.description && (
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-2 border-t border-slate-100 dark:border-zinc-800/80 leading-relaxed">
          {chart.description}
        </p>
      )}
    </div>
  );
}

function InsightBlock({
  cell,
  isPreview,
  onUpdateInsight,
}: {
  cell: CanvasCell;
  isPreview?: boolean;
  onUpdateInsight?: (text: string) => void;
}) {
  const insight = cell.insight;
  if (!insight) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [localText, setLocalText] = useState(insight.text);

  useEffect(() => {
    setLocalText(insight.text);
  }, [insight.text]);

  const handleCommit = () => {
    if (onUpdateInsight && localText.trim()) {
      onUpdateInsight(localText.trim());
    }
    setIsEditing(false);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 flex items-start gap-3.5 shadow-sm">
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#9D61FF] to-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Lightbulb className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        {!isPreview && isEditing ? (
          <textarea
            value={localText}
            autoFocus
            rows={2}
            onChange={(e) => setLocalText(e.target.value)}
            onBlur={handleCommit}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCommit();
              }
              if (e.key === "Escape") {
                setLocalText(insight.text);
                setIsEditing(false);
              }
            }}
            className="w-full bg-slate-50 dark:bg-zinc-900 border border-[#8B3DFF] rounded-lg p-2 text-xs text-slate-800 dark:text-zinc-200 leading-relaxed outline-none shadow-sm resize-none"
          />
        ) : (
          <p
            onDoubleClick={(e) => {
              if (isPreview) return;
              e.stopPropagation();
              setIsEditing(true);
            }}
            title={!isPreview ? "Double-click to edit insight observation" : undefined}
            className={`text-xs text-slate-700 dark:text-zinc-300 leading-relaxed ${!isPreview ? "hover:bg-purple-500/5 rounded p-0.5 cursor-text transition-colors" : ""}`}
          >
            {insight.text}
          </p>
        )}
      </div>
    </div>
  );
}

function TextBlock({
  cell,
  isPreview,
  onUpdateTextBlock,
}: {
  cell: CanvasCell;
  isPreview?: boolean;
  onUpdateTextBlock?: (content: string) => void;
}) {
  const tb = cell.textBlock;
  if (!tb) return null;

  const [isEditing, setIsEditing] = useState(false);
  const [localContent, setLocalContent] = useState(tb.content);

  useEffect(() => {
    setLocalContent(tb.content);
  }, [tb.content]);

  const handleCommit = () => {
    if (onUpdateTextBlock) {
      onUpdateTextBlock(localContent);
    }
    setIsEditing(false);
  };

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 p-4 shadow-sm">
      {!isPreview && isEditing ? (
        <textarea
          value={localContent}
          autoFocus
          rows={3}
          onChange={(e) => setLocalContent(e.target.value)}
          onBlur={handleCommit}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setLocalContent(tb.content);
              setIsEditing(false);
            }
          }}
          className="w-full bg-white dark:bg-zinc-900 border border-[#8B3DFF] rounded-lg p-2.5 text-sm text-slate-800 dark:text-zinc-200 leading-relaxed outline-none shadow-sm resize-none"
        />
      ) : (
        <div
          onDoubleClick={(e) => {
            if (isPreview) return;
            e.stopPropagation();
            setIsEditing(true);
          }}
          title={!isPreview ? "Double-click to edit text block" : undefined}
          className={!isPreview ? "hover:bg-purple-500/5 rounded p-1 cursor-text transition-colors" : ""}
        >
          {tb.content ? (
            <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{tb.content}</p>
          ) : (
            <p className="text-sm text-slate-400 italic">Empty text block — double click to type content.</p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Single Badge Quick Editor Modal/Popover ──────────────────────────────────
function SingleBadgeEditorModal({
  badge,
  badgeIndex,
  isOpen,
  onClose,
  onSave,
  onDelete,
  canDelete,
}: {
  badge: CanvasBadgeItem;
  badgeIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onSave: (patch: Partial<CanvasBadgeItem>) => void;
  onDelete?: () => void;
  canDelete?: boolean;
}) {
  const [val, setVal] = useState(badge.value);
  const [lbl, setLbl] = useState(badge.label);
  const [col, setCol] = useState(badge.color);
  const [icn, setIcn] = useState(badge.icon || "Activity");

  useEffect(() => {
    setVal(badge.value);
    setLbl(badge.label);
    setCol(badge.color);
    setIcn(badge.icon || "Activity");
  }, [badge]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn select-none"
      onClick={(e) => {
        e.stopPropagation();
        onClose();
      }}
    >
      <div
        className="w-full max-w-sm bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl p-5 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2.5">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${BADGE_COLOR_MAP[col]?.bg || "bg-purple-500/10"} ${BADGE_COLOR_MAP[col]?.text || "text-purple-600"}`}>
              <BadgeIcon name={icn} />
            </div>
            <h4 className="text-xs font-bold uppercase tracking-wider">
              Edit Badge #{badgeIndex + 1}
            </h4>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Live Preview Card */}
        <div className={`rounded-2xl border p-3 flex items-center gap-3 transition-all ${BADGE_COLOR_MAP[col]?.bg || ""} ${BADGE_COLOR_MAP[col]?.border || ""}`}>
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${BADGE_COLOR_MAP[col]?.text || ""}`}>
            <BadgeIcon name={icn} />
          </div>
          <div className="min-w-0 flex-1">
            <div className={`text-lg font-black font-mono leading-tight truncate ${BADGE_COLOR_MAP[col]?.text || ""}`}>
              {val || "0.0%"}
            </div>
            <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 truncate">
              {lbl || "Metric Name"}
            </div>
          </div>
        </div>

        {/* Inputs */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300 flex items-center justify-between">
              <span>Metric Value</span>
              <span className="text-[10px] text-slate-400 font-normal">e.g. 98.4%, &lt; 4m, 14k</span>
            </label>
            <input
              type="text"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="e.g. 98.7%"
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 font-mono font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
            />
          </div>

          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300">
              Badge Label / Title
            </label>
            <input
              type="text"
              value={lbl}
              onChange={(e) => setLbl(e.target.value)}
              placeholder="e.g. PPE Compliance"
              className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
            />
          </div>

          {/* Color Palettes */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
              Badge Color
            </label>
            <div className="grid grid-cols-6 gap-1.5">
              {BADGE_COLOR_PALETTES.map((palette) => (
                <button
                  key={palette.id}
                  type="button"
                  onClick={() => setCol(palette.id as any)}
                  className={`h-8 rounded-xl flex items-center justify-center transition-all cursor-pointer border ${palette.bg} ${palette.border} ${
                    col === palette.id ? "ring-2 ring-[#9D61FF] scale-105 shadow-sm font-bold" : "hover:scale-102 opacity-80 hover:opacity-100"
                  }`}
                  title={palette.label}
                >
                  <span className={`w-3.5 h-3.5 rounded-full ${palette.dot} shadow-xs`} />
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div>
            <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
              Icon Symbol
            </label>
            <div className="grid grid-cols-8 gap-1 p-1 bg-slate-50 dark:bg-zinc-900/60 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 max-h-24 overflow-y-auto">
              {BADGE_AVAILABLE_ICONS.map((opt) => {
                const IconComp = opt.icon;
                const isSelected = icn === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setIcn(opt.id)}
                    className={`h-7 rounded-lg flex items-center justify-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-[#9D61FF] text-white shadow-xs font-bold"
                        : "text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-zinc-800"
                    }`}
                    title={opt.label}
                  >
                    <IconComp className="w-3.5 h-3.5" />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-zinc-800">
          {canDelete && onDelete ? (
            <button
              type="button"
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="text-rose-500 hover:text-rose-600 dark:hover:text-rose-400 p-1.5 rounded-xl hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors"
              title="Remove this badge"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Remove</span>
            </button>
          ) : (
            <span />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-medium cursor-pointer hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onSave({
                  value: val.trim() || badge.value,
                  label: lbl.trim() || badge.label,
                  color: col,
                  icon: icn,
                });
                onClose();
              }}
              className="px-4 py-1.5 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              Save Badge
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Single Badge Item Card (Rendered on Canvas) ──────────────────────────────
function SingleBadgeItemCard({
  badge,
  badgeIndex,
  isPreview,
  onUpdateBadge,
  onDeleteBadge,
  canDelete,
}: {
  badge: CanvasBadgeItem;
  badgeIndex: number;
  isPreview?: boolean;
  onUpdateBadge?: (patch: Partial<CanvasBadgeItem>) => void;
  onDeleteBadge?: () => void;
  canDelete?: boolean;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingField, setEditingField] = useState<"value" | "label" | null>(null);
  const [localVal, setLocalVal] = useState(badge.value);
  const [localLbl, setLocalLbl] = useState(badge.label);

  useEffect(() => {
    setLocalVal(badge.value);
    setLocalLbl(badge.label);
  }, [badge.value, badge.label]);

  const commitValue = () => {
    if (onUpdateBadge && localVal.trim() && localVal.trim() !== badge.value) {
      onUpdateBadge({ value: localVal.trim() });
    }
    setEditingField(null);
  };

  const commitLabel = () => {
    if (onUpdateBadge && localLbl.trim() && localLbl.trim() !== badge.label) {
      onUpdateBadge({ label: localLbl.trim() });
    }
    setEditingField(null);
  };

  const colors = BADGE_COLOR_MAP[badge.color] || BADGE_COLOR_MAP.blue;

  return (
    <>
      <div
        className={`group/single-badge relative rounded-2xl border p-3 flex flex-col gap-2 transition-all duration-150 select-none ${colors.bg} ${colors.border} ${
          !isPreview ? "hover:ring-2 hover:ring-[#9D61FF] hover:shadow-md cursor-pointer" : ""
        }`}
        onClick={(e) => {
          if (isPreview) return;
          e.stopPropagation();
        }}
      >
        {/* Single Badge Hover Action Bar */}
        {!isPreview && (
          <div className="absolute top-1.5 right-1.5 opacity-0 group-hover/single-badge:opacity-100 transition-opacity flex items-center gap-1 z-10 bg-white/95 dark:bg-zinc-900/95 border border-slate-200 dark:border-zinc-800 rounded-lg p-0.5 shadow-sm backdrop-blur-xs">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setModalOpen(true);
              }}
              className="p-1 hover:text-[#9D61FF] hover:bg-purple-500/10 rounded transition-colors text-slate-500 cursor-pointer"
              title="Edit this single badge (value, label, color, icon)"
            >
              <Pencil className="w-3 h-3" />
            </button>
            {canDelete && onDeleteBadge && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteBadge();
                }}
                className="p-1 hover:text-rose-500 hover:bg-rose-500/10 rounded transition-colors text-slate-500 cursor-pointer"
                title="Delete this badge"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            )}
          </div>
        )}

        {/* Badge Icon */}
        <div
          onClick={(e) => {
            if (isPreview) return;
            e.stopPropagation();
            setModalOpen(true);
          }}
          className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.text} cursor-pointer hover:scale-110 transition-transform`}
          title={!isPreview ? "Click to change icon & color" : undefined}
        >
          <BadgeIcon name={badge.icon} />
        </div>

        {/* Metric Value (double-click inline edit) */}
        <div className={`text-lg font-black font-mono leading-tight ${colors.text}`}>
          {!isPreview && editingField === "value" ? (
            <input
              type="text"
              autoFocus
              value={localVal}
              onChange={(e) => setLocalVal(e.target.value)}
              onBlur={commitValue}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitValue();
                if (e.key === "Escape") {
                  setLocalVal(badge.value);
                  setEditingField(null);
                }
              }}
              className="w-full bg-white dark:bg-zinc-900 border border-[#9D61FF] rounded px-1 text-sm font-mono font-black text-slate-900 dark:text-white outline-none shadow-xs"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                if (isPreview) return;
                e.stopPropagation();
                setEditingField("value");
              }}
              title={!isPreview ? "Double-click to edit value inline, or click pencil" : undefined}
              className={!isPreview ? "hover:underline cursor-text" : ""}
            >
              {badge.value}
            </span>
          )}
        </div>

        {/* Badge Label (double-click inline edit) */}
        <div className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 leading-tight">
          {!isPreview && editingField === "label" ? (
            <input
              type="text"
              autoFocus
              value={localLbl}
              onChange={(e) => setLocalLbl(e.target.value)}
              onBlur={commitLabel}
              onKeyDown={(e) => {
                if (e.key === "Enter") commitLabel();
                if (e.key === "Escape") {
                  setLocalLbl(badge.label);
                  setEditingField(null);
                }
              }}
              className="w-full bg-white dark:bg-zinc-900 border border-[#9D61FF] rounded px-1 text-[10px] font-medium text-slate-900 dark:text-white outline-none shadow-xs"
            />
          ) : (
            <span
              onDoubleClick={(e) => {
                if (isPreview) return;
                e.stopPropagation();
                setEditingField("label");
              }}
              title={!isPreview ? "Double-click to edit label inline" : undefined}
              className={!isPreview ? "hover:underline cursor-text" : ""}
            >
              {badge.label}
            </span>
          )}
        </div>
      </div>

      {/* Popover / Modal for this Single Badge */}
      <SingleBadgeEditorModal
        badge={badge}
        badgeIndex={badgeIndex}
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={(patch) => {
          if (onUpdateBadge) onUpdateBadge(patch);
        }}
        onDelete={onDeleteBadge}
        canDelete={canDelete}
      />
    </>
  );
}

// ── Complete Badge Strip Block ────────────────────────────────────────────────
function BadgeStripBlock({
  cell,
  isPreview,
  onUpdateBadgeStrip,
  onUpdateSingleBadge,
  onAddBadge,
  onDeleteBadge,
}: {
  cell: CanvasCell;
  isPreview?: boolean;
  onUpdateBadgeStrip?: (strip: CanvasBadgeStrip) => void;
  onUpdateSingleBadge?: (badgeId: string, patch: Partial<CanvasBadgeItem>) => void;
  onAddBadge?: () => void;
  onDeleteBadge?: (badgeId: string) => void;
}) {
  const strip = cell.badgeStrip;
  if (!strip) return null;

  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-3.5 shadow-sm space-y-2.5">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 items-stretch">
        {strip.badges.length === 0 ? (
          <div className="col-span-4 text-center text-xs text-slate-400 py-4 italic">
            No badges in strip. Click &ldquo;+ Add Badge&rdquo; to create one.
          </div>
        ) : (
          strip.badges.map((badge: CanvasBadgeItem, idx: number) => (
            <SingleBadgeItemCard
              key={badge.id}
              badge={badge}
              badgeIndex={idx}
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
              onDeleteBadge={() => {
                if (onDeleteBadge) {
                  onDeleteBadge(badge.id);
                } else if (onUpdateBadgeStrip) {
                  const updated = {
                    ...strip,
                    badges: strip.badges.filter((b) => b.id !== badge.id),
                  };
                  onUpdateBadgeStrip(updated);
                }
              }}
              canDelete={strip.badges.length > 1}
            />
          ))
        )}

        {/* Optional Add Badge Slot if < 6 badges and not in preview */}
        {!isPreview && strip.badges.length < 6 && onAddBadge && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onAddBadge();
            }}
            className="rounded-2xl border-2 border-dashed border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF] hover:bg-[#9D61FF]/5 p-3 flex flex-col items-center justify-center gap-1.5 text-slate-400 hover:text-[#9D61FF] transition-all cursor-pointer min-h-[90px]"
            title="Add another badge to this strip"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[10px] font-bold">+ Add Badge</span>
          </button>
        )}
      </div>
    </div>
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

// ── Helper to resolve CanvasCellStyle overrides ──────────────────────────────
export function getCellStyleClasses(style?: CanvasCell["style"]) {
  if (!style) return { fontClass: "", alignClass: "", bgClass: "", styleProps: {} };

  const fontClass =
    style.fontFamily === "serif"
      ? "font-serif"
      : style.fontFamily === "mono"
      ? "font-mono"
      : style.fontFamily === "rounded"
      ? "font-sans tracking-wide"
      : "font-sans";

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

  
  let textColorClass = "";
  if (style.textColor) {
    styleProps.color = style.textColor;
    textColorClass = "[&_p]:!text-[inherit] [&_span]:!text-[inherit] [&_h1]:!text-[inherit] [&_h2]:!text-[inherit] [&_h3]:!text-[inherit] [&_h4]:!text-[inherit]";
  }

  return { fontClass, alignClass, bgClass, textColorClass, styleProps };
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
  if (!style?.cardBg || style.backgroundOpacity === undefined) return undefined;
  const preset = CARD_BG_PRESETS.find((item) => item.id === style.cardBg);
  const color = preset?.color || style.cardBg;
  return withAlpha(color, style.backgroundOpacity);
}


// ── Main export ───────────────────────────────────────────────────────────────
export function CanvasBlockRenderer({
  cell,
  isSelected,
  isPreview,
  onUpdateMetricCard,
  onUpdateInsight,
  onUpdateTextBlock,
  onUpdateBadgeStrip,
  onUpdateSingleBadge,
  onAddBadge,
  onDeleteBadge,
}: BlockRendererProps) {
  const { fontClass, alignClass, bgClass, textColorClass, styleProps } = getCellStyleClasses(cell.style);
  const backgroundColor = getCardBackgroundColor(cell.style);

  const renderInner = () => {
    switch (cell.blockType) {
      case "metric-card":
        return (
          <MetricCardBlock
            cell={cell}
            isPreview={isPreview}
            onUpdateMetricCard={onUpdateMetricCard}
          />
        );
      case "chart":
        return <ChartBlock cell={cell} />;
      case "insight":
        return (
          <InsightBlock
            cell={cell}
            isPreview={isPreview}
            onUpdateInsight={onUpdateInsight}
          />
        );
      case "text":
        return (
          <TextBlock
            cell={cell}
            isPreview={isPreview}
            onUpdateTextBlock={onUpdateTextBlock}
          />
        );
      case "badge-strip":
        return (
          <BadgeStripBlock
            cell={cell}
            isPreview={isPreview}
            onUpdateBadgeStrip={onUpdateBadgeStrip}
            onUpdateSingleBadge={onUpdateSingleBadge}
            onAddBadge={onAddBadge}
            onDeleteBadge={onDeleteBadge}
          />
        );
      case "divider":
        return <DividerBlock />;
      default:
        return null;
    }
  };

  const renderedInner = renderInner();
  const innerWithBackground = backgroundColor && React.isValidElement(renderedInner)
    ? React.cloneElement(renderedInner as React.ReactElement<{ style?: React.CSSProperties }>, {
        style: {
          ...(renderedInner as React.ReactElement<{ style?: React.CSSProperties }>).props.style,
          backgroundColor,
        },
      })
    : renderedInner;

  return (
    <div
      className={`w-full h-full transition-all ${fontClass} ${alignClass} ${bgClass} ${textColorClass}`}
      style={styleProps}
    >
      {innerWithBackground}
    </div>
  );
}

