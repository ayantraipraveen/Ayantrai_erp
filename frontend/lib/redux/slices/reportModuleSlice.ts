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

export type GraphType = 
  | "line" | "multi-line" | "bar" | "grouped-bar" | "horizontal-bar" 
  | "stacked-horizontal" | "donut" | "pie" | "heatmap" | "two-segment" 
  | "table" | "area" | "stacked-bar" | "radar" | "gauge" | "scatter" 
  | "bubble" | "funnel" | "sparkline" | "combo" | "waterfall" 
  | "treemap" | "kpi-card" | "timeline" | "geo-map";

export type GraphDataSource =
  | "attendance_daily_shifts"
  | "attendance_vendor_distribution"
  | "ppe_sensor_compliance"
  | "helmet_optical_telemetry"
  | "vest_hub_battery_status"
  | "boot_grounding_checks"
  | "supervisory_response_time"
  | "device_daily_operating_hours"
  | "gas_sensor_ppm_levels"
  | "action_plan_completion_rate"
  | "custom_telemetry_feed";

export interface TemplateGraphConfig {
  id: string;
  title: string;
  type: GraphType;
  dataSource: GraphDataSource | string;
  description?: string;
}

export interface TemplateBlock {
  id: string;
  type: TemplateBlockType | string;
  title: string;
  description: string;
  enabled: boolean;
  order: number;
  isCustom?: boolean;
  graphs?: TemplateGraphConfig[];
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

// 4b. Standalone "Sections & Graphs" Master Library Types
export type PaletteRamp =
  | "blue"
  | "green"
  | "purple"
  | "red"
  | "amber"
  | "emerald"
  | "cyan"
  | "orange"
  | "slate";

export interface LibraryMetricCard {
  id: string;
  label: string;
  value: string;
  dataSourceField?: string;
  tintColor: PaletteRamp;
  trendDirection: "up" | "down" | "no-change";
  trendValue: string;
  icon?: string;
}

export interface LibraryChartCard {
  id: string;
  title: string;
  chartType: GraphType;
  dataSourceField: string;
  description?: string;
  colors?: string[];
}

export interface LibraryKeyInsightItem {
  id: string;
  text: string;
}

export interface LibrarySection {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  type: "core" | "custom";
  icon?: string;
  updatedAt: string;
  metricCards: LibraryMetricCard[];
  charts: LibraryChartCard[];
  keyInsights: LibraryKeyInsightItem[];
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
  templateSectionsModalOpen: boolean;
  templateDeleteConfirmId: string | null;
  templateToastMessage: string | null;
  templateActiveTab: "templates" | "sections";
  chartEditorFullscreen: boolean;

