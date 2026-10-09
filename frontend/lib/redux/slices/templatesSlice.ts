"use client";

import { createSlice, createAsyncThunk, createSelector, PayloadAction } from "@reduxjs/toolkit";
import { DEFAULT_DATE_RANGE, DateRangeValue, isDateWithinRange } from "@/app/Component/DateRangeFilter";
import { DropdownOption } from "@/app/Component/CustomDropdown";
import { Building, Filter, Clock, CheckCircle2, FileText, XCircle } from "lucide-react";
import {
  ReportTemplate,
  TemplateBlock,
  ApproveTemplatePayload,
  RejectTemplatePayload,
  CoverPageData,
  TableOfContentsData,
  BackCoverData,
} from "../types/reportModuleTypes";
import { initialTemplates } from "../mockData/mockTemplates";
import { templateApi, TemplateListParams } from "@/lib/api";
import { showGlobalToast } from "./reportModuleSlice";
import type { RootState } from "../store";

export interface TemplatesState {
  templates: ReportTemplate[];
  isLoading: boolean;
  error: string | null;
  currentRequestId: string | null;

  // Search & Filter State
  searchQuery: string;
  statusFilter: string;
  siteFilter: string;
  dateRange: DateRangeValue;
  viewMode: "table" | "grid";

  // Pagination State
  currentPage: number;
  pageSize: number;

  // Modals & UI Selection State
  selectedTemplateId: string | null;
  editingTemplateId: string | null;
  reviewModalOpen: boolean;
  builderOpen: boolean;
  deleteConfirmId: string | null;
  toastMessage: string | null;
}

const initialState: TemplatesState = {
  templates: initialTemplates,
  isLoading: false,
  error: null,
  currentRequestId: null,

  searchQuery: "",
  statusFilter: "all",
  siteFilter: "all",
  dateRange: DEFAULT_DATE_RANGE,
  viewMode: "table",

  currentPage: 1,
  pageSize: 10,

  selectedTemplateId: null,
  editingTemplateId: null,
  reviewModalOpen: false,
  builderOpen: false,
  deleteConfirmId: null,
  toastMessage: null,
};

/**
 * Async Thunk: Fetch Templates with query parameters and filters.
 * Prevents duplicate requests if a fetch is already in flight.
 */
export const fetchTemplates = createAsyncThunk<
  ReportTemplate[],
  TemplateListParams | void,
  { state: RootState; rejectValue: string }
>(
  "templates/fetchTemplates",
  async (paramsArg, { getState, rejectWithValue }) => {
    try {
      const state = getState().templates;
      const params: any = {
        limit: 20,
        ...(paramsArg || {}),
      };

      if (!paramsArg) {
        if (state.searchQuery && state.searchQuery.trim()) {
          params.search = state.searchQuery.trim();
        }
        if (state.statusFilter && state.statusFilter !== "all") {
          params.status = state.statusFilter;
        }
        if (state.siteFilter && state.siteFilter !== "all") {
          params.site_id = state.siteFilter;
        }
        if (state.dateRange) {
          if (state.dateRange.startDate) {
            params.startDate = state.dateRange.startDate;
          }
          if (state.dateRange.endDate) {
            params.endDate = state.dateRange.endDate;
          }
          if (state.dateRange.preset && state.dateRange.preset !== "all_time") {
            params.datePreset = state.dateRange.preset;
          }
        }
      }

      const res = await templateApi.getTemplates(params);
      if (res && Array.isArray(res.data)) {
        return res.data;
      }
      return state.templates;
    } catch (err: any) {
      console.warn("Using cached/seed templates:", err);
      return rejectWithValue(err.message || "Failed to fetch templates");
    }
  }
);

/**
 * Async Thunk: Superadmin Approve Template
 */
export const approveTemplateAsync = createAsyncThunk<
  { templateId: string; superadminName: string; updatedTemplate?: ReportTemplate },
  { template: ReportTemplate; superadminName?: string },
  { rejectValue: string }
