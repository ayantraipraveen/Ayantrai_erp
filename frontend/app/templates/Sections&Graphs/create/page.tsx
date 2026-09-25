"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  createLibrarySection,
  setSelectedLibrarySectionId,
} from "@/lib/redux/slices/reportModuleSlice";
import SectionCanvasEditor from "../components/SectionCanvasEditor";
import { Loader2 } from "lucide-react";

/**
 * Dedicated Route for Creating a New Section Canvas (/templates/Sections&Graphs/create).
 * Initializes a blank, clean Canva A4 studio ready for authoring custom blocks & charts.
 */
export default function CreateSectionPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const librarySections = useAppSelector((s) => s.reportModule.librarySections || []);

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
        name: "New Custom Section",
        eyebrow: "CUSTOM MODULE",
        description: "Custom reusable report section with attached telemetry and charts.",
        metricCards: [],
        charts: [],
        keyInsights: [],
        canvasRows: [],
      })
    );
    dispatch(setSelectedLibrarySectionId(newId));
    setActiveSectionId(newId);
  }, [dispatch]);

  const handleBack = () => {
    dispatch(setSelectedLibrarySectionId(null));
    router.push("/templates/Sections&Graphs");
  };

  // Wait for blank section initialization
  if (!activeSectionId) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-white dark:bg-[#07090d]">
        <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
          <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
          <span className="text-sm font-semibold">Initializing Blank Canvas Studio...</span>
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
