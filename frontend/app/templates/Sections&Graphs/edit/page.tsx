"use client";

import React, { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { SectionEditorContainer } from "../components";
import { Loader2 } from "lucide-react";

/**
 * Dedicated Route for Editing a Section Canvas by query parameter (/templates/Sections&Graphs/edit?id=...).
 */
function EditSectionContent() {
  const searchParams = useSearchParams();
  const sectionId = searchParams.get("id") || searchParams.get("sectionId");
  return <SectionEditorContainer sectionId={sectionId} />;
}

export default function EditSectionPage() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 min-h-0 flex items-center justify-center bg-white dark:bg-[#07090d]">
          <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400">
            <Loader2 className="w-5 h-5 animate-spin text-[#9D61FF]" />
            <span className="text-sm font-semibold">Loading Section Canvas...</span>
          </div>
        </div>
      }
    >
      <EditSectionContent />
    </Suspense>
  );
}
