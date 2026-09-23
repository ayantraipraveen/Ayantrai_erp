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
  SectionListView,
  SectionCanvasEditor,
} from "./components";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setTemplateActiveTab,
  setSelectedLibrarySectionId,
} from "@/lib/redux/slices/reportModuleSlice";
import { FileText, Layers, Sparkles } from "lucide-react";

/**
 * Templates & Reusable Sections Hub Page.
 * Modular, 100% PURE REDUX architecture with ZERO props drilling.
 * Toggle seamlessly between Report Blueprints and Sections & Graphs Library.
 */
export default function TemplatesPage() {
  const dispatch = useAppDispatch();
  const templateActiveTab = useAppSelector(
    (state) => state.reportModule.templateActiveTab || "templates"
  );
  const selectedLibrarySectionId = useAppSelector(
    (state) => state.reportModule.selectedLibrarySectionId
  );
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
            onClick={() => dispatch(setTemplateActiveTab("templates"))}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              templateActiveTab === "templates"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-[#9D61FF]" />
            <span>Report Blueprints</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                templateActiveTab === "templates"
                  ? "bg-purple-500/15 text-[#9D61FF] font-bold"
                  : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
            >
              {templates.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              dispatch(setTemplateActiveTab("sections"));
              dispatch(setSelectedLibrarySectionId(null));
            }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              templateActiveTab === "sections"
                ? "bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-sm font-bold"
                : "text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sections & Graphs</span>
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono ${
                templateActiveTab === "sections"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold"
                  : "bg-slate-200 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400"
              }`}
            >
              {librarySections.length}
            </span>
          </button>
        </div>

        {templateActiveTab === "sections" && selectedLibrarySectionId && (
          <button
            type="button"
            onClick={() => dispatch(setSelectedLibrarySectionId(null))}
            className="text-xs font-semibold text-[#9D61FF] hover:underline flex items-center gap-1 cursor-pointer transition-colors"
          >
            ← Back to All Sections
          </button>
        )}
      </div>

      {templateActiveTab === "templates" ? (
        <>
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
        </>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden pt-2">
          {selectedLibrarySectionId ? (
            <SectionCanvasEditor
              sectionId={selectedLibrarySectionId}
              onBack={() => dispatch(setSelectedLibrarySectionId(null))}
            />
          ) : (
            <SectionListView
              onSelectSection={(id) => dispatch(setSelectedLibrarySectionId(id))}
              onBackToTemplates={() => dispatch(setTemplateActiveTab("templates"))}
            />
          )}
        </div>
      )}
    </div>
  );
}
