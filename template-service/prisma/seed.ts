import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultBlocks = [
  {
    id: 'blk-1',
    type: 'key_metrics',
    title: 'Key Metrics',
    description: 'KPI row (attendance rate, compliance rate, risk-free hours, devices deployed)',
    enabled: true,
    order: 1,
    graphs: [
      {
        id: 'grp-km-1',
        title: '',
        type: 'bar',
        dataSource: 'ppe_sensor_compliance',
        description: 'Comparative gauge across active contractors and workforce crews',
      },
    ],
  },
  {
    id: 'blk-2',
    type: 'attendance_trends',
    title: 'Attendance Trends',
    description: 'Line chart + insight text (department-wise and vendor-wise breakdown)',
    enabled: true,
    order: 2,
    graphs: [
      {
        id: 'grp-att-1',
        title: 'Daily Shift Muster Adherence',
        type: 'line',
        dataSource: 'attendance_daily_shifts',
        description: 'Shift 1 vs Shift 2 daily check-in volume',
      },
      {
        id: 'grp-att-2',
        title: 'Subcontractor Headcount Distribution',
        type: 'pie',
        dataSource: 'attendance_vendor_distribution',
        description: 'Muster distribution across primary civil and MEP vendors',
      },
    ],
  },
  {
    id: 'blk-3',
    type: 'ppe_compliance_trends',
    title: 'PPE Compliance Trends',
    description: 'Bar chart + insight text (Smart Helmet, Vest IoT Hub, Safety Boot grounding)',
    enabled: true,
    order: 3,
    graphs: [
      {
        id: 'grp-ppe-1',
        title: 'Connected PPE Compliance by Zone',
        type: 'bar',
        dataSource: 'helmet_optical_telemetry',
        description: 'Real-time compliance rates from BLE mesh nodes',
      },
      {
        id: 'grp-ppe-2',
        title: 'Safety Vest Hub & Boot Grounding Sensor Health',
        type: 'donut',
        dataSource: 'vest_hub_battery_status',
        description: 'Active battery status and electrostatic grounding verification',
      },
    ],
  },
  {
    id: 'blk-4',
    type: 'supervisory_insights',
    title: 'Supervisory Insights',
    description: 'Table (per-supervisor efficiency, response time, alert handling)',
    enabled: true,
    order: 4,
    graphs: [
      {
        id: 'grp-si-1',
        title: 'Zone Supervisor Triage Response Distribution',
        type: 'bar',
        dataSource: 'supervisor_triage_log',
        description: 'Minutes taken to acknowledge and resolve high-severity SOS alarms',
      },
    ],
  },
  {
    id: 'blk-5',
    type: 'device_utilisation',
    title: 'Device Utilisation & Battery Health',
    description: 'Battery health, connectivity stats, charging cycles',
    enabled: true,
    order: 5,
    graphs: [
      {
        id: 'grp-du-1',
        title: 'Wearable Fleet Battery Depletion Curve',
        type: 'line',
        dataSource: 'fleet_battery_telemetry',
        description: 'Hourly battery discharge across Shift 1 and Shift 2',
      },
    ],
  },
  {
    id: 'blk-6',
    type: 'contractor_comparison',
    title: 'Contractor Safety Index',
    description: 'Cross-vendor compliance benchmark ranking',
    enabled: true,
    order: 6,
    graphs: [
      {
        id: 'grp-cc-1',
        title: 'Subcontractor PPE Compliance Index (%)',
        type: 'bar',
        dataSource: 'contractor_compliance_index',
        description: 'Audit score ranking across primary subcontractors',
      },
    ],
  },
  {
    id: 'blk-7',
    type: 'action_tracker',
    title: 'Statutory Action Tracker & Sign-off',
    description: 'Open corrective actions, resolution timeline, and supervisor sign-off ledger',
    enabled: true,
    order: 7,
    graphs: [],
  },
];

