"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setSelectedLibrarySectionId,
  addOrReplaceLibrarySection,
} from "@/lib/redux/slices/reportModuleSlice";
import { sectionApi } from "@/lib/api/sectionApi";
import SectionCanvasEditor from "./SectionCanvasEditor";
import { AlertCircle, Loader2, RefreshCw, ArrowLeft } from "lucide-react";

export interface SectionEditorContainerProps {
  sectionId?: string | null;
  onBack?: () => void;
}

/**
 * Reusable Section Canvas Editor Route Container.
 * Shared between query route (/edit?id=...) and slug route (/edit/[id]).
 * Handles section lookup, database cold loading, Redux binding, empty states, and canvas rendering.
 */
export function SectionEditorContainer({ sectionId, onBack }: SectionEditorContainerProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const librarySections = useAppSelector((state) => state.reportModule.librarySections || []);

  const section = librarySections.find((s) => s.id === sectionId);

  const [isLoading, setIsLoading] = useState(!section && !!sectionId);
  const [fetchError, setFetchError] = useState<string | null>(null);

  useEffect(() => {
    if (sectionId) {
      dispatch(setSelectedLibrarySectionId(sectionId));
    }
  }, [sectionId, dispatch]);

  const loadSectionFromApi = useCallback(async () => {
    if (!sectionId) return;
    setIsLoading(true);
    setFetchError(null);
    try {
      const res = await sectionApi.getSectionById(sectionId);
      if (res.data) {
        dispatch(addOrReplaceLibrarySection(res.data));
      }
    } catch (err: any) {
      console.error("Failed to load section by ID from API:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        `Section "${sectionId}" was not found in the database.`;
      setFetchError(msg);
    } finally {
      setIsLoading(false);
    }
  }, [sectionId, dispatch]);

  // If section is not found in Redux (e.g. cold load or page refresh), load directly from database API
  useEffect(() => {
    if (!section && sectionId) {
      loadSectionFromApi();
    }
  }, [section, sectionId, loadSectionFromApi]);

  const handleBack = () => {
    dispatch(setSelectedLibrarySectionId(null));
    if (onBack) {
      onBack();
    } else {
      router.push("/templates/Sections&Graphs");
    }
  };

  if (!sectionId) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 space-y-4 bg-white dark:bg-[#07090d]">
        <AlertCircle className="w-10 h-10 text-rose-500" />
        <h2 className="text-base font-bold text-slate-800 dark:text-zinc-200">No Section ID Specified</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">Please select a section from the library to edit.</p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-[#9D61FF] text-white text-xs font-bold rounded-xl hover:bg-[#8845fc] cursor-pointer"
        >
          Return to Sections
        </button>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 space-y-3 bg-white dark:bg-[#07090d]">
        <Loader2 className="w-8 h-8 animate-spin text-[#9D61FF]" />
        <h2 className="text-sm font-bold text-slate-800 dark:text-zinc-200">Loading Section Canvas...</h2>
      </div>
    );
  }

  if (fetchError || !section) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 space-y-4 bg-white dark:bg-[#07090d]">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800 dark:text-zinc-200">Section Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400 max-w-md text-center leading-relaxed">
          {fetchError || `The requested section "${sectionId}" does not exist or may have been deleted.`}
        </p>
        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={handleBack}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Sections</span>
          </button>
          <button
            onClick={loadSectionFromApi}
            className="px-4 py-2 bg-[#9D61FF] text-white text-xs font-bold rounded-xl hover:bg-[#8845fc] cursor-pointer flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-[#07090d]">
      <SectionCanvasEditor
        sectionId={section.id}
        onBack={handleBack}
        showReportFrame={false}
      />
    </div>
  );
}

export default SectionEditorContainer;
