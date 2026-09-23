"use client";

import React, { useState, useMemo } from "react";
import {
  X,
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
  Info,
  CheckCircle2,
  Search,
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
  type?: string;
}

/**
 * Dedicated Master Catalog Modal for Sections & Graphs.
 * Allows admins to view, add, edit, and delete report sections and their attached graphs.
 * Any added or modified section is instantly available across the Template Builder.
 */
export default function SectionsCatalogModal() {
  const {
    sectionsModalOpen,
    setSectionsModalOpen,
    globalSections,
    handleAddGlobalSection,
    handleUpdateGlobalSection,
    handleDeleteGlobalSection,
    handleAddGraphToSection,
    handleUpdateGraphInSection,
    handleDeleteGraphFromSection,
  } = useTemplates();

  // Search filter inside the catalog modal
  const [search, setSearch] = useState("");

  // Expanded sections accordion
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});

  // Section create/edit draft
  const [sectionDraft, setSectionDraft] = useState<SectionDraftState | null>(null);

  // Graph create/edit draft
  const [graphDraft, setGraphDraft] = useState<GraphDraftState | null>(null);

  // Filtered sections list
  const filteredSections = useMemo(() => {
    if (!search.trim()) return globalSections;
    const q = search.toLowerCase();
    return globalSections.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.graphs?.some((g) => g.title.toLowerCase().includes(q))
    );
  }, [globalSections, search]);

  const totalGraphsCount = useMemo(() => {
    return globalSections.reduce((sum, s) => sum + (s.graphs?.length || 0), 0);
  }, [globalSections]);

  const toggleExpand = (id: string) => {
    setExpandedSectionIds((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleOpenAddSection = () => {
    setSectionDraft({
      title: "",
      description: "",
    });
  };

  const handleOpenEditSection = (sec: TemplateBlock) => {
    setSectionDraft({
      sectionId: sec.id,
      title: sec.title,
      description: sec.description,
      type: sec.type,
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
        type: `custom_${sectionDraft.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
        title: sectionDraft.title.trim(),
        description:
          sectionDraft.description.trim() ||
          "Custom telemetry module configured for specialized site audit requirements.",
        enabled: true,
        isCustom: true,
        graphs: [],
      });
    }
    setSectionDraft(null);
  };

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

  if (!sectionsModalOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-[#0a0d14] border border-slate-200 dark:border-zinc-800 rounded-2xl flex flex-col shadow-2xl overflow-hidden text-slate-900 dark:text-white animate-scaleUp">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-4 flex-shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-purple-500/10 text-[#9D61FF] border border-purple-500/20">
                <Layers className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  Sections & Telemetry Graphs Catalog
                </h3>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Manage standard audit sections and attached graph blueprints. All updates synchronize with the Template Builder.
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1.5 font-mono text-xs px-3 py-1 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700">
              <span className="h-1.5 w-1.5 rounded-full bg-[#9D61FF]" />
              <span>{globalSections.length} Sections</span>
              <span className="text-slate-400">•</span>
              <span>{totalGraphsCount} Graphs</span>
            </span>

            <button
              type="button"
              onClick={() => setSectionsModalOpen(false)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Toolbar: Search + Add Section Button */}
        <div className="px-5 sm:px-6 py-3 border-b border-slate-100 dark:border-zinc-800/80 bg-slate-50/70 dark:bg-zinc-900/40 flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sections or attached graphs..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF]"
            />
          </div>

          <button
            type="button"
            onClick={handleOpenAddSection}
            className="px-3.5 py-1.5 rounded-xl glow-btn-primary font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Section</span>
          </button>
        </div>

        {/* Scrollable Center: Section List */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-3.5">
          {filteredSections.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-200 dark:border-zinc-800 rounded-2xl text-slate-400 dark:text-zinc-500 text-xs">
              No sections found matching "{search}". Click "Add New Section" to create one.
            </div>
          ) : (
            filteredSections.map((sec, idx) => {
              const isExpanded = Boolean(expandedSectionIds[sec.id]);
              const graphs = sec.graphs || [];

              return (
                <div
                  key={sec.id}
                  className="rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] shadow-sm hover:border-[#9D61FF]/40 transition-colors"
                >
                  {/* Section Bar */}
                  <div className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[#9D61FF]/10 text-[#9D61FF] font-mono text-xs flex items-center justify-center font-bold flex-shrink-0">
                        #{idx + 1}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                            {sec.title}
                          </span>
                          {sec.isCustom ? (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                              Custom Section
                            </span>
                          ) : (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold bg-purple-500/10 text-[#9D61FF] border-purple-500/30">
                              Core Preset
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                            • {graphs.length} {graphs.length === 1 ? "graph" : "graphs"}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5 truncate max-w-xl">
                          {sec.description}
                        </p>
                      </div>
                    </div>

                    {/* Actions: Edit, Delete, Expand */}
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        type="button"
                        onClick={() => handleOpenEditSection(sec)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-[#9D61FF] dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer"
                        title="Edit section details"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>

                      {sec.isCustom && (
                        <button
                          type="button"
                          onClick={() => handleDeleteGlobalSection(sec.id)}
                          className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/40 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete section"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => toggleExpand(sec.id)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-[#9D61FF] dark:text-zinc-400 dark:hover:text-white transition-colors cursor-pointer ml-1"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Expanded: Attached Graphs */}
                  {isExpanded && (
                    <div className="border-t border-slate-100 dark:border-zinc-800/80 p-4 bg-slate-50/60 dark:bg-zinc-900/30 space-y-3 animate-fadeIn">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                          <BarChart2 className="w-3.5 h-3.5 text-[#9D61FF]" />
                          Attached Visualizations ({graphs.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleOpenAddGraph(sec.id)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold text-[#9D61FF] hover:bg-purple-500/10 border border-purple-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                          <span>Attach Graph</span>
                        </button>
                      </div>

                      {graphs.length === 0 ? (
                        <div className="text-center py-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400 dark:text-zinc-500 text-xs">
                          No charts attached to this section. Click "Attach Graph" to add one.
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          {graphs.map((g) => {
                            const ds = GRAPH_DATA_SOURCES.find((d) => d.id === g.dataSource);
                            return (
                              <div
                                key={g.id}
                                className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0d13] flex flex-col justify-between space-y-2 group shadow-sm hover:border-[#9D61FF]/40 transition-colors"
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2.5 min-w-0">
                                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 flex-shrink-0 mt-0.5">
                                      {getGraphIcon(g.type)}
                                    </div>
                                    <div className="min-w-0">
                                      <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                        {g.title}
                                      </div>
                                      <div className="text-[10px] font-mono text-[#9D61FF] truncate">
                                        Source: {ds ? ds.label : g.dataSource}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1 flex-shrink-0">
                                    <button
                                      type="button"
                                      onClick={() => handleOpenEditGraph(sec.id, g)}
                                      className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                      title="Edit graph"
                                    >
                                      <Edit2 className="w-3 h-3" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteGraphFromSection(sec.id, g.id)}
                                      className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                      title="Delete graph"
                                    >
                                      <Trash2 className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                {g.description && (
                                  <div className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1 border-t border-slate-100 dark:border-zinc-800/80 pt-1">
                                    {g.description}
                                  </div>
                                )}
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

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between flex-shrink-0 bg-slate-50/50 dark:bg-zinc-900/30">
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            Sections and graphs configured here appear immediately inside the <span className="text-[#9D61FF] font-semibold">Template Builder</span>.
          </div>
          <button
            type="button"
            onClick={() => setSectionsModalOpen(false)}
            className="px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
          >
            Close Catalog
          </button>
        </div>

        {/* Sub-Modal: Add/Edit Section */}
        {sectionDraft && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0d111a] p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#9D61FF]" />
                  <span>{sectionDraft.sectionId ? "Edit Section Blueprint" : "Add New Report Section"}</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setSectionDraft(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">
                    Section Title *
                  </label>
                  <input
                    type="text"
                    value={sectionDraft.title}
                    onChange={(e) =>
                      setSectionDraft((prev) => (prev ? { ...prev, title: e.target.value } : null))
                    }
                    placeholder="e.g. Geotechnical Air Quality & Toxic Gas Log"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">
                    Audit Description & Objectives
                  </label>
                  <textarea
                    rows={3}
                    value={sectionDraft.description}
                    onChange={(e) =>
                      setSectionDraft((prev) =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                    placeholder="Describe what telemetry sources, checks, and compliance guidelines are covered in this section."
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSectionDraft(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveSectionDraft}
                  disabled={!sectionDraft.title.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#9D61FF] hover:bg-[#8845fc] disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Save Section
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sub-Modal: Add/Edit Graph */}
        {graphDraft && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0d111a] p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#9D61FF]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {graphDraft.graphId ? "Edit Graph Configuration" : "Attach Graph to Section"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setGraphDraft(null)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">
                    Graph Title / Figure Label *
                  </label>
                  <input
                    type="text"
                    value={graphDraft.title}
                    onChange={(e) =>
                      setGraphDraft((prev) => (prev ? { ...prev, title: e.target.value } : null))
                    }
                    placeholder="e.g. Subcontractor Daily Headcount Distribution"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 block">
                    Visualization Type
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-1.5">
                    {GRAPH_TYPES.map((gt) => (
                      <button
                        key={gt.type}
                        type="button"
                        onClick={() =>
                          setGraphDraft((prev) => (prev ? { ...prev, type: gt.type } : null))
                        }
                        className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          graphDraft.type === gt.type
                            ? "border-[#9D61FF] bg-[#9D61FF]/15 text-[#9D61FF] font-bold"
                            : "border-slate-200 dark:border-zinc-800 hover:border-slate-300 text-slate-600 dark:text-zinc-400"
                        }`}
                      >
                        {getGraphIcon(gt.type)}
                        <span className="text-[10px]">{gt.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300 mb-1 block">
                    Telemetry Data Source Field (Migrated ERP)
                  </label>
                  <select
                    value={graphDraft.dataSource}
                    onChange={(e) =>
                      setGraphDraft((prev) => (prev ? { ...prev, dataSource: e.target.value } : null))
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                  >
                    {GRAPH_DATA_SOURCES.map((ds) => (
                      <option key={ds.id} value={ds.id}>
                        [{ds.group}] {ds.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-zinc-300">
                    Figure Caption / Analytical Insight Note
                  </label>
                  <textarea
                    rows={2}
                    value={graphDraft.description}
                    onChange={(e) =>
                      setGraphDraft((prev) =>
                        prev ? { ...prev, description: e.target.value } : null
                      )
                    }
                    placeholder="Brief explanation of data thresholds and anomaly filters applied in this chart."
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setGraphDraft(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGraphDraft}
                  disabled={!graphDraft.title.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#9D61FF] hover:bg-[#8845fc] disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Save Graph
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}