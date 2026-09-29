"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setSelectedLibrarySectionId } from "@/lib/redux/slices/reportModuleSlice";
import SectionCanvasEditor from "../../components/SectionCanvasEditor";
import { AlertCircle } from "lucide-react";

/**
 * Dedicated Route for Editing a Section Canvas by Slug (/templates/Sections&Graphs/edit/[id]).
 * Loads the existing section with all its prefilled cards, charts, and stacked column data.
 */
export default function EditSectionByIdPage() {
  const router = useRouter();
  const params = useParams();
  const dispatch = useAppDispatch();
  const sectionId = (params?.id as string) || "";
  const librarySections = useAppSelector((state) => state.reportModule.librarySections || []);

  const section = librarySections.find((s) => s.id === sectionId);

  useEffect(() => {
    if (sectionId) {
      dispatch(setSelectedLibrarySectionId(sectionId));
    }
  }, [sectionId, dispatch]);

  const handleBack = () => {
    dispatch(setSelectedLibrarySectionId(null));
    router.push("/templates/Sections&Graphs");
  };

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
          className="px-4 py-2 bg-[#9D61FF] text-white text-xs font-bold rounded-xl shadow-sm hover:bg-[#8845fc] cursor-pointer"
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
      />
    </div>
  );
}
