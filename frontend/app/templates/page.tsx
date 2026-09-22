"use client";

import React, { useState } from "react";
import {
  Layers,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  FileCheck2,
  Sparkles,
  ArrowRight,
  Eye,
  Trash2,
  MoveUp,
  MoveDown,
  ShieldCheck,
  AlertTriangle,
  Building,
  Check,
  X,
  FileText,
  HelpCircle,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  ReportTemplate,
  TemplateBlock,
  TemplateBlockType,
  addTemplate,
  approveTemplate,
  rejectTemplate,
} from "@/lib/redux/slices/reportModuleSlice";
import { Tooltip } from "../Component";

const availableBlockTypes: {
  type: TemplateBlockType;
  title: string;
  description: string;
}[] = [
  {
    type: "key_metrics",
    title: "Key Metrics",
    description: "KPI row (attendance rate, compliance rate, risk-free hours, devices deployed)",
  },
  {
    type: "attendance_trends",
    title: "Attendance Trends",
    description: "Line chart + insight text (department-wise and vendor-wise sub-views)",
  },
  {
    type: "ppe_compliance_trends",
    title: "PPE Compliance Trends",
    description: "Bar chart + insight text (Smart Helmet, Vest IoT Hub, Safety Boot grounding)",
  },
  {
    type: "supervisory_insights",
    title: "Supervisory Insights",
    description: "Table (per-supervisor efficiency, response time, alert handling)",
  },
  {
    type: "device_utilisation",
    title: "Device Utilisation",
    description: "Progress bar (operating hours vs. permissible hours)",
  },
  {
    type: "operational_remarks",
    title: "Operational Remarks",
    description: "Text summary with field observations and shift conditions",
  },
  {
    type: "improvement_action_plan",
    title: "Improvement & Action Plan",
    description: "Table (area, focus, owner, target date, status)",
  },
];

