"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  X,
  Sparkles,
  Layers,
  Building,
  ShieldCheck,
  Shield,
  FileText,
  BarChart2,
  Calendar,
  CheckCircle2,
  ArrowRight,
  Stamp,
  Sliders,
  Lock,
  Eye,
  Info,
  ChevronRight,
  TrendingUp,
  Cpu,
  Fingerprint,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import {
  setTemplateBuilderOpen,
  setTemplateEditingId,
  addTemplate,
  updateTemplate,
  createLibrarySection,
  setSelectedLibrarySectionId,
  showGlobalToast,
  CoverPageData,
  DEFAULT_COVER_PAGE_DATA,
  DEFAULT_BACK_COVER_DATA,
  CanvasRow,
  TemplateBlock,
} from "@/lib/redux/slices/reportModuleSlice";
import { CustomDropdown } from "../../Component";

type TemplateCategory = "monthly" | "weekly" | "incident" | "shift";
type SecurityClassification = "CONFIDENTIAL" | "RESTRICTED" | "INTERNAL";

const CATEGORY_OPTIONS: { id: TemplateCategory; label: string; subtext: string }[] = [
  { id: "monthly", label: "Monthly Statutory", subtext: "30-day ISO audit cycle" },
  { id: "weekly", label: "Weekly Ops Audit", subtext: "Subcontractor telemetry" },
  { id: "incident", label: "Incident Investigation", subtext: "CAPA & forensic log" },
  { id: "shift", label: "Daily Shift Handover", subtext: "Muster & permit log" },
];

const COMPLIANCE_STANDARDS = [
  { id: "iso-45001", label: "ISO 45001:2018 (OHSMS)" },
  { id: "osha-1926", label: "OSHA Construction (1926)" },
  { id: "statutory-audit", label: "Statutory Geotechnical Audit" },
];

/**
 * Premium Template Details Planning Modal.
 * Prompts the user with structured planning fields (Identity, Governance, Cover Page,
 * and Blueprint Section selection) before executing and launching the visual Canvas Studio.
 */
