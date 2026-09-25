"use client";

import {
  GeneratedReport,
  AdminAccount,
  SiteInfo,
  SystemSettings,
  ActivityLog,
  ReportContent,
} from "../types/reportModuleTypes";

export const sampleContent: ReportContent = {
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

export const initialReports: GeneratedReport[] = [
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

export const initialSites: SiteInfo[] = [
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

export const initialSystemSettings: SystemSettings = {
  require_superadmin_approval: true,
  notification_sender_email: "reports-noreply@ayantrai.com",
  default_export_format: "PDF/A (ISO 45001)",
  auto_generation_enabled: true,
};

export const initialActivityLogs: ActivityLog[] = [
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
