"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setSelectedLibrarySectionId } from "@/lib/redux/slices/reportModuleSlice";
import SectionCanvasEditor from "./SectionCanvasEditor";
import { AlertCircle } from "lucide-react";

export interface SectionEditorContainerProps {
  sectionId?: string | null;
  onBack?: () => void;
}

/**
 * Reusable Section Canvas Editor Route Container.
 * Shared between query route (/edit?id=...) and slug route (/edit/[id]).
 * Handles section lookup, Redux binding, empty states, and canvas rendering.
 */
export function SectionEditorContainer({ sectionId, onBack }: SectionEditorContainerProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const librarySections = useAppSelector((state) => state.reportModule.librarySections || []);

  const section = librarySections.find((s) => s.id === sectionId);

  useEffect(() => {
    if (sectionId) {
      dispatch(setSelectedLibrarySectionId(sectionId));
    }
  }, [sectionId, dispatch]);

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

  if (!section) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 space-y-4 bg-white dark:bg-[#07090d]">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <h2 className="text-base font-bold text-slate-800 dark:text-zinc-200">Section Not Found</h2>
        <p className="text-xs text-slate-500 dark:text-zinc-400">
          The requested section &quot;{sectionId}&quot; does not exist or may have been deleted.
        </p>
        <button
          onClick={handleBack}
          className="px-4 py-2 bg-[#9D61FF] text-white text-xs font-bold rounded-xl hover:bg-[#8845fc] cursor-pointer"
        >
          Return to Sections
        </button>
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
