"use client";

import React, { useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  WatermarkItem,
  createWatermark,
  updateWatermark,
  deleteWatermark,
  duplicateWatermark,
  setSelectedWatermarkId,
  setDefaultWatermark,
  assignWatermarkToSections,
  showGlobalToast,
} from "@/lib/redux/slices/reportModuleSlice";
import {
  Stamp,
  ArrowLeft,
  UploadCloud,
  FileCode,
  CheckCircle2,
  Trash2,
  Copy,
  Sliders,
  RotateCw,
  Maximize2,
  Eye,
  AlertCircle,
  Shield,
  Layers,
  Sparkles,
  Plus,
  Search,
  Star,
  Check,
  CheckSquare,
  Square,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Sun,
  Moon,
  Info,
  Tag,
  BarChart2,
  Users,
  Activity,
  HardHat,
} from "lucide-react";
import { Tooltip } from "@/app/Component";

// Preset vector templates that can be quickly added as new watermarks
const PRESET_LIBRARY = [
  {
    name: "AyantrAI Official Approved",
    tag: "Governance",
    fileName: "ayantrai-official-stamp.svg",
    description: "Official compliance seal for approved safety audits and master blueprints.",
    opacity: 18,
    rotation: -30,
    scale: 100,
    placement: "center" as const,
    svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#9D61FF" stroke-width="2.5">
        <rect x="6" y="6" width="368" height="108" rx="14" stroke-dasharray="6 4" />
        <path d="M 50 60 L 70 40 L 90 60 L 70 80 Z" fill="#9D61FF" fill-opacity="0.2" />
        <text x="110" y="54" font-family="monospace" font-size="22" font-weight="900" fill="#9D61FF" letter-spacing="3">AYANTRAI</text>
        <text x="110" y="76" font-family="monospace" font-size="10.5" font-weight="700" fill="#9D61FF" letter-spacing="2">OFFICIAL COMPLIANCE STAMP</text>
      </g>
    </svg>`,
  },
  {
    name: "ISO 45001:2018 Certified",
    tag: "Compliance",
    fileName: "iso-45001-certified.svg",
    description: "Occupational health and safety verified stamp according to international standards.",
    opacity: 20,
    rotation: -25,
    scale: 105,
    placement: "center" as const,
    svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#10B981" stroke-width="2.5">
        <circle cx="60" cy="60" r="42" stroke-dasharray="4 3" />
        <circle cx="60" cy="60" r="32" fill="#10B981" fill-opacity="0.15" />
        <path d="M 48 60 L 56 68 L 74 48" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
        <text x="120" y="52" font-family="monospace" font-size="20" font-weight="900" fill="#10B981" letter-spacing="2">ISO 45001:2018</text>
        <text x="120" y="74" font-family="monospace" font-size="11" font-weight="700" fill="#10B981" letter-spacing="1.5">OCCUPATIONAL SAFETY VERIFIED</text>
      </g>
    </svg>`,
  },
  {
    name: "Confidential Security Seal",
    tag: "Security",
    fileName: "confidential-telemetry.svg",
    description: "Restricted proprietary telemetry stream seal for internal supervisory eyes only.",
    opacity: 16,
    rotation: -35,
    scale: 110,
    placement: "center" as const,
    svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#EF4444" stroke-width="2.5">
        <rect x="8" y="8" width="364" height="104" rx="10" stroke-width="3" />
        <line x1="8" y1="28" x2="372" y2="28" stroke-width="1.5" />
        <line x1="8" y1="92" x2="372" y2="92" stroke-width="1.5" />
        <text x="190" y="66" text-anchor="middle" font-family="monospace" font-size="24" font-weight="900" fill="#EF4444" letter-spacing="6">CONFIDENTIAL</text>
        <text x="190" y="21" text-anchor="middle" font-family="monospace" font-size="8.5" font-weight="700" fill="#EF4444" letter-spacing="2">PROPRIETARY INFRASTRUCTURE TELEMETRY</text>
      </g>
    </svg>`,
  },
  {
    name: "Audit Draft — Review Only",
    tag: "Audit",
    fileName: "audit-draft-stamp.svg",
    description: "Pre-release audit watermark for drafts pending project head sign-off.",
    opacity: 18,
    rotation: -30,
    scale: 100,
    placement: "center" as const,
    svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#F59E0B" stroke-width="2.5">
        <rect x="10" y="10" width="360" height="100" rx="12" stroke-dasharray="10 6" />
        <text x="190" y="60" text-anchor="middle" font-family="monospace" font-size="23" font-weight="900" fill="#F59E0B" letter-spacing="4">PRE-RELEASE DRAFT</text>
        <text x="190" y="82" text-anchor="middle" font-family="monospace" font-size="10" font-weight="700" fill="#F59E0B" letter-spacing="2">GOVERNANCE AUDIT PENDING</text>
      </g>
    </svg>`,
  },
  {
    name: "Zero Harm Safety Clearance",
    tag: "Safety",
    fileName: "zero-harm-clearance.svg",
    description: "Verified hazard-free environmental site condition clearance mark.",
    opacity: 22,
    rotation: -20,
    scale: 100,
    placement: "center" as const,
    svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
      <g fill="none" stroke="#06B6D4" stroke-width="2.5">
        <polygon points="190,12 368,108 12,108" stroke-dasharray="8 4" rx="10" />
        <path d="M 190 40 L 190 75 M 190 88 L 190 92" stroke="#06B6D4" stroke-width="3.5" stroke-linecap="round" />
        <text x="190" y="104" text-anchor="middle" font-family="monospace" font-size="11" font-weight="800" fill="#06B6D4" letter-spacing="3">ZERO HARM COMPLIANT</text>
      </g>
    </svg>`,
  },
];

export default function WatermarkStudioPage() {
  const dispatch = useAppDispatch();
  const watermarks = useAppSelector((state) => state.reportModule.watermarks || []);
  const selectedWatermarkId = useAppSelector((state) => state.reportModule.selectedWatermarkId);
  const librarySections = useAppSelector((state) => state.reportModule.librarySections || []);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const newFileInputRef = useRef<HTMLInputElement>(null);

  // Search & Tag Filter for Watermarks Library
  const [searchQuery, setSearchQuery] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("all");

  // Create Modal / Drawer state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newWmName, setNewWmName] = useState("");
  const [newWmTag, setNewWmTag] = useState("Custom");
  const [newWmSvg, setNewWmSvg] = useState<string | null>(null);
  const [newWmFileName, setNewWmFileName] = useState("");
  const [newWmError, setNewWmError] = useState<string | null>(null);

  // Drag and drop states
  const [isDraggingReplace, setIsDraggingReplace] = useState(false);
  const [isDraggingNew, setIsDraggingNew] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Preview Document Options
  const [previewSectionId, setPreviewSectionId] = useState<string>("sec-core-1");
  const [previewCanvasTheme, setPreviewCanvasTheme] = useState<"light" | "dark">("light");
  const [previewZoom, setPreviewZoom] = useState<number>(100);

  // Active Watermark
  const activeWatermark = useMemo(() => {
    return watermarks.find((w: WatermarkItem) => w.id === selectedWatermarkId) || watermarks[0] || null;
  }, [watermarks, selectedWatermarkId]);

  // Filtered Watermark list
  const filteredWatermarks = useMemo(() => {
    return watermarks.filter((wm: WatermarkItem) => {
      const matchesSearch =
        wm.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wm.tag.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wm.fileName.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesTag = tagFilter === "all" || wm.tag.toLowerCase() === tagFilter.toLowerCase();
      return matchesSearch && matchesTag;
    });
  }, [watermarks, searchQuery, tagFilter]);

  // Extract all distinct tags for filter pills
  const availableTags = useMemo(() => {
    const set = new Set<string>();
    watermarks.forEach((w: WatermarkItem) => set.add(w.tag));
    return Array.from(set);
  }, [watermarks]);

  // Helper to validate and extract SVG text
  const parseSvgFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const isSvgExtension = file.name.toLowerCase().endsWith(".svg");
      const isSvgMime = file.type === "image/svg+xml" || file.type === "";

      if (!isSvgExtension && !isSvgMime) {
        reject("Only vector SVG files (.svg) are accepted. Raster formats (PNG, JPG, WebP) are strictly prohibited.");
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        if (!text || !text.includes("<svg")) {
          reject("The selected file does not contain valid SVG markup.");
          return;
        }
        resolve(text);
      };
      reader.onerror = () => reject("Failed to read the file. Please try again.");
      reader.readAsText(file);
    });
  };

  // Replace SVG for active watermark
  const handleReplaceSvg = async (file: File) => {
    setUploadError(null);
    try {
      const svgText = await parseSvgFile(file);
      if (activeWatermark) {
        dispatch(
          updateWatermark({
            id: activeWatermark.id,
            changes: {
              svgContent: svgText,
              fileName: file.name,
            },
          })
        );
        dispatch(
          showGlobalToast({
            message: `Updated SVG vector for "${activeWatermark.name}"!`,
            type: "success",
          })
        );
      }
    } catch (err: any) {
      setUploadError(err.toString());
    }
  };

  // Upload SVG for New Watermark modal
  const handleNewSvgUpload = async (file: File) => {
    setNewWmError(null);
    try {
      const svgText = await parseSvgFile(file);
      setNewWmSvg(svgText);
      setNewWmFileName(file.name);
      if (!newWmName) {
        const cleanName = file.name.replace(/\.svg$/i, "").replace(/[-_]/g, " ");
        setNewWmName(cleanName.charAt(0).toUpperCase() + cleanName.slice(1));
      }
    } catch (err: any) {
      setNewWmError(err.toString());
    }
  };

  const handleCreateNewWatermark = () => {
    if (!newWmSvg) {
      setNewWmError("Please upload an SVG vector file.");
      return;
    }
    if (!newWmName.trim()) {
      setNewWmError("Please provide a name for this watermark.");
      return;
    }

    const newId = `wm-${Date.now()}`;
    dispatch(
      createWatermark({
        id: newId,
        name: newWmName.trim(),
        tag: newWmTag.trim() || "Custom",
        fileName: newWmFileName || `${newId}.svg`,
        svgContent: newWmSvg,
        opacity: 18,
        rotation: -30,
        scale: 100,
        placement: "center",
        isDefault: false,
        assignedSectionIds: [],
      })
    );

    dispatch(
      showGlobalToast({
        message: `Created new watermark "${newWmName.trim()}"!`,
        type: "success",
      })
    );

    // Reset & Close
    setIsCreateModalOpen(false);
    setNewWmName("");
    setNewWmTag("Custom");
    setNewWmSvg(null);
    setNewWmFileName("");
    setNewWmError(null);
  };

  // Quick Preset Add
  const handleAddPreset = (preset: (typeof PRESET_LIBRARY)[0]) => {
    const newId = `wm-${Date.now()}`;
    dispatch(
      createWatermark({
        id: newId,
        name: preset.name,
        tag: preset.tag,
        fileName: preset.fileName,
        svgContent: preset.svgContent,
        opacity: preset.opacity,
        rotation: preset.rotation,
        scale: preset.scale,
        placement: preset.placement,
        isDefault: false,
        assignedSectionIds: [],
        description: preset.description,
      })
    );
    dispatch(
      showGlobalToast({
        message: `Added preset "${preset.name}" to Watermark Library!`,
        type: "success",
      })
    );
  };

  // Section assignment toggles for the active watermark
  const handleToggleSectionAssignment = (sectionId: string) => {
    if (!activeWatermark) return;
    const currentList = activeWatermark.assignedSectionIds || [];
    const isAssigned = currentList.includes(sectionId);
    const updatedList = isAssigned
      ? currentList.filter((id: string) => id !== sectionId)
      : [...currentList, sectionId];

    dispatch(
      assignWatermarkToSections({
        watermarkId: activeWatermark.id,
        sectionIds: updatedList,
      })
    );

    const targetSec = librarySections.find((s) => s.id === sectionId);
    dispatch(
      showGlobalToast({
        message: isAssigned
          ? `Removed from "${targetSec?.name || sectionId}"`
          : `Watermark linked to "${targetSec?.name || sectionId}"!`,
        type: "info",
      })
    );
  };

  const handleToggleAllSections = () => {
    if (!activeWatermark) return;
    const currentList = activeWatermark.assignedSectionIds || [];
    const allIds = librarySections.map((s) => s.id);
    const areAllAssigned = allIds.every((id: string) => currentList.includes(id));
    const updatedList = areAllAssigned ? [] : allIds;

    dispatch(
      assignWatermarkToSections({
        watermarkId: activeWatermark.id,
        sectionIds: updatedList,
      })
    );

    dispatch(
      showGlobalToast({
        message: areAllAssigned
          ? "Unlinked watermark from all sections."
          : `Linked watermark to all ${allIds.length} sections!`,
        type: "success",
      })
    );
  };

  // Transform style for live watermark placement
  const getWatermarkPositionStyle = (placement: WatermarkItem["placement"]) => {
    switch (placement) {
      case "top-right":
        return "top-8 right-8";
      case "bottom-right":
      case "corner":
        return "bottom-8 right-8";
      case "footer":
        return "bottom-6 left-1/2 -translate-x-1/2";
      case "center":
      default:
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2";
    }
  };

  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-transparent">
      {/* Top Header Bar */}
      <div className="px-6 py-2.5 flex-shrink-0 flex items-center justify-between border-b border-slate-200/70 dark:border-zinc-800/70 bg-transparent">
        <div className="flex items-center gap-3">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-[#9D61FF]">
            <Stamp className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              Watermark Studio & Asset Library
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-purple-500/10 text-[#9D61FF] font-bold border border-purple-500/20">
              {watermarks.length} Vector Watermarks
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Add New Watermark Button */}
          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-8.5 px-3 rounded-xl bg-[#9D61FF] hover:bg-[#8B4FE8] text-white text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-sm shadow-[#9D61FF]/20"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Upload New Watermark</span>
          </button>

          {/* Back to Sections Button */}
          <Link
            href="/templates/Sections&Graphs"
            className="h-8.5 px-3 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 hover:bg-slate-100/60 dark:hover:bg-zinc-800/60 text-slate-700 dark:text-zinc-200 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs hover:border-[#9D61FF]/40 hover:text-[#9D61FF]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sections</span>
          </Link>
        </div>
      </div>

      {/* Main Studio Body: 3 Distinct Columns (Library Column, Config Column, Live A4 Simulation) */}
      <div className="flex-1 min-h-0 flex flex-col xl:flex-row overflow-hidden bg-transparent">
        {/* ==================================================================== */}
        {/* COLUMN 1: Watermarks Library List (Left Sidebar)                     */}
        {/* ==================================================================== */}
        <div className="w-full xl:w-[320px] 2xl:w-[340px] flex-shrink-0 border-r border-slate-200/80 dark:border-zinc-800/80 flex flex-col min-h-0 h-full overflow-hidden bg-white/30 dark:bg-zinc-950/20">
          {/* Search & Tag Filter */}
          <div className="p-3.5 border-b border-slate-200/60 dark:border-zinc-800/60 space-y-2.5">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search watermarks..."
                className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-900/70 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF] transition-all"
              />
            </div>

            {/* Tag Pills */}
            <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-0.5 text-[10.5px]">
              <button
                type="button"
                onClick={() => setTagFilter("all")}
                className={`px-2 py-0.5 rounded-md font-medium transition-all cursor-pointer ${
                  tagFilter === "all"
                    ? "bg-[#9D61FF] text-white font-bold"
                    : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                All ({watermarks.length})
              </button>
              {availableTags.map((tag: string) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => setTagFilter(tag)}
                  className={`px-2 py-0.5 rounded-md font-medium whitespace-nowrap transition-all cursor-pointer ${
                    tagFilter === tag
                      ? "bg-[#9D61FF] text-white font-bold"
                      : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Watermarks Scrollable List */}
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-2">
            {filteredWatermarks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                <Stamp className="w-6 h-6 mx-auto mb-2 opacity-40 text-slate-400" />
                <p className="font-semibold">No watermarks match criteria</p>
                <p className="text-[11px] mt-0.5 text-slate-500">
                  Try clearing your search query or upload a new SVG.
                </p>
              </div>
            ) : (
              filteredWatermarks.map((wm: WatermarkItem) => {
                const isSelected = activeWatermark?.id === wm.id;
                const assignedCount = (wm.assignedSectionIds || []).length;

                return (
                  <div
                    key={wm.id}
                    onClick={() => dispatch(setSelectedWatermarkId(wm.id))}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer group relative ${
                      isSelected
                        ? "border-[#9D61FF] bg-[#9D61FF]/10 shadow-sm dark:bg-[#9D61FF]/15"
                        : "border-slate-200/70 dark:border-zinc-800/70 bg-white/40 dark:bg-zinc-900/30 hover:border-slate-300 dark:hover:border-zinc-700 hover:bg-white/60 dark:hover:bg-zinc-900/50"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Mini SVG Thumbnail Preview */}
                      <div className="w-12 h-10 rounded-lg border border-slate-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                        <div
                          className="w-full h-full flex items-center justify-center opacity-85"
                          dangerouslySetInnerHTML={{ __html: wm.svgContent }}
                        />
                      </div>

                      {/* Info & Badges */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 justify-between">
                          <span
                            className={`text-xs font-bold truncate ${
                              isSelected
                                ? "text-[#9D61FF]"
                                : "text-slate-800 dark:text-zinc-200 group-hover:text-slate-900 dark:group-hover:text-white"
                            }`}
                          >
                            {wm.name}
                          </span>
                          {wm.isDefault && (
                            <span className="text-[9px] font-mono px-1.5 py-0.2 rounded font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                              DEFAULT
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5 mt-1 text-[10.5px]">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-mono text-slate-500 dark:text-zinc-400 text-[9.5px]">
                            {wm.tag}
                          </span>
                          <span className="text-slate-400 text-[10px]">·</span>
                          <span className="text-slate-500 dark:text-zinc-400 text-[10px] font-medium">
                            {assignedCount === 0
                              ? "Not assigned"
                              : `${assignedCount} section${assignedCount > 1 ? "s" : ""}`}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Quick Action Buttons on Hover */}
                    <div className="flex items-center justify-end gap-1 mt-2.5 pt-2 border-t border-slate-200/40 dark:border-zinc-800/40">
                      {/* Set Default */}
                      {!wm.isDefault && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(setDefaultWatermark(wm.id));
                            dispatch(
                              showGlobalToast({
                                message: `Set "${wm.name}" as default watermark!`,
                                type: "success",
                              })
                            );
                          }}
                          className="p-1 rounded text-slate-400 hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                          title="Set as Default Watermark"
                        >
                          <Star className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Duplicate */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          dispatch(duplicateWatermark(wm.id));
                          dispatch(
                            showGlobalToast({
                              message: `Duplicated "${wm.name}"!`,
                              type: "info",
                            })
                          );
                        }}
                        className="p-1 rounded text-slate-400 hover:text-[#9D61FF] hover:bg-[#9D61FF]/10 transition-colors"
                        title="Duplicate Watermark"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete */}
                      {watermarks.length > 1 && (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            dispatch(deleteWatermark(wm.id));
                            dispatch(
                              showGlobalToast({
                                message: `Deleted watermark "${wm.name}".`,
                                type: "info",
                              })
                            );
                          }}
                          className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                          title="Delete Watermark"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Quick Preset Library Drawer Footer */}
          <div className="p-3 border-t border-slate-200/80 dark:border-zinc-800/80 bg-white/40 dark:bg-zinc-900/40">
            <span className="text-[10px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider block mb-2">
              Official Standard Presets
            </span>
            <div className="grid grid-cols-2 gap-1.5">
              {PRESET_LIBRARY.slice(0, 4).map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => handleAddPreset(preset)}
                  className="px-2 py-1.5 rounded-lg border border-slate-200/70 dark:border-zinc-800/70 bg-white/60 dark:bg-zinc-900/60 hover:border-[#9D61FF]/50 text-left text-[10.5px] truncate text-slate-700 dark:text-zinc-300 font-medium flex items-center justify-between group cursor-pointer"
                >
                  <span className="truncate">{preset.tag} Stamp</span>
                  <Plus className="w-3 h-3 text-slate-400 group-hover:text-[#9D61FF]" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ==================================================================== */}
        {/* COLUMN 2: Selected Watermark Configuration & Assignment              */}
        {/* ==================================================================== */}
        <div className="w-full xl:w-[380px] 2xl:w-[420px] flex-shrink-0 border-r border-slate-200/80 dark:border-zinc-800/80 flex flex-col min-h-0 h-full overflow-y-auto custom-scrollbar p-5 space-y-5 bg-transparent">
          {activeWatermark ? (
            <>
              {/* Header of Active Watermark */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/10 text-[#9D61FF] font-bold">
                      ACTIVE WATERMARK
                    </span>
                    {activeWatermark.isDefault && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/15 text-amber-600 dark:text-amber-400 font-black">
                        DEFAULT BLUEPRINT
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    ID: {activeWatermark.id}
                  </span>
                </div>

                {/* Inline Name Editing */}
                <input
                  type="text"
                  value={activeWatermark.name}
                  onChange={(e) =>
                    dispatch(
                      updateWatermark({
                        id: activeWatermark.id,
                        changes: { name: e.target.value },
                      })
                    )
                  }
                  className="w-full font-bold text-sm text-slate-900 dark:text-white bg-transparent border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-[#9D61FF] focus:outline-none py-1 transition-all"
                  placeholder="Watermark Name"
                />
              </div>

              {/* 1. Vector SVG Asset Box (Strictly SVG) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-[#9D61FF]" />
                    <span>SVG Vector Markup</span>
                  </label>
                  <span className="text-[10px] font-mono text-[#9D61FF] bg-purple-500/10 px-2 py-0.5 rounded font-bold">
                    STRICTLY .SVG ONLY
                  </span>
                </div>

                {/* Drag & Drop Replace Zone */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDraggingReplace(true);
                  }}
                  onDragLeave={() => setIsDraggingReplace(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingReplace(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleReplaceSvg(file);
                  }}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                    isDraggingReplace
                      ? "border-[#9D61FF] bg-purple-500/10 scale-[1.01]"
                      : "border-slate-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 hover:border-[#9D61FF]/60 hover:bg-purple-500/5"
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".svg,image/svg+xml"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleReplaceSvg(file);
                    }}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 flex items-center justify-center">
                    <UploadCloud className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-white">
                      Drop new SVG to replace, or <span className="text-[#9D61FF] underline">browse</span>
                    </p>
                    <p className="text-[10.5px] text-slate-500 dark:text-zinc-400 mt-0.5">
                      Current: <span className="font-mono text-[#9D61FF]">{activeWatermark.fileName}</span>
                    </p>
                  </div>
                </div>

                {uploadError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2 animate-fadeIn">
                    <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                    <span>{uploadError}</span>
                  </div>
                )}
              </div>

              {/* 2. Visual Calibration Sliders */}
              <div className="space-y-4 pt-3 border-t border-slate-200/80 dark:border-zinc-800/80">
                {/* Opacity */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      Watermark Opacity
                    </span>
                    <span className="font-mono text-[#9D61FF] font-bold">
                      {activeWatermark.opacity}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="70"
                    value={activeWatermark.opacity}
                    onChange={(e) =>
                      dispatch(
                        updateWatermark({
                          id: activeWatermark.id,
                          changes: { opacity: parseInt(e.target.value) },
                        })
                      )
                    }
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
                  />
                </div>

                {/* Angle / Rotation */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      Angle / Rotation
                    </span>
                    <span className="font-mono text-[#9D61FF] font-bold">
                      {activeWatermark.rotation}°
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="range"
                      min="-90"
                      max="90"
                      value={activeWatermark.rotation}
                      onChange={(e) =>
                        dispatch(
                          updateWatermark({
                            id: activeWatermark.id,
                            changes: { rotation: parseInt(e.target.value) },
                          })
                        )
                      }
                      className="flex-1 h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
                    />
                    <div className="flex items-center gap-1">
                      {[-45, -30, 0, 30].map((deg) => (
                        <button
                          key={deg}
                          type="button"
                          onClick={() =>
                            dispatch(
                              updateWatermark({
                                id: activeWatermark.id,
                                changes: { rotation: deg },
                              })
                            )
                          }
                          className={`px-1.5 py-0.5 rounded text-[10px] font-mono cursor-pointer transition-all ${
                            activeWatermark.rotation === deg
                              ? "bg-[#9D61FF] text-white font-bold"
                              : "bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
                          }`}
                        >
                          {deg}°
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Scale */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-zinc-300">
                      Scale / Size
                    </span>
                    <span className="font-mono text-[#9D61FF] font-bold">
                      {activeWatermark.scale}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="40"
                    max="200"
                    step="5"
                    value={activeWatermark.scale}
                    onChange={(e) =>
                      dispatch(
                        updateWatermark({
                          id: activeWatermark.id,
                          changes: { scale: parseInt(e.target.value) },
                        })
                      )
                    }
                    className="w-full h-1.5 bg-slate-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-[#9D61FF]"
                  />
                </div>

                {/* Placement Layout */}
                <div className="space-y-1.5">
                  <span className="font-semibold text-xs text-slate-700 dark:text-zinc-300 block">
                    Placement Anchor
                  </span>
                  <div className="grid grid-cols-3 gap-1.5">
                    {[
                      { id: "center", label: "Center" },
                      { id: "top-right", label: "Top Right" },
                      { id: "bottom-right", label: "Bottom Right" },
                      { id: "footer", label: "Footer Seal" },
                      { id: "tiled", label: "3x3 Tiled" },
                    ].map((pos) => (
                      <button
                        key={pos.id}
                        type="button"
                        onClick={() =>
                          dispatch(
                            updateWatermark({
                              id: activeWatermark.id,
                              changes: { placement: pos.id as any },
                            })
                          )
                        }
                        className={`py-1.5 px-2 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          activeWatermark.placement === pos.id
                            ? "border-[#9D61FF] bg-[#9D61FF] text-white shadow-xs"
                            : "border-slate-200 dark:border-zinc-800 bg-white/40 dark:bg-zinc-900/40 text-slate-700 dark:text-zinc-300 hover:border-[#9D61FF]/40"
                        }`}
                      >
                        {pos.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 3. Section Usage & Linkage Matrix */}
              <div className="space-y-2.5 pt-3 border-t border-slate-200/80 dark:border-zinc-800/80">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-wider flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#9D61FF]" />
                    <span>Used in Sections</span>
                  </label>
                  <button
                    type="button"
                    onClick={handleToggleAllSections}
                    className="text-[11px] text-[#9D61FF] hover:underline font-semibold cursor-pointer"
                  >
                    {(activeWatermark.assignedSectionIds || []).length === librarySections.length
                      ? "Clear All"
                      : "Select All"}
                  </button>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                  Select which report sections render with this watermark stamp:
                </p>

                <div className="space-y-1.5 max-h-[220px] overflow-y-auto custom-scrollbar pr-1">
                  {librarySections.map((sec) => {
                    const isChecked = (activeWatermark.assignedSectionIds || []).includes(sec.id);
                    return (
                      <div
                        key={sec.id}
                        onClick={() => handleToggleSectionAssignment(sec.id)}
                        className={`px-3 py-2 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                          isChecked
                            ? "border-[#9D61FF]/60 bg-[#9D61FF]/10 text-slate-900 dark:text-white font-medium"
                            : "border-slate-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-900/30 text-slate-600 dark:text-zinc-400 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          {isChecked ? (
                            <CheckSquare className="w-4 h-4 text-[#9D61FF] flex-shrink-0" />
                          ) : (
                            <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                          )}
                          <span className="truncate">{sec.name}</span>
                        </div>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 flex-shrink-0">
                          {sec.eyebrow}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs">
              Select a watermark from the left library to configure.
            </div>
          )}
        </div>

        {/* ==================================================================== */}
        {/* COLUMN 3: Live Interactive A4 Document Simulation Canvas            */}
        {/* ==================================================================== */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-100/50 dark:bg-zinc-950/40">
          {/* Canvas Toolbar */}
          <div className="px-5 py-2.5 flex-shrink-0 border-b border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between bg-white/40 dark:bg-zinc-900/40">
            {/* Section Test Switcher */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-zinc-400">
                Preview Section:
              </span>
              <select
                value={previewSectionId}
                onChange={(e) => setPreviewSectionId(e.target.value)}
                className="h-8 px-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-medium text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
              >
                <option value="blank">Blank Blueprint Canvas</option>
                {librarySections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.eyebrow})
                  </option>
                ))}
              </select>
            </div>

            {/* Canvas Display Controls: Zoom & Theme */}
            <div className="flex items-center gap-2">
              {/* Zoom Controls */}
              <div className="flex items-center gap-1 px-1.5 py-1 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs">
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.max(60, z - 10))}
                  className="p-1 hover:text-[#9D61FF] cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="font-mono text-[11px] px-1 font-bold">{previewZoom}%</span>
                <button
                  type="button"
                  onClick={() => setPreviewZoom((z) => Math.min(130, z + 10))}
                  className="p-1 hover:text-[#9D61FF] cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Theme Toggle */}
              <button
                type="button"
                onClick={() =>
                  setPreviewCanvasTheme((t) => (t === "light" ? "dark" : "light"))
                }
                className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-[#9D61FF]/40 text-slate-600 dark:text-zinc-300 text-xs cursor-pointer"
                title="Toggle Canvas Theme"
              >
                {previewCanvasTheme === "light" ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Interactive Document Viewport */}
          <div className="flex-1 min-h-0 overflow-auto custom-scrollbar p-6 flex items-center justify-center">
            {/* Simulated A4 Container */}
            <div
              style={{
                transform: `scale(${previewZoom / 100})`,
                transformOrigin: "center center",
                transition: "transform 0.15s ease",
              }}
              className={`w-[680px] min-h-[960px] rounded-2xl shadow-2xl relative overflow-hidden border p-8 flex flex-col justify-between transition-colors ${
                previewCanvasTheme === "light"
                  ? "bg-white text-slate-900 border-slate-200"
                  : "bg-zinc-900 text-zinc-100 border-zinc-800"
              }`}
            >
              {/* Authentic Technical Blueprint Grid Background */}
              <div
                className="absolute inset-0 pointer-events-none opacity-30"
                style={{
                  backgroundImage:
                    previewCanvasTheme === "light"
                      ? "radial-gradient(#CBD5E1 1px, transparent 1px)"
                      : "radial-gradient(#3F3F46 1px, transparent 1px)",
                  backgroundSize: "20px 20px",
                }}
              />

              {/* LIVE WATERMARK LAYER */}
              {activeWatermark && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden flex items-center justify-center z-10">
                  {activeWatermark.placement === "tiled" ? (
                    // 3x3 Tiled Pattern
                    <div className="w-full h-full grid grid-cols-3 grid-rows-3 gap-8 p-6">
                      {[...Array(9)].map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center justify-center"
                          style={{
                            opacity: activeWatermark.opacity / 100,
                            transform: `rotate(${activeWatermark.rotation}deg) scale(${
                              activeWatermark.scale / 100
                            })`,
                            transition: "all 0.1s ease",
                          }}
                          dangerouslySetInnerHTML={{ __html: activeWatermark.svgContent }}
                        />
                      ))}
                    </div>
                  ) : (
                    // Single Dynamic Watermark with Placement Anchor
                    <div
                      className={`absolute ${getWatermarkPositionStyle(
                        activeWatermark.placement
                      )}`}
                      style={{
                        opacity: activeWatermark.opacity / 100,
                        transform: `${
                          activeWatermark.placement === "center"
                            ? "translate(-50%, -50%) "
                            : activeWatermark.placement === "footer"
                            ? "translateX(-50%) "
                            : ""
                        }rotate(${activeWatermark.rotation}deg) scale(${
                          activeWatermark.scale / 100
                        })`,
                        transition: "all 0.1s ease",
                      }}
                      dangerouslySetInnerHTML={{ __html: activeWatermark.svgContent }}
                    />
                  )}
                </div>
              )}

              {/* Document Header */}
              <div className="relative z-0 border-b pb-4 flex items-center justify-between border-slate-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#9D61FF]/10 text-[#9D61FF] font-black flex items-center justify-center text-xs">
                    AY
                  </div>
                  <div>
                    <h1 className="text-sm font-black tracking-wide uppercase">
                      AyantrAI Telemetry Blueprint
                    </h1>
                    <p className="text-[10px] text-slate-500 font-mono">
                      CONFIDENTIAL HSE & INFRASTRUCTURE REPORT
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 font-bold">
                    ISO 45001 COMPLIANT
                  </span>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">DATE: 2026-09-24</p>
                </div>
              </div>

              {/* Document Sample Body */}
              <div className="relative z-0 flex-1 py-6 space-y-6">
                {previewSectionId === "blank" ? (
                  <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                    <Stamp className="w-12 h-12 text-[#9D61FF] mb-2" />
                    <p className="text-xs font-bold uppercase tracking-wider">
                      Blank Blueprint Canvas
                    </p>
                    <p className="text-[11px]">
                      Showing clean vector watermark rendering without section occlusion
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Active Section Header */}
                    {(() => {
                      const sec =
                        librarySections.find((s) => s.id === previewSectionId) ||
                        librarySections[0];
                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between border-b pb-2 border-slate-200/60 dark:border-zinc-800/60">
                            <div>
                              <span className="text-[9.5px] font-mono uppercase tracking-wider text-[#9D61FF] font-black">
                                SECTION 0{librarySections.indexOf(sec) + 1} — {sec.eyebrow}
                              </span>
                              <h2 className="text-base font-extrabold">{sec.name}</h2>
                            </div>
                            <span className="text-[10px] font-mono text-slate-400">
                              TELEMETRY STREAM: ACTIVE
                            </span>
                          </div>

                          {/* Metric Cards Mock Grid */}
                          <div className="grid grid-cols-2 gap-3">
                            {sec.metricCards?.slice(0, 4).map((mc) => (
                              <div
                                key={mc.id}
                                className="p-3.5 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 shadow-xs"
                              >
                                <span className="text-[10.5px] font-medium text-slate-500 dark:text-zinc-400 block truncate">
                                  {mc.label}
                                </span>
                                <div className="flex items-baseline gap-2 mt-1">
                                  <span className="text-lg font-black">{mc.value}</span>
                                  <span className="text-[10px] text-emerald-500 font-mono font-bold">
                                    {mc.trendValue}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Charts Simulation Container */}
                          <div className="p-4 rounded-xl border border-slate-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-zinc-900/60 shadow-xs space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold">
                                {sec.charts?.[0]?.title || "Daily Telemetry Distribution"}
                              </span>
                              <span className="text-[9.5px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-[#9D61FF] font-bold">
                                REAL-TIME
                              </span>
                            </div>

                            {/* Simulated SVG Graph bars */}
                            <div className="h-28 w-full flex items-end justify-between gap-2 pt-4 px-2">
                              {[65, 82, 45, 95, 78, 88, 62, 91, 74, 85].map((val, idx) => (
                                <div
                                  key={idx}
                                  className="flex-1 flex flex-col items-center gap-1"
                                >
                                  <div
                                    style={{ height: `${val}%` }}
                                    className="w-full rounded-t-md bg-[#9D61FF]/40 border-t border-[#9D61FF]"
                                  />
                                  <span className="text-[9px] font-mono text-slate-400">
                                    D{idx + 1}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Key Insights Mock Box */}
                          <div className="p-3 rounded-xl border border-slate-200/60 dark:border-zinc-800/60 bg-slate-50/60 dark:bg-zinc-900/40 text-[11px] space-y-1">
                            <span className="font-bold text-slate-800 dark:text-zinc-200">
                              Core Supervisory Finding:
                            </span>
                            <p className="text-slate-600 dark:text-zinc-400 leading-relaxed">
                              {sec.keyInsights?.[0]?.text ||
                                "Full compliance sustained across muster zones without PPE hazard violations."}
                            </p>
                          </div>
                        </div>
                      );
                    })()}
                  </>
                )}
              </div>

              {/* Document Footer */}
              <div className="relative z-0 border-t pt-3 flex items-center justify-between text-[10px] text-slate-400 font-mono border-slate-200 dark:border-zinc-800">
                <span>AYANTRAI CLOUD PLATFORM · CERTIFIED COPY</span>
                <span>PAGE 1 OF 1</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* MODAL: Upload New Watermark SVG Modal                                */}
      {/* ==================================================================== */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-3xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl p-6 space-y-5 animate-scaleUp">
            {/* Modal Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 flex items-center justify-center">
                  <Stamp className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Upload Vector Watermark (.SVG)
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-zinc-400">
                    Add a new SVG stamp to your global report watermark library
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs font-mono p-1 cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Drag & Drop Box */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDraggingNew(true);
              }}
              onDragLeave={() => setIsDraggingNew(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDraggingNew(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleNewSvgUpload(file);
              }}
              onClick={() => newFileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center space-y-2 ${
                isDraggingNew
                  ? "border-[#9D61FF] bg-purple-500/10 scale-[1.01]"
                  : "border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 hover:border-[#9D61FF]/60 hover:bg-purple-500/5"
              }`}
            >
              <input
                ref={newFileInputRef}
                type="file"
                accept=".svg,image/svg+xml"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleNewSvgUpload(file);
                }}
                className="hidden"
              />
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-[#9D61FF] border border-purple-500/20 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Drop your SVG file here, or <span className="text-[#9D61FF] underline">browse</span>
                </p>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-0.5">
                  Only vector SVG files are supported for clean, scalable resolution.
                </p>
              </div>
            </div>

            {newWmError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{newWmError}</span>
              </div>
            )}

            {newWmSvg && (
              <div className="p-3 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-8 rounded-lg border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-800 p-1 flex items-center justify-center">
                    <div
                      className="w-full h-full flex items-center justify-center"
                      dangerouslySetInnerHTML={{ __html: newWmSvg }}
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold font-mono text-slate-900 dark:text-white block truncate">
                      {newWmFileName}
                    </span>
                    <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Valid SVG markup
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Inputs: Name & Tag */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Watermark Name
                </label>
                <input
                  type="text"
                  value={newWmName}
                  onChange={(e) => setNewWmName(e.target.value)}
                  placeholder="e.g. Approved Stamp"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-zinc-300">
                  Category / Tag
                </label>
                <input
                  type="text"
                  value={newWmTag}
                  onChange={(e) => setNewWmTag(e.target.value)}
                  placeholder="e.g. Governance, Safety"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-950/40 text-xs text-slate-800 dark:text-zinc-200 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60">
              <button
                type="button"
                onClick={() => setIsCreateModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateNewWatermark}
                disabled={!newWmSvg}
                className="px-4 py-2 rounded-xl bg-[#9D61FF] hover:bg-[#8B4FE8] text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-sm"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Save Watermark</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
