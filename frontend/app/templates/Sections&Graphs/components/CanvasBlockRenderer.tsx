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
} from "lucide-react";
import {
  CanvasCell,
  CanvasBadgeItem,
  LibraryMetricCard,
} from "@/lib/redux/slices/reportModuleSlice";
import { PALETTE_RAMPS } from "./constants/chartTypes";
import ChartRenderer from "./ChartRenderer";

// ── Badge color map ───────────────────────────────────────────────────────────
const BADGE_COLOR_MAP: Record<
  string,
  { bg: string; border: string; text: string }
> = {
  blue:   { bg: "bg-blue-500/10",    border: "border-blue-400/30",    text: "text-blue-600 dark:text-blue-300"       },
  green:  { bg: "bg-emerald-500/10", border: "border-emerald-400/30", text: "text-emerald-600 dark:text-emerald-300" },
  purple: { bg: "bg-purple-500/10",  border: "border-purple-400/30",  text: "text-purple-600 dark:text-purple-300"   },
  amber:  { bg: "bg-amber-500/10",   border: "border-amber-400/30",   text: "text-amber-600 dark:text-amber-300"     },
  rose:   { bg: "bg-rose-500/10",    border: "border-rose-400/30",    text: "text-rose-600 dark:text-rose-300"       },
  cyan:   { bg: "bg-cyan-500/10",    border: "border-cyan-400/30",    text: "text-cyan-600 dark:text-cyan-300"       },
};

const BADGE_ICONS: Record<string, React.ElementType> = {
  Shield, Clock, Zap, Users, Activity, TrendingUp, Lightbulb, Sparkles,
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

function BadgeStripBlock({ cell }: { cell: CanvasCell }) {
  const strip = cell.badgeStrip;
  if (!strip) return null;
  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 shadow-sm">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {strip.badges.length === 0 ? (
          <div className="col-span-4 text-center text-xs text-slate-400 py-3 italic">
            No badges — edit this block to add them.
          </div>
        ) : (
          strip.badges.map((badge: CanvasBadgeItem) => {
            const colors = BADGE_COLOR_MAP[badge.color] || BADGE_COLOR_MAP.blue;
            return (
              <div key={badge.id} className={`rounded-xl border p-3 flex flex-col gap-2 transition-all ${colors.bg} ${colors.border}`}>
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${colors.text}`}>
                  <BadgeIcon name={badge.icon} />
                </div>
                <div className={`text-lg font-black font-mono ${colors.text}`}>{badge.value}</div>
                <div className="text-[10px] font-medium text-slate-500 dark:text-zinc-400 leading-tight">
                  {badge.label}
                </div>
              </div>
            );
          })
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

// ── Main export ───────────────────────────────────────────────────────────────
export function CanvasBlockRenderer({
  cell,
  isSelected,
  isPreview,
  onUpdateMetricCard,
  onUpdateInsight,
  onUpdateTextBlock,
}: BlockRendererProps) {
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
      return <BadgeStripBlock cell={cell} />;
    case "divider":
      return <DividerBlock />;
    default:
      return null;
  }
}
