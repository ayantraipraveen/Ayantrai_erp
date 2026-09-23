"use client";

import React, { useState, useMemo } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit2,
  ChevronDown,
  ChevronUp,
  BarChart2,
  TrendingUp,
  PieChart,
  Grid,
  Table as TableIcon,
  Layers,
  Sparkles,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  X,
  PlusCircle,
  FolderGit2,
  Database,
  Eye,
} from "lucide-react";
import { useTemplates, GRAPH_TYPES, GRAPH_DATA_SOURCES } from "./TemplatesContext";
import {
  TemplateBlock,
  TemplateGraphConfig,
  GraphType,
} from "@/lib/redux/slices/reportModuleSlice";

interface GraphDraftState {
  sectionId: string;
  graphId?: string;
  title: string;
  type: GraphType;
  dataSource: string;
  description: string;
}

interface SectionDraftState {
  sectionId?: string;
  title: string;
  description: string;
}

type SectionFilterType = "all" | "core" | "custom" | "with_graphs";

/**
 * Dedicated Master Catalog View for Sections & Graphs.
 * Uses the COMPLETE PAGE LAYOUT of Templates Hub (no popup window).
 * Allows admins to view, add, edit, and delete report sections and attached telemetry graphs.
 * All updates synchronize seamlessly with the Template Builder.
 */