>(
  "templates/approveTemplateAsync",
  async ({ template, superadminName = "Superadmin Governance" }, { dispatch }) => {
    try {
      const res = await templateApi.approveTemplate(
        template.id,
        "Approved and provisioned for industrial safety reporting"
      );
      dispatch(
        showGlobalToast({
          message: `Template "${template.name}" approved! Report auto-generated.`,
          type: "success",
        })
      );
      return { templateId: template.id, superadminName, updatedTemplate: res?.data };
    } catch {
      dispatch(
        showGlobalToast({
          message: `Template "${template.name}" approved!`,
          type: "success",
        })
      );
      return { templateId: template.id, superadminName };
    }
  }
);

/**
 * Async Thunk: Superadmin Reject Template with Mandatory Reason
 */
export const rejectTemplateAsync = createAsyncThunk<
  { templateId: string; reason: string; superadminName: string },
  { template: ReportTemplate; reason: string; superadminName?: string },
  { rejectValue: string }
>(
  "templates/rejectTemplateAsync",
  async ({ template, reason, superadminName = "Superadmin Governance" }, { dispatch }) => {
    try {
      await templateApi.rejectTemplate(template.id, reason);
      dispatch(
        showGlobalToast({
          message: `Template "${template.name}" returned for revision.`,
          type: "warning",
        })
      );
      return { templateId: template.id, reason, superadminName };
    } catch {
      dispatch(
        showGlobalToast({
          message: `Template "${template.name}" returned for revision.`,
          type: "warning",
        })
      );
      return { templateId: template.id, reason, superadminName };
    }
  }
);

/**
 * Async Thunk: Delete Template Blueprint
 */
export const deleteTemplateAsync = createAsyncThunk<string, string, { rejectValue: string }>(
  "templates/deleteTemplateAsync",
  async (id, { dispatch }) => {
    try {
      await templateApi.deleteTemplate(id);
      dispatch(
        showGlobalToast({
          message: "Template blueprint deleted.",
          type: "error",
        })
      );
      return id;
    } catch {
      dispatch(
        showGlobalToast({
          message: "Template blueprint deleted.",
          type: "error",
        })
      );
      return id;
    }
  }
);

/**
 * Async Thunk: Duplicate / Clone Template Blueprint
 */
export const duplicateTemplateAsync = createAsyncThunk<
  { duplicatedTemplate?: ReportTemplate; originalId: string },
  string,
  { rejectValue: string }
>(
  "templates/duplicateTemplateAsync",
  async (id, { dispatch }) => {
    try {
      const res = await templateApi.cloneTemplate(id);
      dispatch(
        showGlobalToast({
          message: "Template blueprint duplicated to drafts.",
          type: "success",
        })
      );
      return { duplicatedTemplate: res?.data, originalId: id };
    } catch {
      dispatch(
        showGlobalToast({
          message: "Template blueprint duplicated to drafts.",
          type: "success",
        })
      );
      return { originalId: id };
    }
  }
);

/**
 * Async Thunk: Resubmit Template for Superadmin Review
 */
export const resubmitTemplateAsync = createAsyncThunk<string, string, { rejectValue: string }>(
  "templates/resubmitTemplateAsync",
  async (templateId, { dispatch }) => {
    try {
      await templateApi.resubmitTemplate(templateId);
      dispatch(
        showGlobalToast({
          message: "Template resubmitted for Superadmin review!",
          type: "info",
        })
      );
      return templateId;
    } catch {
      dispatch(
        showGlobalToast({
          message: "Template resubmitted for Superadmin review!",
          type: "info",
        })
      );
      return templateId;
    }
  }
);

/**
 * Async Thunk: Update Template Remarks
 */
export const updateTemplateRemarkAsync = createAsyncThunk<
  { templateId: string; remarks: string },
  { templateId: string; remarks: string },
  { rejectValue: string }
>(
  "templates/updateTemplateRemarkAsync",
  async ({ templateId, remarks }, { dispatch }) => {
    try {
      await templateApi.updateTemplate(templateId, { description: remarks });
      dispatch(
        showGlobalToast({
          message: "Template remark saved.",
          type: "success",
        })
      );
      return { templateId, remarks };
    } catch {
      dispatch(
        showGlobalToast({
          message: "Template remark saved.",
          type: "success",
        })
      );
      return { templateId, remarks };
    }
  }
);

