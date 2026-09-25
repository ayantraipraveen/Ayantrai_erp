"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  createLibrarySection,
  setSelectedLibrarySectionId,
} from "@/lib/redux/slices/reportModuleSlice";
import SectionCanvasEditor from "../../components/SectionCanvasEditor";
import { Loader2 } from "lucide-react";

export interface CreateSectionStudioProps {
  onBack?: () => void;
  defaultName?: string;
  defaultEyebrow?: string;
  defaultDescription?: string;
}

/**
 * Dedicated Create Studio Component
 * Located in: frontend/app/templates/Sections&Graphs/create/components/CreateSectionStudio.tsx
 * Manages creation of a new blank section and renders the A4 Canva Editor.
 */
export default function CreateSectionStudio({
  onBack,
  defaultName = "Department-wise Trends",
  defaultEyebrow = "ATTENDANCE ANALYSIS",
  defaultDescription = "A detailed view of attendance, late comings and early exits across departments.",
}: CreateSectionStudioProps) {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const initializedRef = useRef(false);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    // Create a new blank section with empty rows and default metadata
    const newId = `sec-custom-${Date.now()}`;
    dispatch(
      createLibrarySection({
        id: newId,
        name: defaultName,
        eyebrow: defaultEyebrow,
        description: defaultDescription,
        metricCards: [],
        charts: [],
        keyInsights: [],
        canvasRows: [],
      })
    );
    dispatch(setSelectedLibrarySectionId(newId));
    setActiveSectionId(newId);
  }, [dispatch, defaultName, defaultEyebrow, defaultDescription]);

  const handleBack = () => {
    dispatch(setSelectedLibrarySectionId(null));
    if (onBack) {
      onBack();
    } else {
      router.push("/templates/Sections&Graphs");
    }
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
