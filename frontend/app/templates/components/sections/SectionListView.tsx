"use client";

import React, { useState, useMemo } from "react";
import {
  Layers,
  Search,
  Plus,
  Edit2,
  Trash2,
  Copy,
  ChevronRight,
  BarChart2,
  TrendingUp,
  PieChart,
  Table as TableIcon,
  ShieldCheck,
  Sparkles,
  Lock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Eye,
  Sliders,
  Database,
  Cpu,
  Activity,
  Calendar,
  X,
  PlusCircle,
  ArrowLeft,
  Stamp,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  LibrarySection,
  createLibrarySection,
  duplicateLibrarySection,
  deleteLibrarySection,
  showGlobalToast,
  addChartToSection,
  GraphType,
} from "@/lib/redux/slices/reportModuleSlice";
import { Tooltip } from "@/app/Component";
import ChartEditorPanel from "./ChartEditorPanel";

interface SectionListViewProps {
  onSelectSection: (sectionId: string) => void;
  onBackToTemplates?: () => void;
}

type FilterType = "all" | "core" | "custom";

/**
 * Dedicated Section & Graph Management List View.
 * Displays all reusable report sections and attached telemetry charts independent of templates.
 */
export default function SectionListView({ onSelectSection, onBackToTemplates }: SectionListViewProps) {
  const dispatch = useAppDispatch();
  const librarySections = useAppSelector((state) => state.reportModule.librarySections || []);
  const activeRole = useAppSelector((state) => state.reportModule.activeRole);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  // Create section modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionEyebrow, setNewSectionEyebrow] = useState("");
  const [newSectionDesc, setNewSectionDesc] = useState("");

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Chart editor state for direct list-view telemetry authoring
  const [chartEditorOpen, setChartEditorOpen] = useState(false);
  const [chartTitle, setChartTitle] = useState("");
  const [chartType, setChartType] = useState<GraphType>("bar");
  const [chartDesc, setChartDesc] = useState("");
  const [chartColor, setChartColor] = useState("#9D61FF");
  const [chartColors, setChartColors] = useState<string[]>(["#9D61FF"]);
  const [gridRows, setGridRows] = useState(4);
  const [gridCols, setGridCols] = useState(7);

  const handleOpenChartEditor = () => {
    setChartTitle("");
    setChartType("bar");
    setChartDesc("");
    setChartColor("#9D61FF");
    setChartColors(["#9D61FF"]);
    setGridRows(4);
    setGridCols(7);
    setChartEditorOpen(true);
    
  };

  const handleSaveChartFromListView = () => {
    if (!chartTitle.trim()) {
      dispatch(showGlobalToast({ message: "Please provide a chart title.", type: "warning" }));
      return;
    }

    const finalColors = chartColors && chartColors.length > 0 ? chartColors : [chartColor];
    const targetSection = librarySections[0];

    if (targetSection) {
      dispatch(
        addChartToSection({
          sectionId: targetSection.id,
          chart: {
            title: chartTitle.trim(),
            chartType,
            dataSourceField: "custom_telemetry_feed",
            description: chartDesc.trim(),
            color: chartColor,
            colors: finalColors,
            gridRows: (chartType === "heatmap" || chartType === "table") ? gridRows : undefined,
            gridCols: (chartType === "heatmap" || chartType === "table") ? gridCols : undefined,
          },
        })
      );
      dispatch(showGlobalToast({ message: `Chart added to "${targetSection.name}"!`, type: "success" }));
    } else {
      dispatch(showGlobalToast({ message: "Telemetry chart saved!", type: "success" }));
    }

    setChartEditorOpen(false);
  };

  // Statistics
  const coreSectionsCount = useMemo(
    () => librarySections.filter((s) => s.type === "core").length,
    [librarySections]
  );
  const customSectionsCount = useMemo(
    () => librarySections.filter((s) => s.type === "custom").length,
    [librarySections]
  );
  const totalCardsCount = useMemo(
    () => librarySections.reduce((sum, s) => sum + (s.metricCards?.length || 0), 0),
    [librarySections]
  );
  const totalChartsCount = useMemo(
    () => librarySections.reduce((sum, s) => sum + (s.charts?.length || 0), 0),
    [librarySections]
  );

  // Filtered sections list
  const filteredSections = useMemo(() => {
    let list = librarySections;

    if (filterType === "core") {
      list = list.filter((s) => s.type === "core");
    } else if (filterType === "custom") {
      list = list.filter((s) => s.type === "custom");
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.eyebrow.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.charts?.some((c) => c.title.toLowerCase().includes(q)) ||
          s.metricCards?.some((m) => m.label.toLowerCase().includes(q))
      );
    }

    return list;
  }, [librarySections, filterType, search]);

  const handleCreateSection = () => {
    if (!newSectionName.trim()) {
      dispatch(showGlobalToast({ message: "Please provide a section name.", type: "warning" }));
      return;
    }

    const name = newSectionName.trim();
    const eyebrow = newSectionEyebrow.trim() || "CUSTOM MODULE";
    const description = newSectionDesc.trim() || "Custom reusable report section with attached telemetry.";

    dispatch(
      createLibrarySection({
        name,
        eyebrow,
        description,
        metricCards: [],
        charts: [],
        keyInsights: [],
      })
    );

    dispatch(showGlobalToast({ message: `Section "${name}" created!`, type: "success" }));
    setNewSectionName("");
    setNewSectionEyebrow("");
    setNewSectionDesc("");
    setCreateModalOpen(false);
  };

  const handleDuplicate = (id: string, name: string) => {
    dispatch(duplicateLibrarySection(id));
    dispatch(showGlobalToast({ message: `Duplicated "${name}".`, type: "success" }));
  };

  const handleDelete = (id: string, name: string) => {
    dispatch(deleteLibrarySection(id));
    setDeleteConfirmId(null);
    dispatch(showGlobalToast({ message: `Deleted custom section "${name}".`, type: "info" }));
  };

  if (chartEditorOpen) {
    return (
      <ChartEditorPanel
        editingChart={null}
        chartTitle={chartTitle}
        setChartTitle={setChartTitle}
        chartType={chartType}
        setChartType={setChartType}
        chartDesc={chartDesc}
        setChartDesc={setChartDesc}
        chartColor={chartColor}
        setChartColor={setChartColor}
        chartColors={chartColors}
        setChartColors={setChartColors}
        gridRows={gridRows}
        setGridRows={setGridRows}
        gridCols={gridCols}
        setGridCols={setGridCols}
        onSave={handleSaveChartFromListView}
        onClose={() => setChartEditorOpen(false)}
      />
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-7 space-y-3.5 animate-fadeIn">
      {/* 1. TOP METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 flex-shrink-0">
        <div className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Total Sections</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {librarySections.length}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-[#9D61FF]">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Core Standards</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {coreSectionsCount}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Custom Modules</div>
            <div className="text-lg font-bold text-amber-500 font-mono mt-0.5">
              {customSectionsCount}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Total Visualizations</div>
            <div className="text-lg font-bold text-sky-600 dark:text-sky-400 font-mono mt-0.5">
              {totalCardsCount} cards • {totalChartsCount} charts
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
            <BarChart2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] flex items-center justify-between gap-3 flex-wrap flex-shrink-0 shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-[220px] max-w-md h-9">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reusable sections by title, category, or graph..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF]"
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({librarySections.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("core")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === "core"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Core Standards ({coreSectionsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("custom")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === "custom"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Custom Added ({customSectionsCount})
          </button>
        </div>

        {/* Actions: Back to Blueprints + Create Section */}
        <div className="flex items-center gap-2">
          {/* Chart Button */}
          <button
            type="button"
            onClick={handleOpenChartEditor}
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-[#9D61FF]/40 hover:text-[#9D61FF]"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#9D61FF]" />
            <span>Chart</span>
          </button>

          {/* Watermark Button */}
          <button
            type="button"
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm hover:border-[#9D61FF]/40 hover:text-[#9D61FF]"
          >
            <Stamp className="w-3.5 h-3.5 text-[#9D61FF]" />
            <span>Watermark</span>
          </button>

          {/* Create Section Action */}
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="h-9 px-4 rounded-xl glow-btn-primary font-bold text-xs cursor-pointer flex items-center gap-2 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Create Section</span>
          </button>
        </div>
      </div>

      {/* 3. SECTION CARDS GRID */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {filteredSections.length === 0 ? (
          <div className="py-20 text-center border border-dashed border-slate-200 dark:border-zinc-800 rounded-3xl bg-white/40 dark:bg-[#0c1017]/40 p-8 space-y-3">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-zinc-200">No sections found</h3>
            <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              No report sections matched your search criteria. Try modifying your filter or create a new section.
            </p>
            <button
              type="button"
              onClick={() => setCreateModalOpen(true)}
              className="mt-2 px-4 py-2 rounded-xl bg-[#9D61FF] text-white text-xs font-bold hover:bg-[#8845fc] inline-flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create New Section</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3.5 pb-6">
            {filteredSections.map((sec, idx) => {
              const cardsCount = sec.metricCards?.length || 0;
              const chartsCount = sec.charts?.length || 0;
              const insightsCount = sec.keyInsights?.length || 0;

              return (
                <div
                  key={sec.id}
                  className="rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] shadow-sm hover:border-[#9D61FF]/50 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden group"
                >
                  {/* Card Header & Content */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono uppercase font-bold tracking-wider text-[#9D61FF] bg-purple-500/10 px-2 py-0.5 rounded-md border border-purple-500/20">
                            {sec.eyebrow}
                          </span>
                          {sec.type === "core" ? (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold uppercase flex items-center gap-1">
                              <Lock className="w-2.5 h-2.5" />
                              Core Standard
                            </span>
                          ) : (
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold uppercase flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              Custom
                            </span>
                          )}
                        </div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-[#9D61FF] transition-colors">
                          {sec.name}
                        </h2>
                      </div>

                      <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-zinc-800/80 text-slate-500 dark:text-zinc-400 flex items-center justify-center font-mono text-xs font-bold flex-shrink-0">
                        #{idx + 1}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                      {sec.description}
                    </p>

                    {/* Stats pills */}
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-blue-500" />
                        <span>{cardsCount} {cardsCount === 1 ? "Metric Card" : "Metric Cards"}</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-purple-500" />
                        <span>{chartsCount} {chartsCount === 1 ? "Chart" : "Charts"}</span>
                      </div>
                      <div className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-mono text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                        <div className="w-2 h-2 rounded-full bg-emerald-500" />
                        <span>{insightsCount} Insights</span>
                      </div>
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="p-3 sm:px-5 sm:py-3.5 border-t border-slate-100 dark:border-zinc-800/80 bg-slate-50/50 dark:bg-zinc-950/40 flex items-center justify-between gap-2">
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 truncate">
                      Updated {sec.updatedAt}
                    </span>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(sec.id, sec.name)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                        title="Duplicate Section"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete (only for custom) */}
                      {sec.type === "custom" && (
                        <button
                          type="button"
                          onClick={() => setDeleteConfirmId(sec.id)}
                          className="p-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Custom Section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Open Visual Canvas Editor */}
                      <button
                        type="button"
                        onClick={() => onSelectSection(sec.id)}
                        className="h-8 px-3 rounded-xl bg-[#9D61FF] hover:bg-[#8845fc] text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Visual Canvas</span>
                        <ArrowUpRight className="w-3 h-3 opacity-70" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ================= MODAL: CREATE NEW SECTION ================= */}
      {createModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-[#9D61FF]">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">Create New Report Section</h3>
              </div>
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Section Title *
                </label>
                <input
                  type="text"
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g. Geotechnical Settlement & Excavation Telemetry"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Eyebrow Label (Report Sub-Header Tag)
                </label>
                <input
                  type="text"
                  value={newSectionEyebrow}
                  onChange={(e) => setNewSectionEyebrow(e.target.value)}
                  placeholder="e.g. GEOTECHNICAL ANALYSIS"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Audit Scope & Description
                </label>
                <textarea
                  rows={3}
                  value={newSectionDesc}
                  onChange={(e) => setNewSectionDesc(e.target.value)}
                  placeholder="Describe the compliance criteria, safety thresholds, and telemetry metrics tracked in this block."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSection}
                disabled={!newSectionName.trim()}
                className="px-5 py-2 rounded-xl bg-[#9D61FF] hover:bg-[#8845fc] text-white text-xs font-bold disabled:opacity-50 cursor-pointer shadow-sm"
              >
                Create Section
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white text-center">
            <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Delete Custom Section?</h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400 mt-1">
                Are you sure you want to delete this custom section from the library? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  const sec = librarySections.find((s) => s.id === deleteConfirmId);
                  if (sec) handleDelete(sec.id, sec.name);
                }}
                className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold cursor-pointer"
              >
                Delete Section
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