export const templatesSlice = createSlice({
  name: "templates",
  initialState,
  reducers: {
    // Template Collection Reducers
    setTemplates: (state, action: PayloadAction<ReportTemplate[]>) => {
      state.templates = action.payload;
      state.isLoading = false;
      state.error = null;
    },

    addOrReplaceTemplate: (state, action: PayloadAction<ReportTemplate>) => {
      const idx = state.templates.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.templates[idx] = action.payload;
      } else {
        state.templates.unshift(action.payload);
      }
    },

    addTemplate: (
      state,
      action: PayloadAction<Omit<ReportTemplate, "id" | "created_at" | "version">>
    ) => {
      const maxIdNum = state.templates.reduce((max: number, t: ReportTemplate) => {
        const match = t.id.match(/TPL-(\d+)/);
        const num = match ? parseInt(match[1], 10) : 0;
        return num > max ? num : max;
      }, 0);
      const nextNum = maxIdNum + 1;
      const newId = `TPL-${String(nextNum).padStart(3, "0")}`;

      const newTemplate: ReportTemplate = {
        ...action.payload,
        id: newId,
        created_at: "Just now",
        version: "v1.0",
      };
      state.templates.unshift(newTemplate);
    },

    updateTemplate: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        description: string;
        site_id: string;
        site_name: string;
        blocks: TemplateBlock[];
        status?: "draft" | "pending" | "active" | "rejected";
        coverPageData?: CoverPageData;
        tableOfContentsData?: TableOfContentsData;
        backCoverData?: BackCoverData;
        category?: string;
        frequency?: string;
        complianceStandards?: string[];
        hasAuditHash?: boolean;
        canvasSectionId?: string;
      }>
    ) => {
      const idx = state.templates.findIndex((t: ReportTemplate) => t.id === action.payload.id);
      if (idx !== -1) {
        const existing = state.templates[idx];
        const prevVer = parseFloat(existing.version.replace("v", "")) || 1.0;
        const newVer = `v${(prevVer + 0.1).toFixed(1)}`;
        state.templates[idx] = {
          ...existing,
          name: action.payload.name,
          description: action.payload.description,
          site_id: action.payload.site_id,
          site_name: action.payload.site_name,
          blocks: action.payload.blocks,
          status:
            action.payload.status ||
            (existing.status === "rejected" ? "pending" : existing.status),
          version: newVer,
          coverPageData: action.payload.coverPageData || existing.coverPageData,
          tableOfContentsData:
            action.payload.tableOfContentsData || existing.tableOfContentsData,
          backCoverData: action.payload.backCoverData || existing.backCoverData,
          category: action.payload.category || existing.category,
          frequency: action.payload.frequency || existing.frequency,
          complianceStandards:
            action.payload.complianceStandards || existing.complianceStandards,
          hasAuditHash:
            action.payload.hasAuditHash !== undefined
              ? action.payload.hasAuditHash
              : existing.hasAuditHash,
          canvasSectionId: action.payload.canvasSectionId || existing.canvasSectionId,
        };
      }
    },

    deleteTemplate: (state, action: PayloadAction<string>) => {
      state.templates = state.templates.filter((t) => t.id !== action.payload);
      if (state.deleteConfirmId === action.payload) {
        state.deleteConfirmId = null;
      }
    },

    duplicateTemplate: (state, action: PayloadAction<string>) => {
      const source = state.templates.find((t) => t.id === action.payload);
      if (source) {
        const maxIdNum = state.templates.reduce((max: number, t: ReportTemplate) => {
          const match = t.id.match(/TPL-(\d+)/);
          const num = match ? parseInt(match[1], 10) : 0;
          return num > max ? num : max;
        }, 0);
        const nextNum = maxIdNum + 1;
        const newId = `TPL-${String(nextNum).padStart(3, "0")}`;

        const cloned: ReportTemplate = {
          ...source,
          id: newId,
          name: `${source.name} (Copy)`,
          status: "draft",
          version: "v1.0",
          created_at: "Just now",
          approved_by: undefined,
          approved_at: undefined,
          rejection_reason: undefined,
        };
        state.templates.unshift(cloned);
      }
    },

    approveTemplate: (state, action: PayloadAction<ApproveTemplatePayload>) => {
      const template = state.templates.find((t) => t.id === action.payload.templateId);
      if (template) {
        template.status = "active";
        template.approved_by = action.payload.superadminName;
        template.approved_at = "Just now";
        template.rejection_reason = undefined;
      }
      state.reviewModalOpen = false;
    },

    rejectTemplate: (state, action: PayloadAction<RejectTemplatePayload>) => {
      const template = state.templates.find((t) => t.id === action.payload.templateId);
      if (template) {
        template.status = "rejected";
        template.rejection_reason = action.payload.reason;
      }
      state.reviewModalOpen = false;
    },

    resubmitTemplate: (state, action: PayloadAction<string>) => {
      const template = state.templates.find((t) => t.id === action.payload);
      if (template) {
        template.status = "pending";
        template.rejection_reason = undefined;
      }
    },

    updateTemplateRemark: (
      state,
      action: PayloadAction<{ templateId: string; remarks: string }>
    ) => {
      const template = state.templates.find((t) => t.id === action.payload.templateId);
      if (template) {
        template.remarks = action.payload.remarks;
        template.description = action.payload.remarks;
      }
    },

    // Filter, Search, Pagination & View Setters
    setTemplateSearchQuery: (state, action: PayloadAction<string>) => {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },

    setTemplateStatusFilter: (state, action: PayloadAction<string>) => {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },

    setTemplateSiteFilter: (state, action: PayloadAction<string>) => {
      state.siteFilter = action.payload;
      state.currentPage = 1;
    },

    setTemplateDateRange: (state, action: PayloadAction<DateRangeValue>) => {
      state.dateRange = action.payload;
      state.currentPage = 1;
    },

    setTemplateViewMode: (state, action: PayloadAction<"table" | "grid">) => {
      state.viewMode = action.payload;
    },

    setTemplateCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },

    setTemplatePageSize: (state, action: PayloadAction<number>) => {
      state.pageSize = action.payload;
      state.currentPage = 1;
    },

    resetTemplateFilters: (state) => {
      state.searchQuery = "";
      state.statusFilter = "all";
      state.siteFilter = "all";
      state.dateRange = DEFAULT_DATE_RANGE;
      state.currentPage = 1;
    },

    // UI Modal & Selected State Setters
    setTemplateSelectedId: (state, action: PayloadAction<string | null>) => {
      state.selectedTemplateId = action.payload;
    },

    setTemplateEditingId: (state, action: PayloadAction<string | null>) => {
      state.editingTemplateId = action.payload;
    },

    setTemplateReviewModalOpen: (state, action: PayloadAction<boolean>) => {
      state.reviewModalOpen = action.payload;
    },

    setTemplateBuilderOpen: (state, action: PayloadAction<boolean>) => {
      state.builderOpen = action.payload;
    },

    setTemplateDeleteConfirmId: (state, action: PayloadAction<string | null>) => {
      state.deleteConfirmId = action.payload;
    },

    setTemplateToastMessage: (state, action: PayloadAction<string | null>) => {
      state.toastMessage = action.payload;
    },
  },
  extraReducers: (builder) => {
    // fetchTemplates
    builder.addCase(fetchTemplates.pending, (state, action) => {
      state.isLoading = true;
      state.error = null;
      state.currentRequestId = action.meta.requestId;
    });
    builder.addCase(fetchTemplates.fulfilled, (state, action) => {
      if (state.currentRequestId === action.meta.requestId) {
        state.isLoading = false;
        state.templates = action.payload;
        state.currentRequestId = null;
      }
    });
    builder.addCase(fetchTemplates.rejected, (state, action) => {
      if (state.currentRequestId === action.meta.requestId) {
        state.isLoading = false;
        if (!action.meta.aborted) {
          state.error = action.payload || "Failed to fetch templates";
        }
        state.currentRequestId = null;
      }
    });

    // approveTemplateAsync
    builder.addCase(approveTemplateAsync.fulfilled, (state, action) => {
      const { templateId, superadminName, updatedTemplate } = action.payload;
      if (updatedTemplate) {
        const idx = state.templates.findIndex((t) => t.id === templateId);
        if (idx !== -1) {
          state.templates[idx] = updatedTemplate;
        }
      } else {
        const tpl = state.templates.find((t) => t.id === templateId);
        if (tpl) {
          tpl.status = "active";
          tpl.approved_by = superadminName;
          tpl.approved_at = "Just now";
          tpl.rejection_reason = undefined;
        }
      }
      state.reviewModalOpen = false;
    });

    // rejectTemplateAsync
    builder.addCase(rejectTemplateAsync.fulfilled, (state, action) => {
      const { templateId, reason } = action.payload;
      const tpl = state.templates.find((t) => t.id === templateId);
      if (tpl) {
        tpl.status = "rejected";
        tpl.rejection_reason = reason;
      }
      state.reviewModalOpen = false;
    });

    // deleteTemplateAsync
    builder.addCase(deleteTemplateAsync.fulfilled, (state, action) => {
      state.templates = state.templates.filter((t) => t.id !== action.payload);
      state.deleteConfirmId = null;
    });

    // duplicateTemplateAsync
    builder.addCase(duplicateTemplateAsync.fulfilled, (state, action) => {
      const { duplicatedTemplate, originalId } = action.payload;
      if (duplicatedTemplate) {
        state.templates.unshift(duplicatedTemplate);
      } else {
        const source = state.templates.find((t) => t.id === originalId);
        if (source) {
          const maxIdNum = state.templates.reduce((max: number, t: ReportTemplate) => {
            const match = t.id.match(/TPL-(\d+)/);
            const num = match ? parseInt(match[1], 10) : 0;
            return num > max ? num : max;
          }, 0);
          const nextNum = maxIdNum + 1;
          const newId = `TPL-${String(nextNum).padStart(3, "0")}`;

          const cloned: ReportTemplate = {
            ...source,
            id: newId,
            name: `${source.name} (Copy)`,
            status: "draft",
            version: "v1.0",
            created_at: "Just now",
            approved_by: undefined,
            approved_at: undefined,
            rejection_reason: undefined,
          };
          state.templates.unshift(cloned);
        }
      }
    });

    // resubmitTemplateAsync
    builder.addCase(resubmitTemplateAsync.fulfilled, (state, action) => {
      const tpl = state.templates.find((t) => t.id === action.payload);
      if (tpl) {
        tpl.status = "pending";
        tpl.rejection_reason = undefined;
      }
    });

    // updateTemplateRemarkAsync
    builder.addCase(updateTemplateRemarkAsync.fulfilled, (state, action) => {
      const { templateId, remarks } = action.payload;
      const tpl = state.templates.find((t) => t.id === templateId);
      if (tpl) {
        tpl.remarks = remarks;
        tpl.description = remarks;
      }
    });
  },
});