export default function SectionsCatalogView() {
  const {
    setSectionsModalOpen,
    setBuilderOpen,
    globalSections,
    handleAddGlobalSection,
    handleUpdateGlobalSection,
    handleDeleteGlobalSection,
    handleAddGraphToSection,
    handleUpdateGraphInSection,
    handleDeleteGraphFromSection,
  } = useTemplates();

  // Search query & category filter
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<SectionFilterType>("all");

  // Expanded sections state
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    globalSections.forEach((s) => {
      if (s.graphs && s.graphs.length > 0) {
        initial[s.id] = true;
      }
    });
    return initial;
  });

  // Section create/edit draft state
  const [sectionDraft, setSectionDraft] = useState<SectionDraftState | null>(null);

  // Graph create/edit draft state
  const [graphDraft, setGraphDraft] = useState<GraphDraftState | null>(null);

  // Delete section confirmation state
  const [confirmDeleteSectionId, setConfirmDeleteSectionId] = useState<string | null>(null);

  // Filtered list of sections
  const filteredSections = useMemo(() => {
    let list = globalSections;

    // Filter by type
    if (filterType === "core") {
      list = list.filter((s) => !s.isCustom);
    } else if (filterType === "custom") {
      list = list.filter((s) => s.isCustom);
    } else if (filterType === "with_graphs") {
      list = list.filter((s) => (s.graphs?.length || 0) > 0);
    }

    // Filter by search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.graphs?.some(
            (g) =>
              g.title.toLowerCase().includes(q) ||
              g.dataSource.toLowerCase().includes(q) ||
              (g.description && g.description.toLowerCase().includes(q))
          )
      );
    }

    return list;
  }, [globalSections, filterType, search]);

  // Overall Statistics
  const coreSectionsCount = useMemo(
    () => globalSections.filter((s) => !s.isCustom).length,
    [globalSections]
  );
  const customSectionsCount = useMemo(
    () => globalSections.filter((s) => s.isCustom).length,
    [globalSections]
  );
  const totalGraphsCount = useMemo(
    () => globalSections.reduce((sum, s) => sum + (s.graphs?.length || 0), 0),
    [globalSections]
  );

  const toggleExpand = (id: string) => {
    setExpandedSectionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const expandAll = () => {
    const all: Record<string, boolean> = {};
    globalSections.forEach((s) => {
      all[s.id] = true;
    });
    setExpandedSectionIds(all);
  };

  const collapseAll = () => {
    setExpandedSectionIds({});
  };

  // Section actions
  const handleOpenAddSection = () => {
    setSectionDraft({
      title: "",
      description: "",
    });
  };

  const handleOpenEditSection = (section: TemplateBlock) => {
    setSectionDraft({
      sectionId: section.id,
      title: section.title,
      description: section.description,
    });
  };

  const handleSaveSectionDraft = () => {
    if (!sectionDraft || !sectionDraft.title.trim()) return;

    if (sectionDraft.sectionId) {
      handleUpdateGlobalSection({
        id: sectionDraft.sectionId,
        title: sectionDraft.title.trim(),
        description: sectionDraft.description.trim(),
      });
    } else {
      handleAddGlobalSection({
        type: `custom_${Date.now()}`,
        title: sectionDraft.title.trim(),
        description: sectionDraft.description.trim(),
        enabled: true,
        isCustom: true,
        graphs: [],
      });
    }

    setSectionDraft(null);
  };

  const handleConfirmDeleteSection = (sectionId: string) => {
    handleDeleteGlobalSection(sectionId);
    setConfirmDeleteSectionId(null);
  };

  // Graph actions
  const handleOpenAddGraph = (sectionId: string) => {
    setGraphDraft({
      sectionId,
      title: "",
      type: "bar",
      dataSource: GRAPH_DATA_SOURCES[0].id,
      description: "",
    });
  };

  const handleOpenEditGraph = (sectionId: string, graph: TemplateGraphConfig) => {
    setGraphDraft({
      sectionId,
      graphId: graph.id,
      title: graph.title,
      type: graph.type,
      dataSource: graph.dataSource,
      description: graph.description || "",
    });
  };

  const handleSaveGraphDraft = () => {
    if (!graphDraft || !graphDraft.title.trim()) return;

    if (graphDraft.graphId) {
      handleUpdateGraphInSection(graphDraft.sectionId, {
        id: graphDraft.graphId,
        title: graphDraft.title.trim(),
        type: graphDraft.type,
        dataSource: graphDraft.dataSource,
        description: graphDraft.description.trim(),
      });
    } else {
      handleAddGraphToSection(graphDraft.sectionId, {
        title: graphDraft.title.trim(),
        type: graphDraft.type,
        dataSource: graphDraft.dataSource,
        description: graphDraft.description.trim(),
      });
    }

    // Automatically expand the section so user sees the newly attached graph
    setExpandedSectionIds((prev) => ({ ...prev, [graphDraft.sectionId]: true }));
    setGraphDraft(null);
  };

  const getGraphIcon = (type: GraphType) => {
    switch (type) {
      case "bar":
        return <BarChart2 className="w-3.5 h-3.5 text-purple-400" />;
      case "line":
        return <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />;
      case "pie":
      case "donut":
        return <PieChart className="w-3.5 h-3.5 text-amber-400" />;
      case "table":
        return <TableIcon className="w-3.5 h-3.5 text-sky-400" />;
      default:
        return <Grid className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-7 py-2 sm:py-3 space-y-3">
      {/* 1. TOP HEADER & BREADCRUMB STRIP (Complete Page Layout) */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 flex-wrap border-b border-slate-200 dark:border-zinc-800/80 pb-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setSectionsModalOpen(false)}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer shadow-sm hover:border-[#9D61FF]/40"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#9D61FF]" />
            <span>Back to Templates</span>
          </button>

          <div className="h-5 w-[1px] bg-slate-200 dark:border-zinc-800 hidden sm:block" />

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#9D61FF] font-bold">
                Governance Blueprint Library
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-purple-500/10 text-[#9D61FF] font-mono text-[9px] border border-purple-500/20">
                100% In-Sync with Builder
              </span>
            </div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#9D61FF]" />
              <span>Sections & Telemetry Graphs Catalog</span>
            </h1>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setBuilderOpen(true)}
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-800 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Template</span>
          </button>

          <button
            type="button"
            onClick={handleOpenAddSection}
            className="h-9 px-4 rounded-xl glow-btn-primary font-bold text-xs cursor-pointer flex items-center justify-center gap-2 flex-shrink-0"
          >
            <PlusCircle className="w-4 h-4" />
            <span>+ Add New Section</span>
          </button>
        </div>
      </div>

      {/* 2. DEDICATED METRICS SUMMARY STRIP */}
      <div className="flex-shrink-0 grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
        {/* Metric 1: Total Sections */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Total Sections
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {globalSections.length}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-purple-500/10 text-[#9D61FF]">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 2: Core Modules */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Core Standard Modules
            </div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {coreSectionsCount}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 3: Custom Modules */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Custom Added Sections
            </div>
            <div className="text-lg font-bold text-amber-500 dark:text-amber-400 font-mono mt-0.5">
              {customSectionsCount}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        {/* Metric 4: Attached Graphs */}
        <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">
              Attached Telemetry Graphs
            </div>
            <div className="text-lg font-bold text-purple-600 dark:text-purple-400 font-mono mt-0.5">
              {totalGraphsCount}
            </div>
          </div>
          <div className="p-2 rounded-xl bg-purple-500/10 text-[#9D61FF]">
            <BarChart2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 3. TOOLBAR: SEARCH & CATEGORY FILTER */}
      <div className="flex-shrink-0 flex items-center justify-between gap-3 flex-wrap p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017]">
        {/* Left: Search input */}
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search section name, audit objective, graph or telemetry feed..."
            className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF]"
          />
        </div>

        {/* Middle: Category filter tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-xs">
          <button
            type="button"
            onClick={() => setFilterType("all")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              filterType === "all"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({globalSections.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("core")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              filterType === "core"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Core ({coreSectionsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("custom")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              filterType === "custom"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Custom ({customSectionsCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("with_graphs")}
            className={`px-2.5 py-1 rounded-md font-medium transition-all cursor-pointer ${
              filterType === "with_graphs"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-semibold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            With Graphs
          </button>
        </div>

        {/* Right: Expand / Collapse All buttons */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={expandAll}
            className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Expand All
          </button>
          <span className="text-slate-300 dark:text-zinc-700">•</span>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2 py-1 rounded-lg text-[11px] font-medium text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
          >
            Collapse All
          </button>
        </div>
      </div>

      {/* 4. MAIN SCROLLABLE CONTENT: SECTION CARDS & ATTACHED GRAPHS */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-3">
        {filteredSections.length === 0 ? (
          <div className="text-center py-16 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl bg-white/50 dark:bg-[#0c1017]/50 p-6 space-y-3">
            <Layers className="w-10 h-10 text-slate-400 mx-auto" />
            <div className="text-sm font-semibold text-slate-800 dark:text-zinc-200">
              No matching sections found
            </div>
            <div className="text-xs text-slate-500 dark:text-zinc-400 max-w-sm mx-auto">
              Try adjusting your search criteria or create a new section using "+ Add New Section".
            </div>
            <button
              type="button"
              onClick={handleOpenAddSection}
              className="mt-2 px-3.5 py-1.5 rounded-xl bg-[#9D61FF] text-white text-xs font-bold hover:bg-[#8845fc] cursor-pointer inline-flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Create New Section</span>
            </button>
          </div>
        ) : (
          filteredSections.map((section, idx) => {
            const isExpanded = Boolean(expandedSectionIds[section.id]);
            const graphs = section.graphs || [];

            return (
              <div
                key={section.id}
                className="rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] shadow-sm hover:border-[#9D61FF]/40 transition-all overflow-hidden"
              >
                {/* Section Header Card Bar */}
                <div className="p-4 sm:p-5 flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row bg-gradient-to-r from-transparent via-transparent to-purple-500/5">
                  <div className="flex items-start sm:items-center gap-3.5 min-w-0">
                    {/* Index / Icon Badge */}
                    <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 text-[#9D61FF] flex items-center justify-center font-bold text-xs flex-shrink-0 mt-0.5 sm:mt-0 font-mono">
                      #{idx + 1}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {section.title}
                        </h2>

                        {section.isCustom ? (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                            Custom Section
                          </span>
                        ) : (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md border uppercase font-bold bg-purple-500/10 text-[#9D61FF] border-purple-500/30">
                            Core Standard
                          </span>
                        )}

                        <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                          • {graphs.length} {graphs.length === 1 ? "Graph Configured" : "Graphs Configured"}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl leading-relaxed">
                        {section.description}
                      </p>
                    </div>
                  </div>

                  {/* Right Action Buttons */}
                  <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                    {/* Edit Section Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEditSection(section)}
                      className="h-8 px-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                      title="Edit section details"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit</span>
                    </button>

                    {/* Delete Custom Section */}
                    {section.isCustom && (
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteSectionId(section.id)}
                        className="h-8 px-2.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Delete custom section"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete</span>
                      </button>
                    )}

                    {/* Attach Graph Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenAddGraph(section.id)}
                      className="h-8 px-3 rounded-lg border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-[#9D61FF] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>+ Attach Graph</span>
                    </button>

                    {/* Accordion Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(section.id)}
                      className="h-8 w-8 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-[#9D61FF] hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center justify-center transition-colors cursor-pointer ml-1"
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Area: Attached Graphs Cards */}
                {isExpanded && (
                  <div className="border-t border-slate-100 dark:border-zinc-800/80 p-4 sm:p-5 bg-slate-50/50 dark:bg-zinc-950/60 space-y-3.5 animate-fadeIn">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-2">
                        <BarChart2 className="w-3.5 h-3.5 text-[#9D61FF]" />
                        <span>Attached Telemetry Visualizations & Graphs ({graphs.length})</span>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleOpenAddGraph(section.id)}
                        className="text-xs font-semibold text-[#9D61FF] hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Attach New Graph</span>
                      </button>
                    </div>

                    {graphs.length === 0 ? (
                      <div className="text-center py-6 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl bg-white dark:bg-[#0c1017] text-slate-400 dark:text-zinc-500 text-xs space-y-1.5">
                        <p>No graphs currently configured for this section.</p>
                        <button
                          type="button"
                          onClick={() => handleOpenAddGraph(section.id)}
                          className="text-[#9D61FF] font-semibold hover:underline inline-flex items-center gap-1"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Attach first graph now</span>
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {graphs.map((graph) => {
                          const ds = GRAPH_DATA_SOURCES.find((d) => d.id === graph.dataSource);

                          return (
                            <div
                              key={graph.id}
                              className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] hover:border-[#9D61FF]/50 transition-all flex flex-col justify-between space-y-3 group shadow-sm"
                            >
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-center gap-2">
                                    <div className="p-2 rounded-lg bg-slate-100 dark:bg-zinc-800 flex-shrink-0">
                                      {getGraphIcon(graph.type)}
                                    </div>
                                    <div>
                                      <div className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">
                                        {graph.title}
                                      </div>
                                      <div className="text-[10px] font-mono uppercase tracking-wider text-purple-600 dark:text-purple-400">
                                        {graph.type.toUpperCase()} CHART
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditGraph(section.id, graph)}
                                      className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                                      title="Edit graph"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGraphFromSection(section.id, graph.id)}
                                      className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-500/10 transition-colors cursor-pointer"
                                      title="Delete graph"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="text-[11px] text-slate-500 dark:text-zinc-400 line-clamp-2">
                                  {graph.description || "Live sensor telemetry feed with threshold alerting."}
                                </div>
                              </div>

                              <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                                <div className="flex items-center gap-1.5 truncate">
                                  <Database className="w-3 h-3 text-[#9D61FF] flex-shrink-0" />
                                  <span className="truncate">{ds ? ds.label : graph.dataSource}</span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* ================= MODAL: ADD / EDIT SECTION DRAFT ================= */}
      {sectionDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#9D61FF]" />
                <h3 className="text-sm font-bold">
                  {sectionDraft.sectionId ? "Edit Report Section" : "Add New Report Section"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSectionDraft(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Section Title *
                </label>
                <input
                  type="text"
                  value={sectionDraft.title}
                  onChange={(e) =>
                    setSectionDraft((prev) => (prev ? { ...prev, title: e.target.value } : null))
                  }
                  placeholder="e.g. Geotechnical Air Quality & Toxic Gas Telemetry"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Audit Objective & Description
                </label>
                <textarea
                  rows={3}
                  value={sectionDraft.description}
                  onChange={(e) =>
                    setSectionDraft((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  placeholder="Summarize the compliance metrics, sensory thresholds, and inspection guidelines tracked by this section."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setSectionDraft(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveSectionDraft}
                disabled={!sectionDraft.title.trim()}
                className="px-4 py-1.5 rounded-xl bg-[#9D61FF] hover:bg-[#8845fc] text-white text-xs font-bold disabled:opacity-50"
              >
                {sectionDraft.sectionId ? "Save Changes" : "Create Section"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: ADD / EDIT GRAPH DRAFT ================= */}
      {graphDraft && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#9D61FF]" />
                <h3 className="text-sm font-bold">
                  {graphDraft.graphId ? "Edit Telemetry Graph" : "Attach New Telemetry Graph"}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setGraphDraft(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Graph Title *
                </label>
                <input
                  type="text"
                  value={graphDraft.title}
                  onChange={(e) =>
                    setGraphDraft((prev) => (prev ? { ...prev, title: e.target.value } : null))
                  }
                  placeholder="e.g. H2S & CO Toxic Gas Sensor PPM Levels (Continuous)"
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              {/* Chart Type Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Visualization Chart Type
                </label>
                <div className="grid grid-cols-5 gap-2 mt-1.5">
                  {GRAPH_TYPES.map((gt) => (
                    <button
                      key={gt.type}
                      type="button"
                      onClick={() =>
                        setGraphDraft((prev) => (prev ? { ...prev, type: gt.type } : null))
                      }
                      className={`p-2 rounded-xl border flex flex-col items-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
                        graphDraft.type === gt.type
                          ? "border-[#9D61FF] bg-purple-500/10 text-[#9D61FF]"
                          : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                      }`}
                    >
                      {getGraphIcon(gt.type)}
                      <span>{gt.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Data Source Selector */}
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Telemetry / Muster Data Source Stream
                </label>
                <select
                  value={graphDraft.dataSource}
                  onChange={(e) =>
                    setGraphDraft((prev) => (prev ? { ...prev, dataSource: e.target.value } : null))
                  }
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                >
                  {GRAPH_DATA_SOURCES.map((ds) => (
                    <option key={ds.id} value={ds.id}>
                      [{ds.group}] {ds.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                  Figure Caption / Subtitle Note
                </label>
                <input
                  type="text"
                  value={graphDraft.description}
                  onChange={(e) =>
                    setGraphDraft((prev) =>
                      prev ? { ...prev, description: e.target.value } : null
                    )
                  }
                  placeholder="e.g. Figure 2.1: Real-time sensor threshold telemetry sampled per minute."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                onClick={() => setGraphDraft(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveGraphDraft}
                disabled={!graphDraft.title.trim()}
                className="px-4 py-1.5 rounded-xl bg-[#9D61FF] hover:bg-[#8845fc] text-white text-xs font-bold disabled:opacity-50"
              >
                {graphDraft.graphId ? "Save Graph" : "Attach Graph"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: CONFIRM DELETE SECTION ================= */}
      {confirmDeleteSectionId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 shadow-2xl space-y-4 animate-scaleUp text-slate-900 dark:text-white">
            <div className="flex items-center gap-2 text-rose-500">
              <Trash2 className="w-5 h-5" />
              <h3 className="text-sm font-bold">Delete Custom Section?</h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-zinc-400">
              Are you sure you want to delete this custom section and all its attached graphs from the master catalog? Templates referencing this section can still keep their saved snapshot.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setConfirmDeleteSectionId(null)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleConfirmDeleteSection(confirmDeleteSectionId)}
                className="px-4 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-bold"
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
