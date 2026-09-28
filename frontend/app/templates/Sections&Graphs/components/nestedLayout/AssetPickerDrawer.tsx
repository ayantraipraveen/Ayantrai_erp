"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  Search,
  BarChart2,
  TrendingUp,
  Activity,
  Lightbulb,
  FileText,
  Plus,
  Layers,
  Sparkles,
  PieChart,
} from "lucide-react";
import {
  LayoutBlockNode,
  LibraryChartCard,
  LibraryMetricCard,
  LibraryKeyInsightItem,
  LibrarySection,
} from "@/lib/redux/types/reportModuleTypes";
import ChartRenderer from "../ChartRenderer";

export interface AssetPickerDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  targetColumnId: string | null;
  onSelectBlock: (block: LayoutBlockNode) => void;
  chartsCatalog: LibraryChartCard[];
  metricsCatalog: LibraryMetricCard[];
  insightsCatalog: LibraryKeyInsightItem[];
  sectionsCatalog: LibrarySection[];
}

type AssetCategory = "all" | "charts" | "metrics" | "insights" | "sections";

export default function AssetPickerDrawer({
  isOpen,
  onClose,
  targetColumnId,
  onSelectBlock,
  chartsCatalog,
  metricsCatalog,
  insightsCatalog,
  sectionsCatalog,
}: AssetPickerDrawerProps) {
  const [category, setCategory] = useState<AssetCategory>("all");
  const [search, setSearch] = useState("");

  const filteredCharts = useMemo(() => {
    return chartsCatalog.filter((c) =>
      c.title.toLowerCase().includes(search.toLowerCase()) ||
      c.chartType.toLowerCase().includes(search.toLowerCase()) ||
      (c.description || "").toLowerCase().includes(search.toLowerCase())
    );
  }, [chartsCatalog, search]);

  const filteredMetrics = useMemo(() => {
    return metricsCatalog.filter((m) =>
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.value.toLowerCase().includes(search.toLowerCase())
    );
  }, [metricsCatalog, search]);

  const filteredInsights = useMemo(() => {
    return insightsCatalog.filter((i) =>
      i.text.toLowerCase().includes(search.toLowerCase())
    );
  }, [insightsCatalog, search]);

  const filteredSections = useMemo(() => {
    return sectionsCatalog.filter((s) =>
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.eyebrow.toLowerCase().includes(search.toLowerCase())
    );
  }, [sectionsCatalog, search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="w-full max-w-md bg-white dark:bg-[#0c1017] border-l border-slate-200 dark:border-zinc-800 p-5 flex flex-col justify-between h-full shadow-2xl animate-slideLeft text-slate-900 dark:text-white">
        {/* Drawer Header */}
        <div className="flex-shrink-0 space-y-3 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#9D61FF]/15 text-[#9D61FF] flex items-center justify-center font-bold text-xs">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Reusable Asset Library</h3>
                <p className="text-[11px] text-slate-400">
                  {targetColumnId ? `Target: Column ${targetColumnId}` : "Select target column to insert"}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search charts, metrics, insights..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px] font-semibold">
            {(["all", "charts", "metrics", "insights", "sections"] as AssetCategory[]).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-2.5 py-1 rounded-lg capitalize transition-colors cursor-pointer whitespace-nowrap ${
                  category === cat
                    ? "bg-[#9D61FF] text-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Scrollable Asset List */}
        <div className="flex-1 min-h-0 overflow-y-auto py-4 space-y-4 pr-1">
          {/* 1. Charts */}
          {(category === "all" || category === "charts") && filteredCharts.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <BarChart2 className="w-3 h-3 text-[#9D61FF]" />
                <span>Telemetry Charts ({filteredCharts.length})</span>
              </span>
              <div className="space-y-2">
                {filteredCharts.map((chart) => (
                  <div
                    key={chart.id}
                    onClick={() => {
                      onSelectBlock({
                        id: `block-chart-${Date.now()}`,
                        type: "block",
                        blockType: "chart",
                        refId: chart.id,
                        title: chart.title,
                        data: chart,
                      });
                      onClose();
                    }}
                    className="group border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF] rounded-xl p-3 bg-slate-50/60 dark:bg-zinc-900/60 hover:bg-[#9D61FF]/5 transition-all cursor-pointer space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-[#9D61FF]">
                        {chart.title}
                      </h4>
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-[#9D61FF] font-semibold uppercase">
                        {chart.chartType}
                      </span>
                    </div>
                    {chart.description && (
                      <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                        {chart.description}
                      </p>
                    )}
                    <div className="flex justify-end pt-1">
                      <span className="text-[10px] text-[#9D61FF] font-bold flex items-center gap-1 group-hover:underline">
                        <Plus className="w-3 h-3" /> Insert Chart
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 2. Metric Cards */}
          {(category === "all" || category === "metrics") && filteredMetrics.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Activity className="w-3 h-3 text-emerald-500" />
                <span>KPI Metric Cards ({filteredMetrics.length})</span>
              </span>
              <div className="grid grid-cols-2 gap-2">
                {filteredMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    onClick={() => {
                      onSelectBlock({
                        id: `block-metric-${Date.now()}`,
                        type: "block",
                        blockType: "metric-card",
                        refId: metric.id,
                        title: metric.label,
                        data: metric,
                      });
                      onClose();
                    }}
                    className="border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF] rounded-xl p-2.5 bg-slate-50/60 dark:bg-zinc-900/60 hover:bg-[#9D61FF]/5 transition-all cursor-pointer flex flex-col justify-between"
                  >
                    <span className="text-[10px] text-slate-500 font-semibold truncate">
                      {metric.label}
                    </span>
                    <span className="text-base font-black font-mono text-slate-900 dark:text-white mt-1">
                      {metric.value}
                    </span>
                    <span className="text-[9px] text-[#9D61FF] font-bold mt-2 flex items-center gap-0.5">
                      <Plus className="w-2.5 h-2.5" /> Insert
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Key Insights */}
          {(category === "all" || category === "insights") && filteredInsights.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Lightbulb className="w-3 h-3 text-amber-500" />
                <span>Key Insights ({filteredInsights.length})</span>
              </span>
              <div className="space-y-2">
                {filteredInsights.map((insight) => (
                  <div
                    key={insight.id}
                    onClick={() => {
                      onSelectBlock({
                        id: `block-insight-${Date.now()}`,
                        type: "block",
                        blockType: "key-insights",
                        refId: insight.id,
                        title: "Supervisory Observation",
                        data: insight,
                      });
                      onClose();
                    }}
                    className="border-l-4 border-l-[#9D61FF] border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF] rounded-r-xl p-3 bg-purple-500/5 hover:bg-purple-500/10 transition-all cursor-pointer"
                  >
                    <p className="text-xs text-slate-700 dark:text-zinc-300 line-clamp-2">
                      {insight.text}
                    </p>
                    <span className="text-[10px] text-[#9D61FF] font-bold mt-1.5 flex items-center gap-1">
                      <Plus className="w-3 h-3" /> Insert Insight Box
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Section Templates */}
          {(category === "all" || category === "sections") && filteredSections.length > 0 && (
            <div className="space-y-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold flex items-center gap-1">
                <Layers className="w-3 h-3 text-blue-500" />
                <span>Saved Section Modules ({filteredSections.length})</span>
              </span>
              <div className="space-y-2">
                {filteredSections.map((sec) => (
                  <div
                    key={sec.id}
                    onClick={() => {
                      onSelectBlock({
                        id: `block-section-${Date.now()}`,
                        type: "block",
                        blockType: "section",
                        refId: sec.id,
                        title: sec.name,
                        data: {
                          eyebrow: sec.eyebrow,
                          description: sec.description,
                        },
                      });
                      onClose();
                    }}
                    className="border border-slate-200 dark:border-zinc-800 hover:border-[#9D61FF] rounded-xl p-3 bg-slate-50/60 dark:bg-zinc-900/60 hover:bg-[#9D61FF]/5 transition-all cursor-pointer space-y-1"
                  >
                    <span className="text-[9px] font-mono uppercase text-[#9D61FF] font-bold">
                      {sec.eyebrow}
                    </span>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {sec.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-1">
                      {sec.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="flex-shrink-0 pt-3 border-t border-slate-200 dark:border-zinc-800 flex justify-between items-center text-xs">
          <span className="text-slate-400">Click any asset to insert</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