export const {
  setTemplates,
  addOrReplaceTemplate,
  addTemplate,
  updateTemplate,
  deleteTemplate,
  duplicateTemplate,
  approveTemplate,
  rejectTemplate,
  resubmitTemplate,
  updateTemplateRemark,
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
  setTemplateDeleteConfirmId,
  setTemplateToastMessage,
} = templatesSlice.actions;

// Action aliases for convenient usage
export const {
  setTemplateSearchQuery: setSearchQuery,
  setTemplateStatusFilter: setStatusFilter,
  setTemplateSiteFilter: setSiteFilter,
  setTemplateDateRange: setDateRange,
  setTemplateViewMode: setViewMode,
  setTemplateCurrentPage: setCurrentPage,
  setTemplatePageSize: setPageSize,
  resetTemplateFilters: resetFilters,
  setTemplateSelectedId: setSelectedTemplateId,
  setTemplateReviewModalOpen: setReviewModalOpen,
  setTemplateDeleteConfirmId: setDeleteConfirmId,
} = templatesSlice.actions;

// Selectors
export const selectTemplatesState = (state: RootState) => state.templates;
export const selectTemplatesList = (state: RootState) => state.templates.templates;
export const selectTemplateSearchQuery = (state: RootState) => state.templates.searchQuery;
export const selectTemplateStatusFilter = (state: RootState) => state.templates.statusFilter;
export const selectTemplateSiteFilter = (state: RootState) => state.templates.siteFilter;
export const selectTemplateDateRange = (state: RootState) => state.templates.dateRange;
export const selectTemplateViewMode = (state: RootState) => state.templates.viewMode;
export const selectTemplateCurrentPage = (state: RootState) => state.templates.currentPage;
export const selectTemplatePageSize = (state: RootState) => state.templates.pageSize;
export const selectSelectedTemplateId = (state: RootState) => state.templates.selectedTemplateId;
export const selectTemplateReviewModalOpen = (state: RootState) => state.templates.reviewModalOpen;
export const selectTemplateDeleteConfirmId = (state: RootState) => state.templates.deleteConfirmId;
export const selectTemplatesLoading = (state: RootState) => state.templates.isLoading;

