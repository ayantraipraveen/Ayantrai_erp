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

  // If visiting this route with query parameters (e.g. ?id=... or ?editChartCell=...), forward to /edit
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const search = window.location.search;
      const params = new URLSearchParams(search);
      const id = params.get("id") || params.get("sectionId");
      if (id) {
        dispatch(setSelectedLibrarySectionId(id));
        router.push(`/templates/Sections&Graphs/edit${search}`);
        return;
      }
    }
    dispatch(setSelectedLibrarySectionId(null));
  }, [dispatch, router]);


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
            onSelectSection={(id) => {
              dispatch(setSelectedLibrarySectionId(id));
              router.push(`/templates/Sections&Graphs/edit?id=${id}`);
            }}
            onBackToTemplates={() => router.push("/templates")}
          />
        )}
      </div>
    </div>
  );
}
