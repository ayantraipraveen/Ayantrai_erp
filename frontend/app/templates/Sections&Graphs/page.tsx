"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { setSelectedLibrarySectionId } from "@/lib/redux/slices/reportModuleSlice";
import {
  SectionListView,
  SectionCanvasEditor,
} from "./components";

/**
 * Dedicated Route for Sections & Graphs Library (/templates/Sections&Graphs).
 * Provides section blueprint browsing, canvas editing, and telemetry authoring.
 */
export default function SectionsGraphsPage() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const selectedLibrarySectionId = useAppSelector(
    (state) => state.reportModule.selectedLibrarySectionId
  );

  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden bg-white dark:bg-[#0c1017]">
      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden">
        {selectedLibrarySectionId ? (
          <SectionCanvasEditor
            sectionId={selectedLibrarySectionId}
            onBack={() => dispatch(setSelectedLibrarySectionId(null))}
          />
        ) : (
          <SectionListView
            onSelectSection={(id) => dispatch(setSelectedLibrarySectionId(id))}
            onBackToTemplates={() => router.push("/templates")}
          />
        )}
      </div>
    </div>
  );
}
