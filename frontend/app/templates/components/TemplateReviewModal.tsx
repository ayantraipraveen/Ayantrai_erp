"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  X,
  XCircle,
  CheckCircle2,
  FileText,
  Maximize2,
  Minimize2,
  Layers,
  Sparkles,
  Edit3,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  CoverPageData,
  DEFAULT_TOC_DATA,
  DEFAULT_BACK_COVER_DATA,
  initialLibrarySections,
  CanvasRow,
  LibrarySection,
} from "@/lib/redux/slices/reportModuleSlice";
import {
  selectSelectedTemplate,
  selectTemplateReviewModalOpen,
  setReviewModalOpen,
  setSelectedTemplateId,
  approveTemplateAsync,
  rejectTemplateAsync,
} from "@/lib/redux/slices/templatesSlice";
import { CanvasStudio } from "../Sections&Graphs/components/CanvasStudio";
import {
  CanvasCoverPage,
  CanvasTableOfContentsPage,
  CanvasBackCoverPage,
} from "../Sections&Graphs/components/CanvasStudioComponent";
import {
  getReportSectionGroups,
  partitionCanvasPages,
  calculateSectionGroupPageNumbers,
} from "../Sections&Graphs/utils/canvasLayoutUtils";
import { DEFAULT_CANVAS_MARGIN } from "../Sections&Graphs/utils";
import { getUploadedWatermarks } from "../Sections&Graphs/watermark/utils";

/**
 * Inspection and Superadmin Review/Approval Modal.
 * Renders the authentic, multi-page live template preview (Cover -> TOC -> Sections & Graphs -> Back Cover)
 * dynamically generated from template data in standard ISO A4 PDF format (595 × 842 pt).
 */
