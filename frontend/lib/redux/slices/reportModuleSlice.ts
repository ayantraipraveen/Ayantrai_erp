"use client";

import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { DateRangeValue, DEFAULT_DATE_RANGE } from "@/app/Component/DateRangeFilter";

// ============================================================================
// TYPES & INTERFACES (CENTRALIZED DOMAIN & STATE TYPES)
// ============================================================================

// 1. Roles & Global Toast Notification
export type RoleType = "superadmin" | "admin" | "project_head";

export interface ToastNotification {
  id: string;
  message: string;
  type?: "success" | "info" | "warning" | "error";
  duration?: number;
}

export type ShowGlobalToastPayload =
  | { message: string; type?: "success" | "info" | "warning" | "error"; duration?: number }
  | string;

// 2. Template Blueprint Types & Payloads
export type TemplateBlockType =
  | "key_metrics"
  | "attendance_trends"
  | "ppe_compliance_trends"
  | "supervisory_insights"
  | "device_utilisation"
  | "operational_remarks"
  | "improvement_action_plan";

export interface TemplateBlock {
  id: string;
  type: TemplateBlockType;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
}

export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  site_id: string;
  site_name: string;
  blocks: TemplateBlock[];
  status: "draft" | "pending" | "active" | "rejected";
  created_by: string;
  created_at: string;
  approved_by?: string;
  approved_at?: string;
  rejection_reason?: string;
  remarks?: string;
  version: string;
}

export interface ApproveTemplatePayload {
  templateId: string;
  superadminName: string;
}

export interface RejectTemplatePayload {
  templateId: string;
  reason: string;
  superadminName: string;
}

// 3. Report Content, Insights & Feedback
export interface SupervisoryItem {
  id: string;
  supervisor: string;
  zone: string;
  crew_size: number;
  efficiency: string;
  avg_response: string;
  alerts_handled: number;
  status: "Optimal" | "Action Required" | "Compliant";
}

export interface ActionPlanItem {
  id: string;
  area: string;
  focus: string;
  responsible: string;
  target_date: string;
  status: "In Progress" | "Completed" | "Pending Review";
}

export interface ReportContent {
  key_metrics: {
    attendance_rate: string;
    compliance_rate: string;
    risk_free_hours: string;
    devices_deployed: number;
  };
  attendance_trends: {
    overall_adherence: string;
    shift_1_checkins: number;
    shift_2_checkins: number;
    insight_text: string;
  };
  ppe_compliance: {
    smart_helmet: string;
    vest_iot_hub: string;
    boot_grounding: string;
    insight_text: string;
  };
  supervisory_insights: SupervisoryItem[];
  device_utilisation: {
    active_operating_hours: number;
    permissible_limit_hours: number;
    fleet_health_index: string;
  };
  operational_remarks: string;
  improvement_action_plan: ActionPlanItem[];
}

export interface SectionFeedback {
  id: string;
  report_id: string;
  section_id: TemplateBlockType;
  section_title: string;
  project_head_name: string;
  project_head_email: string;
  comment: string;
  timestamp: string;
  status: "open" | "resolved";
}

export interface GeneratedReport {
  id: string;
  template_id: string;
  template_name: string;
  site_id: string;
  site_name: string;
  period: string;
  status: "draft" | "generated" | "sent" | "feedback_received" | "archived";
  generated_at: string;
  sent_to?: string;
  sent_at?: string;
  content: ReportContent;
  feedbacks: SectionFeedback[];
}

export interface UpdateReportRemarksPayload {
  reportId: string;
  remarks: string;
}

export interface UpdateActionPlanPayload {
  reportId: string;
  items: ActionPlanItem[];
}

export interface SendReportPayload {
  reportId: string;
  recipientEmail: string;
}

export interface AddSectionFeedbackPayload {
  reportId: string;
  sectionId: TemplateBlockType;
  sectionTitle: string;
  comment: string;
  projectHeadName: string;
  projectHeadEmail: string;
}

export interface ResolveSectionFeedbackPayload {
  reportId: string;
  feedbackId: string;
}

// 4. Industrial Sites, Admin Governance & Audit Logs
export interface AdminAccount {
  id: string;
  name: string;
  email: string;
  assigned_site: string;
  assigned_site_id: string;
  status: "Active" | "Inactive";
  last_active: string;
}

