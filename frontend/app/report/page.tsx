"use client";

import React, { useState } from "react";
import {
  FileText,
  Download,
  Printer,
  Search,
  Filter,
  Calendar,
  Building,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  HardHat,
  Cpu,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronDown,
  Eye,
  X,
  Share2,
} from "lucide-react";
import { Tooltip, CustomDropdown } from "../Component";

interface ReportItem {
  id: string;
  title: string;
  category: "ISO 45001" | "PPE Telemetry" | "Attendance" | "Incidents";
  site: string;
  timestamp: string;
  status: "Verified" | "Audit-Ready" | "Certified";
  workersCount: number;
  complianceRate: string;
  fileSize: string;
  author: string;
  sha256: string;
}

const mockReports: ReportItem[] = [
  {
    id: "REP-45001-0921",
    title: "ISO 45001 Daily Continuous EHS Compliance Audit",
    category: "ISO 45001",
    site: "Nx-One Tower Pilot Site (Greater Noida)",
    timestamp: "Today • 08:30 AM IST",
    status: "Certified",
    workersCount: 142,
    complianceRate: "99.4%",
    fileSize: "2.4 MB",
    author: "AyantrAI Telemetry Engine",
    sha256: "8f4a9b2c1d3e5f67a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1",
  },
  {
    id: "REP-PPE-0921",
    title: "3-Point Connected Sensor Telemetry & Zone Compliance Log",
    category: "PPE Telemetry",
    site: "Nx-One Tower Pilot Site (Greater Noida)",
    timestamp: "Today • 12:45 PM IST",
    status: "Verified",
    workersCount: 142,
    complianceRate: "100%",
    fileSize: "1.8 MB",
    author: "Gateway Node AY-9024",
    sha256: "3d2e1f0a9b8c7d6e5f4a3b2c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e",
  },
  {
    id: "REP-ATT-0921",
    title: "Digital Shift Muster Roll & Automated Geofence Attendance",
    category: "Attendance",
    site: "Nx-One Tower Pilot Site (Greater Noida)",
    timestamp: "Today • 06:15 AM IST",
    status: "Verified",
    workersCount: 142,
    complianceRate: "100%",
    fileSize: "980 KB",
    author: "BLE Mesh Hub Supervisor",
    sha256: "a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2",
  },
  {
    id: "REP-INC-0920",
    title: "Zero-Harm Incident & Near-Miss Prevention Log (Week 38)",
    category: "Incidents",
    site: "Metro Line 4 Underground Tunnel (Mumbai)",
    timestamp: "Yesterday • 05:00 PM IST",
    status: "Audit-Ready",
    workersCount: 88,
    complianceRate: "100%",
    fileSize: "3.1 MB",
    author: "Dr. Vikram Seth (EHS Director)",
    sha256: "f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0",
  },
  {
    id: "REP-45001-0919",
    title: "Weekly Statutory HSE & Labour Safety Regulatory Submission",
    category: "ISO 45001",
    site: "High-Speed Rail Viaduct C-2 (Ahmedabad)",
    timestamp: "19 Sep 2026 • 04:30 PM IST",
    status: "Certified",
    workersCount: 215,
    complianceRate: "98.9%",
    fileSize: "4.6 MB",
    author: "Statutory Auditor Board",
    sha256: "7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b",
  },
  {
    id: "REP-PPE-0918",
    title: "Grounding Footwear & Vest Hub BLE Signal Quality Audit",
    category: "PPE Telemetry",
    site: "Steel Plant Blast Furnace Revamp (Jamshedpur)",
    timestamp: "18 Sep 2026 • 02:15 PM IST",
    status: "Verified",
    workersCount: 64,
    complianceRate: "99.1%",
    fileSize: "1.5 MB",
    author: "IoT Telemetry Uplink",
    sha256: "b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d7c6b5a4f3e2d1c0b9a8",
  },
];

