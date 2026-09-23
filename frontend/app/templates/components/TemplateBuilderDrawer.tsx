"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  X,
  MoveUp,
  MoveDown,
  Sparkles,
  Save,
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
  FileText,
  Eye,
  CheckCircle2,
  Building,
  Info,
  Calendar,
  ShieldCheck,
  HardHat,
  Cpu,
  ArrowRight,
  Sliders,
} from "lucide-react";
import { CustomDropdown, Tooltip } from "../../Component";
import {
  useTemplates,
  availableBlockTypes,
  GRAPH_TYPES,
  GRAPH_DATA_SOURCES,
} from "./TemplatesContext";
import {
  TemplateBlock,
  TemplateGraphConfig,
  GraphType,
} from "@/lib/redux/slices/reportModuleSlice";

type BuilderTab = "general" | "sections" | "preview";

interface GraphDraftState {
  sectionId: string;
  graphId?: string;
  title: string;
  type: GraphType;
  dataSource: string;
  description: string;
}

/**
 * Slide-out visual builder drawer for creating and editing report templates.
 * Includes "Sections & Graphs" tab with drag/move, core/custom section creation,
 * per-section multiple graph configurations, and live report structure preview.
 */
export default function TemplateBuilderDrawer() {
  const {
    builderOpen,
    setBuilderOpen,
    siteBuilderOptions,
    handleCreateTemplate,
    handleUpdateTemplate,
    editingTemplate,
    setEditingTemplate,
    sites,
    globalSections,
  } = useTemplates();

  // Active Tab
  const [activeTab, setActiveTab] = useState<BuilderTab>("general");

  // Form Fields
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || "SITE-01");

  // Blocks & Graphs State initialized from master catalog
  const [builderBlocks, setBuilderBlocks] = useState<TemplateBlock[]>(() =>
    globalSections.map((b, idx) => ({
      ...b,
      order: idx + 1,
      enabled: true,
      graphs: b.graphs ? [...b.graphs] : [],
    }))
  );

  // Accordion state: which sections are expanded in the Sections & Graphs tab
  const [expandedSectionIds, setExpandedSectionIds] = useState<Record<string, boolean>>({});

  // Custom Section Modal / Inline state
  const [isAddingSection, setIsAddingSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [newSectionDesc, setNewSectionDesc] = useState("");

  // Graph Modal / Inline state
  const [activeGraphDraft, setActiveGraphDraft] = useState<GraphDraftState | null>(null);

  const isEditing = Boolean(editingTemplate);

  // Sync state when drawer opens or editing template changes or globalSections change
  useEffect(() => {
    if (editingTemplate) {
      setTemplateName(editingTemplate.name);
      setTemplateDesc(editingTemplate.description);
      setSelectedSiteId(editingTemplate.site_id);
      setActiveTab("general");

      const existingBlockMap = new Map(editingTemplate.blocks.map((b) => [b.id || b.type, b]));

      // Merge with master global sections
      const initialized = globalSections.map((b, idx) => {
        const found =
          editingTemplate.blocks.find((x) => x.id === b.id || x.type === b.type) ||
          existingBlockMap.get(b.type);
        return {
          ...b,
          id: found?.id || b.id,
          enabled: Boolean(found && found.enabled !== false),
          order: found?.order ?? idx + 1,
          graphs: found?.graphs || b.graphs || [],
        };
      });

      // Include any custom sections created specifically in this template
      const extraCustomBlocks = editingTemplate.blocks.filter(
        (b) => !globalSections.some((gs) => gs.id === b.id || gs.type === b.type)
      );
      const combined = [...initialized, ...extraCustomBlocks];
      combined.sort((a, b) => a.order - b.order);

      setBuilderBlocks(combined);

      const firstEnabled = combined.find((b) => b.enabled);
      if (firstEnabled) {
        setExpandedSectionIds({ [firstEnabled.id]: true });
      }
    } else {
      setTemplateName("");
      setTemplateDesc("");
      setSelectedSiteId(sites[0]?.id || "SITE-01");
      setActiveTab("general");

      const initial = globalSections.map((b, idx) => ({
        ...b,
        enabled: true,
        order: idx + 1,
        graphs: b.graphs ? [...b.graphs] : [],
      }));

      setBuilderBlocks(initial);
      if (initial[0]) {
        setExpandedSectionIds({ [initial[0].id]: true });
      }
    }
  }, [editingTemplate, sites, builderOpen, globalSections]);

  // Section handlers
  const toggleBlock = (index: number) => {
    setBuilderBlocks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], enabled: !next[index].enabled };
      return next;
    });
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === builderBlocks.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    setBuilderBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((b, i) => ({ ...b, order: i + 1 }));
    });
  };

  const toggleSectionExpand = (sectionId: string) => {
    setExpandedSectionIds((prev) => ({
      ...prev,
      [sectionId]: !prev[sectionId],
    }));
  };

  const handleCreateCustomSection = () => {
    if (!newSectionTitle.trim()) return;
    const newBlock: TemplateBlock = {
      id: `blk-custom-${Date.now()}`,
      type: `custom_${newSectionTitle.toLowerCase().replace(/[^a-z0-9]/g, "_")}`,
      title: newSectionTitle.trim(),
      description:
        newSectionDesc.trim() || "Custom section configured for specialized site audit requirements.",
      enabled: true,
      order: builderBlocks.length + 1,
      isCustom: true,
      graphs: [],
    };
    setBuilderBlocks((prev) => [...prev, newBlock]);
    setExpandedSectionIds((prev) => ({ ...prev, [newBlock.id]: true }));
    setNewSectionTitle("");
    setNewSectionDesc("");
    setIsAddingSection(false);
  };

  const handleDeleteCustomSection = (sectionId: string) => {
    setBuilderBlocks((prev) =>
      prev.filter((b) => b.id !== sectionId).map((b, i) => ({ ...b, order: i + 1 }))
    );
  };

  // Graph handlers
  const handleOpenAddGraph = (sectionId: string) => {
    setActiveGraphDraft({
      sectionId,
      title: "",
      type: "bar",
      dataSource: GRAPH_DATA_SOURCES[0].id,
      description: "",
    });
  };

  const handleOpenEditGraph = (sectionId: string, graph: TemplateGraphConfig) => {
    setActiveGraphDraft({
      sectionId,
      graphId: graph.id,
      title: graph.title,
      type: graph.type,
      dataSource: graph.dataSource,
      description: graph.description || "",
    });
  };

  const handleSaveGraphDraft = () => {
    if (!activeGraphDraft || !activeGraphDraft.title.trim()) return;

    setBuilderBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== activeGraphDraft.sectionId) return block;

        const existingGraphs = block.graphs || [];
        if (activeGraphDraft.graphId) {
          // Editing existing graph
          const updated = existingGraphs.map((g) =>
            g.id === activeGraphDraft.graphId
              ? {
                  ...g,
                  title: activeGraphDraft.title.trim(),
                  type: activeGraphDraft.type,
                  dataSource: activeGraphDraft.dataSource,
                  description: activeGraphDraft.description.trim(),
                }
              : g
          );
          return { ...block, graphs: updated };
        } else {
          // Adding new graph
          const newGraph: TemplateGraphConfig = {
            id: `grp-${Date.now()}`,
            title: activeGraphDraft.title.trim(),
            type: activeGraphDraft.type,
            dataSource: activeGraphDraft.dataSource,
            description: activeGraphDraft.description.trim(),
          };
          return { ...block, graphs: [...existingGraphs, newGraph] };
        }
      })
    );

    setActiveGraphDraft(null);
  };

  const handleDeleteGraph = (sectionId: string, graphId: string) => {
    setBuilderBlocks((prev) =>
      prev.map((block) => {
        if (block.id !== sectionId) return block;
        return {
          ...block,
          graphs: (block.graphs || []).filter((g) => g.id !== graphId),
        };
      })
    );
  };

  // Live Summary Calculations
  const enabledSections = useMemo(
    () => builderBlocks.filter((b) => b.enabled),
    [builderBlocks]
  );

  const totalGraphsCount = useMemo(() => {
    return enabledSections.reduce((sum, b) => sum + (b.graphs?.length || 0), 0);
  }, [enabledSections]);

  const selectedSite = sites.find((s) => s.id === selectedSiteId) || sites[0];

  // Submit / Save
  const onSubmit = (status: "pending" | "draft") => {
    if (isEditing && editingTemplate) {
      const success = handleUpdateTemplate(
        editingTemplate.id,
        templateName,
        templateDesc,
        selectedSiteId,
        builderBlocks,
        status
      );
      if (success) {
        setTemplateName("");
        setTemplateDesc("");
      }
    } else {
      const success = handleCreateTemplate(
        templateName,
        templateDesc,
        selectedSiteId,
        builderBlocks,
        status
      );
      if (success) {
        setTemplateName("");
        setTemplateDesc("");
      }
    }
  };

  // Helper icon for Graph Type
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

  const handleClose = () => {
    setEditingTemplate(null);
    setBuilderOpen(false);
    setActiveGraphDraft(null);
    setIsAddingSection(false);
  };

  if (!builderOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-3xl bg-white dark:bg-[#0a0d13] border-l border-slate-200 dark:border-zinc-800 p-5 sm:p-6 flex flex-col justify-between h-full shadow-2xl animate-slideLeft text-slate-900 dark:text-white transition-all">
        {/* Top Header */}
        <div className="flex-shrink-0 space-y-4 pb-4 border-b border-slate-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] font-mono text-[#9D61FF] uppercase font-bold tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-[#9D61FF]" />
                <span>
                  {isEditing
                    ? `Edit Blueprint • ${editingTemplate?.id} (${editingTemplate?.version})`
                    : "Interactive Report Builder"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5">
                {isEditing ? "Edit Safety Report Template" : "New Safety Report Template"}
              </h2>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Builder Navigation Tabs & Live Counter Strip */}
          <div className="flex items-center justify-between gap-2 flex-wrap pt-1">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800/80">
              <button
                type="button"
                onClick={() => setActiveTab("general")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "general"
                    ? "bg-white dark:bg-zinc-800 text-[#9D61FF] shadow-sm font-bold"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Info className="w-3.5 h-3.5" />
                <span>General Info</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("sections")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "sections"
                    ? "bg-white dark:bg-zinc-800 text-[#9D61FF] shadow-sm font-bold"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Sections & Graphs</span>
                <span className="font-mono text-[10px] px-1.5 py-0.2 rounded-full bg-purple-500/15 text-[#9D61FF]">
                  {enabledSections.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-white dark:bg-zinc-800 text-[#9D61FF] shadow-sm font-bold"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Report Preview</span>
              </button>
            </div>

            {/* Live Indicator Pill */}
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-mono font-medium px-2.5 py-1 rounded-full bg-slate-100 dark:bg-zinc-900/90 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-800">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                <span>
                  {enabledSections.length} {enabledSections.length === 1 ? "Section" : "Sections"}
                </span>
                <span className="text-slate-400 dark:text-zinc-600">•</span>
                <span>
                  {totalGraphsCount} {totalGraphsCount === 1 ? "Graph" : "Graphs"}
                </span>
              </span>
            </div>
          </div>
        </div>

        {/* Scrollable Center Body */}
        <div className="flex-1 min-h-0 overflow-y-auto py-5 pr-1 space-y-5">
          {/* ================= TAB 1: GENERAL INFO ================= */}
          {activeTab === "general" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50 dark:bg-zinc-900/60 p-4 rounded-xl border border-slate-200 dark:border-zinc-800 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Template Name *
                  </label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g. Monthly Subcontractor Safety & Geotechnical Audit"
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                  />
                  <p className="text-[11px] text-slate-400 dark:text-zinc-500 mt-1">
                    Unique title that identifies this statutory audit report layout across sites.
                  </p>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 block">
                    Target Industrial Site
                  </label>
                  <CustomDropdown
                    options={siteBuilderOptions}
                    value={selectedSiteId}
                    onChange={setSelectedSiteId}
                    size="sm"
                    placeholder="Select site..."
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                    Operational Scope / Description
                  </label>
                  <textarea
                    rows={3}
                    value={templateDesc}
                    onChange={(e) => setTemplateDesc(e.target.value)}
                    placeholder="Describe the report scope, connected sensors (BLE Mesh, 4G hubs), and audit criteria."
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                  />
                </div>
              </div>

              {/* Quick Info Box */}
              <div className="p-3.5 rounded-xl border border-purple-500/20 bg-purple-500/5 text-xs text-purple-700 dark:text-purple-300 space-y-1">
                <div className="font-semibold flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>ISO 45001 Compliance Architecture</span>
                </div>
                <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                  After saving, this template will be submitted for Superadmin governance approval. Once approved, the system automatically schedules monthly PDF compliance generation and attaches cryptographic audit hashes.
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("sections")}
                  className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-zinc-800 text-white text-xs font-bold flex items-center gap-2 hover:bg-[#9D61FF] dark:hover:bg-[#9D61FF] transition-all cursor-pointer"
                >
                  <span>Proceed to Sections & Graphs</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= TAB 2: SECTIONS & GRAPHS ================= */}
          {activeTab === "sections" && (
            <div className="space-y-4 animate-fadeIn">
              {/* Section Header with + Add Section button */}
              <div className="flex items-center justify-between gap-3 flex-wrap">
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Report Sections & Telemetry Graphs
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Toggle sections ON/OFF, reorder report sequence, and attach graphs to each section.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setIsAddingSection(true)}
                  className="px-3 py-1.5 rounded-xl border border-purple-500/40 bg-purple-500/10 hover:bg-purple-500/20 text-[#9D61FF] text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Add Section</span>
                </button>
              </div>

              {/* Inline Custom Section Creator Form */}
              {isAddingSection && (
                <div className="p-4 rounded-xl border border-purple-500/40 bg-purple-500/5 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#9D61FF] flex items-center gap-1.5">
                      <Plus className="w-3.5 h-3.5" />
                      Create Custom Report Section
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsAddingSection(false)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-300"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                      Section Title *
                    </label>
                    <input
                      type="text"
                      value={newSectionTitle}
                      onChange={(e) => setNewSectionTitle(e.target.value)}
                      placeholder="e.g. Geotechnical Air Quality & Toxic Gas Log"
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300">
                      Description / Audit Objective
                    </label>
                    <input
                      type="text"
                      value={newSectionDesc}
                      onChange={(e) => setNewSectionDesc(e.target.value)}
                      placeholder="e.g. Real-time optical air density, PPM metrics, and threshold alarms."
                      className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-[#9D61FF]"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingSection(false)}
                      className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleCreateCustomSection}
                      disabled={!newSectionTitle.trim()}
                      className="px-3.5 py-1.5 rounded-lg bg-[#9D61FF] hover:bg-[#8845fc] disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-sm"
                    >
                      Add Custom Section
                    </button>
                  </div>
                </div>
              )}

              {/* Sections Accordion List */}
              <div className="space-y-3">
                {builderBlocks.map((block, idx) => {
                  const isExpanded = Boolean(expandedSectionIds[block.id]);
                  const graphs = block.graphs || [];

                  return (
                    <div
                      key={block.id}
                      className={`rounded-xl border transition-all ${
                        block.enabled
                          ? "border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] shadow-sm"
                          : "border-slate-200/60 dark:border-zinc-800/40 opacity-60 bg-slate-50 dark:bg-zinc-950"
                      }`}
                    >
                      {/* Section Summary Row */}
                      <div className="p-3.5 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {/* Toggle switch */}
                          <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={block.enabled}
                              onChange={() => toggleBlock(idx)}
                              className="sr-only peer"
                            />
                            <div className="w-8 h-4 bg-slate-300 dark:bg-zinc-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-[#9D61FF]"></div>
                          </label>

                          <div className="min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono text-[10px] text-slate-400 dark:text-zinc-500">
                                #{idx + 1}
                              </span>
                              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                                {block.title}
                              </span>
                              {block.isCustom ? (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30">
                                  Custom
                                </span>
                              ) : (
                                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold bg-purple-500/10 text-[#9D61FF] border-purple-500/30">
                                  Core
                                </span>
                              )}
                              <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                                • {graphs.length} {graphs.length === 1 ? "graph" : "graphs"}
                              </span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400 truncate mt-0.5 max-w-md">
                              {block.description}
                            </div>
                          </div>
                        </div>

                        {/* Controls: Reorder + Expand */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, "up")}
                            disabled={idx === 0}
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title="Move section up"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, "down")}
                            disabled={idx === builderBlocks.length - 1}
                            className="p-1.5 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800"
                            title="Move section down"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>

                          {block.isCustom && (
                            <button
                              type="button"
                              onClick={() => handleDeleteCustomSection(block.id)}
                              className="p-1.5 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer rounded-lg hover:bg-rose-500/10"
                              title="Delete custom section"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => toggleSectionExpand(block.id)}
                            className="p-1.5 text-slate-400 hover:text-[#9D61FF] transition-colors cursor-pointer rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 ml-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4" />
                            ) : (
                              <ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Section Detail: Graphs Sub-Area */}
                      {isExpanded && (
                        <div className="border-t border-slate-100 dark:border-zinc-800/80 p-3.5 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3 animate-fadeIn">
                          <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
                              <BarChart2 className="w-3.5 h-3.5 text-[#9D61FF]" />
                              Attached Graphs & Telemetry Visualizations ({graphs.length})
                            </span>
                            <button
                              type="button"
                              onClick={() => handleOpenAddGraph(block.id)}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-semibold text-[#9D61FF] hover:bg-purple-500/10 border border-purple-500/30 flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                              <span>+ Add Graph</span>
                            </button>
                          </div>

                          {/* List of Graphs inside this section */}
                          {graphs.length === 0 ? (
                            <div className="text-center py-4 border border-dashed border-slate-200 dark:border-zinc-800 rounded-xl text-slate-400 dark:text-zinc-500 text-[11px]">
                              No graphs attached to this section yet. Click "+ Add Graph" to configure charts.
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                              {graphs.map((graph) => {
                                const ds = GRAPH_DATA_SOURCES.find((d) => d.id === graph.dataSource);
                                return (
                                  <div
                                    key={graph.id}
                                    className="p-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0d13] flex flex-col justify-between space-y-2 group shadow-sm hover:border-[#9D61FF]/40 transition-colors"
                                  >
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex items-start gap-2 min-w-0">
                                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-zinc-800 flex-shrink-0 mt-0.5">
                                          {getGraphIcon(graph.type)}
                                        </div>
                                        <div className="min-w-0">
                                          <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                                            {graph.title}
                                          </div>
                                          <div className="text-[10px] font-mono text-[#9D61FF] truncate">
                                            Source: {ds ? ds.label : graph.dataSource}
                                          </div>
                                        </div>
                                      </div>

                                      <div className="flex items-center gap-1 flex-shrink-0">
                                        <button
                                          type="button"
                                          onClick={() => handleOpenEditGraph(block.id, graph)}
                                          className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                                          title="Edit graph"
                                        >
                                          <Edit2 className="w-3 h-3" />
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleDeleteGraph(block.id, graph.id)}
                                          className="p-1 text-slate-400 hover:text-rose-500 transition-colors cursor-pointer"
                                          title="Delete graph"
                                        >
                                          <Trash2 className="w-3 h-3" />
                                        </button>
                                      </div>
                                    </div>

                                    {graph.description && (
                                      <div className="text-[10px] text-slate-500 dark:text-zinc-400 line-clamp-1 border-t border-slate-100 dark:border-zinc-800/80 pt-1">
                                        {graph.description}
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
                })}
              </div>
            </div>
          )}

          {/* ================= TAB 3: REPORT PREVIEW ================= */}
          {activeTab === "preview" && (
            <div className="space-y-4 animate-fadeIn">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/40 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-2.5">
                  <span className="text-xs font-bold text-slate-900 dark:text-white uppercase font-mono tracking-wider flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-[#9D61FF]" />
                    Simulated Report PDF Sequence
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold">
                    ISO 45001 Structure Ready
                  </span>
                </div>

                {/* 1. Cover Page */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0d13] space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-[#9D61FF] font-bold">
                      PAGE 1 • COVER PAGE
                    </span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                      Standard Template Stamped
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {templateName || "Untitled Safety Report Template"}
                  </h4>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400 flex items-center gap-2">
                    <Building className="w-3.5 h-3.5 text-[#9D61FF]" />
                    <span>{selectedSite.name}</span>
                    <span>•</span>
                    <span>AyantrAI Telemetry Engine</span>
                  </div>
                </div>

                {/* 2. Ordered Section Blocks */}
                <div className="space-y-2">
                  <div className="text-[11px] font-semibold text-slate-600 dark:text-zinc-400">
                    Compiled Sections & Attached Graph Figures:
                  </div>

                  {enabledSections.map((sec, i) => (
                    <div
                      key={sec.id}
                      className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0b0e15] space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-[#9D61FF]/15 text-[#9D61FF] font-mono text-[10px] flex items-center justify-center font-bold">
                            {i + 1}
                          </span>
                          <span className="text-xs font-bold text-slate-900 dark:text-white">
                            {sec.title}
                          </span>
                          {sec.isCustom && (
                            <span className="text-[9px] font-mono px-1 py-0.2 rounded bg-amber-500/10 text-amber-500 border border-amber-500/30">
                              Custom
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                          {sec.graphs?.length || 0} Figures
                        </span>
                      </div>

                      {sec.graphs && sec.graphs.length > 0 && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-zinc-800/60">
                          {sec.graphs.map((g, gIdx) => (
                            <div
                              key={g.id}
                              className="p-2 rounded-lg bg-slate-50 dark:bg-zinc-900/60 border border-slate-200 dark:border-zinc-800 flex items-center gap-2 text-[11px]"
                            >
                              <div className="p-1 rounded bg-slate-200 dark:bg-zinc-800 flex-shrink-0">
                                {getGraphIcon(g.type)}
                              </div>
                              <div className="min-w-0">
                                <div className="font-semibold text-slate-800 dark:text-zinc-200 truncate">
                                  Fig {i + 1}.{gIdx + 1}: {g.title}
                                </div>
                                <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase">
                                  {g.type} chart • {g.dataSource}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                {/* 3. Back Page / Audit Signoff */}
                <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0a0d13] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                      PAGE {enabledSections.length + 2} • AUDIT STAMP & BACK PAGE
                    </span>
                    <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                      Cryptographic Stamping
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-zinc-400">
                    Statutory Labour Inspectorate sign-off block with SHA-256 digital signature and immutable timestamp.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal: Add/Edit Graph Configuration Panel */}
        {activeGraphDraft && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
            <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0d111a] p-5 shadow-2xl space-y-4 text-slate-900 dark:text-white">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
                <div className="flex items-center gap-2">
                  <BarChart2 className="w-4 h-4 text-[#9D61FF]" />
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeGraphDraft.graphId ? "Edit Graph Configuration" : "Attach New Graph to Section"}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveGraphDraft(null)}
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
                    value={activeGraphDraft.title}
                    onChange={(e) =>
                      setActiveGraphDraft((prev) => (prev ? { ...prev, title: e.target.value } : null))
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
                          setActiveGraphDraft((prev) => (prev ? { ...prev, type: gt.type } : null))
                        }
                        className={`p-2 rounded-xl border text-center flex flex-col items-center gap-1 transition-all cursor-pointer ${
                          activeGraphDraft.type === gt.type
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
                    value={activeGraphDraft.dataSource}
                    onChange={(e) =>
                      setActiveGraphDraft((prev) =>
                        prev ? { ...prev, dataSource: e.target.value } : null
                      )
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
                    value={activeGraphDraft.description}
                    onChange={(e) =>
                      setActiveGraphDraft((prev) =>
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
                  onClick={() => setActiveGraphDraft(null)}
                  className="px-3 py-1.5 rounded-xl text-xs text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveGraphDraft}
                  disabled={!activeGraphDraft.title.trim()}
                  className="px-4 py-1.5 rounded-xl bg-[#9D61FF] hover:bg-[#8845fc] disabled:opacity-50 text-white font-bold text-xs cursor-pointer shadow-sm"
                >
                  Save Graph
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Builder Actions Footer */}
        <div className="flex-shrink-0 pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 mt-4">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onSubmit("draft")}
              className="px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors cursor-pointer"
            >
              Save as Draft
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab !== "preview" && (
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className="px-3.5 py-2 rounded-xl border border-purple-500/40 bg-purple-500/10 text-[#9D61FF] hover:bg-purple-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>Preview</span>
              </button>
            )}

            <button
              type="button"
              onClick={() =>
                onSubmit(
                  isEditing
                    ? ((editingTemplate?.status as "pending" | "draft") || "pending")
                    : "pending"
                )
              }
              className="px-5 py-2 rounded-xl glow-btn-primary font-bold text-xs flex items-center gap-2 cursor-pointer shadow-lg"
            >
              {isEditing ? <Save className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
              <span>{isEditing ? "Save Blueprint Changes" : "Submit for Approval"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
