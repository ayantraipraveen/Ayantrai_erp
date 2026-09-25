"use client";

import { createSlice } from "@reduxjs/toolkit";
import { DEFAULT_DATE_RANGE } from "@/app/Component/DateRangeFilter";
import { ReportModuleState } from "../types/reportModuleTypes";
import {
  defaultBlocks,
  initialTemplates,
  initialReports,
  getInitialAdmins,
  initialSites,
  initialSystemSettings,
  initialActivityLogs,
  initialWatermarks,
  initialLibrarySections,
} from "../mockData";
import { governanceReducers } from "./modules/governanceReducers";
import { templatesReducers } from "./modules/templatesReducers";
import { sectionsStudioReducers } from "./modules/sectionsStudioReducers";
import { watermarksReducers } from "./modules/watermarksReducers";

// Re-export all domain types & interfaces for 100% backward compatibility
export * from "../types/reportModuleTypes";
// Re-export all initial mock data arrays and storage keys for 100% backward compatibility
export * from "../mockData";

export const initialState: ReportModuleState = {
  activeRole: "superadmin",
  templates: initialTemplates,
  reports: initialReports,
  admins: getInitialAdmins(),
  sites: initialSites,
  systemSettings: initialSystemSettings,
  activityLogs: initialActivityLogs,
  selectedReportId: "REP-2026-09-01",

  // Universal Global Toast System
  globalToast: null,

  // Pure Redux UI & Filter State for Templates Module
  templateSearchQuery: "",
  templateStatusFilter: "all",
  templateSiteFilter: "all",
  templateDateRange: DEFAULT_DATE_RANGE,
  templateViewMode: "table",
  templateCurrentPage: 1,
  templatePageSize: 10,
  templateSelectedId: null,
  templateEditingId: null,
  templateReviewModalOpen: false,
  templateBuilderOpen: false,
  templateSectionsModalOpen: false,
  templateDeleteConfirmId: null,
  templateToastMessage: null,
  templateActiveTab: "templates",
  chartEditorFullscreen: false,

  // Master Global Library of Sections & Graphs
  globalSections: defaultBlocks,
  librarySections: initialLibrarySections,
  selectedLibrarySectionId: null,

  // Master Document Watermark Library & Studio
  watermarks: initialWatermarks,
  selectedWatermarkId: "wm-approved",

  // Document Watermark Studio
  watermarkConfig: {
    svgContent: initialWatermarks[0].svgContent,
    fileName: initialWatermarks[0].fileName,
    opacity: initialWatermarks[0].opacity,
    rotation: initialWatermarks[0].rotation,
    scale: initialWatermarks[0].scale,
    placement: "center",
  },
};

export const reportModuleSlice = createSlice({
  name: "reportModule",
  initialState,
  reducers: {
    ...governanceReducers,
    ...templatesReducers,
    ...sectionsStudioReducers,
    ...watermarksReducers,
  },
});

export const {
  setActiveRole,
  setSelectedReportId,
  addTemplate,
  updateTemplate,
  duplicateTemplate,
  updateTemplateRemark,
  approveTemplate,
  rejectTemplate,
  resubmitTemplate,
  deleteTemplate,
  setTemplateSearchQuery,
  setTemplateStatusFilter,
  setTemplateSiteFilter,
  setTemplateDateRange,
  setTemplateViewMode,
  setTemplateCurrentPage,
  setTemplatePageSize,
  resetTemplateFilters,
  setTemplateSelectedId,
  setTemplateEditingId,
  setTemplateReviewModalOpen,
  setTemplateBuilderOpen,
  setTemplateSectionsModalOpen,
  setTemplateDeleteConfirmId,
  setTemplateToastMessage,
  setTemplateActiveTab,
  setChartEditorFullscreen,
  addGlobalSection,
  updateGlobalSection,
  deleteGlobalSection,
  addGraphToGlobalSection,
  updateGraphInGlobalSection,
  deleteGraphFromGlobalSection,
  setSelectedLibrarySectionId,
  createLibrarySection,
  updateLibrarySection,
  setSectionWatermark,
  duplicateLibrarySection,
  deleteLibrarySection,
  addCardToSection,
  updateCardInSection,
  deleteCardFromSection,
  reorderCardsInSection,
  addChartToSection,
  updateChartInSection,
  deleteChartFromSection,
  reorderChartsInSection,
  addInsightToSection,
  updateInsightInSection,
  deleteInsightFromSection,
  reorderInsightsInSection,
  // Canvas Row/Cell Actions (Canva-like Editor)
  migrateToCanvasRows,
  addCanvasRow,
  addRowWithCell,
  toggleRowPageBreak,
  removeCanvasRow,
  addCellToRow,
  moveCellBetweenRows,
  reorderCellsInRow,
  reorderCanvasRows,
  duplicateCanvasCell,
  deleteCanvasCell,
  updateCellColSpan,
  updateCellWidth,
  updateCellStyleInCell,
  updateTextBlockInCell,
  updateBadgeStripInCell,
  updateMetricCardInCell,
  updateChartInCell,
  updateInsightInCell,
  showGlobalToast,
  clearGlobalToast,
  updateReportRemarks,
  updateActionPlan,
  sendReportToProjectHead,
  addSectionFeedback,
  resolveSectionFeedback,
  updateSiteSetting,
  updateSystemSettings,
  addAdminAccount,
  toggleAdminAccountStatus,
  deleteAdminAccount,
  syncAdminsFromStorage,
  resetAdminsToDefault,
  setWatermarkConfig,
  createWatermark,
  updateWatermark,
  deleteWatermark,
  duplicateWatermark,
  setSelectedWatermarkId,
  setDefaultWatermark,
  assignWatermarkToSections,
} = reportModuleSlice.actions;

export default reportModuleSlice.reducer;
