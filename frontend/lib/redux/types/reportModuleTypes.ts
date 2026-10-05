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
  category?: string;
  frequency?: string;
  complianceStandards?: string[];
  hasAuditHash?: boolean;
  coverPageData?: CoverPageData;
  tableOfContentsData?: TableOfContentsData;
  backCoverData?: BackCoverData;
  canvasSectionId?: string;
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

export interface ChartDataPoint {
  id?: string;
  label: string;
  value: number;
  secondaryValue?: number;
  tertiaryValue?: number;
  quaternaryValue?: number;
  color?: string;
  // Multi-dimensional & specialized chart fields
  x?: number | string;
  y?: number;
  size?: number; // bubble size / weight / radius
  target?: number;
  status?: string; // "Optimal" | "Review" | "Completed" | "Safe" | "Passed"
  category?: string;
  trend?: string; // KPI trend e.g. "+3.4%"
  trendDirection?: "up" | "down" | "no-change";
  rowValues?: (number | string)[]; // Matrix / Table row values
}

export interface ChartAxisConfig {
  title?: string;
  labels?: string[];
  min?: number;
  max?: number;
  step?: number;
  unit?: string;
  showGridLines?: boolean;
}

export interface ChartSeriesConfig {
  id: string;
  name: string;
  color?: string;
  data: number[];
}

export interface ChartCustomizationOptions {
  showValues?: boolean;
  showLegend?: boolean;
  legendPosition?: "top" | "bottom" | "right";
  smoothCurve?: boolean;
  showGridLines?: boolean;
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
  // Dynamic Chart Values & Axis Configuration
  dataPoints?: ChartDataPoint[];
  xAxis?: ChartAxisConfig;
  yAxis?: ChartAxisConfig;
  series?: ChartSeriesConfig[];
  options?: ChartCustomizationOptions;
  // Matrix & Table datasets
  matrixData?: number[][];
  matrixRowLabels?: string[];
  matrixColLabels?: string[];
  tableColumns?: { id: string; label: string }[];
  tableRows?: Record<string, string | number>[];
}

export type KeyInsightVariant =
  | "single"
  | "columns-numbered"
  | "columns-titled"
  | "vertical-takeaways"
  | "narrative-summary"
  | "split-quote"
  | "quote-card"
  | "risk-factors"
  | "bullet-observations"
  | "priority-actions"
  | "vision-banner";

export interface KeyInsightBulletItem {
  id: string;
  num?: number;
  color?: string; // "green" | "blue" | "purple" | "orange" | "red" | "amber" | "emerald" | "sky"
  title?: string;
  text: string;
  subItems?: string[];
}

