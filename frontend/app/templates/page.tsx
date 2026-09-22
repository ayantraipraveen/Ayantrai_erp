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
    <div className="space-y-5 animate-fadeIn pb-12">
      <TemplateToast />
      <TemplateMetricsBar />
      <TemplateFilterToolbar />
      <TemplatesList />
      <TemplateReviewModal />
      <TemplateBuilderDrawer />
      <DeleteTemplateModal />
    </div>
  );
}