export interface SiteInfo {
  id: string;
  name: string;
  location: string;
  active_workers: number;
  assigned_admin_name: string;
  assigned_admin_email: string;
  project_head_name: string;
  project_head_email: string;
  project_head_phone: string;
  auto_attach_pdf: boolean;
}

export interface UpdateSiteSettingPayload {
  siteId: string;
  projectHeadName: string;
  projectHeadEmail: string;
  projectHeadPhone: string;
  autoAttachPdf: boolean;
}

export interface SystemSettings {
  require_superadmin_approval: boolean;
  notification_sender_email: string;
  default_export_format: "PDF/A (ISO 45001)" | "CSV Telemetry Stream" | "Executive Summary Bundle";
  auto_generation_enabled: boolean;
}

export interface ActivityLog {
  id: string;
  actor: string;
  role: string;
  action: string;
  target: string;
  timestamp: string;
  type: "template" | "report" | "feedback" | "admin" | "system";
}

// 5. Main Root Redux Slice State
export interface ReportModuleState {
  activeRole: RoleType;
  templates: ReportTemplate[];
  reports: GeneratedReport[];
  admins: AdminAccount[];
  sites: SiteInfo[];
  systemSettings: SystemSettings;
  activityLogs: ActivityLog[];
  selectedReportId: string | null;

  // Universal Global Toast System
  globalToast: ToastNotification | null;

  // Pure Redux UI & Filter State for Templates Module
  templateSearchQuery: string;
  templateStatusFilter: string;
  templateSiteFilter: string;
  templateDateRange: DateRangeValue;
  templateViewMode: "table" | "grid";
  templateCurrentPage: number;
  templatePageSize: number;
  templateSelectedId: string | null;
  templateEditingId: string | null;
  templateReviewModalOpen: boolean;
  templateBuilderOpen: boolean;
  templateDeleteConfirmId: string | null;
  templateToastMessage: string | null;
}

const defaultBlocks: TemplateBlock[] = [
  {
    id: "blk-1",
    type: "key_metrics",
    title: "Key Metrics",
    description: "KPI row (attendance rate, compliance rate, risk-free hours, devices deployed)",
    enabled: true,
    order: 1,
  },
  {
    id: "blk-2",
    type: "attendance_trends",
    title: "Attendance Trends",
    description: "Line chart + insight text (department-wise and vendor-wise breakdown)",
    enabled: true,
    order: 2,
  },
  {
    id: "blk-3",
    type: "ppe_compliance_trends",
    title: "PPE Compliance Trends",
    description: "Bar chart + insight text (Smart Helmet, Vest IoT Hub, Safety Boot grounding)",
    enabled: true,
    order: 3,
  },
  {
    id: "blk-4",
    type: "supervisory_insights",
    title: "Supervisory Insights",
    description: "Table (per-supervisor efficiency, response time, alert handling)",
    enabled: true,
    order: 4,
  },
  {
    id: "blk-5",
    type: "device_utilisation",
    title: "Device Utilisation",
    description: "Progress bar (operating hours vs. permissible hours)",
    enabled: true,
    order: 5,
  },
  {
    id: "blk-6",
    type: "operational_remarks",
    title: "Operational Remarks",
    description: "Text summary with environmental and shift-level observations",
    enabled: true,
    order: 6,
  },
  {
    id: "blk-7",
    type: "improvement_action_plan",
    title: "Improvement & Action Plan",
    description: "Action matrix table (area, focus, owner, target date, status)",
    enabled: true,
    order: 7,
  },
];

