"use client";

import React, { useState } from "react";
import {
  Settings,
  ShieldCheck,
  Mail,
  FileCheck,
  Save,
  Sparkles,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { updateSystemSettings } from "@/lib/redux/slices/reportModuleSlice";

export default function SystemSettingsPage() {
  const dispatch = useAppDispatch();
  const { systemSettings } = useAppSelector((state) => state.reportModule);

  const [requireApproval, setRequireApproval] = useState(systemSettings.require_superadmin_approval);
  const [autoGen, setAutoGen] = useState(systemSettings.auto_generation_enabled);
  const [senderEmail, setSenderEmail] = useState(systemSettings.notification_sender_email);
  const [exportFormat, setExportFormat] = useState(systemSettings.default_export_format);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(
      updateSystemSettings({
        require_superadmin_approval: requireApproval,
        auto_generation_enabled: autoGen,
        notification_sender_email: senderEmail,
        default_export_format: exportFormat,
      })
    );
    showToast("System-wide Superadmin configuration saved successfully!");
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white border border-[#9D61FF]/60 shadow-[0_0_24px_rgba(157,97,255,0.3)] text-xs font-medium animate-slideUp">
          <Sparkles className="w-4 h-4 text-[#9D61FF]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#9D61FF] px-2 py-0.5 rounded-full border border-purple-500/30 bg-purple-500/10 font-bold">
              SUPERADMIN GOVERNANCE
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">Spec Section 1 & 5</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            System Configuration & Dispatch Policies
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
            System-wide settings governing the approval workflow, notification sender identities, and default export standards.
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white font-bold text-xs transition-all shadow-[0_0_20px_rgba(157,97,255,0.35)] cursor-pointer"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-5 max-w-4xl">
        {/* Section 1: Template Governance & Approval Trigger */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
            <div className="p-2 rounded-xl bg-purple-500/10 text-[#9D61FF]">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Workflow & Approval Gates</h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Control approval requirement and auto-generation triggers</p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Toggle 1: Approval Requirement */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/40">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Mandatory Superadmin Template Approval</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-[#9D61FF] border border-purple-500/30">
                    Spec 1.1
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  When enabled, all templates designed by Site Admins enter &quot;Pending Approval&quot; status and require Superadmin review before deployment.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setRequireApproval(!requireApproval)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  requireApproval ? "bg-[#9D61FF]" : "bg-slate-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    requireApproval ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Auto-Generation on Approval */}
            <div className="flex items-start justify-between gap-4 p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-slate-50 dark:bg-zinc-900/40">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>Auto-Generate Report on Approval</span>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    Spec 2.4
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-1">
                  Confirmed in open questions: Immediately creates a full report snapshot upon Superadmin approval and alerts the Site Admin.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setAutoGen(!autoGen)}
                className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  autoGen ? "bg-[#9D61FF]" : "bg-slate-300 dark:bg-zinc-700"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                    autoGen ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Section 2: Notification & Email Identity */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
            <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Notification Sender Configuration</h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">System email identity used for interactive links & feedback alerts</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
              Automated Dispatch Sender Email Address *
            </label>
            <div className="mt-1.5 relative">
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="email"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
                placeholder="reports-noreply@ayantrai.com"
                required
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-[#9D61FF]"
              />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 mt-1">
              Project Heads will receive review emails dispatched from this authenticated TLS relay address.
            </p>
          </div>
        </div>

        {/* Section 3: Export Formats & Compliance */}
        <div className="p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] space-y-4 shadow-sm">
          <div className="flex items-center gap-2.5 pb-3 border-b border-slate-100 dark:border-zinc-800/80">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Default Export & Compliance Standard</h2>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400">Standardized output format for official safety reports</p>
            </div>
          </div>

          <div className="space-y-2.5">
            {[
              {
                id: "PDF/A (ISO 45001)",
                title: "PDF/A Archival Format (ISO 45001 Sealed)",
                desc: "Official immutable audit document with cryptographic SHA-256 telemetry seal.",
              },
              {
                id: "CSV Telemetry Stream",
                title: "Raw Sensor CSV Stream & Check-in Frames",
                desc: "High-density raw BLE beacon data for external engineering analytics pipelines.",
              },
              {
                id: "Executive Summary Bundle",
                title: "Executive Summary Bundle (PDF + Key Action Matrix)",
                desc: "Condensed 2-page briefing document prepared for Board of Directors review.",
              },
            ].map((fmt) => (
              <label
                key={fmt.id}
                className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  exportFormat === fmt.id
                    ? "border-[#9D61FF]/60 bg-purple-500/5 dark:bg-[#0f131c]"
                    : "border-slate-200 dark:border-zinc-800/70 hover:bg-slate-50 dark:hover:bg-zinc-900/50"
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value={fmt.id}
                  checked={exportFormat === fmt.id}
                  onChange={() => setExportFormat(fmt.id as any)}
                  className="mt-0.5 text-[#9D61FF] focus:ring-[#9D61FF]"
                />
                <div>
                  <div className="text-xs font-semibold text-slate-900 dark:text-white">{fmt.title}</div>
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">{fmt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-xl bg-[#9D61FF] hover:bg-[#8B4CF0] text-white font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(157,97,255,0.35)] transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Save System Configuration</span>
          </button>
        </div>
      </form>
    </div>
  );
}
