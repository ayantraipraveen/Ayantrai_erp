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
  Stamp,
  Loader2,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  LibrarySection,
  setLibrarySections,
  addOrReplaceLibrarySection,
  deleteLibrarySection,
  showGlobalToast,
  setSectionMeta,
} from "@/lib/redux/slices/reportModuleSlice";
import { sectionApi } from "@/lib/api/sectionApi";
import { Tooltip } from "@/app/Component";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const dispatch = useAppDispatch();
  const sectionMeta = useAppSelector((state) => state.reportModule.sectionMeta);
  const librarySections = useAppSelector((state) => state.reportModule.librarySections || []);
  const watermarks = useAppSelector((state) => state.reportModule.watermarks || []);
  const activeRole = useAppSelector((state) => state.reportModule.activeRole);

  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<FilterType>("all");

  // API State
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);

  // Create section modal state
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");
  const [newSectionEyebrow, setNewSectionEyebrow] = useState("");
  const [newSectionDesc, setNewSectionDesc] = useState("");

  // Delete confirmation
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Live API Fetcher
  const fetchSections = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await sectionApi.getSections({
        type: filterType === "all" ? undefined : filterType,
        search: search.trim() || undefined,
        limit: 100,
      });
      dispatch(setLibrarySections(res.data));
      if (res.meta?.stats) {
        dispatch(setSectionMeta(res.meta.stats));
      }
    } catch (err: any) {
      console.error("Failed to load sections from API:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Unable to connect to template service. Please verify template-service (port 5001) is running.";
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [dispatch, filterType, search]);

  React.useEffect(() => {
    fetchSections();
  }, [fetchSections]);



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

  const handleCreateSection = async () => {
    if (!newSectionName.trim()) {
      dispatch(showGlobalToast({ message: "Please provide a section name.", type: "warning" }));
      return;
    }

    const name = newSectionName.trim();
    const eyebrow = newSectionEyebrow.trim() || "CUSTOM MODULE";
    const description = newSectionDesc.trim() || "Custom reusable report section with attached telemetry.";

    setIsCreating(true);
    try {
      const res = await sectionApi.createSection({
        name,
        eyebrow,
        description,
        type: "custom",
        metricCards: [],
        charts: [],
        keyInsights: [],
        canvasRows: [],
      });

      dispatch(addOrReplaceLibrarySection(res.data));
      dispatch(showGlobalToast({ message: `Section "${res.data.name}" (${res.data.id}) created!`, type: "success" }));
      setNewSectionName("");
      setNewSectionEyebrow("");
      setNewSectionDesc("");
      setCreateModalOpen(false);

      if (typeof onSelectSection === "function") {
        onSelectSection(res.data.id);
      }
      router.push(`/templates/Sections&Graphs/edit?id=${res.data.id}`);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to create section.";
      dispatch(showGlobalToast({ message: msg, type: "error" }));
    } finally {
      setIsCreating(false);
    }
  };

  const handleDuplicate = async (id: string, name: string) => {
    setActionId(id);
    try {
      const res = await sectionApi.cloneSection(id, `${name} (Copy)`);
      dispatch(addOrReplaceLibrarySection(res.data));
      dispatch(showGlobalToast({ message: `Duplicated "${name}" to "${res.data.name}".`, type: "success" }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to clone section.";
      dispatch(showGlobalToast({ message: msg, type: "error" }));
    } finally {
      setActionId(null);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setActionId(id);
    try {
      await sectionApi.deleteSection(id);
      dispatch(deleteLibrarySection(id));
      setDeleteConfirmId(null);
      dispatch(showGlobalToast({ message: `Deleted custom section "${name}".`, type: "info" }));
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to delete section.";
      dispatch(showGlobalToast({ message: msg, type: "error" }));
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden px-4 sm:px-6 lg:px-7 space-y-3.5 animate-fadeIn">
      {/* 1. TOP METRICS STRIP */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 flex-shrink-0">
        <div className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Total Sections</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
              {sectionMeta?.totalSections || 0}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-purple-500/10 text-[#9D61FF]">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Core Standards</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
              {sectionMeta?.coreStandardsCount || 0}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
            <ShieldCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Custom Modules</div>
            <div className="text-lg font-bold text-amber-500 font-mono mt-0.5">
              {sectionMeta?.customModulesCount || 0}
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-500 dark:text-zinc-400">Total Visualizations</div>
            <div className="text-lg font-bold text-sky-600 dark:text-sky-400 font-mono mt-0.5">
              {sectionMeta?.totalCardsCount || 0} cards • {sectionMeta?.totalChartsCount || 0} charts
            </div>
          </div>
          <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500">
            <BarChart2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* 2. SEARCH & FILTER TOOLBAR */}
      <div className="p-2.5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] flex items-center justify-between gap-3 flex-wrap flex-shrink-0">
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
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            All ({sectionMeta?.totalSections || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("core")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === "core"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Core Standards ({sectionMeta?.coreStandardsCount || 0})
          </button>
          <button
            type="button"
            onClick={() => setFilterType("custom")}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
              filterType === "custom"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            Custom Added ({sectionMeta?.customModulesCount || 0})
          </button>
        </div>

        {/* Actions: Chart + Watermark + Create Section */}
        <div className="flex items-center gap-2">
          {/* Chart Button navigating to /templates/Sections&Graphs/charts */}
          <Link
            href="/templates/Sections&Graphs/charts"
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:border-[#9D61FF]/40 hover:text-[#9D61FF]"
          >
            <BarChart2 className="w-3.5 h-3.5 text-[#9D61FF]" />
            <span>Chart</span>
          </Link>

          {/* Watermark Button navigating to /templates/Sections&Graphs/watermark */}
          <Link
            href="/templates/Sections&Graphs/watermark"
            className="h-9 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-slate-50 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer hover:border-[#9D61FF]/40 hover:text-[#9D61FF]"
          >
            <Stamp className="w-3.5 h-3.5 text-[#9D61FF]" />
            <span>Watermark</span>
          </Link>


          {/* Create Section Action Modal Trigger */}
          <button
            type="button"
            onClick={() => setCreateModalOpen(true)}
            className="h-9 px-4 rounded-xl bg-gradient-to-r from-[#9D61FF] to-[#8B4CF0] hover:from-[#9254f8] hover:to-[#7e3beb] text-white font-bold text-xs cursor-pointer flex items-center gap-2 flex-shrink-0 transition-all active:scale-[0.98] border border-purple-400/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Section</span>
          </button>
        </div>
      </div>

      {/* 3. SECTION CARDS GRID */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        {isLoading ? (
          <div className="py-24 text-center flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-[#9D61FF]" />
            <p className="text-xs font-semibold text-slate-500 dark:text-zinc-400">
              Loading report sections...
            </p>
          </div>
        ) : error ? (
          <div className="py-16 text-center border border-rose-500/20 rounded-2xl bg-rose-500/5 p-6 max-w-lg mx-auto space-y-3">
            <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Unable to Load Sections</h3>
            <p className="text-xs text-rose-600 dark:text-rose-400 leading-relaxed">{error}</p>
            <button
              type="button"
              onClick={fetchSections}
              className="px-4 py-2 rounded-xl bg-[#9D61FF] hover:bg-[#8b4cf0] text-white text-xs font-bold inline-flex items-center gap-2 cursor-pointer transition-all shadow-md"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry Connection</span>
            </button>
          </div>
        ) : filteredSections.length === 0 ? (
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
                  className="rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] hover:border-[#9D61FF]/50 transition-all flex flex-col justify-between overflow-hidden group"
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
                        <h2
                          onClick={() => {
                            if (typeof onSelectSection === "function") {
                              onSelectSection(sec.id);
                            }
                            router.push(`/templates/Sections&Graphs/edit?id=${sec.id}`);
                          }}
                          className="text-base font-bold text-slate-900 dark:text-white mt-1.5 group-hover:text-[#9D61FF] transition-colors cursor-pointer"
                          title="Click to open Visual Canvas Studio"
                        >
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

                    {/* Stats pills & Assigned Watermark */}
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
                      {(() => {
                        const assignedWm = watermarks.find((w) => w.id === sec.watermarkId) || watermarks.find((w) => w.isDefault);
                        if (!assignedWm) return null;
                        return (
                          <Link
                            href="/templates/Sections&Graphs/watermark"
                            className="px-2.5 py-1 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-[11px] font-mono text-[#9D61FF] flex items-center gap-1.5 font-medium transition-colors"
                            title="Manage watermark in Watermark Studio"
                          >
                            <Stamp className="w-3 h-3 text-[#9D61FF]" />
                            <span className="truncate max-w-[150px]">{assignedWm.name}</span>
                          </Link>
                        );
                      })()}
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
                        disabled={actionId === sec.id}
                        onClick={() => handleDuplicate(sec.id, sec.name)}
                        className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50"
                        title="Duplicate Section"
                      >
                        {actionId === sec.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9D61FF]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      {/* Delete (only for custom) */}
                      {sec.type === "custom" && (
                        <button
                          type="button"
                          disabled={actionId === sec.id}
                          onClick={() => setDeleteConfirmId(sec.id)}
                          className="p-1.5 rounded-lg border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                          title="Delete Custom Section"
                        >
                          {actionId === sec.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-rose-500" />
                          ) : (
                            <Trash2 className="w-3.5 h-3.5" />
                          )}
                        </button>
                      )}


                      {/* Open Visual Canvas Editor */}
                      <button
                        type="button"
                        onClick={() => {
                          onSelectSection(sec.id);
                          router.push(`/templates/Sections&Graphs/edit?id=${sec.id}`);
                        }}
                        className="h-8 px-3 rounded-xl bg-[#9D61FF] hover:bg-[#8845fc] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
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
          <div className="w-full max-w-md bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl p-6 space-y-4 animate-scaleUp text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/10 text-[#9D61FF]">
                  <Layers className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold">Create New Report Section</h3>
              </div>
              <button
                type="button"
                disabled={isCreating}
                onClick={() => setCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 cursor-pointer disabled:opacity-50"
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
                  disabled={isCreating}
                  value={newSectionName}
                  onChange={(e) => setNewSectionName(e.target.value)}
                  placeholder="e.g. Geotechnical Settlement & Excavation Telemetry"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Eyebrow Label (Report Sub-Header Tag)
                </label>
                <input
                  type="text"
                  disabled={isCreating}
                  value={newSectionEyebrow}
                  onChange={(e) => setNewSectionEyebrow(e.target.value)}
                  placeholder="e.g. GEOTECHNICAL ANALYSIS"
                  className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF] disabled:opacity-60"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300">
                  Audit Scope & Description
                </label>
                <textarea
                  rows={3}
                  disabled={isCreating}
                  value={newSectionDesc}
                  onChange={(e) => setNewSectionDesc(e.target.value)}
                  placeholder="Describe the compliance criteria, safety thresholds, and telemetry metrics tracked in this block."
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF] disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200 dark:border-zinc-800">
              <button
                type="button"
                disabled={isCreating}
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateSection}
                disabled={!newSectionName.trim() || isCreating}
                className="px-5 py-2 rounded-xl bg-[#9D61FF] hover:bg-[#8845fc] text-white text-xs font-bold disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Creating Section...</span>
                  </>
                ) : (
                  <span>Create Section</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL: DELETE CONFIRMATION ================= */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-sm bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 space-y-4 animate-scaleUp text-slate-900 dark:text-white text-center">
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