const initialTemplates: ReportTemplate[] = [
  {
    id: "TPL-001",
    name: "Sitesafe Monthly Workforce-Safety & ISO 45001 Report",
    description: "Flagship monthly workforce safety report with full 7-section telemetry and supervisory audit trail.",
    site_id: "SITE-01",
    site_name: "Nx-One Tower Pilot Site (Greater Noida)",
    blocks: defaultBlocks,
    status: "active",
    created_by: "Vikram Seth (Site Admin)",
    created_at: "2026-09-18 10:30 AM",
    approved_by: "Dr. Vikram Seth (Superadmin)",
    approved_at: "2026-09-19 02:15 PM",
    version: "v1.2",
  },
  {
    id: "TPL-002",
    name: "Tunnel Excavation & Subterranean Airflow Audit",
    description: "High-frequency geotechnical and toxic gas compliance protocol template for underground tunnels.",
    site_id: "SITE-02",
    site_name: "Metro Line 4 Underground Tunnel (Mumbai)",
    blocks: defaultBlocks.filter((b) => b.type !== "device_utilisation"),
    status: "pending",
    created_by: "Anita Sharma (Tunnel Safety Lead)",
    created_at: "2026-09-22 09:10 AM",
    version: "v1.0",
  },
  {
    id: "TPL-003",
    name: "High-Speed Rail Viaduct Pre-Cast Concrete Compliance",
    description: "Structural erection safety and crane radius geofencing daily telemetry template.",
    site_id: "SITE-03",
    site_name: "High-Speed Rail Viaduct C-2 (Ahmedabad)",
    blocks: defaultBlocks,
    status: "draft",
    created_by: "Rajesh Gupta (Civil Ops Admin)",
    created_at: "2026-09-21 04:45 PM",
    version: "v0.9",
  },
];

const sampleContent: ReportContent = {
  key_metrics: {
    attendance_rate: "94.2%",
    compliance_rate: "98.7%",
    risk_free_hours: "14,280 hrs",
    devices_deployed: 142,
  },
  attendance_trends: {
    overall_adherence: "94.2% across 3 rotating crews",
    shift_1_checkins: 88,
    shift_2_checkins: 54,
    insight_text:
      "Peak biometric check-in recorded at 08:45 AM with zero beacon sync latency. Steel Framing Crew #3 sustained 100% on-time presence across all shift cycles.",
  },
  ppe_compliance: {
    smart_helmet: "99.4% (141 / 142 active)",
    vest_iot_hub: "98.6% (140 / 142 active)",
    boot_grounding: "98.1% (139 / 142 active)",
    insight_text:
      "Single temporary helmet unlatch detected in Zone 2 crane swing perimeter; instant haptic buzz triggered compliance recovery in under 4 seconds.",
  },
  supervisory_insights: [
    {
      id: "sup-1",
      supervisor: "Sunil M. (Crew Lead #1)",
      zone: "Zone 1 - Ground Yard B",
      crew_size: 42,
      efficiency: "99.1%",
      avg_response: "18s",
      alerts_handled: 12,
      status: "Optimal",
    },
    {
      id: "sup-2",
      supervisor: "Pooja K. (Structural Eng)",
      zone: "Zone 2 - Tower Core L12",
      crew_size: 38,
      efficiency: "97.4%",
      avg_response: "24s",
      alerts_handled: 8,
      status: "Compliant",
    },
    {
      id: "sup-3",
      supervisor: "Anand R. (Subcontractor EHS)",
      zone: "Zone 3 - Batching Plant",
      crew_size: 62,
      efficiency: "93.8%",
      avg_response: "42s",
      alerts_handled: 19,
      status: "Action Required",
    },
  ],
  device_utilisation: {
    active_operating_hours: 320,
    permissible_limit_hours: 360,
    fleet_health_index: "98.4% (All BLE Gateways Operational)",
  },
  operational_remarks:
    "Monsoon winds remained below 28 knots throughout the reporting window. High-altitude crane operations in Zone 2 completed without perimeter breaches. Grounding sensors verified zero electrostatic hazard during heavy concrete pumping.",
  improvement_action_plan: [
    {
      id: "act-1",
      area: "Zone 3 Batching Plant",
      focus: "Deploy secondary BLE repeater to eliminate 40-second response latency for Subcontractor EHS.",
      responsible: "Anand R. / Hardware Telemetry Team",
      target_date: "2026-09-28",
      status: "In Progress",
    },
    {
      id: "act-2",
      area: "Smart Boot Sensors",
      focus: "Recalibrate anti-slip electrostatic grounding threshold on muddy access ramps.",
      responsible: "Pooja K.",
      target_date: "2026-09-25",
      status: "Completed",
    },
    {
      id: "act-3",
      area: "ISO 45001 Audit Dossier",
      focus: "Compile verified SHA-256 cryptographic hashes for third-party regulatory signoff.",
      responsible: "Vikram Seth",
      target_date: "2026-10-02",
      status: "Pending Review",
    },
  ],
};