async function seed() {
  console.log('🌱 Seeding template blueprints into database ayantrai_templates...');

  const templates = [
    {
      id: 'TPL-001',
      name: 'Sitesafe Monthly Workforce-Safety & ISO 45001 Report',
      description: 'Flagship monthly workforce safety report with full 7-section telemetry and supervisory audit trail.',
      siteId: 'SITE-01',
      siteName: 'Nx-One Tower Pilot Site (Greater Noida)',
      status: 'active' as const,
      version: 'v1.2',
      category: 'Statutory Safety Audit',
      frequency: 'Monthly',
      complianceStandards: ['ISO 45001', 'OSHA 1926.651'],
      hasAuditHash: true,
      blocks: defaultBlocks,
      createdBy: 'usr_admin_1',
      authorName: 'Vikram Seth (Site Admin)',
      approvedBy: 'Superadmin Governance',
      approvedAt: new Date('2026-09-19T14:15:00Z'),
      remarks: 'Approved and active for monthly compliance cycles',
    },
    {
      id: 'TPL-002',
      name: 'Tunnel Excavation & Subterranean Airflow Audit',
      description: 'High-frequency geotechnical and toxic gas compliance protocol template for underground tunnels.',
      siteId: 'SITE-02',
      siteName: 'Metro Line 4 Underground Tunnel (Mumbai)',
      status: 'rejected' as const,
      version: 'v1.0',
      category: 'Underground Operations',
      frequency: 'Daily Shift',
      complianceStandards: ['DGMS Circular 2024', 'ISO 45001'],
      hasAuditHash: true,
      blocks: defaultBlocks.filter((b) => b.type !== 'device_utilisation'),
      createdBy: 'usr_lead_2',
      authorName: 'Anita Sharma (Tunnel Safety Lead)',
      rejectionReason: 'Missing toxic gas sensor calibration block and emergency protocol sign-off checklist.',
      remarks: 'Revisions requested by Safety Directorate',
    },
    {
      id: 'TPL-003',
      name: 'High-Speed Rail Viaduct Pre-Cast Concrete Compliance',
      description: 'Structural erection safety and crane radius geofencing daily telemetry template.',
      siteId: 'SITE-03',
      siteName: 'High-Speed Rail Viaduct C-2 (Ahmedabad)',
      status: 'pending' as const,
      version: 'v0.9',
      category: 'Civil Infrastructure',
      frequency: 'Weekly',
      complianceStandards: ['ISO 45001', 'IRC Special Publication 2025'],
      hasAuditHash: true,
      blocks: defaultBlocks,
      createdBy: 'usr_ops_3',
      authorName: 'Rajesh Gupta (Civil Ops Admin)',
      remarks: 'Submitted for Superadmin governance approval',
    },
  ];

  for (const tpl of templates) {
    await prisma.reportTemplate.upsert({
      where: { id: tpl.id },
      update: tpl,
      create: tpl,
    });
    console.log(`✅ Seeded template: [${tpl.id}] ${tpl.name} (${tpl.status})`);
  }

  const watermarks = [
    {
      id: 'wm-seed-1',
      name: 'AyantrAI Official Approved Stamp',
      fileName: 'ayantrai-official-stamp.svg',
      svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#9D61FF" stroke-width="2.5">
    <rect x="6" y="6" width="368" height="108" rx="14" stroke-dasharray="6 4" />
    <path d="M 50 60 L 70 40 L 90 60 L 70 80 Z" fill="#9D61FF" fill-opacity="0.2" />
    <text x="110" y="54" font-family="monospace" font-size="22" font-weight="900" fill="#9D61FF" letter-spacing="3">AYANTRAI</text>
    <text x="110" y="76" font-family="monospace" font-size="10.5" font-weight="700" fill="#9D61FF" letter-spacing="2">OFFICIAL COMPLIANCE STAMP</text>
  </g>
</svg>`,
      sizeBytes: 1420,
      scale: 100,
      opacity: 18,
      rotation: 0,
      placement: 'center',
      tag: 'compliance',
      isDefault: true,
      description: 'Official AyantrAI statutory compliance approval seal',
    },
    {
      id: 'wm-seed-2',
      name: 'ISO 45001:2018 Certified Stamp',
      fileName: 'iso-45001-certified.svg',
      svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#10B981" stroke-width="2.5">
    <circle cx="60" cy="60" r="42" stroke-dasharray="4 3" />
    <circle cx="60" cy="60" r="32" fill="#10B981" fill-opacity="0.15" />
    <path d="M 48 60 L 56 68 L 74 48" stroke="#10B981" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
    <text x="120" y="52" font-family="monospace" font-size="20" font-weight="900" fill="#10B981" letter-spacing="2">ISO 45001:2018</text>
    <text x="120" y="74" font-family="monospace" font-size="11" font-weight="700" fill="#10B981" letter-spacing="1.5">OCCUPATIONAL SAFETY VERIFIED</text>
  </g>
</svg>`,
      sizeBytes: 1180,
      scale: 100,
      opacity: 18,
      rotation: 0,
      placement: 'center',
      tag: 'certified',
      isDefault: false,
      description: 'ISO 45001 Occupational Health & Safety Management certification seal',
    },
    {
      id: 'wm-seed-3',
      name: 'Confidential Security Seal',
      fileName: 'confidential-telemetry.svg',
      svgContent: `<svg viewBox="0 0 380 120" xmlns="http://www.w3.org/2000/svg">
  <g fill="none" stroke="#EF4444" stroke-width="2.5">
    <rect x="8" y="8" width="364" height="104" rx="10" stroke-width="3" />
    <line x1="8" y1="28" x2="372" y2="28" stroke-width="1.5" />
    <line x1="8" y1="92" x2="372" y2="92" stroke-width="1.5" />
    <text x="190" y="66" text-anchor="middle" font-family="monospace" font-size="24" font-weight="900" fill="#EF4444" letter-spacing="6">CONFIDENTIAL</text>
    <text x="190" y="21" text-anchor="middle" font-family="monospace" font-size="8.5" font-weight="700" fill="#EF4444" letter-spacing="2">PROPRIETARY INFRASTRUCTURE TELEMETRY</text>
  </g>
</svg>`,
      sizeBytes: 1350,
      scale: 100,
      opacity: 18,
      rotation: 0,
      placement: 'center',
      tag: 'security',
      isDefault: false,
      description: 'Confidential infrastructure telemetry watermark',
    },
  ];

  for (const wm of watermarks) {
    await (prisma as any).watermark.upsert({
      where: { id: wm.id },
      update: wm,
      create: wm,
    });
    console.log(`✅ Seeded watermark: [${wm.id}] ${wm.name}`);
  }

  // 3. Seed Canonical Core Standards for Sections & Graphs Library
  const { coreSectionsData } = await import('./seedSectionsData');
  for (const sec of coreSectionsData) {
    await (prisma as any).templateSection.upsert({
      where: { id: sec.id },
      update: {
        name: sec.name,
        titleHtml: sec.titleHtml,
        eyebrow: sec.eyebrow,
        eyebrowHtml: sec.eyebrowHtml,
        description: sec.description,
        type: sec.type,
        icon: sec.icon,
        orderIndex: sec.orderIndex,
        watermarkId: sec.watermarkId,
        projectSite: sec.projectSite,
        reportingPeriod: sec.reportingPeriod,
        metricCards: sec.metricCards as any,
        charts: sec.charts as any,
        keyInsights: sec.keyInsights as any,
        canvasRows: (sec as any).canvasRows as any,
      },
      create: {
        id: sec.id,
        name: sec.name,
        titleHtml: sec.titleHtml,
        eyebrow: sec.eyebrow,
        eyebrowHtml: sec.eyebrowHtml,
        description: sec.description,
        type: sec.type,
        icon: sec.icon,
        orderIndex: sec.orderIndex,
        watermarkId: sec.watermarkId,
        projectSite: sec.projectSite,
        reportingPeriod: sec.reportingPeriod,
        metricCards: sec.metricCards as any,
        charts: sec.charts as any,
        keyInsights: sec.keyInsights as any,
        canvasRows: (sec as any).canvasRows as any,
      },
    });
    console.log(`✅ Seeded Core Standard Section: [${sec.id}] ${sec.name}`);
  }

  const count = await prisma.reportTemplate.count();
  const wmCount = await (prisma as any).watermark.count();
  const secCount = await (prisma as any).templateSection.count();
  console.log(`\n🎉 Seed finished! Total blueprints: ${count}, Total watermarks: ${wmCount}, Total sections: ${secCount} in database ayantrai_templates`);
}


seed()
  .catch(async (e) => {
    console.error('❌ Seeding failed:', e);
    await prisma.$disconnect();
    throw e;
  })
  .then(async () => {
    await prisma.$disconnect();
  });