export interface LibraryKeyInsightItem {
  id: string;
  text: string;
  variant?: KeyInsightVariant;
  title?: string;
  badgeNumber?: number;
  items?: KeyInsightBulletItem[];
  quote?: {
    text: string;
    author?: string;
  };
  banner?: {
    headline: string;
    subtitle: string;
    pills?: string[];
    tagline?: string;
  };
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
  | "divider"
  | "element"; // SVG element / decorative asset (can also be used as watermark layer)

/** A reusable SVG decorative element — can sit as a canvas block OR as a watermark overlay */
export interface CanvasElementBlock {
  /** Unique id of the source asset from the Element Library */
  sourceId: string;
  /** The raw SVG markup to render */
  svgContent: string;
  /** Display name of the element */
  name: string;
  /** Opacity 0-100 */
  opacity: number;
  /** Rotation in degrees */
  rotation: number;
  /** Scale percentage (e.g. 100 = default) */
  scale: number;
  /** Use as overlay watermark on the whole section page instead of inline canvas block */
  isWatermark: boolean;
  /** Placement when used as watermark */
  watermarkPlacement?: "center" | "top-right" | "bottom-right" | "bottom-left" | "top-left" | "tiled" | "footer";
  /** z-index layer: 'back' = behind content (default for watermarks), 'front' = above content */
  layer?: "back" | "front";
}

export interface CanvasCellStyle {
  fontFamily?: "sans" | "serif" | "mono" | "rounded";
  fontSize?: "xs" | "sm" | "base" | "lg" | "xl";
  customFontSize?: number; // custom font size in px (e.g. 8 to 48)
  fontWeight?: "normal" | "medium" | "semibold" | "bold";
  textAlign?: "left" | "center" | "right";
  textColor?: string;
  cardBg?: string; // preset id or hex color (e.g. 'white', 'slate', 'glass', 'purple', 'indigo', 'emerald', 'amber', 'rose', 'dark')
  borderColor?: string; // preset id or hex color or 'transparent'
  borderWidth?: number; // 0, 1, 2, 3, 4
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  borderRadius?: number | "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | string; // custom px (0-60) or preset
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | "glow" | string; // custom box-shadow or preset
  backgroundOpacity?: number; // card background opacity from 0 to 100
  padding?: number; // inner card padding in px (0-64px)
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number; // outer card margin in px (0-48px)
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
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
  elementBlock?: CanvasElementBlock; // SVG element / watermark asset
  stackedCells?: CanvasCell[]; 
}

export interface CanvasRowStyle {
  columnGap?: number; // px gap between cells horizontally in this row (0-64px, default 12px)
  rowGap?: number; // px gap when items wrap or stacked cells (0-64px, default 12px)
  padding?: number; // uniform row padding in px
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number; // uniform row margin in px
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  borderWidth?: number; // border width in px
  borderColor?: string; // hex, preset or transparent
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  borderRadius?: number | "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | string;
}

export interface CanvasCoordinateStamp {
  id: string;
  sourceId: string;
  name: string;
  svgContent?: string;
  pageIndex: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  opacity: number;
  layer: "front" | "back";
  zIndex?: number;
  locked?: boolean;
  elementType?: "stamp" | "chart" | "metric-card" | "text" | "insight" | "badge-strip";
  chart?: LibraryChartCard;
  metricCard?: LibraryMetricCard;
  textBlock?: CanvasTextBlock;
  insight?: LibraryKeyInsightItem;
  badgeStrip?: CanvasBadgeStrip;
}

export type CanvasCoordinateElement = CanvasCoordinateStamp;

export interface CanvasRow {
  id: string;
  cells: CanvasCell[];
  pageBreakBefore?: boolean;
  style?: CanvasRowStyle;
  sectionName?: string;
  sectionNameHtml?: string;
  sectionEyebrow?: string;
  sectionEyebrowHtml?: string;
}

export interface CanvasSectionStyle {
  padding?: number; // uniform section padding in px
  paddingTop?: number;
  paddingBottom?: number;
  paddingLeft?: number;
  paddingRight?: number;
  margin?: number; // uniform section margin in px
  marginTop?: number;
  marginBottom?: number;
  marginLeft?: number;
  marginRight?: number;
  borderWidth?: number; // border width in px
  borderColor?: string; // hex, preset or transparent
  borderStyle?: "solid" | "dashed" | "dotted" | "none";
  borderRadius?: number | "none" | "sm" | "md" | "lg" | "xl" | "2xl" | "full" | string;
  backgroundColor?: string;
  backgroundOpacity?: number;
  shadow?: "none" | "sm" | "md" | "lg" | "xl" | string;
}

export interface SectionTitleStyle {
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  color?: string;
  accentColor?: string;
  letterSpacing?: string;
}

export interface CoverPageData {
  reportType: string;
  subtitle: string;
  reportingPeriod: string;
  projectSite: string;
  preparedFor: string;
  preparedBy: string;
  eyebrow?: string;
  classification?: string;
  classificationBadgeColor?: string;
  reportCode?: string;
  organizationLogoUrl?: string;
}

export const DEFAULT_COVER_PAGE_DATA: CoverPageData = {
  reportType: "Monthly Report",
  subtitle: "WORKFORCE INSIGHTS\nFOR A SAFER TOMORROW",
  reportingPeriod: "01 September 2025 – 30 September 2025",
  projectSite: "ABC Infrastructure Project",
  preparedFor: "Project Head",
  preparedBy: "AyantrAI – Sitesafe Team",
};

export interface BackCoverData {
  thankYouTitle: string;
  thankYouMessage: string;
  companyName: string;
  websiteUrl: string;
  email: string;
  location: string;
  heroEyebrow?: string;
  heroTitle?: string;
  heroDescription?: string;
  productTitle?: string;
  productTagline?: string;
  productDescription?: string;
  qrHeading?: string;
  qrSubtext?: string;
  qrUrl?: string;
  thankYouSubtext?: string;
  flagHeading?: string;
  footerTagline?: string;
  heroBrandTagline?: string;
}

export const DEFAULT_BACK_COVER_DATA: BackCoverData = {
  thankYouTitle: "Thank You",
  thankYouMessage: "for being a part of our safety journey.",
  companyName: "AyantrAI Private Limited",
  websiteUrl: "www.ayantrai.com  |  www.sitesafe.ai",
  email: "hello@ayantrai.com",
  location: "Noida, Uttar Pradesh, India",
  heroBrandTagline: "AI FOR A SAFER TOMORROW",
  heroEyebrow: "TECHNOLOGY THAT PROTECTS\nTHE PEOPLE WHO BUILD OUR TOMORROW",
  heroTitle: "Safer People\nStronger Industries",
  heroDescription: "At AyantrAI, we build AI and IoT solutions that make workplaces safer, smarter and more productive. Our flagship product, Sitesafe, helps organisations ensure PPE compliance, monitor workforce safety and enable data-driven decisions across industrial environments.",
  productTitle: "Sitesafe",
  productTagline: "Smart PPE. Safer Sites.",
  productDescription: "AI + IoT powered safety and workforce management platform for construction, manufacturing, mining and industrial sites.",
  qrHeading: "View the Full Report Online",
  qrSubtext: "Scan the QR code to access the digital version of this report.",
  qrUrl: "https://reports.sitesafe.ai",
  thankYouSubtext: "Together, we can create workplaces where every worker returns home safe, every day.",
  flagHeading: "INNOVATION\nFOR A SAFER\nTOMORROW",
  footerTagline: "People  |  Technology  |  Safer Tomorrow",
};

export interface TableOfContentsItem {
  id: string;
  number: string;
  title: string;
  description: string;
  pageRange: string;
  iconType?: string;
  color?: string;
}

export interface TableOfContentsData {
  title: string;
  subtitle: string;
  sidebarTitle?: string;
  sidebarTagline?: string;
  reportingPeriod?: string;
  projectSite?: string;
  reportTitle?: string;
  headerSubtitle?: string;
  scriptQuote?: string;
  footerCompany?: string;
  footerWebsite?: string;
  footerQuote?: string;
  items: TableOfContentsItem[];
}

export const DEFAULT_TOC_DATA: TableOfContentsData = {
  title: "Contents",
  subtitle: "A complete overview of workforce safety, device utilisation and operational performance.",
  sidebarTitle: "Safer People\nStronger Industries",
  sidebarTagline: "AI + IoT for a safer,\nsmarter tomorrow.",
  reportingPeriod: "01 Sept 2025 – 30 Sept 2025",
  projectSite: "ABC Infrastructure Project",
  reportTitle: "Monthly Report",
  headerSubtitle: "Visibility for Every Worker,\nIntelligence for Every Site.",
  scriptQuote: "Every Worker\nReturns Home Safe",
  footerCompany: "AYANTRAI PRIVATE LIMITED",
  footerWebsite: "www.ayantrai.com  |  www.sitesafe.ai",
  footerQuote: "“Every Worker Returns Home Safe”",
  items: [
    { id: "toc-1", number: "01", title: "Key Metrics", description: "Overall performance summary and key highlights for the reporting period.", pageRange: "3", iconType: "chart", color: "#3b82f6" },
    { id: "toc-2", number: "02", title: "Attendance Trends", description: "Workforce attendance overview, trends and department-wise analysis.", pageRange: "4 – 7", iconType: "users", color: "#10b981" },
    { id: "toc-3", number: "03", title: "Violation Trends", description: "PPE violations, trends, categories and recurring issues.", pageRange: "8 – 12", iconType: "alert", color: "#ef4444" },
    { id: "toc-4", number: "04", title: "Supervisor Analysis", description: "Supervisor performance, alert handling and response analysis.", pageRange: "13 – 15", iconType: "supervisor", color: "#8b5cf6" },
    { id: "toc-5", number: "05", title: "Unit Analysis", description: "Device utilisation, operating hours and unit-wise performance.", pageRange: "16", iconType: "box", color: "#f59e0b" },
    { id: "toc-6", number: "06", title: "Operational Review", description: "Key observations, insights and operational remarks.", pageRange: "17", iconType: "file", color: "#2563eb" },
    { id: "toc-7", number: "07", title: "Improvement and Action Plan", description: "Focus areas, action items and targets for the next reporting period.", pageRange: "18", iconType: "target", color: "#6366f1" },
    { id: "toc-8", number: "08", title: "Critical Alerts Analysis", description: "Detailed breakdown of high-severity alerts, causes and response metrics for management review.", pageRange: "19", iconType: "target", color: "#8b5cf6" },
  ],
};

export const DEFAULT_TABLE_OF_CONTENTS_DATA: TableOfContentsData = DEFAULT_TOC_DATA;

export interface LibrarySection {
  id: string;
  name: string;
  titleHtml?: string;
  titleStyle?: SectionTitleStyle;
  eyebrow: string;
  eyebrowHtml?: string;
  description: string;
  descriptionHtml?: string;
  type: "core" | "custom";
  icon?: string;
  isTemplate?: boolean;
  updatedAt: string;
  headerSpacing?: "compact" | "normal" | "spacious";
  sectionStyle?: CanvasSectionStyle;
  // Legacy flat arrays (kept for backward compat – migrated on first canvas open)
  metricCards: LibraryMetricCard[];
  charts: LibraryChartCard[];
  keyInsights: LibraryKeyInsightItem[];
  // New canvas layout (row-based Canva-like editor)
  canvasRows?: CanvasRow[];
  watermarkId?: string;
  stamps?: CanvasCoordinateStamp[];
  // Fixed first/last page data
  coverPageData?: CoverPageData;
  tableOfContentsData?: TableOfContentsData;
  backCoverData?: BackCoverData;
  // Per-page header/title configuration overrides (e.g. Page 1 mandatory, Page 2+ editable/deletable)
  pageOverrides?: Record<number, PageConfigOverride>;
}

export interface PageConfigOverride {
  hideReportHeader?: boolean;
  hideSectionTitle?: boolean;
  sectionName?: string;
  sectionTitleHtml?: string;
  sectionEyebrow?: string;
  sectionEyebrowHtml?: string;
  sectionDescription?: string;
  sectionDescriptionHtml?: string;
  headerValues?: {
    taglinePrimary?: string;
    taglinePrimaryHtml?: string;
    taglineSecondary?: string;
    taglineSecondaryHtml?: string;
    title?: string;
    titleHtml?: string;
    period?: string;
    periodHtml?: string;
  };
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
