"use client";

import { useAppSelector } from "@/lib/redux/hooks";
import {
  TemplateMetricsBar,
  TemplateFilterToolbar,
  TemplatesTable,
  TemplatesGrid,
  TemplateReviewModal,
  TemplateBuilderDrawer,
  DeleteTemplateModal,
} from "./components";

/**
 * Templates & Reusable Sections Hub Page.
 * Modular, 100% PURE REDUX architecture with ZERO props drilling.
 */
export default function TemplatesPage() {
  const viewMode = useAppSelector(
    (state) => state.reportModule.templateViewMode
  );

  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">

      {/* Top Controls: Metrics Bar + Filter Toolbar (Fixed Height) */}
      <div className="px-4 sm:px-6 lg:px-7 space-y-2 sm:space-y-2.5 flex-shrink-0 my-2">
        <TemplateMetricsBar />
        <TemplateFilterToolbar />
      </div>

      {/* Main Content Area: Flex-1 and fills remaining viewport height */}
      <div className="flex-1 min-h-0 flex flex-col w-full overflow-hidden">
        {viewMode === "table" ? <TemplatesTable /> : <TemplatesGrid />}
      </div>

      <TemplateReviewModal />
      <TemplateBuilderDrawer />
      <DeleteTemplateModal />
    </div>
  );
}
