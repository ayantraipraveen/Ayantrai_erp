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
} from "./components";

/**
 * Templates Hub Page.
 * Modular, 100% PURE REDUX architecture with ZERO props drilling.
 * All sub-components communicate directly via Redux store.
 */
export default function TemplatesPage() {
  return (
    <div className="animate-fadeIn pb-1 w-full space-y-2 sm:space-y-2.5">
      <div className="px-4 sm:px-6 lg:px-7 space-y-3 sm:space-y-4">
        <TemplateToast />
        <TemplateMetricsBar />
        <TemplateFilterToolbar />
      </div>
      <TemplatesList />
      <TemplateReviewModal />
      <TemplateBuilderDrawer />
      <DeleteTemplateModal />
    </div>
  );
}