export default function TemplateDetailsPlanningModal() {
  const router = useRouter();
  const dispatch = useAppDispatch();

  const builderOpen = useAppSelector((s) => s.reportModule.templateBuilderOpen);
  const templates = useAppSelector((s) => s.reportModule.templates || []);
  const sites = useAppSelector((s) => s.reportModule.sites || []);
  const librarySections = useAppSelector((s) => s.reportModule.librarySections || []);
  const watermarks = useAppSelector((s) => s.reportModule.watermarks || []);
  const activeRole = useAppSelector((s) => s.reportModule.activeRole);

  const editingTemplateId = useAppSelector((s) => s.reportModule.templateEditingId);
  const editingTemplate = useMemo(() => {
    return templates.find((t) => t.id === editingTemplateId) || null;
  }, [templates, editingTemplateId]);
  const isEditing = Boolean(editingTemplate);

  // Auto-generate next Blueprint ID (e.g. TPL-004) or use editing ID
  const nextBlueprintId = useMemo(() => {
    const maxNum = templates.reduce((max, t) => {
      const match = t.id.match(/TPL-(\d+)/);
      const num = match ? parseInt(match[1], 10) : 0;
      return num > max ? num : max;
    }, 0);
    return `TPL-${String(maxNum + 1).padStart(3, "0")}`;
  }, [templates]);

  const activeBlueprintId = editingTemplate ? editingTemplate.id : nextBlueprintId;

  // Form States: Identity & Scope
  const [templateName, setTemplateName] = useState("Monthly Subcontractor Safety & Geotechnical Audit");
  const [selectedSiteId, setSelectedSiteId] = useState(sites[0]?.id || "SITE-01");
  const [category, setCategory] = useState<TemplateCategory>("monthly");
  const [scopeDescription, setScopeDescription] = useState(
    "Comprehensive statutory health, safety & telemetry audit assessing subcontractor workforce compliance, connected PPE sensor metrics, and environmental threshold logs."
  );

  // Form States: Governance & Standards
  const [selectedStandards, setSelectedStandards] = useState<string[]>([
    "iso-45001",
    "statutory-audit",
  ]);
  const [attachAuditHash, setAttachAuditHash] = useState(true);

  // Form States: Cover Page Metadata
  const [coverEyebrow, setCoverEyebrow] = useState("STATUTORY COMPLIANCE & GEOTECHNICAL AUDIT");
  const [leadAuditor, setLeadAuditor] = useState("Vikram Seth (Site Admin)");
  const [classification, setClassification] = useState<SecurityClassification>("CONFIDENTIAL");
  const [selectedWatermarkId, setSelectedWatermarkId] = useState<string>(
    watermarks.find((w) => w.isDefault)?.id || watermarks[0]?.id || "wm-default"
  );

  // Form States: Blueprint Sections Picker
  const [selectedSectionIds, setSelectedSectionIds] = useState<string[]>(() =>
    librarySections.map((s) => s.id)
  );

  // Reset / sync on modal open or editingTemplate change
  useEffect(() => {
    if (builderOpen) {
      if (editingTemplate) {
        setTemplateName(editingTemplate.name);
        setSelectedSiteId(editingTemplate.site_id || sites[0]?.id || "SITE-01");
        setScopeDescription(editingTemplate.description || "");
        setCategory((editingTemplate.category as TemplateCategory) || "monthly");
        setCoverEyebrow(editingTemplate.coverPageData?.eyebrow || "STATUTORY COMPLIANCE & GEOTECHNICAL AUDIT");
        setLeadAuditor(editingTemplate.coverPageData?.preparedBy || editingTemplate.created_by || "Vikram Seth (Site Admin)");
        setClassification((editingTemplate.coverPageData?.classification as SecurityClassification) || "CONFIDENTIAL");
        if (editingTemplate.complianceStandards) {
          setSelectedStandards(editingTemplate.complianceStandards);
        }
        if (editingTemplate.hasAuditHash !== undefined) {
          setAttachAuditHash(editingTemplate.hasAuditHash);
        }
        if (editingTemplate.blocks && editingTemplate.blocks.length > 0) {
          const blockIds = editingTemplate.blocks.map((b) => b.id.replace("blk-", ""));
          const matched = librarySections
            .filter((s) => blockIds.includes(s.id) || blockIds.includes(s.type || ""))
            .map((s) => s.id);
          if (matched.length > 0) {
            setSelectedSectionIds(matched);
          }
        }
      } else {
        setTemplateName("Monthly Subcontractor Safety & Geotechnical Audit");
        setSelectedSiteId(sites[0]?.id || "SITE-01");
        setScopeDescription(
          "Comprehensive statutory health, safety & telemetry audit assessing subcontractor workforce compliance, connected PPE sensor metrics, and environmental threshold logs."
        );
        setCategory("monthly");
        setCoverEyebrow("STATUTORY COMPLIANCE & GEOTECHNICAL AUDIT");
        setLeadAuditor("Vikram Seth (Site Admin)");
        setClassification("CONFIDENTIAL");
        if (librarySections.length > 0) {
          setSelectedSectionIds(librarySections.map((s) => s.id));
        }
      }
    }
  }, [builderOpen, editingTemplate, librarySections, sites]);

  const siteDropdownOptions = useMemo(() => {
    return sites.map((s) => ({
      value: s.id,
      label: `${s.name} (${s.id})`,
    }));
  }, [sites]);

  const selectedSite = useMemo(() => {
    return sites.find((s) => s.id === selectedSiteId) || sites[0];
  }, [sites, selectedSiteId]);

  // Live Summary Calculations
  const chosenSections = useMemo(() => {
    return librarySections.filter((s) => selectedSectionIds.includes(s.id));
  }, [librarySections, selectedSectionIds]);

  const totalChartsCount = useMemo(() => {
    return chosenSections.reduce((sum, s) => sum + (s.charts?.length || 0), 0);
  }, [chosenSections]);

  const totalCardsCount = useMemo(() => {
    return chosenSections.reduce((sum, s) => sum + (s.metricCards?.length || 0), 0);
  }, [chosenSections]);

  const toggleSection = (id: string) => {
    setSelectedSectionIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const toggleStandard = (id: string) => {
    setSelectedStandards((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleClose = () => {
    dispatch(setTemplateEditingId(null));
    dispatch(setTemplateBuilderOpen(false));
  };

  // Convert chosen library sections to Blueprint TemplateBlock[]
  const buildTemplateBlocks = (): TemplateBlock[] => {
    return chosenSections.map((sec, idx) => ({
      id: `blk-${sec.id}`,
      type: sec.type === "core" ? "core" : "custom",
      title: sec.name,
      description: sec.description,
      enabled: true,
      order: idx + 1,
      isCustom: sec.type === "custom",
      graphs: (sec.charts || []).map((ch) => ({
        id: ch.id,
        title: ch.title,
        type: "bar",
        dataSource: "attendance_daily_shifts",
        description: ch.description,
      })),
    }));
  };

  // Compile Canvas Rows from chosen sections for full Canvas Studio artboard
  const compileCanvasRows = (): CanvasRow[] => {
    const rows: CanvasRow[] = [];
    chosenSections.forEach((sec, sIdx) => {
      const secRows = sec.canvasRows || [];
      if (secRows.length > 0) {
        secRows.forEach((r, rIdx) => {
          rows.push({
            ...r,
            id: `row-${sec.id}-${rIdx}-${Date.now()}`,
            pageBreakBefore: rIdx === 0 && sIdx > 0,
          });
        });
      }
    });
    return rows;
  };

  // Build the Cover Page Data based on user's planning inputs
  const buildCoverPageData = (): CoverPageData => {
    return {
      reportType: templateName.trim(),
      subtitle: coverEyebrow.trim(),
      reportingPeriod: "01 September 2025 – 30 September 2025",
      projectSite: selectedSite?.name || "Global / All Industrial Sites",
      preparedFor: "Superadmin Governance Board & Statutory Safety Committee",
      preparedBy: leadAuditor.trim() || "Vikram Seth (Site Admin)",
      eyebrow: coverEyebrow.trim(),
      classification,
      classificationBadgeColor:
        classification === "CONFIDENTIAL"
          ? "#ef4444"
          : classification === "RESTRICTED"
          ? "#f59e0b"
          : "#3b82f6",
      reportCode: activeBlueprintId,
      organizationLogoUrl: "/images/sitesafe-logo.svg",
    };
  };

  // Save as Draft (without launching studio)
  const handleSaveDraft = () => {
    if (!templateName.trim()) {
      dispatch(showGlobalToast({ message: "Please provide a template title.", type: "warning" }));
      return;
    }

    const blocks = buildTemplateBlocks();

    if (isEditing && editingTemplate) {
      dispatch(
        updateTemplate({
          id: editingTemplate.id,
          name: templateName.trim(),
          description: scopeDescription.trim(),
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "draft",
          coverPageData: buildCoverPageData(),
          backCoverData: DEFAULT_BACK_COVER_DATA,
          category,
          frequency: category,
          complianceStandards: selectedStandards,
          hasAuditHash: attachAuditHash,
        })
      );
      dispatch(showGlobalToast({ message: `Template ${editingTemplate.id} updated as draft!`, type: "success" }));
      handleClose();
    } else {
      dispatch(
        addTemplate({
          name: templateName.trim(),
          description: scopeDescription.trim(),
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "draft",
          created_by: `${leadAuditor} (${activeRole})`,
          category,
          frequency: category,
          complianceStandards: selectedStandards,
          hasAuditHash: attachAuditHash,
          coverPageData: buildCoverPageData(),
          backCoverData: DEFAULT_BACK_COVER_DATA,
        })
      );
      dispatch(showGlobalToast({ message: `Template ${nextBlueprintId} saved as draft!`, type: "success" }));
      handleClose();
    }
  };

  // Execute & Launch Template Studio (The User's Plan-Then-Execute Primary Action)
  const handleExecuteAndLaunch = () => {
    if (!templateName.trim()) {
      dispatch(showGlobalToast({ message: "Please provide a template title.", type: "warning" }));
      return;
    }
    if (selectedSectionIds.length === 0) {
      dispatch(showGlobalToast({ message: "Please select at least 1 section for the blueprint.", type: "warning" }));
      return;
    }

    const blocks = buildTemplateBlocks();
    const coverData = buildCoverPageData();
    const compiledRows = compileCanvasRows();

    if (isEditing && editingTemplate) {
      const compositeSectionId = editingTemplate.canvasSectionId || `sec-tpl-${editingTemplate.id.toLowerCase()}`;
      dispatch(
        updateTemplate({
          id: editingTemplate.id,
          name: templateName.trim(),
          description: scopeDescription.trim(),
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "pending",
          coverPageData: coverData,
          backCoverData: DEFAULT_BACK_COVER_DATA,
          category,
          frequency: category,
          complianceStandards: selectedStandards,
          hasAuditHash: attachAuditHash,
        })
      );

      const existingSec = librarySections.find((s) => s.id === compositeSectionId);
      if (!existingSec) {
        dispatch(
          createLibrarySection({
            id: compositeSectionId,
            name: templateName.trim(),
            eyebrow: coverEyebrow.trim(),
            description: scopeDescription.trim(),
            metricCards: [],
            charts: [],
            keyInsights: [],
            canvasRows: compiledRows,
            coverPageData: coverData,
            backCoverData: DEFAULT_BACK_COVER_DATA,
            watermarkId: selectedWatermarkId,
          })
        );
      }

      dispatch(setSelectedLibrarySectionId(compositeSectionId));
      handleClose();
      dispatch(
        showGlobalToast({
          message: `Blueprint ${editingTemplate.id} updated! Launching Canvas Studio...`,
          type: "success",
        })
      );
      router.push(`/templates/edit?id=${editingTemplate.id}&sectionId=${compositeSectionId}`);
    } else {
      const compositeSectionId = `sec-tpl-${nextBlueprintId.toLowerCase()}`;

      dispatch(
        addTemplate({
          name: templateName.trim(),
          description: scopeDescription.trim(),
          site_id: selectedSiteId,
          site_name: selectedSite?.name || "Global Sites",
          blocks,
          status: "pending",
          created_by: `${leadAuditor} (${activeRole})`,
          category,
          frequency: category,
          complianceStandards: selectedStandards,
          hasAuditHash: attachAuditHash,
          coverPageData: coverData,
          backCoverData: DEFAULT_BACK_COVER_DATA,
          canvasSectionId: compositeSectionId,
        })
      );

      dispatch(
        createLibrarySection({
          id: compositeSectionId,
          name: templateName.trim(),
          eyebrow: coverEyebrow.trim(),
          description: scopeDescription.trim(),
          metricCards: [],
          charts: [],
          keyInsights: [],
          canvasRows: compiledRows,
          coverPageData: coverData,
          backCoverData: DEFAULT_BACK_COVER_DATA,
          watermarkId: selectedWatermarkId,
        })
      );

      dispatch(setSelectedLibrarySectionId(compositeSectionId));
      handleClose();
      dispatch(
        showGlobalToast({
          message: `Blueprint "${templateName.trim()}" initialized! Launching Template Canvas Studio...`,
          type: "success",
        })
      );
      router.push(`/templates/create?templateId=${nextBlueprintId}&sectionId=${compositeSectionId}`);
    }
  };

  if (!builderOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-white dark:bg-[#0c1017] border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden animate-scaleUp text-slate-900 dark:text-white">
        
        {/* Modal Header */}
        <div className="flex-shrink-0 px-6 py-4.5 border-b border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-[#9D61FF]/20 to-[#8B4CF0]/10 border border-[#9D61FF]/30 text-[#9D61FF] shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase tracking-wider font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-[#9D61FF] border border-purple-500/20">
                  {isEditing ? `Editing Blueprint • ${activeBlueprintId}` : `Planning Phase • ${activeBlueprintId}`}
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  {isEditing ? "Blueprint Architecture" : "Step 1 of 2"}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-2">
                <span>{isEditing ? "Edit Template Blueprint Architecture" : "Report Template Blueprint Architecture"}</span>
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={handleClose}
            className="p-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer"
            title="Close Planning Studio"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="flex-1 min-h-0 overflow-y-auto p-5 sm:p-6 space-y-5 text-xs">
          
          {/* Section 1: Template Identity & Target Site */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <FileText className="w-4 h-4 text-[#9D61FF]" />
                <span>1. Template Identity &amp; Industrial Site</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                Blueprint Code: <strong className="text-[#9D61FF]">{nextBlueprintId}</strong>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Template Name *
                </label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g. Monthly Subcontractor Safety & Geotechnical Audit"
                  className="w-full h-10 px-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-semibold text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF] shadow-sm transition-all"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Target Industrial Site *
                </label>
                <CustomDropdown
                  options={siteDropdownOptions}
                  value={selectedSiteId}
                  onChange={setSelectedSiteId}
                  icon={Building}
                  size="sm"
                  className="h-10"
                />
              </div>
            </div>

            {/* Category / Frequency Selection Chips */}
            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1.5">
                Audit Category &amp; Reporting Schedule
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {CATEGORY_OPTIONS.map((cat) => {
                  const isSelected = category === cat.id;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setCategory(cat.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "border-[#9D61FF] bg-[#9D61FF]/10 text-[#9D61FF] font-bold shadow-sm"
                          : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-600 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div className="text-[11px] font-semibold">{cat.label}</div>
                      <div className="text-[10px] text-slate-400 truncate mt-0.5">{cat.subtext}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                Operational Scope &amp; Statutory Objectives
              </label>
              <textarea
                rows={2}
                value={scopeDescription}
                onChange={(e) => setScopeDescription(e.target.value)}
                placeholder="Detail the report scope, connected sensors, threshold limits, and inspection criteria..."
                className="w-full p-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF] shadow-sm transition-all"
              />
            </div>
          </div>

          {/* Section 2: Governance & Cryptographic Hash Protection */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-3.5 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>2. Regulatory Standards &amp; Security Governance</span>
              </div>
              <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                Tamper-Evident Active
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {COMPLIANCE_STANDARDS.map((std) => {
                const isSelected = selectedStandards.includes(std.id);
                return (
                  <button
                    key={std.id}
                    type="button"
                    onClick={() => toggleStandard(std.id)}
                    className={`px-3 py-1.5 rounded-xl border text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold"
                        : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    <CheckCircle2 className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-500" : "text-slate-300"}`} />
                    <span>{std.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Cryptographic Hash Toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-purple-500/20 bg-purple-500/5">
              <div className="flex items-center gap-2.5">
                <Fingerprint className="w-4 h-4 text-[#9D61FF]" />
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    SHA-256 Cryptographic Audit Hash
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Generates a tamper-proof verification hash on the Cover Page &amp; Back Cover QR code for statutory audits.
                  </div>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={attachAuditHash}
                  onChange={(e) => setAttachAuditHash(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-zinc-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#9D61FF]"></div>
              </label>
            </div>
          </div>

          {/* Section 3: Cover Page & Presentation Architecture */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Sliders className="w-4 h-4 text-sky-500" />
                <span>3. Cover Page &amp; Document Presentation</span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">Fixed Page 1 in Studio</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              <div className="md:col-span-2">
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Document Subtitle / Eyebrow Header
                </label>
                <input
                  type="text"
                  value={coverEyebrow}
                  onChange={(e) => setCoverEyebrow(e.target.value)}
                  placeholder="e.g. STATUTORY COMPLIANCE & GEOTECHNICAL AUDIT"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono uppercase text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Lead Auditor / Author
                </label>
                <input
                  type="text"
                  value={leadAuditor}
                  onChange={(e) => setLeadAuditor(e.target.value)}
                  placeholder="e.g. Vikram Seth (Site Admin)"
                  className="w-full h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-[#9D61FF]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Security Classification Badge
                </label>
                <div className="flex items-center gap-2">
                  {(["CONFIDENTIAL", "RESTRICTED", "INTERNAL"] as SecurityClassification[]).map((cls) => {
                    const isSelected = classification === cls;
                    return (
                      <button
                        key={cls}
                        type="button"
                        onClick={() => setClassification(cls)}
                        className={`flex-1 py-1.5 rounded-xl border text-[11px] font-mono font-bold transition-all cursor-pointer text-center ${
                          isSelected
                            ? cls === "CONFIDENTIAL"
                              ? "border-rose-500 bg-rose-500/10 text-rose-500"
                              : cls === "RESTRICTED"
                              ? "border-amber-500 bg-amber-500/10 text-amber-500"
                              : "border-sky-500 bg-sky-500/10 text-sky-500"
                            : "border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-slate-500"
                        }`}
                      >
                        {cls}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-zinc-300 block mb-1">
                  Assigned Watermark Stamp
                </label>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-9 px-3 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-slate-800 dark:text-zinc-200 font-medium truncate">
                      <Stamp className="w-3.5 h-3.5 text-[#9D61FF]" />
                      <span>{watermarks.find((w) => w.id === selectedWatermarkId)?.name || "Standard Watermark"}</span>
                    </span>
                    <span className="text-[10px] text-emerald-500 font-mono">Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: Blueprint Sections Library Picker */}
          <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/30 space-y-4 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-zinc-800/80 pb-2.5">
              <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-xs">
                <Layers className="w-4 h-4 text-[#9D61FF]" />
                <span>4. Blueprint Sections &amp; Telemetry Modules</span>
              </div>
              <div className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-purple-500/15 text-[#9D61FF] font-bold">
                {selectedSectionIds.length} of {librarySections.length} Included
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
              {librarySections.map((sec) => {
                const isSelected = selectedSectionIds.includes(sec.id);
                const chartsCount = sec.charts?.length || 0;
                const cardsCount = sec.metricCards?.length || 0;

                return (
                  <div
                    key={sec.id}
                    onClick={() => toggleSection(sec.id)}
                    className={`p-3 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
                      isSelected
                        ? "border-[#9D61FF]/60 bg-purple-500/5 shadow-sm"
                        : "border-slate-200 dark:border-zinc-800/80 bg-white/70 dark:bg-zinc-950/40 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="pt-0.5">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        className="rounded text-[#9D61FF] focus:ring-0 cursor-pointer"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {sec.name}
                        </span>
                        <span
                          className={`text-[9px] font-mono uppercase px-1.5 py-0.2 rounded-full ${
                            sec.type === "core"
                              ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                              : "bg-amber-500/15 text-amber-600"
                          }`}
                        >
                          {sec.type || "core"}
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-zinc-500 font-mono mt-0.5 truncate">
                        {sec.eyebrow}
                      </div>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-mono text-slate-500 dark:text-zinc-400">
                        <span className="flex items-center gap-1">
                          <BarChart2 className="w-3 h-3 text-[#9D61FF]" />
                          {chartsCount} {chartsCount === 1 ? "Chart" : "Charts"}
                        </span>
                        <span>•</span>
                        <span>{cardsCount} Metrics</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Assembly Counter Banner */}
            <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-600 dark:text-zinc-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live Studio Assembly:</span>
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {chosenSections.length} Sections • {totalChartsCount} Charts • {totalCardsCount} Metric Cards
              </span>
            </div>
          </div>

        </div>

        {/* Modal Footer Actions */}
        <div className="flex-shrink-0 px-6 py-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/40 flex items-center justify-between gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={handleSaveDraft}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-xs font-bold hover:bg-slate-50 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-sm"
            >
              Save as Draft
            </button>

            {/* Execute & Launch Canvas Studio (Primary Plan-Then-Execute Action) */}
            <button
              type="button"
              onClick={handleExecuteAndLaunch}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#9D61FF] to-[#8035ea] hover:from-[#9254f8] hover:to-[#7227dc] text-white text-xs font-bold flex items-center gap-2 shadow-[0_2px_12px_rgba(157,97,255,0.35)] hover:shadow-[0_4px_20px_rgba(157,97,255,0.5)] transition-all active:scale-[0.98] cursor-pointer"
            >
              <span>{isEditing ? "Save & Launch Canvas Studio" : "Execute & Launch Template Studio"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
