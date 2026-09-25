"use client";

import React from "react";
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
} from "lucide-react";
import {
  CanvasCell,
  CanvasBadgeItem,
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
  Shield, Clock, Zap, Users, Activity, TrendingUp, Lightbulb,
};

function BadgeIcon({ name }: { name?: string }) {
  const Icon = name ? (BADGE_ICONS[name] || Activity) : Activity;
  return <Icon className="w-4 h-4" />;
}

// ── Individual block renderers ────────────────────────────────────────────────

function MetricCardBlock({ cell }: { cell: CanvasCell }) {
  const card = cell.metricCard;
  if (!card) return null;
  const ramp = PALETTE_RAMPS.find((r) => r.id === card.tintColor) || PALETTE_RAMPS[0];
  return (
    <div className={`w-full h-full rounded-xl border p-4 transition-all ${ramp.bgLight} ${ramp.bgDark} ${ramp.borderLight} ${ramp.borderDark}`}>
      <div className="text-[11px] font-medium text-slate-600 dark:text-zinc-400 line-clamp-2 leading-tight mb-2">
        {card.label}
      </div>
      <div className={`text-2xl font-black font-mono tracking-tight ${ramp.textLight} ${ramp.textDark}`}>
        {card.value}
      </div>
      <div className="pt-2 flex items-center gap-1">
        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${ramp.badgeBg} ${ramp.badgeText}`}>
          {card.trendDirection === "up"        && <ArrowUp   className="w-2.5 h-2.5" />}
          {card.trendDirection === "down"      && <ArrowDown className="w-2.5 h-2.5" />}
          {card.trendDirection === "no-change" && <span>—</span>}
          <span>{card.trendValue}</span>
        </span>
      </div>
    </div>
  );
}

function ChartBlock({ cell }: { cell: CanvasCell }) {
  const chart = cell.chart;
  if (!chart) return null;
  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-xs font-bold text-slate-900 dark:text-white">{chart.title}</h3>
          <div className="text-[10px] font-mono text-slate-400 mt-0.5">{chart.dataSourceField}</div>
        </div>
        <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 font-bold flex-shrink-0">
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
        <p className="text-[10px] text-slate-500 dark:text-zinc-400 pt-1 border-t border-slate-100 dark:border-zinc-800/80">
          {chart.description}
        </p>
      )}
    </div>
  );
}

function InsightBlock({ cell }: { cell: CanvasCell }) {
  const insight = cell.insight;
  if (!insight) return null;
  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-3 flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#9D61FF] to-blue-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
        <Lightbulb className="w-3 h-3" />
      </div>
      <p className="text-xs text-slate-700 dark:text-zinc-300 flex-1 leading-relaxed">
        {insight.text}
      </p>
    </div>
  );
}

function TextBlock({ cell }: { cell: CanvasCell }) {
  const tb = cell.textBlock;
  if (!tb) return null;
  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/50 p-4">
      {tb.content ? (
        <p className="text-sm text-slate-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{tb.content}</p>
      ) : (
        <p className="text-sm text-slate-400 italic">Empty text block — click Edit to add content.</p>
      )}
    </div>
  );
}

function BadgeStripBlock({ cell }: { cell: CanvasCell }) {
  const strip = cell.badgeStrip;
  if (!strip) return null;
  return (
    <div className="w-full rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {strip.badges.length === 0 ? (
          <div className="col-span-4 text-center text-xs text-slate-400 py-3 italic">
            No badges — edit this block to add them.
          </div>
        ) : (
          strip.badges.map((badge: CanvasBadgeItem) => {
            const colors = BADGE_COLOR_MAP[badge.color] || BADGE_COLOR_MAP.blue;
            return (
              <div key={badge.id} className={`rounded-xl border p-3 flex flex-col gap-2 ${colors.bg} ${colors.border}`}>
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
export function CanvasBlockRenderer({ cell }: { cell: CanvasCell }) {
  switch (cell.blockType) {
    case "metric-card":  return <MetricCardBlock  cell={cell} />;
    case "chart":        return <ChartBlock        cell={cell} />;
    case "insight":      return <InsightBlock      cell={cell} />;
    case "text":         return <TextBlock         cell={cell} />;
    case "badge-strip":  return <BadgeStripBlock   cell={cell} />;
    case "divider":      return <DividerBlock />;
    default:             return null;
  }
}
