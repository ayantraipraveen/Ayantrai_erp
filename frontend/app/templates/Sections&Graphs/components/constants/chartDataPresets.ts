import { GraphType, ChartDataPoint } from "@/lib/redux/slices/reportModuleSlice";

export interface ChartPresetDefinition {
  name: string;
  unit: string;
  yMin: number;
  yMax: number;
  xAxisTitle?: string;
  yAxisTitle?: string;
  points: ChartDataPoint[];
}

export type ChartEditorMode =
  | "heatmap"
  | "table"
  | "scatter"
  | "bubble"
  | "gauge"
  | "kpi-card"
  | "multi-series"
  | "stacked-horizontal"
  | "funnel"
  | "radar"
  | "timeline"
  | "geo-map"
  | "treemap"
  | "donut"
  | "two-segment"
  | "waterfall"
  | "sparkline"
  | "standard";

export function getChartEditorMode(chartType: GraphType): ChartEditorMode {
  switch (chartType) {
    case "heatmap":
      return "heatmap";
    case "table":
      return "table";
    case "scatter":
      return "scatter";
    case "bubble":
      return "bubble";
    case "gauge":
      return "gauge";
    case "kpi-card":
      return "kpi-card";
    case "multi-line":
    case "grouped-bar":
    case "combo":
    case "stacked-bar":
      return "multi-series";
    case "stacked-horizontal":
      return "stacked-horizontal";
    case "funnel":
      return "funnel";
    case "radar":
      return "radar";
    case "timeline":
      return "timeline";
    case "geo-map":
      return "geo-map";
    case "treemap":
      return "treemap";
    case "donut":
    case "pie":
      return "donut";
    case "two-segment":
      return "two-segment";
    case "waterfall":
      return "waterfall";
    case "sparkline":
      return "sparkline";
    case "bar":
    case "horizontal-bar":
    case "line":
    case "area":
    default:
      return "standard";
  }
}

/**
 * Returns tailored presets specifically designed for each chart type.
 */
