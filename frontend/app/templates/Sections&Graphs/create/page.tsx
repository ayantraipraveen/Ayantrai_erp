"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  createLibrarySection,
  setSelectedLibrarySectionId,
} from "@/lib/redux/slices/reportModuleSlice";
import SectionCanvasEditor from "../components/SectionCanvasEditor";
import { Loader2 } from "lucide-react";

/**
 * Dedicated Create Studio Component
 * Combines section creation / initialization state with the full Canva visual editor in a single JSX route.
 */
function CreateSectionStudioContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const librarySections = useAppSelector((state) => state.reportModule.librarySections || []);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    const newId = `sec-custom-${Date.now()}`;
    dispatch(
      createLibrarySection({
        id: newId,
        name: "Department-wise Trends",
        eyebrow: "ATTENDANCE ANALYSIS",
        description: "A detailed view of attendance, late comings and early exits across departments.",
        metricCards: [],
        charts: [],
        keyInsights: [],
        canvasRows: [],
      })
    );
    dispatch(setSelectedLibrarySectionId(newId));
    setActiveSectionId(newId);
  }, [dispatch, librarySections]);

  const handleBack = () => {
    dispatch(setSelectedLibrarySectionId(null));
    router.push("/templates/Sections&Graphs");
  };

  // Loading state while initializing section in store
  if (!activeSectionId) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-white dark:bg-[#07090d]">
        <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
          <span className="text-sm font-semibold">Initializing Blank Studio...</span>
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

export default function CreateSectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center bg-white dark:bg-[#07090d]">
          <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
            <span className="text-sm font-semibold">Loading Studio...</span>
          </div>
        </div>
      }
    >
      <CreateSectionStudioContent />
    </Suspense>
  );
}