const initialReports: GeneratedReport[] = [
  {
    id: "REP-2026-09-01",
    template_id: "TPL-001",
    template_name: "Sitesafe Monthly Workforce-Safety & ISO 45001 Report",
    site_id: "SITE-01",
    site_name: "Nx-One Tower Pilot Site (Greater Noida)",
    period: "September 2026",
    status: "feedback_received",
    generated_at: "2026-09-20 02:20 PM",
    sent_to: "ramesh.kulkarni@lt-infra.com (Project Head)",
    sent_at: "2026-09-20 03:00 PM",
    content: sampleContent,
    feedbacks: [
      {
        id: "fb-1",
        report_id: "REP-2026-09-01",
        section_id: "supervisory_insights",
        section_title: "Supervisory Insights",
        project_head_name: "Er. Ramesh Kulkarni (Project Head)",
        project_head_email: "ramesh.kulkarni@lt-infra.com",
        comment:
          "Please verify why Zone 3 average response time lagged at 42 seconds before we table this in the Executive Board review.",
        timestamp: "2026-09-21 11:15 AM",
        status: "open",
      },
      {
        id: "fb-2",
        report_id: "REP-2026-09-01",
        section_id: "improvement_action_plan",
        section_title: "Improvement & Action Plan",
        project_head_name: "Er. Ramesh Kulkarni (Project Head)",
        project_head_email: "ramesh.kulkarni@lt-infra.com",
        comment:
          "Approved the secondary repeater budget. Ensure deployment is certified by the regional EHS auditor.",
        timestamp: "2026-09-21 11:20 AM",
        status: "resolved",
      },
    ],
  },
  {
    id: "REP-2026-08-01",
    template_id: "TPL-001",
    template_name: "Sitesafe Monthly Workforce-Safety & ISO 45001 Report",
    site_id: "SITE-01",
    site_name: "Nx-One Tower Pilot Site (Greater Noida)",
    period: "August 2026",
    status: "sent",
    generated_at: "2026-08-31 06:00 PM",
    sent_to: "ramesh.kulkarni@lt-infra.com (Project Head)",
    sent_at: "2026-09-01 09:00 AM",
    content: sampleContent,
    feedbacks: [],
  },
];

export const ADMINS_STORAGE_KEY = "ayantrai_admins";

export const initialAdmins: AdminAccount[] = [
  {
    id: "adm-1",
    name: "Vikram Seth",
    email: "vikram.seth@lt-infra.com",
    assigned_site: "Nx-One Tower Pilot Site (Greater Noida)",
    assigned_site_id: "SITE-01",
    status: "Active",
    last_active: "Just now",
  },
  {
    id: "adm-2",
    name: "Anita Sharma",
    email: "anita.sharma@mumbai-metro.in",
    assigned_site: "Metro Line 4 Underground Tunnel (Mumbai)",
    assigned_site_id: "SITE-02",
    status: "Active",
    last_active: "12 mins ago",
  },
  {
    id: "adm-3",
    name: "Rajesh Gupta",
    email: "rajesh.gupta@hsr-infra.gov.in",
    assigned_site: "High-Speed Rail Viaduct C-2 (Ahmedabad)",
    assigned_site_id: "SITE-03",
    status: "Active",
    last_active: "1 hour ago",
  },
  {
    id: "adm-4",
    name: "Devendra K.",
    email: "devendra.k@tata-steel.com",
    assigned_site: "Steel Plant Blast Furnace Revamp (Jamshedpur)",
    assigned_site_id: "SITE-04",
    status: "Inactive",
    last_active: "3 days ago",
  },
];

