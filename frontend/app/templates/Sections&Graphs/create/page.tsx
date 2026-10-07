"use client";

import React, { Suspense, useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/redux/hooks";
import {
  addOrReplaceLibrarySection,
  setSelectedLibrarySectionId,
  showGlobalToast,
} from "@/lib/redux/slices/reportModuleSlice";
import { sectionApi } from "@/lib/api/sectionApi";
import { AlertCircle, ArrowLeft, Loader2, RefreshCw } from "lucide-react";
import Link from "next/link";

/**
 * Dedicated Create Studio Component
 * Connects to template-service API to allocate canonical sequential section ID (sec-custom-${max + 1}),
 * initializes Redux state, and routes to the Visual Canvas Studio.
 */
function CreateSectionStudioContent() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [error, setError] = useState<string | null>(null);
  const initializedRef = useRef(false);

  const initNewSection = React.useCallback(async () => {
    setError(null);
    try {
      const res = await sectionApi.createSection({
        name: "New Custom Report Section",
        eyebrow: "CUSTOM MODULE",
        description: "Custom reusable report section with attached telemetry.",
        type: "custom",
        metricCards: [],
        charts: [],
        keyInsights: [],
        canvasRows: [],
      });

      dispatch(addOrReplaceLibrarySection(res.data));
      dispatch(setSelectedLibrarySectionId(res.data.id));
      dispatch(
        showGlobalToast({
          message: `Created section "${res.data.name}"!`,
          type: "success",
        })
      );
      router.replace(`/templates/Sections&Graphs/edit?id=${res.data.id}`);
    } catch (err: any) {
      console.error("Failed to create section:", err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to create new section. Ensure template-service is running.";
      setError(msg);
    }
  }, [dispatch, router]);

  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    initNewSection();
  }, [initNewSection]);

  if (error) {
    return (
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center p-8 space-y-4 bg-white dark:bg-[#07090d]">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <h2 className="text-base font-bold text-slate-800 dark:text-zinc-200">Unable to Create Section</h2>
        <p className="text-xs text-rose-600 dark:text-rose-400 max-w-md text-center">{error}</p>
        <div className="flex items-center gap-3 pt-2">
          <Link
            href="/templates/Sections&Graphs"
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white flex items-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Sections</span>
          </Link>
          <button
            type="button"
            onClick={initNewSection}
            className="px-4 py-2 rounded-xl bg-[#9D61FF] hover:bg-[#8845fc] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col items-center justify-center bg-white dark:bg-[#07090d] space-y-3">
      <Loader2 className="w-8 h-8 animate-spin text-[#9D61FF]" />
      <span className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
        Initializing Canvas Studio...
      </span>
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