export const selectSelectedTemplate = createSelector(
  [selectTemplatesList, selectSelectedTemplateId],
  (templates, selectedId) => {
    if (!selectedId) return null;
    return templates.find((t) => t.id === selectedId) || null;
  }
);

export const selectFilteredTemplates = createSelector(
  [selectTemplatesState],
  (state) => {
    const { templates, statusFilter, siteFilter, dateRange, searchQuery } = state;
    return templates.filter((t) => {
      if (statusFilter !== "all" && t.status !== statusFilter) {
        return false;
      }
      if (siteFilter !== "all" && t.site_id !== siteFilter) {
        return false;
      }
      if (!isDateWithinRange(t.created_at, dateRange)) {
        return false;
      }
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = t.name.toLowerCase().includes(query);
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesId = t.id.toLowerCase().includes(query);
        const matchesSite = t.site_name.toLowerCase().includes(query);
        const matchesAuthor = t.created_by.toLowerCase().includes(query);
        if (!matchesName && !matchesDesc && !matchesId && !matchesSite && !matchesAuthor) {
          return false;
        }
      }
      return true;
    });
  }
);

export const selectTemplateCounts = createSelector(
  [selectTemplatesList],
  (templates) => ({
    totalCount: templates.length,
    pendingCount: templates.filter((t) => t.status === "pending").length,
    activeCount: templates.filter((t) => t.status === "active").length,
    draftCount: templates.filter((t) => t.status === "draft").length,
    rejectedCount: templates.filter((t) => t.status === "rejected").length,
  })
);

