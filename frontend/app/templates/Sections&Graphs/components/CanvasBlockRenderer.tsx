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
import { DynamicTextEditor, renderDynamicText } from "./DynamicTitleEditor";
import { PALETTE_RAMPS } from "./constants/chartTypes";
import ChartRenderer from "./ChartRenderer";
import {
  CARD_BG_PRESETS,
  BADGE_COLOR_PALETTES,
  BADGE_COLOR_MAP,
} from "../utils";

export { BADGE_COLOR_PALETTES };

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
  isForceEditing?: boolean;
  onEditingChange?: (isEditing: boolean) => void;
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
      style={cell.customHeight ? { height: `${cell.customHeight}px`, minHeight: `${cell.customHeight}px` } : undefined}
      className={`w-full h-full min-h-[140px] rounded-2xl border p-4 transition-all duration-200 select-none flex flex-col justify-between overflow-hidden ${ramp.bgLight} ${ramp.bgDark} ${ramp.borderLight} ${ramp.borderDark} shadow-sm ${editingField ? "relative z-50" : "relative z-10"}`}
    >
      {/* Label (inline editable on double click) */}
      <div className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400 line-clamp-2 leading-snug mb-2">
        {!isPreview && editingField === "label" ? (
          <DynamicTextEditor
            initialValue={card.label}
            initialHtml={(card as any).labelHtml}
            defaultFontSize={11}
            className="text-[11px] font-semibold leading-snug"
            onSave={(plain, html) => {
              commitCardChange({ label: plain, labelHtml: html } as any);
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
            className={!isPreview ? "hover:underline hover:decoration-dotted cursor-text" : ""}
          >
            {renderDynamicText((card as any).labelHtml, card.label)}
          </span>
        )}
      </div>

      {/* Primary Value (inline editable on double click) */}
      <div className={`text-2xl font-black font-mono tracking-tight leading-tight ${ramp.textLight} ${ramp.textDark}`}>
        {!isPreview && editingField === "value" ? (
          <DynamicTextEditor
            initialValue={card.value}
            initialHtml={(card as any).valueHtml}
            defaultFontSize={24}
            className="text-2xl font-black font-mono"
            onSave={(plain, html) => {
              commitCardChange({ value: plain, valueHtml: html } as any);
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
            className={!isPreview ? "hover:underline hover:decoration-dotted cursor-text" : ""}
          >
            {renderDynamicText((card as any).valueHtml, card.value)}
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
            <div onClick={(e) => e.stopPropagation()} className="min-w-[120px]">
              <DynamicTextEditor
                initialValue={card.trendValue}
                initialHtml={(card as any).trendValueHtml}
                defaultFontSize={10}
                className="text-[10px] font-mono font-bold"
                onSave={(plain, html) => {
                  commitCardChange({ trendValue: plain, trendValueHtml: html } as any);
                }}
                onCancel={() => setEditingField(null)}
              />
            </div>
          ) : (
            <span
              onDoubleClick={(e) => {
                if (isPreview) return;
                e.stopPropagation();
                setEditingField("trend");
              }}
              title={!isPreview ? "Double-click to format trend text (Word style)" : undefined}
            >
              {renderDynamicText((card as any).trendValueHtml, card.trendValue)}
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
  const customHeight = cell.customHeight;
  const chartAreaHeight = customHeight ? Math.max(90, customHeight - (chart.description ? 130 : 95)) : undefined;

  return (
    <div
      style={customHeight ? { height: `${customHeight}px` } : undefined}
      className={`w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between overflow-hidden ${
        customHeight ? "space-y-1.5" : "space-y-3"
      }`}
    >
      <div className="flex items-start justify-between gap-3 flex-shrink-0">
        <div className="min-w-0">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-tight truncate">{chart.title}</h3>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5 truncate">{chart.dataSourceField}</div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2.5 py-0.5 rounded-md bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 font-bold flex-shrink-0">
          {chart.chartType.toUpperCase()}
        </span>
      </div>
      <div className="flex-1 min-h-0 flex items-center justify-center overflow-hidden py-1">
        <ChartRenderer
          chart={chart}
          color={chart.color || chart.colors?.[0]}
          colors={chart.colors}
          gridRows={chart.gridRows}
          gridCols={chart.gridCols}
          height={chartAreaHeight}
        />
      </div>
      {chart.description && (
        <p className="text-[11px] text-slate-500 dark:text-zinc-400 pt-1.5 border-t border-slate-100 dark:border-zinc-800/80 leading-relaxed flex-shrink-0 line-clamp-2">
          {chart.description}
        </p>
      )}
    </div>
  );
}

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
  onUpdateInsight?: (text: string) => void;
  style?: React.CSSProperties;
}) {
  const insight = cell.insight;
  if (!insight) return null;

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

  const dynamicBoxShadow =
    cell.style?.shadow !== undefined
      ? cell.style.shadow === "none"
        ? "none"
        : cell.style.shadow === "sm"
        ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)"
        : cell.style.shadow === "md"
        ? "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.08)"
        : cell.style.shadow === "lg"
        ? "0 10px 15px -3px rgba(0,0,0,0.12), 0 4px 6px -4px rgba(0,0,0,0.08)"
        : cell.style.shadow === "xl"
        ? "0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.08)"
        : cell.style.shadow === "glow"
        ? "0 0 24px -2px rgba(139,61,255,0.38)"
        : cell.style.shadow
      : undefined;

  return (
    <div
      onClick={(e) => {
        if (!isPreview && !activeEditing) {
          e.stopPropagation();
          handleStartEditing();
        }
      }}
      className="w-full h-full flex-1 min-h-0 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 flex items-start gap-3.5 shadow-sm overflow-hidden"
      style={{
        borderRadius: dynamicBorderRadius,
        boxShadow: dynamicBoxShadow,
        ...style,
      }}
    >
      <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-[#9D61FF] to-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
        <Lightbulb className="w-3.5 h-3.5" />
      </div>

      <div className="flex-1 min-w-0">
        {!isPreview && activeEditing ? (
          <DynamicTextEditor
            initialValue={insight.text}
            initialHtml={insight.text}
            defaultFontSize={12}
            multiline={true}
            toolbarPosition="top"
            className="text-xs leading-relaxed"
            placeholder="Key operational observation..."
            onSave={(_plain, html) => {
              if (onUpdateInsight) {
                onUpdateInsight(html);
              }
              handleFinishEditing();
            }}
            onCancel={handleFinishEditing}
          />
        ) : (
          <div
            onDoubleClick={(e) => {
              if (isPreview) return;
              e.stopPropagation();
              handleStartEditing();
            }}
            title={!isPreview ? "Click to format observation (Word style)" : undefined}
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

  const dynamicBoxShadow =
    cell.style?.shadow !== undefined
      ? cell.style.shadow === "none"
        ? "none"
        : cell.style.shadow === "sm"
        ? "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)"
        : cell.style.shadow === "md"
        ? "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.08)"
        : cell.style.shadow === "lg"
        ? "0 10px 15px -3px rgba(0,0,0,0.12), 0 4px 6px -4px rgba(0,0,0,0.08)"
        : cell.style.shadow === "xl"
        ? "0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.08)"
        : cell.style.shadow === "glow"
        ? "0 0 24px -2px rgba(139,61,255,0.38)"
        : cell.style.shadow
      : undefined;

  const isContentEmpty =
    !tb.content ||
    tb.content.trim() === "" ||
    tb.content.includes("Empty text block") ||
    tb.content === "<p><br></p>" ||
    tb.content === "<br>";

  const contentToEdit = isContentEmpty ? "" : tb.content;

  return (
    <div
      onClick={(e) => {
        if (!isPreview && !activeEditing) {
          e.stopPropagation();
          handleStartEditing();
        }
      }}
      onDoubleClick={(e) => {
        if (!isPreview && !activeEditing) {
          e.stopPropagation();
          handleStartEditing();
        }
      }}
      className={`w-full h-full flex-1 min-h-0 rounded-2xl border p-4 shadow-sm transition-all duration-150 flex flex-col ${
        !activeEditing ? "cursor-text hover:border-purple-300 dark:hover:border-purple-700/60" : ""
      } ${
        !dynamicBg ? "bg-slate-50/70 dark:bg-zinc-900/50" : ""
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
          title={!isPreview ? "Click to format text block (Word style)" : undefined}
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
        className={`group/single-badge relative rounded-2xl border p-3 flex flex-col gap-2 transition-all duration-150 select-none ${colors.bg} ${colors.border} ${editingField ? "z-50" : "z-10"} ${
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
            <DynamicTextEditor
              initialValue={badge.value}
              initialHtml={(badge as any).valueHtml}
              defaultFontSize={18}
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
        <div className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 leading-tight">
          {!isPreview && editingField === "label" ? (
            <DynamicTextEditor
              initialValue={badge.label}
              initialHtml={(badge as any).labelHtml}
              defaultFontSize={10}
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

  const isCompact =
    (cell.customWidth !== undefined && cell.customWidth <= 60) ||
    (cell.colSpan !== undefined && cell.colSpan <= 2);

  return (
    <div className="w-full h-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-3.5 shadow-sm space-y-2.5 flex flex-col justify-between">
      <div className={`grid ${isCompact ? "grid-cols-2" : "grid-cols-2 sm:grid-cols-4"} gap-3 items-stretch`}>
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
  alignClass: string;
  bgClass: string;
  textColorClass: string;
  styleProps: React.CSSProperties;
} {
  if (!style) return { fontClass: "", alignClass: "", bgClass: "", textColorClass: "", styleProps: {} };

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
    const SHADOW_MAP: Record<string, string> = {
      none: "none",
      sm: "0 1px 3px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.04)",
      md: "0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.08)",
      lg: "0 10px 15px -3px rgba(0,0,0,0.12), 0 4px 6px -4px rgba(0,0,0,0.08)",
      xl: "0 20px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.08)",
      glow: "0 0 24px -2px rgba(139,61,255,0.38)",
    };
    styleProps.boxShadow = SHADOW_MAP[style.shadow] || style.shadow;
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
  if (cell.customHeight) {
    cardStyles.height = `${cell.customHeight}px`;
    cardStyles.minHeight = `${cell.customHeight}px`;
  }
  if (backgroundColor) cardStyles.backgroundColor = backgroundColor;
  if (styleProps.borderColor) cardStyles.borderColor = styleProps.borderColor;
  if (styleProps.borderWidth) cardStyles.borderWidth = styleProps.borderWidth;
  if (styleProps.borderStyle) cardStyles.borderStyle = styleProps.borderStyle;
  if (styleProps.borderRadius) cardStyles.borderRadius = styleProps.borderRadius;
  if (styleProps.boxShadow) cardStyles.boxShadow = styleProps.boxShadow;

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
      className={`w-full h-full flex-1 min-h-0 flex flex-col transition-all ${fontClass} ${alignClass} ${bgClass} ${textColorClass}`}
      style={{
        color: styleProps.color,
      }}
    >
      {innerWithBackground}
    </div>
  );
}