export default function ReportsPage() {
  const [selectedSite, setSelectedSite] = useState("All Active Pilot Sites");
  const [selectedCategory, setSelectedCategory] = useState("All Categories");
  const [selectedRange, setSelectedRange] = useState("Current Month (Sep 2026)");
  const [searchQuery, setSearchQuery] = useState("");
  const [activePreview, setActivePreview] = useState<ReportItem | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Filter reports
  const filteredReports = mockReports.filter((report) => {
    const matchesSite =
      selectedSite === "All Active Pilot Sites" || report.site === selectedSite;
    const matchesCategory =
      selectedCategory === "All Categories" || report.category === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      report.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      report.site.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSite && matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/50 bg-[#0c1410]/95 px-4 py-3 text-xs text-emerald-300 shadow-[0_0_25px_rgba(16,185,129,0.3)] flex items-center gap-2.5 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* ================= HERO REPORT HEADER BANNER ================= */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-gradient-to-r from-white via-slate-50 to-white dark:from-[#0d121c] dark:via-[#0f1422] dark:to-[#0d121c] p-4 sm:p-5 backdrop-blur-xl relative overflow-hidden neon-glow-card flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm dark:shadow-none transition-colors">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md border border-purple-500/40 bg-purple-50 dark:bg-[#9D61FF]/10 text-purple-700 dark:text-[#9D61FF] text-[10px] sm:text-[11px] font-mono tracking-wide uppercase">
            <Sparkles className="w-3 h-3 text-[#9D61FF]" />
            Regulatory Compliance Audit Center
          </div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Safety & Compliance Reports</span>
            <span className="h-2 w-2 rounded-full bg-[#9D61FF] beacon-active" />
          </h1>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
            Auto-generated ISO 45001 digital compliance logs, continuous 3-point PPE telemetry data, and muster roll audits stamped with cryptographic signatures.
          </p>
        </div>

        {/* Global Export Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <Tooltip content="Download complete monthly audit package as ZIP" position="bottom" variant="amber">
            <button
              onClick={() => showToast("Monthly audit bundle (.ZIP) queued for secure download.")}
              className="px-3.5 py-2 rounded-xl text-xs font-bold glow-btn-primary flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Audit Package</span>
            </button>
          </Tooltip>
          <Tooltip content="Print ISO 45001 Daily Summary Sheet" position="bottom">
            <button
              onClick={() => {
                if (typeof window !== "undefined") window.print();
              }}
              className="px-3 py-2 rounded-xl text-xs font-medium border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#0d1017] hover:border-slate-400 dark:hover:border-zinc-700 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-all flex items-center gap-1.5 cursor-pointer shadow-sm dark:shadow-none"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500 dark:text-zinc-400" />
              <span className="hidden sm:inline">Print Log</span>
            </button>
          </Tooltip>
        </div>
      </div>

      {/* ================= 4 METRICS STRIP ================= */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border border-[#9D61FF]/30 bg-white/90 dark:bg-[#0e131d]/90 p-3.5 sm:p-4 backdrop-blur-xl relative overflow-hidden neon-glow-card shadow-sm dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">ISO 45001 Audit Trail</div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-purple-600 dark:text-[#9D61FF] mt-1 drop-shadow-[0_0_12px_rgba(157,97,255,0.35)]">
            100%
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> Zero Non-Conformities
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/80 bg-white/90 dark:bg-[#0e131d]/90 p-3.5 sm:p-4 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Audit Stamped Kits</div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-slate-900 dark:text-white mt-1">
            1,480+
          </div>
          <div className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono mt-1">6 Active Deployments</div>
        </div>

        <div className="rounded-2xl border border-emerald-500/30 bg-white/90 dark:bg-[#0c1514]/90 p-3.5 sm:p-4 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Open Hazard Escalations</div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-emerald-600 dark:text-emerald-400 mt-1 drop-shadow-[0_0_12px_rgba(16,185,129,0.35)]">
            0
          </div>
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Real-Time Auto Triage
          </div>
        </div>

        <div className="rounded-2xl border border-sky-500/30 bg-white/90 dark:bg-[#0d161d]/90 p-3.5 sm:p-4 backdrop-blur-xl shadow-sm dark:shadow-none">
          <div className="text-xs text-slate-500 dark:text-zinc-400 font-mono">Generated Reports (Sep)</div>
          <div className="text-2xl sm:text-3xl font-extrabold font-mono text-sky-600 dark:text-sky-400 mt-1 drop-shadow-[0_0_12px_rgba(6,182,212,0.35)]">
            48
          </div>
          <div className="text-[10px] text-sky-600 dark:text-sky-400 font-mono mt-1">100% Cryptographic Hash</div>
        </div>
      </div>

      {/* ================= FILTER & SEARCH BAR ================= */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white/90 dark:bg-[#0d111a]/95 p-3.5 sm:p-4 backdrop-blur-xl space-y-3 shadow-sm dark:shadow-none">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 text-xs font-mono uppercase text-slate-500 dark:text-zinc-400 font-semibold">
            <Filter className="w-3.5 h-3.5 text-purple-600 dark:text-[#9D61FF]" />
            <span>Report Query Filters</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
            Showing {filteredReports.length} of {mockReports.length} generated documents
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          {/* Site Selector */}
          <CustomDropdown
            label="Industrial Site Location"
            options={[
              "All Active Pilot Sites",
              "Nx-One Tower Pilot Site (Greater Noida)",
              "Metro Line 4 Underground Tunnel (Mumbai)",
              "High-Speed Rail Viaduct C-2 (Ahmedabad)",
              "Steel Plant Blast Furnace Revamp (Jamshedpur)",
            ]}
            value={selectedSite}
            onChange={setSelectedSite}
            icon={Building}
            size="sm"
          />

          {/* Category Filter */}
          <CustomDropdown
            label="Audit Category"
            options={[
              "All Categories",
              "ISO 45001",
              "PPE Telemetry",
              "Attendance",
              "Incidents",
            ]}
            value={selectedCategory}
            onChange={(val) => setSelectedCategory(val as any)}
            icon={Layers}
            size="sm"
          />

          {/* Date Range Filter */}
          <CustomDropdown
            label="Reporting Period"
            options={[
              "Current Month (Sep 2026)",
              "Today (21 Sep 2026)",
              "Last 7 Days (Week 38)",
              "Previous Month (Aug 2026)",
              "Cohort Pilot Launch (Q1 2027)",
            ]}
            value={selectedRange}
            onChange={setSelectedRange}
            icon={Calendar}
            size="sm"
          />

          {/* Search Input */}
          <div className="space-y-1">
            <label className="block text-[10px] font-medium text-slate-700 dark:text-zinc-300">
              Search by ID or Keyword
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 dark:text-zinc-500">
                <Search className="h-3.5 w-3.5" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="e.g. REP-45001 or Tunnel"
                className="w-full rounded-xl border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#080b10] pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-zinc-500 focus-glow-amber transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ================= REPORTS TABLE ================= */}
      <div className="rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white/90 dark:bg-[#0b0e15]/95 overflow-hidden shadow-sm dark:shadow-2xl">
        <div className="p-4 border-b border-slate-200 dark:border-zinc-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600 dark:text-[#9D61FF]" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
              Audit & Compliance Register
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400">
            Real-Time Cryptographic Stamping Active
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-[#080b10] border-b border-slate-200 dark:border-zinc-800/80 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="py-3 px-4">Report Identifier</th>
                <th className="py-3 px-4">Subject & Scope</th>
                <th className="py-3 px-4">Site Location</th>
                <th className="py-3 px-4">Compliance</th>
                <th className="py-3 px-4">Generated Timestamp</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-zinc-800/60 font-medium">
              {filteredReports.length === 0 ? (
                 <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 dark:text-zinc-500">
                    No reports match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredReports.map((report) => (
                  <tr
                    key={report.id}
                    className="hover:bg-slate-50 dark:hover:bg-zinc-800/30 transition-colors group"
                  >
                    {/* Report ID */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-2">
                        <FileCheck2 className="w-3.5 h-3.5 text-purple-600 dark:text-[#9D61FF] flex-shrink-0" />
                        <span className="font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-[#9D61FF] transition-colors">
                          {report.id}
                        </span>
                      </div>
                      <span className="text-[9px] text-slate-400 dark:text-zinc-500 block mt-0.5">
                        {report.fileSize}
                      </span>
                    </td>

                    {/* Title & Category */}
                    <td className="py-3.5 px-4 max-w-sm">
                      <div className="font-semibold text-slate-900 dark:text-zinc-100 truncate">
                        {report.title}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-mono px-1.5 py-0.2 rounded border uppercase font-semibold bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border-slate-200 dark:border-zinc-700">
                          {report.category}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                          {report.workersCount} Workers Audited
                        </span>
                      </div>
                    </td>

                    {/* Site Location */}
                    <td className="py-3.5 px-4 text-slate-700 dark:text-zinc-300">
                      <span className="truncate block max-w-xs">{report.site}</span>
                    </td>

                    {/* Compliance */}
                    <td className="py-3.5 px-4 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                          {report.complianceRate}
                        </span>
                        <span className="text-[9px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-400/40 dark:border-emerald-500/40 px-1.5 py-0.2 rounded">
                          {report.status}
                        </span>
                      </div>
                    </td>

                    {/* Timestamp */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
                      {report.timestamp}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Tooltip content="Preview Audit Document" position="top">
                          <button
                            onClick={() => setActivePreview(report)}
                            className="p-1.5 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#090d14] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-[#9D61FF]/60 transition-all cursor-pointer shadow-sm dark:shadow-none"
                          >
                            <Eye className="w-3.5 h-3.5 text-purple-600 dark:text-[#9D61FF]" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Download Verified PDF" position="top">
                          <button
                            onClick={() => showToast(`Downloading PDF: ${report.id}.pdf`)}
                            className="p-1.5 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#090d14] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-emerald-500/60 transition-all cursor-pointer shadow-sm dark:shadow-none"
                          >
                            <Download className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          </button>
                        </Tooltip>

                        <Tooltip content="Export CSV Telemetry Dataset" position="top">
                          <button
                            onClick={() => showToast(`Exporting Raw Telemetry: ${report.id}.csv`)}
                            className="p-1.5 rounded-lg border border-slate-300 dark:border-zinc-800 bg-white dark:bg-[#090d14] text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-sky-500/60 transition-all cursor-pointer shadow-sm dark:shadow-none"
                          >
                            <FileSpreadsheet className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                          </button>
                        </Tooltip>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= REPORT PREVIEW MODAL ================= */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/70 dark:bg-black/85 backdrop-blur-md"
            onClick={() => setActivePreview(null)}
          />

          {/* Modal Panel */}
          <div className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-[#9D61FF]/40 bg-white dark:bg-[#0e121a] p-6 text-slate-900 dark:text-slate-100 shadow-2xl animate-fadeIn">
            {/* Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-200 dark:border-zinc-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-bold bg-purple-50 dark:bg-[#9D61FF]/15 text-purple-700 dark:text-[#9D61FF] border-purple-300 dark:border-[#9D61FF]/40">
                    Official ISO 45001 Certificate
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-zinc-400">
                    ID: {activePreview.id}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {activePreview.title}
                </h3>
                <p className="text-xs text-slate-600 dark:text-zinc-400">
                  {activePreview.site} • {activePreview.timestamp}
                </p>
              </div>

              <button
                onClick={() => setActivePreview(null)}
                className="p-1.5 rounded-lg border border-slate-300 dark:border-zinc-800 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Document Body */}
            <div className="py-5 space-y-4 text-xs leading-relaxed">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#090c12] font-mono">
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500">Compliance Status</div>
                  <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    {activePreview.complianceRate} COMPLIANT
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500">Active IoT Nodes</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {activePreview.workersCount * 3} Sensors
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500">Audited Crews</div>
                  <div className="text-sm font-bold text-slate-900 dark:text-white">
                    {activePreview.workersCount} Personnel
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-500">Certified By</div>
                  <div className="text-[11px] font-bold text-purple-700 dark:text-[#9D61FF] truncate">
                    {activePreview.author}
                  </div>
                </div>
              </div>

              {/* Sensor Telemetry Breakdown */}
              <div className="rounded-xl border border-slate-200 dark:border-zinc-800/90 bg-slate-50/70 dark:bg-[#0b0f16] p-4 space-y-2.5">
                <div className="font-mono text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300">
                  Continuous Sensor Telemetry Summary:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-[11px]">
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-center justify-between">
                    <span>Helmet (BLE Mesh):</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Worn</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-center justify-between">
                    <span>Vest Hub (4G IoT):</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">99.8% Online</span>
                  </div>
                  <div className="p-2.5 rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/50 flex items-center justify-between">
                    <span>Safety Boot:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">100% Grounded</span>
                  </div>
                </div>
              </div>

              {/* Cryptographic Proof Hash */}
              <div className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-100 dark:bg-[#080b10] font-mono text-[10px]">
                <div className="text-slate-500 dark:text-zinc-500 mb-1 flex items-center justify-between">
                  <span>Cryptographic Verification Hash (SHA-256):</span>
                  <span className="text-emerald-600 dark:text-emerald-400">Timestamp Immutable</span>
                </div>
                <div className="text-purple-700 dark:text-[#9D61FF] break-all select-all font-mono">
                  {activePreview.sha256}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-2 flex-wrap">
              <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-500">
                Authorized for statutory submission to state labour inspectorates.
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    showToast(`Downloading certified PDF for ${activePreview.id}`);
                    setActivePreview(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-[#9D61FF] hover:bg-[#8B4CF0] text-white shadow-[0_0_16px_rgba(157,97,255,0.35)] flex items-center gap-1.5 cursor-pointer transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Signed PDF</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