export default function TemplatesPage() {
  const dispatch = useAppDispatch();
  const { templates, activeRole, sites } = useAppSelector((state) => state.reportModule);

  const [activeTab, setActiveTab] = useState<"all" | "pending" | "active" | "draft" | "rejected">("all");
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [builderOpen, setBuilderOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Builder Form State
  const [templateName, setTemplateName] = useState("");
  const [templateDesc, setTemplateDesc] = useState("");
  const [selectedSiteId, setSelectedSiteId] = useState("SITE-01");
  const [builderBlocks, setBuilderBlocks] = useState<TemplateBlock[]>(
    availableBlockTypes.map((b, idx) => ({
      id: `blk-custom-${idx + 1}`,
      type: b.type,
      title: b.title,
      description: b.description,
      enabled: true,
      order: idx + 1,
    }))
  );

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const filteredTemplates = templates.filter((t) => {
    if (activeTab === "all") return true;
    return t.status === activeTab;
  });

  const pendingCount = templates.filter((t) => t.status === "pending").length;

  const handleApprove = (tpl: ReportTemplate) => {
    dispatch(
      approveTemplate({
        templateId: tpl.id,
        superadminName: "Dr. Vikram Seth (Superadmin)",
      })
    );
    setReviewModalOpen(false);
    showToast(`Template "${tpl.name}" approved! Report auto-generated.`);
  };

  const handleReject = (tpl: ReportTemplate) => {
    if (!rejectionReason.trim()) {
      showToast("Please provide a reason for rejection.");
      return;
    }
    dispatch(
      rejectTemplate({
        templateId: tpl.id,
        reason: rejectionReason,
        superadminName: "Dr. Vikram Seth (Superadmin)",
      })
    );
    setReviewModalOpen(false);
    setShowRejectInput(false);
    setRejectionReason("");
    showToast(`Template "${tpl.name}" returned for revision.`);
  };

  const handleCreateTemplate = (status: "pending" | "draft") => {
    if (!templateName.trim()) {
      showToast("Please provide a template title.");
      return;
    }
    const site = sites.find((s) => s.id === selectedSiteId) || sites[0];
    const enabledBlocks = builderBlocks.filter((b) => b.enabled);
    if (enabledBlocks.length === 0) {
      showToast("Please enable at least one section block.");
      return;
    }

    dispatch(
      addTemplate({
        name: templateName,
        description: templateDesc || "Custom block-based workforce safety template.",
        site_id: site.id,
        site_name: site.name,
        blocks: enabledBlocks,
        status: status,
        created_by: activeRole === "superadmin" ? "Dr. Vikram Seth (Superadmin)" : "Vikram Seth (Site Admin)",
      })
    );

    setBuilderOpen(false);
    setTemplateName("");
    setTemplateDesc("");
    showToast(
      status === "pending"
        ? "Template submitted for Superadmin approval!"
        : "Template saved to drafts."
    );
  };

  const toggleBlock = (index: number) => {
    setBuilderBlocks((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], enabled: !next[index].enabled };
      return next;
    });
  };

  const moveBlock = (index: number, direction: "up" | "down") => {
    if (direction === "up" && index === 0) return;
    if (direction === "down" && index === builderBlocks.length - 1) return;
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    setBuilderBlocks((prev) => {
      const copy = [...prev];
      const temp = copy[index];
      copy[index] = copy[targetIndex];
      copy[targetIndex] = temp;
      return copy.map((b, i) => ({ ...b, order: i + 1 }));
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2.5 px-4 py-3 rounded-xl bg-slate-900 text-white border border-[#F6C72F]/60 shadow-[0_0_24px_rgba(246,199,47,0.3)] text-xs font-medium animate-slideUp">
          <Sparkles className="w-4 h-4 text-[#F6C72F]" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white/90 dark:bg-[#0b0e14]/90 backdrop-blur-xl shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-[10px] font-mono uppercase tracking-widest text-[#F6C72F] px-2 py-0.5 rounded-full border border-amber-500/30 bg-amber-500/10 font-bold">
              {activeRole === "superadmin" ? "SUPERADMIN APPROVAL QUEUE" : "ADMIN TEMPLATE BUILDER"}
            </span>
            <span className="text-xs text-slate-500 dark:text-zinc-400">Spec Section 2 & 5</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
            {activeRole === "superadmin" ? "Report Templates & Approvals Hub" : "Site Report Templates"}
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-zinc-400 mt-1 max-w-2xl">
            {activeRole === "superadmin"
              ? "Review pending site templates, authorize auto-generation triggers, or manage active compliance blueprints."
              : "Design modular block-based workforce safety templates and submit them for Superadmin approval."}
          </p>
        </div>

        <button
          type="button"
          onClick={() => setBuilderOpen(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#F6C72F] hover:bg-[#F6C72F]/90 text-slate-950 font-semibold text-xs transition-all shadow-[0_0_20px_rgba(246,199,47,0.35)] cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Create New Template</span>
        </button>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Total Blueprints</div>
            <div className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">{templates.length}</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-[#F6C72F]">
            <Layers className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Pending Review</div>
            <div className="text-lg font-bold text-amber-500 mt-0.5">{pendingCount}</div>
          </div>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
            <Clock className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Active Templates</div>
            <div className="text-lg font-bold text-emerald-500 mt-0.5">
              {templates.filter((t) => t.status === "active").length}
            </div>
          </div>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="w-4 h-4" />
          </div>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800/80 bg-white dark:bg-[#0d1017] flex items-center justify-between">
          <div>
            <div className="text-[11px] text-slate-500 dark:text-zinc-400">Section Modules</div>
            <div className="text-lg font-bold text-[#F6C72F] mt-0.5">7 Core</div>
          </div>
          <div className="p-2 rounded-lg bg-[#F6C72F]/10 text-[#F6C72F]">
            <FileCheck2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-zinc-800/80 pb-3 overflow-x-auto">
        {(["all", "pending", "active", "draft", "rejected"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium capitalize transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab
                ? "bg-[#F6C72F]/15 border border-[#F6C72F]/50 text-slate-900 dark:text-white font-semibold shadow-[0_0_12px_rgba(246,199,47,0.2)]"
                : "text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/50"
            }`}
          >
            <span>{tab === "all" ? "All Templates" : tab}</span>
            {tab === "pending" && pendingCount > 0 && (
              <span className="h-4 w-4 rounded-full bg-amber-500 text-slate-950 font-bold text-[9px] flex items-center justify-center">
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Templates List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map((template) => (
          <div
            key={template.id}
            className="p-5 rounded-2xl border border-slate-200 dark:border-zinc-800/90 bg-white dark:bg-[#0c1017] hover:border-amber-500/50 transition-all flex flex-col justify-between group shadow-sm hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)]"
          >
            <div>
              {/* Card Header: Site & Status Badge */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 truncate flex items-center gap-1">
                  <Building className="w-3 h-3 text-[#F6C72F]" />
                  {template.site_name}
                </span>

                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded-full border uppercase font-bold ${
                    template.status === "active"
                      ? "bg-emerald-950/60 text-emerald-400 border-emerald-500/40"
                      : template.status === "pending"
                      ? "bg-amber-950/60 text-amber-400 border-amber-500/50 animate-pulse"
                      : template.status === "rejected"
                      ? "bg-rose-950/60 text-rose-400 border-rose-500/40"
                      : "bg-slate-800 text-slate-300 border-slate-700"
                  }`}
                >
                  {template.status === "pending" ? "Pending Approval" : template.status}
                </span>
              </div>

              {/* Title & Description */}
              <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-[#F6C72F] transition-colors line-clamp-2">
                {template.name}
              </h3>
              <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1.5 line-clamp-2 leading-relaxed">
                {template.description}
              </p>

              {/* Included Section Blocks Preview */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-zinc-800/60 space-y-1">
                <div className="text-[10px] font-mono uppercase text-slate-400 dark:text-zinc-500">
                  {template.blocks.length} Sections Configured:
                </div>
                <div className="flex flex-wrap gap-1 mt-1">
                  {template.blocks.map((blk) => (
                    <span
                      key={blk.id}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-zinc-800/80 text-slate-700 dark:text-zinc-300 border border-slate-200 dark:border-zinc-700/60"
                    >
                      {blk.title}
                    </span>
                  ))}
                </div>
              </div>

              {/* Rejection Note if Rejected */}
              {template.status === "rejected" && template.rejection_reason && (
                <div className="mt-3 p-2 rounded-lg bg-rose-500/10 border border-rose-500/30 text-[11px] text-rose-600 dark:text-rose-400">
                  <strong>Revision Needed:</strong> {template.rejection_reason}
                </div>
              )}
            </div>

            {/* Card Footer Actions */}
            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between text-xs">
              <div className="text-[10px] font-mono text-slate-400 dark:text-zinc-500">
                Created by {template.created_by.split(" ")[0]} • {template.version}
              </div>

              {activeRole === "superadmin" && template.status === "pending" ? (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setReviewModalOpen(true);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-[0_0_12px_rgba(246,199,47,0.3)] transition-all cursor-pointer"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Review & Approve</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTemplate(template);
                    setReviewModalOpen(true);
                  }}
                  className="flex items-center gap-1 text-slate-600 dark:text-zinc-400 hover:text-[#F6C72F] transition-colors cursor-pointer font-medium"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>Inspect Blueprint</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* ================= REVIEW & APPROVAL MODAL (SUPERADMIN / INSPECT) ================= */}
      {reviewModalOpen && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c1017] p-6 shadow-2xl space-y-5 text-slate-900 dark:text-white">
            <div className="flex items-start justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-[10px] font-mono text-[#F6C72F] uppercase font-bold tracking-wider">
                  Template Inspection • {selectedTemplate.id}
                </span>
                <h2 className="text-lg font-bold mt-1 text-slate-900 dark:text-white">{selectedTemplate.name}</h2>
                <div className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  Site: {selectedTemplate.site_name} | Author: {selectedTemplate.created_by}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setReviewModalOpen(false);
                  setShowRejectInput(false);
                }}
                className="p-1 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Block Breakdown */}
            <div className="space-y-3">
              <div className="text-xs font-semibold text-slate-700 dark:text-zinc-300">
                Ordered Report Sections ({selectedTemplate.blocks.length}):
              </div>
              <div className="space-y-2">
                {selectedTemplate.blocks.map((b, idx) => (
                  <div
                    key={b.id}
                    className="p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/60 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="w-5 h-5 rounded-full bg-[#F6C72F]/20 text-[#F6C72F] font-mono text-[10px] flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <div className="font-semibold text-slate-900 dark:text-white">{b.title}</div>
                        <div className="text-[10px] text-slate-500 dark:text-zinc-400">{b.description}</div>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono uppercase px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold">
                      Included
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Superadmin Decision Actions */}
            {activeRole === "superadmin" && selectedTemplate.status === "pending" && (
              <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 space-y-3">
                {showRejectInput ? (
                  <div className="space-y-2 animate-fadeIn">
                    <label className="text-xs font-semibold text-rose-500">Reason for Rejection / Changes Requested:</label>
                    <textarea
                      rows={3}
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="e.g. Please include supervisory insights and adjust permissible hours threshold..."
                      className="w-full p-2.5 rounded-xl border border-rose-500/40 bg-rose-500/5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-rose-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setShowRejectInput(false)}
                        className="px-3 py-1.5 rounded-lg text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleReject(selectedTemplate)}
                        className="px-4 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs"
                      >
                        Confirm Rejection
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => setShowRejectInput(true)}
                      className="px-4 py-2 rounded-xl border border-rose-500/50 hover:bg-rose-500/10 text-rose-500 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject & Request Revision</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleApprove(selectedTemplate)}
                      className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Approve & Auto-Generate Report</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= BLOCK-BASED TEMPLATE BUILDER DRAWER ================= */}
      {builderOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white dark:bg-[#0a0d13] border-l border-slate-200 dark:border-zinc-800 p-6 flex flex-col justify-between h-full overflow-y-auto shadow-2xl animate-slideLeft text-slate-900 dark:text-white">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-800 pb-4">
                <div>
                  <div className="text-[10px] font-mono text-[#F6C72F] uppercase font-bold tracking-wider">
                    Block-Based Visual Builder
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">New Safety Report Template</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setBuilderOpen(false)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* General Metadata Fields */}
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Template Name *</label>
                  <input
                    type="text"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="e.g. Monthly Subcontractor Safety & Geotechnical Audit"
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#F6C72F]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Target Industrial Site</label>
                  <select
                    value={selectedSiteId}
                    onChange={(e) => setSelectedSiteId(e.target.value)}
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#F6C72F]"
                  >
                    {sites.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.location})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300">Operational Scope / Description</label>
                  <textarea
                    rows={2}
                    value={templateDesc}
                    onChange={(e) => setTemplateDesc(e.target.value)}
                    placeholder="Brief description of the reporting scope, telemetry sources, and audit criteria."
                    className="w-full mt-1 px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-xs focus:outline-none focus:border-[#F6C72F]"
                  />
                </div>
              </div>

              {/* 7 Section Blocks Configurator */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                    Report Section Blocks ({builderBlocks.filter((b) => b.enabled).length} Enabled):
                  </span>
                  <span className="text-[10px] text-slate-400">Drag/reorder priority</span>
                </div>

                <div className="space-y-2">
                  {builderBlocks.map((blk, idx) => (
                    <div
                      key={blk.id}
                      className={`p-3 rounded-xl border transition-all ${
                        blk.enabled
                          ? "border-[#F6C72F]/50 bg-amber-500/5 dark:bg-[#0f131c]"
                          : "border-slate-200 dark:border-zinc-800/60 opacity-50 bg-slate-50 dark:bg-zinc-950"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <input
                            type="checkbox"
                            checked={blk.enabled}
                            onChange={() => toggleBlock(idx)}
                            className="rounded text-[#F6C72F] focus:ring-[#F6C72F] cursor-pointer"
                          />
                          <div>
                            <div className="text-xs font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{blk.title}</span>
                              <span className="text-[9px] font-mono text-slate-400 dark:text-zinc-500">#{idx + 1}</span>
                            </div>
                            <div className="text-[10px] text-slate-500 dark:text-zinc-400">{blk.description}</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, "up")}
                            disabled={idx === 0}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                          >
                            <MoveUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveBlock(idx, "down")}
                            disabled={idx === builderBlocks.length - 1}
                            className="p-1 text-slate-400 hover:text-slate-900 dark:hover:text-white disabled:opacity-20 transition-colors cursor-pointer"
                          >
                            <MoveDown className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Builder Actions Footer */}
            <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between gap-3 mt-6">
              <button
                type="button"
                onClick={() => handleCreateTemplate("draft")}
                className="px-4 py-2 rounded-xl border border-slate-300 dark:border-zinc-700 text-xs font-medium hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300 transition-colors"
              >
                Save as Draft
              </button>

              <button
                type="button"
                onClick={() => handleCreateTemplate("pending")}
                className="px-5 py-2 rounded-xl bg-[#F6C72F] hover:bg-[#F6C72F]/90 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-[0_0_20px_rgba(246,199,47,0.35)] transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Submit for Approval</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
