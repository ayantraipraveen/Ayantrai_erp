"use client";

import React, { Suspense, useState, useMemo, useEffect, useCallback, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  addTemplate,
  updateTemplate,
  addOrReplaceTemplate,
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
import { templateApi } from "@/lib/api";
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
  const initializedRef = useRef(false);

  const selectedSite = useMemo(() => {
    return sites.find((s) => s.id === selectedSiteId) || sites[0];
  }, [sites, selectedSiteId]);

  useEffect(() => {
    if (templateIdParam && !existingTemplate) {
      templateApi
        .getTemplateById(templateIdParam)
        .then((res) => {
          if (res && res.data) {
            dispatch(addOrReplaceTemplate(res.data));
            setTemplateName(res.data.name);
            if (res.data.site_id) setSelectedSiteId(res.data.site_id);
          }
        })
        .catch((err) => {
          console.warn("Could not cold-load template by ID:", err);
        });
    }
  }, [templateIdParam, existingTemplate, dispatch]);

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
            sectionName: r.sectionName || sec.name,
            sectionEyebrow: r.sectionEyebrow || sec.eyebrow,
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
      reportType: existingTemplate?.coverPageData?.reportType || "Monthly Report",
      subtitle: existingTemplate?.coverPageData?.subtitle || "WORKFORCE INSIGHTS\nFOR A SAFER TOMORROW",
      reportingPeriod: existingTemplate?.coverPageData?.reportingPeriod || "01 September 2025 – 30 September 2025",
      projectSite: selectedSite?.name || existingTemplate?.coverPageData?.projectSite || "ABC Infrastructure Project",
      preparedFor: existingTemplate?.coverPageData?.preparedFor || "Project Head",
      preparedBy: existingTemplate?.coverPageData?.preparedBy || "AyantrAI – Sitesafe Team",
      eyebrow: "STATUTORY COMPLIANCE & GEOTECHNICAL AUDIT",
      classification: "CONFIDENTIAL",
      classificationBadgeColor: "#ef4444",
      reportCode: activeBlueprintId,
    };
  }, [existingTemplate, selectedSite, activeBlueprintId]);

  // Initialize Canvas Studio directly on mount
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

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
  const handleSaveDraft = async () => {
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

    const payload = {
      name: templateName.trim(),
      description: "Executive safety and telemetry audit report",
      site_id: selectedSiteId,
      site_name: selectedSite?.name || "Global Sites",
      blocks,
      status: "draft" as const,
      category: "monthly",
      frequency: "monthly",
      coverPageData: activeCanvasSec?.coverPageData || buildCoverData(),
      tableOfContentsData: activeCanvasSec?.tableOfContentsData || DEFAULT_TOC_DATA,
      backCoverData: activeCanvasSec?.backCoverData || DEFAULT_BACK_COVER_DATA,
      canvasSectionId: compositeSectionId,
    };

    try {
      if (isEditing && existingTemplate) {
        const res = await templateApi.updateTemplate(existingTemplate.id, payload);
        dispatch(addOrReplaceTemplate(res.data));
        dispatch(showGlobalToast({ message: `Template "${templateName.trim()}" saved as draft!`, type: "success" }));
      } else {
        const res = await templateApi.createTemplate(payload);
        dispatch(addOrReplaceTemplate(res.data));
        dispatch(showGlobalToast({ message: `New Template "${templateName.trim()}" created as draft!`, type: "success" }));
      }
    } catch (err: any) {
      if (isEditing && existingTemplate) {
        dispatch(updateTemplate({ id: existingTemplate.id, ...payload }));
      } else {
        dispatch(addTemplate({ created_by: `Superadmin (${activeRole})`, ...payload }));
      }
      dispatch(showGlobalToast({ message: `Template "${templateName.trim()}" saved as draft!`, type: "success" }));
    }
  };

  // Save & Publish
  const handleSaveAndPublish = async () => {
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

    const payload = {
      name: templateName.trim(),
      description: "Executive safety and telemetry audit report",
      site_id: selectedSiteId,
      site_name: selectedSite?.name || "Global Sites",
      blocks,
      status: "active" as const,
      category: "monthly",
      frequency: "monthly",
      coverPageData: activeCanvasSec?.coverPageData || buildCoverData(),
      tableOfContentsData: activeCanvasSec?.tableOfContentsData || DEFAULT_TOC_DATA,
      backCoverData: activeCanvasSec?.backCoverData || DEFAULT_BACK_COVER_DATA,
      canvasSectionId: compositeSectionId,
    };

    try {
      if (isEditing && existingTemplate) {
        const res = await templateApi.updateTemplate(existingTemplate.id, payload);
        dispatch(addOrReplaceTemplate(res.data));
      } else {
        const res = await templateApi.createTemplate(payload);
        dispatch(addOrReplaceTemplate(res.data));
      }
      dispatch(showGlobalToast({ message: `Template "${templateName.trim()}" published successfully!`, type: "success" }));
      router.push("/templates");
    } catch (err: any) {
      if (isEditing && existingTemplate) {
        dispatch(updateTemplate({ id: existingTemplate.id, ...payload }));
      } else {
        dispatch(addTemplate({ created_by: `Superadmin (${activeRole})`, ...payload }));
      }
      dispatch(showGlobalToast({ message: `Template "${templateName.trim()}" published successfully!`, type: "success" }));
      router.push("/templates");
    }
  };

  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-[#07090d]">
      {/* ── Main Visual Canvas Studio (Complete Report Format with Unified Single-Row Header) ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {activeSectionId ? (
          <SectionCanvasEditor
            sectionId={activeSectionId}
            onBack={() => router.push("/templates")}
            showReportFrame={true}
            templateHeaderProps={{
              templateId: activeBlueprintId,
              templateName,
              onTemplateNameChange: setTemplateName,
              sites,
              selectedSiteId,
              onSelectSiteId: setSelectedSiteId,
              onSaveDraft: handleSaveDraft,
              onPublish: handleSaveAndPublish,
            }}
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
