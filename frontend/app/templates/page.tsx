"use client";

import React from "react";
import {
  TemplateToast,
  TemplateMetricsBar,
  TemplateFilterToolbar,
  TemplatesList,
  TemplateReviewModal,
  TemplateBuilderDrawer,
  DeleteTemplateModal,
  SectionsCatalogModal,
} from "./components";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setTemplateActiveTab,
  setSelectedLibrarySectionId,
} from "@/lib/redux/slices/reportModuleSlice";
import { FileText, Layers } from "lucide-react";
import Link from "next/link";

/**
 * Templates & Reusable Sections Hub Page.
 * Modular, 100% PURE REDUX architecture with ZERO props drilling.
 */
export default function TemplatesPage() {
  const dispatch = useAppDispatch();
  const templates = useAppSelector((state) => state.reportModule.templates || []);
  const librarySections = useAppSelector(
    (state) => state.reportModule.librarySections || []
  );

  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* 1. Sub-Navigation Switcher (Report Blueprints vs Sections & Graphs) */}
      <div className="px-4 sm:px-6 lg:px-7 pt-2 pb-2 flex-shrink-0 flex items-center justify-between gap-3 border-b border-slate-200/80 dark:border-zinc-800/80 bg-white/50 dark:bg-[#0c1017]/50 backdrop-blur-sm">
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-slate-100/90 dark:bg-zinc-900/90 border border-slate-200/90 dark:border-zinc-800 shadow-inner">
          <button
            type="button"
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold"
          >
            <FileText className="w-3.5 h-3.5 text-[#9D61FF]" />
            <span>Report Blueprints</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-purple-500/15 text-[#9D61FF] font-bold">
              {templates.length}
            </span>
          </button>

          <Link
            href="/templates/Sections&Graphs"
            onClick={() => {
              dispatch(setTemplateActiveTab("sections"));
              dispatch(setSelectedLibrarySectionId(null));
            }}
            className="px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sections &amp; Graphs</span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400">
              {librarySections.length}
            </span>
          </Link>
        </div>
      </div>

      {/* Top Controls: Metrics Bar + Filter Toolbar (Fixed Height) */}
      <div className="px-4 sm:px-6 lg:px-7 space-y-2 sm:space-y-2.5 flex-shrink-0 my-2">
        <TemplateToast />
        <TemplateMetricsBar />
        <TemplateFilterToolbar />
      </div>

      {/* Main Content Area: Flex-1 and fills remaining viewport height */}
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden">
        <TemplatesList />
      </div>

      <TemplateReviewModal />
      <TemplateBuilderDrawer />
      <DeleteTemplateModal />
      <SectionsCatalogModal />
    </div>
  );
}
