"use client";

import React, { Suspense } from "react";
import { CreateSectionStudio } from "./components";
import { Loader2 } from "lucide-react";

/**
 * Dedicated Route for Creating a New Section Canvas (/templates/Sections&Graphs/create).
 * Renders CreateSectionStudio housed in its dedicated ./components subfolder.
 */
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
      <CreateSectionStudio />
    </Suspense>
  );
}


