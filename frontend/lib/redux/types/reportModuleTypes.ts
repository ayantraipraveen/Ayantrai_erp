"use client";

import { DateRangeValue } from "@/app/Component/DateRangeFilter";

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
  color?: string;
  colors?: string[];
  gridRows?: number;
  gridCols?: number;
}

export interface LibraryKeyInsightItem {
  id: string;
  text: string;
}

// ── Canvas Row / Cell Types (Canva-like Section Editor) ──────────────────────
export interface CanvasTextBlock {
  id: string;
  content: string; // rich plain text paragraph
}

export interface CanvasBadgeItem {
  id: string;
  label: string;
  value: string;
  icon?: string; // lucide icon name
  color: "blue" | "green" | "purple" | "amber" | "rose" | "cyan";
}

export interface CanvasBadgeStrip {
  id: string;
  badges: CanvasBadgeItem[];
}

export type CanvasBlockType =
  | "metric-card"
  | "chart"
  | "insight"
  | "text"
  | "badge-strip"
  | "divider";

export interface CanvasCellStyle {
  fontFamily?: "sans" | "serif" | "mono" | "rounded";
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl";
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  textAlign?: "left" | "center" | "right";
  textColor?: string;
  cardBg?: string; // preset id or hex color (e.g. 'white', 'slate', 'glass', 'purple', 'indigo', 'emerald', 'amber', 'rose', 'dark')
  borderColor?: string;
  backgroundOpacity?: number; // card background opacity from 0 to 100
}

export interface CanvasCell {
  id: string;
  colSpan: 1 | 2 | 3 | 4; // column span within the row (out of 4)
  customWidth?: number; // fluid/adjustable width percentage (15% to 100%) - not locked to fixed ratio!
  customHeight?: number; // fluid/adjustable height in pixels (e.g. 90px to 800px)
  blockType: CanvasBlockType;
  style?: CanvasCellStyle;
  // Only one of these is set, matching blockType:
  metricCard?: LibraryMetricCard;
  chart?: LibraryChartCard;
  insight?: LibraryKeyInsightItem;
  textBlock?: CanvasTextBlock;
  badgeStrip?: CanvasBadgeStrip;
  // divider has no data payload
}

export interface CanvasRow {
  id: string;
  cells: CanvasCell[];
  pageBreakBefore?: boolean;
}

export interface LibrarySection {
  id: string;
  name: string;
  eyebrow: string;
  description: string;
  type: "core" | "custom";
  icon?: string;
  updatedAt: string;
  headerSpacing?: "compact" | "normal" | "spacious";
  // Legacy flat arrays (kept for backward compat – migrated on first canvas open)
  metricCards: LibraryMetricCard[];
  charts: LibraryChartCard[];
  keyInsights: LibraryKeyInsightItem[];
  // New canvas layout (row-based Canva-like editor)
  canvasRows?: CanvasRow[];
  watermarkId?: string;
}

export interface WatermarkItem {
  id: string;
  name: string;
  tag: string;
  fileName: string;
  svgContent: string;
  opacity: number;
  rotation: number;
  scale: number;
  placement: "center" | "corner" | "footer" | "tiled" | "top-right" | "bottom-right";
  isDefault?: boolean;
  assignedSectionIds: string[];
  createdAt: string;
  updatedAt?: string;
  description?: string;
}

export interface WatermarkConfig {
  svgContent: string;
  fileName: string;
  opacity: number;
  rotation: number;
  scale: number;
  placement: "center" | "corner" | "footer" | "tiled";
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

  // Master Document Watermark Library & Studio
  watermarks: WatermarkItem[];
  selectedWatermarkId: string;
  watermarkConfig: WatermarkConfig;
}