export function getChartTypePresets(chartType: GraphType, primaryColor = "#9D61FF"): ChartPresetDefinition[] {
  switch (chartType) {
    case "heatmap":
      return [
        {
          name: "Shift Safety Matrix",
          unit: "%",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "r1", label: "Week 1", value: 96, rowValues: [96, 96, 96, 96, 96, 82, 82] },
            { id: "r2", label: "Week 2", value: 94, rowValues: [94, 94, 94, 94, 94, 78, 78] },
            { id: "r3", label: "Week 3", value: 96, rowValues: [96, 95, 95, 95, 95, 85, 85] },
            { id: "r4", label: "Week 4", value: 98, rowValues: [98, 98, 98, 98, 98, 72, 72] },
            { id: "r5", label: "Week 5", value: 92, rowValues: [92, 93, 91, 94, 95, 80, 80] },
            { id: "r6", label: "Week 6", value: 90, rowValues: [90, 92, 94, 91, 93, 75, 76] },
          ],
        },
        {
          name: "Zone Incident Density",
          unit: "pts",
          yMin: 0,
          yMax: 50,
          points: [
            { id: "r1", label: "Zone A (Welding)", value: 42, rowValues: [42, 38, 45, 41, 39, 20, 18] },
            { id: "r2", label: "Zone B (Assembly)", value: 25, rowValues: [25, 28, 26, 24, 25, 12, 10] },
            { id: "r3", label: "Zone C (Warehouse)", value: 18, rowValues: [18, 15, 19, 17, 16, 8, 9] },
            { id: "r4", label: "Zone D (Chemical)", value: 48, rowValues: [48, 46, 49, 47, 45, 22, 21] },
          ],
        },
      ];

    case "table":
      return [
        {
          name: "Supervisor Safety Log",
          unit: "",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "t1", label: "Row 1", value: 1, rowValues: ["Sunil M. (Crew #1)", "Zone 1", "18s", "Optimal", "98.2%", "42"] },
            { id: "t2", label: "Row 2", value: 2, rowValues: ["Pooja K. (Structural)", "Tower L12", "24s", "Compliant", "95.0%", "38"] },
            { id: "t3", label: "Row 3", value: 3, rowValues: ["Anand R. (Subcontract)", "Batching", "42s", "Review", "88.4%", "27"] },
            { id: "t4", label: "Row 4", value: 4, rowValues: ["Rajesh V. (Electrical)", "Substation", "15s", "Optimal", "99.1%", "19"] },
          ],
        },
      ];

    case "scatter":
    case "bubble":
      return [
        {
          name: "Vibration vs Temperature",
          unit: "psi",
          yMin: 0,
          yMax: 100,
          xAxisTitle: "Temperature (°C)",
          yAxisTitle: "Vibration (mm/s)",
          points: [
            { id: "p1", label: "Pump A-1", x: 25, y: 35, size: 14, value: 35 },
            { id: "p2", label: "Turbine T-2", x: 45, y: 78, size: 24, value: 78 },
            { id: "p3", label: "Compressor C-1", x: 60, y: 52, size: 18, value: 52 },
            { id: "p4", label: "Generator G-4", x: 80, y: 88, size: 28, value: 88 },
            { id: "p5", label: "Motor M-5", x: 92, y: 40, size: 12, value: 40 },
          ],
        },
        {
          name: "Workforce Density vs Incidents",
          unit: "cases",
          yMin: 0,
          yMax: 10,
          xAxisTitle: "Active Crew Count",
          yAxisTitle: "Reported Anomalies",
          points: [
            { id: "p1", label: "Shift Morning", x: 120, y: 2, size: 15, value: 2 },
            { id: "p2", label: "Shift Afternoon", x: 150, y: 5, size: 25, value: 5 },
            { id: "p3", label: "Shift Night", x: 80, y: 7, size: 30, value: 7 },
            { id: "p4", label: "Weekend Crew", x: 45, y: 1, size: 10, value: 1 },
          ],
        },
      ];

    case "gauge":
      return [
        {
          name: "Gas Level (ppm)",
          unit: "ppm",
          yMin: 0,
          yMax: 50,
          points: [{ id: "g1", label: "H2S Concentration", value: 18, target: 25 }],
        },
        {
          name: "Safety Compliance (%)",
          unit: "%",
          yMin: 0,
          yMax: 100,
          points: [{ id: "g1", label: "Overall Safety Index", value: 88, target: 95 }],
        },
        {
          name: "Hydraulic Pressure",
          unit: "bar",
          yMin: 0,
          yMax: 200,
          points: [{ id: "g1", label: "Main Line Pressure", value: 142, target: 160 }],
        },
      ];

    case "kpi-card":
      return [
        {
          name: "Executive Safety Overview",
          unit: "",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "k1", label: "Total Incidents", value: 0, status: "0", trend: "-100%", trendDirection: "down", color: "#10B981" },
            { id: "k2", label: "PPE Compliance", value: 97.4, status: "97.4%", trend: "+2.1%", trendDirection: "up", color: primaryColor },
            { id: "k3", label: "Safe Man-Hours", value: 18750, status: "18,750", trend: "+5.3%", trendDirection: "up", color: "#3B82F6" },
            { id: "k4", label: "Near-Miss Reports", value: 12, status: "12", trend: "-33%", trendDirection: "down", color: "#F59E0B" },
          ],
        },
      ];

    case "multi-line":
    case "grouped-bar":
    case "combo":
    case "stacked-bar":
      return [
        {
          name: "Zone A vs Zone B Telemetry",
          unit: "%",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "p1", label: "08:00", value: 85, secondaryValue: 78, tertiaryValue: 65, quaternaryValue: 50 },
            { id: "p2", label: "12:00", value: 94, secondaryValue: 88, tertiaryValue: 75, quaternaryValue: 60 },
            { id: "p3", label: "16:00", value: 96, secondaryValue: 91, tertiaryValue: 82, quaternaryValue: 70 },
            { id: "p4", label: "20:00", value: 92, secondaryValue: 84, tertiaryValue: 78, quaternaryValue: 65 },
            { id: "p5", label: "24:00", value: 88, secondaryValue: 80, tertiaryValue: 70, quaternaryValue: 55 },
          ],
        },
        {
          name: "Department Comparison",
          unit: "%",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "p1", label: "Civil", value: 92, secondaryValue: 85, tertiaryValue: 70, quaternaryValue: 60 },
            { id: "p2", label: "Mechanical", value: 88, secondaryValue: 90, tertiaryValue: 75, quaternaryValue: 65 },
            { id: "p3", label: "Electrical", value: 95, secondaryValue: 92, tertiaryValue: 80, quaternaryValue: 70 },
            { id: "p4", label: "Safety", value: 98, secondaryValue: 95, tertiaryValue: 85, quaternaryValue: 80 },
          ],
        },
      ];

    case "stacked-horizontal":
      return [
        {
          name: "Operational Hours Breakdown",
          unit: "hrs",
          yMin: 0,
          yMax: 20000,
          points: [
            { id: "p1", label: "Hours without Violations", value: 17330, status: "Safe", color: "#10B981" },
            { id: "p2", label: "Hours with Violations", value: 1420, status: "Violations", color: "#F43F5E" },
          ],
        },
      ];

    case "funnel":
      return [
        {
          name: "Safety Induction Funnel",
          unit: "workers",
          yMin: 0,
          yMax: 1500,
          points: [
            { id: "f1", label: "Total Gate Entries", value: 1200 },
            { id: "f2", label: "Passed Safety Briefing", value: 850 },
            { id: "f3", label: "PPE Inspection Cleared", value: 420 },
            { id: "f4", label: "Zero Violations Logged", value: 180 },
          ],
        },
      ];

    case "radar":
      return [
        {
          name: "5-Axis Safety Audit",
          unit: "pts",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "r1", label: "PPE Compliance", value: 94, secondaryValue: 90 },
            { id: "r2", label: "Emergency Response", value: 85, secondaryValue: 80 },
            { id: "r3", label: "Hazard Reporting", value: 78, secondaryValue: 75 },
            { id: "r4", label: "Equipment Checks", value: 92, secondaryValue: 88 },
            { id: "r5", label: "Housekeeping", value: 86, secondaryValue: 85 },
          ],
        },
      ];

    case "timeline":
      return [
        {
          name: "Safety Audit Timeline",
          unit: "days",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "t1", label: "Foundation Check", value: 10, secondaryValue: 35, status: "Completed", color: "#10B981" },
            { id: "t2", label: "Structural Framing", value: 40, secondaryValue: 30, status: "In Progress", color: primaryColor },
            { id: "t3", label: "Electrical Sign-Off", value: 65, secondaryValue: 30, status: "Pending", color: "#F59E0B" },
          ],
        },
      ];

    case "geo-map":
      return [
        {
          name: "Site Incident Map",
          unit: "pts",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "m1", label: "North Plant (Gate 1)", x: 30, y: 45, value: 95, status: "Optimal", color: "#10B981" },
            { id: "m2", label: "Tower Crane L12", x: 62, y: 35, value: 78, status: "Warning", color: "#F59E0B" },
            { id: "m3", label: "Substation B", x: 45, y: 75, value: 99, status: "Optimal", color: "#10B981" },
            { id: "m4", label: "Excavation Pit", x: 80, y: 62, value: 65, status: "Critical", color: "#F43F5E" },
          ],
        },
      ];

    case "treemap":
      return [
        {
          name: "Hazard Distribution",
          unit: "%",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "tm1", label: "Civil Works", value: 45, color: primaryColor },
            { id: "tm2", label: "Mechanical", value: 25, color: "#10B981" },
            { id: "tm3", label: "Electrical", value: 18, color: "#F59E0B" },
            { id: "tm4", label: "Chemical", value: 12, color: "#F43F5E" },
          ],
        },
      ];

    case "donut":
    case "pie":
      return [
        {
          name: "Smart PPE Inventory",
          unit: "%",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "d1", label: "Smart Helmets", value: 55, color: primaryColor },
            { id: "d2", label: "Vest Hubs", value: 30, color: "#10B981" },
            { id: "d3", label: "Grounding Boots", value: 15, color: "#F59E0B" },
          ],
        },
      ];

    case "two-segment":
      return [
        {
          name: "Core Safety Indicators",
          unit: "%",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "s1", label: "Compliant Workers", value: 85, secondaryValue: 100, color: "#10B981" },
            { id: "s2", label: "PPE Readiness Score", value: 73, secondaryValue: 100, color: primaryColor },
            { id: "s3", label: "Incident-Free Days", value: 92, secondaryValue: 100, color: "#3B82F6" },
          ],
        },
      ];

    case "waterfall":
      return [
        {
          name: "Safety Index Bridge",
          unit: "pts",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "w1", label: "Base Score", value: 65, status: "start", color: "#64748B" },
            { id: "w2", label: "Audits (+)", value: 20, status: "add", color: "#10B981" },
            { id: "w3", label: "Violations (-)", value: -15, status: "sub", color: "#F43F5E" },
            { id: "w4", label: "Training (+)", value: 10, status: "add", color: "#10B981" },
            { id: "w5", label: "Net Safety", value: 80, status: "total", color: primaryColor },
          ],
        },
      ];

    case "sparkline":
      return [
        {
          name: "Multi-Zone Vibration Sparks",
          unit: "pts",
          yMin: 0,
          yMax: 50,
          points: [
            { id: "sp1", label: "Zone A (Welding)", value: 25, rowValues: [25, 10, 20, 5, 15, 0], color: "#10B981" },
            { id: "sp2", label: "Zone B (Assembly)", value: 20, rowValues: [20, 25, 10, 20, 5, 15], color: primaryColor },
            { id: "sp3", label: "Zone C (Warehouse)", value: 30, rowValues: [30, 15, 25, 10, 20, 5], color: "#F59E0B" },
          ],
        },
      ];

    case "bar":
    case "line":
    case "area":
    case "horizontal-bar":
    default:
      return [
        {
          name: "PPE Compliance by Zone",
          unit: "%",
          yMin: 0,
          yMax: 100,
          points: [
            { id: "p1", label: "Zone A (Welding)", value: 96, secondaryValue: 90 },
            { id: "p2", label: "Zone B (Assembly)", value: 92, secondaryValue: 88 },
            { id: "p3", label: "Zone C (Warehouse)", value: 85, secondaryValue: 80 },
            { id: "p4", label: "Zone D (Loading)", value: 98, secondaryValue: 95 },
            { id: "p5", label: "Zone E (Chemical)", value: 99, secondaryValue: 92 },
          ],
        },
        {
          name: "Hourly Telemetry Stream",
          unit: "ppm",
          yMin: 0,
          yMax: 120,
          points: [
            { id: "p1", label: "08:00", value: 45, secondaryValue: 50 },
            { id: "p2", label: "10:00", value: 78, secondaryValue: 70 },
            { id: "p3", label: "12:00", value: 95, secondaryValue: 85 },
            { id: "p4", label: "14:00", value: 110, secondaryValue: 90 },
            { id: "p5", label: "16:00", value: 88, secondaryValue: 80 },
            { id: "p6", label: "18:00", value: 62, secondaryValue: 60 },
          ],
        },
        {
          name: "Weekly Workers",
          unit: "workers",
          yMin: 0,
          yMax: 200,
          points: [
            { id: "p1", label: "Mon", value: 142, secondaryValue: 130 },
            { id: "p2", label: "Tue", value: 156, secondaryValue: 140 },
            { id: "p3", label: "Wed", value: 168, secondaryValue: 150 },
            { id: "p4", label: "Thu", value: 162, secondaryValue: 145 },
            { id: "p5", label: "Fri", value: 150, secondaryValue: 135 },
            { id: "p6", label: "Sat", value: 85, secondaryValue: 80 },
          ],
        },
      ];
  }
}

/**
 * Generates initial fallback data points for a chart type when none are saved.
 */
export function getInitialDataForChartType(chartType: GraphType, primaryColor = "#9D61FF"): ChartDataPoint[] {
  const presets = getChartTypePresets(chartType, primaryColor);
  return presets[0]?.points || [
    { id: "p1", label: "Zone A", value: 92, secondaryValue: 85 },
    { id: "p2", label: "Zone B", value: 88, secondaryValue: 80 },
    { id: "p3", label: "Zone C", value: 96, secondaryValue: 90 },
  ];
}
