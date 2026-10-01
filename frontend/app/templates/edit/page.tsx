"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setSelectedLibrarySectionId,
  createLibrarySection,
  DEFAULT_COVER_PAGE_DATA,
  DEFAULT_BACK_COVER_DATA,
} from "@/lib/redux/slices/reportModuleSlice";
import SectionCanvasEditor from "../Sections&Graphs/components/SectionCanvasEditor";
import { Loader2 } from "lucide-react";

/**
 * Dedicated Route for Editing a Template Blueprint in the Canvas Studio (/templates/edit?id=...).
 */
function EditTemplateStudioContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const dispatch = useAppDispatch();

  const templateId = searchParams.get("id") || searchParams.get("templateId");
  const urlSectionId = searchParams.get("sectionId");

  const librarySections = useAppSelector((state) => state.reportModule.librarySections || []);
  const templates = useAppSelector((state) => state.reportModule.templates || []);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(urlSectionId);

  useEffect(() => {
    if (urlSectionId && librarySections.some((s) => s.id === urlSectionId)) {
      setActiveSectionId(urlSectionId);
      dispatch(setSelectedLibrarySectionId(urlSectionId));
      return;
    }

    if (templateId) {
      const template = templates.find((t) => t.id === templateId);
      const compositeId = template?.canvasSectionId || `sec-tpl-${templateId.toLowerCase()}`;
      const existing = librarySections.find((s) => s.id === compositeId);

      if (existing) {
        setActiveSectionId(existing.id);
        dispatch(setSelectedLibrarySectionId(existing.id));
        return;
      }

      if (template) {
        const coverData = template.coverPageData || {
          ...DEFAULT_COVER_PAGE_DATA,
          reportType: template.name,
          reportCode: template.id,
          projectSite: template.site_name,
        };

        dispatch(
          createLibrarySection({
            id: compositeId,
            name: template.name,
            eyebrow: "STATUTORY COMPLIANCE BLUEPRINT",
            description: template.description,
            metricCards: [],
            charts: [],
            keyInsights: [],
            canvasRows: [],
            coverPageData: coverData,
            backCoverData: DEFAULT_BACK_COVER_DATA,
          })
        );
        setActiveSectionId(compositeId);
        dispatch(setSelectedLibrarySectionId(compositeId));
        return;
      }
    }

    if (librarySections.length > 0) {
      const firstId = librarySections[0].id;
      setActiveSectionId(firstId);
      dispatch(setSelectedLibrarySectionId(firstId));
    }
  }, [urlSectionId, templateId, librarySections, templates, dispatch]);

  const handleBack = () => {
    dispatch(setSelectedLibrarySectionId(null));
    router.push("/templates");
  };

  if (!activeSectionId) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-white dark:bg-[#07090d]">
        <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
          <span className="text-sm font-semibold">Loading Template Blueprint Canvas...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-[#07090d]">
      <SectionCanvasEditor
        sectionId={activeSectionId}
        onBack={handleBack}
      />
    </div>
  );
}

export default function EditTemplateStudioPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center bg-white dark:bg-[#07090d]">
          <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
            <span className="text-sm font-semibold">Loading Template Blueprint...</span>
          </div>
        </div>
      }
    >
      <EditTemplateStudioContent />
    </Suspense>
  );
}