export default function TemplateReviewModal() {
  const dispatch = useAppDispatch();
  const selectedTemplate = useAppSelector(selectSelectedTemplate);
  const reviewModalOpen = useAppSelector(selectTemplateReviewModalOpen);
  const activeRole = useAppSelector((s) => s.reportModule.activeRole);

  const librarySections = useAppSelector((s) => s.reportModule.librarySections || []);
  const watermarks = useAppSelector((s) => s.reportModule.watermarks || []);

  const [activeTab, setActiveTab] = useState<"preview" | "blueprint">("preview");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(0.88);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  const uploadedWatermarks = useMemo(() => {
    return typeof window !== "undefined" ? getUploadedWatermarks() : [];
  }, []);

  // Compile composite template section with all pages and rows
  const compositeSection = useMemo<LibrarySection>(() => {
    if (!selectedTemplate) {
      return {
        id: "preview-empty",
        name: "",
        type: "core",
        updatedAt: "2026-10-06 12:00",
        eyebrow: "STATUTORY COMPLIANCE",
        description: "",
        metricCards: [],
        charts: [],
        keyInsights: [],
        canvasRows: [],
      };
    }

    // 1. Check if a composite section already exists in Redux librarySections
    const existingSec = librarySections.find(
      (s) =>
        s.id === selectedTemplate.canvasSectionId ||
        s.id === `tpl-canvas-${selectedTemplate.id}`
    );
    if (existingSec && existingSec.canvasRows && existingSec.canvasRows.length > 0) {
      return existingSec;
    }

    // 2. Assemble rows from librarySections matching template blocks
    const assembledRows: CanvasRow[] = [];
    const blocks = selectedTemplate.blocks || [];

    blocks.forEach((block, bIdx) => {
      const matched =
        librarySections.find((s) => s.id === `sec-core-${bIdx + 1}`) ||
        librarySections.find((s) =>
          s.name.toLowerCase().includes(block.title.toLowerCase())
        ) ||
        librarySections[bIdx % (librarySections.length || 1)];

      if (matched && matched.canvasRows && matched.canvasRows.length > 0) {
        matched.canvasRows.forEach((r, rIdx) => {
          assembledRows.push({
            ...r,
            id: `row-prev-${bIdx}-${rIdx}-${r.id}`,
            sectionName: r.sectionName || block.title || matched.name,
            sectionEyebrow:
              r.sectionEyebrow || matched.eyebrow || "STATUTORY COMPLIANCE & AUDIT",
            pageBreakBefore: rIdx === 0 && bIdx > 0,
          });
        });
      }
    });

    // 3. Fallback to canonical core sections if rows are empty
    if (assembledRows.length === 0) {
      initialLibrarySections.slice(0, 4).forEach((sec, sIdx) => {
        (sec.canvasRows || []).forEach((r, rIdx) => {
          assembledRows.push({
            ...r,
            id: `row-fb-${sIdx}-${rIdx}-${r.id}`,
            sectionName: r.sectionName || sec.name,
            sectionEyebrow: r.sectionEyebrow || sec.eyebrow,
            pageBreakBefore: rIdx === 0 && sIdx > 0,
          });
        });
      });
    }

    const coverData: CoverPageData = selectedTemplate.coverPageData || {
      reportType: selectedTemplate.name,
      subtitle: "WORKFORCE INSIGHTS & STATUTORY TELEMETRY\nFOR A SAFER TOMORROW",
      reportingPeriod: "01 September 2026 – 30 September 2026",
      projectSite: selectedTemplate.site_name || "Industrial Project Pilot Site",
      preparedFor: "Project Head & Statutory Auditor",
      preparedBy: selectedTemplate.created_by || "AyantrAI Telemetry Engine",
      eyebrow: "STATUTORY COMPLIANCE & SAFETY AUDIT",
      classification: "CONFIDENTIAL",
      classificationBadgeColor: "#9D61FF",
      reportCode: selectedTemplate.id,
    };

    return {
      id: `tpl-canvas-${selectedTemplate.id}`,
      name: selectedTemplate.name,
      type: "core",
      updatedAt: "2026-10-06 12:00",
      eyebrow: "STATUTORY COMPLIANCE & AUDIT",
      description: selectedTemplate.description || "Executive safety report blueprint.",
      metricCards: [],
      charts: [],
      keyInsights: [],
      canvasRows: assembledRows,
      coverPageData: coverData,
      tableOfContentsData: selectedTemplate.tableOfContentsData || DEFAULT_TOC_DATA,
      backCoverData: selectedTemplate.backCoverData || DEFAULT_BACK_COVER_DATA,
      watermarkId: watermarks[0]?.id || "wm-approved",
      projectSite: selectedTemplate.site_name,
      reportingPeriod: "01 September 2026 – 30 September 2026",
    };
  }, [selectedTemplate, librarySections, watermarks]);

  // Dynamic outline and page partitions for Table of Contents
  const sectionGroups = useMemo(() => {
    return getReportSectionGroups(
      compositeSection.canvasRows || [],
      compositeSection.name
    );
  }, [compositeSection]);

  const partitionedCanvasPages = useMemo(() => {
    return partitionCanvasPages(
      compositeSection.canvasRows || [],
      DEFAULT_CANVAS_MARGIN,
      3
    );
  }, [compositeSection]);

  const accurateSectionGroups = useMemo(() => {
    return calculateSectionGroupPageNumbers(sectionGroups, partitionedCanvasPages);
  }, [sectionGroups, partitionedCanvasPages]);

  const totalReportPages = useMemo(() => {
    return 2 + (partitionedCanvasPages.length || 1) + 1; // Cover (1) + TOC (1) + Body + Back Cover (1)
  }, [partitionedCanvasPages]);

  if (!reviewModalOpen || !selectedTemplate) return null;

  const handleClose = () => {
    setShowRejectInput(false);
    setRejectionReason("");
    setIsFullscreen(false);
    setActiveTab("preview");
    dispatch(setReviewModalOpen(false));
    dispatch(setSelectedTemplateId(null));
  };

  const handleConfirmReject = () => {
    dispatch(rejectTemplateAsync({ template: selectedTemplate, reason: rejectionReason }));
    setShowRejectInput(false);
    setRejectionReason("");
  };

  const beforeContent = (
    <div className="space-y-6 flex flex-col items-center">
      <div id="canvas-cover-page" className="transition-all duration-300">
        <CanvasCoverPage
          coverPageData={compositeSection.coverPageData}
          activeIsPreview={true}
        />
      </div>
      <div id="canvas-toc-page" className="transition-all duration-300">
        <CanvasTableOfContentsPage
          tocData={compositeSection.tableOfContentsData}
          sectionGroups={accurateSectionGroups}
          activeIsPreview={true}
        />
      </div>
    </div>
  );

  const afterContent = (
    <div id="canvas-back-cover-page" className="transition-all duration-300">
      <CanvasBackCoverPage
        backCoverData={compositeSection.backCoverData}
        activeIsPreview={true}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md animate-fadeIn select-none">
      <div
        className={`w-full transition-all duration-200 flex flex-col rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] shadow-2xl text-slate-900 dark:text-white overflow-hidden ${
          isFullscreen
            ? "w-[98vw] max-w-none h-[96vh]"
            : "max-w-6xl h-[92vh]"
        }`}
      >
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-zinc-800 px-6 py-3.5 flex-shrink-0 bg-slate-50/80 dark:bg-[#0e1219]/90">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-[#9D61FF] uppercase font-bold tracking-wider">
                Template Blueprint &bull; {selectedTemplate.id} ({selectedTemplate.version})
              </span>
              {selectedTemplate.status === "active" && (
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                  Active Blueprint
                </span>
              )}
              {selectedTemplate.status === "pending" && (
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 font-bold">
                  Pending Review
                </span>
              )}
              {selectedTemplate.status === "rejected" && (
                <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30 font-bold">
                  Revisions Needed
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold mt-0.5 text-slate-900 dark:text-white truncate">
              {selectedTemplate.name}
            </h2>
            <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5 truncate">
              Site: {selectedTemplate.site_name} | Author: {selectedTemplate.created_by}
            </div>
          </div>

          {/* Right Action Tools: Tab Switcher + Edit + Maximize + Close */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* View Mode Switcher */}
            <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-zinc-800/80 rounded-xl border border-slate-300/50 dark:border-zinc-700/50 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTab("preview")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "preview"
                    ? "bg-white dark:bg-[#0c1017] text-[#9D61FF] shadow-sm font-bold"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="View Live Generated Template Report (Cover, TOC, Sections, Back Cover)"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Template Preview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("blueprint")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  activeTab === "blueprint"
                    ? "bg-white dark:bg-[#0c1017] text-[#9D61FF] shadow-sm font-bold"
                    : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
                }`}
                title="View Ordered Report Sections Breakdown"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Blueprint Sections ({selectedTemplate.blocks.length})</span>
              </button>
            </div>

            {/* Edit Template in Canvas Studio */}
            <Link
              href={`/templates/create?templateId=${selectedTemplate.id}`}
              onClick={handleClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-[#9D61FF] hover:border-[#9D61FF]/40 hover:bg-purple-500/5 transition-colors cursor-pointer flex items-center justify-center"
              title="Open in Template Studio"
            >
              <Edit3 className="w-4 h-4" />
            </Link>

            {/* Maximize Toggle */}
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer hidden md:flex items-center justify-center"
              title={isFullscreen ? "Restore Window Size" : "Maximize Preview"}
            >
              {isFullscreen ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </button>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Close Modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Modal Main Body */}
        <div className="flex-1 min-h-0 flex flex-col overflow-hidden relative">
          {activeTab === "preview" ? (
            /* ================= LIVE TEMPLATE A4 PREVIEW ================= */
            <div className="flex-1 min-h-0 flex flex-col overflow-hidden bg-[#e8ecf2] dark:bg-[#05070a]">
              <CanvasStudio
                section={compositeSection}
                onEditCell={() => {}}
                pageNumber={3}
                totalReportPages={totalReportPages}
                isPreview={true}
                showGrid={true}
                zoom={zoom}
                setZoom={setZoom}
                beforeContent={beforeContent}
                afterContent={afterContent}
                paperTone="white"
                activeWatermark={
                  uploadedWatermarks.find((w) => w.id === compositeSection.watermarkId) || null
                }
              />
            </div>
          ) : (
            /* ================= BLUEPRINT SECTIONS BREAKDOWN ================= */
            <div className="flex-1 min-h-0 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Ordered Report Sections ({selectedTemplate.blocks.length}):
              </div>
              <div className="space-y-2.5">
                {selectedTemplate.blocks.map((b, idx) => (
                  <div
                    key={b.id || idx}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex flex-col gap-2 text-xs hover:border-[#9D61FF]/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-[#9D61FF]/20 text-[#9D61FF] font-mono text-[11px] flex items-center justify-center font-bold">
                          {idx + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 dark:text-white">
                              {b.title}
                            </span>
                            {b.isCustom && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-bold bg-amber-500/10 text-amber-500 border-amber-500/30">
                                Custom
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-zinc-400 mt-0.5">
                            {b.description}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {b.graphs && b.graphs.length > 0 && (
                          <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-[#9D61FF] border border-purple-500/30 font-semibold">
                            {b.graphs.length}{" "}
                            {b.graphs.length === 1 ? "graph" : "graphs"}
                          </span>
                        )}
                        <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold">
                          Included
                        </span>
                      </div>
                    </div>

                    {b.graphs && b.graphs.length > 0 && (
                      <div className="pl-8 pt-2 border-t border-slate-200/60 dark:border-zinc-800/60 flex flex-wrap gap-1.5">
                        {b.graphs.map((g) => (
                          <span
                            key={g.id}
                            className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300"
                          >
                            <span className="text-[#9D61FF] font-bold uppercase">
                              {g.type}:
                            </span>
                            <span>{g.title}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Superadmin Decision Controls */}
        <div className="px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/80 dark:bg-[#0e1219]/90 flex-shrink-0">
          {activeRole === "superadmin" && selectedTemplate.status === "pending" ? (
            showRejectInput ? (
              <div className="space-y-2.5 animate-fadeIn">
                <label className="text-xs font-semibold text-rose-500">
                  Reason for Rejection / Changes Requested:
                </label>
                <textarea
                  rows={2}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="e.g. Please include supervisory insights and adjust permissible hours threshold..."
                  className="w-full p-2.5 rounded-xl border border-rose-500/40 bg-rose-500/5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                />
                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirmReject}
                    className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs cursor-pointer shadow-sm"
                  >
                    Confirm Rejection
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between flex-wrap gap-3">
                <span className="text-xs text-slate-500 dark:text-zinc-400 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#9D61FF]" />
                  <span>Reviewing submitted template blueprint for production sign-off.</span>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setShowRejectInput(true)}
                    className="px-4 py-2 rounded-xl border border-rose-500/50 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    <span>Reject & Request Revision</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => dispatch(approveTemplateAsync({ template: selectedTemplate }))}
                    className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approve & Auto-Generate Report</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-between flex-wrap gap-2 text-xs">
              <span className="text-slate-500 dark:text-zinc-400">
                {selectedTemplate.status === "active"
                  ? `✓ Approved by ${selectedTemplate.approved_by || "Superadmin"} on ${selectedTemplate.approved_at || "Production"}`
                  : selectedTemplate.status === "rejected"
                  ? `Rejection notice: "${selectedTemplate.rejection_reason || "Revisions required"}"`
                  : `Template status: ${selectedTemplate.status.toUpperCase()}`}
              </span>
              <div className="flex items-center gap-2">
                <Link
                  href={`/templates/create?templateId=${selectedTemplate.id}`}
                  onClick={handleClose}
                  className="px-4 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#9D61FF]" />
                  <span>Edit Template</span>
                </Link>
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-1.5 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
