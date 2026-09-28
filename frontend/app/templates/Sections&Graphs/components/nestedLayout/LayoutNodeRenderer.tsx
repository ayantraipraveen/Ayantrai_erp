"use client";

import React from "react";
import {
  LayoutNode,
  LayoutRowNode,
  LayoutColumnNode,
  LayoutBlockNode,
  LibraryChartCard,
  LibraryMetricCard,
  LibraryKeyInsightItem,
} from "@/lib/redux/types/reportModuleTypes";
import ChartRenderer from "../ChartRenderer";
import {
  Activity,
  ArrowUp,
  ArrowDown,
  Lightbulb,
  BarChart2,
  FileText,
  Sparkles,
  TrendingUp,
} from "lucide-react";

export interface LayoutNodeRendererProps {
  node: LayoutNode;
  depth?: number;
  isPrint?: boolean;
  isBuilder?: boolean;
  selectedNodeId?: string | null;
  onSelectNode?: (nodeId: string) => void;
  // External catalogs for resolving refId
  chartsCatalog?: LibraryChartCard[];
  metricsCatalog?: LibraryMetricCard[];
  insightsCatalog?: LibraryKeyInsightItem[];
}

/**
 * ── Helper to resolve column span class for Tailwind 12-column grid ───────────
 * Also handles responsive collapse below 768px (md breakpoint).
 */
function getColumnSpanClass(span: number): string {
  switch (span) {
    case 1:
      return "col-span-12 md:col-span-1";
    case 2:
      return "col-span-12 md:col-span-2";
    case 3:
      return "col-span-12 md:col-span-3";
    case 4:
      return "col-span-12 md:col-span-4";
    case 5:
      return "col-span-12 md:col-span-5";
    case 6:
      return "col-span-12 md:col-span-6";
    case 7:
      return "col-span-12 md:col-span-7";
    case 8:
      return "col-span-12 md:col-span-8";
    case 9:
      return "col-span-12 md:col-span-9";
    case 10:
      return "col-span-12 md:col-span-10";
    case 11:
      return "col-span-12 md:col-span-11";
    case 12:
    default:
      return "col-span-12";
  }
}

/**
 * ── Leaf Block Renderer ───────────────────────────────────────────────────────
 * Renders Charts, Metric Cards, Key Insights Boxes, and Text Sections.
 * Includes 'break-inside-avoid' / 'print:break-inside-avoid' for PDF export.
 */