export const getInitialAdmins = (): AdminAccount[] => {
  if (typeof window !== "undefined") {
    try {
      const stored = localStorage.getItem(ADMINS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      localStorage.setItem(ADMINS_STORAGE_KEY, JSON.stringify(initialAdmins));
    } catch (e) {
      console.warn("Could not read admins from localStorage:", e);
    }
  }
  return initialAdmins;
};

const initialSites: SiteInfo[] = [
  {
    id: "SITE-01",
    name: "Nx-One Tower Pilot Site",
    location: "Greater Noida, NCR",
    active_workers: 142,
    assigned_admin_name: "Vikram Seth",
    assigned_admin_email: "vikram.seth@lt-infra.com",
    project_head_name: "Er. Ramesh Kulkarni",
    project_head_email: "ramesh.kulkarni@lt-infra.com",
    project_head_phone: "+91 98201 44521",
    auto_attach_pdf: true,
  },
  {
    id: "SITE-02",
    name: "Metro Line 4 Underground Tunnel",
    location: "Mumbai, MH",
    active_workers: 88,
    assigned_admin_name: "Anita Sharma",
    assigned_admin_email: "anita.sharma@mumbai-metro.in",
    project_head_name: "Dr. Arvind Chawla",
    project_head_email: "arvind.chawla@mmrda.gov.in",
    project_head_phone: "+91 98112 33412",
    auto_attach_pdf: true,
  },
  {
    id: "SITE-03",
    name: "High-Speed Rail Viaduct C-2",
    location: "Ahmedabad, GJ",
    active_workers: 215,
    assigned_admin_name: "Rajesh Gupta",
    assigned_admin_email: "rajesh.gupta@hsr-infra.gov.in",
    project_head_name: "Col. Suresh Nair",
    project_head_email: "suresh.nair@nhsrcl.in",
    project_head_phone: "+91 99002 55678",
    auto_attach_pdf: false,
  },
  {
    id: "SITE-04",
    name: "Steel Plant Blast Furnace Revamp",
    location: "Jamshedpur, JH",
    active_workers: 64,
    assigned_admin_name: "Devendra K.",
    assigned_admin_email: "devendra.k@tata-steel.com",
    project_head_name: "Mr. Tapan Sen",
    project_head_email: "tapan.sen@tata-steel.com",
    project_head_phone: "+91 97714 88901",
    auto_attach_pdf: true,
  },
];

const initialSystemSettings: SystemSettings = {
  require_superadmin_approval: true,
  notification_sender_email: "reports-noreply@ayantrai.com",
  default_export_format: "PDF/A (ISO 45001)",
  auto_generation_enabled: true,
};

const initialActivityLogs: ActivityLog[] = [
  {
    id: "act-01",
    actor: "Er. Ramesh Kulkarni",
    role: "Project Head",
    action: "Submitted section review feedback",
    target: "REP-2026-09-01 (Supervisory Insights)",
    timestamp: "2026-09-21 11:15 AM",
    type: "feedback",
  },
  {
    id: "act-02",
    actor: "Vikram Seth",
    role: "Site Admin",
    action: "Dispatched interactive report link",
    target: "ramesh.kulkarni@lt-infra.com",
    timestamp: "2026-09-20 03:00 PM",
    type: "report",
  },
  {
    id: "act-03",
    actor: "System Engine",
    role: "Automation",
    action: "Auto-generated report from approved template",
    target: "TPL-001 -> REP-2026-09-01",
    timestamp: "2026-09-19 02:16 PM",
    type: "system",
  },
  {
    id: "act-04",
    actor: "Dr. Vikram Seth",
    role: "Superadmin",
    action: "Approved report template",
    target: "TPL-001 (Sitesafe Monthly Workforce-Safety)",
    timestamp: "2026-09-19 02:15 PM",
    type: "template",
  },
  {
    id: "act-05",
    actor: "Anita Sharma",
    role: "Site Admin",
    action: "Submitted new template for approval",
    target: "TPL-002 (Tunnel Excavation Audit)",
    timestamp: "2026-09-22 09:10 AM",
    type: "template",
  },
];

const initialState: ReportModuleState = {
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
  templateDeleteConfirmId: null,
  templateToastMessage: null,
};

export const reportModuleSlice = createSlice({
  name: "reportModule",
  initialState,
  reducers: {
    setActiveRole: (state, action: PayloadAction<RoleType>) => {
      state.activeRole = action.payload;
    },
    setSelectedReportId: (state, action: PayloadAction<string | null>) => {
      state.selectedReportId = action.payload;
    },
    // Template Actions
    addTemplate: (state, action: PayloadAction<Omit<ReportTemplate, "id" | "created_at" | "version">>) => {
      const newId = `TPL-00${state.templates.length + 1}`;
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
        const newId = `TPL-00${state.templates.length + 1}`;
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
    setTemplateDeleteConfirmId: (state, action: PayloadAction<string | null>) => {
      state.templateDeleteConfirmId = action.payload;
    },
    setTemplateToastMessage: (state, action: PayloadAction<string | null>) => {
      state.templateToastMessage = action.payload;
    },
    // Global Universal Toast Reducers
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
  setTemplateDeleteConfirmId,
  setTemplateToastMessage,
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
} = reportModuleSlice.actions;

export default reportModuleSlice.reducer;