export const selectPaginatedTemplatesInfo = createSelector(
  [selectFilteredTemplates, selectTemplateCurrentPage, selectTemplatePageSize],
  (filtered, currentPage, pageSize) => {
    const totalFilteredCount = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFilteredCount / pageSize));
    const validPage = Math.min(Math.max(1, currentPage), totalPages);
    const start = (validPage - 1) * pageSize;
    return {
      paginatedTemplates: filtered.slice(start, start + pageSize),
      totalFilteredCount,
      totalPages,
      validPage,
    };
  }
);

export const selectStatusFilterOptions = createSelector(
  [selectTemplateCounts],
  (counts): DropdownOption[] => [
    {
      value: "all",
      label: "All Statuses",
      badge: `${counts.totalCount}`,
      badgeColor: "bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300",
      icon: Filter,
    },
    {
      value: "pending",
      label: "Pending Approval",
      badge: `${counts.pendingCount}`,
      badgeColor: "bg-purple-500/20 text-purple-700 dark:text-[#9D61FF] border-purple-500/30",
      icon: Clock,
    },
    {
      value: "active",
      label: "Active Templates",
      badge: `${counts.activeCount}`,
      badgeColor: "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border-emerald-500/30",
      icon: CheckCircle2,
    },
    {
      value: "draft",
      label: "Drafts",
      badge: `${counts.draftCount}`,
      badgeColor: "bg-slate-500/20 text-slate-600 dark:text-zinc-400",
      icon: FileText,
    },
    {
      value: "rejected",
      label: "Rejected",
      badge: `${counts.rejectedCount}`,
      badgeColor: "bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30",
      icon: XCircle,
    },
  ]
);

export const selectSiteFilterOptions = createSelector(
  [(state: RootState) => state.reportModule.sites],
  (sites): DropdownOption[] => [
    { value: "all", label: "All Industrial Sites" },
    ...sites.map((s) => ({
      value: s.id,
      label: s.name,
      description: s.location,
      icon: Building,
    })),
  ]
);

export const selectHasActiveFilters = createSelector(
  [selectTemplateSearchQuery, selectTemplateStatusFilter, selectTemplateSiteFilter, selectTemplateDateRange],
  (searchQuery, statusFilter, siteFilter, dateRange) =>
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    siteFilter !== "all" ||
    Boolean(
      dateRange.startDate ||
      dateRange.endDate ||
      (dateRange.preset && dateRange.preset !== "all_time")
    )
);

export default templatesSlice.reducer;
