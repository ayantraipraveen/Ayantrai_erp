"use client";

import { PayloadAction, SliceCaseReducers } from "@reduxjs/toolkit";
import { DEFAULT_DATE_RANGE, DateRangeValue } from "@/app/Component/DateRangeFilter";
import {
  ReportModuleState,
  ReportTemplate,
  TemplateBlock,
  ApproveTemplatePayload,
  RejectTemplatePayload,
  TemplateGraphConfig,
  GeneratedReport,
} from "../../types/reportModuleTypes";
import { sampleContent } from "../../mockData/mockGovernance";

export const templatesReducers: SliceCaseReducers<ReportModuleState> = {
    addTemplate: (state, action: PayloadAction<Omit<ReportTemplate, "id" | "created_at" | "version">>) => {
      // Find the highest numerical ID suffix among all existing templates to ensure unique keys
      const maxIdNum = state.templates.reduce((max, t) => {
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
      state.activityLogs.unshift({
        id: `act-${Date.now()}`,
        actor: action.payload.created_by,
        role: "Site Admin",
        action: "Created new report template",
        target: `${newId} (${action.payload.name})`,
        timestamp: "Just now",
        type: "template",
      });
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
      }>
    ) => {
      const idx = state.templates.findIndex((t) => t.id === action.payload.id);
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
          status: action.payload.status || (existing.status === "rejected" ? "pending" : existing.status),
          version: newVer,
        };
        state.activityLogs.unshift({
          id: `act-${Date.now()}`,
          actor: "Vikram Seth (Site Admin)",
          role: "Site Admin",
          action: "Updated template blueprint",
          target: `${existing.id} (${action.payload.name})`,
          timestamp: "Just now",
          type: "template",
        });
      }
    },
    duplicateTemplate: (state, action: PayloadAction<string>) => {
      const source = state.templates.find((t) => t.id === action.payload);
      if (source) {
        const maxIdNum = state.templates.reduce((max, t) => {
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
          created_at: "Just now",
          approved_by: undefined,
          approved_at: undefined,
          rejection_reason: undefined,
          version: "v1.0",
          blocks: source.blocks.map((b, i) => ({
            ...b,
            id: `blk-dup-${Date.now()}-${i}`,
          })),
        };
        state.templates.unshift(cloned);
        state.activityLogs.unshift({
          id: `act-${Date.now()}`,
          actor: "Vikram Seth (Site Admin)",
          role: "Site Admin",
          action: "Duplicated template blueprint",
          target: `${newId} from ${source.id}`,
          timestamp: "Just now",
          type: "template",
        });
      }
    },
    updateTemplateRemark: (
      state,
      action: PayloadAction<{ templateId: string; remarks: string }>
    ) => {
      const template = state.templates.find((t) => t.id === action.payload.templateId);
      if (template) {
        template.remarks = action.payload.remarks;
        state.activityLogs.unshift({
          id: `act-${Date.now()}-rem`,
          actor: state.activeRole === "superadmin" ? "Dr. Vikram Seth" : "Site Admin",
          role: state.activeRole === "superadmin" ? "Superadmin" : "Site Admin",
          action: "Updated template operational remark",
          target: `${template.id} (${template.name})`,
          timestamp: "Just now",
          type: "template",
        });
      }
    },
    approveTemplate: (state, action: PayloadAction<ApproveTemplatePayload>) => {
      const template = state.templates.find((t) => t.id === action.payload.templateId);
      if (template) {
        template.status = "active";
        template.approved_by = action.payload.superadminName;
        template.approved_at = "Just now";

        // Auto-generate report from template (Section 2, step 4)
        const newReportId = `REP-${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, "0")}-${String(state.reports.length + 1).padStart(2, "0")}`;
        const newReport: GeneratedReport = {
          id: newReportId,
          template_id: template.id,
          template_name: template.name,
          site_id: template.site_id,
          site_name: template.site_name,
          period: "Current Shift Cycle (Auto-Generated)",
          status: "generated",
          generated_at: "Just now",
          content: { ...sampleContent },
          feedbacks: [],
        };
        state.reports.unshift(newReport);

        state.activityLogs.unshift({
          id: `act-${Date.now()}-app`,
          actor: action.payload.superadminName,
          role: "Superadmin",
          action: "Approved template and triggered auto-generation",
          target: `${template.id} -> ${newReportId}`,
          timestamp: "Just now",
          type: "template",
        });
      }
    },
    rejectTemplate: (state, action: PayloadAction<RejectTemplatePayload>) => {
      const template = state.templates.find((t) => t.id === action.payload.templateId);
      if (template) {
        template.status = "rejected";
        template.rejection_reason = action.payload.reason;
        template.approved_by = action.payload.superadminName;

        state.activityLogs.unshift({
          id: `act-${Date.now()}-rej`,
          actor: action.payload.superadminName,
          role: "Superadmin",
          action: "Rejected template (returned for revision)",
          target: `${template.id}: ${action.payload.reason}`,
          timestamp: "Just now",
          type: "template",
        });
      }
    },
    resubmitTemplate: (state, action: PayloadAction<string>) => {
      const template = state.templates.find((t) => t.id === action.payload);
      if (template) {
        template.status = "pending";
        template.rejection_reason = undefined;
        state.activityLogs.unshift({
          id: `act-${Date.now()}-resub`,
          actor: "Site Admin",
          role: "Site Admin",
          action: "Resubmitted revised template for Superadmin approval",
          target: `${template.id} (${template.name})`,
          timestamp: "Just now",
          type: "template",
        });
      }
    },
    deleteTemplate: (state, action: PayloadAction<string>) => {
      const tplId = action.payload;
      const tpl = state.templates.find((t) => t.id === tplId);
      state.templates = state.templates.filter((t) => t.id !== tplId);
      state.activityLogs.unshift({
        id: `act-${Date.now()}-del-tpl`,
        actor: "Dr. Vikram Seth",
        role: "Superadmin",
        action: "Deleted report template",
        target: tpl ? `${tpl.id} (${tpl.name})` : tplId,
        timestamp: "Just now",
        type: "template",
      });
    },
    // Template Pure Redux UI, Filters & Pagination Reducers
    setTemplateSearchQuery: (state, action: PayloadAction<string>) => {
      state.templateSearchQuery = action.payload;
      state.templateCurrentPage = 1;
    },
    setTemplateStatusFilter: (state, action: PayloadAction<string>) => {
      state.templateStatusFilter = action.payload;
      state.templateCurrentPage = 1;
    },
    setTemplateSiteFilter: (state, action: PayloadAction<string>) => {
      state.templateSiteFilter = action.payload;
      state.templateCurrentPage = 1;
    },
    setTemplateDateRange: (state, action: PayloadAction<DateRangeValue>) => {
      state.templateDateRange = action.payload;
      state.templateCurrentPage = 1;
    },
    setTemplateViewMode: (state, action: PayloadAction<"table" | "grid">) => {
      state.templateViewMode = action.payload;
    },
    setTemplateCurrentPage: (state, action: PayloadAction<number>) => {
      state.templateCurrentPage = action.payload;
    },
    setTemplatePageSize: (state, action: PayloadAction<number>) => {
      state.templatePageSize = action.payload;
      state.templateCurrentPage = 1;
    },
    resetTemplateFilters: (state) => {
      state.templateSearchQuery = "";
      state.templateStatusFilter = "all";
      state.templateSiteFilter = "all";
      state.templateDateRange = DEFAULT_DATE_RANGE;
      state.templateCurrentPage = 1;
    },
    setTemplateSelectedId: (state, action: PayloadAction<string | null>) => {
      state.templateSelectedId = action.payload;
    },
    setTemplateEditingId: (state, action: PayloadAction<string | null>) => {
      state.templateEditingId = action.payload;
    },
    setTemplateReviewModalOpen: (state, action: PayloadAction<boolean>) => {
      state.templateReviewModalOpen = action.payload;
    },
    setTemplateBuilderOpen: (state, action: PayloadAction<boolean>) => {
      state.templateBuilderOpen = action.payload;
    },
    setTemplateSectionsModalOpen: (state, action: PayloadAction<boolean>) => {
      state.templateSectionsModalOpen = action.payload;
    },
    setTemplateDeleteConfirmId: (state, action: PayloadAction<string | null>) => {
      state.templateDeleteConfirmId = action.payload;
    },
    setTemplateToastMessage: (state, action: PayloadAction<string | null>) => {
      state.templateToastMessage = action.payload;
    },
    setTemplateActiveTab: (state, action: PayloadAction<"templates" | "sections">) => {
      state.templateActiveTab = action.payload;
    },
    setChartEditorFullscreen: (state, action: PayloadAction<boolean>) => {
      state.chartEditorFullscreen = action.payload;
    },

    // Master Global Sections & Graphs Library Reducers
    addGlobalSection: (state, action: PayloadAction<Omit<TemplateBlock, "id" | "order">>) => {
      const newSection: TemplateBlock = {
        ...action.payload,
        id: `blk-custom-${Date.now()}`,
        order: state.globalSections.length + 1,
        isCustom: true,
        graphs: action.payload.graphs || [],
      };
      state.globalSections.push(newSection);
      state.activityLogs.unshift({
        id: `act-${Date.now()}-sec-add`,
        actor: "Dr. Vikram Seth",
        role: "Superadmin",
        action: `Added new report section blueprint: ${newSection.title}`,
        target: "Sections & Graphs Catalog",
        timestamp: "Just now",
        type: "template",
      });
    },
    updateGlobalSection: (
      state,
      action: PayloadAction<{ id: string; title: string; description: string; enabled?: boolean }>
    ) => {
      const sec = state.globalSections.find((s) => s.id === action.payload.id);
      if (sec) {
        sec.title = action.payload.title;
        sec.description = action.payload.description;
        if (action.payload.enabled !== undefined) {
          sec.enabled = action.payload.enabled;
        }
      }
    },
    deleteGlobalSection: (state, action: PayloadAction<string>) => {
      state.globalSections = state.globalSections.filter((s) => s.id !== action.payload);
    },
    addGraphToGlobalSection: (
      state,
      action: PayloadAction<{ sectionId: string; graph: Omit<TemplateGraphConfig, "id"> }>
    ) => {
      const sec = state.globalSections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        if (!sec.graphs) sec.graphs = [];
        sec.graphs.push({
          ...action.payload.graph,
          id: `grp-${Date.now()}`,
        });
      }
    },
    updateGraphInGlobalSection: (
      state,
      action: PayloadAction<{ sectionId: string; graph: TemplateGraphConfig }>
    ) => {
      const sec = state.globalSections.find((s) => s.id === action.payload.sectionId);
      if (sec && sec.graphs) {
        const idx = sec.graphs.findIndex((g) => g.id === action.payload.graph.id);
        if (idx !== -1) {
          sec.graphs[idx] = action.payload.graph;
        }
      }
    },
    deleteGraphFromGlobalSection: (
      state,
      action: PayloadAction<{ sectionId: string; graphId: string }>
    ) => {
      const sec = state.globalSections.find((s) => s.id === action.payload.sectionId);
      if (sec && sec.graphs) {
        sec.graphs = sec.graphs.filter((g) => g.id !== action.payload.graphId);
      }
    },

    // ========================================================================
    // Standalone "Sections & Graphs" Management Library Actions
    // ========================================================================
};
