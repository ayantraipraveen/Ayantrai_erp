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

/**
 * Templates Hub Page.
 * Modular, 100% PURE REDUX architecture with ZERO props drilling.
 * All sub-components communicate directly via Redux store.
 */
export default function TemplatesPage() {
  return (
    <div className="animate-fadeIn w-full h-full flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Top Controls: Metrics Bar + Filter Toolbar (Fixed Height) */}
      <div className="px-4 sm:px-6 lg:px-7 space-y-2 sm:space-y-2.5 flex-shrink-0 mb-2">
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
