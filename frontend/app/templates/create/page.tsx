"use client";

import React, { Suspense, useState, useMemo, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Check,
  Building,
  Loader2,
  Save,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  addTemplate,
  updateTemplate,
  createLibrarySection,
  setSelectedLibrarySectionId,
  showGlobalToast,
  CoverPageData,
  DEFAULT_COVER_PAGE_DATA,
  DEFAULT_TOC_DATA,
  DEFAULT_BACK_COVER_DATA,
  CanvasRow,
  TemplateBlock,
} from "@/lib/redux/slices/reportModuleSlice";
import SectionCanvasEditor from "../Sections&Graphs/components/SectionCanvasEditor";

/**
 * Dedicated Route for Template Studio (/templates/create).
 * Directly opens the visual Canvas Studio with the complete report format:
 * Cover Page (Fixed Page 1) -> Table of Contents (Fixed Page 2) -> Sections -> Back Cover Page (Fixed Last Page).
 * The sidebar displays all sections, allowing the user to select and edit any value directly.
 */
function CreateTemplatePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const templateIdParam = searchParams.get("templateId") || searchParams.get("id");

  const templates = useAppSelector((s) => s.reportModule.templates || []);
  const sites = useAppSelector((s) => s.reportModule.sites || []);
  const librarySections = useAppSelector((s) => s.reportModule.librarySections || []);
  const watermarks = useAppSelector((s) => s.reportModule.watermarks || []);
  const activeRole = useAppSelector((s) => s.reportModule.activeRole);

  const existingTemplate = useMemo(() => {
    return templates.find((t) => t.id === templateIdParam) || null;
  }, [templates, templateIdParam]);

  const isEditing = Boolean(existingTemplate);

  // Auto-generate Blueprint ID (e.g. TPL-005) or use existing ID
  const activeBlueprintId = useMemo(() => {
    if (existingTemplate) return existingTemplate.id;
    const maxNum = templates.reduce((max, t) => {
      const match = t.id.match(/TPL-(\d+)/);
      const num = match ? parseInt(match[1], 10) : 0;
      return num > max ? num : max;
    }, 0);
    return `TPL-${String(maxNum + 1).padStart(3, "0")}`;
  }, [templates, existingTemplate]);

  // Template State
  const [templateName, setTemplateName] = useState(
    existingTemplate ? existingTemplate.name : "Monthly Subcontractor Safety & Geotechnical Audit"
  );
  const [selectedSiteId, setSelectedSiteId] = useState(
    existingTemplate ? existingTemplate.site_id : sites[0]?.id || "SITE-01"
  );
  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

  const selectedSite = useMemo(() => {
    return sites.find((s) => s.id === selectedSiteId) || sites[0];
  }, [sites, selectedSiteId]);

  // Compile composite Canvas Rows from initial library sections
  const compileInitialRows = useCallback((): CanvasRow[] => {
    const rows: CanvasRow[] = [];
    const chosenSecs = librarySections.slice(0, 4); // default top 4 sections
    chosenSecs.forEach((sec, sIdx) => {
      const secRows = sec.canvasRows || [];
      if (secRows.length > 0) {
        secRows.forEach((r, rIdx) => {
          rows.push({
            ...r,
            id: `row-${sec.id}-${rIdx}-${Date.now()}`,
            pageBreakBefore: rIdx === 0 && sIdx > 0,
          });
        });
      }
    });
    return rows;
  }, [librarySections]);

  // Build default Cover Page Data
  const buildCoverData = useCallback((): CoverPageData => {
    return {
      reportType: templateName.trim(),
      subtitle: "WORKFORCE INSIGHTS\nFOR A SAFER TOMORROW",
      reportingPeriod: "01 September 2025 – 30 September 2025",
      projectSite: selectedSite?.name || "ABC Infrastructure Project",
      preparedFor: "Project Head & Statutory Safety Committee",
      preparedBy: "AyantrAI – Sitesafe Team",
      eyebrow: "STATUTORY COMPLIANCE & GEOTECHNICAL AUDIT",
      classification: "CONFIDENTIAL",
      classificationBadgeColor: "#ef4444",
      reportCode: activeBlueprintId,
      organizationLogoUrl: "/images/sitesafe-logo.svg",
    };
  }, [templateName, selectedSite, activeBlueprintId]);

  // Initialize Canvas Studio directly on mount
  useEffect(() => {
    const compositeSectionId = existingTemplate?.canvasSectionId || `tpl-canvas-${activeBlueprintId}`;
    const existingSec = librarySections.find((s) => s.id === compositeSectionId);

    if (!existingSec) {
      const initialRows = compileInitialRows();
      const coverData = buildCoverData();
      dispatch(
        createLibrarySection({
          id: compositeSectionId,
          name: templateName.trim(),
          eyebrow: "STATUTORY COMPLIANCE & AUDIT",
          description: "Complete executive safety and telemetry report blueprint.",
          metricCards: [],
          charts: [],
          keyInsights: [],
          canvasRows: initialRows,
          coverPageData: coverData,
          tableOfContentsData: DEFAULT_TOC_DATA,
          backCoverData: DEFAULT_BACK_COVER_DATA,
          watermarkId: watermarks[0]?.id || "wm-approved",
        })
      );
    }

    dispatch(setSelectedLibrarySectionId(compositeSectionId));
    setActiveSectionId(compositeSectionId);
  }, []);

  // Save as Draft
  const handleSaveDraft = () => {
    if (!templateName.trim()) {
      dispatch(showGlobalToast({ message: "Please provide a template title.", type: "warning" }));
      return;
    }

    const compositeSectionId = activeSectionId || `tpl-canvas-${activeBlueprintId}`;
    const activeCanvasSec = librarySections.find((s) => s.id === compositeSectionId);

    const blocks: TemplateBlock[] = [
      {
        id: "blk-key-metrics",
        type: "key_metrics",
        title: "Key Metrics",
        description: "High-level safety KPIs and compliance stats",
        enabled: true,
        order: 1,
      },
      {
        id: "blk-attendance",
        type: "attendance_trends",
        title: "Attendance Trends",
        description: "Workforce attendance and shifts",
        enabled: true,
        order: 2,
      },
    ];

    if (isEditing && existingTemplate) {
      dispatch(
        updateTemplate({
          id: existingTemplate.id,
          name: templateName.trim(),
          description: "Executive safety and telemetry audit report",
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "draft",
          coverPageData: activeCanvasSec?.coverPageData || buildCoverData(),
          tableOfContentsData: activeCanvasSec?.tableOfContentsData || DEFAULT_TOC_DATA,
          backCoverData: activeCanvasSec?.backCoverData || DEFAULT_BACK_COVER_DATA,
          category: "monthly",
          frequency: "monthly",
          canvasSectionId: compositeSectionId,
        })
      );
      dispatch(showGlobalToast({ message: `Template "${templateName.trim()}" saved as draft!`, type: "success" }));
    } else {
      dispatch(
        addTemplate({
          name: templateName.trim(),
          description: "Executive safety and telemetry audit report",
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "draft",
          created_by: `Superadmin (${activeRole})`,
          category: "monthly",
          frequency: "monthly",
          coverPageData: activeCanvasSec?.coverPageData || buildCoverData(),
          tableOfContentsData: activeCanvasSec?.tableOfContentsData || DEFAULT_TOC_DATA,
          backCoverData: activeCanvasSec?.backCoverData || DEFAULT_BACK_COVER_DATA,
          canvasSectionId: compositeSectionId,
        })
      );
      dispatch(showGlobalToast({ message: `New Template "${templateName.trim()}" created as draft!`, type: "success" }));
    }
  };

  // Save & Publish
  const handleSaveAndPublish = () => {
    if (!templateName.trim()) {
      dispatch(showGlobalToast({ message: "Please provide a template title.", type: "warning" }));
      return;
    }

    const compositeSectionId = activeSectionId || `tpl-canvas-${activeBlueprintId}`;
    const activeCanvasSec = librarySections.find((s) => s.id === compositeSectionId);

    const blocks: TemplateBlock[] = [
      {
        id: "blk-key-metrics",
        type: "key_metrics",
        title: "Key Metrics",
        description: "High-level safety KPIs and compliance stats",
        enabled: true,
        order: 1,
      },
    ];

    if (isEditing && existingTemplate) {
      dispatch(
        updateTemplate({
          id: existingTemplate.id,
          name: templateName.trim(),
          description: "Executive safety and telemetry audit report",
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "active",
          coverPageData: activeCanvasSec?.coverPageData || buildCoverData(),
          tableOfContentsData: activeCanvasSec?.tableOfContentsData || DEFAULT_TOC_DATA,
          backCoverData: activeCanvasSec?.backCoverData || DEFAULT_BACK_COVER_DATA,
          category: "monthly",
          frequency: "monthly",
          canvasSectionId: compositeSectionId,
        })
      );
    } else {
      dispatch(
        addTemplate({
          name: templateName.trim(),
          description: "Executive safety and telemetry audit report",
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "active",
          created_by: `Superadmin (${activeRole})`,
          category: "monthly",
          frequency: "monthly",
          coverPageData: activeCanvasSec?.coverPageData || buildCoverData(),
          tableOfContentsData: activeCanvasSec?.tableOfContentsData || DEFAULT_TOC_DATA,
          backCoverData: activeCanvasSec?.backCoverData || DEFAULT_BACK_COVER_DATA,
          canvasSectionId: compositeSectionId,
        })
      );
    }

    dispatch(showGlobalToast({ message: `Template "${templateName.trim()}" published successfully!`, type: "success" }));
    router.push("/templates");
  };

  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-[#07090d]">
      
      {/* ── Top Header Bar ── */}
      <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0c1017]/95 backdrop-blur-md border-b border-slate-200/80 dark:border-zinc-800/80 px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <Link
            href="/templates"
            className="p-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1.5 text-xs font-semibold flex-shrink-0"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Templates</span>
          </Link>
          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 hidden sm:block flex-shrink-0" />
          
          <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-[#9D61FF] border border-purple-500/20 flex-shrink-0">
            {activeBlueprintId}
          </span>

          {/* Inline Editable Template Title */}
          <div className="flex items-center gap-2 min-w-0 flex-1 max-w-lg">
            <input
              type="text"
              value={templateName}
              onChange={(e) => setTemplateName(e.target.value)}
              placeholder="Enter Template Blueprint Name..."
              className="bg-transparent font-bold text-sm text-slate-900 dark:text-white border-b border-transparent hover:border-slate-300 dark:hover:border-zinc-700 focus:border-[#9D61FF] focus:outline-none px-1.5 py-0.5 truncate w-full transition-all"
              title="Click to rename template"
            />
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Target Industrial Site Selector */}
          <div className="hidden md:flex items-center gap-1.5 bg-slate-100/80 dark:bg-zinc-900/80 rounded-xl px-2.5 py-1 border border-slate-200 dark:border-zinc-800 text-xs">
            <Building className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSiteId}
              onChange={(e) => setSelectedSiteId(e.target.value)}
              className="bg-transparent text-slate-800 dark:text-zinc-200 outline-none text-xs font-medium cursor-pointer"
            >
              {sites.map((s) => (
                <option key={s.id} value={s.id} className="dark:bg-zinc-900 text-slate-900 dark:text-white">
                  {s.name} ({s.id})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleSaveDraft}
            className="px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs flex items-center gap-1.5"
          >
            <Save className="w-3.5 h-3.5 text-slate-500" />
            <span>Save Draft</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAndPublish}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#9D61FF] to-[#8035ea] hover:from-[#9254f8] hover:to-[#7227dc] text-white text-xs font-bold flex items-center gap-1.5 shadow-[0_2px_12px_rgba(157,97,255,0.35)] hover:shadow-[0_4px_20px_rgba(157,97,255,0.5)] transition-all active:scale-[0.98] cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Publish Blueprint</span>
          </button>
        </div>
      </div>

      {/* ── Main Visual Canvas Studio (Complete Report Format) ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {activeSectionId ? (
          <SectionCanvasEditor
            sectionId={activeSectionId}
            onBack={() => router.push("/templates")}
          />
        ) : (
          <div className="flex-1 min-h-0 flex items-center justify-center bg-slate-50/50 dark:bg-[#07090d]">
            <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
              <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
              <span className="text-sm font-semibold">Initializing Complete Report Blueprint Studio...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CreateTemplateStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center bg-white dark:bg-[#07090d]">
          <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
            <span className="text-sm font-semibold">Loading Template Blueprint Architecture...</span>
          </div>
        </div>
      }
    >
      <CreateTemplatePageContent />
    </Suspense>
  );
}
