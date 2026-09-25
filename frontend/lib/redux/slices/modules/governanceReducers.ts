"use client";

import { PayloadAction, SliceCaseReducers } from "@reduxjs/toolkit";
import {
  ReportModuleState,
  RoleType,
  ShowGlobalToastPayload,
  UpdateReportRemarksPayload,
  UpdateActionPlanPayload,
  SendReportPayload,
  AddSectionFeedbackPayload,
  ResolveSectionFeedbackPayload,
  UpdateSiteSettingPayload,
  SystemSettings,
  AdminAccount,
  SectionFeedback,
} from "../../types/reportModuleTypes";
import { ADMINS_STORAGE_KEY, initialAdmins } from "../../mockData/mockGovernance";

export const governanceReducers: SliceCaseReducers<ReportModuleState> = {
    setActiveRole: (state, action: PayloadAction<RoleType>) => {
      state.activeRole = action.payload;
    },
    setSelectedReportId: (state, action: PayloadAction<string | null>) => {
      state.selectedReportId = action.payload;
    },
    // Template Actions
    showGlobalToast: (state, action: PayloadAction<ShowGlobalToastPayload>) => {
      const payload = action.payload;
      if (typeof payload === "string") {
        state.globalToast = {
          id: `toast-${Date.now()}`,
          message: payload,
          type: "info",
          duration: 3500,
        };
      } else {
        state.globalToast = {
          id: `toast-${Date.now()}`,
          message: payload.message,
          type: payload.type || "info",
          duration: payload.duration || 3500,
        };
      }
    },
    clearGlobalToast: (state) => {
      state.globalToast = null;
    },
    // Report Actions
    updateReportRemarks: (state, action: PayloadAction<UpdateReportRemarksPayload>) => {
      const report = state.reports.find((r) => r.id === action.payload.reportId);
      if (report) {
        report.content.operational_remarks = action.payload.remarks;
      }
    },
    updateActionPlan: (state, action: PayloadAction<UpdateActionPlanPayload>) => {
      const report = state.reports.find((r) => r.id === action.payload.reportId);
      if (report) {
        report.content.improvement_action_plan = action.payload.items;
      }
    },
    sendReportToProjectHead: (state, action: PayloadAction<SendReportPayload>) => {
      const report = state.reports.find((r) => r.id === action.payload.reportId);
      if (report) {
        report.status = "sent";
        report.sent_to = action.payload.recipientEmail;
        report.sent_at = "Just now";

        state.activityLogs.unshift({
          id: `act-${Date.now()}-send`,
          actor: "Admin Vikram Seth",
          role: "Site Admin",
          action: "Sent interactive report to Project Head",
          target: `${report.id} -> ${action.payload.recipientEmail}`,
          timestamp: "Just now",
          type: "report",
        });
      }
    },
    // Project Head Feedback Actions
    addSectionFeedback: (state, action: PayloadAction<AddSectionFeedbackPayload>) => {
      const report = state.reports.find((r) => r.id === action.payload.reportId);
      if (report) {
        const newFeedback: SectionFeedback = {
          id: `fb-${Date.now()}`,
          report_id: action.payload.reportId,
          section_id: action.payload.sectionId,
          section_title: action.payload.sectionTitle,
          project_head_name: action.payload.projectHeadName,
          project_head_email: action.payload.projectHeadEmail,
          comment: action.payload.comment,
          timestamp: "Just now",
          status: "open",
        };
        report.feedbacks.unshift(newFeedback);
        report.status = "feedback_received";

        state.activityLogs.unshift({
          id: `act-${Date.now()}-fb`,
          actor: action.payload.projectHeadName,
          role: "Project Head",
          action: `Added feedback on [${action.payload.sectionTitle}]`,
          target: `${report.id}`,
          timestamp: "Just now",
          type: "feedback",
        });
      }
    },
    resolveSectionFeedback: (state, action: PayloadAction<ResolveSectionFeedbackPayload>) => {
      const report = state.reports.find((r) => r.id === action.payload.reportId);
      if (report) {
        const fb = report.feedbacks.find((f) => f.id === action.payload.feedbackId);
        if (fb) {
          fb.status = "resolved";
        }
      }
    },
    // Site Setting Action
    updateSiteSetting: (state, action: PayloadAction<UpdateSiteSettingPayload>) => {
      const site = state.sites.find((s) => s.id === action.payload.siteId);
      if (site) {
        site.project_head_name = action.payload.projectHeadName;
        site.project_head_email = action.payload.projectHeadEmail;
        site.project_head_phone = action.payload.projectHeadPhone;
        site.auto_attach_pdf = action.payload.autoAttachPdf;

        state.activityLogs.unshift({
          id: `act-${Date.now()}-site`,
          actor: "Admin Vikram Seth",
          role: "Site Admin",
          action: "Updated site settings & Project Head contact",
          target: site.name,
          timestamp: "Just now",
          type: "admin",
        });
      }
    },
    // System Settings Action
    updateSystemSettings: (state, action: PayloadAction<Partial<SystemSettings>>) => {
      state.systemSettings = { ...state.systemSettings, ...action.payload };
      state.activityLogs.unshift({
        id: `act-${Date.now()}-sys`,
        actor: "Superadmin",
        role: "Superadmin",
        action: "Updated system-wide configuration",
        target: "System Settings",
        timestamp: "Just now",
        type: "system",
      });
    },
    // Admin Management Actions (Persisted in localStorage: 'ayantrai_admins')
    addAdminAccount: (
      state,
      action: PayloadAction<Omit<AdminAccount, "id" | "last_active">>
    ) => {
      const newAdmin: AdminAccount = {
        ...action.payload,
        id: `adm-${Date.now()}`,
        last_active: "Just now",
      };
      state.admins.unshift(newAdmin);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(state.admins));
        } catch (e) {}
      }
      state.activityLogs.unshift({
        id: `act-${Date.now()}-adm`,
        actor: "Dr. Vikram Seth",
        role: "Superadmin",
        action: `Provisioned new admin (${newAdmin.name})`,
        target: `${newAdmin.email} -> ${newAdmin.assigned_site}`,
        timestamp: "Just now",
        type: "admin",
      });
    },
    toggleAdminAccountStatus: (state, action: PayloadAction<string>) => {
      const adm = state.admins.find((a) => a.id === action.payload);
      if (adm) {
        adm.status = adm.status === "Active" ? "Inactive" : "Active";
        if (typeof window !== "undefined") {
          try {
            localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(state.admins));
          } catch (e) {}
        }
        state.activityLogs.unshift({
          id: `act-${Date.now()}-adm-status`,
          actor: "Dr. Vikram Seth",
          role: "Superadmin",
          action: `Set status of admin ${adm.name} to ${adm.status}`,
          target: adm.email,
          timestamp: "Just now",
          type: "admin",
        });
      }
    },
    deleteAdminAccount: (state, action: PayloadAction<string>) => {
      const target = state.admins.find((a) => a.id === action.payload);
      state.admins = state.admins.filter((a) => a.id !== action.payload);
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(state.admins));
        } catch (e) {}
      }
      if (target) {
        state.activityLogs.unshift({
          id: `act-${Date.now()}-adm-del`,
          actor: "Dr. Vikram Seth",
          role: "Superadmin",
          action: `Deleted admin account (${target.name})`,
          target: target.email,
          timestamp: "Just now",
          type: "admin",
        });
      }
    },
    syncAdminsFromStorage: (state) => {
      if (typeof window !== "undefined") {
        try {
          const stored = localStorage.getItem(ADMINS_STORAGE_KEY);
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed) && parsed.length > 0) {
              state.admins = parsed;
              return;
            }
          }
          localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(state.admins));
        } catch (e) {}
      }
    },
    resetAdminsToDefault: (state) => {
      state.admins = initialAdmins;
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(initialAdmins));
        } catch (e) {}
      }
      state.activityLogs.unshift({
        id: `act-${Date.now()}-adm-reset`,
        actor: "Dr. Vikram Seth",
        role: "Superadmin",
        action: "Reset site administrators to default seed accounts",
        target: "Admins Directory",
        timestamp: "Just now",
        type: "admin",
      });
    },
};