function RenderBlockLeaf({
  block,
  isPrint,
  chartsCatalog,
  metricsCatalog,
  insightsCatalog,
}: {
  block: LayoutBlockNode;
  isPrint?: boolean;
  chartsCatalog?: LibraryChartCard[];
  metricsCatalog?: LibraryMetricCard[];
  insightsCatalog?: LibraryKeyInsightItem[];
}) {
  const printAvoidClass = "break-inside-avoid print:break-inside-avoid";

  switch (block.blockType) {
    case "metric-card": {
      // Resolve card from data or catalog
      const fromCatalog = metricsCatalog?.find((m) => m.id === block.refId);
      const label = block.title || fromCatalog?.label || block.data?.label || "Safety Indicator";
      const value = fromCatalog?.value || block.data?.value || "98.4%";
      const tint = fromCatalog?.tintColor || block.data?.tintColor || "blue";
      const trendDir = fromCatalog?.trendDirection || block.data?.trendDirection || "up";
      const trendVal = fromCatalog?.trendValue || block.data?.trendValue || "+2.4% vs baseline";

      const tintClasses =
        tint === "green"
          ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400"
          : tint === "purple"
          ? "border-purple-500/30 bg-purple-500/5 text-[#9D61FF]"
          : tint === "amber"
          ? "border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400"
          : tint === "rose"
          ? "border-rose-500/30 bg-rose-500/5 text-rose-600 dark:text-rose-400"
          : "border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400";

      return (
        <div
          className={`w-full rounded-2xl border p-4 shadow-xs transition-all bg-white dark:bg-[#0c1017] border-slate-200 dark:border-zinc-800 ${printAvoidClass} flex flex-col justify-between min-h-[105px]`}
        >
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-semibold text-slate-500 dark:text-zinc-400 truncate">
              {label}
            </span>
            <div className={`p-1.5 rounded-lg border text-xs ${tintClasses}`}>
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>

          <div className="flex items-baseline justify-between gap-2 mt-2">
            <span className="text-2xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
              {value}
            </span>
            <div
              className={`flex items-center gap-1 text-[11px] font-mono font-bold ${
                trendDir === "up" ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {trendDir === "up" ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
              <span>{trendVal}</span>
            </div>
          </div>
        </div>
      );
    }

    case "chart": {
      // Resolve chart from catalog or inline data
      const fromCatalog = chartsCatalog?.find((c) => c.id === block.refId);
      const title = block.title || fromCatalog?.title || block.data?.title || "Workforce Telemetry Chart";
      const chartType = fromCatalog?.chartType || block.data?.chartType || "bar";
      const dataSource = fromCatalog?.dataSourceField || block.data?.dataSourceField || "ppe_sensor_compliance";
      const desc = fromCatalog?.description || block.data?.description || "Comparative telemetry breakdown across active shifts.";
      const chartColor = fromCatalog?.color || block.data?.color || "#9D61FF";

      // Reconstruct mock chart card for renderer
      const chartCard: LibraryChartCard = {
        id: block.refId || block.id || "chart-sample",
        title,
        chartType,
        dataSourceField: dataSource,
        description: desc,
        color: chartColor,
        colors: fromCatalog?.colors || block.data?.colors,
      };

      return (
        <div
          className={`w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-5 shadow-xs transition-all ${printAvoidClass} flex flex-col justify-between min-h-[280px] overflow-hidden`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 dark:border-zinc-800/80 pb-3">
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                {title}
              </h4>
              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase tracking-wider">
                Source: {dataSource}
              </span>
            </div>
            <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded-md font-bold bg-[#9D61FF]/10 text-[#9D61FF] border border-[#9D61FF]/20 flex-shrink-0">
              {chartType}
            </span>
          </div>

          {/* Interactive or Live Chart Render Area (minmax bounds so it never overflows) */}
          <div className="w-full flex-1 min-h-[170px] max-h-[320px] flex items-center justify-center py-3 overflow-hidden">
            <ChartRenderer
              chart={chartCard}
              color={chartColor}
              colors={chartCard.colors}
            />
          </div>

          {/* Caption */}
          {desc && (
            <p className="text-[11px] text-slate-500 dark:text-zinc-400 border-t border-slate-100 dark:border-zinc-800/60 pt-2 leading-relaxed">
              {desc}
            </p>
          )}
        </div>
      );
    }

    case "key-insights": {
      const fromCatalog = insightsCatalog?.find((i) => i.id === block.refId);
      const title = block.title || "Key Supervisory Insights";
      const text =
        fromCatalog?.text ||
        block.data?.text ||
        "Site compliance remained stable above 98% with automated real-time escalation protocols active.";

      return (
        <div
          className={`w-full rounded-2xl border-l-4 border-l-[#9D61FF] border border-slate-200 dark:border-zinc-800 bg-purple-500/5 dark:bg-purple-950/20 p-4 shadow-xs transition-all ${printAvoidClass} flex items-start gap-3`}
        >
          <div className="w-8 h-8 rounded-xl bg-[#9D61FF]/15 text-[#9D61FF] flex items-center justify-center flex-shrink-0 mt-0.5">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              {title}
            </h5>
            <p className="text-xs text-slate-600 dark:text-zinc-300 mt-1 leading-relaxed">
              {text}
            </p>
          </div>
        </div>
      );
    }

    case "text":
    case "section":
    default: {
      const title = block.title || block.data?.title || "Operational Section Overview";
      const eyebrow = block.data?.eyebrow || "SITE GOVERNANCE REPORT";
      const desc =
        block.data?.description ||
        block.data?.text ||
        "Shift-wise compliance and personnel tracking across designated industrial zones.";

      return (
        <div
          className={`w-full rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-4 shadow-xs transition-all ${printAvoidClass} space-y-1.5`}
        >
          {eyebrow && (
            <span className="text-[10px] font-mono uppercase font-bold text-[#9D61FF] tracking-wider">
              {eyebrow}
            </span>
          )}
          <h4 className="text-sm font-bold text-slate-900 dark:text-white">{title}</h4>
          <p className="text-xs text-slate-500 dark:text-zinc-400 leading-relaxed">{desc}</p>
        </div>
      );
    }
  }
}

/**
 * ── Recursive Layout Node Component ──────────────────────────────────────────
 * Follows the user's architectural guidelines:
 * - Row -> Columns: CSS Grid 12-column system, gap 16px, minmax(0, 1fr).
 * - Inside Column: Stacked rows = flex column with gap; Side-by-side = nested grid or flex row.
 * - Responsive: Columns collapse to single stack below 768px.
 * - Arbitrary depth support in renderer.
 */
export default function LayoutNodeRenderer({
  node,
  depth = 1,
  isPrint = false,
  isBuilder = false,
  selectedNodeId,
  onSelectNode,
  chartsCatalog,
  metricsCatalog,
  insightsCatalog,
}: LayoutNodeRendererProps) {
  if (!node) return null;

  const isSelected = isBuilder && selectedNodeId === node.id;

  // 1. Leaf Block
  if (node.type === "block") {
    return (
      <div
        id={node.id}
        onClick={(e) => {
          if (isBuilder && onSelectNode && node.id) {
            e.stopPropagation();
            onSelectNode(node.id);
          }
        }}
        className={`w-full transition-all relative ${
          isSelected ? "ring-2 ring-[#9D61FF] rounded-2xl shadow-lg" : ""
        } ${isBuilder ? "cursor-pointer hover:ring-1 hover:ring-purple-400/50 rounded-2xl" : ""}`}
      >
        <RenderBlockLeaf
          block={node}
          isPrint={isPrint}
          chartsCatalog={chartsCatalog}
          metricsCatalog={metricsCatalog}
          insightsCatalog={insightsCatalog}
        />
      </div>
    );
  }

  // 2. Column Node
  if (node.type === "column") {
    const span = node.span || 12;
    const spanClass = getColumnSpanClass(span);

    // Determine layout inside this column:
    // If all children are rows -> stacked rows (flex-col)
    // If all children are columns -> nested grid (grid-cols-12)
    // If children are mixed or blocks -> flex-col with gap
    const childrenAreRows = node.children.length > 0 && node.children.every((c) => c.type === "row");
    const childrenAreColumns = node.children.length > 0 && node.children.every((c) => c.type === "column");

    return (
      <div
        id={node.id}
        onClick={(e) => {
          if (isBuilder && onSelectNode && node.id) {
            e.stopPropagation();
            onSelectNode(node.id);
          }
        }}
        style={{
          // Ensure minmax(0, 1fr) behavior so nested charts never overflow horizontally
          minWidth: 0,
        }}
        className={`${spanClass} min-w-0 transition-all ${
          isSelected ? "ring-2 ring-[#9D61FF] bg-purple-500/5 rounded-2xl p-2" : ""
        } ${
          isBuilder
            ? "relative border border-dashed border-slate-300 dark:border-zinc-800 hover:border-[#9D61FF]/60 rounded-2xl p-2 cursor-pointer"
            : ""
        }`}
      >
        {isBuilder && (
          <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-zinc-500 pb-1 px-1">
            <span>Col (Span: {span}/12)</span>
            <span>Depth {depth}</span>
          </div>
        )}

        {childrenAreColumns ? (
          // Side-by-side nested columns
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full">
            {node.children.map((child) => (
              <LayoutNodeRenderer
                key={child.id || Math.random().toString()}
                node={child}
                depth={depth + 1}
                isPrint={isPrint}
                isBuilder={isBuilder}
                selectedNodeId={selectedNodeId}
                onSelectNode={onSelectNode}
                chartsCatalog={chartsCatalog}
                metricsCatalog={metricsCatalog}
                insightsCatalog={insightsCatalog}
              />
            ))}
          </div>
        ) : (
          // Stacked rows or blocks (flex column with 16px gap)
          <div className="flex flex-col gap-4 w-full h-full min-w-0">
            {node.children.length === 0 ? (
              isBuilder && (
                <div className="w-full py-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-xl flex flex-col items-center justify-center text-xs text-slate-400">
                  <span>Empty Column &middot; Drop assets or add nested row</span>
                </div>
              )
            ) : (
              node.children.map((child) => (
                <LayoutNodeRenderer
                  key={child.id || Math.random().toString()}
                  node={child}
                  depth={depth + 1}
                  isPrint={isPrint}
                  isBuilder={isBuilder}
                  selectedNodeId={selectedNodeId}
                  onSelectNode={onSelectNode}
                  chartsCatalog={chartsCatalog}
                  metricsCatalog={metricsCatalog}
                  insightsCatalog={insightsCatalog}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  }

  // 3. Row Node (12-Column CSS Grid)
  const isRoot = depth === 1;

  return (
    <div
      id={node.id}
      onClick={(e) => {
        if (isBuilder && onSelectNode && node.id) {
          e.stopPropagation();
          onSelectNode(node.id);
        }
      }}
      className={`w-full transition-all ${
        isSelected ? "ring-2 ring-[#9D61FF] bg-purple-500/5 rounded-2xl p-2 shadow-sm" : ""
      } ${
        isBuilder
          ? "border border-dashed border-slate-200 dark:border-zinc-800 hover:border-purple-400/60 rounded-2xl p-2.5 my-1"
          : ""
      }`}
    >
      {isBuilder && (
        <div className="flex items-center justify-between text-[9px] font-mono text-slate-400 dark:text-zinc-500 pb-1.5 px-1">
          <span className="font-bold text-[#9D61FF]">
            {isRoot ? "Root 12-Col Row" : `Nested Row (Depth ${depth})`}
          </span>
          <span>{node.children.length} items</span>
        </div>
      )}

      {/* 12-Column Responsive CSS Grid: Columns collapse to single stack below 768px (md) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 w-full items-stretch">
        {node.children.length === 0 ? (
          isBuilder && (
            <div className="col-span-12 py-8 border-2 border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center justify-center text-xs text-slate-400">
              <span>Empty Row &middot; Add a Column (1-12 span)</span>
            </div>
          )
        ) : (
          node.children.map((child) => (
            <LayoutNodeRenderer
              key={child.id || Math.random().toString()}
              node={child}
              depth={depth + 1}
              isPrint={isPrint}
              isBuilder={isBuilder}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              chartsCatalog={chartsCatalog}
              metricsCatalog={metricsCatalog}
              insightsCatalog={insightsCatalog}
            />
          ))
        )}
      </div>
    </div>
  );
}