  // Master Global Library of Sections & Graphs
  globalSections: TemplateBlock[];
  librarySections: LibrarySection[];
  selectedLibrarySectionId: string | null;
}

const defaultBlocks: TemplateBlock[] = [
  {
    id: "blk-1",
    type: "key_metrics",
    title: "Key Metrics",
    description: "KPI row (attendance rate, compliance rate, risk-free hours, devices deployed)",
    enabled: true,
    order: 1,
    graphs: [
      {
        id: "grp-km-1",
        title: "Workforce Safety KPI Executive Summary",
        type: "bar",
        dataSource: "ppe_sensor_compliance",
        description: "Comparative gauge across active contractors and workforce crews",
      },
    ],
  },
  {
    id: "blk-2",
    type: "attendance_trends",
    title: "Attendance Trends",
    description: "Line chart + insight text (department-wise and vendor-wise breakdown)",
    enabled: true,
    order: 2,
    graphs: [
      {
        id: "grp-att-1",
        title: "Daily Shift Muster Adherence",
        type: "line",
        dataSource: "attendance_daily_shifts",
        description: "Shift 1 vs Shift 2 daily check-in volume",
      },
      {
        id: "grp-att-2",
        title: "Subcontractor Headcount Distribution",
        type: "pie",
        dataSource: "attendance_vendor_distribution",
        description: "Muster distribution across primary civil and MEP vendors",
      },
    ],
  },
  {
    id: "blk-3",
    type: "ppe_compliance_trends",
    title: "PPE Compliance Trends",
    description: "Bar chart + insight text (Smart Helmet, Vest IoT Hub, Safety Boot grounding)",
    enabled: true,
    order: 3,
    graphs: [
      {
        id: "grp-ppe-1",
        title: "Connected PPE Compliance by Zone",
        type: "bar",
        dataSource: "helmet_optical_telemetry",
        description: "Real-time compliance rates from BLE mesh nodes",
      },
      {
        id: "grp-ppe-2",
        title: "Safety Vest Hub & Boot Grounding Sensor Health",
        type: "donut",
        dataSource: "vest_hub_battery_status",
        description: "Active battery status and electrostatic grounding verification",
      },
    ],
  },
  {
    id: "blk-4",
    type: "supervisory_insights",
    title: "Supervisory Insights",
    description: "Table (per-supervisor efficiency, response time, alert handling)",
    enabled: true,
    order: 4,
    graphs: [
      {
        id: "grp-sup-1",
        title: "Supervisor Efficiency & Hazard Response Matrix",
        type: "table",
        dataSource: "supervisory_response_time",
        description: "Tabular audit matrix of incident response times and resolution speed",
      },
    ],
  },
  {
    id: "blk-5",
    type: "device_utilisation",
    title: "Device Utilisation",
    description: "Progress bar (operating hours vs. permissible hours)",
    enabled: true,
    order: 5,
    graphs: [
      {
        id: "grp-dev-1",
        title: "IoT Node & Sensor Permissible Operating Hours",
        type: "bar",
        dataSource: "device_daily_operating_hours",
        description: "Logged active operating hours vs permissible safety operating thresholds",
      },
    ],
  },
  {
    id: "blk-6",
    type: "operational_remarks",
    title: "Operational Remarks",
    description: "Text summary with environmental and shift-level observations",
    enabled: true,
    order: 6,
    graphs: [],
  },
  {
    id: "blk-7",
    type: "improvement_action_plan",
    title: "Improvement & Action Plan",
    description: "Action matrix table (area, focus, owner, target date, status)",
    enabled: true,
    order: 7,
    graphs: [
      {
        id: "grp-act-1",
        title: "Mitigation Action Plan Progress & Resolution Timeline",
        type: "table",
        dataSource: "action_plan_completion_rate",
        description: "High-priority remedial actions and owner accountability matrix",
      },
    ],
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
    status: "rejected",
    rejection_reason: "Missing toxic gas sensor calibration block and emergency protocol sign-off checklist.",
    approved_by: "Dr. Vikram Seth (Superadmin)",
    approved_at: "2026-09-22 11:30 AM",
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
    status: "pending",
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

export const initialLibrarySections: LibrarySection[] = [
  {
    id: "sec-core-1",
    name: "Key Metrics",
    eyebrow: "EXECUTIVE SUMMARY",
    description: "Core workforce safety KPIs, site muster adherence, risk-free hours, and connected telemetry deployment.",
    type: "core",
    icon: "Activity",
    updatedAt: "2026-09-22 14:30",
    metricCards: [
      {
        id: "mc-1",
        label: "Attendance Adherence",
        value: "94.2%",
        dataSourceField: "attendance_rate",
        tintColor: "blue",
        trendDirection: "up",
        trendValue: "+2.4% vs last cycle",
        icon: "Users",
      },
      {
        id: "mc-2",
        label: "PPE Compliance Index",
        value: "98.7%",
        dataSourceField: "compliance_rate",
        tintColor: "emerald",
        trendDirection: "up",
        trendValue: "+1.1% vs target",
        icon: "ShieldCheck",
      },
      {
        id: "mc-3",
        label: "Safe Working Hours",
        value: "14,280 hrs",
        dataSourceField: "risk_free_hours",
        tintColor: "purple",
        trendDirection: "up",
        trendValue: "Zero LTI recorded",
        icon: "Clock",
      },
      {
        id: "mc-4",
        label: "Active Telemetry Hubs",
        value: "142 units",
        dataSourceField: "devices_deployed",
        tintColor: "cyan",
        trendDirection: "no-change",
        trendValue: "100% mesh coverage",
        icon: "Cpu",
      },
    ],
    charts: [
      {
        id: "ch-1",
        title: "Workforce Safety KPI Executive Summary",
        chartType: "bar",
        dataSourceField: "ppe_sensor_compliance",
        description: "Comparative gauge across active contractors and workforce crews",
      },
    ],
    keyInsights: [
      {
        id: "ki-1",
        text: "Overall site muster adherence increased by 2.4% compared to previous reporting fortnight.",
      },
      {
        id: "ki-2",
        text: "Zero lost-time injuries (LTI) sustained across all active structural zones.",
      },
      {
        id: "ki-3",
        text: "142 active BLE telemetry gateways operated with 99.8% uninterrupted uptime.",
      },
    ],
  },
  {
    id: "sec-core-2",
    name: "Attendance Trends",
    eyebrow: "ATTENDANCE ANALYSIS",
    description: "Shift-wise muster adherence, peak biometric check-in curve, and subcontractor headcount breakdown.",
    type: "core",
    icon: "TrendingUp",
    updatedAt: "2026-09-22 15:10",
    metricCards: [
      {
        id: "mc-5",
        label: "Overall Shift Adherence",
        value: "94.2%",
        dataSourceField: "overall_adherence",
        tintColor: "blue",
        trendDirection: "up",
        trendValue: "Across 3 rotating crews",
        icon: "CheckCircle2",
      },
      {
        id: "mc-6",
        label: "Shift 1 Check-ins",
        value: "88 workers",
        dataSourceField: "shift_1_checkins",
        tintColor: "emerald",
        trendDirection: "no-change",
        trendValue: "On-time arrival",
        icon: "Sun",
      },
      {
        id: "mc-7",
        label: "Shift 2 Check-ins",
        value: "54 workers",
        dataSourceField: "shift_2_checkins",
        tintColor: "amber",
        trendDirection: "down",
        trendValue: "-3 workers vs plan",
        icon: "Moon",
      },
    ],
    charts: [
      {
        id: "ch-2",
        title: "Daily Shift Muster Adherence",
        chartType: "line",
        dataSourceField: "attendance_daily_shifts",
        description: "Shift 1 vs Shift 2 daily check-in volume",
      },
      {
        id: "ch-3",
        title: "Subcontractor Headcount Distribution",
        chartType: "pie",
        dataSourceField: "attendance_vendor_distribution",
        description: "Muster distribution across primary civil and MEP vendors",
      },
    ],
    keyInsights: [
      {
        id: "ki-4",
        text: "Peak biometric check-in recorded at 08:45 AM with zero beacon sync latency.",
      },
      {
        id: "ki-5",
        text: "Steel Framing Crew #3 sustained 100% on-time presence across all shift cycles.",
      },
    ],
  },
  {
    id: "sec-core-3",
    name: "PPE Compliance Trends",
    eyebrow: "SAFETY COMPLIANCE",
    description: "Real-time BLE mesh telemetry tracking Smart Helmets, Vest IoT Hubs, and Anti-Slip Boot Grounding.",
    type: "core",
    icon: "Shield",
    updatedAt: "2026-09-21 16:45",
    metricCards: [
      {
        id: "mc-8",
        label: "Smart Helmet Telemetry",
        value: "99.4%",
        dataSourceField: "smart_helmet",
        tintColor: "blue",
        trendDirection: "up",
        trendValue: "141 / 142 active",
        icon: "HardHat",
      },
      {
        id: "mc-9",
        label: "Vest IoT Hubs",
        value: "98.6%",
        dataSourceField: "vest_iot_hub",
        tintColor: "emerald",
        trendDirection: "up",
        trendValue: "140 / 142 active",
        icon: "Shirt",
      },
      {
        id: "mc-10",
        label: "Boot Grounding Sensors",
        value: "98.1%",
        dataSourceField: "boot_grounding",
        tintColor: "cyan",
        trendDirection: "up",
        trendValue: "139 / 142 active",
        icon: "Footprints",
      },
    ],
    charts: [
      {
        id: "ch-4",
        title: "Connected PPE Compliance by Zone",
        chartType: "bar",
        dataSourceField: "helmet_optical_telemetry",
        description: "Real-time compliance rates from BLE mesh nodes",
      },
      {
        id: "ch-5",
        title: "Safety Vest Hub & Boot Grounding Sensor Health",
        chartType: "donut",
        dataSourceField: "vest_hub_battery_status",
        description: "Active battery status and electrostatic grounding verification",
      },
    ],
    keyInsights: [
      {
        id: "ki-6",
        text: "Single temporary helmet unlatch detected in Zone 2 crane swing perimeter; instant haptic buzz triggered compliance recovery in under 4 seconds.",
      },
      {
        id: "ki-7",
        text: "Electrostatic grounding verified zero charge accumulation during concrete batching transfer.",
      },
    ],
  },
  {
    id: "sec-core-4",
    name: "Time & Operational Impact",
    eyebrow: "OPERATIONAL EFFICIENCY",
    description: "Shift muster clearance latency, weather stand-down tracking, and emergency reaction windows.",
    type: "core",
    icon: "Clock",
    updatedAt: "2026-09-20 11:20",
    metricCards: [
      {
        id: "mc-11",
        label: "Muster Gate Clearance",
        value: "1.8 mins",
        dataSourceField: "gate_clearance",
        tintColor: "emerald",
        trendDirection: "down",
        trendValue: "-45s improvement",
        icon: "Zap",
      },
      {
        id: "mc-12",
        label: "Weather Stand-downs",
        value: "0 hrs",
        dataSourceField: "weather_standdowns",
        tintColor: "green",
        trendDirection: "no-change",
        trendValue: "Optimal wind window",
        icon: "CloudRain",
      },
      {
        id: "mc-13",
        label: "Incident Reaction Window",
        value: "18 secs",
        dataSourceField: "reaction_window",
        tintColor: "purple",
        trendDirection: "down",
        trendValue: "-6s faster response",
        icon: "Timer",
      },
    ],
    charts: [
      {
        id: "ch-6",
        title: "Shift Induction & Clearance Duration",
        chartType: "bar",
        dataSourceField: "attendance_daily_shifts",
        description: "Average muster induction time across rotating crews",
      },
    ],
    keyInsights: [
      {
        id: "ki-8",
        text: "Automated NFC badge scanning reduced shift muster bottleneck by 45 seconds per worker.",
      },
      {
        id: "ki-9",
        text: "Weather safety sensor mesh triggered zero unnecessary tower crane stand-downs.",
      },
    ],
  },
  {
    id: "sec-core-5",
    name: "Key Operational Indicators",
    eyebrow: "SITE TELEMETRY",
    description: "Environmental sensor streaming: ambient acoustics, toxic gas PPM levels, high-altitude wind speed, and thermal comfort.",
    type: "core",
    icon: "Gauge",
    updatedAt: "2026-09-21 09:15",
    metricCards: [
      {
        id: "mc-14",
        label: "Ambient Noise Level",
        value: "68.4 dB",
        dataSourceField: "ambient_noise",
        tintColor: "slate",
        trendDirection: "no-change",
        trendValue: "Below 85 dB threshold",
        icon: "Volume2",
      },
      {
        id: "mc-15",
        label: "Toxic Gas PPM",
        value: "0.02 ppm",
        dataSourceField: "toxic_gas",
        tintColor: "emerald",
        trendDirection: "no-change",
        trendValue: "Safe atmospheric grade",
        icon: "Wind",
      },
      {
        id: "mc-16",
        label: "Average Wind Speed",
        value: "14.2 kts",
        dataSourceField: "wind_speed",
        tintColor: "blue",
        trendDirection: "up",
        trendValue: "Crane limit: 28 kts",
        icon: "Compass",
      },
    ],
    charts: [
      {
        id: "ch-7",
        title: "Continuous Gas PPM & Noise Level Telemetry",
        chartType: "line",
        dataSourceField: "gas_sensor_ppm_levels",
        description: "Continuous IoT sensor stream tracking atmospheric toxic gases and decibels",
      },
    ],
    keyInsights: [
      {
        id: "ki-10",
        text: "All hazardous environmental sensor thresholds remained strictly within OSHA and ISO 45001 limits.",
      },
      {
        id: "ki-11",
        text: "Continuous air quality monitoring verified adequate subterranean airflow during tunnel works.",
      },
    ],
  },
  {
    id: "sec-core-6",
    name: "Supervisory Insights",
    eyebrow: "FIELD SUPERVISION",
    description: "Per-supervisor efficiency, crew hazard response latency, and proactive safety intervention logs.",
    type: "core",
    icon: "Users",
    updatedAt: "2026-09-21 11:15",
    metricCards: [
      {
        id: "mc-17",
        label: "Supervisors on Duty",
        value: "3 leads",
        dataSourceField: "supervisors_count",
        tintColor: "purple",
        trendDirection: "no-change",
        trendValue: "100% shift coverage",
        icon: "UserCheck",
      },
      {
        id: "mc-18",
        label: "Avg Intervention Speed",
        value: "24 secs",
        dataSourceField: "avg_response",
        tintColor: "emerald",
        trendDirection: "down",
        trendValue: "32% faster than SLA",
        icon: "Zap",
      },
      {
        id: "mc-19",
        label: "Safety Alerts Handled",
        value: "39 total",
        dataSourceField: "alerts_handled",
        tintColor: "amber",
        trendDirection: "up",
        trendValue: "All successfully cleared",
        icon: "BellRing",
      },
    ],
    charts: [
      {
        id: "ch-8",
        title: "Supervisor Efficiency & Hazard Response Matrix",
        chartType: "table",
        dataSourceField: "supervisory_response_time",
        description: "Tabular audit matrix of incident response times and resolution speed",
      },
    ],
    keyInsights: [
      {
        id: "ki-12",
        text: "Zone 1 supervisor Sunil M. achieved 18s average intervention latency across 12 automated alerts.",
      },
      {
        id: "ki-13",
        text: "Proactive supervisory engagements prevented 14 potential perimeter incursions during crane lifting.",
      },
    ],
  },
  {
    id: "sec-core-7",
    name: "Device/Unit Operating Hours",
    eyebrow: "EQUIPMENT UTILISATION",
    description: "Active runtime hours vs permissible thermal and duty cycle limits for heavy machinery and IoT nodes.",
    type: "core",
    icon: "Cpu",
    updatedAt: "2026-09-20 18:00",
    metricCards: [
      {
        id: "mc-20",
        label: "Active Runtime Hours",
        value: "320 hrs",
        dataSourceField: "active_operating_hours",
        tintColor: "blue",
        trendDirection: "up",
        trendValue: "360 hrs permissible",
        icon: "Clock",
      },
      {
        id: "mc-21",
        label: "Fleet Health Index",
        value: "98.4%",
        dataSourceField: "fleet_health_index",
        tintColor: "emerald",
        trendDirection: "up",
        trendValue: "All BLE Gateways Operational",
        icon: "Activity",
      },
      {
        id: "mc-22",
        label: "Maintenance Flagged",
        value: "0 units",
        dataSourceField: "flagged_units",
        tintColor: "slate",
        trendDirection: "no-change",
        trendValue: "Next check scheduled Sunday",
        icon: "Wrench",
      },
    ],
    charts: [
      {
        id: "ch-9",
        title: "IoT Node & Sensor Permissible Operating Hours",
        chartType: "bar",
        dataSourceField: "device_daily_operating_hours",
        description: "Logged active operating hours vs permissible safety operating thresholds",
      },
    ],
    keyInsights: [
      {
        id: "ki-14",
        text: "Batching plant mixer unit operated at 88.9% permissible threshold with zero overheating events.",
      },
      {
        id: "ki-15",
        text: "Telemetry battery gateways maintained uninterrupted redundant power supply.",
      },
    ],
  },
  {
    id: "sec-core-8",
    name: "Operational Remarks",
    eyebrow: "ENVIRONMENT & OBSERVATIONS",
    description: "Qualitative shift observations, structural concrete curing remarks, and perimeter geotechnical conditions.",
    type: "core",
    icon: "FileText",
    updatedAt: "2026-09-22 17:00",
    metricCards: [
      {
        id: "mc-23",
        label: "Weather Classification",
        value: "Clear / Dry",
        dataSourceField: "weather",
        tintColor: "cyan",
        trendDirection: "no-change",
        trendValue: "31°C Ambient",
        icon: "Sun",
      },
      {
        id: "mc-24",
        label: "Ground Geotech Status",
        value: "Stable",
        dataSourceField: "geotech_status",
        tintColor: "emerald",
        trendDirection: "no-change",
        trendValue: "Settlement < 1.2mm",
        icon: "Mountain",
      },
    ],
    charts: [],
    keyInsights: [
      {
        id: "ki-16",
        text: "Monsoon winds remained below 28 knots throughout the reporting window. High-altitude crane operations in Zone 2 completed without perimeter breaches.",
      },
      {
        id: "ki-17",
        text: "Grounding sensors verified zero electrostatic hazard during heavy concrete pumping.",
      },
    ],
  },
  {
    id: "sec-core-9",
    name: "Improvement & Action Plan",
    eyebrow: "CORRECTIVE ACTIONS",
    description: "Continuous safety improvement items, corrective action tracking, responsible lead assignment, and resolution timelines.",
    type: "core",
    icon: "CheckSquare",
    updatedAt: "2026-09-22 12:45",
    metricCards: [
      {
        id: "mc-25",
        label: "Open Action Items",
        value: "3 pending",
        dataSourceField: "open_actions",
        tintColor: "amber",
        trendDirection: "down",
        trendValue: "2 resolved this week",
        icon: "AlertCircle",
      },
      {
        id: "mc-26",
        label: "SLA Resolution Rate",
        value: "91.4%",
        dataSourceField: "sla_rate",
        tintColor: "emerald",
        trendDirection: "up",
        trendValue: "+4.1% MoM",
        icon: "TrendingUp",
      },
      {
        id: "mc-27",
        label: "Upcoming Deadlines",
        value: "2 items",
        dataSourceField: "upcoming_deadlines",
        tintColor: "purple",
        trendDirection: "no-change",
        trendValue: "Due within 7 days",
        icon: "Calendar",
      },
    ],
    charts: [
      {
        id: "ch-10",
        title: "Mitigation Action Plan Progress & Resolution Timeline",
        chartType: "table",
        dataSourceField: "action_plan_completion_rate",
        description: "High-priority remedial actions and owner accountability matrix",
      },
    ],
    keyInsights: [
      {
        id: "ki-18",
        text: "Deploy secondary BLE repeater to eliminate 40-second response latency for Subcontractor EHS in Zone 3.",
      },
      {
        id: "ki-19",
        text: "Recalibrate anti-slip electrostatic grounding threshold on muddy access ramps.",
      },
      {
        id: "ki-20",
        text: "Compile verified SHA-256 cryptographic hashes for third-party regulatory signoff.",
      },
    ],
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
  templateSectionsModalOpen: false,
  templateDeleteConfirmId: null,
  templateToastMessage: null,
  templateActiveTab: "templates",
  chartEditorFullscreen: false,

  // Master Global Library of Sections & Graphs
  globalSections: defaultBlocks,
  librarySections: initialLibrarySections,
  selectedLibrarySectionId: null,
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
    setSelectedLibrarySectionId: (state, action: PayloadAction<string | null>) => {
      state.selectedLibrarySectionId = action.payload;
    },
    createLibrarySection: (
      state,
      action: PayloadAction<{
        name: string;
        eyebrow?: string;
        description: string;
        icon?: string;
        metricCards?: LibraryMetricCard[];
        charts?: LibraryChartCard[];
        keyInsights?: LibraryKeyInsightItem[];
      }>
    ) => {
      const newSec: LibrarySection = {
        id: `sec-custom-${Date.now()}`,
        name: action.payload.name,
        eyebrow: action.payload.eyebrow || "CUSTOM MODULE",
        description: action.payload.description,
        type: "custom",
        icon: action.payload.icon || "Layers",
        updatedAt: "Just now",
        metricCards: action.payload.metricCards || [],
        charts: action.payload.charts || [],
        keyInsights: action.payload.keyInsights || [],
      };
      state.librarySections.unshift(newSec);
      state.selectedLibrarySectionId = newSec.id;
      state.activityLogs.unshift({
        id: `act-${Date.now()}-lib-add`,
        actor: state.activeRole === "superadmin" ? "Dr. Vikram Seth" : "Site Admin",
        role: state.activeRole === "superadmin" ? "Superadmin" : "Site Admin",
        action: `Created new library section: ${newSec.name}`,
        target: "Sections & Graphs Library",
        timestamp: "Just now",
        type: "template",
      });
    },
    updateLibrarySection: (
      state,
      action: PayloadAction<{
        id: string;
        name: string;
        eyebrow?: string;
        description: string;
        icon?: string;
      }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.id);
      if (sec) {
        sec.name = action.payload.name;
        if (action.payload.eyebrow !== undefined) sec.eyebrow = action.payload.eyebrow;
        sec.description = action.payload.description;
        if (action.payload.icon !== undefined) sec.icon = action.payload.icon;
        sec.updatedAt = "Just now";
      }
    },
    duplicateLibrarySection: (state, action: PayloadAction<string>) => {
      const src = state.librarySections.find((s) => s.id === action.payload);
      if (src) {
        const cloned: LibrarySection = {
          ...src,
          id: `sec-custom-dup-${Date.now()}`,
          name: `${src.name} (Copy)`,
          type: "custom",
          updatedAt: "Just now",
          metricCards: src.metricCards.map((c, i) => ({
            ...c,
            id: `mc-dup-${Date.now()}-${i}`,
          })),
          charts: src.charts.map((ch, i) => ({
            ...ch,
            id: `ch-dup-${Date.now()}-${i}`,
          })),
          keyInsights: src.keyInsights.map((ki, i) => ({
            ...ki,
            id: `ki-dup-${Date.now()}-${i}`,
          })),
        };
        state.librarySections.unshift(cloned);
        state.selectedLibrarySectionId = cloned.id;
        state.activityLogs.unshift({
          id: `act-${Date.now()}-lib-dup`,
          actor: state.activeRole === "superadmin" ? "Dr. Vikram Seth" : "Site Admin",
          role: state.activeRole === "superadmin" ? "Superadmin" : "Site Admin",
          action: `Duplicated library section: ${src.name}`,
          target: `${cloned.id} from ${src.id}`,
          timestamp: "Just now",
          type: "template",
        });
      }
    },
    deleteLibrarySection: (state, action: PayloadAction<string>) => {
      const sec = state.librarySections.find((s) => s.id === action.payload);
      if (sec && sec.type !== "core") {
        state.librarySections = state.librarySections.filter((s) => s.id !== action.payload);
        if (state.selectedLibrarySectionId === action.payload) {
          state.selectedLibrarySectionId = null;
        }
        state.activityLogs.unshift({
          id: `act-${Date.now()}-lib-del`,
          actor: state.activeRole === "superadmin" ? "Dr. Vikram Seth" : "Site Admin",
          role: state.activeRole === "superadmin" ? "Superadmin" : "Site Admin",
          action: `Deleted library section: ${sec.name}`,
          target: sec.id,
          timestamp: "Just now",
          type: "template",
        });
      }
    },
    addCardToSection: (
      state,
      action: PayloadAction<{ sectionId: string; card: Omit<LibraryMetricCard, "id"> }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.metricCards.push({
          ...action.payload.card,
          id: `mc-${Date.now()}`,
        });
        sec.updatedAt = "Just now";
      }
    },
    updateCardInSection: (
      state,
      action: PayloadAction<{ sectionId: string; card: LibraryMetricCard }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        const idx = sec.metricCards.findIndex((c) => c.id === action.payload.card.id);
        if (idx !== -1) {
          sec.metricCards[idx] = action.payload.card;
          sec.updatedAt = "Just now";
        }
      }
    },
    deleteCardFromSection: (
      state,
      action: PayloadAction<{ sectionId: string; cardId: string }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.metricCards = sec.metricCards.filter((c) => c.id !== action.payload.cardId);
        sec.updatedAt = "Just now";
      }
    },
    reorderCardsInSection: (
      state,
      action: PayloadAction<{ sectionId: string; cards: LibraryMetricCard[] }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.metricCards = action.payload.cards;
        sec.updatedAt = "Just now";
      }
    },
    addChartToSection: (
      state,
      action: PayloadAction<{ sectionId: string; chart: Omit<LibraryChartCard, "id"> }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.charts.push({
          ...action.payload.chart,
          id: `ch-${Date.now()}`,
        });
        sec.updatedAt = "Just now";
      }
    },
    updateChartInSection: (
      state,
      action: PayloadAction<{ sectionId: string; chart: LibraryChartCard }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        const idx = sec.charts.findIndex((ch) => ch.id === action.payload.chart.id);
        if (idx !== -1) {
          sec.charts[idx] = action.payload.chart;
          sec.updatedAt = "Just now";
        }
      }
    },
    deleteChartFromSection: (
      state,
      action: PayloadAction<{ sectionId: string; chartId: string }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.charts = sec.charts.filter((ch) => ch.id !== action.payload.chartId);
        sec.updatedAt = "Just now";
      }
    },
    reorderChartsInSection: (
      state,
      action: PayloadAction<{ sectionId: string; charts: LibraryChartCard[] }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.charts = action.payload.charts;
        sec.updatedAt = "Just now";
      }
    },
    addInsightToSection: (
      state,
      action: PayloadAction<{ sectionId: string; text: string }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.keyInsights.push({
          id: `ki-${Date.now()}`,
          text: action.payload.text,
        });
        sec.updatedAt = "Just now";
      }
    },
    updateInsightInSection: (
      state,
      action: PayloadAction<{ sectionId: string; insight: LibraryKeyInsightItem }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        const idx = sec.keyInsights.findIndex((ki) => ki.id === action.payload.insight.id);
        if (idx !== -1) {
          sec.keyInsights[idx] = action.payload.insight;
          sec.updatedAt = "Just now";
        }
      }
    },
    deleteInsightFromSection: (
      state,
      action: PayloadAction<{ sectionId: string; insightId: string }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.keyInsights = sec.keyInsights.filter((ki) => ki.id !== action.payload.insightId);
        sec.updatedAt = "Just now";
      }
    },
    reorderInsightsInSection: (
      state,
      action: PayloadAction<{ sectionId: string; keyInsights: LibraryKeyInsightItem[] }>
    ) => {
      const sec = state.librarySections.find((s) => s.id === action.payload.sectionId);
      if (sec) {
        sec.keyInsights = action.payload.keyInsights;
        sec.updatedAt = "Just now";
      }
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
